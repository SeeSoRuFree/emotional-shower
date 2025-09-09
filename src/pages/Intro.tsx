import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    id: 1,
    emoji: null,
    icon: (
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 bg-gradient-to-br from-headspace-blue to-headspace-pastel-blue rounded-full animate-pulse" />
        <div className="absolute inset-2 bg-white rounded-full" />
        <div className="absolute inset-4 bg-gradient-to-br from-headspace-blue to-headspace-pastel-blue rounded-full" />
      </div>
    ),
    title: '매일 샤워하듯\n마음도 씻어요',
    description: '하루 3번, 간단한 감정 체크인으로\n마음 건강을 챙기세요',
    bgGradient: 'from-headspace-pastel-blue to-blue-100',
    illustration: (
      <div className="relative w-48 h-48 mx-auto">
        {/* 중심 원 */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-32 h-32 bg-gradient-to-br from-headspace-blue to-headspace-pastel-blue rounded-full opacity-80" />
        </motion.div>
        {/* 궤도 원들 */}
        {[0, 120, 240].map((rotation, i) => (
          <motion.div
            key={i}
            animate={{ 
              rotate: [rotation, rotation + 360]
            }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-headspace-yellow to-headspace-pastel-yellow rounded-full" />
          </motion.div>
        ))}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-headspace-pastel-blue rounded-full blur-3xl"
        />
      </div>
    )
  },
  {
    id: 2,
    emoji: null,
    icon: (
      <div className="relative w-16 h-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-br from-headspace-yellow to-headspace-pastel-yellow rounded-2xl"
        />
        <div className="absolute inset-2 bg-white rounded-xl" />
        <div className="absolute inset-4 bg-gradient-to-br from-headspace-yellow to-yellow-300 rounded-lg" />
      </div>
    ),
    title: '하루 3번\n감정 기록하기',
    description: '행복해요, 평온해요, 도움이 필요해요\n세 가지 버튼으로 쉽게 기록해요',
    bgGradient: 'from-headspace-pastel-yellow to-yellow-100',
    illustration: (
      <div className="flex justify-center gap-4">
        {[
          { color: 'from-headspace-yellow to-yellow-300', shape: 'rounded-full' },
          { color: 'from-headspace-blue to-blue-300', shape: 'rounded-2xl' },
          { color: 'from-headspace-pink to-pink-300', shape: 'rounded-full' }
        ].map((item, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity 
            }}
            className={`w-16 h-16 bg-white ${item.shape} shadow-soft flex items-center justify-center overflow-hidden`}
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${item.color} ${item.shape}`} />
          </motion.div>
        ))}
      </div>
    )
  },
  {
    id: 3,
    emoji: null,
    icon: (
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 bg-gradient-to-br from-headspace-purple to-headspace-pastel-purple rounded-3xl transform rotate-45" />
        <div className="absolute inset-2 bg-white rounded-2xl transform rotate-45" />
        <div className="absolute inset-4 bg-gradient-to-br from-headspace-purple to-purple-300 rounded-xl transform rotate-45" />
      </div>
    ),
    title: '5분 대화로\n마음 정리하기',
    description: 'AI와 함께하는 정서샤워 톡\n오늘의 감정을 따뜻하게 마무리해요',
    bgGradient: 'from-headspace-pastel-purple to-purple-100',
    illustration: (
      <div className="relative w-64 h-48 mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ repeat: Infinity, duration: 3, repeatType: "reverse" }}
          className="absolute left-0 top-0 bg-white rounded-2xl p-3 shadow-soft max-w-[150px]"
        >
          <p className="text-sm text-headspace-darkGray">오늘 어떤 일이 있으셨나요?</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, repeat: Infinity, duration: 3, repeatType: "reverse" }}
          className="absolute right-0 bottom-0 bg-headspace-blue text-white rounded-2xl p-3 shadow-soft max-w-[150px]"
        >
          <p className="text-sm">좋은 일이 있었어요!</p>
        </motion.div>
      </div>
    )
  },
  {
    id: 4,
    emoji: null,
    icon: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute w-10 h-10 bg-gradient-to-br from-headspace-pink to-pink-300 rounded-full transform -translate-x-2 -translate-y-2" />
        <div className="absolute w-10 h-10 bg-gradient-to-br from-headspace-green to-green-300 rounded-full transform translate-x-2 -translate-y-2" />
        <div className="absolute w-10 h-10 bg-gradient-to-br from-headspace-yellow to-yellow-300 rounded-full transform translate-x-2 translate-y-2" />
        <div className="absolute w-10 h-10 bg-gradient-to-br from-headspace-blue to-blue-300 rounded-full transform -translate-x-2 translate-y-2" />
      </div>
    ),
    title: '함께 나누는\n공동 샤워방',
    description: '비슷한 감정을 느끼는 사람들과\n따뜻한 위로를 나누세요',
    bgGradient: 'from-headspace-pastel-pink to-pink-100',
    illustration: (
      <div className="grid grid-cols-2 gap-3 max-w-[200px] mx-auto">
        {[
          { gradient: 'from-headspace-yellow to-yellow-300', shape: 'rounded-2xl' },
          { gradient: 'from-headspace-green to-green-300', shape: 'rounded-full' },
          { gradient: 'from-headspace-purple to-purple-300', shape: 'rounded-3xl' },
          { gradient: 'from-headspace-pink to-pink-300', shape: 'rounded-full' }
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.1 }}
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 3,
              delay: i * 0.3,
              repeat: Infinity 
            }}
            className={`w-20 h-20 bg-white/80 ${item.shape} shadow-soft flex items-center justify-center overflow-hidden`}
          >
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, 0]
              }}
              transition={{ 
                duration: 4,
                delay: i * 0.2,
                repeat: Infinity 
              }}
              className={`w-14 h-14 bg-gradient-to-br ${item.gradient} ${item.shape}`}
            />
          </motion.div>
        ))}
      </div>
    )
  }
];

export default function Intro() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    navigate('/onboarding');
  };

  const handleLogin = () => {
    // Mock 카카오 로그인 - 온보딩으로 이동
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loginMethod', 'kakao');
    localStorage.setItem('hasSeenIntro', 'true');
    navigate('/onboarding');
  };

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

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      handleNext();
    }
    if (isRightSwipe && currentSlide > 0) {
      handlePrev();
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background gradient */}
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`absolute inset-0 bg-gradient-to-b ${slides[currentSlide].bgGradient}`}
      />

      {/* Skip button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-headspace-textMuted hover:text-headspace-darkGray z-20"
      >
        건너뛰기
      </button>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between p-6 pb-24">
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Illustration */}
              <div className="mb-8">
                {slides[currentSlide].illustration}
              </div>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="flex justify-center mb-6"
              >
                {slides[currentSlide].icon}
              </motion.div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-headspace-darkGray mb-4 whitespace-pre-line">
                {slides[currentSlide].title}
              </h1>

              {/* Description */}
              <p className="text-headspace-textMuted whitespace-pre-line max-w-sm mx-auto">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="space-y-6">
          {/* Dots indicator */}
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 h-2 bg-headspace-blue rounded-full'
                    : 'w-2 h-2 bg-headspace-textMuted/30 rounded-full'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons or Login */}
          {currentSlide === slides.length - 1 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Kakao Login Button */}
              <button
                onClick={handleLogin}
                className="w-full py-4 bg-[#FEE500] rounded-2xl flex items-center justify-center gap-3 shadow-soft hover:shadow-soft-lg transition-all"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M12 3C6.48 3 2 6.65 2 11.18C2 14.25 4.07 16.92 7.23 18.27L6.29 21.52C6.23 21.74 6.49 21.93 6.68 21.8L10.52 19.14C11 19.2 11.5 19.23 12 19.23C17.52 19.23 22 15.58 22 11.05C22 6.52 17.52 3 12 3Z" 
                    fill="#3C1E1E"
                  />
                </svg>
                <span className="text-[#3C1E1E] font-semibold text-lg">
                  카카오 로그인
                </span>
              </button>

              {/* Alternative login options */}
              <div className="mt-4 text-center">
                <button
                  onClick={handleSkip}
                  className="text-headspace-textMuted text-sm"
                >
                  로그인 없이 시작하기
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={currentSlide === 0}
                className={`p-3 rounded-full transition-all ${
                  currentSlide === 0
                    ? 'opacity-30 cursor-not-allowed'
                    : 'bg-white shadow-soft hover:shadow-soft-lg'
                }`}
              >
                <ChevronLeft className="w-6 h-6 text-headspace-darkGray" />
              </button>

              <button
                onClick={handleNext}
                className="px-8 py-3 bg-headspace-blue text-white rounded-full font-medium shadow-soft hover:shadow-soft-lg transition-all"
              >
                다음
              </button>

              <button
                onClick={handleNext}
                className="p-3 bg-white rounded-full shadow-soft hover:shadow-soft-lg transition-all"
              >
                <ChevronRight className="w-6 h-6 text-headspace-darkGray" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}