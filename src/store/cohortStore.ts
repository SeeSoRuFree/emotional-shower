import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// 기수 정보
export interface Cohort {
  id: string;           // UUID from Supabase
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
  loading: boolean;
  initialized: boolean;

  // Actions
  loadCohorts: () => Promise<void>;
  createCohort: (data: {
    name: string;
    startDate: Date;
    endDate: Date;
    description?: string;
    maxParticipants?: number;
    recordType?: 'both' | 'self_care_only' | 'kindness_only';
  }) => Promise<string>; // Returns cohort ID
  updateCohort: (cohortId: string, updates: Partial<Omit<Cohort, 'id' | 'createdAt'>>) => Promise<void>;
  deleteCohort: (cohortId: string) => Promise<void>;
  getCohortById: (cohortId: string) => Cohort | undefined;
  getRecruitingCohorts: () => Cohort[];
  getActiveCohorts: () => Cohort[];
  updateCohortStatus: (cohortId: string, status: Cohort['status']) => Promise<void>;
  ensureTestCohort: () => Promise<string>; // Ensures test cohort exists, returns its UUID
}

export const useCohortStore = create<CohortStore>((set, get) => ({
  cohorts: [],
  loading: false,
  initialized: false,

  // Supabase에서 기수 목록 로드
  loadCohorts: async () => {
    try {
      set({ loading: true });

      const { data, error } = await supabase
        .from('cohorts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load cohorts:', error);
        set({ loading: false });
        return;
      }

      const cohorts: Cohort[] = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        startDate: new Date(row.start_date),
        endDate: new Date(row.end_date),
        status: row.status,
        description: row.description || undefined,
        maxParticipants: row.max_participants || undefined,
        recordType: row.record_type,
        createdAt: new Date(row.created_at)
      }));

      set({ cohorts, loading: false, initialized: true });
    } catch (error) {
      console.error('Load cohorts error:', error);
      set({ loading: false });
    }
  },

  // 테스트용 기수가 있는지 확인 (생성은 하지 않음)
  ensureTestCohort: async () => {
    // 아직 로드하지 않았으면 로드
    if (!get().initialized) {
      await loadCohorts();
    }

    // 테스트 기수 찾기 (이름으로 식별)
    const testCohort = get().cohorts.find(c => c.name.includes('1기') && c.name.includes('테스트'));

    if (testCohort) {
      return testCohort.id;
    }

    // 없으면 에러 (관리자가 수동으로 생성해야 함)
    throw new Error(
      '테스트용 기수가 없습니다. Supabase Dashboard에서 "1기 (테스트)" cohort를 생성해주세요.'
    );
  },

  // 기수 생성
  createCohort: async (data) => {
    try {
      const { data: newCohort, error } = await supabase
        .from('cohorts')
        .insert({
          name: data.name,
          start_date: data.startDate.toISOString().split('T')[0],
          end_date: data.endDate.toISOString().split('T')[0],
          status: 'recruiting',
          description: data.description || null,
          max_participants: data.maxParticipants || null,
          record_type: data.recordType || 'both'
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create cohort:', error);
        throw error;
      }

      const cohort: Cohort = {
        id: newCohort.id,
        name: newCohort.name,
        startDate: new Date(newCohort.start_date),
        endDate: new Date(newCohort.end_date),
        status: newCohort.status,
        description: newCohort.description || undefined,
        maxParticipants: newCohort.max_participants || undefined,
        recordType: newCohort.record_type,
        createdAt: new Date(newCohort.created_at)
      };

      set({ cohorts: [...get().cohorts, cohort] });

      return newCohort.id;
    } catch (error) {
      console.error('Create cohort error:', error);
      throw error;
    }
  },

  // 기수 수정
  updateCohort: async (cohortId, updates) => {
    try {
      const updateData: any = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate.toISOString().split('T')[0];
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate.toISOString().split('T')[0];
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.description !== undefined) updateData.description = updates.description || null;
      if (updates.maxParticipants !== undefined) updateData.max_participants = updates.maxParticipants || null;
      if (updates.recordType !== undefined) updateData.record_type = updates.recordType;

      const { error } = await supabase
        .from('cohorts')
        .update(updateData)
        .eq('id', cohortId);

      if (error) {
        console.error('Failed to update cohort:', error);
        throw error;
      }

      // 로컬 상태 업데이트
      const cohorts = get().cohorts.map(cohort =>
        cohort.id === cohortId
          ? { ...cohort, ...updates }
          : cohort
      );

      set({ cohorts });
    } catch (error) {
      console.error('Update cohort error:', error);
      throw error;
    }
  },

  // 기수 삭제
  deleteCohort: async (cohortId) => {
    try {
      const { error } = await supabase
        .from('cohorts')
        .delete()
        .eq('id', cohortId);

      if (error) {
        console.error('Failed to delete cohort:', error);
        throw error;
      }

      const cohorts = get().cohorts.filter(cohort => cohort.id !== cohortId);
      set({ cohorts });
    } catch (error) {
      console.error('Delete cohort error:', error);
      throw error;
    }
  },

  // ID로 기수 조회 (동기)
  getCohortById: (cohortId) => {
    return get().cohorts.find(cohort => cohort.id === cohortId);
  },

  // 모집 중인 기수 목록 (동기)
  getRecruitingCohorts: () => {
    return get().cohorts.filter(cohort => cohort.status === 'recruiting');
  },

  // 진행 중인 기수 목록 (동기)
  getActiveCohorts: () => {
    return get().cohorts.filter(cohort => cohort.status === 'active');
  },

  // 기수 상태 변경
  updateCohortStatus: async (cohortId, status) => {
    try {
      const { error } = await supabase
        .from('cohorts')
        .update({ status })
        .eq('id', cohortId);

      if (error) {
        console.error('Failed to update cohort status:', error);
        throw error;
      }

      const cohorts = get().cohorts.map(cohort =>
        cohort.id === cohortId
          ? { ...cohort, status }
          : cohort
      );

      set({ cohorts });
    } catch (error) {
      console.error('Update cohort status error:', error);
      throw error;
    }
  }
}));
