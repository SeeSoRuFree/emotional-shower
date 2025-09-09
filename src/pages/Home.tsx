import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionStore, getTodayEmotions, getEmotionStats } from '@/store/emotionStore';
import ResponsiveNav from '@/components/common/ResponsiveNav';
import { EmotionSelector } from '@/components/emotion/EmotionSelector';
import CloudEmotion from '@/components/cloud/CloudEmotion';
import SkyBackground from '@/components/cloud/SkyBackground';

// Headspace style character component
const HeadspaceCharacter = ({ color, size = 120, expression = 'neutral', delay = 0 }: any) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay,
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="character animate-bob"
      style={{ width: size, height: size }}
    >
      <div 
        className="character-circle"
        style={{ backgroundColor: color }}
      >
        {expression !== 'none' && (
          <div className="character-face text-headspace-darkGray/80" style={{ fontSize: `${size}px` }}>
            <div className="character-eyes">
              <div className="character-eye" />
              <div className="character-eye" />
            </div>
            {expression === 'happy' && <div className="character-mouth" />}
            {expression === 'neutral' && (
              <div className="w-8 h-0.5 bg-current rounded-full" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Decorative shapes
const DecorativeShapes = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating dots */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-20 left-10 w-3 h-3 bg-headspace-pastel-pink rounded-full"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
        className="absolute top-40 right-20 w-4 h-4 bg-headspace-pastel-blue rounded-full"
      />
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        className="absolute bottom-40 left-1/4 w-2 h-2 bg-headspace-pastel-green rounded-full"
      />
      
      {/* Wave lines */}
      <div className="absolute top-1/3 right-10 text-headspace-pastel-purple text-6xl opacity-20 rotate-12">
        〰️
      </div>
      <div className="absolute bottom-1/3 left-10 text-headspace-pastel-orange text-4xl opacity-20 -rotate-12">
        〰️〰️
      </div>
      
      {/* Stars */}
      <div className="absolute top-1/4 left-1/3 text-headspace-yellow text-2xl opacity-30">
        ✦
      </div>
      <div className="absolute bottom-1/4 right-1/3 text-headspace-pink text-xl opacity-30">
        ✧
      </div>
    </div>
  );
};

// Emotion categories with improved design
const emotionCategories = {
  joy: {
    label: 'Joy 😃',
    color: '#FFCE00',
    pastelColor: '#FFF9E6',
    icon: '😃',
    subEmotions: [
      { id: 'joyful', label: '기뻐요', icon: '😊' },
      { id: 'grateful', label: '감사해요', icon: '🙏' },
      { id: 'excited', label: '신나요', icon: '🎉' },
      { id: 'content', label: '만족해요', icon: '☺️' },
      { id: 'proud', label: '자랑스러워요', icon: '💪' },
      { id: 'hopeful', label: '희망차요', icon: '🌟' },
    ]
  },
  sad: {
    label: 'Sad 😢',
    color: '#6B9BD1',
    pastelColor: '#E3F2FD',
    icon: '😢',
    subEmotions: [
      { id: 'sad', label: '슬퍼요', icon: '😢' },
      { id: 'anxious', label: '불안해요', icon: '😰' },
      { id: 'stressed', label: '스트레스받아요', icon: '😤' },
      { id: 'tired', label: '피곤해요', icon: '😴' },
      { id: 'lonely', label: '외로워요', icon: '🥺' },
      { id: 'overwhelmed', label: '압도되어요', icon: '😵' },
    ]
  },
  helping: {
    label: 'Helping Hands 🤝',
    color: '#4CAF50',
    pastelColor: '#E8F5E8',
    icon: '🤝',
    subEmotions: [
      { id: 'peaceful', label: '평온해요', icon: '☮️' },
      { id: 'relaxed', label: '편안해요', icon: '😌' },
      { id: 'centered', label: '중심잡혔어요', icon: '🎯' },
      { id: 'balanced', label: '균형잡혔어요', icon: '⚖️' },
      { id: 'mindful', label: '마음챙겨요', icon: '🧘' },
      { id: 'serene', label: '고요해요', icon: '☁️' },
    ]
  }
};

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [clickedButtonIndex, setClickedButtonIndex] = useState<number>(0);
  const addEmotion = useEmotionStore((state) => state.addEmotion);
  const emotions = useEmotionStore((state) => state.emotions);
  const todayEmotions = getTodayEmotions(emotions);
  const emotionStats = getEmotionStats(emotions);

  const handleCategorySelect = (categoryKey: string, buttonIndex: number) => {
    setSelectedCategory(categoryKey);
    setClickedButtonIndex(buttonIndex);
    setShowEmotionModal(true);
  };

  const handleEmotionSelect = () => {
    const emotionType = selectedCategory === 'joy' ? 'joy' : 
                       selectedCategory === 'helping' ? 'helping' : 'sad';
    addEmotion(emotionType);
    
    // Close modal first
    setShowEmotionModal(false);
    
    // Then show celebration
    setShowCelebration(true);
    
    setTimeout(() => {
      setShowCelebration(false);
      setSelectedCategory(null);
    }, 1500);
  };

  const handleCloseModal = () => {
    setShowEmotionModal(false);
    setSelectedCategory(null);
  };

  // Body scroll prevention and ESC key handler
  useEffect(() => {
    if (showEmotionModal) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // ESC key handler
      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          handleCloseModal();
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [showEmotionModal]);

  return (
    <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col md:pt-16">
      <DecorativeShapes />
      
      {/* Daily Emotion Clouds - Responsive */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 h-40 md:h-60 p-4 md:p-8 flex items-end justify-center"
      >
        <div className="flex flex-wrap justify-center items-end gap-3 md:gap-6 max-w-md md:max-w-4xl min-h-[100px] md:min-h-[150px]">
          {todayEmotions.map((emotion, index) => {
            const size = index < 5 ? 'small' : index < 10 ? 'medium' : 'large';
            
            return (
              <CloudEmotion
                key={`cloud-${emotion.id}-${index}`}
                emotion={emotion}
                index={index}
                size={size}
                onClick={(emotionId) => {
                  // Handle cloud click if needed
                  console.log('Cloud clicked:', emotionId);
                }}
              />
            );
          })}
        </div>
      </motion.div>


      {/* Header with Chat Button - Responsive */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-6 md:px-12 py-3 md:py-6 text-center max-w-7xl mx-auto w-full"
      >
        {/* Chat button - moved to header */}
        {todayEmotions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-3"
          >
            <button
              onClick={() => navigate('/chat')}
              className="px-5 py-2 bg-headspace-blue text-white rounded-full text-sm font-medium hover:bg-opacity-90 shadow-cloud"
            >
              ☁️ 오늘 {todayEmotions.length}개 구름 → 마음대화 시작
            </button>
          </motion.div>
        )}
        
        <h1 className="text-lg md:text-2xl font-normal text-headspace-textMuted">
          마음을 구름에 담아보세요 ☁️
        </h1>
      </motion.div>

      {/* Main content - Responsive layout */}
      <div className="relative z-10 px-6 md:px-12 flex-1 flex flex-col justify-end pb-28 md:pb-12 max-w-7xl mx-auto w-full">
        {/* Primary emotion selection */}
        <div className="space-y-4">
          {/* Main question moved to bottom */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-4"
          >
            <h2 className="text-xl md:text-3xl font-semibold text-headspace-darkGray">
              지금 어떤 기분이신가요?
            </h2>
          </motion.div>
          
          {/* Main emotion buttons - Responsive grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 px-2 md:px-0"
          >
            {Object.entries(emotionCategories).map(([key, category], index) => (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleCategorySelect(key, index)}
                className="flex-1 md:min-w-[200px] md:max-w-[280px] rounded-3xl p-5 md:p-8 shadow-soft-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ backgroundColor: category.pastelColor }}
              >
                <div className="flex flex-col items-center">
                  <div className="mb-3 md:mb-4">
                    <span className="text-5xl md:text-6xl block">{category.icon}</span>
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm md:text-base font-bold text-headspace-darkGray">
                      {category.label}
                    </h3>
                    {/* Count display */}
                    {emotionStats[key as keyof typeof emotionStats] > 0 && (
                      <div className="mt-1">
                        <span className="text-xs px-2 py-1 rounded-full text-white"
                          style={{ backgroundColor: category.color }}
                        >
                          {emotionStats[key as keyof typeof emotionStats]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Cloud animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            <motion.div
              initial={{ 
                y: "85vh", 
                x: `${30 + (clickedButtonIndex * 40)}vw`,
                scale: 0.5 
              }}
              animate={{ 
                y: "15vh", 
                x: `${30 + (clickedButtonIndex * 40)}vw`,
                scale: [0.5, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              exit={{ 
                y: "10vh", 
                opacity: 0,
                scale: 0.8
              }}
              transition={{ 
                duration: 1.2,
                ease: "easeOut"
              }}
              className="absolute"
              style={{ transform: "translateX(-50%)" }}
            >
              <div className="relative">
                <div 
                  className={`w-12 h-14 rounded-full shadow-lg ${
                    selectedCategory === 'joy' ? 'bg-headspace-yellow' :
                    selectedCategory === 'helping' ? 'bg-green-400' :
                    'bg-blue-400'
                  }`}
                />
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-headspace-darkGray/40" />
                <motion.div 
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="absolute -top-1 -right-1 text-xl"
                >
                  ✨
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emotion Selection Modal */}
      <EmotionSelector
        isOpen={showEmotionModal}
        onClose={handleCloseModal}
        category={selectedCategory ? emotionCategories[selectedCategory as keyof typeof emotionCategories] : null}
        onEmotionSelect={handleEmotionSelect}
      />

      <ResponsiveNav />
    </SkyBackground>
  );
}