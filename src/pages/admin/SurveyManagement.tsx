import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Eye, X, ClipboardList } from 'lucide-react';
import { useCohortStore } from '@/store/cohortStore';
import { supabase } from '@/lib/supabase';
import { SURVEY_QUESTIONS } from '@/store/surveyStore';

interface Survey {
  id: string;
  userId: string;
  cohortId: string;
  type: 'pre' | 'post';
  responses: Record<string, any>;
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

// surveyStore의 SURVEY_QUESTIONS 기반으로 라벨 맵 생성
const QUESTION_LABEL_MAP: Record<string, string> = {
  // Flourishing (14개)
  ...Object.fromEntries(
    SURVEY_QUESTIONS.flourishing.map(q => [q.id, q.text])
  ),
  // Satisfaction (5개)
  ...Object.fromEntries(
    SURVEY_QUESTIONS.satisfaction.map(q => [q.id, q.text])
  ),
  // Compassion (12개)
  ...Object.fromEntries(
    SURVEY_QUESTIONS.compassion.map(q => [q.id, q.text])
  ),
  // Kindness (3개)
  ...Object.fromEntries(
    SURVEY_QUESTIONS.kindness.map(q => [q.id, q.text])
  )
};

export default function SurveyManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'pre' | 'post'>('all');
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  const { cohorts, loadCohorts } = useCohortStore();

  // Load cohorts
  useEffect(() => {
    loadCohorts();
  }, [loadCohorts]);

