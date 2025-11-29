import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useChallengeStore } from '@/store/challengeStore';
import { useAuthStore } from '@/store/authStore';
import { useSurveyStore, type SurveyResponse } from '@/store/surveyStore';

// Survey sections configuration
const SURVEY_SECTIONS = [
  {
    id: 'flourishing',
    title: '번영감 척도',
    description: '지난 한 달간의 전반적인 웰빙 상태를 측정합니다',
    emoji: '🌟',
    questions: [
      { id: 'flourishing-1', text: '나는 목적의식을 갖고 살아가고 있다' },
      { id: 'flourishing-2', text: '나의 사회적 관계는 지지적이고 보람 있다' },
      { id: 'flourishing-3', text: '나는 나의 일상활동에 몰입하고 관심을 갖고 있다' },
      { id: 'flourishing-4', text: '나는 나와 타인의 행복에 적극적으로 기여한다' },
      { id: 'flourishing-5', text: '나는 유능하고 능력이 있다고 느낀다' },
      { id: 'flourishing-6', text: '나는 좋은 사람이고 좋은 삶을 살고 있다' },
      { id: 'flourishing-7', text: '나는 낙관적이다' },
      { id: 'flourishing-8', text: '사람들은 나를 존중한다' }
    ]
  },
  {
    id: 'satisfaction',
    title: '삶의 만족도',
    description: '현재 삶에 대한 전반적인 만족도를 평가합니다',
    emoji: '😊',
    questions: [
      { id: 'satisfaction-1', text: '대체로 나의 삶은 나의 이상에 가깝다' },
      { id: 'satisfaction-2', text: '나의 삶의 조건들은 훌륭하다' },
      { id: 'satisfaction-3', text: '나는 나의 삶에 만족한다' },
      { id: 'satisfaction-4', text: '지금까지 나는 내 삶에서 원하는 중요한 것들을 이루어왔다' },
      { id: 'satisfaction-5', text: '만약 내 인생을 다시 산다 해도, 나는 거의 아무것도 바꾸지 않을 것이다' }
    ]
  },
  {
    id: 'compassion',
    title: '자기연민 척도',
    description: '자신에 대한 친절함과 수용도를 측정합니다',
    emoji: '💝',
    questions: [
      { id: 'compassion-1', text: '나는 내 성격 중 마음에 들지 않는 면에 대해 비판적이고 판단하는 경향이 있다' },
      { id: 'compassion-2', text: '기분이 처질 때, 나는 잘못된 모든 일에 집착하고 집착하는 경향이 있다' },
      { id: 'compassion-3', text: '내 성격 중 내가 좋아하지 않는 부분을 볼 때, 나는 모든 사람에게 약점이 있다는 것을 상기시키려고 노력한다' },
      { id: 'compassion-4', text: '실패할 때, 나는 그것이 인간이라는 조건의 일부라는 것을 상기시키려고 노력한다' },
      { id: 'compassion-5', text: '힘들 때 나 자신에게 내가 필요한 돌봄과 애정을 준다' },
      { id: 'compassion-6', text: '내가 정말로 힘들 때, 나는 자신에게 가혹한 경향이 있다' },
      { id: 'compassion-7', text: '기분이 저조할 때, 나는 대부분의 다른 사람들이 아마도 나보다 더 행복할 것이라고 느낀다' },
      { id: 'compassion-8', text: '고통스러운 일이 일어날 때, 나는 그 상황에 대해 균형 잡힌 시각을 가지려고 노력한다' },
      { id: 'compassion-9', text: '실패할 때 나는 혼자라는 느낌이 든다' },
      { id: 'compassion-10', text: '내가 나에게 중요한 무언가에 실패할 때 나 혼자만의 불충분함을 느끼려고 노력한다' },
      { id: 'compassion-11', text: '기분이 저조할 때, 나는 관심과 관심을 가지고 내 감정을 받아들이려고 노력한다' },
      { id: 'compassion-12', text: '나는 내 결점과 부적절함에 대해 불관용하고 참을성이 없다' }
    ]
  },
  {
    id: 'kindness',
    title: '친절 척도',
    description: '일상에서의 친절한 행동 빈도를 측정합니다',
    emoji: '🤝',
    questions: [
      { id: 'kindness-1', text: '나는 다른 사람들이 짐을 나르는 것을 도와주었다' },
      { id: 'kindness-2', text: '나는 자선단체나 좋은 일에 물건이나 돈을 기부했다' },
      { id: 'kindness-3', text: '나는 낯선 사람에게 길을 안내해주었다' },
      { id: 'kindness-4', text: '나는 누군가에게 나의 자리를 양보했다' },
      { id: 'kindness-5', text: '나는 다른 사람을 위해 문을 잡아주었다' },
      { id: 'kindness-6', text: '나는 헌혈을 했다' },
      { id: 'kindness-7', text: '나는 도움이 필요한 낯선 사람을 도왔다' },
      { id: 'kindness-8', text: '나는 친구나 동료에게 내 과제나 일을 도와달라고 자원했다' },
      { id: 'kindness-9', text: '나는 자원봉사를 했다' }
    ]
  }
];

