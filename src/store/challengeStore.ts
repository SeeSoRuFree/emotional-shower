import { create } from 'zustand';

// 사용자 챌린지 상태 (기수별)
export interface UserChallenge {
  cohortId: string;
  completedDays: number[]; // [1, 2, 3, ...] 스탬프 받은 날들
  status: 'waiting' | 'approved' | 'active' | 'completed' | 'failed';
  appliedAt: Date | null;  // 신청 일시
  approvedAt: Date | null; // 승인 일시
  startedAt: Date | null;  // 챌린지 시작 일시 (사전 설문 완료 시점)
  completedAt: Date | null;
}

interface ChallengeStore {
  challenges: UserChallenge[];  // 여러 기수의 챌린지 관리

  // Actions
  applyChallenge: (cohortId: string) => void;  // 신청 (waiting 상태)
  approveChallenge: (cohortId: string) => void;                 // 승인 (approved 상태)
  startChallenge: (cohortId: string) => void;                   // 챌린지 시작 (active 상태)
  completeDay: (cohortId: string, day: number) => void;
  completeChallenge: (cohortId: string) => void;
  calculateCurrentDay: (cohortId: string) => number;
  canStartPreSurvey: (cohortId: string) => boolean;             // 사전 설문 가능 여부
  canAccessReport: (cohortId: string) => boolean;
  getCurrentChallenge: (cohortId: string) => UserChallenge | undefined;  // 특정 기수 챌린지 조회
  resetChallenge: (cohortId: string) => void;
}

// LocalStorage 키
const STORAGE_KEY = 'kindness-daily-records';

// LocalStorage에서 저장된 데이터 로드
const loadFromStorage = (): UserChallenge[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored).map((challenge: any) => ({
        ...challenge,
        appliedAt: challenge.appliedAt ? new Date(challenge.appliedAt) : null,
        approvedAt: challenge.approvedAt ? new Date(challenge.approvedAt) : null,
        startedAt: challenge.startedAt ? new Date(challenge.startedAt) : null,
        completedAt: challenge.completedAt ? new Date(challenge.completedAt) : null
      }));
    }
  } catch (error) {
    console.error('Failed to load challenges:', error);
  }
  return [];
};

// LocalStorage에 저장
const saveToStorage = (challenges: UserChallenge[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
  } catch (error) {
    console.error('Failed to save challenges:', error);
  }
};

