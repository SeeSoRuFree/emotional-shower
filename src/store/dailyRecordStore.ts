import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// 행동 (자기돌봄 또는 타인친절)
interface Action {
  id: string;
  label: string;       // "산책하기", "친구에게 문자 보내기"
  memo?: string;       // 선택적 메모
  imageUrl?: string;   // 행동에 첨부된 이미지 URL
  isCustom: boolean;   // 사용자가 추가한 항목인지
  timestamp: Date;
}

// 일일 기록
export interface DailyRecord {
  date: string;        // "2025-02-01" (YYYY-MM-DD)
  day: number;         // 1-30 (챌린지 DAY)
  selfCareActions: Action[];   // 자기돌봄 (최대 10개)
  kindnessActions: Action[];   // 타인친절 (최대 10개)
  imageUrl?: string;           // 기록에 첨부된 이미지
  receivedQuote?: string;      // 받은 문구 선물
  isCompleted: boolean;        // Q1, Q2 모두 완료했는지
  completedAt?: Date;
}

interface DailyRecordStore {
  records: DailyRecord[];
  loading: boolean;
  initialized: boolean;

  // Actions
  loadRecords: () => Promise<void>;
  getTodayRecord: (day: number) => DailyRecord | undefined;
  addSelfCareAction: (day: number, label: string, isCustom: boolean, memo?: string, imageUrl?: string) => Promise<void>;
  addKindnessAction: (day: number, label: string, isCustom: boolean, memo?: string, imageUrl?: string) => Promise<void>;
  updateActionMemo: (day: number, actionType: 'selfCare' | 'kindness', actionId: string, memo: string) => Promise<void>;
  updateAction: (day: number, actionType: 'selfCare' | 'kindness', actionId: string, newLabel: string, newMemo: string, newImageUrl?: string | null) => Promise<void>;
  updateActionImage: (day: number, actionType: 'selfCare' | 'kindness', actionId: string, imageUrl: string | null) => Promise<void>;
  removeAction: (day: number, actionType: 'selfCare' | 'kindness', actionId: string) => Promise<void>;
  updateRecordImage: (day: number, imageUrl: string | null) => Promise<void>;
  completeRecord: (day: number, quote: string) => Promise<void>;
  getRecordByDay: (day: number) => DailyRecord | undefined;
  getTopActions: (type: 'selfCare' | 'kindness', limit?: number) => { label: string; count: number }[];
}

// Export Action type for external use
export type { Action };

