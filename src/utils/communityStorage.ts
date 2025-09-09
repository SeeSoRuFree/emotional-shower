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
export const createPost = (roomId: string, content: string, recommendedQuote?: string): Post => {
  const now = Date.now();
  
  return {
    id: generateId(),
    roomId,
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
export const addPost = (roomId: string, content: string, recommendedQuote?: string): Post => {
  const posts = loadPosts(roomId);
  const newPost = createPost(roomId, content, recommendedQuote);
  
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