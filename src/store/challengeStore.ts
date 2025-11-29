import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
  loading: boolean;
  initialized: boolean;

  // Actions
  loadChallenges: () => Promise<void>;
  applyChallenge: (cohortId: string) => Promise<void>;  // 신청 (waiting 상태)
  approveChallenge: (cohortId: string) => Promise<void>;                 // 승인 (approved 상태)
  startChallenge: (cohortId: string) => Promise<void>;                   // 챌린지 시작 (active 상태)
  completeDay: (cohortId: string, day: number) => Promise<void>;
  completeChallenge: (cohortId: string) => Promise<void>;
  calculateCurrentDay: (cohortId: string) => number;
  canStartPreSurvey: (cohortId: string) => boolean;             // 사전 설문 가능 여부
  canAccessReport: (cohortId: string) => boolean;
  getCurrentChallenge: (cohortId: string) => UserChallenge | undefined;  // 특정 기수 챌린지 조회
  resetChallenge: (cohortId: string) => Promise<void>;
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  challenges: [],
  loading: false,
  initialized: false,

  // Supabase에서 사용자의 챌린지 목록 로드
  loadChallenges: async () => {
    try {
      set({ loading: true });

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        set({ challenges: [], loading: false, initialized: true });
        return;
      }

      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Failed to load challenges:', error);
        set({ loading: false });
        return;
      }

      const challenges: UserChallenge[] = (data || []).map(row => ({
        cohortId: row.cohort_id,
        completedDays: row.completed_days || [],
        status: row.status,
        appliedAt: row.applied_at ? new Date(row.applied_at) : null,
        approvedAt: row.approved_at ? new Date(row.approved_at) : null,
        startedAt: row.started_at ? new Date(row.started_at) : null,
        completedAt: row.completed_at ? new Date(row.completed_at) : null
      }));

      set({ challenges, loading: false, initialized: true });
    } catch (error) {
      console.error('Load challenges error:', error);
      set({ loading: false });
    }
  },

  // 챌린지 신청 (온보딩 완료 후)
  applyChallenge: async (cohortId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('No authenticated user');
        return;
      }

      // Check if challenge already exists
      const existing = get().challenges.find(c => c.cohortId === cohortId);
      if (existing) {
        console.log('Challenge already exists for this cohort');
        return;
      }

      const { data, error } = await supabase
        .from('challenges')
        .insert({
          user_id: user.id,
          cohort_id: cohortId,
          status: 'waiting',
          completed_days: []
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to apply challenge:', error);
        return;
      }

      const newChallenge: UserChallenge = {
        cohortId: data.cohort_id,
        completedDays: data.completed_days || [],
        status: data.status,
        appliedAt: data.applied_at ? new Date(data.applied_at) : null,
        approvedAt: data.approved_at ? new Date(data.approved_at) : null,
        startedAt: data.started_at ? new Date(data.started_at) : null,
        completedAt: data.completed_at ? new Date(data.completed_at) : null
      };

      set({ challenges: [...get().challenges, newChallenge] });
    } catch (error) {
      console.error('Apply challenge error:', error);
    }
  },

  // 챌린지 승인 (코드 인증 후)
  approveChallenge: async (cohortId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('No authenticated user');
        return;
      }

      const { error } = await supabase
        .from('challenges')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('cohort_id', cohortId)
        .eq('status', 'waiting');

      if (error) {
        console.error('Failed to approve challenge:', error);
        return;
      }

      const challenges = get().challenges.map(ch =>
        ch.cohortId === cohortId && ch.status === 'waiting'
          ? { ...ch, status: 'approved' as const, approvedAt: new Date() }
          : ch
      );

      set({ challenges });
    } catch (error) {
      console.error('Approve challenge error:', error);
    }
  },

  // 챌린지 시작 (사전 설문 완료 후)
  startChallenge: async (cohortId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('No authenticated user');
        return;
      }

      const { error } = await supabase
        .from('challenges')
        .update({
          status: 'active',
          started_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('cohort_id', cohortId);

      if (error) {
        console.error('Failed to start challenge:', error);
        return;
      }

      const challenges = get().challenges.map(ch =>
        ch.cohortId === cohortId
          ? {
              ...ch,
              status: 'active' as const,
              startedAt: new Date()
            }
          : ch
      );

      set({ challenges });
    } catch (error) {
      console.error('Start challenge error:', error);
    }
  },

  // 특정 날짜 완료 처리 (스탬프 획득)
  completeDay: async (cohortId, day) => {
    try {
      const challenge = get().challenges.find(ch => ch.cohortId === cohortId);
      if (!challenge) {
        console.error('Challenge not found');
        return;
      }

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

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('No authenticated user');
        return;
      }

      const updateData: any = {
        completed_days: completedDays,
        status: newStatus
      };

      if (completedAt) {
        updateData.completed_at = completedAt.toISOString();
      }

      const { error } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('cohort_id', cohortId);

      if (error) {
        console.error('Failed to complete day:', error);
        return;
      }

      const challenges = get().challenges.map(ch =>
        ch.cohortId === cohortId
          ? { ...ch, completedDays, status: newStatus, completedAt }
          : ch
      );

      set({ challenges });
    } catch (error) {
      console.error('Complete day error:', error);
    }
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
  completeChallenge: async (cohortId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('No authenticated user');
        return;
      }

      const { error } = await supabase
        .from('challenges')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('cohort_id', cohortId);

      if (error) {
        console.error('Failed to complete challenge:', error);
        return;
      }

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
    } catch (error) {
      console.error('Complete challenge error:', error);
    }
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
  resetChallenge: async (cohortId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('No authenticated user');
        return;
      }

      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('user_id', user.id)
        .eq('cohort_id', cohortId);

      if (error) {
        console.error('Failed to reset challenge:', error);
        return;
      }

      const challenges = get().challenges.filter(ch => ch.cohortId !== cohortId);
      set({ challenges });
    } catch (error) {
      console.error('Reset challenge error:', error);
    }
  }
}));
