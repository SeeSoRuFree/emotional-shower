import { useMemo } from 'react';
import { TrendingUp, Users, Award, MessageSquare } from 'lucide-react';
import { useCohortStore } from '@/store/cohortStore';
import { loadAllPosts } from '@/utils/communityStorage';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Statistics() {
  const { cohorts } = useCohortStore();

  // Load all data
  const loadUsers = () => {
    try {
      const stored = localStorage.getItem('kindness-users');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  };

  const loadChallenges = () => {
    try {
      const stored = localStorage.getItem('kindness-daily-records');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  };

  const allUsers = useMemo(() => loadUsers(), []);
  const allChallenges = useMemo(() => loadChallenges(), []);
  const allPosts = useMemo(() => loadAllPosts(), []);

  // Calculate statistics
  const stats = useMemo(() => {
    // User growth over time (last 30 days)
    const today = new Date();
    const userGrowth = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i) * 5);
      const count = allUsers.filter((u: any) =>
        new Date(u.createdAt) <= date
      ).length;
      return {
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        users: count
      };
    });

    // Challenge completion by cohort
    const cohortStats = cohorts.map(cohort => {
      const cohortChallenges = allChallenges.filter((c: any) => c.cohortId === cohort.id);
      const completed = cohortChallenges.filter((c: any) => c.status === 'completed').length;
      const active = cohortChallenges.filter((c: any) => c.status === 'active').length;
      const failed = cohortChallenges.filter((c: any) => c.status === 'failed').length;

      return {
        name: cohort.name,
        완료: completed,
        진행중: active,
        실패: failed
      };
    });

    // User distribution by cohort (pie chart)
    const cohortDistribution = cohorts.map(cohort => {
      const count = allUsers.filter((u: any) => u.currentCohortId === cohort.id).length;
      return {
        name: cohort.name,
        value: count
      };
    }).filter(c => c.value > 0);

    // Community engagement
    const totalPosts = allPosts.length;
    const totalComments = allPosts.reduce((sum, post) => sum + post.comments.length, 0);
    const avgCommentsPerPost = totalPosts > 0 ? (totalComments / totalPosts).toFixed(1) : 0;

    // Top contributors (most posts)
    const postsByUser = allPosts.reduce((acc: any, post) => {
      acc[post.anonymousName] = (acc[post.anonymousName] || 0) + 1;
      return acc;
    }, {});

    const topContributors = Object.entries(postsByUser)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, posts: count }));

    // Daily activity (posts per day, last 7 days)
    const dailyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];

      const postsCount = allPosts.filter(post =>
        post.timestamp.startsWith(dateStr)
      ).length;

      return {
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        posts: postsCount
      };
    });

    return {
      userGrowth,
      cohortStats,
      cohortDistribution,
      totalPosts,
      totalComments,
      avgCommentsPerPost,
      topContributors,
      dailyActivity
    };
  }, [allUsers, allChallenges, allPosts, cohorts]);

  return (
    <div className="space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">총 사용자</h3>
          <p className="text-3xl font-bold text-slate-900">{allUsers.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">완료된 챌린지</h3>
          <p className="text-3xl font-bold text-slate-900">
            {allChallenges.filter((c: any) => c.status === 'completed').length}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">커뮤니티 게시글</h3>
          <p className="text-3xl font-bold text-slate-900">{stats.totalPosts}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">평균 댓글 수</h3>
          <p className="text-3xl font-bold text-slate-900">{stats.avgCommentsPerPost}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">사용자 증가 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#3b82f6"
                strokeWidth={2}
                name="누적 사용자"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cohort Distribution */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">기수별 사용자 분포</h3>
          {stats.cohortDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.cohortDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.cohortDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              데이터가 없습니다
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cohort Progress */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">기수별 챌린지 현황</h3>
          {stats.cohortStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.cohortStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="완료" fill="#10b981" />
                <Bar dataKey="진행중" fill="#3b82f6" />
                <Bar dataKey="실패" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              데이터가 없습니다
            </div>
          )}
        </div>

        {/* Daily Activity */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">일일 게시글 활동</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="posts" fill="#8b5cf6" name="게시글 수" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">TOP 5 활동 사용자</h3>
        {stats.topContributors.length > 0 ? (
          <div className="space-y-3">
            {stats.topContributors.map((contributor: any, index: number) => (
              <div
                key={contributor.name}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-slate-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{contributor.name}</p>
                    <p className="text-sm text-slate-500">{contributor.posts}개 게시글</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((contributor.posts / stats.topContributors[0].posts) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            아직 활동이 없습니다
          </div>
        )}
      </div>

      {/* Engagement Summary */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">커뮤니티 참여도</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">{stats.totalPosts}</p>
            <p className="text-sm text-slate-600">총 게시글</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">{stats.totalComments}</p>
            <p className="text-sm text-slate-600">총 댓글</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-600 mb-2">
              {stats.totalPosts > 0 ? Math.round((stats.totalComments / stats.totalPosts) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-600">참여율</p>
          </div>
        </div>
      </div>
    </div>
  );
}
