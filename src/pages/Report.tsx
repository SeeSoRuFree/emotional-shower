import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award, TrendingUp, Heart, Sparkles, Calendar,
  ArrowLeft, Share2, Download, CheckCircle2, Target
} from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { useSurveyStore } from '@/store/surveyStore';
import { useDailyRecordStore } from '@/store/dailyRecordStore';

export default function Report() {
  const navigate = useNavigate();
  const { userChallenge, currentCohort, canAccessReport } = useChallengeStore();
  const { preSurvey, postSurvey, calculateScores } = useSurveyStore();
  const { records } = useDailyRecordStore();

  useEffect(() => {
    // Check if user can access report
    if (!canAccessReport() || !postSurvey) {
      navigate('/home');
    }
  }, [canAccessReport, postSurvey, navigate]);

  if (!preSurvey || !postSurvey || !userChallenge) {
    return null;
  }

  const preScores = calculateScores(preSurvey);
  const postScores = calculateScores(postSurvey);

  // Calculate improvements
  const flourishingChange = ((postScores.flourishing - preScores.flourishing) / preScores.flourishing) * 100;
  const satisfactionChange = ((postScores.satisfaction - preScores.satisfaction) / preScores.satisfaction) * 100;
  const compassionChange = ((postScores.compassion - preScores.compassion) / preScores.compassion) * 100;
  const kindnessChange = ((postScores.kindness - preScores.kindness) / preScores.kindness) * 100;

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
      .slice(0, 5);

    const topKindness = Object.entries(kindnessCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { topSelfCare, topKindness };
  };

  const { topSelfCare, topKindness } = getFavoriteActions();

  const handleShare = () => {
    alert('공유 기능은 추후 추가될 예정입니다!');
  };

  const handleDownload = () => {
    alert('다운로드 기능은 추후 추가될 예정입니다!');
  };

  const ScoreCard = ({
    title,
    icon,
    before,
    after,
    change,
    color,
    pastelColor
  }: {
    title: string;
    icon: React.ReactNode;
    before: number;
    after: number;
    change: number;
    color: string;
    pastelColor: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-soft"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full ${pastelColor} flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="font-bold text-headspace-darkGray">{title}</h3>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-headspace-textMuted mb-1">사전</p>
          <p className="text-2xl font-bold text-headspace-darkGray">{before.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-xs text-headspace-textMuted mb-1">사후</p>
          <p className="text-2xl font-bold text-headspace-darkGray">{after.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-xs text-headspace-textMuted mb-1">변화</p>
          <p className={`text-2xl font-bold ${change >= 0 ? color : 'text-red-500'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: `${(before / 5) * 100}%` }}
          animate={{ width: `${(after / 5) * 100}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          className={`h-full ${color.replace('text-', 'bg-')} rounded-full`}
        />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-headspace-pastel-yellow via-white to-headspace-pastel-pink">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur shadow-soft z-20">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/home')}
              className="p-2 rounded-xl hover:bg-headspace-pastel-blue transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-headspace-darkGray" />
            </button>

            <h1 className="font-bold text-headspace-darkGray">성장 리포트</h1>

            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl hover:bg-headspace-pastel-blue transition-colors"
              >
                <Share2 className="w-5 h-5 text-headspace-blue" />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 rounded-xl hover:bg-headspace-pastel-green transition-colors"
              >
                <Download className="w-5 h-5 text-headspace-green" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 pb-32 space-y-6">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-headspace-yellow to-headspace-orange rounded-3xl p-8 shadow-soft-lg text-white text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🏆
          </motion.div>
          <h1 className="text-3xl font-bold mb-3">
            30일 챌린지 완주!
          </h1>
          <p className="text-white/90 text-lg mb-2">
            {currentCohort?.name}
          </p>
          <p className="text-white/80 text-sm">
            {userChallenge.completedDays.length}일 동안 친절을 실천하셨어요
          </p>
        </motion.div>

        {/* Achievement Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-soft"
        >
          <h2 className="font-bold text-headspace-darkGray text-lg mb-4">📊 챌린지 요약</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-headspace-pastel-blue rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-headspace-blue" />
                <span className="text-xs text-headspace-textMuted">완료일</span>
              </div>
              <p className="text-2xl font-bold text-headspace-darkGray">
                {userChallenge.completedDays.length}
              </p>
              <p className="text-xs text-headspace-textMuted">/ 30일</p>
            </div>

            <div className="bg-headspace-pastel-green rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-headspace-green" />
                <span className="text-xs text-headspace-textMuted">자기돌봄</span>
              </div>
              <p className="text-2xl font-bold text-headspace-darkGray">
                {records.reduce((sum, r) => sum + r.selfCareActions.length, 0)}
              </p>
              <p className="text-xs text-headspace-textMuted">회 실천</p>
            </div>

            <div className="bg-headspace-pastel-pink rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-headspace-pink" />
                <span className="text-xs text-headspace-textMuted">타인친절</span>
              </div>
              <p className="text-2xl font-bold text-headspace-darkGray">
                {records.reduce((sum, r) => sum + r.kindnessActions.length, 0)}
              </p>
              <p className="text-xs text-headspace-textMuted">회 실천</p>
            </div>

            <div className="bg-headspace-pastel-yellow rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-headspace-yellow" />
                <span className="text-xs text-headspace-textMuted">완료율</span>
              </div>
              <p className="text-2xl font-bold text-headspace-darkGray">
                {Math.round((userChallenge.completedDays.length / 30) * 100)}%
              </p>
              <p className="text-xs text-headspace-textMuted">달성</p>
            </div>
          </div>
        </motion.div>

        {/* Before/After Scores */}
        <div className="space-y-4">
          <h2 className="font-bold text-headspace-darkGray text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-headspace-blue" />
            심리적 변화 분석
          </h2>

          <ScoreCard
            title="번영감 (Flourishing)"
            icon={<Sparkles className="w-6 h-6 text-headspace-yellow" />}
            before={preScores.flourishing}
            after={postScores.flourishing}
            change={flourishingChange}
            color="text-headspace-yellow"
            pastelColor="bg-headspace-pastel-yellow"
          />

          <ScoreCard
            title="삶의 만족"
            icon={<CheckCircle2 className="w-6 h-6 text-headspace-blue" />}
            before={preScores.satisfaction}
            after={postScores.satisfaction}
            change={satisfactionChange}
            color="text-headspace-blue"
            pastelColor="bg-headspace-pastel-blue"
          />

          <ScoreCard
            title="자기 자비"
            icon={<Heart className="w-6 h-6 text-headspace-green" />}
            before={preScores.compassion}
            after={postScores.compassion}
            change={compassionChange}
            color="text-headspace-green"
            pastelColor="bg-headspace-pastel-green"
          />

          <ScoreCard
            title="타인 친절"
            icon={<Sparkles className="w-6 h-6 text-headspace-pink" />}
            before={preScores.kindness}
            after={postScores.kindness}
            change={kindnessChange}
            color="text-headspace-pink"
            pastelColor="bg-headspace-pastel-pink"
          />
        </div>

        {/* Favorite Actions */}
        {topSelfCare.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-6 shadow-soft"
          >
            <h3 className="font-bold text-headspace-darkGray text-lg mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-headspace-green" />
              가장 많이 한 자기돌봄
            </h3>
            <div className="space-y-2">
              {topSelfCare.map(([label, count], index) => (
                <div key={label} className="flex items-center justify-between p-3 bg-headspace-pastel-green rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}</span>
                    <span className="font-medium text-headspace-darkGray">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-headspace-green">{count}회</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {topKindness.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 shadow-soft"
          >
            <h3 className="font-bold text-headspace-darkGray text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-headspace-pink" />
              가장 많이 한 타인친절
            </h3>
            <div className="space-y-2">
              {topKindness.map(([label, count], index) => (
                <div key={label} className="flex items-center justify-between p-3 bg-headspace-pastel-pink rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}</span>
                    <span className="font-medium text-headspace-darkGray">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-headspace-pink">{count}회</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Closing Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-headspace-pastel-blue to-headspace-pastel-purple rounded-3xl p-8 shadow-soft text-center"
        >
          <div className="text-5xl mb-4">🌟</div>
          <h3 className="font-bold text-headspace-darkGray text-xl mb-3">
            멋진 여정이었습니다!
          </h3>
          <p className="text-headspace-textMuted leading-relaxed">
            30일 동안 매일 나와 타인에게 친절을 베푸신 당신,<br />
            정말 대단해요! 이 경험이 일상에서도 계속되길 바랍니다.<br />
            <br />
            <strong className="text-headspace-blue">친절은 습관이 됩니다. 💙</strong>
          </p>
        </motion.div>

        {/* Return Home Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/home')}
          className="w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-bold shadow-soft-lg"
        >
          홈으로 돌아가기
        </motion.button>
      </div>
    </div>
  );
}
