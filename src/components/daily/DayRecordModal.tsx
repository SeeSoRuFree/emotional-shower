import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { useDailyRecordStore } from '@/store/dailyRecordStore';
import { useCohortStore } from '@/store/cohortStore';
import { useAuthStore } from '@/store/authStore';

interface DayRecordModalProps {
  day: number;
  onClose: () => void;
}

export default function DayRecordModal({ day, onClose }: DayRecordModalProps) {
  const { getRecordByDay } = useDailyRecordStore();
  const { getCohortById } = useCohortStore();
  const { currentUser } = useAuthStore();

  const record = getRecordByDay(day);
  const cohortId = currentUser?.currentCohortId;
  const currentCohort = cohortId ? getCohortById(cohortId) : null;
  const recordType = currentCohort?.recordType || 'both';

  if (!record) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-3xl p-6 shadow-soft-lg max-w-md w-full"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-headspace-darkGray" />
            </button>
            <p className="text-center text-headspace-textMuted py-8">
              DAY {day}의 기록이 없습니다.
            </p>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  const showSelfCare = recordType === 'both' || recordType === 'self_care_only';
  const showKindness = recordType === 'both' || recordType === 'kindness_only';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-3xl p-6 shadow-soft-lg max-w-md w-full max-h-[80vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-4 h-4 text-headspace-darkGray" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h3 className="font-bold text-xl text-headspace-darkGray">
              DAY {day} 기록
            </h3>
            <p className="text-sm text-headspace-textMuted mt-1">
              {record.date}
            </p>
          </div>

          {/* Self Care Actions */}
          {showSelfCare && record.selfCareActions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-headspace-pastel-green flex items-center justify-center">
                  <Heart className="w-4 h-4 text-headspace-green" />
                </div>
                <h4 className="font-semibold text-headspace-darkGray">자기돌봄</h4>
                <span className="text-xs text-headspace-textMuted">({record.selfCareActions.length}개)</span>
              </div>
              <div className="space-y-2">
                {record.selfCareActions.map((action) => (
                  <div
                    key={action.id}
                    className="bg-headspace-pastel-green/50 rounded-2xl p-3"
                  >
                    <p className="font-medium text-headspace-darkGray">{action.label}</p>
                    {action.memo && (
                      <div className="flex items-start gap-2 mt-2">
                        <MessageCircle className="w-3.5 h-3.5 text-headspace-green mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-headspace-textMuted">{action.memo}</p>
                      </div>
                    )}
                    {action.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={action.imageUrl}
                          alt="Action image"
                          className="w-full max-h-40 object-cover rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Kindness Actions */}
          {showKindness && record.kindnessActions.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-headspace-pastel-pink flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-headspace-pink" />
                </div>
                <h4 className="font-semibold text-headspace-darkGray">타인친절</h4>
                <span className="text-xs text-headspace-textMuted">({record.kindnessActions.length}개)</span>
              </div>
              <div className="space-y-2">
                {record.kindnessActions.map((action) => (
                  <div
                    key={action.id}
                    className="bg-headspace-pastel-pink/50 rounded-2xl p-3"
                  >
                    <p className="font-medium text-headspace-darkGray">{action.label}</p>
                    {action.memo && (
                      <div className="flex items-start gap-2 mt-2">
                        <MessageCircle className="w-3.5 h-3.5 text-headspace-pink mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-headspace-textMuted">{action.memo}</p>
                      </div>
                    )}
                    {action.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={action.imageUrl}
                          alt="Action image"
                          className="w-full max-h-40 object-cover rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Received Quote */}
          {record.receivedQuote && (
            <div className="bg-gradient-to-r from-headspace-pastel-blue to-headspace-pastel-purple rounded-2xl p-4">
              <p className="text-xs text-headspace-purple mb-2 font-semibold">받은 문구</p>
              <p className="text-sm text-headspace-darkGray italic">
                "{record.receivedQuote}"
              </p>
            </div>
          )}

          {/* Close button at bottom */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 bg-gray-100 rounded-full font-medium text-headspace-darkGray hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
