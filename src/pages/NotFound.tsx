import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import SkyBackground from '@/components/cloud/SkyBackground';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <SkyBackground timeOfDay="day" cloudDensity="medium" className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          {/* 404 Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mb-8"
          >
            <div className="text-9xl font-bold text-headspace-blue mb-4">
              404
            </div>
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-6xl"
            >
              🌫️
            </motion.div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-soft mb-6"
          >
            <h1 className="text-2xl font-bold text-headspace-darkGray mb-3">
              페이지를 찾을 수 없어요
            </h1>
            <p className="text-headspace-textMuted leading-relaxed">
              요청하신 페이지가 존재하지 않거나<br />
              이동되었을 수 있습니다
            </p>
          </motion.div>

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/home')}
              className="w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              홈으로 이동
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="w-full py-4 bg-white text-headspace-darkGray rounded-full font-semibold shadow-soft flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              이전 페이지로
            </motion.button>
          </div>
        </motion.div>
      </div>
    </SkyBackground>
  );
}
