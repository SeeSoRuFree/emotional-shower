import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Sparkles, ArrowLeft, ChevronLeft, ChevronRight, Edit3, Send } from 'lucide-react';
import ResponsiveNav from '@/components/common/ResponsiveNav';
import { loadPosts, addPost, togglePostLike, getTotalPostsCount } from '@/utils/communityStorage';
import { recommendQuote } from '@/utils/quoteRecommendation';
import { seedAllRoomsWithDummyData } from '@/utils/dummyData';
import type { Post } from '@/utils/communityStorage';

// Headspace 스타일 배경 컴포넌트
const FloatingShape = ({ type, delay }: { type: string, delay: number }) => {
  const shapes = {
    circle: (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 8,
          delay,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute"
        style={{
          left: `${Math.random() * 80}%`,
          top: `${Math.random() * 80}%`,
        }}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-headspace-pastel-yellow/30 to-headspace-pastel-pink/30 rounded-full blur-xl" />
      </motion.div>
    ),
    blob: (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0.2, 0.4, 0.2],
          x: [0, 30, 0],
          y: [0, -20, 0]
        }}
        transition={{
          duration: 10,
          delay,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute"
        style={{
          right: `${Math.random() * 60}%`,
          bottom: `${Math.random() * 60}%`,
        }}
      >
        <div className="w-32 h-32 bg-gradient-to-tr from-headspace-pastel-blue/20 to-headspace-pastel-green/20 rounded-full blur-2xl" />
      </motion.div>
    )
  };

  return shapes[type as keyof typeof shapes] || null;
};

// 커뮤니티 테마방 데이터 (Headspace 스타일로 업데이트)
const communityRooms = [
  {
    id: 'celebrate',
    title: '축하방',
    icon: '✨',
    gradient: 'from-headspace-yellow to-yellow-300',
    pastelGradient: 'from-headspace-pastel-yellow to-yellow-100',
    description: '작은 성취도 큰 의미',
    animation: 'bounce',
  },
  {
    id: 'grateful',
    title: '감사방',
    icon: '💝',
    gradient: 'from-headspace-green to-green-400',
    pastelGradient: 'from-headspace-pastel-green to-green-100',
    description: '감사한 마음을 나누는 공간',
    animation: 'float',
  },
  {
    id: 'anxiety',
    title: '불안·걱정방',
    icon: '🌙',
    gradient: 'from-headspace-purple to-purple-400',
    pastelGradient: 'from-headspace-pastel-purple to-purple-100',
    description: '함께 나누면 가벼워져요',
    animation: 'pulse',
  },
  {
    id: 'tired',
    title: '시들시들방',
    icon: '🌱',
    gradient: 'from-headspace-pink to-pink-400',
    pastelGradient: 'from-headspace-pastel-pink to-pink-100',
    description: '무기력한 날들을 위한 위로',
    animation: 'sway',
  },
  {
    id: 'anger',
    title: '분노방',
    icon: '🔥',
    gradient: 'from-emotion-coral to-orange-400',
    pastelGradient: 'from-orange-100 to-red-100',
    description: '화를 안전하게 표현하는 공간',
    animation: 'shake',
  }
];

