import { create } from 'zustand';

export interface OnboardingPreferences {
  // Step 1: Service usage intent
  intentions: string[];
  customIntention?: string;
  
  // Step 2: AI conversation tone
  conversationTone: 'warm' | 'honest' | 'bright' | 'neutral' | null;
  
  // Step 3: Practice emotion record
  practiceWeather: 'sunny' | 'cloudy' | 'rainy' | null;
  practiceEmotions: string[];
  
  // Step 4: Conversation method
  conversationMethod: 'voice' | 'text' | null;
  
  // Step 5: Ending routine
  endingRoutine: 'music' | 'book' | 'sleep' | null;
  
  // Progress tracking
  currentStep: number;
  isCompleted: boolean;
}

interface OnboardingStore {
  preferences: OnboardingPreferences;
  
  // Actions
  setIntentions: (intentions: string[], customIntention?: string) => void;
  setConversationTone: (tone: OnboardingPreferences['conversationTone']) => void;
  setPracticeRecord: (weather: OnboardingPreferences['practiceWeather'], emotions: string[]) => void;
  setConversationMethod: (method: OnboardingPreferences['conversationMethod']) => void;
  setEndingRoutine: (routine: OnboardingPreferences['endingRoutine']) => void;
  
  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  completeOnboarding: () => void;
  
  // Reset
  resetOnboarding: () => void;
}

const initialPreferences: OnboardingPreferences = {
  intentions: [],
  customIntention: undefined,
  conversationTone: null,
  practiceWeather: null,
  practiceEmotions: [],
  conversationMethod: null,
  endingRoutine: null,
  currentStep: 0,
  isCompleted: false,
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  preferences: (() => {
    try {
      const saved = localStorage.getItem('onboardingPreferences');
      return saved ? { ...initialPreferences, ...JSON.parse(saved) } : initialPreferences;
    } catch {
      return initialPreferences;
    }
  })(),

  setIntentions: (intentions, customIntention) => {
    set((state) => {
      const newPreferences = {
        ...state.preferences,
        intentions,
        customIntention,
      };
      localStorage.setItem('onboardingPreferences', JSON.stringify(newPreferences));
      return { preferences: newPreferences };
    });
  },

  setConversationTone: (conversationTone) => {
    set((state) => {
      const newPreferences = {
        ...state.preferences,
        conversationTone,
      };
      localStorage.setItem('onboardingPreferences', JSON.stringify(newPreferences));
      return { preferences: newPreferences };
    });
  },

  setPracticeRecord: (practiceWeather, practiceEmotions) => {
    set((state) => {
      const newPreferences = {
        ...state.preferences,
        practiceWeather,
        practiceEmotions,
      };
      localStorage.setItem('onboardingPreferences', JSON.stringify(newPreferences));
      return { preferences: newPreferences };
    });
  },

  setConversationMethod: (conversationMethod) => {
    set((state) => {
      const newPreferences = {
        ...state.preferences,
        conversationMethod,
      };
      localStorage.setItem('onboardingPreferences', JSON.stringify(newPreferences));
      return { preferences: newPreferences };
    });
  },

  setEndingRoutine: (endingRoutine) => {
    set((state) => {
      const newPreferences = {
        ...state.preferences,
        endingRoutine,
      };
      localStorage.setItem('onboardingPreferences', JSON.stringify(newPreferences));
      return { preferences: newPreferences };
    });
  },

  nextStep: () => {
    set((state) => {
      const newStep = Math.min(state.preferences.currentStep + 1, 6);
      const newPreferences = {
        ...state.preferences,
        currentStep: newStep,
      };
      localStorage.setItem('onboardingPreferences', JSON.stringify(newPreferences));
      return { preferences: newPreferences };
    });
  },

  prevStep: () => {
    set((state) => {
      const newStep = Math.max(state.preferences.currentStep - 1, 0);
      const newPreferences = {
        ...state.preferences,
        currentStep: newStep,
      };
      localStorage.setItem('onboardingPreferences', JSON.stringify(newPreferences));
      return { preferences: newPreferences };
    });
  },

  goToStep: (step) => {
    set((state) => {
      const newPreferences = {
        ...state.preferences,
        currentStep: Math.max(0, Math.min(step, 6)),
      };
      localStorage.setItem('onboardingPreferences', JSON.stringify(newPreferences));
      return { preferences: newPreferences };
    });
  },

  completeOnboarding: () => {
    set((state) => {
      const newPreferences = {
        ...state.preferences,
        isCompleted: true,
        currentStep: 6,
      };
      localStorage.setItem('onboardingPreferences', JSON.stringify(newPreferences));
      localStorage.setItem('hasCompletedOnboarding', 'true');
      return { preferences: newPreferences };
    });
  },

  resetOnboarding: () => {
    localStorage.removeItem('onboardingPreferences');
    localStorage.removeItem('hasCompletedOnboarding');
    set({ preferences: initialPreferences });
  },
}));

// Selector functions
export const getOnboardingProgress = (currentStep: number) => {
  return Math.round((currentStep / 6) * 100);
};

export const isStepCompleted = (step: number, preferences: OnboardingPreferences) => {
  switch (step) {
    case 0:
      return true; // Philosophy step is always considered complete after viewing
    case 1:
      return preferences.intentions.length > 0;
    case 2:
      return preferences.conversationTone !== null;
    case 3:
      return preferences.practiceWeather !== null && preferences.practiceEmotions.length > 0;
    case 4:
      return preferences.conversationMethod !== null;
    case 5:
      return preferences.endingRoutine !== null;
    case 6:
      return preferences.isCompleted;
    default:
      return false;
  }
};