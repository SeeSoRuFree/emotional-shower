import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Sparkles, Edit3, Send, Users, TrendingUp, Flame, Award, ArrowRight, ImagePlus, X, Loader2 } from 'lucide-react';
import ResponsiveNav from '@/components/common/ResponsiveNav';
import { useCommunityStore, type Post, type CohortStats } from '@/store/communityStore';
import { recommendQuote } from '@/utils/quoteRecommendation';
import { useChallengeStore } from '@/store/challengeStore';
import { useAuthStore } from '@/store/authStore';
import { useCohortStore } from '@/store/cohortStore';
import { uploadImage, compressImage } from '@/utils/imageUpload';

// 배경 애니메이션 컴포넌트
const FloatingShape = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{
      opacity: [0.2, 0.4, 0.2],
      y: [-20, 20, -20],
      rotate: [0, 180, 360]
    }}
    transition={{
      duration: 10,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute w-20 h-20 bg-gradient-to-br from-headspace-pastel-yellow/30 to-headspace-pastel-pink/30 rounded-full blur-xl"
    style={{
      left: `${Math.random() * 80}%`,
      top: `${Math.random() * 60 + 10}%`
    }}
  />
);

export default function Community() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const cohortId = currentUser?.currentCohortId;

  const { getCurrentChallenge, calculateCurrentDay } = useChallengeStore();
  const { getCohortById } = useCohortStore();
  const {
    posts,
    loadAllPosts,
    addPost: addPostToStore,
    incrementPostLikes,
    generateCohortStats,
    initialized
  } = useCommunityStore();

  const [isWriting, setIsWriting] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState<string | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [stats, setStats] = useState<CohortStats | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userChallenge = cohortId ? getCurrentChallenge(cohortId) : undefined;
  const currentCohort = cohortId ? getCohortById(cohortId) : null;

  const currentDay = userChallenge && cohortId ? calculateCurrentDay(cohortId) : 0;
  const userStamps = userChallenge?.completedDays.length || 0;

  // Load posts from Supabase
  useEffect(() => {
    if (!cohortId || initialized) return;

    loadAllPosts(cohortId);
  }, [cohortId, initialized, loadAllPosts]);

  // Generate cohort statistics
  useEffect(() => {
    if (!cohortId || !currentCohort || !userChallenge) return;

    const cohortStats = generateCohortStats(currentCohort.id, userStamps, currentDay);
    setStats(cohortStats);
  }, [cohortId, currentCohort, userChallenge, userStamps, currentDay, generateCohortStats]);

  const handleStartWriting = () => {
    setIsWriting(true);
  };

  const handleCancelWriting = () => {
    setIsWriting(false);
    setPostContent('');
    setPostImageUrl(null);
    setPostImagePreview(null);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      // Compress and preview
      const compressed = await compressImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPostImagePreview(reader.result as string);
      reader.readAsDataURL(compressed);

      // Upload to Supabase Storage
      const result = await uploadImage(compressed, 'community-images', cohortId || 'general');
      setPostImageUrl(result.url);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setPostImageUrl(null);
    setPostImagePreview(null);
  };

  const handleSubmitPost = async () => {
    if (postContent.trim() && cohortId) {
      // 명언 추천 (기본 감정은 'celebrate'로)
      const recommendedQuote = recommendQuote(postContent, 'celebrate');

      // 게시글 추가 (unified feed, roomId는 'unified'로, cohortId 포함, 이미지 URL 포함)
      await addPostToStore(cohortId, 'unified', postContent, recommendedQuote || undefined, postImageUrl || undefined);

      setPostContent('');
      setPostImageUrl(null);
      setPostImagePreview(null);
      setIsWriting(false);
    }
  };

  // 게시글 좋아요
  const handlePostLike = async (postId: string) => {
    await incrementPostLikes(postId);
  };

  // 댓글 페이지로 이동
  const handleViewComments = (post: Post) => {
    navigate(`/community/${post.roomId}/${post.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-headspace-beige to-white relative overflow-hidden md:pt-16">
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <FloatingShape key={i} delay={i * 2} />
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/80 backdrop-blur-sm shadow-soft md:sticky md:top-16"
      >
        <div className="p-6 text-center">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block text-4xl mb-3"
          >
            🌻
          </motion.div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-headspace-blue to-headspace-purple bg-clip-text text-transparent">
            {currentCohort?.name || '챌린지'} 공동 샤워방
          </h1>
          <p className="text-headspace-textMuted mt-2">
            같은 기수 참여자들과 감정을 나누는 공간
          </p>
        </div>
      </motion.div>

      {/* 카카오 오픈채팅방 배너 - 기수에 설정된 경우에만 표시 */}
      {currentCohort?.kakaoChatUrl && (
        <div className="relative z-10 px-6 pt-6">
          <motion.a
            href={currentCohort.kakaoChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="block bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-3xl p-5 shadow-soft-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden relative"
          >
            {/* 배경 패턴 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12" />
            </div>

            <div className="relative flex items-center gap-4">
              {/* 아이콘 */}
              <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-soft">
                <MessageCircle className="w-6 h-6 text-yellow-600" fill="currentColor" />
              </div>

              {/* 텍스트 */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-yellow-900 mb-1">
                  💬 실시간 오픈채팅방
                </h3>
                <p className="text-sm text-yellow-800">
                  같은 기수 참여자들과 실시간으로 소통해보세요
                </p>
              </div>

              {/* 화살표 */}
              <div className="flex-shrink-0">
                <ArrowRight className="w-6 h-6 text-yellow-900" strokeWidth={2.5} />
              </div>
            </div>
          </motion.a>
        </div>
      )}

      {/* 통계 카드 섹션 */}
      {stats && (
        <div className="relative z-10 px-6 py-6">
          <div className="grid grid-cols-2 gap-4">
            {/* 오늘 완료율 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-headspace-pastel-blue to-blue-100 rounded-3xl p-5 shadow-soft"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                  <Users className="w-4 h-4 text-headspace-blue" />
                </div>
                <span className="text-sm font-medium text-headspace-blue">오늘 완료율</span>
              </div>
              <div className="mb-2">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-3xl font-bold text-headspace-darkGray"
                >
                  {stats.todayCompletionRate}%
                </motion.span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.todayCompletionRate}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-gradient-to-r from-headspace-blue to-blue-400 rounded-full"
                />
              </div>
              <p className="text-xs text-headspace-textMuted mt-2">
                {stats.todayCompleted}/{stats.totalUsers}명 완료
              </p>
            </motion.div>

            {/* 연속 기록자 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-5 shadow-soft"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
                <span className="text-sm font-medium text-orange-600">연속 기록자</span>
              </div>
              <div className="mb-2">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="text-3xl font-bold text-headspace-darkGray"
                >
                  {stats.perfectStreakUsers}
                </motion.span>
                <span className="text-lg text-headspace-textMuted ml-1">명</span>
              </div>
              <p className="text-xs text-headspace-textMuted">
                🔥 완벽하게 매일 기록 중
              </p>
            </motion.div>

            {/* 평균 진행도 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-headspace-pastel-yellow to-yellow-100 rounded-3xl p-5 shadow-soft"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-headspace-yellow" />
                </div>
                <span className="text-sm font-medium text-headspace-yellow">평균 진행도</span>
              </div>
              <div className="mb-2">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="text-3xl font-bold text-headspace-darkGray"
                >
                  {stats.averageStamps}
                </motion.span>
                <span className="text-lg text-headspace-textMuted ml-1">개</span>
              </div>
              <p className="text-xs text-headspace-textMuted">
                📊 평균 스탬프 개수
              </p>
            </motion.div>

            {/* TOP 5 랭킹 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-headspace-pastel-purple to-purple-100 rounded-3xl p-5 shadow-soft"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                  <Award className="w-4 h-4 text-headspace-purple" />
                </div>
                <span className="text-sm font-medium text-headspace-purple">TOP 5</span>
              </div>
              <div className="space-y-1">
                {stats.topUsers.slice(0, 3).map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center justify-between text-xs ${
                      user.name === '나' ? 'font-bold text-headspace-purple' : 'text-headspace-textMuted'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{user.avatar}</span>
                      <span className="truncate max-w-[60px]">{user.name}</span>
                    </div>
                    <span>{user.stamps}개</span>
                  </div>
                ))}
              </div>
              {stats.topUsers.length > 3 && (
                <p className="text-xs text-headspace-textMuted/60 mt-1">
                  +{stats.topUsers.length - 3}명 더
                </p>
              )}
            </motion.div>
          </div>

          {/* 동기부여 메시지 */}
          {stats.todayCompletionRate >= 70 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 border-l-4 border-orange-400"
            >
              <p className="text-sm font-semibold text-orange-600">
                🔥 오늘 기수가 불타고 있어요! 함께 달려봐요!
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* 게시글 작성 Input */}
      <div className="relative z-10 px-6 pt-4">
        <AnimatePresence>
          {!isWriting ? (
            <motion.button
              key="input-button"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={handleStartWriting}
              className="w-full bg-white/90 backdrop-blur rounded-full p-4 shadow-soft hover:shadow-soft-lg transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-headspace-pastel-blue to-headspace-pastel-purple flex items-center justify-center shadow-soft">
                  <Edit3 className="w-5 h-5 text-headspace-darkGray" />
                </div>
                <span className="text-headspace-textMuted flex-1">
                  무엇을 나누고 싶나요?
                </span>
                {userChallenge && (
                  <span className="text-xs font-semibold text-headspace-blue bg-headspace-pastel-blue px-3 py-1 rounded-full">
                    DAY {currentDay}
                  </span>
                )}
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="input-expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-5 shadow-soft-lg"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-headspace-pastel-blue to-headspace-pastel-purple flex items-center justify-center shadow-soft">
                  <Edit3 className="w-5 h-5 text-headspace-darkGray" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-headspace-darkGray">
                    @{currentUser?.name || '챌린저'}
                  </p>
                  <p className="text-xs text-headspace-textMuted">
                    {currentCohort?.name}{currentDay > 0 && ` · DAY ${currentDay}`}
                  </p>
                </div>
              </div>

              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="지금 어떤 기분인가요? 자유롭게 나눠주세요..."
                className="w-full min-h-[100px] bg-transparent border-none resize-none text-headspace-darkGray placeholder-headspace-textMuted focus:outline-none"
                autoFocus
              />

              {/* Image Preview */}
              {postImagePreview && (
                <div className="relative mt-3 rounded-2xl overflow-hidden bg-gray-100">
                  <img
                    src={postImagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-headspace-border">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancelWriting}
                    className="px-4 py-2 text-headspace-textMuted hover:text-headspace-darkGray transition-colors"
                  >
                    취소
                  </button>

                  {/* Image upload button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="p-2 rounded-full hover:bg-headspace-pastel-blue transition-colors disabled:opacity-50"
                  >
                    <ImagePlus className="w-5 h-5 text-headspace-blue" />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitPost}
                  disabled={!postContent.trim() || isUploadingImage}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium shadow-soft transition-all ${
                    postContent.trim() && !isUploadingImage
                      ? 'bg-gradient-to-r from-headspace-blue to-headspace-purple text-white hover:shadow-soft-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  공유하기
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 통합 피드 */}
      <div className="relative z-10 px-6 py-6 pb-32">
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💭</div>
              <p className="text-headspace-textMuted mb-2">
                아직 이야기가 없네요
              </p>
              <p className="text-sm text-headspace-textMuted">
                첫 번째 이야기를 들려주세요!
              </p>
            </div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-3xl p-5 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer"
                onClick={() => handleViewComments(post)}
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* 아바타 */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-headspace-pastel-blue to-headspace-pastel-purple flex items-center justify-center shadow-soft">
                    <span className="text-lg">{post.avatar}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-headspace-darkGray">
                          @{post.author}
                        </p>
                      </div>
                      <p className="text-xs text-headspace-textMuted">
                        {post.time}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post Image */}
                {post.imageUrl && (
                  <div className="mt-3 mb-4">
                    <img
                      src={post.imageUrl}
                      alt="Post image"
                      className="w-full max-h-96 object-contain rounded-2xl bg-gray-100"
                    />
                  </div>
                )}

                <p className="text-headspace-darkGray mb-4 pl-13 leading-relaxed">
                  {post.content}
                </p>

                {/* 추천 명언 미리보기 */}
                {post.recommendedQuote && (
                  <div className="pl-13 mb-4">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-headspace-purple rounded-r-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3 h-3 text-headspace-purple" />
                        <span className="text-xs font-semibold text-headspace-purple">마음의 명언</span>
                      </div>
                      <p className="text-sm italic text-headspace-darkGray">
                        "{post.recommendedQuote.substring(0, 80)}{post.recommendedQuote.length > 80 ? '...' : ''}"
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-6 pl-13">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePostLike(post.id);
                    }}
                    className="flex items-center gap-2 text-headspace-textMuted hover:text-headspace-pink transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 text-headspace-textMuted hover:text-headspace-blue transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comments.length}</span>
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <ResponsiveNav />
    </div>
  );
}
