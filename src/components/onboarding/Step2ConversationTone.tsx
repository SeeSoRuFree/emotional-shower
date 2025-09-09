import { motion } from 'framer-motion';
import { useState } from 'react';
import WeatherBackground from '@/components/weather/WeatherBackground';

type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'dawn' | 'dusk' | 'night';

interface Step2ConversationToneProps {
  selectedTone: 'warm' | 'honest' | 'bright' | 'neutral' | null;
  onNext: (tone: 'warm' | 'honest' | 'bright' | 'neutral') => void;
  onPrev: () => void;
}

const toneOptions = [
  {
    id: 'warm' as const,
    label: '따뜻하고 공감하는 톤',
    weather: 'sunny' as WeatherType,
    icon: '☀️',
    description: '따뜻한 햇살처럼 포근하게',
    example: '"오늘 정말 힘드셨겠어요. 충분히 쉬어가셔도 괜찮아요."',
  },
  {
    id: 'honest' as const,
    label: '솔직하고 담백한 톤',
    weather: 'cloudy' as WeatherType,
    icon: '☁️',
    description: '시원한 구름처럼 담백하게',
    example: '"오늘 어떤 일이 있었는지 간단히 들려주세요."',
  },
  {
    id: 'bright' as const,
    label: '밝고 유머러스한 톤',
    weather: 'dawn' as WeatherType,
    icon: '🌤️',
    description: '해가 살짝 보이는 구름처럼',
    example: '"오늘도 수고 많으셨어요! 어떤 재미있는 일이 있었나요?"',
  },
  {
    id: 'neutral' as const,
    label: '중립적이고 차분한 톤',
    weather: 'dusk' as WeatherType,
    icon: '🌫️',
    description: '부드러운 안개처럼 차분하게',
    example: '"오늘의 경험에 대해 이야기해보시겠어요?"',
  },
];

export default function Step2ConversationTone({ 
  selectedTone, 
  onNext, 
  onPrev 
}: Step2ConversationToneProps) {
  const [currentTone, setCurrentTone] = useState<typeof selectedTone>(selectedTone);
  const [previewWeather, setPreviewWeather] = useState<WeatherType>('sunny');

  const handleToneSelect = (tone: 'warm' | 'honest' | 'bright' | 'neutral') => {
    setCurrentTone(tone);
    const selectedOption = toneOptions.find(opt => opt.id === tone);
    if (selectedOption) {
      setPreviewWeather(selectedOption.weather);
    }
  };

  const handleNext = () => {
    if (currentTone) {
      onNext(currentTone);
    }
  };

  return (
    <WeatherBackground weather={previewWeather} className="h-[100dvh] flex flex-col">
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
            AI와 대화할 때,<br />어떤 톤이 가장 편안할까요?
          </h2>
          
          <p className="text-headspace-textMuted text-center mb-8 text-sm">
            이 설정은 추후 앱 내에서 언제든 수정 가능
          </p>

          {/* Options */}
          <div className="space-y-3">
            {toneOptions.map((option, index) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleToneSelect(option.id)}
                onMouseEnter={() => setPreviewWeather(option.weather)}
                className={`w-full p-4 rounded-3xl transition-all duration-500 shadow-soft ${
                  currentTone === option.id
                    ? 'bg-white border-2 border-headspace-blue shadow-soft-lg scale-105'
                    : 'bg-white/90 border border-headspace-border hover:bg-white hover:scale-102'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{option.icon}</div>
                  <div className="flex-1 text-left">
                    <h3 className="text-headspace-darkGray font-semibold mb-1">{option.label}</h3>
                    <p className="text-headspace-textMuted text-sm mb-2">{option.description}</p>
                    <p className="text-headspace-textMuted/80 text-xs italic">{option.example}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 transition-all ${
                    currentTone === option.id
                      ? 'bg-headspace-blue border-headspace-blue'
                      : 'border-headspace-border'
                  }`}>
                    {currentTone === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-full h-full bg-white rounded-full scale-75"
                      />
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
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
                disabled={!currentTone}
                whileHover={currentTone ? { scale: 1.05, y: -2 } : {}}
                whileTap={currentTone ? { scale: 0.95 } : {}}
                className={`px-8 py-3 rounded-full font-medium transition-all shadow-lg ${
                  currentTone
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