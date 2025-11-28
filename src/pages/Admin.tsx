import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Clock, Copy, Check, Plus, Calendar, Users as UsersIcon, Edit, Trash } from 'lucide-react';
import SkyBackground from '@/components/cloud/SkyBackground';
import { useApplicationStore } from '@/store/applicationStore';
import { useCohortStore } from '@/store/cohortStore';
import type { Application } from '@/store/applicationStore';
import type { Cohort } from '@/store/cohortStore';

type Tab = 'cohorts' | 'pending' | 'approved' | 'rejected';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('cohorts');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showCohortForm, setShowCohortForm] = useState(false);
  const [selectedCohortForApproval, setSelectedCohortForApproval] = useState<string | null>(null);
  const [approvingApplicationId, setApprovingApplicationId] = useState<string | null>(null);

  const [cohortForm, setCohortForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  const { applications, approveApplication, rejectApplication } = useApplicationStore();
  const { cohorts, createCohort, deleteCohort, updateCohortStatus } = useCohortStore();

  const filteredApplications = applications.filter(app => app.status === activeTab);

  const handleCreateCohort = () => {
    if (!cohortForm.name || !cohortForm.startDate || !cohortForm.endDate) {
      alert('기수명, 시작일, 종료일은 필수입니다');
      return;
    }

    createCohort({
      name: cohortForm.name,
      startDate: new Date(cohortForm.startDate),
      endDate: new Date(cohortForm.endDate),
      description: cohortForm.description
    });

    setCohortForm({ name: '', startDate: '', endDate: '', description: '' });
    setShowCohortForm(false);
  };

  const handleApproveClick = (applicationId: string) => {
    setApprovingApplicationId(applicationId);
    setSelectedCohortForApproval(null);
  };

  const handleConfirmApproval = (applicationId: string) => {
    if (!selectedCohortForApproval) {
      alert('기수를 선택해주세요');
      return;
    }

    const code = approveApplication(applicationId, selectedCohortForApproval);
    alert(`승인 완료!\n\n인증 코드: ${code}\n\n사용자 이메일로 전송되었습니다 (시뮬레이션)`);
    setApprovingApplicationId(null);
    setSelectedCohortForApproval(null);
  };

  const handleReject = (applicationId: string) => {
    if (confirm('정말 거절하시겠습니까?')) {
      rejectApplication(applicationId);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: Application['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    const labels = {
      pending: '대기 중',
      approved: '승인됨',
      rejected: '거절됨'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getCohortStatusBadge = (status: Cohort['status']) => {
    const styles = {
      recruiting: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700'
    };
    const labels = {
      recruiting: '모집 중',
      active: '진행 중',
      completed: '종료'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col min-h-screen">
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-headspace-purple to-purple-500 rounded-2xl flex items-center justify-center shadow-soft-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-headspace-darkGray mb-2">
              어드민 대시보드
            </h1>
            <p className="text-headspace-textMuted">
              기수 관리 및 신청자 승인
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-soft">
              <div className="text-2xl font-bold text-blue-600">
                {cohorts.length}
              </div>
              <div className="text-xs text-headspace-textMuted mt-1">총 기수</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-soft">
              <div className="text-2xl font-bold text-yellow-600">
                {applications.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-xs text-headspace-textMuted mt-1">대기 중</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-soft">
              <div className="text-2xl font-bold text-green-600">
                {applications.filter(a => a.status === 'approved').length}
              </div>
              <div className="text-xs text-headspace-textMuted mt-1">승인됨</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-soft">
              <div className="text-2xl font-bold text-red-600">
                {applications.filter(a => a.status === 'rejected').length}
              </div>
              <div className="text-xs text-headspace-textMuted mt-1">거절됨</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white/80 backdrop-blur rounded-2xl p-2 shadow-soft overflow-x-auto">
            {(['cohorts', 'pending', 'approved', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 py-2 px-4 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === tab
                    ? 'bg-headspace-blue text-white shadow-soft'
                    : 'text-headspace-textMuted hover:text-headspace-darkGray'
                }`}
              >
                {tab === 'cohorts' && '기수 관리'}
                {tab === 'pending' && '대기 중'}
                {tab === 'approved' && '승인됨'}
                {tab === 'rejected' && '거절됨'}
              </button>
            ))}
          </div>

          {/* Cohorts Tab */}
          {activeTab === 'cohorts' && (
            <div className="space-y-4">
              <button
                onClick={() => setShowCohortForm(!showCohortForm)}
                className="w-full py-3 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-xl font-semibold shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                새 기수 만들기
              </button>

              <AnimatePresence>
                {showCohortForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-soft"
                  >
                    <h3 className="font-bold text-headspace-darkGray mb-4">기수 생성</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-headspace-darkGray mb-1">
                          기수명 *
                        </label>
                        <input
                          type="text"
                          value={cohortForm.name}
                          onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                          placeholder="예: 1기"
                          className="w-full px-4 py-2 border-2 border-headspace-pastel-blue focus:border-headspace-blue rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-headspace-darkGray mb-1">
                            시작일 *
                          </label>
                          <input
                            type="date"
                            value={cohortForm.startDate}
                            onChange={(e) => setCohortForm({ ...cohortForm, startDate: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-headspace-pastel-blue focus:border-headspace-blue rounded-xl focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-headspace-darkGray mb-1">
                            종료일 *
                          </label>
                          <input
                            type="date"
                            value={cohortForm.endDate}
                            onChange={(e) => setCohortForm({ ...cohortForm, endDate: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-headspace-pastel-blue focus:border-headspace-blue rounded-xl focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-headspace-darkGray mb-1">
                          설명 (선택)
                        </label>
                        <textarea
                          value={cohortForm.description}
                          onChange={(e) => setCohortForm({ ...cohortForm, description: e.target.value })}
                          placeholder="기수에 대한 설명을 입력하세요"
                          rows={2}
                          className="w-full px-4 py-2 border-2 border-headspace-pastel-blue focus:border-headspace-blue rounded-xl focus:outline-none resize-none"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleCreateCohort}
                          className="flex-1 py-2 bg-headspace-blue text-white rounded-xl font-semibold"
                        >
                          생성
                        </button>
                        <button
                          onClick={() => setShowCohortForm(false)}
                          className="flex-1 py-2 bg-gray-200 text-headspace-darkGray rounded-xl font-semibold"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {cohorts.length === 0 ? (
                <div className="bg-white/80 backdrop-blur rounded-2xl p-8 text-center shadow-soft">
                  <Calendar className="w-12 h-12 text-headspace-textMuted mx-auto mb-3" />
                  <p className="text-headspace-textMuted">등록된 기수가 없습니다</p>
                </div>
              ) : (
                cohorts.map((cohort) => (
                  <motion.div
                    key={cohort.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-soft"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-headspace-darkGray text-lg">
                          {cohort.name}
                        </h3>
                        <p className="text-sm text-headspace-textMuted">
                          {formatDateShort(cohort.startDate)} ~ {formatDateShort(cohort.endDate)}
                        </p>
                      </div>
                      {getCohortStatusBadge(cohort.status)}
                    </div>

                    {cohort.description && (
                      <p className="text-sm text-headspace-textMuted mb-4">
                        {cohort.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <select
                        value={cohort.status}
                        onChange={(e) => updateCohortStatus(cohort.id, e.target.value as Cohort['status'])}
                        className="flex-1 px-3 py-2 border-2 border-headspace-pastel-blue rounded-xl text-sm"
                      >
                        <option value="recruiting">모집 중</option>
                        <option value="active">진행 중</option>
                        <option value="completed">종료</option>
                      </select>
                      <button
                        onClick={() => {
                          if (confirm('정말 삭제하시겠습니까?')) {
                            deleteCohort(cohort.id);
                          }
                        }}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Applications List */}
          {activeTab !== 'cohorts' && (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredApplications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white/80 backdrop-blur rounded-2xl p-8 text-center shadow-soft"
                  >
                    <Clock className="w-12 h-12 text-headspace-textMuted mx-auto mb-3" />
                    <p className="text-headspace-textMuted">
                      {activeTab === 'pending' && '대기 중인 신청이 없습니다'}
                      {activeTab === 'approved' && '승인된 신청이 없습니다'}
                      {activeTab === 'rejected' && '거절된 신청이 없습니다'}
                    </p>
                  </motion.div>
                ) : (
                  filteredApplications.map((app) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-soft"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-headspace-darkGray text-lg">
                            {app.name}
                          </h3>
                          <p className="text-sm text-headspace-textMuted">{app.email}</p>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>

                      {/* Cohort Info */}
                      {app.cohortId && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                          <p className="text-sm font-semibold text-blue-700">
                            할당된 기수: {cohorts.find(c => c.id === app.cohortId)?.name || app.cohortId}
                          </p>
                        </div>
                      )}

                      {/* Motivation */}
                      <div className="mb-4 p-3 bg-headspace-pastel-blue/20 rounded-xl">
                        <p className="text-sm font-semibold text-headspace-darkGray mb-1">
                          참여 동기
                        </p>
                        <p className="text-sm text-headspace-textMuted whitespace-pre-wrap">
                          {app.motivation}
                        </p>
                      </div>

                      {/* Info */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                        <div>
                          <span className="text-headspace-textMuted">신청 일시</span>
                          <p className="text-headspace-darkGray font-medium">
                            {formatDate(app.appliedAt)}
                          </p>
                        </div>
                        {app.processedAt && (
                          <div>
                            <span className="text-headspace-textMuted">처리 일시</span>
                            <p className="text-headspace-darkGray font-medium">
                              {formatDate(app.processedAt)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Code (if approved) */}
                      {app.status === 'approved' && app.code && (
                        <div className="mb-4 p-3 bg-green-50 rounded-xl border-2 border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-green-700 font-semibold mb-1">
                                인증 코드
                              </p>
                              <p className="text-lg font-bold text-green-900 tracking-wider">
                                {app.code}
                              </p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(app.code!)}
                              className="p-2 bg-green-200 hover:bg-green-300 rounded-lg transition-colors"
                            >
                              {copiedCode === app.code ? (
                                <Check className="w-5 h-5 text-green-700" />
                              ) : (
                                <Copy className="w-5 h-5 text-green-700" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Actions (only for pending) */}
                      {app.status === 'pending' && (
                        <div className="space-y-3">
                          {approvingApplicationId === app.id ? (
                            <>
                              <div>
                                <label className="block text-sm font-semibold text-headspace-darkGray mb-2">
                                  기수 선택 *
                                </label>
                                <select
                                  value={selectedCohortForApproval || ''}
                                  onChange={(e) => setSelectedCohortForApproval(e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-headspace-pastel-blue focus:border-headspace-blue rounded-xl focus:outline-none"
                                >
                                  <option value="">기수를 선택하세요</option>
                                  {cohorts.filter(c => c.status === 'recruiting').map(cohort => (
                                    <option key={cohort.id} value={cohort.id}>
                                      {cohort.name} ({formatDateShort(cohort.startDate)} 시작)
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleConfirmApproval(app.id)}
                                  disabled={!selectedCohortForApproval}
                                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                  승인 확정
                                </button>
                                <button
                                  onClick={() => {
                                    setApprovingApplicationId(null);
                                    setSelectedCohortForApproval(null);
                                  }}
                                  className="flex-1 py-3 bg-gray-200 text-headspace-darkGray rounded-xl font-semibold"
                                >
                                  취소
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex gap-3">
                              <button
                                onClick={() => handleApproveClick(app.id)}
                                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2"
                              >
                                <CheckCircle className="w-5 h-5" />
                                승인
                              </button>
                              <button
                                onClick={() => handleReject(app.id)}
                                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2"
                              >
                                <XCircle className="w-5 h-5" />
                                거절
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </SkyBackground>
  );
}
