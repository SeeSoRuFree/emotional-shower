import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import SkyBackground from '@/components/cloud/SkyBackground';
import { useApplicationStore } from '@/store/applicationStore';
import { useChallengeStore } from '@/store/challengeStore';
import { useAuthStore } from '@/store/authStore';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    code: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  const { verifyCode, markCodeAsUsed } = useApplicationStore();
  const { signup } = useAuthStore();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호 확인을 입력해주세요';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다';
    }

    if (!formData.code) {
      newErrors.code = '인증 코드를 입력해주세요';
    } else if (formData.code.length !== 6) {
      newErrors.code = '6자리 코드를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // 1. 코드 검증 (async - cohortStore에서 실제 UUID 가져옴)
      setLoadingStep('코드 확인 중...');
      const codeResult = await verifyCode(formData.code);

      if (!codeResult.valid) {
        setErrors({ code: '유효하지 않거나 이미 사용된 코드입니다' });
        setIsLoading(false);
        setLoadingStep('');
        return;
      }

      if (!codeResult.cohortId) {
        setErrors({ code: '코드에 연결된 기수 정보가 없습니다' });
        setIsLoading(false);
        setLoadingStep('');
        return;
      }

      // 2. 회원가입 (Supabase Auth)
      setLoadingStep('계정 생성 중...');
      const signupResult = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        cohortId: codeResult.cohortId
      });

      if (!signupResult.success) {
        setErrors({ email: signupResult.error || '회원가입에 실패했습니다' });
        setIsLoading(false);
        setLoadingStep('');
        return;
      }

      // 3. 코드 사용 처리
      setLoadingStep('챌린지 등록 중...');
      await markCodeAsUsed(formData.code);

      // 4. 챌린지 자동 신청 (approved 상태로)
      const challengeStore = useChallengeStore.getState();
      await challengeStore.applyChallenge(codeResult.cohortId);
      await challengeStore.approveChallenge(codeResult.cohortId);

      // 5. 온보딩 완료 처리
      localStorage.setItem('hasCompletedOnboarding', 'true');

      // 6. Home으로 이동 (사전 설문 버튼 보임)
      setLoadingStep('완료!');
      setIsLoading(false);
      setLoadingStep('');
      navigate('/home');
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ email: '회원가입 중 오류가 발생했습니다' });
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-headspace-blue to-headspace-purple rounded-3xl flex items-center justify-center shadow-soft-lg">
                <UserPlus className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className="text-3xl font-bold text-headspace-darkGray mb-2">
              회원가입
            </h1>
            <p className="text-headspace-textMuted">
              승인 메일로 받으신 코드로 가입하세요
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-soft space-y-4">
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
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
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
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-headspace-darkGray mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="최소 6자 이상"
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-2xl focus:outline-none transition-colors ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-headspace-pastel-blue focus:border-headspace-blue'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-headspace-textMuted hover:text-headspace-darkGray"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Password Confirm */}
            <div>
              <label className="block text-sm font-semibold text-headspace-darkGray mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  value={formData.passwordConfirm}
                  onChange={(e) => handleChange('passwordConfirm', e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-2xl focus:outline-none transition-colors ${
                    errors.passwordConfirm
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-headspace-pastel-blue focus:border-headspace-blue'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-headspace-textMuted hover:text-headspace-darkGray"
                >
                  {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.passwordConfirm}
                </p>
              )}
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-semibold text-headspace-darkGray mb-2">
                인증 코드 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  if (value.length <= 6) {
                    handleChange('code', value);
                  }
                }}
                placeholder="예: ABC123"
                maxLength={6}
                className={`w-full px-4 py-3 text-center text-xl font-bold tracking-widest border-2 rounded-2xl focus:outline-none transition-colors ${
                  errors.code
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-headspace-pastel-blue focus:border-headspace-blue'
                }`}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.code}
                </p>
              )}
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-xs text-yellow-800 font-semibold mb-1">
                  🧪 테스트용 고정 코드
                </p>
                <p className="text-lg font-bold text-yellow-900 text-center tracking-wider">
                  TEST01
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  위 코드를 입력하면 바로 가입할 수 있습니다
                </p>
              </div>
            </div>
          </div>

          {/* Signup Button */}
          <motion.button
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            onClick={handleSignup}
            disabled={isLoading}
            className="mt-6 w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {loadingStep || '처리 중...'}
              </span>
            ) : '회원가입'}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-headspace-textMuted/20" />
            <span className="text-sm text-headspace-textMuted">또는</span>
            <div className="flex-1 h-px bg-headspace-textMuted/20" />
          </div>

          {/* Links */}
          <div className="text-center space-y-2">
            <button
              onClick={() => navigate('/login')}
              className="text-headspace-blue hover:underline text-sm font-medium"
            >
              이미 계정이 있으신가요? 로그인하기
            </button>
            <br />
            <button
              onClick={() => navigate('/apply')}
              className="text-headspace-textMuted hover:text-headspace-darkGray text-sm"
            >
              아직 신청 전이신가요? 신청하기
            </button>
          </div>
        </motion.div>
      </div>
    </SkyBackground>
  );
}