  // Load surveys from Supabase
  useEffect(() => {
    const loadSurveys = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('surveys')
          .select(`
            *,
            users(id, name, email),
            cohorts(id, name)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to load surveys:', error);
          setSurveys([]);
          return;
        }

        const mappedSurveys: Survey[] = (data || []).map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          cohortId: row.cohort_id,
          type: row.survey_type,
          responses: row.responses || {},
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

        setSurveys(mappedSurveys);
      } catch (error) {
        console.error('Failed to load surveys:', error);
        setSurveys([]);
      } finally {
        setLoading(false);
      }
    };

    loadSurveys();
  }, []);

  // Group surveys by user
  const groupedByUser = useMemo(() => {
    const groups = new Map<string, { user: Survey['user']; cohort: Survey['cohort']; pre?: Survey; post?: Survey }>();

    surveys.forEach(survey => {
      const key = `${survey.userId}-${survey.cohortId}`;
      if (!groups.has(key)) {
        groups.set(key, { user: survey.user, cohort: survey.cohort });
      }
      const group = groups.get(key)!;
      if (survey.type === 'pre') {
        group.pre = survey;
      } else {
        group.post = survey;
      }
    });

    return Array.from(groups.values());
  }, [surveys]);

  // Filter groups
  const filteredGroups = useMemo(() => {
    let filtered = groupedByUser;

    // Filter by cohort
    if (selectedCohort !== 'all') {
      filtered = filtered.filter(g => g.cohort?.id === selectedCohort);
    }

    // Filter by type
    if (selectedType === 'pre') {
      filtered = filtered.filter(g => g.pre);
    } else if (selectedType === 'post') {
      filtered = filtered.filter(g => g.post);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g =>
        g.user?.name.toLowerCase().includes(query) ||
        g.user?.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [groupedByUser, selectedCohort, selectedType, searchQuery]);

  // CSV Download
  const downloadCSV = () => {
    const headers = [
      '사용자명',
      '이메일',
      '기수',
      '설문타입',
      '제출일시',
      ...Object.values(PRE_SURVEY_QUESTIONS),
      ...Object.values(POST_SURVEY_QUESTIONS)
    ];

    const rows = surveys.map(survey => {
      const questions = survey.type === 'pre' ? PRE_SURVEY_QUESTIONS : POST_SURVEY_QUESTIONS;
      const responses = Object.keys(questions).map(key => {
        const value = survey.responses[key];
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return value || '';
      });

      // 빈 칸으로 다른 타입의 질문들 채우기
      const preResponses = survey.type === 'pre' ? responses : Array(Object.keys(PRE_SURVEY_QUESTIONS).length).fill('');
      const postResponses = survey.type === 'post' ? responses : Array(Object.keys(POST_SURVEY_QUESTIONS).length).fill('');

      return [
        survey.user?.name || '',
        survey.user?.email || '',
        survey.cohort?.name || '',
        survey.type === 'pre' ? '사전설문' : '사후설문',
        survey.createdAt.toLocaleString('ko-KR'),
        ...preResponses,
        ...postResponses
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `설문응답_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getQuestionLabel = (questionId: string): string => {
    const label = QUESTION_LABEL_MAP[questionId];
    if (label) return label;

    // 폴백: questionId를 사람이 읽을 수 있는 형태로
    const parts = questionId.split('-');
    if (parts.length === 2) {
      const [category, number] = parts;
      const names: Record<string, string> = {
        flourishing: '번영감',
        satisfaction: '삶의 만족',
        compassion: '자기 자비',
        kindness: '타인 친절'
      };
      return `${names[category] || category} #${number}`;
    }
    return questionId;
  };

  return (
    <div className="space-y-6">
      {/* Header with CSV Download */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">설문 응답 관리</h2>
          <p className="text-sm text-slate-500 mt-1">사전/사후 설문 응답을 확인합니다</p>
        </div>
        <button
          onClick={downloadCSV}
          disabled={surveys.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          CSV 다운로드
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="이름 또는 이메일로 검색"
                className="w-full pl-11 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Cohort Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              기수 필터
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

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              설문 타입
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="pre">사전설문만</option>
              <option value="post">사후설문만</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            전체 응답: <span className="font-semibold text-slate-900">{surveys.length}</span>개 /
            사전설문: <span className="font-semibold text-blue-600">{surveys.filter(s => s.type === 'pre').length}</span>개 /
            사후설문: <span className="font-semibold text-purple-600">{surveys.filter(s => s.type === 'post').length}</span>개
          </p>
        </div>
      </div>

      {/* Survey Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">사용자</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">이메일</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">기수</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">사전설문</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">사후설문</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">상세</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    로딩 중...
                  </td>
                </tr>
              ) : filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    <ClipboardList className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    설문 응답이 없습니다
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-slate-900">
                        {group.user?.name || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-600">
                        {group.user?.email || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-900">
                        {group.cohort?.name || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {group.pre ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          완료
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {group.post ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          완료
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        {group.pre && (
                          <button
                            onClick={() => setSelectedSurvey(group.pre!)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="사전설문 보기"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {group.post && (
                          <button
                            onClick={() => setSelectedSurvey(group.post!)}
                            className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded"
                            title="사후설문 보기"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Survey Detail Modal */}
      {selectedSurvey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className={`p-4 border-b ${selectedSurvey.type === 'pre' ? 'bg-blue-50' : 'bg-purple-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">
                    {selectedSurvey.user?.name}님의 {selectedSurvey.type === 'pre' ? '사전' : '사후'} 설문
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedSurvey.createdAt.toLocaleString('ko-KR')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSurvey(null)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {(() => {
                  let items: Array<{ questionId: string; value: any }> = [];

                  if (Array.isArray(selectedSurvey.responses)) {
                    items = selectedSurvey.responses;
                  } else {
                    items = Object.entries(selectedSurvey.responses).map(([key, value]) => ({
                      questionId: key,
                      value
                    }));
                  }

                  if (items.length === 0) {
                    return <p className="text-sm text-slate-500 text-center">응답 데이터가 없습니다</p>;
                  }

                  return items.map(({ questionId, value }) => (
                    <div key={questionId} className="border-b border-slate-100 pb-4 last:border-0">
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        {getQuestionLabel(questionId)}
                      </p>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-bold text-headspace-blue">
                          {typeof value === 'number' ? value : '-'}
                        </p>
                        {typeof value === 'number' && (
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(level => (
                              <div
                                key={level}
                                className={`w-3 h-3 rounded-full ${
                                  level <= value ? 'bg-headspace-blue' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {typeof value === 'object' && (
                        <p className="text-xs text-slate-500 mt-2 font-mono">
                          {JSON.stringify(value, null, 2)}
                        </p>
                      )}
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
