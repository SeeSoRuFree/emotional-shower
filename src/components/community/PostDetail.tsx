import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Send, Sparkles } from 'lucide-react';
import { useCommunityStore, type Post } from '@/store/communityStore';
import { useAuthStore } from '@/store/authStore';
import BottomNav from '@/components/common/BottomNav';

// 커뮤니티 룸 정보
const communityRooms = {
  'celebrate': {
    title: '축하방',
    icon: '✨',
    gradient: 'from-headspace-yellow to-yellow-300',
    pastelGradient: 'from-headspace-pastel-yellow to-yellow-100',
  },
  'grateful': {
    title: '감사방',
    icon: '💝',
    gradient: 'from-headspace-green to-green-400',
    pastelGradient: 'from-headspace-pastel-green to-green-100',
  },
  'anxiety': {
    title: '불안·걱정방',
    icon: '🌙',
    gradient: 'from-headspace-purple to-purple-400',
    pastelGradient: 'from-headspace-pastel-purple to-purple-100',
  },
  'tired': {
    title: '시들시들방',
    icon: '🌱',
    gradient: 'from-headspace-pink to-pink-400',
    pastelGradient: 'from-headspace-pastel-pink to-pink-100',
  },
  'anger': {
    title: '분노방',
    icon: '🔥',
    gradient: 'from-emotion-coral to-orange-400',
    pastelGradient: 'from-orange-100 to-red-100',
  }
};

export default function PostDetail() {
  const { roomId, postId } = useParams<{ roomId: string; postId: string }>();
  const navigate = useNavigate();

  const { currentUser } = useAuthStore();
  const { posts, loadPosts, addComment: addCommentToPost, incrementPostLikes, incrementCommentLikes } = useCommunityStore();

  const [post, setPost] = useState<Post | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentRoom = roomId ? communityRooms[roomId as keyof typeof communityRooms] : null;
  const cohortId = currentUser?.currentCohortId;

  // 게시글 로드
  useEffect(() => {
    if (cohortId && roomId) {
      loadPosts(cohortId, roomId);
    }
  }, [cohortId, roomId, loadPosts]);

  // posts가 업데이트되면 현재 게시글 찾기
  useEffect(() => {
    if (postId && posts.length > 0) {
      const foundPost = posts.find(p => p.id === postId);
      setPost(foundPost || null);
    }
  }, [postId, posts]);
  
  // 게시글을 찾지 못한 경우
  if (!post || !currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-headspace-beige to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-headspace-textMuted mb-4">게시글을 찾을 수 없습니다</p>
          <button
            onClick={() => navigate('/community')}
            className="px-4 py-2 bg-headspace-blue text-white rounded-full"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  // 좋아요 토글
  const handlePostLike = async () => {
    if (postId) {
      await incrementPostLikes(postId);
    }
  };

  // 댓글 좋아요 토글
  const handleCommentLike = async (commentId: string) => {
    await incrementCommentLikes(commentId);
  };

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!commentContent.trim() || !postId || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const success = await addCommentToPost(postId, commentContent);
      if (success) {
        setCommentContent('');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-headspace-beige to-white">
      {/* Header */}
      <div className={`bg-gradient-to-br ${currentRoom.pastelGradient} relative overflow-hidden`}>
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, 20, 0],
                y: [0, -20, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute"
              style={{
                left: `${i * 30}%`,
                top: `${i * 25}%`
              }}
            >
              <div className="w-16 h-16 bg-white/20 rounded-full blur-xl" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 p-6">
          <button
            onClick={() => navigate(`/community`)}
            className="flex items-center gap-2 text-headspace-darkGray/70 hover:text-headspace-darkGray mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">돌아가기</span>
          </button>
          
          <div className="text-center">
            <div className="text-4xl mb-2 filter drop-shadow-lg">
              {currentRoom.icon}
            </div>
            <h1 className="text-xl font-bold text-headspace-darkGray">
              {currentRoom.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-soft-lg mb-6"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentRoom.pastelGradient} flex items-center justify-center shadow-soft`}>
              <span className="text-xl">{post.avatar}</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-headspace-darkGray text-lg">
                  @{post.author}
                </p>
                <p className="text-sm text-headspace-textMuted">
                  {post.time}
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-headspace-darkGray text-lg leading-relaxed mb-6">
            {post.content}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-headspace-border">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePostLike}
              className="flex items-center gap-2 text-headspace-textMuted hover:text-headspace-pink transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span className="font-medium">{post.likes}</span>
            </motion.button>
            
            <p className="text-sm text-headspace-textMuted">
              댓글 {post.comments.length}개
            </p>
          </div>
        </motion.div>

        {/* Comments */}
        <div className="space-y-4 mb-6">
          <h3 className="font-bold text-headspace-darkGray flex items-center gap-2">
            <span>댓글</span>
            <span className="text-sm font-normal text-headspace-textMuted">
              {post.comments.length}개
            </span>
          </h3>
          
          <AnimatePresence>
            {post.comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl p-4 shadow-soft ${
                  comment.isSystemQuote 
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-headspace-purple' 
                    : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                    comment.isSystemQuote 
                      ? 'from-headspace-purple to-headspace-blue' 
                      : currentRoom.pastelGradient
                  } flex items-center justify-center shadow-soft flex-shrink-0`}>
                    {comment.isSystemQuote ? (
                      <Sparkles className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-sm">💭</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className={`font-semibold text-sm ${
                        comment.isSystemQuote ? 'text-headspace-purple' : 'text-headspace-darkGray'
                      }`}>
                        {comment.isSystemQuote ? '💫 ' : '@'}{comment.author}
                      </p>
                      <p className="text-xs text-headspace-textMuted">
                        {comment.time}
                      </p>
                    </div>
                    
                    <p className={`text-sm leading-relaxed mb-3 ${
                      comment.isSystemQuote ? 'italic text-headspace-darkGray font-medium' : 'text-headspace-darkGray'
                    }`}>
                      {comment.isSystemQuote ? `"${comment.content}"` : comment.content}
                    </p>
                    
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCommentLike(comment.id)}
                      className="flex items-center gap-1 text-headspace-textMuted hover:text-headspace-pink transition-colors"
                    >
                      <Heart className="w-3 h-3" />
                      <span className="text-xs">{comment.likes}</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {post.comments.length === 0 && (
            <div className="text-center py-8 text-headspace-textMuted">
              <p>아직 댓글이 없습니다</p>
              <p className="text-sm mt-1">첫 번째 댓글을 남겨보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* Comment Input - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-headspace-border z-20 pb-20">
        <div className="p-4">
          <div className="flex items-end gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentRoom.pastelGradient} flex items-center justify-center shadow-soft flex-shrink-0`}>
              <span className="text-lg">💭</span>
            </div>
            
            <div className="flex-1 bg-white rounded-2xl border border-headspace-border focus-within:border-headspace-blue transition-colors">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="댓글을 입력해주세요..."
                className="w-full p-3 bg-transparent border-none resize-none text-headspace-darkGray placeholder-headspace-textMuted focus:outline-none min-h-[44px] max-h-32"
                rows={1}
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmitComment}
              disabled={!commentContent.trim() || isSubmitting}
              className={`p-3 rounded-full shadow-soft transition-all flex-shrink-0 ${
                commentContent.trim() && !isSubmitting
                  ? `bg-gradient-to-r ${currentRoom.gradient} text-white hover:shadow-soft-lg`
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}