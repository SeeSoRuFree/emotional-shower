import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Interfaces
export interface Comment {
  id: string;
  author: string;
  content: string;
  time: string;
  timestamp: number;
  likes: number;
  isSystemQuote?: boolean;
}

export interface Post {
  id: string;
  roomId: string;
  cohortId: string;
  author: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: Comment[];
  time: string;
  timestamp: number;
  avatar: string;
  recommendedQuote?: string;
}

export interface CohortStats {
  totalUsers: number;
  todayCompleted: number;
  todayCompletionRate: number;
  perfectStreakUsers: number;
  averageStamps: number;
  topUsers: Array<{
    rank: number;
    name: string;
    stamps: number;
    avatar: string;
  }>;
}

interface CommunityStore {
  posts: Post[];
  loading: boolean;
  initialized: boolean;

  // Actions
  loadPosts: (cohortId: string, roomId?: string) => Promise<void>;
  loadAllPosts: (cohortId: string) => Promise<void>;
  addPost: (cohortId: string, roomId: string, content: string, recommendedQuote?: string, imageUrl?: string) => Promise<Post | null>;
  addComment: (postId: string, content: string) => Promise<boolean>;
  incrementPostLikes: (postId: string) => Promise<boolean>;
  incrementCommentLikes: (commentId: string) => Promise<boolean>;
  loadCohortStats: (cohortId: string, userStamps: number) => Promise<CohortStats | null>;

  // Utility functions
  formatTimeAgo: (timestamp: number) => string;
  generateAnonymousName: () => string;
  getRandomAvatar: () => string;
}

