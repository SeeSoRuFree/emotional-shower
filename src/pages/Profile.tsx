import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Calendar, Heart, Award, Target,
  ChevronRight, LogOut, Settings as SettingsIcon,
  Sparkles, CheckCircle2, BarChart3, Trash2, Info
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
  const { records, loadRecords, initialized: recordsInitialized } = useDailyRecordStore();
  const { preSurvey, loadSurveys, initialized: surveysInitialized } = useSurveyStore();
  const [showSettings, setShowSettings] = useState(false);

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
    if (confirm('정말 로그아웃하시겠어요? 모든 데이터는 안전하게 클라우드에 저장되어 있습니다.')) {
      logout();
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm('⚠️ 정말 계정을 삭제하시겠어요?\n\n계정을 삭제하면 다음 데이터가 영구적으로 삭제됩니다:\n- 계정 정보 (이름, 이메일)\n- 챌린지 진행 기록\n- 일일 기록 데이터\n- 설문 응답\n- 커뮤니티 게시글/댓글\n\n이 작업은 되돌릴 수 없습니다.')) {
      if (confirm('한 번 더 확인합니다. 정말로 계정을 삭제하시겠어요?')) {
        // TODO: Implement Supabase account deletion
        // This will need to delete user data from all tables via RLS or admin API
        alert('계정 삭제 기능은 추후 구현될 예정입니다.');

        // For now, just logout
        logout();
        navigate('/intro');
      }
    }
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-headspace-beige to-white md:pt-16">
        <div className="sticky top-0 md:top-16 bg-white/90 backdrop-blur shadow-soft z-20">
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
          {/* Account Management */}
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-bold text-headspace-darkGray mb-4">계정 관리</h3>

            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 bg-headspace-pastel-blue rounded-2xl hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-headspace-blue" />
                  <span className="font-medium text-headspace-darkGray">로그아웃</span>
                </div>
                <ChevronRight className="w-5 h-5 text-headspace-textMuted" />
              </button>

              <button
                onClick={handleDeleteAccount}
                className="w-full flex items-center justify-between p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <div className="text-left">
                    <p className="font-medium text-headspace-darkGray">계정 삭제</p>
                    <p className="text-xs text-red-600">모든 데이터가 영구적으로 삭제됩니다</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-headspace-textMuted" />
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-bold text-headspace-darkGray mb-4">앱 정보</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-headspace-pastel-purple rounded-2xl">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-headspace-purple" />
                  <span className="font-medium text-headspace-darkGray">버전</span>
                </div>
                <span className="text-sm font-mono text-headspace-textMuted">1.0.0</span>
              </div>
            </div>
          </div>

          {/* Data Privacy Info */}
          <div className="bg-gradient-to-r from-headspace-pastel-blue to-headspace-pastel-purple rounded-3xl p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-headspace-purple flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-headspace-darkGray mb-2">안전한 데이터 보관</h3>
                <p className="text-sm text-headspace-textMuted leading-relaxed">
                  모든 데이터는 안전한 클라우드 데이터베이스에 암호화되어 저장되며,
                  행 레벨 보안(RLS)으로 보호됩니다. 연구 목적 외에는 사용되지 않습니다.
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
    <div className="min-h-screen bg-gradient-to-b from-headspace-beige to-white md:pt-16">
      {/* Header */}
      <div className="sticky top-0 md:top-16 bg-white/90 backdrop-blur shadow-soft z-20">
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
        {/* Account Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-headspace-blue to-headspace-purple flex items-center justify-center text-white text-2xl font-bold">
              {currentUser?.name.charAt(0) || '?'}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-headspace-darkGray text-lg">{currentUser?.name}</h2>
              <p className="text-sm text-headspace-textMuted">{currentUser?.email}</p>
            </div>
          </div>

          <div className="bg-headspace-pastel-blue/30 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-headspace-darkGray">참여 기수</span>
              <span className="text-sm font-bold text-headspace-blue">
                {currentCohort?.name || '-'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Challenge Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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

        {/* Challenge History */}
        {currentUser && currentUser.cohortHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-headspace-purple" />
              <h3 className="font-bold text-headspace-darkGray">챌린지 히스토리</h3>
            </div>

            <div className="space-y-3">
              {currentUser.cohortHistory.map((history) => {
                const cohort = history.cohortId ? getCohortById(history.cohortId) : null;
                const challenge = history.cohortId ? getCurrentChallenge(history.cohortId) : undefined;
                const stampsCount = challenge?.completedDays.length || 0;
                const completionRate = Math.round((stampsCount / 30) * 100);

                return (
                  <div
                    key={history.cohortId}
                    className={`p-4 rounded-2xl border-2 ${
                      history.status === 'completed' ? 'bg-green-50 border-green-200' :
                      history.status === 'active' ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-headspace-darkGray">
                        {cohort?.name || history.cohortId}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        history.status === 'completed' ? 'bg-green-200 text-green-800' :
                        history.status === 'active' ? 'bg-blue-200 text-blue-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {history.status === 'completed' ? '완료' :
                         history.status === 'active' ? '진행 중' :
                         '실패'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white rounded-lg p-2">
                        <div className="text-lg font-bold text-headspace-blue">{stampsCount}</div>
                        <div className="text-xs text-headspace-textMuted">스탬프</div>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <div className="text-lg font-bold text-headspace-purple">{completionRate}%</div>
                        <div className="text-xs text-headspace-textMuted">진행률</div>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <div className="text-lg font-bold text-headspace-green">
                          {history.status === 'completed' && stampsCount >= 22 ? '✓' : '-'}
                        </div>
                        <div className="text-xs text-headspace-textMuted">리포트</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
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
            transition={{ delay: 0.4 }}
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
            transition={{ delay: 0.5 }}
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
            transition={{ delay: 0.6 }}
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
            transition={{ delay: 0.7 }}
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
            transition={{ delay: 0.8 }}
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
            transition={{ delay: 0.9 }}
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
            transition={{ delay: 1.0 }}
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
