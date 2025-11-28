import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Calendar, Heart, Award, Target,
  ChevronRight, LogOut, Settings as SettingsIcon,
  Sparkles, CheckCircle2, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ResponsiveNav from '@/components/common/ResponsiveNav';
import { useChallengeStore } from '@/store/challengeStore';
import { useCohortStore } from '@/store/cohortStore';
import { useDailyRecordStore } from '@/store/dailyRecordStore';
import { useSurveyStore } from '@/store/surveyStore';
import { useAuthStore } from '@/store/authStore';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();
  const cohortId = currentUser?.currentCohortId;

  const { getCurrentChallenge, calculateCurrentDay, canAccessReport } = useChallengeStore();
  const { getCohortById } = useCohortStore();
  const { records } = useDailyRecordStore();
  const { preSurvey } = useSurveyStore();
  const [showSettings, setShowSettings] = useState(false);

  const userChallenge = cohortId ? getCurrentChallenge(cohortId) : undefined;
  const currentCohort = cohortId ? getCohortById(cohortId) : null;

  const currentDay = userChallenge && cohortId ? calculateCurrentDay(cohortId) : 0;
  const completionRate = userChallenge ? Math.round((userChallenge.completedDays.length / 30) * 100) : 0;
  const hasReport = cohortId ? canAccessReport(cohortId) : false;

  // Calculate favorite actions
  const getFavoriteActions = () => {
    const selfCareCount: Record<string, number> = {};
    const kindnessCount: Record<string, number> = {};

    records.forEach(record => {
      record.selfCareActions.forEach(action => {
        selfCareCount[action.label] = (selfCareCount[action.label] || 0) + 1;
      });
      record.kindnessActions.forEach(action => {
        kindnessCount[action.label] = (kindnessCount[action.label] || 0) + 1;
      });
    });

    const topSelfCare = Object.entries(selfCareCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topKindness = Object.entries(kindnessCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return { topSelfCare, topKindness };
  };

  const { topSelfCare, topKindness } = getFavoriteActions();

  // Calculate streak
  const calculateStreak = () => {
    if (!userChallenge || userChallenge.completedDays.length === 0) return 0;

    const sorted = [...userChallenge.completedDays].sort((a, b) => b - a);
    let streak = 1;

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i] - sorted[i + 1] === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  const handleLogout = () => {
    if (confirm('정말 로그아웃하시겠어요? 모든 데이터는 브라우저에 안전하게 저장됩니다.')) {
      logout();
      navigate('/login');
    }
  };

  const handleResetData = () => {
    if (confirm('정말 모든 챌린지 데이터를 초기화하시겠어요? 이 작업은 되돌릴 수 없습니다.')) {
      if (confirm('한 번 더 확인합니다. 정말로 진행하시겠어요?')) {
        localStorage.removeItem('kindness-challenge');
        localStorage.removeItem('kindness-daily-records');
        localStorage.removeItem('kindness-surveys');
        localStorage.removeItem('hasCompletedOnboarding');
        navigate('/onboarding');
      }
    }
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-headspace-beige to-white">
        <div className="sticky top-0 bg-white/90 backdrop-blur shadow-soft z-20">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowSettings(false)}
                className="text-headspace-textMuted hover:text-headspace-darkGray"
              >
                ← 돌아가기
              </button>
              <h1 className="font-bold text-headspace-darkGray">설정</h1>
              <div className="w-16" />
            </div>
          </div>
        </div>

        <div className="px-6 py-6 pb-32 space-y-4">
          {/* Data Management */}
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-bold text-headspace-darkGray mb-4">데이터 관리</h3>

            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 bg-headspace-pastel-yellow rounded-2xl hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-headspace-yellow" />
                  <span className="font-medium text-headspace-darkGray">로그아웃</span>
                </div>
                <ChevronRight className="w-5 h-5 text-headspace-textMuted" />
              </button>

              <button
                onClick={handleResetData}
                className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <SettingsIcon className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-headspace-darkGray">데이터 초기화</span>
                </div>
                <ChevronRight className="w-5 h-5 text-headspace-textMuted" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-gradient-to-r from-headspace-pastel-blue to-headspace-pastel-purple rounded-3xl p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-headspace-purple flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-headspace-darkGray mb-2">안전한 데이터 보관</h3>
                <p className="text-sm text-headspace-textMuted leading-relaxed">
                  모든 데이터는 브라우저 로컬 스토리지에만 저장되며, 외부 서버로 전송되지 않습니다.
                  브라우저 데이터를 삭제하면 기록도 함께 사라지니 주의해주세요.
                </p>
              </div>
            </div>
          </div>
        </div>

        <ResponsiveNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-headspace-beige to-white">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur shadow-soft z-20">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-headspace-darkGray">내 챌린지</h1>
              <p className="text-sm text-headspace-textMuted mt-1">
                {currentCohort?.name || '챌린지'} 참여 중
              </p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-full bg-headspace-pastel-blue hover:bg-blue-100 transition-colors"
            >
              <SettingsIcon className="w-5 h-5 text-headspace-blue" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 pb-32 space-y-6">
        {/* Challenge Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-headspace-blue to-headspace-purple rounded-3xl p-6 shadow-soft-lg text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm">현재 진행 상황</p>
                <p className="font-bold text-2xl">DAY {currentDay}/30</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm">완료율</p>
              <p className="font-bold text-3xl">{completionRate}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-white rounded-full"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-white/90">
              🎯 {userChallenge?.completedDays.length || 0}개 스탬프 획득
            </span>
            <span className="text-white/90">
              {hasReport ? '🏆 리포트 가능' : `${Math.max(0, 22 - (userChallenge?.completedDays.length || 0))}개 더 필요`}
            </span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-5 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-headspace-pastel-yellow flex items-center justify-center">
                <Target className="w-5 h-5 text-headspace-yellow" />
              </div>
              <span className="text-sm text-headspace-textMuted">연속 기록</span>
            </div>
            <p className="text-3xl font-bold text-headspace-darkGray">{currentStreak}</p>
            <p className="text-xs text-headspace-textMuted mt-1">일 연속</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-5 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-headspace-pastel-green flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-headspace-green" />
              </div>
              <span className="text-sm text-headspace-textMuted">총 기록</span>
            </div>
            <p className="text-3xl font-bold text-headspace-darkGray">{records.length}</p>
            <p className="text-xs text-headspace-textMuted mt-1">일 완료</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-5 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-headspace-pastel-pink flex items-center justify-center">
                <Heart className="w-5 h-5 text-headspace-pink" />
              </div>
              <span className="text-sm text-headspace-textMuted">자기돌봄</span>
            </div>
            <p className="text-3xl font-bold text-headspace-darkGray">
              {records.reduce((sum, r) => sum + r.selfCareActions.length, 0)}
            </p>
            <p className="text-xs text-headspace-textMuted mt-1">회 실천</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-5 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-headspace-pastel-purple flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-headspace-purple" />
              </div>
              <span className="text-sm text-headspace-textMuted">타인친절</span>
            </div>
            <p className="text-3xl font-bold text-headspace-darkGray">
              {records.reduce((sum, r) => sum + r.kindnessActions.length, 0)}
            </p>
            <p className="text-xs text-headspace-textMuted mt-1">회 실천</p>
          </motion.div>
        </div>

        {/* Favorite Actions */}
        {topSelfCare.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-headspace-green" />
              <h3 className="font-bold text-headspace-darkGray">자주 하는 자기돌봄</h3>
            </div>
            <div className="space-y-2">
              {topSelfCare.map(([label, count], index) => (
                <div key={label} className="flex items-center justify-between p-3 bg-headspace-pastel-green rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                    <span className="font-medium text-headspace-darkGray">{label}</span>
                  </div>
                  <span className="text-sm text-headspace-textMuted">{count}회</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {topKindness.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-headspace-pink" />
              <h3 className="font-bold text-headspace-darkGray">자주 하는 타인친절</h3>
            </div>
            <div className="space-y-2">
              {topKindness.map(([label, count], index) => (
                <div key={label} className="flex items-center justify-between p-3 bg-headspace-pastel-pink rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                    <span className="font-medium text-headspace-darkGray">{label}</span>
                  </div>
                  <span className="text-sm text-headspace-textMuted">{count}회</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Report Access */}
        {hasReport && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/report')}
            className="w-full bg-gradient-to-r from-headspace-yellow to-headspace-orange rounded-3xl p-6 shadow-soft-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-lg">성장 리포트 보기</p>
                  <p className="text-white/90 text-sm">나의 30일 여정 분석</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
          </motion.button>
        )}

        {/* Milestone Message */}
        {!hasReport && userChallenge && userChallenge.completedDays.length >= 10 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-headspace-pastel-blue to-headspace-pastel-purple rounded-3xl p-6 shadow-soft"
          >
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-headspace-purple flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-headspace-darkGray mb-2">
                  {userChallenge.completedDays.length >= 10 ? '잘하고 있어요! 💪' : '화이팅! 🌟'}
                </h3>
                <p className="text-sm text-headspace-textMuted leading-relaxed">
                  {userChallenge.completedDays.length >= 10
                    ? `22일을 달성하면 나만의 성장 리포트를 받을 수 있어요. 앞으로 ${22 - userChallenge.completedDays.length}일 남았어요!`
                    : '매일 조금씩 기록하며 친절함을 연습해보세요. 작은 변화가 큰 성장을 만듭니다.'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <ResponsiveNav />
    </div>
  );
}
