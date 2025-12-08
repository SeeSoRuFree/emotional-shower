import { useState, useEffect, useMemo } from 'react';
import { Users, TrendingUp, CheckCircle, MessageSquare } from 'lucide-react';
import { useCohortStore } from '@/store/cohortStore';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CommunityPost {
  id: string;
  content: string;
  anonymous_name: string;
  created_at: string;
  community_comments: { id: string }[];
}

export default function AdminDashboard() {
  const { cohorts } = useCohortStore();
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allChallenges, setAllChallenges] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // users 테이블에서 사용자 목록
        const { data: usersData } = await supabase
          .from('users')
          .select('*');

        // challenges 테이블에서 챌린지 목록
        const { data: challengesData } = await supabase
          .from('challenges')
          .select('*');

        // community_posts 테이블에서 게시글 목록
        const { data: postsData } = await supabase
          .from('community_posts')
          .select('*, community_comments(id)')
          .order('created_at', { ascending: false });

        setAllUsers(usersData || []);
        setAllChallenges(challengesData || []);
        setAllPosts(postsData || []);
      } catch (error) {
        console.error('Failed to load admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const activeChallenges = allChallenges.filter((c: any) => c.status === 'active').length;
    const completedChallenges = allChallenges.filter((c: any) => c.status === 'completed').length;
    const totalPosts = allPosts.length;
    const totalComments = allPosts.reduce((sum, post) => sum + (post.community_comments?.length || 0), 0);

    // Cohort completion rates for chart
    const cohortData = cohorts.map(cohort => {
      const cohortChallenges = allChallenges.filter((c: any) => c.cohort_id === cohort.id);
      const completed = cohortChallenges.filter((c: any) => c.status === 'completed').length;
      const active = cohortChallenges.filter((c: any) => c.status === 'active').length;
      const total = cohortChallenges.length || 1;

      return {
        name: cohort.name,
        완료: Math.round((completed / total) * 100),
        진행중: Math.round((active / total) * 100),
      };
    });

    return {
      totalUsers: allUsers.length,
      activeChallenges,
      completedChallenges,
      completionRate: allChallenges.length > 0
        ? Math.round((completedChallenges / allChallenges.length) * 100)
        : 0,
      totalPosts,
      totalComments,
      cohortData
    };
  }, [allUsers, allChallenges, allPosts, cohorts]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">총 사용자</h3>
          <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
          <p className="text-xs text-slate-500 mt-2">전체 가입자 수</p>
        </div>

        {/* Active Challenges */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">진행 중</h3>
          <p className="text-3xl font-bold text-slate-900">{stats.activeChallenges}</p>
          <p className="text-xs text-slate-500 mt-2">현재 챌린지 진행 중</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">완료율</h3>
          <p className="text-3xl font-bold text-slate-900">{stats.completionRate}%</p>
          <p className="text-xs text-slate-500 mt-2">{stats.completedChallenges}명 완료</p>
        </div>

        {/* Total Posts */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">게시글</h3>
          <p className="text-3xl font-bold text-slate-900">{stats.totalPosts}</p>
          <p className="text-xs text-slate-500 mt-2">{stats.totalComments}개 댓글</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cohort Completion Rate Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">기수별 진행 현황</h3>
          {stats.cohortData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.cohortData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="완료" fill="#10b981" />
                <Bar dataKey="진행중" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              데이터가 없습니다
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">최근 활동</h3>
          <div className="space-y-3">
            {allPosts.slice(0, 5).map((post, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-700">
                    {post.anonymous_name?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{post.anonymous_name || '익명'}</p>
                  <p className="text-xs text-slate-600 truncate">{post.content}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(post.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
            {allPosts.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                {loading ? '로딩 중...' : '아직 활동이 없습니다'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cohort Summary Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">기수 현황</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">기수명</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">상태</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">기록 항목</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">참여자</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">시작일</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">종료일</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort) => {
                const cohortUsers = allUsers.filter((u: any) => u.current_cohort_id === cohort.id);
                return (
                  <tr key={cohort.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-sm font-medium text-slate-900">{cohort.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        cohort.status === 'active' ? 'bg-green-100 text-green-800' :
                        cohort.status === 'recruiting' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {cohort.status === 'active' ? '진행 중' :
                         cohort.status === 'recruiting' ? '모집 중' :
                         '종료'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {cohort.recordType === 'both' ? '둘다' :
                         cohort.recordType === 'self_care_only' ? '자기돌봄' :
                         cohort.recordType === 'kindness_only' ? '타인친절' :
                         '둘다'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{cohortUsers.length}명</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(cohort.startDate).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(cohort.endDate).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {cohorts.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              등록된 기수가 없습니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
