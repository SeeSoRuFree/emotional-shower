import { motion } from 'framer-motion';
import { Award, TrendingUp } from 'lucide-react';

interface ProgressBarProps {
  completedCount: number;
  targetCount?: number;
  canAccessReport: boolean;
}

export default function ProgressBar({
  completedCount,
  targetCount = 22,
  canAccessReport
}: ProgressBarProps) {
  const percentage = Math.min((completedCount / targetCount) * 100, 100);
  const daysLeft = Math.max(targetCount - completedCount, 0);

  return (
    <div className="bg-gradient-to-r from-headspace-pastel-purple to-headspace-pastel-blue rounded-3xl p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        {canAccessReport ? (
          <Award className="w-6 h-6 text-headspace-yellow" />
        ) : (
          <TrendingUp className="w-6 h-6 text-headspace-purple" />
        )}
        <h3 className="font-bold text-headspace-darkGray">
          {canAccessReport ? '🎉 리포트 획득 가능!' : '리포트까지'}
        </h3>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-8 bg-white/50 rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-headspace-blue to-headspace-purple rounded-full flex items-center justify-center"
        >
          {percentage >= 20 && (
            <span className="text-xs font-bold text-white">
              {completedCount}/{targetCount}
            </span>
          )}
        </motion.div>
        {percentage < 20 && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-headspace-darkGray">
            {completedCount}/{targetCount}
          </span>
        )}
      </div>

      {/* Status message */}
      {canAccessReport ? (
        <p className="text-sm text-headspace-darkGray text-center">
          ✨ 축하합니다! <strong>DAY 30</strong> 완료 후 리포트를 확인하세요
        </p>
      ) : (
        <p className="text-sm text-headspace-textMuted text-center">
          {daysLeft === 0 ? (
            <span className="text-headspace-coral font-semibold">
              조금만 더 힘내세요! 🔥
            </span>
          ) : (
            <>
              앞으로 <strong className="text-headspace-purple">{daysLeft}일</strong> 더 완료하면 리포트를 받을 수 있어요!
            </>
          )}
        </p>
      )}

      {/* Milestone indicator */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/30">
        <div className="text-center flex-1">
          <div className={`text-xl font-bold ${
            completedCount >= 10 ? 'text-headspace-green' : 'text-gray-400'
          }`}>
            10일
          </div>
          <div className="text-xs text-headspace-textMuted">습관화</div>
        </div>
        <div className="text-center flex-1">
          <div className={`text-xl font-bold ${
            completedCount >= 22 ? 'text-headspace-yellow' : 'text-gray-400'
          }`}>
            22일
          </div>
          <div className="text-xs text-headspace-textMuted">리포트</div>
        </div>
        <div className="text-center flex-1">
          <div className={`text-xl font-bold ${
            completedCount === 30 ? 'text-headspace-purple' : 'text-gray-400'
          }`}>
            30일
          </div>
          <div className="text-xs text-headspace-textMuted">완주</div>
        </div>
      </div>
    </div>
  );
}
