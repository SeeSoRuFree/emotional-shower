import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, MessageCircle, Calendar } from 'lucide-react';
import ResponsiveNav from '@/components/common/ResponsiveNav';
import { useDailyRecordStore } from '@/store/dailyRecordStore';
import { useCohortStore } from '@/store/cohortStore';
import { useAuthStore } from '@/store/authStore';

type TabType = 'selfCare' | 'kindness';

export default function RecordHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('type') as TabType) || 'selfCare';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const { currentUser } = useAuthStore();
  const { records, loadRecords, initialized } = useDailyRecordStore();
  const { getCohortById } = useCohortStore();

  const cohortId = currentUser?.currentCohortId;
  const currentCohort = cohortId ? getCohortById(cohortId) : null;
  const recordType = currentCohort?.recordType || 'both';

  // Load records on mount
  useEffect(() => {
    if (!initialized) {
      loadRecords();
    }
  }, [initialized, loadRecords]);

  // Sort records by day descending (most recent first)
  const sortedRecords = [...records]
    .filter(r => r.isCompleted)
    .sort((a, b) => b.day - a.day);

  // Filter records based on active tab
  const filteredRecords = sortedRecords.filter(record => {
    if (activeTab === 'selfCare') {
      return record.selfCareActions.length > 0;
    } else {
      return record.kindnessActions.length > 0;
    }
  });

  // Calculate total count
  const totalSelfCare = records.reduce((sum, r) => sum + r.selfCareActions.length, 0);
  const totalKindness = records.reduce((sum, r) => sum + r.kindnessActions.length, 0);

  // Determine if tabs should be shown
  const showTabs = recordType === 'both';

  // If single record type, force the tab
  useEffect(() => {
    if (recordType === 'self_care_only') {
      setActiveTab('selfCare');
    } else if (recordType === 'kindness_only') {
      setActiveTab('kindness');
    }
  }, [recordType]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-headspace-beige to-white md:pt-16">
      {/* Header */}
      <div className="sticky top-0 md:top-16 bg-white/90 backdrop-blur shadow-soft z-20">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-headspace-darkGray" />
            </button>
            <div>
              <h1 className="font-bold text-headspace-darkGray">기록 히스토리</h1>
              <p className="text-xs text-headspace-textMuted">
                {activeTab === 'selfCare' ? '자기돌봄' : '타인친절'} 총 {activeTab === 'selfCare' ? totalSelfCare : totalKindness}회 실천
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {showTabs && (
          <div className="px-4 pb-4">
            <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
              <button
                onClick={() => setActiveTab('selfCare')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'selfCare'
                    ? 'bg-white text-headspace-pink shadow-soft'
                    : 'text-headspace-textMuted'
                }`}
              >
                <Heart className="w-4 h-4" />
                자기돌봄
                <span className="text-xs opacity-60">({totalSelfCare})</span>
              </button>
              <button
                onClick={() => setActiveTab('kindness')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'kindness'
                    ? 'bg-white text-headspace-purple shadow-soft'
                    : 'text-headspace-textMuted'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                타인친절
                <span className="text-xs opacity-60">({totalKindness})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-32 space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">
              {activeTab === 'selfCare' ? '💚' : '💗'}
            </div>
            <p className="text-headspace-textMuted">
              아직 기록이 없어요
            </p>
            <button
              onClick={() => navigate('/daily-record')}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full text-sm font-medium"
            >
              오늘의 기록 작성하기
            </button>
          </div>
        ) : (
          filteredRecords.map((record, index) => {
            const actions = activeTab === 'selfCare'
              ? record.selfCareActions
              : record.kindnessActions;

            return (
              <motion.div
                key={record.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-soft"
              >
                {/* Day header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activeTab === 'selfCare'
                      ? 'bg-headspace-pastel-green'
                      : 'bg-headspace-pastel-pink'
                  }`}>
                    <Calendar className={`w-4 h-4 ${
                      activeTab === 'selfCare'
                        ? 'text-headspace-green'
                        : 'text-headspace-pink'
                    }`} />
                  </div>
                  <div>
                    <span className="font-semibold text-headspace-darkGray">
                      DAY {record.day}
                    </span>
                    <span className="text-xs text-headspace-textMuted ml-2">
                      {record.date}
                    </span>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                    activeTab === 'selfCare'
                      ? 'bg-headspace-pastel-green text-headspace-green'
                      : 'bg-headspace-pastel-pink text-headspace-pink'
                  }`}>
                    {actions.length}개
                  </span>
                </div>

                {/* Actions list */}
                <div className="space-y-2">
                  {actions.map((action) => (
                    <div
                      key={action.id}
                      className={`rounded-xl p-3 ${
                        activeTab === 'selfCare'
                          ? 'bg-headspace-pastel-green/30'
                          : 'bg-headspace-pastel-pink/30'
                      }`}
                    >
                      <p className="font-medium text-headspace-darkGray text-sm">
                        {action.label}
                      </p>
                      {action.memo && (
                        <div className="flex items-start gap-2 mt-1.5">
                          <MessageCircle className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                            activeTab === 'selfCare'
                              ? 'text-headspace-green'
                              : 'text-headspace-pink'
                          }`} />
                          <p className="text-xs text-headspace-textMuted">
                            {action.memo}
                          </p>
                        </div>
                      )}
                      {action.imageUrl && (
                        <div className="mt-2">
                          <img
                            src={action.imageUrl}
                            alt="Action image"
                            className="w-full max-h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <ResponsiveNav />
    </div>
  );
}
