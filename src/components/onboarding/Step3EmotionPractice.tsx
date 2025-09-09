import { motion } from 'framer-motion';
import { useState } from 'react';
import WeatherBackground from '@/components/weather/WeatherBackground';

type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'dawn' | 'dusk' | 'night';
import CloudAnimation from '@/components/weather/CloudAnimation';

interface Step3EmotionPracticeProps {
  practiceWeather: 'sunny' | 'cloudy' | 'rainy' | null;
  practiceEmotions: string[];
  onNext: (weather: 'sunny' | 'cloudy' | 'rainy', emotions: string[]) => void;
  onPrev: () => void;
}

const weatherOptions = [
  {
    id: 'sunny' as const,
    label: '맑음',
    icon: '☀️',
    weather: 'sunny' as WeatherType,
    emotions: ['기쁜', '행복한', '활기찬', '열정적인', '자부심있는', '감사한', '편안한', '만족한'],
  },
  {
    id: 'cloudy' as const,
    label: '흐림',
    icon: '☁️',
    weather: 'cloudy' as WeatherType,
    emotions: ['평범한', '무덤덤한', '차분한', '생각많은', '애매한', '지친', '피곤한', '복잡한'],
  },
  {
    id: 'rainy' as const,
    label: '비·눈',
    icon: '🌧️',
    weather: 'rainy' as WeatherType,
    emotions: ['우울한', '슬픈', '괴로운', '불쾌한', '긴장된', '걱정되는', '외로운', '답답한'],
  },
];

export default function Step3EmotionPractice({
  practiceWeather,
  practiceEmotions,
  onNext,
  onPrev
}: Step3EmotionPracticeProps) {
  const [selectedWeather, setSelectedWeather] = useState<'sunny' | 'cloudy' | 'rainy' | null>(practiceWeather);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(practiceEmotions);
  const [showWeatherSelection, setShowWeatherSelection] = useState(!practiceWeather);

  const currentWeatherOption = selectedWeather ? weatherOptions.find(opt => opt.id === selectedWeather) : null;

  const handleWeatherSelect = (weather: 'sunny' | 'cloudy' | 'rainy') => {
    setSelectedWeather(weather);
    setSelectedEmotions([]);
    setShowWeatherSelection(false);
  };

  const handleEmotionSelect = (emotion: string) => {
    setSelectedEmotions(prev => [...prev, emotion]);
  };

  const handleNext = () => {
    if (selectedWeather && selectedEmotions.length > 0) {
      onNext(selectedWeather, selectedEmotions);
    }
  };

  const canProceed = selectedWeather && selectedEmotions.length > 0;

  if (showWeatherSelection || !selectedWeather) {
    return (
      <WeatherBackground weather="sunny" className="h-[100dvh] flex flex-col">
        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="px-6 pt-16 pb-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-md mx-auto w-full text-center"
            >
            <h2 className="text-2xl font-bold text-headspace-darkGray mb-4 leading-relaxed">
              앞으로 정서샤워에서는<br />매일 하루 기분을 기록할 거예요.
            </h2>
            
            <p className="text-headspace-textMuted mb-8">
              연습 삼아 오늘의 기분을<br />한번 기록해볼까요?
            </p>

            <div className="space-y-4">
              {weatherOptions.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => handleWeatherSelect(option.id)}
                  className="w-full p-6 bg-white rounded-3xl border border-headspace-border hover:border-headspace-blue hover:bg-headspace-pastel-blue hover:scale-105 transition-all duration-300 shadow-soft"
                >
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-4xl">{option.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-headspace-darkGray">{option.label}</h3>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Navigation - Weather Selection */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <div className="bg-gradient-to-t from-white via-white/95 to-transparent pt-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
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
              </div>
            </motion.div>
          </div>
        </div>
      </WeatherBackground>
    );
  }

  return (
    <WeatherBackground weather={currentWeatherOption?.weather || 'sunny'} className="h-[100dvh] flex flex-col">
      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="px-6 pt-16 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-6"
          >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="text-2xl">{currentWeatherOption?.icon}</div>
            <h2 className="text-xl font-bold text-headspace-darkGray">
              {currentWeatherOption?.label} 날씨를 선택하셨네요
            </h2>
          </div>
          
          <p className="text-headspace-textMuted">
            구름을 터치해서 오늘의 감정을 선택해보세요
          </p>
          
          <button
            onClick={() => setShowWeatherSelection(true)}
            className="mt-2 text-headspace-textMuted/70 text-sm underline hover:text-headspace-darkGray transition-all"
          >
            날씨 다시 선택하기
          </button>
        </motion.div>

          <div className="flex-1" style={{ minHeight: 'calc(50vh - 200px)' }}>
            <CloudAnimation
              words={currentWeatherOption?.emotions || []}
              onWordSelect={handleEmotionSelect}
              weather={selectedWeather}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Floating Navigation - Emotion Selection */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-gradient-to-t from-white via-white/95 to-transparent pt-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, type: "spring", stiffness: 100 }}
            className="bg-white rounded-t-3xl shadow-2xl border-t border-headspace-border/20"
          >
            {/* Info Text */}
            <div className="px-6 pt-4 text-center">
              <p className="text-headspace-textMuted/70 text-xs">
                지금 기록한 내용은 로그인하면 자동으로 계정에 연동돼요.<br />
                정서샤워의 첫 번째 기록으로 저장됩니다.
              </p>
            </div>
            
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
                disabled={!canProceed}
                whileHover={canProceed ? { scale: 1.05, y: -2 } : {}}
                whileTap={canProceed ? { scale: 0.95 } : {}}
                className={`px-8 py-3 rounded-full font-medium transition-all shadow-lg ${
                  canProceed
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