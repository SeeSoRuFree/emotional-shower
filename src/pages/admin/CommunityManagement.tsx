import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, MessageSquare, Heart, Quote } from 'lucide-react';
import { useCohortStore } from '@/store/cohortStore';
import { supabase } from '@/lib/supabase';

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  anonymousName: string;
  likes: number;
  isSystemQuote: boolean;
  createdAt: Date;
}

interface Post {
  id: string;
  userId: string;
  cohortId: string;
  roomId: string;
  content: string;
  anonymousName: string;
  avatar: string;
  likes: number;
  recommendedQuote?: string;
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
  comments: Comment[];
}

// Room themes mapping
const ROOM_THEMES: Record<string, { label: string; color: string }> = {
  celebration: { label: '축하', color: 'bg-yellow-100 text-yellow-800' },
  gratitude: { label: '감사', color: 'bg-green-100 text-green-800' },
  anxiety: { label: '불안', color: 'bg-blue-100 text-blue-800' },
  tiredness: { label: '피로', color: 'bg-purple-100 text-purple-800' },
  anger: { label: '분노', color: 'bg-red-100 text-red-800' },
};

export default function CommunityManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const { cohorts, loadCohorts } = useCohortStore();

  // Load cohorts
  useEffect(() => {
    loadCohorts();
  }, [loadCohorts]);

  // Load community posts from Supabase
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('community_posts')
          .select(`
            *,
            users(id, name, email),
            cohorts(id, name),
            community_comments(*)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to load community posts:', error);
          setPosts([]);
          return;
        }

        const mappedPosts: Post[] = (data || []).map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          cohortId: row.cohort_id,
          roomId: row.room_id,
          content: row.content,
          anonymousName: row.anonymous_name,
          avatar: row.avatar,
          likes: row.likes || 0,
          recommendedQuote: row.recommended_quote,
          createdAt: new Date(row.created_at),
          user: row.users ? {
            id: row.users.id,
            name: row.users.name,
            email: row.users.email
          } : undefined,
          cohort: row.cohorts ? {
            id: row.cohorts.id,
            name: row.cohorts.name
          } : undefined,
          comments: (row.community_comments || []).map((comment: any) => ({
            id: comment.id,
            postId: comment.post_id,
            userId: comment.user_id,
            content: comment.content,
            anonymousName: comment.anonymous_name,
            likes: comment.likes || 0,
            isSystemQuote: comment.is_system_quote || false,
            createdAt: new Date(comment.created_at)
          }))
        }));

        setPosts(mappedPosts);
      } catch (error) {
        console.error('Failed to load community posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Filter posts
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by cohort
    if (selectedCohort !== 'all') {
      filtered = filtered.filter(p => p.cohortId === selectedCohort);
    }

    // Filter by room
    if (selectedRoom !== 'all') {
      filtered = filtered.filter(p => p.roomId === selectedRoom);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.content.toLowerCase().includes(query) ||
        p.anonymousName.toLowerCase().includes(query) ||
        p.user?.name.toLowerCase().includes(query) ||
        p.user?.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [posts, selectedCohort, selectedRoom, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const totalComments = posts.reduce((sum, p) => sum + p.comments.length, 0);
    const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
    return { totalComments, totalLikes };
  }, [posts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">커뮤니티 관리</h2>
        <p className="text-sm text-slate-500 mt-1">커뮤니티 게시글과 댓글을 확인합니다 (조회 전용)</p>
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
                placeholder="내용 또는 작성자"
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

          {/* Room Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              방 유형
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              {Object.entries(ROOM_THEMES).map(([id, theme]) => (
                <option key={id} value={id}>
                  {theme.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap gap-4">
          <p className="text-sm text-slate-600">
            전체 게시글: <span className="font-semibold text-slate-900">{posts.length}</span>개
          </p>
          <p className="text-sm text-slate-600">
            총 댓글: <span className="font-semibold text-blue-600">{stats.totalComments}</span>개
          </p>
          <p className="text-sm text-slate-600">
            총 좋아요: <span className="font-semibold text-pink-600">{stats.totalLikes}</span>개
          </p>
          <p className="text-sm text-slate-600">
            필터링 결과: <span className="font-semibold text-slate-900">{filteredPosts.length}</span>개
          </p>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">작성자</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">기수</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">방</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">내용</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">좋아요</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">댓글</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">작성일</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">상세</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    로딩 중...
                  </td>
                </tr>
              ) : filteredPosts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    게시글이 없습니다
                  </td>
                </tr>
              ) : (
                filteredPosts.map((post) => (
                  <>
                    <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{post.anonymousName}</p>
                          <p className="text-xs text-slate-400">{post.user?.email || '-'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-900">{post.cohort?.name || '-'}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ROOM_THEMES[post.roomId]?.color || 'bg-slate-100 text-slate-700'}`}>
                          {ROOM_THEMES[post.roomId]?.label || post.roomId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-900 line-clamp-2 max-w-xs">
                          {post.content}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm text-pink-600">
                          <Heart className="w-4 h-4" />
                          {post.likes}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm text-blue-600">
                          <MessageSquare className="w-4 h-4" />
                          {post.comments.length}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs text-slate-500">
                          {post.createdAt.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto"
                        >
                          {expandedPost === post.id ? '접기' : '보기'}
                          {expandedPost === post.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedPost === post.id && (
                      <tr className="bg-slate-50">
                        <td colSpan={8} className="p-6">
                          {/* Full Post Content */}
                          <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                                {post.avatar || post.anonymousName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{post.anonymousName}</p>
                                <p className="text-xs text-slate-500">{post.createdAt.toLocaleString('ko-KR')}</p>
                              </div>
                            </div>
                            <p className="text-slate-800 whitespace-pre-wrap">{post.content}</p>
                          </div>

                          {/* Recommended Quote */}
                          {post.recommendedQuote && (
                            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200 mb-4">
                              <div className="flex items-start gap-2">
                                <Quote className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800 italic">"{post.recommendedQuote}"</p>
                              </div>
                            </div>
                          )}

                          {/* Comments */}
                          <div>
                            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              댓글 ({post.comments.length}개)
                            </h4>
                            {post.comments.length === 0 ? (
                              <p className="text-sm text-slate-500">댓글이 없습니다</p>
                            ) : (
                              <div className="space-y-2">
                                {post.comments
                                  .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                                  .map((comment) => (
                                    <div
                                      key={comment.id}
                                      className={`p-3 rounded-lg border ${
                                        comment.isSystemQuote
                                          ? 'bg-blue-50 border-blue-200'
                                          : 'bg-white border-slate-200'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                          <span className={`text-sm font-medium ${
                                            comment.isSystemQuote ? 'text-blue-700' : 'text-slate-900'
                                          }`}>
                                            {comment.anonymousName}
                                          </span>
                                          {comment.isSystemQuote && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                              시스템
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-400">
                                          <span className="flex items-center gap-1">
                                            <Heart className="w-3 h-3" />
                                            {comment.likes}
                                          </span>
                                          <span>{comment.createdAt.toLocaleDateString('ko-KR')}</span>
                                        </div>
                                      </div>
                                      <p className={`text-sm ${
                                        comment.isSystemQuote ? 'text-blue-800 italic' : 'text-slate-700'
                                      }`}>
                                        {comment.isSystemQuote ? `"${comment.content}"` : comment.content}
                                      </p>
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