export const useDailyRecordStore = create<DailyRecordStore>((set, get) => ({
  records: [],
  loading: false,
  initialized: false,

  // Supabase에서 일일 기록 로드
  loadRecords: async () => {
    try {
      set({ loading: true });

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        set({ records: [], loading: false, initialized: true });
        return;
      }

      // 현재 사용자의 현재 cohort_id 가져오기
      const { data: userData } = await supabase
        .from('users')
        .select('current_cohort_id')
        .eq('id', user.id)
        .single();

      if (!userData?.current_cohort_id) {
        set({ records: [], loading: false, initialized: true });
        return;
      }

      const { data, error } = await supabase
        .from('daily_records')
        .select('*')
        .eq('user_id', user.id)
        .eq('cohort_id', userData.current_cohort_id)
        .order('day', { ascending: true });

      if (error) {
        console.error('Failed to load daily records:', error);
        set({ loading: false });
        return;
      }

      const records: DailyRecord[] = (data || []).map(row => {
        // JSONB에서 Action 배열 파싱 (timestamp를 Date로 변환)
        const selfCareActions = (row.self_care_actions as any[] || []).map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp)
        }));

        const kindnessActions = (row.kindness_actions as any[] || []).map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp)
        }));

        return {
          date: new Date(row.created_at).toISOString().split('T')[0],
          day: row.day,
          selfCareActions,
          kindnessActions,
          imageUrl: row.image_url || undefined,
          receivedQuote: row.quote || undefined,
          isCompleted: row.is_completed,
          completedAt: row.updated_at ? new Date(row.updated_at) : undefined
        };
      });

      set({ records, loading: false, initialized: true });
    } catch (error) {
      console.error('Load daily records error:', error);
      set({ loading: false });
    }
  },

  // 오늘(특정 DAY)의 기록 가져오기
  getTodayRecord: (day: number) => {
    return get().records.find(r => r.day === day);
  },

  // 자기돌봄 행동 추가
  addSelfCareAction: async (day: number, label: string, isCustom: boolean, memo?: string, imageUrl?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('current_cohort_id')
        .eq('id', user.id)
        .single();

      if (!userData?.current_cohort_id) return;

      const cohortId = userData.current_cohort_id;
      const { records } = get();
      const today = new Date().toISOString().split('T')[0];

      let record = records.find(r => r.day === day);

      // 최대 10개 제한
      if (record && record.selfCareActions.length >= 10) {
        alert('자기돌봄 행동은 최대 10개까지 추가할 수 있습니다.');
        return;
      }

      const newAction: Action = {
        id: `self-${Date.now()}`,
        label,
        memo,
        imageUrl,
        isCustom,
        timestamp: new Date()
      };

      if (!record) {
        // 새 기록 생성
        const { data, error } = await supabase
          .from('daily_records')
          .insert({
            user_id: user.id,
            cohort_id: cohortId,
            day,
            self_care_actions: [newAction],
            kindness_actions: [],
            is_completed: false
          })
          .select()
          .single();

        if (error) {
          console.error('Failed to create daily record:', error);
          return;
        }

        record = {
          date: today,
          day,
          selfCareActions: [newAction],
          kindnessActions: [],
          isCompleted: false
        };

        set({ records: [...records, record] });
      } else {
        // 기존 기록 업데이트
        const updatedSelfCare = [...record.selfCareActions, newAction];

        const { error } = await supabase
          .from('daily_records')
          .update({
            self_care_actions: updatedSelfCare
          })
          .eq('user_id', user.id)
          .eq('cohort_id', cohortId)
          .eq('day', day);

        if (error) {
          console.error('Failed to update self care actions:', error);
          return;
        }

        const updatedRecords = records.map(r =>
          r.day === day ? { ...r, selfCareActions: updatedSelfCare } : r
        );

        set({ records: updatedRecords });
      }
    } catch (error) {
      console.error('Add self care action error:', error);
    }
  },

  // 타인친절 행동 추가
  addKindnessAction: async (day: number, label: string, isCustom: boolean, memo?: string, imageUrl?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('current_cohort_id')
        .eq('id', user.id)
        .single();

      if (!userData?.current_cohort_id) return;

      const cohortId = userData.current_cohort_id;
      const { records } = get();
      const today = new Date().toISOString().split('T')[0];

      let record = records.find(r => r.day === day);

      if (record && record.kindnessActions.length >= 10) {
        alert('타인친절 행동은 최대 10개까지 추가할 수 있습니다.');
        return;
      }

      const newAction: Action = {
        id: `kind-${Date.now()}`,
        label,
        memo,
        imageUrl,
        isCustom,
        timestamp: new Date()
      };

      if (!record) {
        const { data, error } = await supabase
          .from('daily_records')
          .insert({
            user_id: user.id,
            cohort_id: cohortId,
            day,
            self_care_actions: [],
            kindness_actions: [newAction],
            is_completed: false
          })
          .select()
          .single();

        if (error) {
          console.error('Failed to create daily record:', error);
          return;
        }

        record = {
          date: today,
          day,
          selfCareActions: [],
          kindnessActions: [newAction],
          isCompleted: false
        };

        set({ records: [...records, record] });
      } else {
        const updatedKindness = [...record.kindnessActions, newAction];

        const { error } = await supabase
          .from('daily_records')
          .update({
            kindness_actions: updatedKindness
          })
          .eq('user_id', user.id)
          .eq('cohort_id', cohortId)
          .eq('day', day);

        if (error) {
          console.error('Failed to update kindness actions:', error);
          return;
        }

        const updatedRecords = records.map(r =>
          r.day === day ? { ...r, kindnessActions: updatedKindness } : r
        );

        set({ records: updatedRecords });
      }
    } catch (error) {
      console.error('Add kindness action error:', error);
    }
  },

  // 행동에 메모 추가/수정 (Supabase 동기화)
  updateActionMemo: async (day: number, actionType: 'selfCare' | 'kindness', actionId: string, memo: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('current_cohort_id')
        .eq('id', user.id)
        .single();

      if (!userData?.current_cohort_id) return;

      const { records } = get();
      const record = records.find(r => r.day === day);
      if (!record) return;

      // 로컬 상태 업데이트
      const updatedActions = actionType === 'selfCare'
        ? record.selfCareActions.map(a => a.id === actionId ? { ...a, memo } : a)
        : record.kindnessActions.map(a => a.id === actionId ? { ...a, memo } : a);

      const updateField = actionType === 'selfCare' ? 'self_care_actions' : 'kindness_actions';

      // Supabase 업데이트
      const { error } = await supabase
        .from('daily_records')
        .update({ [updateField]: updatedActions })
        .eq('user_id', user.id)
        .eq('cohort_id', userData.current_cohort_id)
        .eq('day', day);

      if (error) {
        console.error('Failed to update action memo:', error);
        return;
      }

      // 로컬 상태 반영
      const updatedRecords = records.map(r =>
        r.day === day
          ? {
              ...r,
              ...(actionType === 'selfCare'
                ? { selfCareActions: updatedActions }
                : { kindnessActions: updatedActions })
            }
          : r
      );
      set({ records: updatedRecords });
    } catch (error) {
      console.error('Update action memo error:', error);
    }
  },

  // 행동 전체 업데이트 (제목 + 메모 + 이미지) (Supabase 동기화)
  updateAction: async (day: number, actionType: 'selfCare' | 'kindness', actionId: string, newLabel: string, newMemo: string, newImageUrl?: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('current_cohort_id')
        .eq('id', user.id)
        .single();

      if (!userData?.current_cohort_id) return;

      const { records } = get();
      const record = records.find(r => r.day === day);
      if (!record) return;

      // 로컬 상태 업데이트 (imageUrl이 undefined면 기존 값 유지, null이면 삭제)
      const updatedActions = actionType === 'selfCare'
        ? record.selfCareActions.map(a => a.id === actionId ? {
            ...a,
            label: newLabel,
            memo: newMemo,
            ...(newImageUrl !== undefined ? { imageUrl: newImageUrl || undefined } : {})
          } : a)
        : record.kindnessActions.map(a => a.id === actionId ? {
            ...a,
            label: newLabel,
            memo: newMemo,
            ...(newImageUrl !== undefined ? { imageUrl: newImageUrl || undefined } : {})
          } : a);

      const updateField = actionType === 'selfCare' ? 'self_care_actions' : 'kindness_actions';

      // Supabase 업데이트
      const { error } = await supabase
        .from('daily_records')
        .update({ [updateField]: updatedActions })
        .eq('user_id', user.id)
        .eq('cohort_id', userData.current_cohort_id)
        .eq('day', day);

      if (error) {
        console.error('Failed to update action:', error);
        return;
      }

      // 로컬 상태 반영
      const updatedRecords = records.map(r =>
        r.day === day
          ? {
              ...r,
              ...(actionType === 'selfCare'
                ? { selfCareActions: updatedActions }
                : { kindnessActions: updatedActions })
            }
          : r
      );
      set({ records: updatedRecords });
    } catch (error) {
      console.error('Update action error:', error);
    }
  },

  // 행동 이미지 업데이트 (Supabase 동기화)
  updateActionImage: async (day: number, actionType: 'selfCare' | 'kindness', actionId: string, imageUrl: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('current_cohort_id')
        .eq('id', user.id)
        .single();

      if (!userData?.current_cohort_id) return;

      const { records } = get();
      const record = records.find(r => r.day === day);
      if (!record) return;

      // 로컬 상태 업데이트
      const updatedActions = actionType === 'selfCare'
        ? record.selfCareActions.map(a => a.id === actionId ? { ...a, imageUrl: imageUrl || undefined } : a)
        : record.kindnessActions.map(a => a.id === actionId ? { ...a, imageUrl: imageUrl || undefined } : a);

      const updateField = actionType === 'selfCare' ? 'self_care_actions' : 'kindness_actions';

      // Supabase 업데이트
      const { error } = await supabase
        .from('daily_records')
        .update({ [updateField]: updatedActions })
        .eq('user_id', user.id)
        .eq('cohort_id', userData.current_cohort_id)
        .eq('day', day);

      if (error) {
        console.error('Failed to update action image:', error);
        return;
      }

      // 로컬 상태 반영
      const updatedRecords = records.map(r =>
        r.day === day
          ? {
              ...r,
              ...(actionType === 'selfCare'
                ? { selfCareActions: updatedActions }
                : { kindnessActions: updatedActions })
            }
          : r
      );
      set({ records: updatedRecords });
    } catch (error) {
      console.error('Update action image error:', error);
    }
  },

  // 행동 삭제 (Supabase 동기화)
  removeAction: async (day: number, actionType: 'selfCare' | 'kindness', actionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('current_cohort_id')
        .eq('id', user.id)
        .single();

      if (!userData?.current_cohort_id) return;

      const { records } = get();
      const record = records.find(r => r.day === day);
      if (!record) return;

      // 삭제된 액션 필터링
      const updatedActions = actionType === 'selfCare'
        ? record.selfCareActions.filter(a => a.id !== actionId)
        : record.kindnessActions.filter(a => a.id !== actionId);

      const updateField = actionType === 'selfCare' ? 'self_care_actions' : 'kindness_actions';

      // Supabase 업데이트
      const { error } = await supabase
        .from('daily_records')
        .update({ [updateField]: updatedActions })
        .eq('user_id', user.id)
        .eq('cohort_id', userData.current_cohort_id)
        .eq('day', day);

      if (error) {
        console.error('Failed to remove action:', error);
        return;
      }

      // 로컬 상태 반영
      const updatedRecords = records.map(r =>
        r.day === day
          ? {
              ...r,
              ...(actionType === 'selfCare'
                ? { selfCareActions: updatedActions }
                : { kindnessActions: updatedActions })
            }
          : r
      );
      set({ records: updatedRecords });
    } catch (error) {
      console.error('Remove action error:', error);
    }
  },

  // 이미지 업데이트
  updateRecordImage: async (day: number, imageUrl: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('current_cohort_id')
        .eq('id', user.id)
        .single();

      if (!userData?.current_cohort_id) return;

      const cohortId = userData.current_cohort_id;
      const { records } = get();
      const today = new Date().toISOString().split('T')[0];

      let record = records.find(r => r.day === day);

      if (!record) {
        // 새 기록 생성
        const { error } = await supabase
          .from('daily_records')
          .insert({
            user_id: user.id,
            cohort_id: cohortId,
            day,
            self_care_actions: [],
            kindness_actions: [],
            image_url: imageUrl,
            is_completed: false
          });

        if (error) {
          console.error('Failed to create daily record with image:', error);
          return;
        }

        record = {
          date: today,
          day,
          selfCareActions: [],
          kindnessActions: [],
          imageUrl: imageUrl || undefined,
          isCompleted: false
        };

        set({ records: [...records, record] });
      } else {
        // 기존 기록 업데이트
        const { error } = await supabase
          .from('daily_records')
          .update({ image_url: imageUrl })
          .eq('user_id', user.id)
          .eq('cohort_id', cohortId)
          .eq('day', day);

        if (error) {
          console.error('Failed to update record image:', error);
          return;
        }

        const updatedRecords = records.map(r =>
          r.day === day ? { ...r, imageUrl: imageUrl || undefined } : r
        );

        set({ records: updatedRecords });
      }
    } catch (error) {
      console.error('Update record image error:', error);
    }
  },

  // 기록 완료 (스탬프 획득)
  completeRecord: async (day: number, quote: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('current_cohort_id')
        .eq('id', user.id)
        .single();

      if (!userData?.current_cohort_id) return;

      const cohortId = userData.current_cohort_id;
      const { records } = get();
      const record = records.find(r => r.day === day);
      if (!record) return;

      // Q1, Q2 모두 최소 1개 이상 있어야 완료 가능
      if (record.selfCareActions.length === 0 || record.kindnessActions.length === 0) {
        alert('자기돌봄과 타인친절 행동을 각각 최소 1개 이상 기록해주세요.');
        return;
      }

      const { error } = await supabase
        .from('daily_records')
        .update({
          is_completed: true,
          quote: quote
        })
        .eq('user_id', user.id)
        .eq('cohort_id', cohortId)
        .eq('day', day);

      if (error) {
        console.error('Failed to complete record:', error);
        return;
      }

      const updatedRecords = records.map(r =>
        r.day === day
          ? { ...r, isCompleted: true, receivedQuote: quote, completedAt: new Date() }
          : r
      );

      set({ records: updatedRecords });
    } catch (error) {
      console.error('Complete record error:', error);
    }
  },

  // 특정 DAY 기록 가져오기
  getRecordByDay: (day: number) => {
    return get().records.find(r => r.day === day);
  },

  // TOP 행동 추출 (리포트용)
  getTopActions: (type: 'selfCare' | 'kindness', limit = 5) => {
    const { records } = get();
    const actionMap = new Map<string, number>();

    records.forEach(record => {
      const actions = type === 'selfCare' ? record.selfCareActions : record.kindnessActions;
      actions.forEach(action => {
        const count = actionMap.get(action.label) || 0;
        actionMap.set(action.label, count + 1);
      });
    });

    return Array.from(actionMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}));
