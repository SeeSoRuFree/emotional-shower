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
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-300 rounded-2xl opacity-60"
        />
        <div className="absolute inset-2 bg-white rounded-xl" />
        <div className="absolute inset-4 bg-gradient-to-br from-gray-500 to-gray-400 rounded-lg" />
      </div>
    ),
    title: '바쁜 일상 속\n내 마음 돌보고 계신가요?',
    description: '정신건강, 나중으로 미루고 계시진 않나요?\n매일 조금씩 관리하면 달라집니다',
    bgGradient: 'from-gray-100 to-blue-50',
    illustration: (
      <div className="relative w-48 h-48 mx-auto">
        {/* 바쁜 일상을 표현하는 회전하는 원들 */}
        {[0, 60, 120, 180, 240, 300].map((rotation, i) => (
          <motion.div
            key={i}
            animate={{
              rotate: [rotation, rotation + 360],
              scale: [1, 0.8, 1]
            }}
            transition={{
              duration: 8 - i * 0.5,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0"
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-300 rounded-full opacity-50" />
          </motion.div>
        ))}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-300 rounded-full" />
        </motion.div>
      </div>
    )
  },
  {
    id: 2,
    emoji: null,
    icon: (
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 bg-gradient-to-br from-headspace-blue to-headspace-purple rounded-2xl" />
        <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
          <span className="text-2xl font-bold text-headspace-blue">30</span>
        </div>
      </div>
    ),
    title: '30일간의\n친절함 챌린지',
    description: '매일 감정을 기록하고 나누는\n구조화된 정신건강 프로그램',
    bgGradient: 'from-headspace-pastel-blue to-headspace-pastel-purple',
    illustration: (
      <div className="relative w-56 h-40 mx-auto">
        {/* 30일 타임라인 */}
        <div className="flex items-center gap-1 justify-center flex-wrap max-w-[220px] mx-auto">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: i * 0.03,
                repeat: Infinity,
                repeatDelay: 2,
                duration: 0.3
              }}
              className="w-6 h-6 bg-gradient-to-br from-headspace-blue to-headspace-purple rounded-md opacity-80"
            />
          ))}
        </div>
      </div>
    )
  },
  {
    id: 3,
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
    title: '하루 3번\n감정 체크인',
    description: '행복해요, 평온해요, 도움이 필요해요\n간단한 기록으로 시작하세요',
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
    id: 4,
    emoji: null,
    icon: (
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 bg-gradient-to-br from-headspace-green to-green-300 rounded-2xl" />
        <div className="absolute inset-2 bg-white rounded-xl" />
        <div className="absolute inset-1 flex items-center justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-headspace-green to-green-400 rounded-xl flex items-center justify-center">
            <div className="w-6 h-1 bg-white rounded-full" />
            <div className="w-1 h-6 bg-white rounded-full absolute" />
          </div>
        </div>
      </div>
    ),
    title: '30일 후 받는\n나만의 정신건강 리포트',
    description: '감정 패턴 분석과 인사이트\n실제 도움이 되는 분석 리포트',
    bgGradient: 'from-headspace-pastel-green to-green-100',
    illustration: (
      <div className="relative w-64 h-40 mx-auto">
        {/* 리포트/그래프 형태 */}
        <div className="bg-white/80 rounded-2xl p-4 shadow-soft">
          <div className="flex items-end justify-between gap-2 h-24">
            {[60, 40, 80, 55, 90, 70].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 2,
                  duration: 0.5
                }}
                className={`flex-1 bg-gradient-to-t ${
                  i % 3 === 0 ? 'from-headspace-green to-green-300' :
                  i % 3 === 1 ? 'from-headspace-blue to-blue-300' :
                  'from-headspace-purple to-purple-300'
                } rounded-t-lg`}
              />
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: 5,
    emoji: null,
    icon: (
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute w-10 h-10 bg-gradient-to-br from-headspace-pink to-pink-300 rounded-full transform -translate-x-2 -translate-y-2" />
        <div className="absolute w-10 h-10 bg-gradient-to-br from-headspace-green to-green-300 rounded-full transform translate-x-2 -translate-y-2" />
        <div className="absolute w-10 h-10 bg-gradient-to-br from-headspace-yellow to-yellow-300 rounded-full transform translate-x-2 translate-y-2" />
        <div className="absolute w-10 h-10 bg-gradient-to-br from-headspace-blue to-blue-300 rounded-full transform -translate-x-2 translate-y-2" />
      </div>
    ),
    title: '함께하는 기수들과\n나누는 여정',
    description: '같은 시기에 시작한 동기들과\n따뜻한 위로와 응원을 나눠요',
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
    navigate('/apply');
  };

  const handleApply = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    navigate('/apply');
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

          {/* Navigation buttons or Apply */}
          {currentSlide === slides.length - 1 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Apply Button */}
              <button
                onClick={handleApply}
                className="w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-2xl flex items-center justify-center gap-3 shadow-soft hover:shadow-soft-lg transition-all font-semibold"
              >
                챌린지 신청하기 →
              </button>

              {/* Info text */}
              <div className="mt-4 text-center">
                <p className="text-headspace-textMuted text-sm">
                  💡 신청 후 승인되면 이메일로 코드를 보내드려요
                </p>
              </div>

              {/* Login link */}
              <div className="mt-3 text-center">
                <button
                  onClick={() => navigate('/login')}
                  className="text-headspace-textMuted hover:text-headspace-darkGray text-sm"
                >
                  이미 계정이 있으신가요? 로그인
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
