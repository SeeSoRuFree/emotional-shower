import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Heart, Calendar, FileText, Users } from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';

type OnboardingStep = 'welcome' | 'intro' | 'consent';

export default function Onboarding() {
  const navigate = useNavigate();
  const { currentCohort } = useChallengeStore();

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = () => {
    // 온보딩 완료 표시
    localStorage.setItem('hasCompletedOnboarding', 'true');
    // 사전 설문으로 이동
    navigate('/pre-survey');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-headspace-pastel-blue via-white to-headspace-pastel-green flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <AnimatePresence mode="wait">
            {/* Welcome Step */}
            {step === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl p-8 shadow-soft-lg text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-8xl mb-6"
                >
                  🌱
                </motion.div>

                <h1 className="text-3xl font-bold text-headspace-darkGray mb-4">
                  친절함을 연습하는 시간
                </h1>

                <p className="text-headspace-textMuted mb-8">
                  30일간 나와 타인에게 친절을 베푸는<br />
                  특별한 여정에 오신 것을 환영합니다
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep('intro')}
                  className="w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg"
                >
                  시작하기
                </motion.button>
              </motion.div>
            )}

            {/* Intro Step */}
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl p-8 shadow-soft-lg"
              >
                <h2 className="text-2xl font-bold text-headspace-darkGray mb-6 text-center">
                  {currentCohort?.name || '챌린지'} 소개
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4 p-4 bg-headspace-pastel-yellow rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-headspace-yellow flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-headspace-darkGray mb-1">30일 매일 기록</h3>
                      <p className="text-sm text-headspace-textMuted">
                        자기돌봄과 타인친절 행동을 매일 기록하며 습관을 만들어갑니다
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-headspace-pastel-blue rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-headspace-blue flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-headspace-darkGray mb-1">스탬프 수집</h3>
                      <p className="text-sm text-headspace-textMuted">
                        매일 완료 시 스탬프를 받아 30개를 모으는 재미
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-headspace-pastel-green rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-headspace-green flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-headspace-darkGray mb-1">성장 리포트</h3>
                      <p className="text-sm text-headspace-textMuted">
                        22일 이상 완료 시 사전/사후 비교 분석 리포트 제공
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-headspace-pastel-pink rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-headspace-pink flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-headspace-darkGray mb-1">기수별 커뮤니티</h3>
                      <p className="text-sm text-headspace-textMuted">
                        같은 달 참여자들과 감정을 나누고 서로 응원
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('consent')}
                  className="w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft flex items-center justify-center gap-2"
                >
                  다음
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {/* Consent Step */}
            {step === 'consent' && (
              <motion.div
                key="consent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl p-8 shadow-soft-lg"
              >
                <h2 className="text-2xl font-bold text-headspace-darkGray mb-4">
                  참여 동의 및 안내
                </h2>

                <div className="bg-gray-50 rounded-2xl p-6 mb-6 max-h-80 overflow-y-auto">
                  <h3 className="font-semibold text-headspace-darkGray mb-3">
                    📊 연구 목적 및 데이터 수집
                  </h3>
                  <div className="text-sm text-headspace-textMuted space-y-3">
                    <p>
                      본 챌린지는 <strong>사회실험</strong> 성격의 웰니스 프로그램으로,
                      자기돌봄과 타인친절이 마음 건강에 미치는 영향을 연구합니다.
                    </p>
                    <p>
                      다음 데이터가 수집됩니다:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>사전/사후 설문 응답 (웰빙, 만족도, 자기연민, 친절 척도)</li>
                      <li>일일 기록 데이터 (자기돌봄, 타인친절 행동)</li>
                      <li>커뮤니티 활동 내역 (게시글, 댓글)</li>
                    </ul>

                    <h3 className="font-semibold text-headspace-darkGray mb-2 mt-4">
                      🔒 개인정보 보호
                    </h3>
                    <p>
                      모든 데이터는 <strong>로컬스토리지</strong>에 저장되며,
                      개인을 식별할 수 있는 정보는 수집하지 않습니다.
                      참여자는 <strong>익명</strong>으로 처리됩니다.
                    </p>

                    <h3 className="font-semibold text-headspace-darkGray mb-2 mt-4">
                      ✅ 자발적 참여
                    </h3>
                    <p>
                      참여는 자발적이며, 언제든지 중단할 수 있습니다.
                      중단 시에도 불이익은 없습니다.
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-3 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 accent-headspace-blue"
                  />
                  <span className="text-sm text-headspace-darkGray">
                    위 내용을 확인했으며, 자발적으로 참여에 동의합니다
                  </span>
                </label>

                <motion.button
                  whileHover={agreed ? { scale: 1.02 } : {}}
                  whileTap={agreed ? { scale: 0.98 } : {}}
                  onClick={handleSubmit}
                  disabled={!agreed}
                  className={`w-full py-4 rounded-full font-semibold shadow-soft flex items-center justify-center gap-2 ${
                    agreed
                      ? 'bg-gradient-to-r from-headspace-blue to-headspace-purple text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  동의하고 사전 설문 시작하기
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
