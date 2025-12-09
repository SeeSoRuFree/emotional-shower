import { motion } from 'framer-motion';
import { Check, Lock, X } from 'lucide-react';

interface StampBoardProps {
  completedDays: number[];
  currentDay: number;
  onDayClick?: (day: number) => void;
}

export default function StampBoard({ completedDays, currentDay, onDayClick }: StampBoardProps) {
  console.log('🎨 [StampBoard] 렌더링:', { completedDays, currentDay });

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const getDayStatus = (day: number): 'completed' | 'current' | 'skipped' | 'locked' => {
    if (completedDays.includes(day)) return 'completed';  // 완료한 날
    if (day === currentDay) return 'current';              // 오늘
    if (day < currentDay) return 'skipped';                // 건너뛴 날 (과거인데 완료 안됨)
    return 'locked';                                       // 미래
  };

  const getDayColor = (status: string, day: number) => {
    // DAY 1, 30 진단일 특별 표시
    const isDiagnosisDay = day === 1 || day === 30;

    switch (status) {
      case 'completed':
        if (isDiagnosisDay) {
          return 'bg-gradient-to-br from-purple-500 to-purple-700 ring-2 ring-purple-300';
        }
        return 'bg-gradient-to-br from-headspace-green to-green-400';
      case 'current':
        if (isDiagnosisDay) {
          return 'bg-white border-4 border-purple-500 shadow-soft-lg ring-2 ring-purple-200';
        }
        return 'bg-white border-4 border-headspace-blue shadow-soft-lg';
      case 'skipped':
        if (isDiagnosisDay) {
          return 'bg-purple-100 border-2 border-red-300';
        }
        return 'bg-gray-200 border-2 border-red-300';
      case 'locked':
        if (isDiagnosisDay) {
          return 'bg-purple-50 border-2 border-purple-300';
        }
        return 'bg-gray-100 border border-gray-200';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-headspace-darkGray">30일 스탬프 보드</h2>
        <div className="text-sm text-headspace-textMuted">
          {completedDays.length}/30 완료
        </div>
      </div>

      {/* 6x5 Grid */}
      <div className="grid grid-cols-6 gap-2">
        {days.map((day) => {
          const status = getDayStatus(day);
          const isClickable = status === 'current' || status === 'completed';
          const isDiagnosisDay = day === 1 || day === 30;

          return (
            <motion.button
              key={day}
              whileHover={isClickable ? { scale: 1.1 } : {}}
              whileTap={isClickable ? { scale: 0.95 } : {}}
              onClick={() => isClickable && onDayClick?.(day)}
              disabled={status === 'locked' || status === 'skipped'}
              className={`
                aspect-square rounded-2xl flex flex-col items-center justify-center
                ${getDayColor(status, day)}
                ${isClickable ? 'cursor-pointer hover:shadow-soft-lg' : 'cursor-not-allowed'}
                transition-all duration-300
                relative
              `}
            >
              {/* Day number - 완료된 경우 상단에, 아닌 경우 중앙에 */}
              <span
                className={`text-xs font-semibold ${
                  status === 'completed'
                    ? 'text-white/80 absolute top-0.5'
                    : status === 'current' && isDiagnosisDay
                    ? 'text-purple-500'
                    : status === 'current'
                    ? 'text-headspace-blue'
                    : isDiagnosisDay
                    ? 'text-purple-600'
                    : 'text-headspace-textMuted'
                }`}
                style={{ fontSize: status === 'completed' ? '9px' : undefined }}
              >
                {day}
              </span>

              {/* Status icon - 완료된 경우 중앙에 체크 표시 */}
              {status === 'completed' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="flex items-center justify-center mt-1"
                >
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </motion.div>
              )}

              {status === 'skipped' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-red-500" strokeWidth={3} />
                </motion.div>
              )}

              {status === 'locked' && (
                <Lock className="w-3 h-3 text-gray-400 absolute" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-gray-100 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-headspace-green to-green-400" />
          <span className="text-xs text-headspace-textMuted">완료</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700" />
          <span className="text-xs text-headspace-textMuted">진단일</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-lg bg-white border-2 border-headspace-blue" />
          <span className="text-xs text-headspace-textMuted">오늘</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-lg bg-gray-200 border border-red-300 flex items-center justify-center">
            <X className="w-2.5 h-2.5 text-red-500" />
          </div>
          <span className="text-xs text-headspace-textMuted">건너뜀</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-lg bg-gray-100 flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-gray-400" />
          </div>
          <span className="text-xs text-headspace-textMuted">미래</span>
        </div>
      </div>
    </div>
  );
}
