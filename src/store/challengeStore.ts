import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useCohortStore } from './cohortStore';

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

      // 챌린지 시작 알림 발송 (Email + SMS)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Get cohort name
        const cohort = useCohortStore.getState().cohorts.find(c => c.id === cohortId);
        const cohortName = cohort?.name || '정서샤워 챌린지';

        const { data: notificationData, error: notificationError } = await supabase.functions.invoke(
          'send-notification',
          {
            body: {
              userId: user.id,
              type: 'challenge_start_reminder',
              channels: ['email', 'sms'],
              data: {
                cohortName
              }
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }
        );

        if (notificationError || !notificationData?.success) {
          console.error('Failed to send challenge start notification:', notificationError);
        } else {
          console.log('✅ Challenge start notification sent');
        }
      } catch (notificationError) {
        console.error('Challenge start notification error:', notificationError);
      }
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

      // DAY 30 완료 시: DAY 2-29 중 22일 이상이면 성공
      if (day === 30) {
        // DAY 2-29 중에서 완료한 날 개수 계산
        const recordDaysCompleted = completedDays.filter(d => d >= 2 && d <= 29).length;

        if (recordDaysCompleted >= 22) {
          newStatus = 'completed';
          completedAt = new Date();
        } else {
          newStatus = 'failed';
          completedAt = new Date();
        }
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

      console.log('💾 [completeDay] Supabase 업데이트 시작:', updateData);

      const { error } = await supabase
        .from('challenges')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('cohort_id', cohortId);

      if (error) {
        console.error('❌ [completeDay] Supabase 업데이트 실패:', error);
        return;
      }
      console.log('✅ [completeDay] Supabase 업데이트 성공');

      const challenges = get().challenges.map(ch =>
        ch.cohortId === cohortId
          ? { ...ch, completedDays, status: newStatus, completedAt }
          : ch
      );

      set({ challenges });
      console.log('🔄 [completeDay] 로컬 상태 업데이트 완료:', { completedDays, status: newStatus });

      // 알림 발송
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Day 30: 완료/실패 알림
        if (day === 30) {
          if (newStatus === 'completed') {
            // 챌린지 완료 알림 (Email + SMS)
            const { data: notificationData, error: notificationError } = await supabase.functions.invoke(
              'send-notification',
              {
                body: {
                  userId: user.id,
                  type: 'challenge_completion',
                  channels: ['email', 'sms'],
                  data: {
                    stamps: completedDays.length
                  }
                },
                headers: {
                  Authorization: `Bearer ${session.access_token}`
                }
              }
            );

            if (notificationError || !notificationData?.success) {
              console.error('Failed to send completion notification:', notificationError);
            } else {
              console.log('✅ Challenge completion notification sent');
            }
          } else if (newStatus === 'failed') {
            // 챌린지 실패 알림 (Email만)
            const { data: notificationData, error: notificationError } = await supabase.functions.invoke(
              'send-notification',
              {
                body: {
                  userId: user.id,
                  type: 'challenge_failure',
                  channels: ['email'],
                  data: {
                    stamps: completedDays.length
                  }
                },
                headers: {
                  Authorization: `Bearer ${session.access_token}`
                }
              }
            );

            if (notificationError || !notificationData?.success) {
              console.error('Failed to send failure notification:', notificationError);
            } else {
              console.log('✅ Challenge failure notification sent');
            }
          }
        }

        // 마일스톤 알림 (Day 7, 15, 22)
        if ([7, 15, 22].includes(day)) {
          const { data: notificationData, error: notificationError } = await supabase.functions.invoke(
            'send-notification',
            {
              body: {
                userId: user.id,
                type: 'milestone_reached',
                channels: ['email'],
                data: {
                  day
                }
              },
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            }
          );

          if (notificationError || !notificationData?.success) {
            console.error('Failed to send milestone notification:', notificationError);
          } else {
            console.log(`✅ Milestone notification sent for day ${day}`);
          }
        }
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
      }
    } catch (error) {
      console.error('Complete day error:', error);
    }
  },

  // 현재 DAY 계산 (스탬프 기반)
  calculateCurrentDay: (cohortId) => {
    const challenge = get().challenges.find(ch => ch.cohortId === cohortId);
    if (!challenge) return 0;

    // approved 상태: DAY 1 (사전 설문 시작 전)
    if (challenge.status === 'approved') return 1;

    // active 상태가 아니면 0 (waiting, completed, failed)
    if (challenge.status !== 'active') return 0;

    // active 상태: 완료한 스탬프 개수 + 1 = 다음 기록할 DAY
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

  // 리포트 접근 가능 여부 (DAY 2-29 중 22일 이상 + 완료 상태)
  canAccessReport: (cohortId) => {
    const challenge = get().challenges.find(ch => ch.cohortId === cohortId);
    if (!challenge) return false;

    const recordDaysCompleted = challenge.completedDays.filter(d => d >= 2 && d <= 29).length;
    return challenge.status === 'completed' && recordDaysCompleted >= 22;
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
