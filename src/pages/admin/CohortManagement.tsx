import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Users, X } from 'lucide-react';
import { useCohortStore } from '@/store/cohortStore';
import type { Cohort } from '@/store/cohortStore';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function CohortManagement() {
  const { cohorts, loadCohorts, createCohort, updateCohort, deleteCohort } = useCohortStore();
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});

  // Load cohorts and user counts from Supabase on mount
  useEffect(() => {
    loadCohorts();
    loadUserCounts();
  }, [loadCohorts]);

  // Load user counts for each cohort from Supabase
  const loadUserCounts = async () => {
    try {
      const { data } = await supabase
        .from('user_cohorts')
        .select('cohort_id');

      const counts: Record<string, number> = {};
      data?.forEach(row => {
        counts[row.cohort_id] = (counts[row.cohort_id] || 0) + 1;
      });
      setUserCounts(counts);
    } catch (error) {
      console.error('Failed to load user counts:', error);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'recruiting' as Cohort['status'],
    description: '',
    maxParticipants: '',
    recordType: 'both' as 'both' | 'self_care_only' | 'kindness_only'
  });

  const handleOpenModal = (cohort?: Cohort) => {
    if (cohort) {
      setEditingCohort(cohort);
      setFormData({
        name: cohort.name,
        startDate: cohort.startDate.toISOString().split('T')[0],
        endDate: cohort.endDate.toISOString().split('T')[0],
        status: cohort.status,
        description: cohort.description || '',
        maxParticipants: cohort.maxParticipants?.toString() || '',
        recordType: cohort.recordType || 'both'
      });
    } else {
      setEditingCohort(null);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        status: 'recruiting',
        description: '',
        maxParticipants: '',
        recordType: 'both'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCohort(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.startDate || !formData.endDate) {
      alert('필수 항목을 모두 입력해주세요');
      return;
    }

    const cohortData = {
      name: formData.name,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      status: formData.status,
      description: formData.description || undefined,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
      recordType: formData.recordType
    };

    if (editingCohort) {
      updateCohort(editingCohort.id, cohortData);
    } else {
      createCohort(cohortData);
    }

    handleCloseModal();
  };

  const handleDelete = (cohortId: string, cohortName: string) => {
    if (confirm(`정말로 "${cohortName}" 기수를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      deleteCohort(cohortId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">기수 관리</h2>
          <p className="text-sm text-slate-600 mt-1">
            총 {cohorts.length}개 기수
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          새 기수 추가
        </button>
      </div>

      {/* Cohort Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">기수명</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">상태</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">참여자</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">시작일</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">종료일</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">설명</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">작업</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    등록된 기수가 없습니다
                  </td>
                </tr>
              ) : (
                cohorts.map((cohort) => {
                  const userCount = userCounts[cohort.id] || 0;
                  return (
                    <tr key={cohort.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900">{cohort.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          cohort.status === 'recruiting' ? 'bg-blue-100 text-blue-800' :
                          cohort.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {cohort.status === 'recruiting' ? '모집 중' :
                           cohort.status === 'active' ? '진행 중' : '종료'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Users className="w-4 h-4 text-slate-400" />
                          {userCount}
                          {cohort.maxParticipants && (
                            <span className="text-slate-400">/ {cohort.maxParticipants}</span>
                          )}
                          명
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {cohort.startDate.toLocaleDateString('ko-KR')}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {cohort.endDate.toLocaleDateString('ko-KR')}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">
                        {cohort.description || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(cohort)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="수정"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cohort.id, cohort.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCohort ? '기수 수정' : '새 기수 추가'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    기수명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 1기, 2026년 1월 기수"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      시작일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      종료일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    상태
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Cohort['status'] })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="recruiting">모집 중</option>
                    <option value="active">진행 중</option>
                    <option value="completed">종료</option>
                  </select>
                </div>

                {/* Max Participants */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    최대 참여자 수 (선택)
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    placeholder="예: 30"
                    min="1"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    설명 (선택)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="기수에 대한 간단한 설명을 입력해주세요"
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {/* Record Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    기록 항목 설정
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="radio"
                        name="recordType"
                        value="both"
                        checked={formData.recordType === 'both'}
                        onChange={(e) => setFormData({ ...formData, recordType: e.target.value as typeof formData.recordType })}
                        className="mt-1 w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">둘다 (자기돌봄 + 타인친절)</p>
                        <p className="text-xs text-slate-500 mt-1">
                          참여자가 자기돌봄과 타인친절 행동을 모두 기록합니다 (디폴트)
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="radio"
                        name="recordType"
                        value="self_care_only"
                        checked={formData.recordType === 'self_care_only'}
                        onChange={(e) => setFormData({ ...formData, recordType: e.target.value as typeof formData.recordType })}
                        className="mt-1 w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">자기돌봄만</p>
                        <p className="text-xs text-slate-500 mt-1">
                          참여자가 자기돌봄 행동만 기록합니다
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 border-2 border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="radio"
                        name="recordType"
                        value="kindness_only"
                        checked={formData.recordType === 'kindness_only'}
                        onChange={(e) => setFormData({ ...formData, recordType: e.target.value as typeof formData.recordType })}
                        className="mt-1 w-4 h-4 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">타인친절만</p>
                        <p className="text-xs text-slate-500 mt-1">
                          참여자가 타인친절 행동만 기록합니다
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    {editingCohort ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
