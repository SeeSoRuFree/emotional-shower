import { motion } from 'framer-motion';
import WeatherBackground from '@/components/weather/WeatherBackground';

interface Step0PhilosophyProps {
  onNext: () => void;
}

export default function Step0Philosophy({ onNext }: Step0PhilosophyProps) {
  return (
    <WeatherBackground weather="dawn" className="h-[100dvh] flex flex-col">
      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex flex-col justify-center items-center text-center px-6 pt-16 pb-6 min-h-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-md"
          >
          {/* Logo or Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, delay: 1, type: "spring", stiffness: 100 }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center border border-white/60 shadow-soft-lg">
              <motion.div
                animate={{ 
                  y: [0, -3, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl"
              >
                ☁️
              </motion.div>
            </div>
          </motion.div>

          {/* Welcome Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-3xl font-bold text-headspace-darkGray mb-6 leading-relaxed"
          >
            정서샤워에<br />오신 걸 환영합니다!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-headspace-textMuted text-lg leading-relaxed mb-6"
          >
            매일 자기 전 샤워하듯,<br />
            마음도 깨끗하게 씻어내는<br />
            디지털 웰빙 루틴이에요.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/60 shadow-soft mb-4"
          >
            <p className="text-headspace-darkGray leading-relaxed">
              💭 오늘 하루의 감정을 정리하고<br />
              ⚡ 내일을 위한 마음 에너지를 채워보세요
            </p>
          </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-gradient-to-t from-white via-white/95 to-transparent pt-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2, type: "spring", stiffness: 100 }}
            className="bg-white rounded-t-3xl shadow-2xl border-t border-headspace-border/20"
          >
            <div className="p-6 pb-8 safe-area-bottom">
              <motion.button
                onClick={onNext}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-headspace-blue text-white rounded-3xl font-semibold text-lg hover:bg-headspace-blue/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                정서 샤워 시작하기 ✨
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </WeatherBackground>
  );
}