// Utility: Time formatter
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));

  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}주 전`;
};

// Utility: Random avatar
const getRandomAvatar = (): string => {
  const avatars = ['🌟', '🎯', '🍳', '☕', '⭐', '🌊', '🌃', '🍃', '☁️', '⚡', '🌋', '💫', '🔥', '🌸', '🌈', '⚡'];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

// Utility: Anonymous name generator
const generateAnonymousName = (): string => {
  const adjectives = ['따뜻한', '차분한', '밝은', '소중한', '평온한', '용감한', '지혜로운', '친절한', '희망찬', '감사한'];
  const nouns = ['마음', '영혼', '햇살', '구름', '바람', '별빛', '향기', '미소', '행복', '평화'];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999) + 1;

  return `${adj}${noun}${num}`;
};

// Load cohort stats from Supabase (real data)
const loadCohortStatsFromDB = async (cohortId: string, userStamps: number): Promise<CohortStats | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 1. 기수 참여자 수 조회
    const { data: userCohortsData, error: userCohortsError } = await supabase
      .from('user_cohorts')
      .select('user_id')
      .eq('cohort_id', cohortId);

    if (userCohortsError) {
      console.error('Failed to load user_cohorts:', userCohortsError);
      return null;
    }

    const totalUsers = userCohortsData?.length || 0;
    if (totalUsers === 0) {
      return {
        totalUsers: 0,
        todayCompleted: 0,
        todayCompletionRate: 0,
        perfectStreakUsers: 0,
        averageStamps: 0,
        topUsers: []
      };
    }

    // 2. 모든 챌린지 데이터 조회 (해당 기수)
    const { data: challengesData, error: challengesError } = await supabase
      .from('challenges')
      .select('user_id, completed_days, status')
      .eq('cohort_id', cohortId)
      .in('status', ['active', 'completed']);

    if (challengesError) {
      console.error('Failed to load challenges:', challengesError);
      return null;
    }

    // 3. 오늘 기록 완료한 사용자 수 (daily_records에서 오늘 날짜 기록 조회)
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    const { data: todayRecordsData, error: todayRecordsError } = await supabase
      .from('daily_records')
      .select('user_id')
      .eq('cohort_id', cohortId)
      .eq('is_completed', true)
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd);

    if (todayRecordsError) {
      console.error('Failed to load today records:', todayRecordsError);
    }

    // 중복 제거한 오늘 완료 사용자 수
    const todayCompletedUserIds = new Set(todayRecordsData?.map(r => r.user_id) || []);
    const todayCompleted = todayCompletedUserIds.size;

    // 4. 스탬프 통계 계산
    const challenges = challengesData || [];
    let totalStamps = 0;
    let perfectStreakUsers = 0;

    // 사용자별 스탬프 정보 (TOP 5용)
    const userStampsMap: Array<{ userId: string; stamps: number }> = [];

    challenges.forEach(challenge => {
      const stamps = challenge.completed_days?.length || 0;
      totalStamps += stamps;
      userStampsMap.push({ userId: challenge.user_id, stamps });

      // 연속 기록자 (현재 진행 일수와 완료 일수가 같은 사용자)
      // completed_days 배열이 1부터 연속된 숫자인지 체크
      const completedDays = challenge.completed_days || [];
      if (completedDays.length > 0) {
        const sortedDays = [...completedDays].sort((a, b) => a - b);
        const expectedDays = sortedDays.length;
        const isConsecutive = sortedDays.every((day, idx) => day === idx + 1);
        if (isConsecutive && expectedDays === sortedDays[sortedDays.length - 1]) {
          perfectStreakUsers++;
        }
      }
    });

    const averageStamps = challenges.length > 0 ? totalStamps / challenges.length : 0;

    // 5. TOP 5 사용자 조회 (이름 포함)
    userStampsMap.sort((a, b) => b.stamps - a.stamps);
    const top5UserIds = userStampsMap.slice(0, 5).map(u => u.userId);

    // 사용자 이름 조회
    const { data: usersData } = await supabase
      .from('users')
      .select('id, name')
      .in('id', top5UserIds);

    const userNameMap = new Map(usersData?.map(u => [u.id, u.name]) || []);

    const topUsers = userStampsMap.slice(0, 5).map((u, index) => {
      const isCurrentUser = u.userId === user.id;
      return {
        rank: index + 1,
        name: isCurrentUser ? '나' : (userNameMap.get(u.userId) || '익명'),
        stamps: u.stamps,
        avatar: isCurrentUser ? '⭐' : getRandomAvatar()
      };
    });

    // 현재 사용자가 TOP 5에 없으면 추가
    const currentUserInTop = topUsers.find(u => u.name === '나');
    if (!currentUserInTop && userStamps > 0) {
      const currentUserRank = userStampsMap.findIndex(u => u.userId === user.id) + 1;
      if (currentUserRank > 5) {
        topUsers.push({
          rank: currentUserRank,
          name: '나',
          stamps: userStamps,
          avatar: '⭐'
        });
      }
    }

    return {
      totalUsers,
      todayCompleted,
      todayCompletionRate: totalUsers > 0 ? Math.round((todayCompleted / totalUsers) * 100) : 0,
      perfectStreakUsers,
      averageStamps: Math.round(averageStamps * 10) / 10,
      topUsers
    };
  } catch (error) {
    console.error('Load cohort stats error:', error);
    return null;
  }
};

export const useCommunityStore = create<CommunityStore>((set, get) => ({
  posts: [],
  loading: false,
  initialized: false,

  // Load posts from Supabase (with optional roomId filter)
  loadPosts: async (cohortId: string, roomId?: string) => {
    try {
      set({ loading: true });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ posts: [], loading: false, initialized: true });
        return;
      }

      // Build query
      let query = supabase
        .from('community_posts')
        .select('*, community_comments(*)')
        .eq('cohort_id', cohortId)
        .order('created_at', { ascending: false });

      // Add roomId filter if provided
      if (roomId) {
        query = query.eq('room_id', roomId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to load posts:', error);
        set({ loading: false });
        return;
      }

      // Transform database rows to Post objects
      const posts: Post[] = (data || []).map(row => {
        const timestamp = new Date(row.created_at).getTime();

        // Transform comments
        const comments: Comment[] = (row.community_comments || [])
          .map((comment: any) => ({
            id: comment.id,
            author: comment.anonymous_name,
            content: comment.content,
            time: formatTimeAgo(new Date(comment.created_at).getTime()),
            timestamp: new Date(comment.created_at).getTime(),
            likes: comment.likes,
            isSystemQuote: comment.is_system_quote || false
          }))
          .sort((a: Comment, b: Comment) => a.timestamp - b.timestamp); // Oldest first for comments

        return {
          id: row.id,
          roomId: row.room_id,
          cohortId: row.cohort_id,
          author: row.anonymous_name,
          content: row.content,
          imageUrl: row.image_url || undefined,
          likes: row.likes,
          comments,
          time: formatTimeAgo(timestamp),
          timestamp,
          avatar: row.avatar,
          recommendedQuote: row.recommended_quote || undefined
        };
      });

      set({ posts, loading: false, initialized: true });
    } catch (error) {
      console.error('Load posts error:', error);
      set({ loading: false });
    }
  },

  // Load all posts from all rooms in the cohort (unified feed)
  loadAllPosts: async (cohortId: string) => {
    try {
      set({ loading: true });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ posts: [], loading: false, initialized: true });
        return;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .select('*, community_comments(*)')
        .eq('cohort_id', cohortId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load all posts:', error);
        set({ loading: false });
        return;
      }

      const posts: Post[] = (data || []).map(row => {
        const timestamp = new Date(row.created_at).getTime();

        const comments: Comment[] = (row.community_comments || [])
          .map((comment: any) => ({
            id: comment.id,
            author: comment.anonymous_name,
            content: comment.content,
            time: formatTimeAgo(new Date(comment.created_at).getTime()),
            timestamp: new Date(comment.created_at).getTime(),
            likes: comment.likes,
            isSystemQuote: comment.is_system_quote || false
          }))
          .sort((a: Comment, b: Comment) => a.timestamp - b.timestamp);

        return {
          id: row.id,
          roomId: row.room_id,
          cohortId: row.cohort_id,
          author: row.anonymous_name,
          content: row.content,
          imageUrl: row.image_url || undefined,
          likes: row.likes,
          comments,
          time: formatTimeAgo(timestamp),
          timestamp,
          avatar: row.avatar,
          recommendedQuote: row.recommended_quote || undefined
        };
      });

      set({ posts, loading: false, initialized: true });
    } catch (error) {
      console.error('Load all posts error:', error);
      set({ loading: false });
    }
  },

  // Add new post
  addPost: async (cohortId: string, roomId: string, content: string, recommendedQuote?: string, imageUrl?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // 사용자 이름 조회
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single();

      const anonymousName = userData?.name || '익명 사용자';
      const avatar = getRandomAvatar();

      // Insert post
      const { data: newPost, error: postError } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          cohort_id: cohortId,
          room_id: roomId,
          content: content.trim(),
          image_url: imageUrl || null,
          recommended_quote: recommendedQuote || null,
          anonymous_name: anonymousName,
          avatar: avatar
        })
        .select()
        .single();

      if (postError) {
        console.error('Failed to add post:', postError);
        return null;
      }

      const post: Post = {
        id: newPost.id,
        roomId: newPost.room_id,
        cohortId: newPost.cohort_id,
        author: newPost.anonymous_name,
        content: newPost.content,
        imageUrl: newPost.image_url || undefined,
        likes: newPost.likes,
        comments: [],
        time: '방금 전',
        timestamp: new Date(newPost.created_at).getTime(),
        avatar: newPost.avatar,
        recommendedQuote: newPost.recommended_quote || undefined
      };

      // If there's a recommended quote, add it as a system comment
      if (recommendedQuote) {
        const { data: systemComment, error: commentError } = await supabase
          .from('community_comments')
          .insert({
            post_id: newPost.id,
            user_id: user.id,
            content: recommendedQuote,
            is_system_quote: true,
            anonymous_name: '마음의 명언'
          })
          .select()
          .single();

        if (!commentError && systemComment) {
          post.comments.push({
            id: systemComment.id,
            author: '마음의 명언',
            content: systemComment.content,
            time: '방금 전',
            timestamp: new Date(systemComment.created_at).getTime(),
            likes: systemComment.likes,
            isSystemQuote: true
          });
        }
      }

      // Add to local state (prepend to keep newest first)
      set({ posts: [post, ...get().posts] });

      return post;
    } catch (error) {
      console.error('Add post error:', error);
      return null;
    }
  },

  // Add comment to a post
  addComment: async (postId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // 사용자 이름 조회
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single();

      const anonymousName = userData?.name || '익명 사용자';

      const { data: newComment, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
          anonymous_name: anonymousName,
          is_system_quote: false
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to add comment:', error);
        return false;
      }

      // Update local state
      const posts = get().posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: newComment.id,
                author: newComment.anonymous_name,
                content: newComment.content,
                time: '방금 전',
                timestamp: new Date(newComment.created_at).getTime(),
                likes: newComment.likes,
                isSystemQuote: false
              }
            ]
          };
        }
        return post;
      });

      set({ posts });
      return true;
    } catch (error) {
      console.error('Add comment error:', error);
      return false;
    }
  },

  // Increment post likes using RPC function
  incrementPostLikes: async (postId: string) => {
    try {
      const { error } = await supabase.rpc('increment_post_likes', {
        post_id: postId
      });

      if (error) {
        console.error('Failed to increment post likes:', error);
        return false;
      }

      // Update local state
      const posts = get().posts.map(post => {
        if (post.id === postId) {
          return { ...post, likes: post.likes + 1 };
        }
        return post;
      });

      set({ posts });
      return true;
    } catch (error) {
      console.error('Increment post likes error:', error);
      return false;
    }
  },

  // Increment comment likes using RPC function
  incrementCommentLikes: async (commentId: string) => {
    try {
      const { error } = await supabase.rpc('increment_comment_likes', {
        comment_id: commentId
      });

      if (error) {
        console.error('Failed to increment comment likes:', error);
        return false;
      }

      // Update local state
      const posts = get().posts.map(post => ({
        ...post,
        comments: post.comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, likes: comment.likes + 1 };
          }
          return comment;
        })
      }));

      set({ posts });
      return true;
    } catch (error) {
      console.error('Increment comment likes error:', error);
      return false;
    }
  },

  // Load cohort stats from DB
  loadCohortStats: loadCohortStatsFromDB,

  // Utility functions (exposed for components)
  formatTimeAgo,
  generateAnonymousName,
  getRandomAvatar
}));
