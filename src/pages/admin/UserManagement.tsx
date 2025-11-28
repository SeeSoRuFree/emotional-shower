import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Mail, Calendar, User as UserIcon } from 'lucide-react';
import { useCohortStore } from '@/store/cohortStore';

interface User {
  id: string;
  name: string;
  email: string;
  currentCohortId: string | null;
  cohortHistory: any[];
  createdAt: Date;
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const { cohorts } = useCohortStore();

  // Load users from localStorage
  const allUsers = useMemo(() => {
    try {
      const stored = localStorage.getItem('kindness-users');
      if (stored) {
        return JSON.parse(stored).map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
          cohortHistory: user.cohortHistory || []
        }));
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
    return [];
  }, []);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let filtered = allUsers;

    // Filter by cohort
    if (selectedCohort !== 'all') {
      filtered = filtered.filter((u: User) => u.currentCohortId === selectedCohort);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((u: User) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a: User, b: User) => {
      let compareResult = 0;
      if (sortBy === 'name') {
        compareResult = a.name.localeCompare(b.name);
      } else if (sortBy === 'email') {
        compareResult = a.email.localeCompare(b.email);
      } else if (sortBy === 'createdAt') {
        compareResult = a.createdAt.getTime() - b.createdAt.getTime();
      }
      return sortOrder === 'asc' ? compareResult : -compareResult;
    });

    return filtered;
  }, [allUsers, selectedCohort, searchQuery, sortBy, sortOrder]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getCohortName = (cohortId: string | null) => {
    if (!cohortId) return '-';
    const cohort = cohorts.find(c => c.id === cohortId);
    return cohort ? cohort.name : cohortId;
  };

  const SortIcon = ({ field }: { field: typeof sortBy }) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            전체 사용자: <span className="font-semibold text-slate-900">{allUsers.length}</span>명 /
            필터링 결과: <span className="font-semibold text-slate-900">{filteredUsers.length}</span>명
          </p>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
                  >
                    이름
                    <SortIcon field="name" />
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
                  >
                    이메일
                    <SortIcon field="email" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                  현재 기수
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                  참여 기수
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
                  >
                    가입일
                    <SortIcon field="createdAt" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                  상세
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    검색 결과가 없습니다
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: User) => (
                  <>
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-blue-700" />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-900">
                          {getCohortName(user.currentCohortId)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.cohortHistory.length}개 기수
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {user.createdAt.toLocaleDateString('ko-KR')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {expandedUser === user.id ? '접기' : '보기'}
                        </button>
                      </td>
                    </tr>
                    {expandedUser === user.id && (
                      <tr className="bg-slate-50">
                        <td colSpan={6} className="p-6">
                          <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900">기수 참여 이력</h4>
                            {user.cohortHistory.length === 0 ? (
                              <p className="text-sm text-slate-500">참여 이력이 없습니다</p>
                            ) : (
                              <div className="space-y-2">
                                {user.cohortHistory.map((history: any, index: number) => (
                                  <div
                                    key={index}
                                    className="bg-white p-4 rounded-lg border border-slate-200"
                                  >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div>
                                        <p className="text-xs text-slate-500 mb-1">기수</p>
                                        <p className="text-sm font-medium text-slate-900">
                                          {getCohortName(history.cohortId)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 mb-1">상태</p>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                          history.status === 'active' ? 'bg-green-100 text-green-800' :
                                          history.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                          'bg-red-100 text-red-800'
                                        }`}>
                                          {history.status === 'active' ? '진행 중' :
                                           history.status === 'completed' ? '완료' : '실패'}
                                        </span>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 mb-1">참여일</p>
                                        <p className="text-sm text-slate-900">
                                          {new Date(history.joinedAt).toLocaleDateString('ko-KR')}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
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
