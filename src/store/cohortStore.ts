import { create } from 'zustand';

// 기수 정보
export interface Cohort {
  id: string;           // "cohort-1", "cohort-2"
  name: string;         // "1기", "2기"
  startDate: Date;      // 2026-01-01
  endDate: Date;        // 2026-01-30 (30일 후)
  status: 'recruiting' | 'active' | 'completed';
  description?: string; // 기수 설명 (선택)
  createdAt: Date;
  maxParticipants?: number; // 최대 참여자 수 (선택)
  recordType?: 'both' | 'self_care_only' | 'kindness_only'; // 기록 항목 타입 (디폴트: both)
}

interface CohortStore {
  cohorts: Cohort[];

  // Actions
  createCohort: (data: {
    name: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    maxParticipants?: number;
    recordType?: 'both' | 'self_care_only' | 'kindness_only';
  }) => string; // Returns cohort ID
  updateCohort: (cohortId: string, updates: Partial<Omit<Cohort, 'id' | 'createdAt'>>) => void;
  deleteCohort: (cohortId: string) => void;
  getCohortById: (cohortId: string) => Cohort | undefined;
  getRecruitingCohorts: () => Cohort[];
  getActiveCohorts: () => Cohort[];
  updateCohortStatus: (cohortId: string, status: Cohort['status']) => void;
}

const STORAGE_KEY = 'kindness-cohorts';

// LocalStorage에서 로드
const loadFromStorage = (): Cohort[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored).map((cohort: any) => ({
        ...cohort,
        startDate: new Date(cohort.startDate),
        endDate: new Date(cohort.endDate),
        createdAt: new Date(cohort.createdAt),
        recordType: cohort.recordType || 'both' // 기존 데이터 호환성: 없으면 'both'
      }));
    }
  } catch (error) {
    console.error('Failed to load cohorts:', error);
  }
  return [];
};

// LocalStorage에 저장
const saveToStorage = (cohorts: Cohort[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cohorts));
  } catch (error) {
    console.error('Failed to save cohorts:', error);
  }
};

export const useCohortStore = create<CohortStore>((set, get) => {
  const storedCohorts = loadFromStorage();

  // 초기화: 테스트용 기수가 없으면 생성
  if (storedCohorts.length === 0) {
    const testCohort: Cohort = {
      id: 'cohort-1',
      name: '1기 (테스트)',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-01-30'),
      status: 'recruiting',
      description: '테스트용 기수입니다',
      recordType: 'both',
      createdAt: new Date()
    };
    storedCohorts.push(testCohort);
    saveToStorage(storedCohorts);
  }

  return {
    cohorts: storedCohorts,

    // 기수 생성
    createCohort: (data) => {
      const cohortId = `cohort-${Date.now()}`;
      const newCohort: Cohort = {
        id: cohortId,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'recruiting',
        description: data.description,
        maxParticipants: data.maxParticipants,
        recordType: data.recordType || 'both', // 디폴트: both
        createdAt: new Date()
      };

      const cohorts = [...get().cohorts, newCohort];
      set({ cohorts });
      saveToStorage(cohorts);

      return cohortId;
    },

    // 기수 수정
    updateCohort: (cohortId, updates) => {
      const cohorts = get().cohorts.map(cohort =>
        cohort.id === cohortId
          ? { ...cohort, ...updates }
          : cohort
      );

      set({ cohorts });
      saveToStorage(cohorts);
    },

    // 기수 삭제
    deleteCohort: (cohortId) => {
      const cohorts = get().cohorts.filter(cohort => cohort.id !== cohortId);
      set({ cohorts });
      saveToStorage(cohorts);
    },

    // ID로 기수 조회
    getCohortById: (cohortId) => {
      return get().cohorts.find(cohort => cohort.id === cohortId);
    },

    // 모집 중인 기수 목록
    getRecruitingCohorts: () => {
      return get().cohorts.filter(cohort => cohort.status === 'recruiting');
    },

    // 진행 중인 기수 목록
    getActiveCohorts: () => {
      return get().cohorts.filter(cohort => cohort.status === 'active');
    },

    // 기수 상태 변경
    updateCohortStatus: (cohortId, status) => {
      const cohorts = get().cohorts.map(cohort =>
        cohort.id === cohortId
          ? { ...cohort, status }
          : cohort
      );

      set({ cohorts });
      saveToStorage(cohorts);
    }
  };
});
