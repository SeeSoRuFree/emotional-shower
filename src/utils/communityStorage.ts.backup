// 커뮤니티 로컬스토리지 관리 유틸리티

export interface Comment {
  id: string;
  author: string;
  content: string;
  time: string;
  timestamp: number;
  likes: number;
  isSystemQuote?: boolean; // 시스템 추천 명언 여부
}

export interface Post {
  id: string;
  roomId: string;
  cohortId: string;  // 기수 ID 추가
  author: string;
  content: string;
  likes: number;
  comments: Comment[];
  time: string;
  timestamp: number;
  avatar: string;
  recommendedQuote?: string; // 추천 명언
}

// 로컬스토리지 키 생성
const getStorageKey = (roomId: string) => `community_posts_${roomId}`;

// 시간 포맷 함수
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

// 랜덤 아바타 생성
const getRandomAvatar = (): string => {
  const avatars = ['🌟', '🎯', '🍳', '☕', '⭐', '🌊', '🌃', '🍃', '☁️', '⚡', '🌋', '💫', '🔥', '🌸', '🌈', '⚡'];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

// 랜덤 익명 사용자명 생성
const generateAnonymousName = (): string => {
  const adjectives = ['따뜻한', '차분한', '밝은', '소중한', '평온한', '용감한', '지혜로운', '친절한', '희망찬', '감사한'];
  const nouns = ['마음', '영혼', '햇살', '구름', '바람', '별빛', '향기', '미소', '행복', '평화'];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 999) + 1;
  
  return `${adj}${noun}${num}`;
};

// ID 생성 함수
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// 게시글 저장
export const savePosts = (roomId: string, posts: Post[]): void => {
  try {
    const key = getStorageKey(roomId);
    localStorage.setItem(key, JSON.stringify(posts));
  } catch (error) {
    console.error('Failed to save posts:', error);
  }
};

