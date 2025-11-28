import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, Home } from 'lucide-react';
import SkyBackground from '@/components/cloud/SkyBackground';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <SkyBackground timeOfDay="evening" cloudDensity="medium" className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          {/* Lock Icon Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-soft-lg">
              <Lock className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-soft mb-6"
          >
            <h1 className="text-2xl font-bold text-headspace-darkGray mb-3">
              접근 권한이 없습니다
            </h1>
            <p className="text-headspace-textMuted leading-relaxed mb-4">
              이 페이지는 로그인이 필요한 페이지입니다
            </p>
            <div className="bg-headspace-pastel-yellow rounded-2xl p-4">
              <p className="text-sm text-yellow-800">
                💡 먼저 로그인한 후 다시 시도해주세요
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              로그인하기
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/intro')}
              className="w-full py-4 bg-white text-headspace-darkGray rounded-full font-semibold shadow-soft flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              처음으로 돌아가기
            </motion.button>
          </div>
        </motion.div>
      </div>
    </SkyBackground>
  );
}
