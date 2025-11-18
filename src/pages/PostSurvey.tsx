import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useSurveyStore, SURVEY_QUESTIONS } from '@/store/surveyStore';
import { useChallengeStore } from '@/store/challengeStore';

// Likert Scale Component
const LikertScale = ({ value, onChange }: { value: number; onChange: (value: number) => void }) => {
  const options = [
    { value: 1, label: '전혀 아니다', color: 'from-red-100 to-red-200' },
    { value: 2, label: '아니다', color: 'from-orange-100 to-orange-200' },
    { value: 3, label: '보통', color: 'from-yellow-100 to-yellow-200' },
    { value: 4, label: '그렇다', color: 'from-green-100 to-green-200' },
    { value: 5, label: '매우 그렇다', color: 'from-blue-100 to-blue-200' }
  ];

  return (
    <div className="space-y-3">
      {options.map(option => (
        <motion.button
          key={option.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(option.value)}
          className={`w-full p-4 rounded-2xl font-medium transition-all ${
            value === option.value
              ? `bg-gradient-to-r ${option.color} shadow-soft border-2 border-headspace-blue`
              : 'bg-white border-2 border-gray-100 hover:border-headspace-blue/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={value === option.value ? 'text-headspace-darkGray' : 'text-headspace-textMuted'}>
              {option.label}
            </span>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              value === option.value
                ? 'border-headspace-blue bg-headspace-blue'
                : 'border-gray-300'
            }`}>
              {value === option.value && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default function PostSurvey() {
  const navigate = useNavigate();
  const { submitPostSurvey } = useSurveyStore();
  const { userChallenge, completeChallenge } = useChallengeStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});

  // Flatten all questions
  const allQuestions = [
    ...SURVEY_QUESTIONS.flourishing.map(q => ({ ...q, category: 'flourishing' })),
    ...SURVEY_QUESTIONS.satisfaction.map(q => ({ ...q, category: 'satisfaction' })),
    ...SURVEY_QUESTIONS.compassion.map(q => ({ ...q, category: 'compassion' })),
    ...SURVEY_QUESTIONS.kindness.map(q => ({ ...q, category: 'kindness' }))
  ];

  const totalQuestions = allQuestions.length;
  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentResponse = responses[currentQuestion.id] || 0;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  useEffect(() => {
    // Check if user should be here
    if (!userChallenge || userChallenge.status === 'completed') {
      navigate('/home');
    }
  }, [userChallenge, navigate]);

  const handleSelectResponse = (value: number) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));

    // Auto-advance after selection
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    // Save post-survey
    submitPostSurvey(responses);

    // Mark challenge as completed
    completeChallenge();

    // Navigate to report
    navigate('/report');
  };

  const isAllAnswered = Object.keys(responses).length === totalQuestions;

  return (
    <div className="min-h-screen bg-gradient-to-b from-headspace-pastel-purple via-white to-headspace-pastel-blue">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur shadow-soft z-20">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2 rounded-xl hover:bg-headspace-pastel-blue transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-headspace-darkGray" />
            </button>

            <div className="text-center">
              <h1 className="font-semibold text-headspace-darkGray">
                사후 설문
              </h1>
              <p className="text-xs text-headspace-textMuted">
                질문 {currentQuestionIndex + 1} / {totalQuestions}
              </p>
            </div>

            <div className="w-12" />
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-headspace-purple to-headspace-blue rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {currentQuestionIndex === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-headspace-pastel-yellow to-headspace-pastel-pink rounded-3xl p-6 shadow-soft"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="font-bold text-headspace-darkGray text-xl mb-2">
                30일 챌린지 완주를 축하합니다!
              </h2>
              <p className="text-sm text-headspace-textMuted leading-relaxed">
                챌린지 전후 변화를 분석하기 위해<br />
                마지막 설문에 응답해주세요. 완료 후 성장 리포트를 확인할 수 있습니다.
              </p>
            </div>
          </motion.div>
        )}

        {/* Question Card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-soft mb-6"
        >
          {/* Category Badge */}
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              currentQuestion.category === 'flourishing'
                ? 'bg-headspace-pastel-yellow text-headspace-yellow'
                : currentQuestion.category === 'satisfaction'
                ? 'bg-headspace-pastel-blue text-headspace-blue'
                : currentQuestion.category === 'compassion'
                ? 'bg-headspace-pastel-green text-headspace-green'
                : 'bg-headspace-pastel-pink text-headspace-pink'
            }`}>
              {currentQuestion.category === 'flourishing' && '번영감'}
              {currentQuestion.category === 'satisfaction' && '삶의 만족'}
              {currentQuestion.category === 'compassion' && '자기 자비'}
              {currentQuestion.category === 'kindness' && '타인 친절'}
            </span>
          </div>

          {/* Question */}
          <h2 className="text-xl font-bold text-headspace-darkGray mb-6 leading-relaxed">
            {currentQuestion.text}
          </h2>

          {/* Likert Scale */}
          <LikertScale value={currentResponse} onChange={handleSelectResponse} />
        </motion.div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQuestionIndex > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrevious}
              className="flex-1 py-4 bg-gray-100 rounded-full font-semibold text-headspace-darkGray hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              이전
            </motion.button>
          )}

          {currentQuestionIndex === totalQuestions - 1 && isAllAnswered && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className="flex-1 py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-bold shadow-soft-lg flex items-center justify-center gap-2"
            >
              리포트 보기
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Answer Progress */}
        <div className="mt-8 text-center">
          <p className="text-sm text-headspace-textMuted">
            응답 완료: <span className="font-semibold text-headspace-blue">{Object.keys(responses).length}</span> / {totalQuestions}
          </p>
        </div>
      </div>
    </div>
  );
}
