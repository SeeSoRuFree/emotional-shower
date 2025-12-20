import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, Sparkles, Heart, Users, FileText, Check } from 'lucide-react';
import ResponsiveNav from '@/components/common/ResponsiveNav';
import StampBoard from '@/components/challenge/StampBoard';
import ProgressBar from '@/components/challenge/ProgressBar';
import SkyBackground from '@/components/cloud/SkyBackground';
import DayRecordModal from '@/components/daily/DayRecordModal';
import { useChallengeStore } from '@/store/challengeStore';
import { useCohortStore } from '@/store/cohortStore';
import { useAuthStore } from '@/store/authStore';
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

  const { currentUser } = useAuthStore();
  const cohortId = currentUser?.currentCohortId;

  const {
    loadChallenges,
    initialized,
    getCurrentChallenge,
    canStartPreSurvey,
    calculateCurrentDay,
    canAccessReport
  } = useChallengeStore();

  const { getCohortById } = useCohortStore();
  const { getTodayRecord, loadRecords, initialized: recordsInitialized } = useDailyRecordStore();
  const { preSurvey, postSurvey, loadSurveys, initialized: surveysInitialized } = useSurveyStore();

  const userChallenge = cohortId ? getCurrentChallenge(cohortId) : undefined;
  const currentCohort = cohortId ? getCohortById(cohortId) : null;

  const [currentDay, setCurrentDay] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showDay1Celebration, setShowDay1Celebration] = useState(false);

  // Load challenges on mount (강제 리로드 옵션 추가)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forceReload = params.get('reload') === 'true';

    if (!initialized || forceReload) {
      console.log('🔄 [Home] loadChallenges 호출:', { initialized, forceReload });
      loadChallenges();

      // reload 플래그 제거 (URL 정리)
      if (forceReload) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [initialized, loadChallenges]);

  // Load daily records on mount
  useEffect(() => {
    if (!recordsInitialized) {
      loadRecords();
    }
  }, [recordsInitialized, loadRecords]);

  // Load surveys on mount
  useEffect(() => {
    if (!surveysInitialized) {
      loadSurveys();
    }
  }, [surveysInitialized, loadSurveys]);

  useEffect(() => {
    if (userChallenge && cohortId) {
      const day = calculateCurrentDay(cohortId);
      console.log('🏠 [Home] useEffect 실행:', {
        day,
        completedDays: userChallenge.completedDays,
        completedDaysLength: userChallenge.completedDays.length
      });
      setCurrentDay(day);

      // Check if today's record is completed
      const todayRecord = getTodayRecord(day);
      setTodayCompleted(todayRecord?.isCompleted || false);
    }
  }, [userChallenge, cohortId, calculateCurrentDay, getTodayRecord]);

  // DAY 1 완료 축하 화면 체크
  useEffect(() => {
    if (!userChallenge || !cohortId) return;

    const hasSeenKey = `day1-celebration-seen-${cohortId}`;
    const hasSeen = localStorage.getItem(hasSeenKey) === 'true';

    if (
      userChallenge.completedDays.includes(1) &&
      currentDay === 2 &&
      !hasSeen
    ) {
      setShowDay1Celebration(true);
    }
  }, [userChallenge, cohortId, currentDay]);

  // DAY 1 완료 축하 화면
  if (showDay1Celebration) {
    return (
      <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col md:pt-16">
        <div className="flex-1 flex items-center justify-center p-6 pb-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="text-center max-w-md"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-6"
            >
              🎉
            </motion.div>

            <h1 className="text-4xl font-bold text-headspace-darkGray mb-4">축하합니다!</h1>
            <p className="text-lg text-headspace-textMuted mb-2">
              DAY 1 설문을 완료했습니다
            </p>

            <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-soft-lg mt-8 mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                  <Check className="w-7 h-7 text-white" strokeWidth={3} />
                </div>
                <div className="text-left">
                  <p className="text-sm text-headspace-textMuted">DAY 1</p>
                  <p className="font-bold text-headspace-darkGray">설문 완료</p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-headspace-blue to-transparent mb-4" />

              <div className="space-y-3 text-sm text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-headspace-pastel-yellow flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CalendarCheck className="w-4 h-4 text-headspace-yellow" />
                  </div>
                  <div>
                    <strong className="text-headspace-darkGray">DAY 2부터 본격 시작!</strong>
                    <p className="text-xs mt-1 text-headspace-textMuted">매일 자기돌봄과 타인친절을 기록합니다</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-headspace-pastel-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-headspace-blue" />
                  </div>
                  <div>
                    <strong className="text-headspace-darkGray">매일 3-5분 투자</strong>
                    <p className="text-xs mt-1 text-headspace-textMuted">간단한 기록으로 스탬프를 받습니다</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-headspace-pastel-green flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Heart className="w-4 h-4 text-headspace-green" />
                  </div>
                  <div>
                    <strong className="text-headspace-darkGray">30개 스탬프 목표</strong>
                    <p className="text-xs mt-1 text-headspace-textMuted">22개 이상 모으면 성장 리포트를 받습니다</p>
                  </div>
                </div>
              </div>

              <div className="bg-headspace-pastel-blue/30 rounded-xl p-3 mt-4">
                <p className="text-xs text-center text-headspace-darkGray">
                  💡 <strong>TIP</strong>: 매일 같은 시간에 기록하면 습관 형성에 도움이 됩니다
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                localStorage.setItem(`day1-celebration-seen-${cohortId}`, 'true');
                setShowDay1Celebration(false);
              }}
              className="w-full max-w-sm py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-bold shadow-soft-lg flex items-center justify-center gap-2"
            >
              챌린지 대시보드로 이동 →
            </motion.button>

            <p className="text-xs text-headspace-textMuted mt-4">
              🌱 30일간의 성장 여정을 응원합니다
            </p>
          </motion.div>
        </div>
        <ResponsiveNav />
      </SkyBackground>
    );
  }

  // 1) 미신청 상태 - DAY 1 설문 안내
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
              30일 친절 챌린지
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
              onClick={() => navigate('/pre-survey')}
              className="w-full max-w-sm py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg"
            >
              DAY 1 설문 시작하기 →
            </motion.button>

            <p className="text-xs text-headspace-textMuted mt-4">
              💡 DAY 1 설문 완료 → DAY 2 기록 시작
            </p>
          </motion.div>
        </div>

        <ResponsiveNav />
      </SkyBackground>
    );
  }

  // 2) DAY 1 설문 미완료 상태 (active 상태인데 DAY 1 설문 미완료)
  if (userChallenge.status === 'active' && !preSurvey && !userChallenge.completedDays.includes(1)) {
    return (
      <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <FloatingShape key={i} delay={i * 2} />
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 pt-20 md:pt-32 pb-32 relative z-10">
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
              🌱 챌린지의 첫 시작
            </h1>

            <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-soft mt-6 mb-8 text-left">
              <h2 className="font-bold text-headspace-darkGray mb-3 text-center">
                DAY 1 설문으로 챌린지를 시작합니다
              </h2>

              <div className="space-y-3 text-sm text-headspace-textMuted">
                <p>
                  <strong className="text-headspace-darkGray">DAY 1</strong>은 설문으로 시작합니다.
                  약 10분 정도 소요되는 설문이지만, 30일 후 변화를 측정하기 위해
                  <strong className="text-headspace-darkGray"> 진지하게 답변</strong>해주세요.
                </p>

                <div className="bg-headspace-pastel-blue/30 rounded-xl p-3">
                  <p className="text-xs">
                    📅 <strong className="text-headspace-darkGray">DAY 2-29</strong>: 매일 3-5분 자기돌봄과 타인친절 기록<br/>
                    📝 <strong className="text-headspace-darkGray">DAY 30</strong>: 동일한 설문을 다시 진행하여 변화 측정
                  </p>
                </div>

                <p className="text-xs text-center text-headspace-darkGray">
                  지금 시작하는 설문이 여러분의 성장을 측정하는 기준점이 됩니다
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/pre-survey')}
              className="w-full max-w-sm py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg"
            >
              DAY 1 설문 시작하기 →
            </motion.button>

            <p className="text-xs text-headspace-textMuted mt-4">
              ⏱️ 약 10분 소요 · 34개 문항
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
        {/* Today's action button - DAY 1-30 전체에 표시 */}
        {!todayCompleted && currentDay >= 1 && currentDay <= 30 && (userChallenge.status === 'active' || userChallenge.status === 'approved') && (() => {
          // 버튼 클릭 핸들러
          const handleTodayRecordClick = () => {
            if (!cohortId) return;

            const day = calculateCurrentDay(cohortId);

            // DAY 1: 설문
            if (day === 1) {
              navigate('/pre-survey');
              return;
            }

            // DAY 2-29: 기록
            if (day >= 2 && day <= 29) {
              navigate('/daily-record');
              return;
            }

            // DAY 30: 설문
            if (day === 30) {
              navigate('/post-survey');
              return;
            }
          };

          // 버튼 텍스트 동적 표시
          const getButtonText = () => {
            if (currentDay === 1) return 'DAY 1 설문 시작';
            if (currentDay === 30) return 'DAY 30 설문 시작';
            return '오늘의 기록 작성하기';
          };

          const getButtonDescription = () => {
            if (currentDay === 1) return '30일 챌린지 시작 전 현재 상태를 측정합니다';
            if (currentDay === 30) return '30일 챌린지 완료 후 변화를 측정합니다';
            return `DAY ${currentDay}의 자기돌봄과 타인친절을 기록해보세요`;
          };

          return (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTodayRecordClick}
              className={`w-full rounded-3xl p-6 shadow-soft-lg ${
                currentDay === 1 || currentDay === 30
                  ? 'bg-gradient-to-r from-headspace-blue to-headspace-purple text-white'
                  : 'bg-gradient-to-r from-headspace-yellow to-yellow-400 text-headspace-darkGray'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="font-bold text-lg mb-1">{getButtonText()}</h3>
                  <p className={`text-sm ${currentDay === 1 || currentDay === 30 ? 'opacity-90' : 'opacity-80'}`}>
                    {getButtonDescription()}
                  </p>
                </div>
                {currentDay === 1 || currentDay === 30 ? (
                  <FileText className="w-8 h-8" />
                ) : (
                  <CalendarCheck className="w-8 h-8" />
                )}
              </div>
            </motion.button>
          );
        })()}

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProgressBar
            completedCount={userChallenge.completedDays.length}
            targetCount={22}
            canAccessReport={cohortId ? canAccessReport(cohortId) : false}
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
              } else if (userChallenge.completedDays.includes(day)) {
                setSelectedDay(day);
                setShowRecordModal(true);
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
        {cohortId && canAccessReport(cohortId) && userChallenge.status === 'completed' && (
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

      {/* Day Record Modal */}
      {showRecordModal && selectedDay && (
        <DayRecordModal
          day={selectedDay}
          onClose={() => {
            setShowRecordModal(false);
            setSelectedDay(null);
          }}
        />
      )}
    </SkyBackground>
  );
}
