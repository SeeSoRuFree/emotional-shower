import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, Mail, CheckCircle, Home } from 'lucide-react';
import SkyBackground from '@/components/cloud/SkyBackground';
import { useApplicationStore } from '@/store/applicationStore';
import { useAuthStore } from '@/store/authStore';

export default function Waiting() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { applications } = useApplicationStore();

  const application = applications.find(
    app => app.email === currentUser?.email && app.status === 'pending'
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Clock Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
            className="mb-8 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-headspace-yellow to-yellow-500 flex items-center justify-center shadow-soft-lg"
            >
              <Clock className="w-16 h-16 text-white" />
            </motion.div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur rounded-3xl p-8 shadow-soft mb-6 text-center"
          >
            <h1 className="text-2xl font-bold text-headspace-darkGray mb-3">
              신청서 검토 중입니다
            </h1>
            <p className="text-headspace-textMuted mb-6">
              승인까지 1-2일 정도 소요됩니다<br />
              조금만 기다려주세요!
            </p>

            {application && (
              <div className="space-y-4">
                {/* Application Info */}
                <div className="bg-headspace-pastel-blue/30 rounded-2xl p-4 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-headspace-blue" />
                    <span className="text-sm font-semibold text-headspace-darkGray">
                      신청 정보
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-headspace-textMuted">이메일</span>
                      <span className="font-medium text-headspace-darkGray">
                        {application.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-headspace-textMuted">신청일</span>
                      <span className="font-medium text-headspace-darkGray">
                        {formatDate(application.appliedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gradient-to-r from-headspace-pastel-green to-headspace-pastel-blue rounded-2xl p-4 text-left">
                  <h3 className="text-sm font-semibold text-headspace-darkGray mb-3">
                    다음 단계
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-headspace-textMuted">
                        신청서 제출 완료
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-yellow-500 flex-shrink-0 mt-0.5 animate-pulse" />
                      <span className="text-headspace-textMuted">
                        관리자 검토 중 (현재)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                      <span className="text-headspace-textMuted">
                        승인 시 이메일로 인증 코드 발송
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                      <span className="text-headspace-textMuted">
                        코드 입력 후 챌린지 시작
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/intro')}
            className="w-full py-4 bg-white text-headspace-darkGray rounded-full font-semibold shadow-soft flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            처음으로 돌아가기
          </motion.button>
        </motion.div>
      </div>
    </SkyBackground>
  );
}
