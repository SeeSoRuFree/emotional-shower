import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';

interface StampBoardProps {
  completedDays: number[];
  currentDay: number;
  onDayClick?: (day: number) => void;
}

export default function StampBoard({ completedDays, currentDay, onDayClick }: StampBoardProps) {
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  const getDayStatus = (day: number): 'completed' | 'current' | 'upcoming' | 'locked' => {
    if (completedDays.includes(day)) return 'completed';
    if (day === currentDay) return 'current';
    if (day < currentDay) return 'upcoming';
    return 'locked';
  };

  const getDayColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-br from-headspace-green to-green-400';
      case 'current':
        return 'bg-gradient-to-br from-headspace-blue to-blue-400';
      case 'upcoming':
        return 'bg-gray-200 border-2 border-dashed border-gray-300';
      case 'locked':
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
          const isClickable = status === 'current' || status === 'upcoming';

          return (
            <motion.button
              key={day}
              whileHover={isClickable ? { scale: 1.1 } : {}}
              whileTap={isClickable ? { scale: 0.95 } : {}}
              onClick={() => isClickable && onDayClick?.(day)}
              disabled={status === 'locked'}
              className={`
                aspect-square rounded-2xl flex flex-col items-center justify-center
                ${getDayColor(status)}
                ${isClickable ? 'cursor-pointer shadow-soft hover:shadow-soft-lg' : 'cursor-not-allowed'}
                transition-all duration-300
                relative
              `}
            >
              {/* Day number */}
              <span
                className={`text-xs font-semibold ${
                  status === 'completed' || status === 'current'
                    ? 'text-white'
                    : 'text-headspace-textMuted'
                }`}
              >
                {day}
              </span>

              {/* Status icon */}
              {status === 'completed' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </motion.div>
              )}

              {status === 'current' && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-headspace-yellow rounded-full border-2 border-white"
                />
              )}

              {status === 'locked' && (
                <Lock className="w-3 h-3 text-gray-400 absolute" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-headspace-green to-green-400" />
          <span className="text-xs text-headspace-textMuted">완료</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-lg bg-gradient-to-br from-headspace-blue to-blue-400 relative">
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-headspace-yellow rounded-full" />
          </div>
          <span className="text-xs text-headspace-textMuted">오늘</span>
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
