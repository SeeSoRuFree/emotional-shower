import { motion } from 'framer-motion';
import WeatherBackground from '@/components/weather/WeatherBackground';
import { CheckCircle } from 'lucide-react';

interface Step6CompletionProps {
  onLogin: (method: 'kakao' | 'guest') => void;
  onPrev: () => void;
}

export default function Step6Completion({ onLogin, onPrev }: Step6CompletionProps) {
  return (
    <WeatherBackground weather="dawn" className="h-[100dvh] flex flex-col">
      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex flex-col justify-center items-center text-center px-6 pt-16 pb-6 min-h-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-md"
          >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 1,
              delay: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className="mb-8"
          >
            <div className="relative w-24 h-24 mx-auto">
              {/* Outer ring animation */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-headspace-pastel-pink/30 rounded-full"
              />
              
              {/* Inner circle */}
              <div className="relative w-full h-full bg-headspace-beige border-2 border-headspace-pastel-pink rounded-full flex items-center justify-center shadow-soft">
                <CheckCircle className="w-12 h-12 text-headspace-darkGray" />
              </div>
            </div>
          </motion.div>

          {/* Completion Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-3xl font-bold text-headspace-darkGray mb-6 leading-relaxed"
          >
            모든 준비가 끝났습니다!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-headspace-darkGray text-lg leading-relaxed mb-8"
          >
            정서 샤워를 시작하시려면<br />로그인이 필요해요
          </motion.p>

          {/* Settings Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 mb-8"
          >
            <p className="text-headspace-textMuted text-sm mb-2">설정이 완료되었어요</p>
            <div className="flex items-center justify-center space-x-4 text-xs text-headspace-textMuted">
              <span>✨ 개인 맞춤 설정</span>
              <span>•</span>
              <span>🌤️ 날씨 기반 기록</span>
              <span>•</span>
              <span>💬 AI 대화</span>
            </div>
          </motion.div>

          {/* Floating elements for new beginning */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }, (_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0,
                  scale: 0,
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 200 - 100
                }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: [0, -100]
                }}
                transition={{
                  duration: 3,
                  delay: 1.5 + i * 0.2,
                  ease: "easeOut"
                }}
                className="absolute text-headspace-textMuted/60"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${30 + Math.random() * 40}%`,
                  fontSize: `${0.8 + Math.random() * 0.4}rem`
                }}
              >
                {['✨', '🌟', '💫', '⭐'][Math.floor(Math.random() * 4)]}
              </motion.div>
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
            transition={{ duration: 0.8, delay: 1.4, type: "spring", stiffness: 100 }}
            className="bg-white rounded-t-3xl shadow-2xl border-t border-headspace-border/20"
          >
            <div className="p-6 pb-8 safe-area-bottom">
              {/* Login Buttons */}
              <div className="space-y-4 mb-6">
                {/* Kakao Login Button */}
                <motion.button
                  onClick={() => onLogin('kakao')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-[#FEE500] rounded-3xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
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
                </motion.button>

                {/* Guest Login Button */}
                <motion.button
                  onClick={() => onLogin('guest')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gray-100 text-headspace-darkGray rounded-3xl font-semibold text-lg border border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span>로그인 없이 시작하기</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ✨
                  </motion.div>
                </motion.button>
              </div>

              {/* Previous Button */}
              <div className="flex justify-center">
                <motion.button
                  onClick={onPrev}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gray-100 text-headspace-textMuted rounded-full font-medium border border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition-all shadow-sm"
                >
                  이전
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </WeatherBackground>
  );
}