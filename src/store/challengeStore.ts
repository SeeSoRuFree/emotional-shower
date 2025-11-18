import { create } from 'zustand';

// 기수 정보
export interface Cohort {
  id: string;           // "2025-02"
  name: string;         // "2월 챌린지"
  startDate: Date;      // 2025-02-01
  endDate: Date;        // 2025-03-02 (30일 후)
  status: 'recruiting' | 'active' | 'completed';
}

// 사용자 챌린지 상태
export interface UserChallenge {
  cohortId: string;
  currentDay: number;      // 1-30
  completedDays: number[]; // [1, 2, 3, ...] 스탬프 받은 날들
  status: 'waiting' | 'approved' | 'active' | 'completed' | 'failed';
  appliedAt: Date | null;  // 신청 일시
  approvedAt: Date | null; // 승인 일시
  startedAt: Date | null;  // 챌린지 시작 일시 (기수 시작일)
  completedAt: Date | null;
}

interface ChallengeStore {
  currentCohort: Cohort | null;
  userChallenge: UserChallenge | null;

  // Actions
  initializeCohort: () => void;
  applyChallenge: (cohortId: string) => void;  // 신청 (waiting 상태)
  approveChallenge: () => void;                 // 승인 (approved 상태, 테스트용)
  startChallenge: () => void;                   // 챌린지 시작 (active 상태)
  completeDay: (day: number) => void;
  completeChallenge: () => void;
  calculateCurrentDay: () => number;
  canStartPreSurvey: () => boolean;             // 사전 설문 가능 여부
  canAccessReport: () => boolean;
  resetChallenge: () => void;
}

// 현재 월 기준으로 기수 생성
const generateCurrentCohort = (): Cohort => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // 매월 1일 시작
  const startDate = new Date(year, month, 1);
  startDate.setHours(0, 0, 0, 0);

  // 30일 후 종료
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 30);

  const cohortId = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  return {
    id: cohortId,
    name: `${monthNames[month]} 챌린지`,
    startDate,
    endDate,
    status: 'active'
  };
};

// LocalStorage 키
const STORAGE_KEY = 'kindness-challenge';

// LocalStorage에서 저장된 데이터 로드
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        currentCohort: data.currentCohort ? {
          ...data.currentCohort,
          startDate: new Date(data.currentCohort.startDate),
          endDate: new Date(data.currentCohort.endDate)
        } : null,
        userChallenge: data.userChallenge ? {
          ...data.userChallenge,
          appliedAt: data.userChallenge.appliedAt ? new Date(data.userChallenge.appliedAt) : null,
          approvedAt: data.userChallenge.approvedAt ? new Date(data.userChallenge.approvedAt) : null,
          startedAt: data.userChallenge.startedAt ? new Date(data.userChallenge.startedAt) : null,
          completedAt: data.userChallenge.completedAt ? new Date(data.userChallenge.completedAt) : null
        } : null
      };
    }
  } catch (error) {
    console.error('Failed to load challenge data:', error);
  }
  return { currentCohort: null, userChallenge: null };
};

// LocalStorage에 저장
const saveToStorage = (cohort: Cohort | null, challenge: UserChallenge | null) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentCohort: cohort,
      userChallenge: challenge
    }));
  } catch (error) {
    console.error('Failed to save challenge data:', error);
  }
};

export const useChallengeStore = create<ChallengeStore>((set, get) => {
  const { currentCohort: storedCohort, userChallenge: storedChallenge } = loadFromStorage();

  return {
    currentCohort: storedCohort,
    userChallenge: storedChallenge,

    // 기수 초기화 (앱 시작 시 호출)
    initializeCohort: () => {
      const cohort = generateCurrentCohort();
      set({ currentCohort: cohort });
      saveToStorage(cohort, get().userChallenge);
    },

    // 챌린지 신청 (온보딩 완료 후)
    applyChallenge: (cohortId: string) => {
      const newChallenge: UserChallenge = {
        cohortId,
        currentDay: 0,
        completedDays: [],
        status: 'waiting',
        appliedAt: new Date(),
        approvedAt: null,
        startedAt: null,
        completedAt: null
      };

      set({ userChallenge: newChallenge });
      saveToStorage(get().currentCohort, newChallenge);
    },

    // 챌린지 승인 (테스트용)
    approveChallenge: () => {
      const { userChallenge } = get();
      if (!userChallenge || userChallenge.status !== 'waiting') return;

      const updatedChallenge = {
        ...userChallenge,
        status: 'approved' as const,
        approvedAt: new Date()
      };

      set({ userChallenge: updatedChallenge });
      saveToStorage(get().currentCohort, updatedChallenge);
    },

    // 챌린지 시작 (사전 설문 완료 후)
    startChallenge: () => {
      const { userChallenge } = get();
      if (!userChallenge) return;

      const updatedChallenge = {
        ...userChallenge,
        currentDay: 1,
        status: 'active' as const,
        startedAt: new Date()  // 사용자가 설문 완료한 실제 시점
      };

      set({ userChallenge: updatedChallenge });
      saveToStorage(get().currentCohort, updatedChallenge);
    },

    // 특정 날짜 완료 처리 (스탬프 획득)
    completeDay: (day: number) => {
      const { userChallenge } = get();
      if (!userChallenge) return;

      // 이미 완료한 날이면 무시
      if (userChallenge.completedDays.includes(day)) return;

      const updatedChallenge = {
        ...userChallenge,
        completedDays: [...userChallenge.completedDays, day].sort((a, b) => a - b)
      };

      // 30일 모두 기록했고, 22일 이상이면 완료
      if (day === 30 && updatedChallenge.completedDays.length >= 22) {
        updatedChallenge.status = 'completed';
        updatedChallenge.completedAt = new Date();
      } else if (day === 30 && updatedChallenge.completedDays.length < 22) {
        updatedChallenge.status = 'failed';
      }

      set({ userChallenge: updatedChallenge });
      saveToStorage(get().currentCohort, updatedChallenge);
    },

    // 현재 DAY 계산 (스탬프 기반)
    calculateCurrentDay: () => {
      const { userChallenge } = get();
      if (!userChallenge || userChallenge.status !== 'active') return 0;

      // 완료한 스탬프 개수 + 1 = 다음 기록할 DAY
      // 예: 스탬프 0개 → DAY 1, 스탬프 1개 → DAY 2, ..., 스탬프 29개 → DAY 30
      return Math.min(userChallenge.completedDays.length + 1, 30);
    },

    // 사전 설문 시작 가능 여부
    canStartPreSurvey: () => {
      const { userChallenge } = get();
      if (!userChallenge) return false;

      // approved 상태이면 바로 설문 가능 (날짜 제약 없음)
      return userChallenge.status === 'approved';
    },

    // 챌린지 완료 처리 (사후 설문 완료 후 호출)
    completeChallenge: () => {
      const { userChallenge } = get();
      if (!userChallenge) return;

      const updatedChallenge = {
        ...userChallenge,
        status: 'completed' as const,
        completedAt: new Date()
      };

      set({ userChallenge: updatedChallenge });
      saveToStorage(get().currentCohort, updatedChallenge);
    },

    // 리포트 접근 가능 여부 (22일 이상 + 30일 완료)
    canAccessReport: () => {
      const { userChallenge } = get();
      if (!userChallenge) return false;

      return userChallenge.status === 'completed' &&
             userChallenge.completedDays.length >= 22;
    },

    // 챌린지 리셋 (새 기수 시작용)
    resetChallenge: () => {
      set({ userChallenge: null });
      saveToStorage(get().currentCohort, null);
    }
  };
});
