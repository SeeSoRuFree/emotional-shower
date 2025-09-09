import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useEmotionStore } from '@/store/emotionStore';

import Step0Philosophy from '@/components/onboarding/Step0Philosophy';
import Step1Intentions from '@/components/onboarding/Step1Intentions';
import Step2ConversationTone from '@/components/onboarding/Step2ConversationTone';
import Step3EmotionPractice from '@/components/onboarding/Step3EmotionPractice';
import Step4ConversationMethod from '@/components/onboarding/Step4ConversationMethod';
import Step5EndingRoutine from '@/components/onboarding/Step5EndingRoutine';
import Step6Completion from '@/components/onboarding/Step6Completion';

export default function Onboarding() {
  const navigate = useNavigate();
  const {
    preferences,
    setIntentions,
    setConversationTone,
    setPracticeRecord,
    setConversationMethod,
    setEndingRoutine,
    nextStep,
    prevStep,
    completeOnboarding,
  } = useOnboardingStore();

  const { addOnboardingEmotion } = useEmotionStore();

  const { currentStep } = preferences;

  // Check if user has already completed onboarding
  useEffect(() => {
    const hasCompleted = localStorage.getItem('hasCompletedOnboarding');
    if (hasCompleted) {
      navigate('/home');
    }
  }, [navigate]);

  const handleStep1Next = (intentions: string[], customIntention?: string) => {
    setIntentions(intentions, customIntention);
    nextStep();
  };

  const handleStep2Next = (tone: 'warm' | 'honest' | 'bright' | 'neutral') => {
    setConversationTone(tone);
    nextStep();
  };

  const handleStep3Next = (weather: 'sunny' | 'cloudy' | 'rainy', emotions: string[]) => {
    setPracticeRecord(weather, emotions);
    
    // Add practice emotion to the actual emotion store
    const weatherToEmotionType = {
      sunny: 'positive' as const,
      cloudy: 'negative' as const, 
      rainy: 'helping' as const,
    };
    
    // Add onboarding emotion record with weather and selected emotions
    if (emotions.length > 0) {
      addOnboardingEmotion(weatherToEmotionType[weather], weather, emotions);
    }
    
    nextStep();
  };

  const handleStep4Next = (method: 'voice' | 'text') => {
    setConversationMethod(method);
    nextStep();
  };

  const handleStep5Next = (routine: 'music' | 'book' | 'sleep') => {
    setEndingRoutine(routine);
    nextStep();
  };

  const handleLogin = (method: 'kakao' | 'guest') => {
    // Set login information
    if (method === 'kakao') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loginMethod', 'kakao');
    } else {
      localStorage.setItem('isLoggedIn', 'false');
      localStorage.setItem('loginMethod', 'guest');
    }
    
    // Complete onboarding
    completeOnboarding();
    navigate('/home');
  };

  const getProgressPercentage = () => {
    return Math.round((currentStep / 6) * 100);
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="bg-white/20 backdrop-blur-sm h-1">
          <motion.div
            className="h-full bg-white/60"
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-screen"
        >
          {currentStep === 0 && (
            <Step0Philosophy onNext={nextStep} />
          )}
          
          {currentStep === 1 && (
            <Step1Intentions
              intentions={preferences.intentions}
              customIntention={preferences.customIntention}
              onNext={handleStep1Next}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 2 && (
            <Step2ConversationTone
              selectedTone={preferences.conversationTone}
              onNext={handleStep2Next}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 3 && (
            <Step3EmotionPractice
              practiceWeather={preferences.practiceWeather}
              practiceEmotions={preferences.practiceEmotions}
              onNext={handleStep3Next}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 4 && (
            <Step4ConversationMethod
              selectedMethod={preferences.conversationMethod}
              onNext={handleStep4Next}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 5 && (
            <Step5EndingRoutine
              selectedRoutine={preferences.endingRoutine}
              onNext={handleStep5Next}
              onPrev={prevStep}
            />
          )}
          
          {currentStep === 6 && (
            <Step6Completion
              onLogin={handleLogin}
              onPrev={prevStep}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Step indicator dots (optional) */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex space-x-2">
          {Array.from({ length: 7 }, (_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index <= currentStep
                  ? 'bg-white/80'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}