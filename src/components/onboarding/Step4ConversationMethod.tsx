import { motion } from 'framer-motion';
import { useState } from 'react';
import WeatherBackground from '@/components/weather/WeatherBackground';
import { Mic, MessageCircle } from 'lucide-react';

interface Step4ConversationMethodProps {
  selectedMethod: 'voice' | 'text' | null;
  onNext: (method: 'voice' | 'text') => void;
  onPrev: () => void;
}

const methodOptions = [
  {
    id: 'voice' as const,
    label: '음성 (말하기 + 듣기)',
    icon: Mic,
    description: '자연스러운 대화처럼 말로 소통해요',
    benefits: ['더 편안한 대화', '감정 표현이 자유로워요', '멀티태스킹 가능'],
    cloudStyle: 'from-purple-500 to-purple-400',
  },
  {
    id: 'text' as const,
    label: '채팅 (텍스트 기반)',
    icon: MessageCircle,
    description: '메신저처럼 텍스트로 대화해요',
    benefits: ['신중한 표현 가능', '기록 확인이 쉬워요', '조용한 환경에서 사용'],
    cloudStyle: 'from-blue-500 to-blue-400',
  },
];

export default function Step4ConversationMethod({
  selectedMethod,
  onNext,
  onPrev
}: Step4ConversationMethodProps) {
  const [currentMethod, setCurrentMethod] = useState<typeof selectedMethod>(selectedMethod);

  const handleMethodSelect = (method: 'voice' | 'text') => {
    setCurrentMethod(method);
  };

  const handleNext = () => {
    if (currentMethod) {
      onNext(currentMethod);
    }
  };

  return (
    <WeatherBackground weather="cloudy" className="h-[100dvh] flex flex-col">
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
            정서 샤워 5분 톡은<br />어떤 방식으로 하고 싶으세요?
          </h2>
          
          <p className="text-headspace-textMuted text-center mb-8 text-sm">
            대화 방식도 이후에 자유롭게 변경 가능
          </p>

          {/* Animated Cloud Background */}
          <div className="relative mb-8">
            {/* Background clouds for atmosphere */}
            <motion.div
              animate={{ x: [-20, 20, -20] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 w-16 h-8 bg-white/40 rounded-full blur-sm"
            />
            <motion.div
              animate={{ x: [20, -20, 20] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 w-20 h-10 bg-white/30 rounded-full blur-sm"
            />

            {/* Method Options */}
            <div className="space-y-4">
              {methodOptions.map((option, index) => {
                const IconComponent = option.icon;
                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    onClick={() => handleMethodSelect(option.id)}
                    className={`w-full p-6 rounded-3xl transition-all duration-500 shadow-soft ${
                      currentMethod === option.id
                        ? 'bg-white shadow-soft-lg scale-105 border-2 border-headspace-blue'
                        : 'bg-white/90 hover:bg-white hover:scale-102 border border-headspace-border'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon in cloud */}
                      <motion.div
                        animate={currentMethod === option.id ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-16 h-16 rounded-full bg-headspace-beige flex items-center justify-center shadow-soft border border-headspace-border"
                      >
                        <IconComponent 
                          className={`w-8 h-8 ${
                            currentMethod === option.id ? 'text-headspace-blue' : 'text-headspace-darkGray'
                          }`} 
                        />
                      </motion.div>
                      
                      <div className="flex-1 text-left">
                        <h3 className="text-headspace-darkGray font-bold text-lg mb-2 flex items-center">
                          {option.label}
                          {currentMethod === option.id && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-2 w-5 h-5 bg-headspace-blue rounded-full flex items-center justify-center"
                            >
                              <motion.div
                                animate={{ scale: [0.8, 1.2, 0.8] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className="w-2 h-2 bg-white rounded-full"
                              />
                            </motion.div>
                          )}
                        </h3>
                        <p className="text-headspace-textMuted text-sm mb-3">{option.description}</p>
                        <ul className="space-y-1">
                          {option.benefits.map((benefit, i) => (
                            <li key={i} className="text-xs text-headspace-textMuted/80 flex items-center">
                              <div className="w-1 h-1 bg-headspace-textMuted rounded-full mr-2" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          {currentMethod && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center bg-white/90 rounded-2xl p-4 backdrop-blur-sm border border-headspace-border shadow-soft"
            >
              <p className="text-sm text-headspace-textMuted">
                {currentMethod === 'voice' 
                  ? '🎙️ "안녕하세요! 오늘 하루 어떠셨나요?" 라고 AI가 말을 걸어요'
                  : '💬 "안녕하세요! 오늘 하루 어떠셨나요?" 라는 메시지가 나타나요'
                }
              </p>
            </motion.div>
          )}
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
                disabled={!currentMethod}
                whileHover={currentMethod ? { scale: 1.05, y: -2 } : {}}
                whileTap={currentMethod ? { scale: 0.95 } : {}}
                className={`px-8 py-3 rounded-full font-medium transition-all shadow-lg ${
                  currentMethod
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