export const useChallengeStore = create<ChallengeStore>((set, get) => {
  const storedChallenges = loadFromStorage();

  // 초기화: 테스트용 챌린지가 없으면 생성 (cohort-1에 대한 active 챌린지)
  if (!storedChallenges.some(c => c.cohortId === 'cohort-1')) {
    const testChallenge: UserChallenge = {
      cohortId: 'cohort-1',
      completedDays: [],
      status: 'active',
      appliedAt: new Date(),
      approvedAt: new Date(),
      startedAt: new Date(),
      completedAt: null
    };
    storedChallenges.push(testChallenge);
    saveToStorage(storedChallenges);
  }

  return {
    challenges: storedChallenges,

    // 챌린지 신청 (온보딩 완료 후)
    applyChallenge: (cohortId) => {
      const newChallenge: UserChallenge = {
        cohortId,
        completedDays: [],
        status: 'waiting',
        appliedAt: new Date(),
        approvedAt: null,
        startedAt: null,
        completedAt: null
      };

      const challenges = [...get().challenges, newChallenge];
      set({ challenges });
      saveToStorage(challenges);
    },

    // 챌린지 승인 (코드 인증 후)
    approveChallenge: (cohortId) => {
      const challenges = get().challenges.map(ch =>
        ch.cohortId === cohortId && ch.status === 'waiting'
          ? { ...ch, status: 'approved' as const, approvedAt: new Date() }
          : ch
      );

      set({ challenges });
      saveToStorage(challenges);
    },

    // 챌린지 시작 (사전 설문 완료 후)
    startChallenge: (cohortId) => {
      const challenges = get().challenges.map(ch =>
        ch.cohortId === cohortId
          ? {
              ...ch,
              status: 'active' as const,
              startedAt: new Date()  // 사용자가 설문 완료한 실제 시점
            }
          : ch
      );

      set({ challenges });
      saveToStorage(challenges);
    },

    // 특정 날짜 완료 처리 (스탬프 획득)
    completeDay: (cohortId, day) => {
      const challenge = get().challenges.find(ch => ch.cohortId === cohortId);
      if (!challenge) return;

      console.log('🔵 [completeDay] 호출됨:', { cohortId, day, 현재_completedDays: challenge.completedDays });

      // 이미 완료한 날이면 무시
      if (challenge.completedDays.includes(day)) {
        console.log('⚠️ [completeDay] 이미 완료한 날:', day);
        return;
      }

      const completedDays = [...challenge.completedDays, day].sort((a, b) => a - b);
      console.log('✅ [completeDay] 업데이트된 completedDays:', completedDays);

      let newStatus = challenge.status;
      let completedAt = challenge.completedAt;

      // 30일 모두 기록했고, 22일 이상이면 완료
      if (day === 30 && completedDays.length >= 22) {
        newStatus = 'completed';
        completedAt = new Date();
      } else if (day === 30 && completedDays.length < 22) {
        newStatus = 'failed';
        completedAt = new Date();
      }

      const challenges = get().challenges.map(ch =>
        ch.cohortId === cohortId
          ? { ...ch, completedDays, status: newStatus, completedAt }
          : ch
      );

      set({ challenges });
      saveToStorage(challenges);
    },

    // 현재 DAY 계산 (스탬프 기반)
    calculateCurrentDay: (cohortId) => {
      const challenge = get().challenges.find(ch => ch.cohortId === cohortId);
      if (!challenge || challenge.status !== 'active') return 0;

      // 완료한 스탬프 개수 + 1 = 다음 기록할 DAY
      // 예: 스탬프 0개 → DAY 1, 스탬프 1개 → DAY 2, ..., 스탬프 29개 → DAY 30
      const calculatedDay = Math.min(challenge.completedDays.length + 1, 30);
      console.log('📅 [calculateCurrentDay]', {
        completedDays: challenge.completedDays,
        length: challenge.completedDays.length,
        calculatedDay
      });
      return calculatedDay;
    },

    // 사전 설문 시작 가능 여부
    canStartPreSurvey: (cohortId) => {
      const challenge = get().challenges.find(ch => ch.cohortId === cohortId);
      if (!challenge) return false;

      // approved 상태이면 바로 설문 가능 (날짜 제약 없음)
      return challenge.status === 'approved';
    },

    // 챌린지 완료 처리 (사후 설문 완료 후 호출)
    completeChallenge: (cohortId) => {
      const challenges = get().challenges.map(ch =>
        ch.cohortId === cohortId
          ? {
              ...ch,
              status: 'completed' as const,
              completedAt: new Date()
            }
          : ch
      );

      set({ challenges });
      saveToStorage(challenges);
    },

    // 리포트 접근 가능 여부 (22일 이상 + 30일 완료)
    canAccessReport: (cohortId) => {
      const challenge = get().challenges.find(ch => ch.cohortId === cohortId);
      if (!challenge) return false;

      return challenge.status === 'completed' &&
             challenge.completedDays.length >= 22;
    },

    // 특정 기수 챌린지 조회
    getCurrentChallenge: (cohortId) => {
      return get().challenges.find(ch => ch.cohortId === cohortId);
    },

    // 챌린지 리셋 (특정 기수)
    resetChallenge: (cohortId) => {
      const challenges = get().challenges.filter(ch => ch.cohortId !== cohortId);
      set({ challenges });
      saveToStorage(challenges);
    }
  };
});
