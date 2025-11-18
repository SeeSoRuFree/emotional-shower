import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, Sparkles, Heart, Users, FileText } from 'lucide-react';
import ResponsiveNav from '@/components/common/ResponsiveNav';
import StampBoard from '@/components/challenge/StampBoard';
import ProgressBar from '@/components/challenge/ProgressBar';
import SkyBackground from '@/components/cloud/SkyBackground';
import { useChallengeStore } from '@/store/challengeStore';
import { useDailyRecordStore } from '@/store/dailyRecordStore';
import { useSurveyStore } from '@/store/surveyStore';

// Decorative floating elements
const FloatingShape = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{
      opacity: [0.2, 0.4, 0.2],
      y: [-20, 20, -20],
      rotate: [0, 180, 360]
    }}
    transition={{
      duration: 10,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute w-20 h-20 bg-gradient-to-br from-headspace-pastel-yellow/30 to-headspace-pastel-pink/30 rounded-full blur-xl"
    style={{
      left: `${Math.random() * 80}%`,
      top: `${Math.random() * 60 + 10}%`
    }}
  />
);

export default function Home() {
  const navigate = useNavigate();

  const {
    currentCohort,
    userChallenge,
    approveChallenge,
    canStartPreSurvey,
    calculateCurrentDay,
    canAccessReport
  } = useChallengeStore();

  const { getTodayRecord } = useDailyRecordStore();
  const { preSurvey, postSurvey } = useSurveyStore();

  const [currentDay, setCurrentDay] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(false);

  useEffect(() => {
    if (userChallenge) {
      const day = calculateCurrentDay();
      setCurrentDay(day);

      // Check if today's record is completed
      const todayRecord = getTodayRecord(day);
      setTodayCompleted(todayRecord?.isCompleted || false);

      // If DAY 30 and all days completed but no post-survey, redirect to post-survey
      if (day === 30 && userChallenge.completedDays.length >= 22 && !postSurvey && userChallenge.status === 'active') {
        navigate('/post-survey');
      }
    }
  }, [userChallenge, calculateCurrentDay, getTodayRecord, postSurvey, navigate]);

  // 1) 미신청 상태 - 신청 안내
  if (!userChallenge) {
    return (
      <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <FloatingShape key={i} delay={i * 2} />
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              🌱
            </motion.div>

            <h1 className="text-3xl font-bold text-headspace-darkGray mb-4">
              친절함을 연습하는 시간
            </h1>

            <p className="text-headspace-textMuted mb-2">
              {currentCohort ? `${currentCohort.name}` : '챌린지'}에 오신 것을 환영합니다
            </p>

            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-soft mt-6 mb-8">
              <h2 className="font-bold text-headspace-darkGray mb-4">
                30일 동안 무엇을 하나요?
              </h2>
              <div className="space-y-3 text-left text-sm text-headspace-textMuted">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-headspace-pastel-yellow flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-headspace-yellow" />
                  </div>
                  <div>
                    <strong className="text-headspace-darkGray">자기돌봄</strong>과 <strong className="text-headspace-darkGray">타인친절</strong>을 매일 기록합니다
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-headspace-pastel-blue flex items-center justify-center flex-shrink-0">
                    <CalendarCheck className="w-4 h-4 text-headspace-blue" />
                  </div>
                  <div>
                    <strong className="text-headspace-darkGray">30개의 스탬프</strong>를 모으며 여정을 완성합니다
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-headspace-pastel-green flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-headspace-green" />
                  </div>
                  <div>
                    <strong className="text-headspace-darkGray">22일 이상 완료</strong> 시 나만의 분석 리포트를 받습니다
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/onboarding')}
              className="w-full max-w-sm py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg"
            >
              챌린지 신청하기 →
            </motion.button>

            <p className="text-xs text-headspace-textMuted mt-4">
              💡 신청 → 승인 → 사전 설문 완료 후 챌린지 시작
            </p>
          </motion.div>
        </div>

        <ResponsiveNav />
      </SkyBackground>
    );
  }

  // 2) 승인 대기 상태
  if (userChallenge.status === 'waiting') {
    return (
      <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <FloatingShape key={i} delay={i * 2} />
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl mb-6"
            >
              🕐
            </motion.div>

            <h1 className="text-3xl font-bold text-headspace-darkGray mb-4">
              승인 대기 중
            </h1>

            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-soft mt-6 mb-8">
              <p className="text-headspace-textMuted mb-4">
                {currentCohort?.name} 신청이 완료되었습니다
              </p>
              <p className="text-sm text-headspace-textMuted">
                곧 승인 안내를 보내드릴게요
              </p>
            </div>

            {/* 테스트용 승인 버튼 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={approveChallenge}
              className="w-full max-w-sm py-4 bg-gradient-to-r from-headspace-green to-green-400 text-white rounded-full font-semibold shadow-soft-lg"
            >
              [테스트] 승인하기
            </motion.button>

            <p className="text-xs text-headspace-textMuted mt-4">
              ⚡ 테스트용 승인 버튼입니다
            </p>
          </motion.div>
        </div>

        <ResponsiveNav />
      </SkyBackground>
    );
  }

  // 3) 승인 완료, 사전 설문 대기
  if (userChallenge.status === 'approved') {
    return (
      <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <FloatingShape key={i} delay={i * 2} />
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              ✅
            </motion.div>

            <h1 className="text-3xl font-bold text-headspace-darkGray mb-4">
              승인 완료!
            </h1>

            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-soft mt-6 mb-8">
              <p className="text-headspace-darkGray font-semibold mb-3">
                {currentCohort?.name}
              </p>
              <p className="text-headspace-textMuted mb-4">
                사전 설문을 완료하면 챌린지가 시작됩니다
              </p>
              <p className="text-sm text-headspace-textMuted">
                설문은 약 10분 정도 소요됩니다
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/pre-survey')}
              className="w-full max-w-sm py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg"
            >
              사전 설문 시작하기 →
            </motion.button>

            <p className="text-xs text-headspace-textMuted mt-4">
              📝 설문 완료 후 DAY 1 기록을 시작할 수 있어요
            </p>
          </motion.div>
        </div>

        <ResponsiveNav />
      </SkyBackground>
    );
  }

  // 4) active 상태인데 사전 설문 미완료
  if (userChallenge.status === 'active' && !preSurvey) {
    return (
      <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <FloatingShape key={i} delay={i * 2} />
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 pb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              📝
            </motion.div>

            <h1 className="text-3xl font-bold text-headspace-darkGray mb-4">
              사전 설문 필요
            </h1>

            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-soft mt-6 mb-8">
              <p className="text-headspace-textMuted mb-4">
                DAY 1 기록을 시작하기 전에
              </p>
              <p className="text-sm text-headspace-darkGray font-semibold">
                사전 설문을 완료해주세요
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/pre-survey')}
              className="w-full max-w-sm py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg"
            >
              사전 설문 시작하기 →
            </motion.button>

            <p className="text-xs text-headspace-textMuted mt-4">
              ⏱️ 약 10분 소요됩니다
            </p>
          </motion.div>
        </div>

        <ResponsiveNav />
      </SkyBackground>
    );
  }

  // Challenge started - show stamp board dashboard
  return (
    <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col md:pt-16">
      {/* Floating decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(2)].map((_, i) => (
          <FloatingShape key={i} delay={i * 3} />
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 px-6 py-6 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-headspace-yellow" />
          </motion.div>
          <h1 className="text-xl font-bold text-headspace-darkGray">
            {currentCohort?.name || '챌린지'}
          </h1>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="px-4 py-2 bg-white/80 backdrop-blur rounded-full shadow-soft">
            <span className="text-sm font-semibold text-headspace-purple">
              DAY {currentDay}
            </span>
          </div>

          {todayCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-4 py-2 bg-gradient-to-r from-headspace-green to-green-400 rounded-full shadow-soft"
            >
              <span className="text-sm font-semibold text-white">
                ✓ 오늘 완료
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 px-6 flex-1 overflow-y-auto pb-32 space-y-6">
        {/* Today's action button */}
        {!todayCompleted && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/daily-record')}
            className="w-full bg-gradient-to-r from-headspace-yellow to-yellow-400 text-headspace-darkGray rounded-3xl p-6 shadow-soft-lg"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-bold text-lg mb-1">오늘의 기록 작성하기</h3>
                <p className="text-sm opacity-80">
                  DAY {currentDay}의 자기돌봄과 타인친절을 기록해보세요
                </p>
              </div>
              <CalendarCheck className="w-8 h-8" />
            </div>
          </motion.button>
        )}

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProgressBar
            completedCount={userChallenge.completedDays.length}
            targetCount={22}
            canAccessReport={canAccessReport()}
          />
        </motion.div>

        {/* Stamp Board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StampBoard
            completedDays={userChallenge.completedDays}
            currentDay={currentDay}
            onDayClick={(day) => {
              if (day === currentDay && !todayCompleted) {
                navigate('/daily-record');
              }
            }}
          />
        </motion.div>

        {/* Community quick link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => navigate('/community')}
            className="w-full bg-white/80 backdrop-blur rounded-3xl p-6 shadow-soft hover:shadow-soft-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-headspace-pastel-purple to-headspace-pastel-blue flex items-center justify-center">
                  <Users className="w-6 h-6 text-headspace-purple" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-headspace-darkGray">공동 샤워방</h3>
                  <p className="text-sm text-headspace-textMuted">
                    같은 기수 참여자들과 감정 나누기
                  </p>
                </div>
              </div>
              <span className="text-2xl">→</span>
            </div>
          </button>
        </motion.div>

        {/* Report access (if eligible) */}
        {canAccessReport() && userChallenge.status === 'completed' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/report')}
            className="w-full bg-gradient-to-r from-headspace-purple to-headspace-blue text-white rounded-3xl p-6 shadow-soft-lg"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-bold text-lg mb-1">🎉 나의 분석 리포트 보기</h3>
                <p className="text-sm opacity-90">
                  30일간의 여정을 분석한 리포트를 확인하세요
                </p>
              </div>
              <FileText className="w-8 h-8" />
            </div>
          </motion.button>
        )}
      </div>

      <ResponsiveNav />
    </SkyBackground>
  );
}
