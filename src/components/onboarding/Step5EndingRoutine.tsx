import { motion } from 'framer-motion';
import { useState } from 'react';
import WeatherBackground from '@/components/weather/WeatherBackground';
import { Music, BookOpen, Moon } from 'lucide-react';

interface Step5EndingRoutineProps {
  selectedRoutine: 'music' | 'book' | 'sleep' | null;
  onNext: (routine: 'music' | 'book' | 'sleep') => void;
  onPrev: () => void;
}

const routineOptions = [
  {
    id: 'music' as const,
    label: '음악 추천 받기',
    icon: Music,
    emoji: '🎵',
    description: '마음에 맞는 음악으로 하루를 마무리해요',
    skyElement: '별이 반짝이는 밤하늘',
    preview: '차분한 피아노 선율이나 자연의 소리 등을 추천드려요',
  },
  {
    id: 'book' as const,
    label: '책 문구 추천 받기',
    icon: BookOpen,
    emoji: '📖',
    description: '위로가 되는 책 구절로 마음을 다독여요',
    skyElement: '달빛이 구름을 비추는 장면',
    preview: '오늘 감정에 맞는 따뜻한 책 문구를 골라드려요',
  },
  {
    id: 'sleep' as const,
    label: '바로 잠자리에 들기',
    icon: Moon,
    emoji: '🌙',
    description: '정서샤워 후 바로 편안한 휴식을 취해요',
    skyElement: '깊은 밤 조용한 구름',
    preview: '좋은 밤 되세요! 라는 메시지와 함께 마무리해요',
  },
];

export default function Step5EndingRoutine({
  selectedRoutine,
  onNext,
  onPrev
}: Step5EndingRoutineProps) {
  const [currentRoutine, setCurrentRoutine] = useState<typeof selectedRoutine>(selectedRoutine);

  const handleRoutineSelect = (routine: 'music' | 'book' | 'sleep') => {
    setCurrentRoutine(routine);
  };

  const handleNext = () => {
    if (currentRoutine) {
      onNext(currentRoutine);
    }
  };

  return (
    <WeatherBackground weather="dusk" className="h-[100dvh] flex flex-col">
      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="px-6 pt-16 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md mx-auto w-full"
          >
          {/* Question */}
          <h2 className="text-2xl font-bold text-headspace-darkGray text-center mb-4 leading-relaxed">
            정서 샤워가 끝난 뒤,<br />어떤 마무리를 원하시나요?
          </h2>
          
          <p className="text-headspace-textMuted text-center mb-8 text-sm">
            하루를 마무리하는 나만의 방식을 선택해보세요
          </p>

          {/* Evening sky atmosphere */}
          <div className="relative">
            {/* Floating evening elements */}
            <motion.div
              animate={{ 
                y: [-5, 5, -5],
                opacity: [0.6, 1, 0.6] 
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 right-4 text-2xl"
            >
              ⭐
            </motion.div>
            <motion.div
              animate={{ 
                y: [5, -5, 5],
                opacity: [0.4, 0.8, 0.4] 
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-4 left-8 text-xl"
            >
              ✨
            </motion.div>

            <div className="space-y-4">
              {routineOptions.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    onClick={() => handleRoutineSelect(option.id)}
                    className={`w-full p-5 rounded-3xl transition-all duration-500 group shadow-soft ${
                      currentRoutine === option.id
                        ? 'bg-white shadow-soft-lg scale-105 border-2 border-headspace-blue'
                        : 'bg-white/90 hover:bg-white shadow-lg hover:scale-102 border border-headspace-border'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon with evening glow */}
                      <div className="relative">
                        <motion.div
                          animate={currentRoutine === option.id ? { 
                            boxShadow: [
                              '0 0 0 0 rgba(255,255,255,0.4)',
                              '0 0 0 10px rgba(255,255,255,0.1)',
                              '0 0 0 20px rgba(255,255,255,0)'
                            ]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-16 h-16 bg-headspace-beige rounded-full flex items-center justify-center shadow-soft border border-headspace-border"
                        >
                          <div className="text-2xl">{option.emoji}</div>
                        </motion.div>
                      </div>
                      
                      <div className="flex-1 text-left">
                        <h3 className="text-headspace-darkGray font-bold text-lg mb-1 flex items-center">
                          {option.label}
                          {currentRoutine === option.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-3 w-2 h-2 bg-headspace-blue rounded-full"
                            >
                              <motion.div
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-full h-full bg-headspace-blue rounded-full opacity-60"
                              />
                            </motion.div>
                          )}
                        </h3>
                        <p className="text-headspace-textMuted text-sm mb-2">{option.description}</p>
                        <p className="text-headspace-textMuted/80 text-xs italic">{option.skyElement}</p>
                      </div>
                    </div>

                    {/* Expanded preview when selected */}
                    {currentRoutine === option.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-headspace-border"
                      >
                        <p className="text-headspace-textMuted text-sm text-center">
                          {option.preview}
                        </p>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-gradient-to-t from-white via-white/95 to-transparent pt-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 100 }}
            className="bg-white rounded-t-3xl shadow-2xl border-t border-headspace-border/20"
          >
            <div className="flex justify-between items-center p-6 pb-8 safe-area-bottom">
              <motion.button
                onClick={onPrev}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gray-100 text-headspace-textMuted rounded-full font-medium border border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-all shadow-sm"
              >
                이전
              </motion.button>

              <motion.button
                onClick={handleNext}
                disabled={!currentRoutine}
                whileHover={currentRoutine ? { scale: 1.05, y: -2 } : {}}
                whileTap={currentRoutine ? { scale: 0.95 } : {}}
                className={`px-8 py-3 rounded-full font-medium transition-all shadow-lg ${
                  currentRoutine
                    ? 'bg-headspace-blue text-white hover:bg-headspace-blue/90 hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                다음
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </WeatherBackground>
  );
}