// 감정별 명언 모음
const inspiringQuotes = {
  celebrate: [
    "성공은 준비된 사람에게 찾아온 기회다. - 루이 파스퇴르",
    "작은 발걸음도 계속하면 멀리 갈 수 있다. - 중국 속담",
    "노력하는 자에게는 하늘도 감동한다. - 한국 속담",
    "오늘의 성취는 어제의 꿈이었다.",
    "당신이 할 수 있다고 믿는 순간, 이미 절반은 이룬 것이다."
  ],
  grateful: [
    "감사하는 마음은 가장 큰 미덕이다. - 키케로",
    "행복의 문은 안에서 열린다. - 마르셀 프루스트",
    "작은 것에 감사할 줄 아는 자가 큰 것을 얻는다. - 탈무드",
    "감사는 과거를 의미 있게 하고, 오늘을 평화롭게 한다.",
    "당연한 것은 없다. 모든 순간이 선물이다."
  ],
  anxiety: [
    "용기란 두려움이 없는 것이 아니라, 두려움을 이겨내는 것이다. - 넬슨 만델라",
    "걱정은 내일의 고통을 덜어주지 못하고, 오늘의 기쁨만 빼앗는다. - 레오 부스칼리아",
    "현재에 머물러라. 지금 이 순간이 전부다. - 부처",
    "폭풍이 지나간 자리에는 무지개가 뜬다.",
    "모든 어둠 뒤에는 새벽이 기다리고 있다."
  ],
  tired: [
    "지친 마음도 쉬면 다시 힘을 얻는다. - 괴테",
    "휴식은 녹슨 것을 방지하는 기름과 같다. - 벤자민 프랭클린",
    "때로는 느린 것이 더 빠를 수 있다.",
    "오늘 쉬는 것은 내일을 위한 준비다.",
    "자신에게 친절하라. 당신도 위로가 필요한 사람이다."
  ],
  anger: [
    "화를 다스리는 것은 적을 이기는 것보다 어렵다. - 아인슈타인",
    "분노는 어리석음으로 시작해서 후회로 끝난다. - 피타고라스",
    "마음의 평화는 복수보다 달콤하다. - 간디",
    "화가 날 때는 백까지 세어라. 아주 화가 날 때는 천까지.",
    "분노는 바람과 같다. 머물지 않고 지나간다."
  ]
};

