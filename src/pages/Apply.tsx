import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Send, CheckCircle, Heart, Calendar, Users, ArrowRight } from 'lucide-react';
import SkyBackground from '@/components/cloud/SkyBackground';
import { useApplicationStore } from '@/store/applicationStore';

type ApplyStep = 'intro' | 'form' | 'consent' | 'submitted';

export default function Apply() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ApplyStep>('intro');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    motivation: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);

  const { submitApplication } = useApplicationStore();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.motivation.trim()) {
      newErrors.motivation = '참여 동기를 입력해주세요';
    } else if (formData.motivation.length < 10) {
      newErrors.motivation = '최소 10자 이상 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFormSubmit = () => {
    if (!validateForm()) return;
    setStep('consent');
  };

  const handleFinalSubmit = () => {
    // 신청서 제출 (기수는 어드민이 승인 시 할당)
    submitApplication({
      name: formData.name,
      email: formData.email,
      motivation: formData.motivation
    });

    setStep('submitted');
  };

  return (
    <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col min-h-screen">
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg mx-auto"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Intro - 프로그램 소개 */}
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-soft-lg"
              >
                <div className="text-center mb-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    🌱
                  </motion.div>
                  <h1 className="text-3xl font-bold text-headspace-darkGray mb-2">
                    친절함을 연습하는 시간
                  </h1>
                  <p className="text-headspace-textMuted">
                    30일 친절함 챌린지
                  </p>
                </div>

                <h2 className="text-xl font-bold text-headspace-darkGray mb-4">
                  챌린지 소개
                </h2>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start gap-3 p-4 bg-headspace-pastel-yellow rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-headspace-yellow flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-headspace-darkGray mb-1">30일 매일 기록</h3>
                      <p className="text-sm text-headspace-textMuted">
                        자기돌봄과 타인친절 행동을 매일 기록하며 습관을 만들어갑니다
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-headspace-pastel-blue rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-headspace-blue flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-headspace-darkGray mb-1">스탬프 수집</h3>
                      <p className="text-sm text-headspace-textMuted">
                        매일 완료 시 스탬프를 받아 30개를 모으는 재미
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-headspace-pastel-green rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-headspace-green flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-headspace-darkGray mb-1">성장 리포트</h3>
                      <p className="text-sm text-headspace-textMuted">
                        22일 이상 완료 시 사전/사후 비교 분석 리포트 제공
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-headspace-pastel-pink rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-headspace-pink flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-headspace-darkGray mb-1">기수별 커뮤니티</h3>
                      <p className="text-sm text-headspace-textMuted">
                        같은 달 참여자들과 감정을 나누고 서로 응원
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('form')}
                  className="w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg flex items-center justify-center gap-2"
                >
                  신청하기
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="mt-3 w-full py-4 bg-white border-2 border-headspace-blue text-headspace-blue rounded-full font-semibold shadow-soft"
                >
                  이미 신청하셨나요? 로그인하기
                </motion.button>

                <button
                  onClick={() => navigate('/intro')}
                  className="mt-4 w-full text-center text-headspace-textMuted text-sm"
                >
                  ← 뒤로 가기
                </button>
              </motion.div>
            )}

            {/* Step 2: Form - 신청 정보 입력 */}
            {step === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-soft-lg"
              >
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-headspace-yellow to-yellow-400 rounded-3xl flex items-center justify-center shadow-soft-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-headspace-darkGray mb-2">
                    신청 정보 입력
                  </h2>
                  <p className="text-headspace-textMuted text-sm">
                    30일 친절함 챌린지
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-headspace-darkGray mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="홍길동"
                      className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none transition-colors ${
                        errors.name
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-headspace-pastel-blue focus:border-headspace-blue'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-headspace-darkGray mb-2">
                      이메일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="example@email.com"
                      className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none transition-colors ${
                        errors.email
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-headspace-pastel-blue focus:border-headspace-blue'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                    <p className="mt-1 text-xs text-headspace-textMuted">
                      승인 시 이 이메일로 인증 코드를 보내드립니다
                    </p>
                  </div>

                  {/* Motivation */}
                  <div>
                    <label className="block text-sm font-semibold text-headspace-darkGray mb-2">
                      참여 동기 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.motivation}
                      onChange={(e) => handleChange('motivation', e.target.value)}
                      placeholder="챌린지에 참여하고 싶은 이유를 자유롭게 작성해주세요"
                      rows={5}
                      className={`w-full px-4 py-3 border-2 rounded-2xl focus:outline-none transition-colors resize-none ${
                        errors.motivation
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-headspace-pastel-blue focus:border-headspace-blue'
                      }`}
                    />
                    {errors.motivation && (
                      <p className="mt-1 text-sm text-red-500">{errors.motivation}</p>
                    )}
                    <p className="mt-1 text-xs text-headspace-textMuted">
                      {formData.motivation.length}자 (최소 10자)
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFormSubmit}
                  className="w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg flex items-center justify-center gap-2"
                >
                  다음
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <button
                  onClick={() => setStep('intro')}
                  className="mt-4 w-full text-center text-headspace-textMuted text-sm"
                >
                  ← 이전
                </button>
              </motion.div>
            )}

            {/* Step 3: Consent - 동의서 */}
            {step === 'consent' && (
              <motion.div
                key="consent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-soft-lg"
              >
                <h2 className="text-2xl font-bold text-headspace-darkGray mb-4">
                  참여 동의 및 안내
                </h2>

                <div className="bg-gray-50 rounded-2xl p-6 mb-6 max-h-80 overflow-y-auto">
                  <h3 className="font-semibold text-headspace-darkGray mb-3">
                    📊 연구 목적 및 데이터 수집
                  </h3>
                  <div className="text-sm text-headspace-textMuted space-y-3">
                    <p>
                      본 챌린지는 <strong>사회실험</strong> 성격의 웰니스 프로그램으로,
                      자기돌봄과 타인친절이 마음 건강에 미치는 영향을 연구합니다.
                    </p>
                    <p>
                      다음 데이터가 수집됩니다:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>사전/사후 설문 응답 (웰빙, 만족도, 자기연민, 친절 척도)</li>
                      <li>일일 기록 데이터 (자기돌봄, 타인친절 행동)</li>
                      <li>커뮤니티 활동 내역 (게시글, 댓글)</li>
                    </ul>

                    <h3 className="font-semibold text-headspace-darkGray mb-2 mt-4">
                      🔒 개인정보 보호
                    </h3>
                    <p>
                      모든 데이터는 <strong>로컬스토리지</strong>에 저장되며,
                      개인을 식별할 수 있는 정보는 수집하지 않습니다.
                      참여자는 <strong>익명</strong>으로 처리됩니다.
                    </p>

                    <h3 className="font-semibold text-headspace-darkGray mb-2 mt-4">
                      ✅ 자발적 참여
                    </h3>
                    <p>
                      참여는 자발적이며, 언제든지 중단할 수 있습니다.
                      중단 시에도 불이익은 없습니다.
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-3 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 accent-headspace-blue"
                  />
                  <span className="text-sm text-headspace-darkGray">
                    위 내용을 확인했으며, 자발적으로 참여에 동의합니다
                  </span>
                </label>

                <motion.button
                  whileHover={agreed ? { scale: 1.02 } : {}}
                  whileTap={agreed ? { scale: 0.98 } : {}}
                  onClick={handleFinalSubmit}
                  disabled={!agreed}
                  className={`w-full py-4 rounded-full font-semibold shadow-soft-lg flex items-center justify-center gap-2 ${
                    agreed
                      ? 'bg-gradient-to-r from-headspace-blue to-headspace-purple text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                  신청 제출하기
                </motion.button>

                <button
                  onClick={() => setStep('form')}
                  className="mt-4 w-full text-center text-headspace-textMuted text-sm"
                >
                  ← 이전
                </button>
              </motion.div>
            )}

            {/* Step 4: Submitted - 완료 */}
            {step === 'submitted' && (
              <motion.div
                key="submitted"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/90 backdrop-blur rounded-3xl p-8 shadow-soft-lg text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-6 flex justify-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-headspace-green to-green-400 rounded-full flex items-center justify-center shadow-soft-lg">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                </motion.div>

                <h1 className="text-3xl font-bold text-headspace-darkGray mb-4">
                  신청 완료!
                </h1>

                <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-soft mb-6">
                  <p className="text-headspace-darkGray mb-3">
                    챌린지 신청이 완료되었습니다
                  </p>
                  <p className="text-sm text-headspace-textMuted mb-4">
                    승인 후 <strong>{formData.email}</strong>로<br />
                    인증 코드를 보내드립니다
                  </p>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mt-4">
                    <h3 className="font-semibold text-yellow-900 mb-2 text-sm flex items-center gap-2">
                      🧪 테스트 모드
                    </h3>
                    <p className="text-xs text-yellow-800 mb-2">
                      현재 테스트 중이므로 바로 가입할 수 있습니다!
                    </p>
                    <div className="bg-white rounded-xl p-3 mb-2">
                      <p className="text-xs text-yellow-700 mb-1">테스트용 코드:</p>
                      <p className="text-lg font-bold text-yellow-900 text-center tracking-wider">
                        TEST01
                      </p>
                    </div>
                    <p className="text-xs text-yellow-700">
                      회원가입 페이지에서 위 코드를 입력하세요
                    </p>
                  </div>

                  <div className="bg-headspace-pastel-blue/30 rounded-2xl p-4 mt-4">
                    <h3 className="font-semibold text-headspace-darkGray mb-2 text-sm">
                      📌 일반 사용자 단계 (정식 운영 시)
                    </h3>
                    <ol className="text-xs text-headspace-textMuted text-left space-y-1">
                      <li>1. 신청서 검토 및 승인 (1-2일 소요)</li>
                      <li>2. 승인 시 이메일로 인증 코드 발송</li>
                      <li>3. 코드 입력 후 사전 설문 진행</li>
                      <li>4. 챌린지 시작 (DAY 1부터)</li>
                    </ol>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/signup')}
                  className="w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg mb-3"
                >
                  테스트 코드로 바로 회원가입하기 →
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="w-full py-4 bg-white border-2 border-headspace-blue text-headspace-blue rounded-full font-semibold shadow-soft mb-3"
                >
                  이미 계정이 있으신가요? 로그인하기
                </motion.button>

                <button
                  onClick={() => navigate('/intro')}
                  className="text-headspace-textMuted text-sm"
                >
                  처음으로 돌아가기
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </SkyBackground>
  );
}