// Likert scale options
const LIKERT_OPTIONS = [
  { value: 1, label: '전혀 아니다' },
  { value: 2, label: '아니다' },
  { value: 3, label: '보통이다' },
  { value: 4, label: '그렇다' },
  { value: 5, label: '매우 그렇다' }
];

type Step = 'intro' | 'section' | 'outro';

export default function PreSurvey() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const cohortId = currentUser?.currentCohortId;

  const { startChallenge, completeDay } = useChallengeStore();
  const { submitPreSurvey } = useSurveyStore();

  const [step, setStep] = useState<Step>('intro');
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Load saved progress on mount
  useEffect(() => {
    const saved = localStorage.getItem('pre-survey-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAnswers(parsed);
      } catch (error) {
        console.error('Failed to load survey progress:', error);
      }
    }
  }, []);

  // Auto-save to localStorage whenever answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('pre-survey-progress', JSON.stringify(answers));
    }
  }, [answers]);

  const currentSection = SURVEY_SECTIONS[currentSectionIndex];
  const totalQuestions = SURVEY_SECTIONS.reduce((acc, s) => acc + s.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progressPercentage = Math.round((answeredQuestions / totalQuestions) * 100);

  const isSectionComplete = () => {
    return currentSection.questions.every(q => answers[q.id] !== undefined);
  };

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNextSection = () => {
    if (currentSectionIndex < SURVEY_SECTIONS.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setStep('section');
    } else {
      setStep('outro');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      setStep('section');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplete = async () => {
    if (!cohortId) return;

    // Convert answers to SurveyResponse format
    const surveyResponses: SurveyResponse[] = Object.entries(answers).map(([questionId, value]) => ({
      questionId,
      value
    }));

    submitPreSurvey(surveyResponses);
    await startChallenge(cohortId);

    // 사전 설문 = DAY 1 완료 처리
    await completeDay(cohortId, 1);

    localStorage.removeItem('pre-survey-progress');

    // 홈으로 이동 (DAY 2 시작)
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-headspace-pastel-blue via-white to-headspace-pastel-green">
      {/* Progress Bar */}
      {step !== 'intro' && (
        <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
          <div className="max-w-lg mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-headspace-darkGray">
                사전 설문
              </span>
              <span className="text-sm text-headspace-textMuted">
                {answeredQuestions} / {totalQuestions}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-headspace-blue to-headspace-purple"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6 pt-24">
        <div className="max-w-lg w-full">
          <AnimatePresence mode="wait">
            {/* Intro Step */}
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl p-8 shadow-soft-lg text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl mb-6"
                >
                  📝
                </motion.div>

                <h1 className="text-3xl font-bold text-headspace-darkGray mb-4">
                  사전 설문 시작
                </h1>

                <p className="text-headspace-textMuted mb-8">
                  챌린지 시작 전 현재 상태를 측정합니다<br />
                  총 34개 문항, 약 10분 소요됩니다
                </p>

                <div className="space-y-3 mb-8 text-left">
                  {SURVEY_SECTIONS.map((section, index) => (
                    <div key={section.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                      <span className="text-3xl">{section.emoji}</span>
                      <div>
                        <h3 className="font-semibold text-headspace-darkGray">
                          {index + 1}. {section.title}
                        </h3>
                        <p className="text-sm text-headspace-textMuted">
                          {section.questions.length}개 문항
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setStep('section');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg flex items-center justify-center gap-2"
                >
                  시작하기
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {/* Section Step */}
            {step === 'section' && currentSection && (
              <motion.div
                key={`section-${currentSectionIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl p-8 shadow-soft-lg"
              >
                <div className="text-center mb-6">
                  <span className="text-6xl mb-4 block">{currentSection.emoji}</span>
                  <h2 className="text-2xl font-bold text-headspace-darkGray mb-2">
                    {currentSection.title}
                  </h2>
                  <p className="text-sm text-headspace-textMuted">
                    {currentSection.description}
                  </p>
                </div>

                <div className="space-y-6 mb-8">
                  {currentSection.questions.map((question, qIndex) => (
                    <div key={question.id} className="space-y-3">
                      <p className="font-medium text-headspace-darkGray">
                        {qIndex + 1}. {question.text}
                      </p>
                      <div className="flex items-start justify-between gap-2">
                        {LIKERT_OPTIONS.map((option, optIndex) => (
                          <div key={option.value} className="flex flex-col items-center flex-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAnswer(question.id, option.value)}
                              className={`w-10 h-10 rounded-full font-semibold text-base transition-all ${
                                answers[question.id] === option.value
                                  ? 'bg-gradient-to-br from-headspace-blue to-headspace-purple text-white shadow-soft'
                                  : 'bg-gray-100 text-headspace-textMuted hover:bg-gray-200'
                              }`}
                            >
                              {option.value}
                            </motion.button>
                            {(optIndex === 0 || optIndex === LIKERT_OPTIONS.length - 1) && (
                              <span className="text-xs text-headspace-textMuted mt-1 text-center leading-tight">
                                {option.label}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  {currentSectionIndex > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePrevSection}
                      className="flex-1 py-4 bg-gray-100 text-headspace-darkGray rounded-full font-semibold flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      이전
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={isSectionComplete() ? { scale: 1.02 } : {}}
                    whileTap={isSectionComplete() ? { scale: 0.98 } : {}}
                    onClick={handleNextSection}
                    disabled={!isSectionComplete()}
                    className={`flex-1 py-4 rounded-full font-semibold flex items-center justify-center gap-2 ${
                      isSectionComplete()
                        ? 'bg-gradient-to-r from-headspace-blue to-headspace-purple text-white shadow-soft'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {currentSectionIndex === SURVEY_SECTIONS.length - 1 ? '완료' : '다음'}
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Outro Step */}
            {step === 'outro' && (
              <motion.div
                key="outro"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 shadow-soft-lg text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 1 }}
                  className="text-8xl mb-6"
                >
                  ✨
                </motion.div>

                <h2 className="text-2xl font-bold text-headspace-darkGray mb-4">
                  사전 설문 완료!
                </h2>

                <p className="text-headspace-textMuted mb-8">
                  모든 문항에 응답해주셔서 감사합니다<br />
                  이제 30일간의 친절 챌린지를 시작할 준비가 되었습니다
                </p>

                <div className="bg-gradient-to-br from-headspace-pastel-blue to-headspace-pastel-purple rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-headspace-blue" />
                    <p className="font-semibold text-headspace-darkGray">
                      {totalQuestions}개 문항 완료
                    </p>
                  </div>
                  <p className="text-sm text-headspace-textMuted">
                    30일 후 사후 설문과 비교하여<br />
                    성장 리포트를 제공해드릴게요
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComplete}
                  className="w-full py-4 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft-lg flex items-center justify-center gap-2"
                >
                  DAY 1 완료! 홈으로 가기
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
