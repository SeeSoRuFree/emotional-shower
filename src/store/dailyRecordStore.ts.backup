import { create } from 'zustand';

// 행동 (자기돌봄 또는 타인친절)
interface Action {
  id: string;
  label: string;       // "산책하기", "친구에게 문자 보내기"
  memo?: string;       // 선택적 메모
  isCustom: boolean;   // 사용자가 추가한 항목인지
  timestamp: Date;
}

// 일일 기록
export interface DailyRecord {
  date: string;        // "2025-02-01" (YYYY-MM-DD)
  day: number;         // 1-30 (챌린지 DAY)
  selfCareActions: Action[];   // 자기돌봄 (최대 10개)
  kindnessActions: Action[];   // 타인친절 (최대 10개)
  receivedQuote?: string;      // 받은 문구 선물
  isCompleted: boolean;        // Q1, Q2 모두 완료했는지
  completedAt?: Date;
}

interface DailyRecordStore {
  records: DailyRecord[];

  // Actions
  getTodayRecord: (day: number) => DailyRecord | undefined;
  addSelfCareAction: (day: number, label: string, isCustom: boolean) => void;
  addKindnessAction: (day: number, label: string, isCustom: boolean) => void;
  updateActionMemo: (day: number, actionType: 'selfCare' | 'kindness', actionId: string, memo: string) => void;
  updateAction: (day: number, actionType: 'selfCare' | 'kindness', actionId: string, newLabel: string, newMemo: string) => void;
  removeAction: (day: number, actionType: 'selfCare' | 'kindness', actionId: string) => void;
  completeRecord: (day: number, quote: string) => void;
  getRecordByDay: (day: number) => DailyRecord | undefined;
  getTopActions: (type: 'selfCare' | 'kindness', limit?: number) => { label: string; count: number }[];
}

const STORAGE_KEY = 'kindness-daily-records';

// LocalStorage 로드
const loadFromStorage = (): DailyRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const records = JSON.parse(stored);
      return records.map((record: any) => ({
        ...record,
        selfCareActions: record.selfCareActions?.map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp)
        })) || [],
        kindnessActions: record.kindnessActions?.map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp)
        })) || [],
        completedAt: record.completedAt ? new Date(record.completedAt) : undefined
      }));
    }
  } catch (error) {
    console.error('Failed to load daily records:', error);
  }
  return [];
};

// LocalStorage 저장
const saveToStorage = (records: DailyRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save daily records:', error);
  }
};

// Export Action type for external use
export type { Action };

export const useDailyRecordStore = create<DailyRecordStore>((set, get) => ({
  records: loadFromStorage(),

  // 오늘(특정 DAY)의 기록 가져오기
  getTodayRecord: (day: number) => {
    return get().records.find(r => r.day === day);
  },

  // 자기돌봄 행동 추가
  addSelfCareAction: (day: number, label: string, isCustom: boolean) => {
    const { records } = get();
    const today = new Date().toISOString().split('T')[0];

    let record = records.find(r => r.day === day);

    if (!record) {
      // 새 기록 생성
      record = {
        date: today,
        day,
        selfCareActions: [],
        kindnessActions: [],
        isCompleted: false
      };
      records.push(record);
    }

    // 최대 10개 제한
    if (record.selfCareActions.length >= 10) {
      alert('자기돌봄 행동은 최대 10개까지 추가할 수 있습니다.');
      return;
    }

    const newAction: Action = {
      id: `self-${Date.now()}`,
      label,
      isCustom,
      timestamp: new Date()
    };

    record.selfCareActions.push(newAction);

    const updatedRecords = records.map(r => r.day === day ? record : r) as DailyRecord[];
    set({ records: updatedRecords });
    saveToStorage(updatedRecords);
  },

  // 타인친절 행동 추가
  addKindnessAction: (day: number, label: string, isCustom: boolean) => {
    const { records } = get();
    const today = new Date().toISOString().split('T')[0];

    let record = records.find(r => r.day === day);

    if (!record) {
      record = {
        date: today,
        day,
        selfCareActions: [],
        kindnessActions: [],
        isCompleted: false
      };
      records.push(record);
    }

    if (record.kindnessActions.length >= 10) {
      alert('타인친절 행동은 최대 10개까지 추가할 수 있습니다.');
      return;
    }

    const newAction: Action = {
      id: `kind-${Date.now()}`,
      label,
      isCustom,
      timestamp: new Date()
    };

    record.kindnessActions.push(newAction);

    const updatedRecords = records.map(r => r.day === day ? record : r) as DailyRecord[];
    set({ records: updatedRecords });
    saveToStorage(updatedRecords);
  },

  // 행동에 메모 추가/수정
  updateActionMemo: (day: number, actionType: 'selfCare' | 'kindness', actionId: string, memo: string) => {
    const { records } = get();
    const record = records.find(r => r.day === day);
    if (!record) return;

    const actions = actionType === 'selfCare' ? record.selfCareActions : record.kindnessActions;
    const action = actions.find(a => a.id === actionId);
    if (action) {
      action.memo = memo;
    }

    const updatedRecords = [...records];
    set({ records: updatedRecords });
    saveToStorage(updatedRecords);
  },

  // 행동 전체 업데이트 (제목 + 메모)
  updateAction: (day: number, actionType: 'selfCare' | 'kindness', actionId: string, newLabel: string, newMemo: string) => {
    const { records } = get();
    const record = records.find(r => r.day === day);
    if (!record) return;

    const actions = actionType === 'selfCare' ? record.selfCareActions : record.kindnessActions;
    const action = actions.find(a => a.id === actionId);
    if (action) {
      action.label = newLabel;
      action.memo = newMemo;
    }

    const updatedRecords = [...records];
    set({ records: updatedRecords });
    saveToStorage(updatedRecords);
  },

  // 행동 삭제
  removeAction: (day: number, actionType: 'selfCare' | 'kindness', actionId: string) => {
    const { records } = get();
    const record = records.find(r => r.day === day);
    if (!record) return;

    if (actionType === 'selfCare') {
      record.selfCareActions = record.selfCareActions.filter(a => a.id !== actionId);
    } else {
      record.kindnessActions = record.kindnessActions.filter(a => a.id !== actionId);
    }

    const updatedRecords = [...records];
    set({ records: updatedRecords });
    saveToStorage(updatedRecords);
  },

  // 기록 완료 (스탬프 획득)
  completeRecord: (day: number, quote: string) => {
    const { records } = get();
    const record = records.find(r => r.day === day);
    if (!record) return;

    // Q1, Q2 모두 최소 1개 이상 있어야 완료 가능
    if (record.selfCareActions.length === 0 || record.kindnessActions.length === 0) {
      alert('자기돌봄과 타인친절 행동을 각각 최소 1개 이상 기록해주세요.');
      return;
    }

    record.isCompleted = true;
    record.receivedQuote = quote;
    record.completedAt = new Date();

    const updatedRecords = [...records];
    set({ records: updatedRecords });
    saveToStorage(updatedRecords);
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
