import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, BookOpen, Heart, Sparkles } from 'lucide-react';
import { useCohortStore } from '@/store/cohortStore';
import { supabase } from '@/lib/supabase';

interface Action {
  id: string;
  label: string;
  memo?: string;
  isCustom: boolean;
  timestamp: string;
}

interface DailyRecord {
  id: string;
  userId: string;
  cohortId: string;
  day: number;
  selfCareActions: Action[];
  kindnessActions: Action[];
  quote?: string;
  isCompleted: boolean;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  cohort?: {
    id: string;
    name: string;
  };
}

export default function DailyRecordManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  const { cohorts, loadCohorts } = useCohortStore();

  // Load cohorts
  useEffect(() => {
    loadCohorts();
  }, [loadCohorts]);

  // Load daily records from Supabase
  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('daily_records')
          .select(`
            *,
            users(id, name, email),
            cohorts(id, name)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to load daily records:', error);
          setRecords([]);
          return;
        }

        const mappedRecords: DailyRecord[] = (data || []).map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          cohortId: row.cohort_id,
          day: row.day,
          selfCareActions: (row.self_care_actions || []) as Action[],
          kindnessActions: (row.kindness_actions || []) as Action[],
          quote: row.quote,
          isCompleted: row.is_completed,
          createdAt: new Date(row.created_at),
          user: row.users ? {
            id: row.users.id,
            name: row.users.name,
            email: row.users.email
          } : undefined,
          cohort: row.cohorts ? {
            id: row.cohorts.id,
            name: row.cohorts.name
          } : undefined
        }));

        setRecords(mappedRecords);
      } catch (error) {
        console.error('Failed to load daily records:', error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  // Filter records
  const filteredRecords = useMemo(() => {
    let filtered = records;

    // Filter by cohort
    if (selectedCohort !== 'all') {
      filtered = filtered.filter(r => r.cohortId === selectedCohort);
    }

    // Filter by day
    if (selectedDay !== 'all') {
      filtered = filtered.filter(r => r.day === parseInt(selectedDay));
    }

    // Filter by completion status
    if (selectedStatus === 'completed') {
      filtered = filtered.filter(r => r.isCompleted);
    } else if (selectedStatus === 'incomplete') {
      filtered = filtered.filter(r => !r.isCompleted);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.user?.name.toLowerCase().includes(query) ||
        r.user?.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [records, selectedCohort, selectedDay, selectedStatus, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const completed = records.filter(r => r.isCompleted).length;
    const totalActions = records.reduce((sum, r) =>
      sum + r.selfCareActions.length + r.kindnessActions.length, 0
    );
    return { completed, totalActions };
  }, [records]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">데일리 기록 관리</h2>
        <p className="text-sm text-slate-500 mt-1">사용자별 일일 기록을 확인합니다 (조회 전용)</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름 또는 이메일"
                className="w-full pl-11 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Cohort Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              기수
            </label>
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              {cohorts.map((cohort) => (
                <option key={cohort.id} value={cohort.id}>
                  {cohort.name}
                </option>
              ))}
            </select>
          </div>

          {/* Day Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              DAY
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  DAY {day}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              완료 상태
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="completed">완료</option>
              <option value="incomplete">미완료</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-4">
          <p className="text-sm text-slate-600">
            전체 기록: <span className="font-semibold text-slate-900">{records.length}</span>개
          </p>
          <p className="text-sm text-slate-600">
            완료: <span className="font-semibold text-green-600">{stats.completed}</span>개
          </p>
          <p className="text-sm text-slate-600">
            총 행동: <span className="font-semibold text-blue-600">{stats.totalActions}</span>개
          </p>
          <p className="text-sm text-slate-600">
            필터링 결과: <span className="font-semibold text-slate-900">{filteredRecords.length}</span>개
          </p>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">사용자</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">기수</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">DAY</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">자기돌봄</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">타인친절</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">완료</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">상세</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    로딩 중...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    기록이 없습니다
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <>
                    <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{record.user?.name || '-'}</p>
                          <p className="text-xs text-slate-500">{record.user?.email || '-'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-900">{record.cohort?.name || '-'}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700">
                          DAY {record.day}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800">
                          <Heart className="w-3 h-3" />
                          {record.selfCareActions.length}개
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          <Sparkles className="w-3 h-3" />
                          {record.kindnessActions.length}개
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {record.isCompleted ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            완료
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            진행중
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto"
                        >
                          {expandedRecord === record.id ? '접기' : '보기'}
                          {expandedRecord === record.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRecord === record.id && (
                      <tr className="bg-slate-50">
                        <td colSpan={7} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Self Care Actions */}
                            <div>
                              <h4 className="text-sm font-semibold text-pink-700 mb-3 flex items-center gap-2">
                                <Heart className="w-4 h-4" />
                                자기돌봄 ({record.selfCareActions.length}개)
                              </h4>
                              {record.selfCareActions.length === 0 ? (
                                <p className="text-sm text-slate-500">기록된 행동이 없습니다</p>
                              ) : (
                                <div className="space-y-2">
                                  {record.selfCareActions.map((action, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-pink-100">
                                      <p className="text-sm font-medium text-slate-900">
                                        {action.label}
                                        {action.isCustom && (
                                          <span className="ml-2 text-xs text-pink-500">(직접 추가)</span>
                                        )}
                                      </p>
                                      {action.memo && (
                                        <p className="text-xs text-slate-500 mt-1 italic">"{action.memo}"</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Kindness Actions */}
                            <div>
                              <h4 className="text-sm font-semibold text-purple-700 mb-3 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                타인친절 ({record.kindnessActions.length}개)
                              </h4>
                              {record.kindnessActions.length === 0 ? (
                                <p className="text-sm text-slate-500">기록된 행동이 없습니다</p>
                              ) : (
                                <div className="space-y-2">
                                  {record.kindnessActions.map((action, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-purple-100">
                                      <p className="text-sm font-medium text-slate-900">
                                        {action.label}
                                        {action.isCustom && (
                                          <span className="ml-2 text-xs text-purple-500">(직접 추가)</span>
                                        )}
                                      </p>
                                      {action.memo && (
                                        <p className="text-xs text-slate-500 mt-1 italic">"{action.memo}"</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quote */}
                          {record.quote && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                              <p className="text-sm text-slate-700">
                                <span className="font-semibold text-blue-700">받은 문구:</span> "{record.quote}"
                              </p>
                            </div>
                          )}

                          {/* Meta */}
                          <div className="mt-4 text-xs text-slate-400">
                            기록일시: {record.createdAt.toLocaleString('ko-KR')}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
