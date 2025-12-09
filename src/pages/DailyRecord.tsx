import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import ResponsiveNav from '@/components/common/ResponsiveNav';
import ActionListInput from '@/components/daily/ActionListInput';
import MemoModal from '@/components/daily/MemoModal';
import QuoteCard from '@/components/daily/QuoteCard';
import SkyBackground from '@/components/cloud/SkyBackground';
import { useChallengeStore } from '@/store/challengeStore';
import { useAuthStore } from '@/store/authStore';
import { useDailyRecordStore } from '@/store/dailyRecordStore';
import { useCohortStore } from '@/store/cohortStore';
import type { Action } from '@/store/dailyRecordStore';
import { SELF_CARE_EXAMPLES, KINDNESS_EXAMPLES, getRandomQuote } from '@/utils/quotes';

type Step = 'selfCare' | 'kindness' | 'quote' | 'completed';

export default function DailyRecord() {
  const navigate = useNavigate();

  const { currentUser } = useAuthStore();
  const cohortId = currentUser?.currentCohortId;

  const { getCurrentChallenge, calculateCurrentDay, completeDay } = useChallengeStore();
  const { getCohortById } = useCohortStore();
  const {
    getTodayRecord,
    addSelfCareAction,
    addKindnessAction,
    updateActionMemo,
    updateAction,
    removeAction,
    completeRecord,
    loadRecords,
    initialized
  } = useDailyRecordStore();

  const userChallenge = cohortId ? getCurrentChallenge(cohortId) : undefined;
  const currentCohort = cohortId ? getCohortById(cohortId) : undefined;
  const recordType = currentCohort?.recordType || 'both';

  // Determine initial step based on recordType
  const getInitialStep = (): Step => {
    if (recordType === 'self_care_only') return 'selfCare';
    if (recordType === 'kindness_only') return 'kindness';
    return 'selfCare'; // both
  };

  const [currentDay, setCurrentDay] = useState(0);
  const [completedDayNumber, setCompletedDayNumber] = useState(0);
  const [step, setStep] = useState<Step>(getInitialStep());
  const [selectedQuote, setSelectedQuote] = useState('');

  // Memo modal state
  const [memoModalOpen, setMemoModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [actionType, setActionType] = useState<'selfCare' | 'kindness'>('selfCare');

  // Get today's record
  const todayRecord = getTodayRecord(currentDay);
  const selfCareActions = todayRecord?.selfCareActions || [];
  const kindnessActions = todayRecord?.kindnessActions || [];

  // Load daily records on mount
  useEffect(() => {
    if (!initialized) {
      loadRecords();
    }
  }, [initialized, loadRecords]);

  useEffect(() => {
    if (!userChallenge || !cohortId) {
      navigate('/home');
      return;
    }

    const day = calculateCurrentDay(cohortId);
    setCurrentDay(day);

    // Check if already completed today
    const record = getTodayRecord(day);
    if (record?.isCompleted) {
      navigate('/home');
    }
  }, [userChallenge, cohortId, calculateCurrentDay, navigate, getTodayRecord]);

  const handleAddSelfCare = async (label: string, isCustom: boolean, memo?: string, imageUrl?: string) => {
    await addSelfCareAction(currentDay, label, isCustom, memo, imageUrl);
  };

  const handleAddKindness = async (label: string, isCustom: boolean, memo?: string, imageUrl?: string) => {
    await addKindnessAction(currentDay, label, isCustom, memo, imageUrl);
  };

  const handleRemoveAction = (type: 'selfCare' | 'kindness', actionId: string) => {
    removeAction(currentDay, type, actionId);
  };

  const handleUpdateAction = (type: 'selfCare' | 'kindness', actionId: string, newLabel: string, newMemo: string, newImageUrl?: string | null) => {
    updateAction(currentDay, type, actionId, newLabel, newMemo, newImageUrl);
  };

  const handleOpenMemo = (type: 'selfCare' | 'kindness', action: Action) => {
    setActionType(type);
    setSelectedAction(action);
    setMemoModalOpen(true);
  };

  const handleSaveMemo = (actionId: string, memo: string) => {
    updateActionMemo(currentDay, actionType, actionId, memo);
  };

  const handleNextStep = () => {
    if (step === 'selfCare') {
      if (selfCareActions.length === 0) {
        alert('자기돌봄 행동을 최소 1개 이상 추가해주세요.');
        return;
      }

      // Determine next step based on recordType
      if (recordType === 'both') {
        setStep('kindness');
      } else {
        // self_care_only: skip kindness, go to quote
        const quote = getRandomQuote();
        setSelectedQuote(quote);
        setStep('quote');
      }
    } else if (step === 'kindness') {
      if (kindnessActions.length === 0) {
        alert('타인친절 행동을 최소 1개 이상 추가해주세요.');
        return;
      }
      // Generate quote
      const quote = getRandomQuote();
      setSelectedQuote(quote);
      setStep('quote');
    }
  };

  const handleComplete = async () => {
    if (!cohortId) return;

    // Store the day number BEFORE completing (to show correct day in completion screen)
    setCompletedDayNumber(currentDay);

    // Complete record with quote
    await completeRecord(currentDay, selectedQuote);

    // Mark day as completed in challenge
    await completeDay(cohortId, currentDay);

    // Show completed state briefly
    setStep('completed');

    // Navigate to home after 2 seconds
    setTimeout(() => {
      navigate('/home');
    }, 2000);
  };

  const getStepProgress = () => {
    if (recordType === 'both') {
      // both: 3 steps total (selfCare -> kindness -> quote)
      switch (step) {
        case 'selfCare':
          return 33;
        case 'kindness':
          return 66;
        case 'quote':
        case 'completed':
          return 100;
        default:
          return 0;
      }
    } else {
      // single type: 2 steps total (single action -> quote)
      switch (step) {
        case 'selfCare':
        case 'kindness':
          return 50;
        case 'quote':
        case 'completed':
          return 100;
        default:
          return 0;
      }
    }
  };

  return (
    <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col md:pt-16">
      <div className="flex-1 flex flex-col pb-24">
        {/* Header */}
        <div className="sticky top-0 md:top-16 bg-white/90 backdrop-blur shadow-soft z-20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => navigate('/home')}
                className="p-2 rounded-xl hover:bg-headspace-pastel-blue transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-headspace-darkGray" />
              </button>

              <div className="text-center">
                <h1 className="font-semibold text-headspace-darkGray">
                  DAY {currentDay} 기록
                </h1>
                <p className="text-xs text-headspace-textMuted">
                  {step === 'selfCare' ? '자기돌봄' : step === 'kindness' ? '타인친절' : '완료'}
                </p>
              </div>

              <div className="w-12" />
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getStepProgress()}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-headspace-blue to-headspace-purple rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 relative z-10">
          <AnimatePresence mode="wait">
            {/* Step 1: Self Care */}
            {step === 'selfCare' && (
              <motion.div
                key="selfCare"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-headspace-darkGray mb-2">
                    오늘 나를 위해<br />무엇을 했나요? 💚
                  </h2>
                  <p className="text-headspace-textMuted">
                    스스로를 돌본 행동들을 모두 기록해보세요
                  </p>
                </div>

                <ActionListInput
                  title="자기돌봄 행동"
                  examples={SELF_CARE_EXAMPLES}
                  actions={selfCareActions}
                  onAddAction={handleAddSelfCare}
                  onUpdateAction={(id, label, memo, imageUrl) => handleUpdateAction('selfCare', id, label, memo, imageUrl)}
                  onRemoveAction={(id) => handleRemoveAction('selfCare', id)}
                  accentColor="#4CAF50"
                  cohortId={cohortId}
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextStep}
                  disabled={selfCareActions.length === 0}
                  className="w-full mt-8 py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  다음 단계
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {/* Step 2: Kindness */}
            {step === 'kindness' && (
              <motion.div
                key="kindness"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-headspace-darkGray mb-2">
                    오늘 타인에게<br />어떤 친절을 베풀었나요? 💗
                  </h2>
                  <p className="text-headspace-textMuted">
                    다른 사람을 위한 친절한 행동들을 기록해보세요
                  </p>
                </div>

                <ActionListInput
                  title="타인친절 행동"
                  examples={KINDNESS_EXAMPLES}
                  actions={kindnessActions}
                  onAddAction={handleAddKindness}
                  onUpdateAction={(id, label, memo, imageUrl) => handleUpdateAction('kindness', id, label, memo, imageUrl)}
                  onRemoveAction={(id) => handleRemoveAction('kindness', id)}
                  accentColor="#FFA1CC"
                  cohortId={cohortId}
                />

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep('selfCare')}
                    className="flex-1 py-4 bg-gray-100 rounded-full font-semibold text-headspace-darkGray hover:bg-gray-200 transition-colors"
                  >
                    이전
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNextStep}
                    disabled={kindnessActions.length === 0}
                    className="flex-2 py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 flex-1"
                  >
                    완료하기
                    <Check className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Quote modal */}
      {step === 'quote' && (
        <QuoteCard quote={selectedQuote} onClose={handleComplete} />
      )}

      {/* Completed state */}
      {step === 'completed' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-headspace-pastel-blue to-headspace-pastel-purple">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-headspace-darkGray mb-2">
              스탬프 획득!
            </h2>
            <p className="text-headspace-textMuted">
              DAY {completedDayNumber} 기록 완료
            </p>
          </motion.div>
        </div>
      )}

      {/* Memo modal */}
      <MemoModal
        isOpen={memoModalOpen}
        action={selectedAction}
        onClose={() => {
          setMemoModalOpen(false);
          setSelectedAction(null);
        }}
        onSave={handleSaveMemo}
      />

      <ResponsiveNav />
    </SkyBackground>
  );
}