// 게시글 불러오기
export const loadPosts = (roomId: string): Post[] => {
  try {
    const key = getStorageKey(roomId);
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    
    const posts: Post[] = JSON.parse(stored);
    
    // 시간 정보 업데이트 (상대 시간 갱신)
    return posts.map(post => ({
      ...post,
      time: formatTimeAgo(post.timestamp),
      comments: post.comments.map(comment => ({
        ...comment,
        time: formatTimeAgo(comment.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Failed to load posts:', error);
    return [];
  }
};

// 새 게시글 생성
export const createPost = (roomId: string, cohortId: string, content: string, recommendedQuote?: string): Post => {
  const now = Date.now();

  return {
    id: generateId(),
    roomId,
    cohortId,
    author: generateAnonymousName(),
    content: content.trim(),
    likes: 0,
    comments: recommendedQuote ? [{
      id: generateId(),
      author: '마음의 명언',
      content: recommendedQuote,
      time: '방금 전',
      timestamp: now + 1000, // 1초 후에 추가된 것처럼
      likes: 0,
      isSystemQuote: true
    }] : [],
    time: '방금 전',
    timestamp: now,
    avatar: getRandomAvatar(),
    recommendedQuote
  };
};

// 게시글 추가
export const addPost = (roomId: string, cohortId: string, content: string, recommendedQuote?: string): Post => {
  const posts = loadPosts(roomId);
  const newPost = createPost(roomId, cohortId, content, recommendedQuote);

  // 최신 글이 맨 위로 오도록 앞에 추가
  const updatedPosts = [newPost, ...posts];
  savePosts(roomId, updatedPosts);

  return newPost;
};

// 게시글 좋아요 토글
export const togglePostLike = (roomId: string, postId: string): boolean => {
  const posts = loadPosts(roomId);
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) return false;
  
  // 간단한 좋아요 토글 (실제로는 사용자별 좋아요 상태를 추적해야 함)
  posts[postIndex].likes += 1;
  savePosts(roomId, posts);
  
  return true;
};

// 댓글 추가
export const addComment = (roomId: string, postId: string, content: string): boolean => {
  const posts = loadPosts(roomId);
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) return false;
  
  const newComment: Comment = {
    id: generateId(),
    author: generateAnonymousName(),
    content: content.trim(),
    time: '방금 전',
    timestamp: Date.now(),
    likes: 0,
    isSystemQuote: false
  };
  
  posts[postIndex].comments.push(newComment);
  savePosts(roomId, posts);
  
  return true;
};

// 댓글 좋아요 토글
export const toggleCommentLike = (roomId: string, postId: string, commentId: string): boolean => {
  const posts = loadPosts(roomId);
  const postIndex = posts.findIndex(post => post.id === postId);
  
  if (postIndex === -1) return false;
  
  const commentIndex = posts[postIndex].comments.findIndex(comment => comment.id === commentId);
  if (commentIndex === -1) return false;
  
  posts[postIndex].comments[commentIndex].likes += 1;
  savePosts(roomId, posts);
  
  return true;
};

// 특정 게시글 가져오기
export const getPost = (roomId: string, postId: string): Post | null => {
  const posts = loadPosts(roomId);
  return posts.find(post => post.id === postId) || null;
};

// 모든 방의 전체 게시글 수 가져오기
export const getTotalPostsCount = (roomId: string): number => {
  const posts = loadPosts(roomId);
  return posts.length;
};

// 모든 게시글 가져오기 (통합 피드용)
export const loadAllPosts = (): Post[] => {
  try {
    const allPosts: Post[] = [];

    // 로컬스토리지에서 모든 community_posts_* 키 찾기
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('community_posts_')) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const posts: Post[] = JSON.parse(stored);
          allPosts.push(...posts);
        }
      }
    }

    // 시간순 정렬 (최신순)
    allPosts.sort((a, b) => b.timestamp - a.timestamp);

    // 시간 정보 업데이트
    return allPosts.map(post => ({
      ...post,
      time: formatTimeAgo(post.timestamp),
      comments: post.comments.map(comment => ({
        ...comment,
        time: formatTimeAgo(comment.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Failed to load all posts:', error);
    return [];
  }
};

// 기수 통계 데이터 생성 (가상 데이터)
export interface CohortStats {
  totalUsers: number;
  todayCompleted: number;
  todayCompletionRate: number;
  perfectStreakUsers: number;  // 연속 기록자 (현재까지 완벽하게 모든 DAY 완료)
  averageStamps: number;
  topUsers: Array<{
    rank: number;
    name: string;
    stamps: number;
    avatar: string;
  }>;
}

export const generateCohortStats = (cohortId: string, userStamps: number, currentDay: number): CohortStats => {
  // 시드값으로 일관된 랜덤 데이터 생성
  const seed = cohortId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number, offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
  };

  const totalUsers = random(80, 150, 1);
  const todayCompleted = random(Math.floor(totalUsers * 0.5), Math.floor(totalUsers * 0.85), 2);

  // 연속 기록자: 현재 DAY만큼의 스탬프를 모두 가진 사람들
  // 현재 DAY가 진행될수록 비율이 점점 줄어드는 것이 자연스러움
  const perfectStreakRate = Math.max(0.3, 0.9 - (currentDay * 0.02)); // DAY가 증가할수록 감소
  const perfectStreakUsers = Math.floor(totalUsers * perfectStreakRate);

  const averageStamps = random(10, 20, 4) + Math.random();

  // TOP 5 랭킹 생성 (사용자 포함)
  const topUsers = [];
  const userRank = random(1, 8, 5); // 사용자 랭킹 (1-8위 사이)

  for (let i = 1; i <= 5; i++) {
    if (i === userRank && userRank <= 5) {
      // 사용자를 랭킹에 포함
      topUsers.push({
        rank: i,
        name: '나',
        stamps: userStamps,
        avatar: '⭐'
      });
    } else {
      // 다른 사용자
      topUsers.push({
        rank: i,
        name: generateAnonymousName(),
        stamps: random(userStamps - 3, userStamps + 5, i + 10),
        avatar: getRandomAvatar()
      });
    }
  }

  // 스탬프 수로 정렬
  topUsers.sort((a, b) => b.stamps - a.stamps);

  // 랭킹 재할당
  topUsers.forEach((user, index) => {
    user.rank = index + 1;
  });

  return {
    totalUsers,
    todayCompleted,
    todayCompletionRate: Math.round((todayCompleted / totalUsers) * 100),
    perfectStreakUsers,
    averageStamps: Math.round(averageStamps * 10) / 10,
    topUsers
  };
};