// 애니메이션 variants
const roomAnimations = {
  bounce: {
    y: [0, -10, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  float: {
    y: [0, -5, 0],
    x: [0, 5, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  },
  sway: {
    rotate: [-2, 2, -2],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  },
  shake: {
    x: [-1, 1, -1, 1, 0],
    transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3 }
  }
};

export default function Community() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  
  const [selectedRoom, setSelectedRoom] = useState<string | null>(roomId || null);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isWriting, setIsWriting] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [roomPostCounts, setRoomPostCounts] = useState<Record<string, number>>({});
  
  const currentRoom = communityRooms.find(room => room.id === selectedRoom);

  // Get quotes for current room
  const currentQuotes = selectedRoom ? inspiringQuotes[selectedRoom as keyof typeof inspiringQuotes] : [];

  // Load posts when room changes
  useEffect(() => {
    if (selectedRoom) {
      const loadedPosts = loadPosts(selectedRoom);
      setPosts(loadedPosts);
    }
  }, [selectedRoom]);

  // Initialize dummy data and load room post counts for main page
  useEffect(() => {
    // Seed dummy data on first load if needed
    seedAllRoomsWithDummyData();
    
    const counts: Record<string, number> = {};
    communityRooms.forEach(room => {
      counts[room.id] = getTotalPostsCount(room.id);
    });
    setRoomPostCounts(counts);
  }, [selectedRoom]); // Refresh counts when returning to main page

  // Update URL when room selection changes
  useEffect(() => {
    if (selectedRoom) {
      navigate(`/community/${selectedRoom}`, { replace: true });
    } else {
      navigate('/community', { replace: true });
    }
  }, [selectedRoom, navigate]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentQuoteIndex < currentQuotes.length - 1) {
      setCurrentQuoteIndex(currentQuoteIndex + 1);
    }
    if (isRightSwipe && currentQuoteIndex > 0) {
      setCurrentQuoteIndex(currentQuoteIndex - 1);
    }
  };

  const handleNextQuote = () => {
    if (currentQuoteIndex < currentQuotes.length - 1) {
      setCurrentQuoteIndex(currentQuoteIndex + 1);
    }
  };

  const handlePrevQuote = () => {
    if (currentQuoteIndex > 0) {
      setCurrentQuoteIndex(currentQuoteIndex - 1);
    }
  };

  const handleStartWriting = () => {
    setIsWriting(true);
  };

  const handleCancelWriting = () => {
    setIsWriting(false);
    setPostContent('');
  };

  const handleSubmitPost = () => {
    if (postContent.trim() && selectedRoom) {
      // 명언 추천
      const recommendedQuote = recommendQuote(postContent, selectedRoom);
      
      // 게시글 추가
      const newPost = addPost(selectedRoom, postContent, recommendedQuote || undefined);
      
      // UI 업데이트
      setPosts(prev => [newPost, ...prev]);
      setPostContent('');
      setIsWriting(false);
      
      // 전체 카운트 업데이트
      setRoomPostCounts(prev => ({
        ...prev,
        [selectedRoom]: (prev[selectedRoom] || 0) + 1
      }));
    }
  };

  // 게시글 좋아요 토글
  const handlePostLike = (postId: string) => {
    if (selectedRoom) {
      togglePostLike(selectedRoom, postId);
      // UI 업데이트
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1 }
          : post
      ));
    }
  };

  // 댓글 상세 페이지로 이동
  const handleViewComments = (postId: string) => {
    if (selectedRoom) {
      navigate(`/community/${selectedRoom}/${postId}`);
    }
  };

  // 방 목록 보기
  if (!selectedRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-headspace-beige to-white relative overflow-hidden">
        {/* 배경 애니메이션 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <FloatingShape key={`circle-${i}`} type="circle" delay={i * 2} />
          ))}
          {[...Array(2)].map((_, i) => (
            <FloatingShape key={`blob-${i}`} type="blob" delay={i * 3} />
          ))}
        </div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-white/80 backdrop-blur-sm shadow-soft"
        >
          <div className="p-6 text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block text-4xl mb-3"
            >
              ☁️
            </motion.div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-headspace-blue to-headspace-purple bg-clip-text text-transparent">
              공동 샤워방
            </h1>
            <p className="text-headspace-textMuted mt-2">
              감정을 나누고 위로받는 공간
            </p>
          </div>
        </motion.div>

        {/* Room Grid */}
        <div className="relative z-10 px-6 py-8 pb-32">
          <div className="grid grid-cols-2 gap-4">
            {communityRooms.map((room, index) => (
              <motion.button
                key={room.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedRoom(room.id);
                  setCurrentQuoteIndex(0);
                }}
                className="relative overflow-hidden rounded-3xl shadow-soft hover:shadow-soft-lg transition-all"
              >
                {/* 그라데이션 배경 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${room.pastelGradient}`} />
                
                {/* 애니메이션 아이콘 */}
                <motion.div
                  animate={roomAnimations[room.animation as keyof typeof roomAnimations]}
                  className="relative z-10 p-6"
                >
                  <div className="text-5xl mb-3 filter drop-shadow-lg">
                    {room.icon}
                  </div>
                  <h3 className="font-bold text-headspace-darkGray mb-1">
                    {room.title}
                  </h3>
                  <p className="text-xs text-headspace-textMuted">
                    {roomPostCounts[room.id] || 0}개의 이야기
                  </p>
                </motion.div>

                {/* 장식 요소 */}
                <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/20 rounded-full blur-xl" />
                <div className="absolute -top-2 -left-2 w-12 h-12 bg-white/30 rounded-full blur-lg" />
              </motion.button>
            ))}
          </div>

          {/* 통계 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur rounded-3xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-headspace-purple" />
              </motion.div>
              <h3 className="font-bold text-headspace-darkGray">
                오늘의 감정 공유
              </h3>
            </div>
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-2xl font-bold text-headspace-yellow">127</div>
                <div className="text-xs text-headspace-textMuted">활발한 대화</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-headspace-pink">89</div>
                <div className="text-xs text-headspace-textMuted">따뜻한 공감</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-headspace-blue">234</div>
                <div className="text-xs text-headspace-textMuted">함께하는 사람</div>
              </div>
            </div>
          </motion.div>
        </div>

        <ResponsiveNav />
      </div>
    );
  }

  // 선택된 방 상세 보기
  return (
    <div className="min-h-screen bg-gradient-to-b from-headspace-beige to-white">
      {/* Room Header */}
      <div className={`bg-gradient-to-br ${currentRoom?.pastelGradient} relative overflow-hidden`}>
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(5)].map((_, i) => (
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
                left: `${i * 25}%`,
                top: `${i * 20}%`
              }}
            >
              <div className="w-20 h-20 bg-white/20 rounded-full blur-xl" />
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 p-6">
          <button
            onClick={() => setSelectedRoom(null)}
            className="flex items-center gap-2 text-headspace-darkGray/70 hover:text-headspace-darkGray mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">돌아가기</span>
          </button>
          <div className="text-center">
            <motion.div 
              animate={roomAnimations[currentRoom?.animation as keyof typeof roomAnimations]}
              className="text-6xl mb-3 filter drop-shadow-lg"
            >
              {currentRoom?.icon}
            </motion.div>
            <h1 className="text-2xl font-bold text-headspace-darkGray mb-1">
              {currentRoom?.title}
            </h1>
            <p className="text-headspace-textMuted text-sm mb-6">
              {currentRoom?.description}
            </p>

            {/* Swipeable AI Messages */}
            <div 
              className="relative bg-white/80 backdrop-blur rounded-3xl p-4 shadow-soft"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handlePrevQuote}
                  disabled={currentQuoteIndex === 0}
                  className={`p-2 rounded-full transition-all ${
                    currentQuoteIndex === 0
                      ? 'opacity-30 cursor-not-allowed'
                      : 'bg-white shadow-soft hover:shadow-soft-lg'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 text-headspace-darkGray" />
                </button>

                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-headspace-purple" />
                  <span className="text-sm font-semibold text-headspace-purple">마음의 명언</span>
                </div>

                <button
                  onClick={handleNextQuote}
                  disabled={currentQuoteIndex === currentQuotes.length - 1}
                  className={`p-2 rounded-full transition-all ${
                    currentQuoteIndex === currentQuotes.length - 1
                      ? 'opacity-30 cursor-not-allowed'
                      : 'bg-white shadow-soft hover:shadow-soft-lg'
                  }`}
                >
                  <ChevronRight className="w-4 h-4 text-headspace-darkGray" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuoteIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="text-center text-headspace-darkGray italic px-4"
                >
                  "{currentQuotes[currentQuoteIndex]}"
                </motion.p>
              </AnimatePresence>

              {/* Dots indicator */}
              <div className="flex justify-center gap-1 mt-3">
                {currentQuotes.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuoteIndex(index)}
                    className={`transition-all duration-300 ${
                      index === currentQuoteIndex
                        ? 'w-6 h-1.5 bg-headspace-purple rounded-full'
                        : 'w-1.5 h-1.5 bg-headspace-textMuted/30 rounded-full'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Write Post Input */}
      <div className="px-6 pt-6">
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
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentRoom?.pastelGradient} flex items-center justify-center shadow-soft`}>
                  <Edit3 className="w-5 h-5 text-headspace-darkGray" />
                </div>
                <span className="text-headspace-textMuted flex-1">
                  무엇을 나누고 싶나요?
                </span>
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
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentRoom?.pastelGradient} flex items-center justify-center shadow-soft`}>
                  <Edit3 className="w-5 h-5 text-headspace-darkGray" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-headspace-darkGray">
                    @익명 사용자
                  </p>
                  <p className="text-xs text-headspace-textMuted">
                    {currentRoom?.title}에 공유하기
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
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-headspace-border">
                <button
                  onClick={handleCancelWriting}
                  className="px-4 py-2 text-headspace-textMuted hover:text-headspace-darkGray transition-colors"
                >
                  취소
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitPost}
                  disabled={!postContent.trim()}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium shadow-soft transition-all ${
                    postContent.trim()
                      ? `bg-gradient-to-r ${currentRoom?.gradient} text-white hover:shadow-soft-lg`
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

      {/* Posts Feed */}
      <div className="px-6 py-6 pb-32">
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">{currentRoom?.icon}</div>
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
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-5 shadow-soft hover:shadow-soft-lg transition-all cursor-pointer"
                onClick={() => handleViewComments(post.id)}
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* 아바타 */}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentRoom!.pastelGradient} flex items-center justify-center shadow-soft`}>
                    <span className="text-lg">{post.avatar}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-headspace-darkGray">
                        @{post.author}
                      </p>
                      <p className="text-xs text-headspace-textMuted">
                        {post.time}
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-headspace-darkGray mb-4 pl-13 leading-relaxed">
                  {post.content}
                </p>
                
                {/* 추천 명언 미리보기 (있는 경우) */}
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
                    <div className="relative">
                      <Heart className="w-5 h-5" />
                    </div>
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