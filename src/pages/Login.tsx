import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';
import SkyBackground from '@/components/cloud/SkyBackground';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (!result.success) {
        setErrors({ password: result.error || '로그인에 실패했습니다' });
        setIsLoading(false);
        return;
      }

      // 로그인 성공 - Home으로 이동
      setIsLoading(false);
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ password: '로그인 중 오류가 발생했습니다' });
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <SkyBackground timeOfDay="day" cloudDensity="low" className="flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
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
                <LogIn className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className="text-3xl font-bold text-headspace-darkGray mb-2">
              로그인
            </h1>
            <p className="text-headspace-textMuted">
              정서샤워에 오신 것을 환영합니다
            </p>
          </div>

          {/* Test Account Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-4 shadow-soft mb-4">
            <p className="text-xs text-yellow-800 font-semibold mb-2">
              🧪 테스트 계정 (바로 로그인 가능)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-yellow-700 mb-1">이메일:</p>
                <p className="font-mono font-bold text-yellow-900">test@test.com</p>
              </div>
              <div>
                <p className="text-yellow-700 mb-1">비밀번호:</p>
                <p className="font-mono font-bold text-yellow-900">test123</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur rounded-3xl p-6 shadow-soft space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-headspace-darkGray mb-2">
                이메일
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onKeyPress={handleKeyPress}
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
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="비밀번호를 입력하세요"
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
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={isLoading}
            className="mt-6 w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
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
              onClick={() => navigate('/signup')}
              className="text-headspace-blue hover:underline text-sm font-medium"
            >
              계정이 없으신가요? 회원가입하기
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
