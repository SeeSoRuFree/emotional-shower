import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, AlertCircle } from 'lucide-react';
import SkyBackground from '@/components/cloud/SkyBackground';
import { useApplicationStore } from '@/store/applicationStore';
import { useChallengeStore } from '@/store/challengeStore';
import { useAuthStore } from '@/store/authStore';

export default function CodeVerify() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { verifyCode, markCodeAsUsed } = useApplicationStore();
  const { completeOnboarding } = useAuthStore();

  const handleVerify = () => {
    if (code.length !== 6) {
      setError('6자리 코드를 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError('');

    // 코드 검증
    setTimeout(async () => {
      const result = await verifyCode(code);

      if (!result.valid) {
        setError('유효하지 않거나 이미 사용된 코드입니다');
        setIsLoading(false);
        return;
      }

      if (!result.cohortId) {
        setError('코드에 연결된 기수 정보가 없습니다');
        setIsLoading(false);
        return;
      }

      // 코드 사용 처리
      markCodeAsUsed(code);

      // 챌린지 자동 신청 (approved 상태로)
      const challengeStore = useChallengeStore.getState();
      await challengeStore.applyChallenge(result.cohortId);
      await challengeStore.approveChallenge(result.cohortId);

      // 온보딩 완료 처리 (Supabase에 저장)
      await completeOnboarding();

      // Home으로 이동 (사전 설문 버튼 보임)
      setIsLoading(false);
      navigate('/home');
    }, 500);
  };

  const handleSkip = () => {
    navigate('/apply');
  };

  return (
    <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Icon */}
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-headspace-blue to-headspace-purple rounded-3xl flex items-center justify-center shadow-soft-lg">
              <KeyRound className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-headspace-darkGray text-center mb-2">
            인증 코드 입력
          </h1>
          <p className="text-headspace-textMuted text-center mb-8">
            승인 메일로 받으신 6자리 코드를 입력해주세요
          </p>

          {/* Code Input */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-soft mb-6">
            <label className="block text-sm font-semibold text-headspace-darkGray mb-3">
              인증 코드
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                if (value.length <= 6) {
                  setCode(value);
                  setError('');
                }
              }}
              placeholder="예: ABC123"
              maxLength={6}
              className="w-full px-4 py-4 text-center text-2xl font-bold tracking-widest border-2 border-headspace-pastel-blue rounded-2xl focus:outline-none focus:border-headspace-blue transition-colors"
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 text-sm text-red-500"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </motion.div>
            )}

            <p className="mt-3 text-xs text-headspace-textMuted">
              💡 코드는 승인 메일로 발송되었습니다
            </p>
          </div>

          {/* Verify Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVerify}
            disabled={code.length !== 6 || isLoading}
            className="w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? '확인 중...' : '코드 확인하기'}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-headspace-textMuted/20" />
            <span className="text-sm text-headspace-textMuted">또는</span>
            <div className="flex-1 h-px bg-headspace-textMuted/20" />
          </div>

          {/* Apply Link */}
          <button
            onClick={handleSkip}
            className="w-full py-4 bg-white/80 backdrop-blur text-headspace-darkGray rounded-full font-semibold shadow-soft hover:shadow-soft-lg transition-all"
          >
            아직 신청 전이신가요? 신청하기 →
          </button>
        </motion.div>
      </div>
    </SkyBackground>
  );
}
