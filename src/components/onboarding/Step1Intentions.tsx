import { motion } from 'framer-motion';
import { useState } from 'react';
import WeatherBackground from '@/components/weather/WeatherBackground';
import { Check } from 'lucide-react';

interface Step1IntentionsProps {
  intentions: string[];
  customIntention?: string;
  onNext: (intentions: string[], customIntention?: string) => void;
  onPrev: () => void;
}

const intentionOptions = [
  '나에게 더 친절해지고 싶어서',
  '하루를 정리하는 루틴을 만들고 싶어서',
  '감정을 관리하고 기록하고 싶어서',
  '새로운 웰빙 방법이 궁금해서',
];

export default function Step1Intentions({ 
  intentions: initialIntentions, 
  customIntention: initialCustom,
  onNext, 
  onPrev 
}: Step1IntentionsProps) {
  const [selectedIntentions, setSelectedIntentions] = useState<string[]>(initialIntentions);
  const [customIntention, setCustomIntention] = useState(initialCustom || '');
  const [showCustomInput, setShowCustomInput] = useState(!!initialCustom);

  const toggleIntention = (intention: string) => {
    setSelectedIntentions(prev => 
      prev.includes(intention) 
        ? prev.filter(i => i !== intention)
        : [...prev, intention]
    );
  };

  const handleNext = () => {
    if (selectedIntentions.length === 0 && !customIntention.trim()) {
      return;
    }
    onNext(selectedIntentions, customIntention.trim() || undefined);
  };

  const canProceed = selectedIntentions.length > 0 || customIntention.trim().length > 0;

  return (
    <WeatherBackground weather="sunny" className="h-[100dvh] flex flex-col">
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
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8 leading-relaxed">
            왜 정서 샤워를<br />시작하고 싶으신가요?
          </h2>
          
          <p className="text-gray-600 text-center mb-8 text-sm">
            여러 개 선택 가능
          </p>

          {/* Options */}
          <div className="space-y-4 mb-6">
            {intentionOptions.map((option, index) => (
              <motion.button
                key={option}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => toggleIntention(option)}
                className={`w-full p-4 rounded-3xl border-2 text-left transition-all duration-300 shadow-soft ${
                  selectedIntentions.includes(option)
                    ? 'bg-headspace-blue border-headspace-blue shadow-soft-lg text-white'
                    : 'bg-white/90 border-headspace-border hover:border-headspace-blue/50 hover:bg-headspace-pastel-blue'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${selectedIntentions.includes(option) ? 'text-white' : 'text-headspace-darkGray'}`}>{option}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedIntentions.includes(option)
                      ? 'bg-white border-white'
                      : 'border-gray-400'
                  }`}>
                    {selectedIntentions.includes(option) && (
                      <Check className="w-4 h-4 text-headspace-blue" />
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
            
            {/* Custom Option */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full p-4 rounded-3xl border-2 border-dashed border-headspace-border text-headspace-textMuted hover:border-headspace-blue hover:bg-headspace-pastel-blue transition-all duration-300 shadow-soft"
                >
                  기타 (직접 입력)
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="직접 입력해주세요..."
                    value={customIntention}
                    onChange={(e) => setCustomIntention(e.target.value)}
                    className="w-full p-4 rounded-3xl border-2 border-headspace-blue bg-headspace-pastel-blue focus:outline-none focus:border-headspace-blue/80 focus:bg-white transition-all shadow-soft"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomIntention('');
                    }}
                    className="text-sm text-headspace-textMuted hover:text-headspace-darkGray"
                  >
                    취소
                  </button>
                </div>
              )}
            </motion.div>
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