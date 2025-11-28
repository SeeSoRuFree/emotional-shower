import { useState, useMemo, useEffect } from 'react';
import { FileText, Check, X, Clock, Mail, Calendar, Copy } from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import { useCohortStore } from '@/store/cohortStore';
import { motion } from 'framer-motion';

type TabType = 'pending' | 'approved' | 'rejected';

export default function ApplicationManagement() {
  const { applications, approveApplication, rejectApplication } = useApplicationStore();
  const { cohorts } = useCohortStore();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedCohortForApproval, setSelectedCohortForApproval] = useState<string>('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  // Filter applications by status
  const filteredApplications = useMemo(() => {
    return applications.filter(app => app.status === activeTab);
  }, [applications, activeTab]);

  const handleApprove = (applicationId: string) => {
    if (!selectedCohortForApproval) {
      alert('기수를 선택해주세요');
      return;
    }

    const code = approveApplication(applicationId, selectedCohortForApproval);
    alert(`승인되었습니다!\n\n발급된 코드: ${code}\n\n이메일로 코드가 전송됩니다.`);
    setApprovingId(null);
    setSelectedCohortForApproval('');
  };

  const handleReject = (applicationId: string, applicantName: string) => {
    if (confirm(`정말로 "${applicantName}"님의 신청을 거절하시겠습니까?`)) {
      rejectApplication(applicationId);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('코드가 복사되었습니다');
  };

  const tabs = [
    { id: 'pending' as TabType, label: '대기 중', count: applications.filter(a => a.status === 'pending').length },
    { id: 'approved' as TabType, label: '승인됨', count: applications.filter(a => a.status === 'approved').length },
    { id: 'rejected' as TabType, label: '거절됨', count: applications.filter(a => a.status === 'rejected').length }
  ];

  const getCohortName = (cohortId: string | null) => {
    if (!cohortId) return '-';
    const cohort = cohorts.find(c => c.id === cohortId);
    return cohort ? cohort.name : cohortId;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">대기 중</p>
              <p className="text-3xl font-bold text-orange-600">
                {applications.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">승인됨</p>
              <p className="text-3xl font-bold text-green-600">
                {applications.filter(a => a.status === 'approved').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">거절됨</p>
              <p className="text-3xl font-bold text-red-600">
                {applications.filter(a => a.status === 'rejected').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="border-b border-slate-200">
          <div className="flex gap-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  activeTab === tab.id
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="divide-y divide-slate-100">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {activeTab === 'pending' && '대기 중인 신청이 없습니다'}
              {activeTab === 'approved' && '승인된 신청이 없습니다'}
              {activeTab === 'rejected' && '거절된 신청이 없습니다'}
            </div>
          ) : (
            filteredApplications.map((application) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Application Info */}
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-700" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-semibold text-slate-900">
                            {application.name}
                          </h4>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                            application.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                            application.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {application.status === 'pending' ? '대기 중' :
                             application.status === 'approved' ? '승인됨' : '거절됨'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {application.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {application.appliedAt.toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Motivation */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs font-semibold text-slate-500 mb-2">신청 동기</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {application.motivation}
                      </p>
                    </div>

                    {/* Approved Info */}
                    {application.status === 'approved' && application.code && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-green-700 mb-1">할당 기수</p>
                            <p className="text-sm text-green-900">
                              {getCohortName(application.cohortId)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-green-700 mb-1">인증 코드</p>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono font-semibold text-green-900 bg-green-100 px-2 py-1 rounded">
                                {application.code}
                              </code>
                              <button
                                onClick={() => handleCopyCode(application.code!)}
                                className="p-1 hover:bg-green-200 rounded transition-colors"
                                title="코드 복사"
                              >
                                <Copy className="w-4 h-4 text-green-700" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rejected Info */}
                    {application.status === 'rejected' && application.processedAt && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-red-700 mb-1">거절일</p>
                        <p className="text-sm text-red-900">
                          {application.processedAt.toLocaleString('ko-KR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {application.status === 'pending' && (
                    <div className="flex-shrink-0">
                      {approvingId === application.id ? (
                        <div className="space-y-3 min-w-[200px]">
                          <select
                            value={selectedCohortForApproval}
                            onChange={(e) => setSelectedCohortForApproval(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">기수 선택</option>
                            {cohorts
                              .filter(c => c.status === 'recruiting' || c.status === 'active')
                              .map(cohort => (
                                <option key={cohort.id} value={cohort.id}>
                                  {cohort.name}
                                </option>
                              ))}
                          </select>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(application.id)}
                              className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              확인
                            </button>
                            <button
                              onClick={() => {
                                setApprovingId(null);
                                setSelectedCohortForApproval('');
                              }}
                              className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => setApprovingId(application.id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            승인
                          </button>
                          <button
                            onClick={() => handleReject(application.id, application.name)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                            거절
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
