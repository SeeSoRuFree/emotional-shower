import { create } from 'zustand';
import { useAuthStore, OnboardingPreferences } from './authStore';

// Re-export for compatibility
export type { OnboardingPreferences } from './authStore';

interface OnboardingStore {
  // Local state for non-logged-in users or during onboarding flow
  localPreferences: OnboardingPreferences;

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
  completeOnboarding: () => Promise<void>;

  // Reset
  resetOnboarding: () => void;

  // Getter for preferences (from authStore if logged in, otherwise local)
  getPreferences: () => OnboardingPreferences;
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

// Helper to save preferences
const savePreferences = async (preferences: OnboardingPreferences) => {
  const { currentUser, updateOnboardingPreferences } = useAuthStore.getState();
  if (currentUser) {
    await updateOnboardingPreferences(preferences);
  }
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  localPreferences: initialPreferences,

  getPreferences: () => {
    const { currentUser } = useAuthStore.getState();
    if (currentUser?.onboardingPreferences) {
      return currentUser.onboardingPreferences;
    }
    return get().localPreferences;
  },

  setIntentions: (intentions, customIntention) => {
    const currentPrefs = get().getPreferences();
    const newPreferences = {
      ...currentPrefs,
      intentions,
      customIntention,
    };
    set({ localPreferences: newPreferences });
    savePreferences(newPreferences);
  },

  setConversationTone: (conversationTone) => {
    const currentPrefs = get().getPreferences();
    const newPreferences = {
      ...currentPrefs,
      conversationTone,
    };
    set({ localPreferences: newPreferences });
    savePreferences(newPreferences);
  },

  setPracticeRecord: (practiceWeather, practiceEmotions) => {
    const currentPrefs = get().getPreferences();
    const newPreferences = {
      ...currentPrefs,
      practiceWeather,
      practiceEmotions,
    };
    set({ localPreferences: newPreferences });
    savePreferences(newPreferences);
  },

  setConversationMethod: (conversationMethod) => {
    const currentPrefs = get().getPreferences();
    const newPreferences = {
      ...currentPrefs,
      conversationMethod,
    };
    set({ localPreferences: newPreferences });
    savePreferences(newPreferences);
  },

  setEndingRoutine: (endingRoutine) => {
    const currentPrefs = get().getPreferences();
    const newPreferences = {
      ...currentPrefs,
      endingRoutine,
    };
    set({ localPreferences: newPreferences });
    savePreferences(newPreferences);
  },

  nextStep: () => {
    const currentPrefs = get().getPreferences();
    const newStep = Math.min(currentPrefs.currentStep + 1, 6);
    const newPreferences = {
      ...currentPrefs,
      currentStep: newStep,
    };
    set({ localPreferences: newPreferences });
    savePreferences(newPreferences);
  },

  prevStep: () => {
    const currentPrefs = get().getPreferences();
    const newStep = Math.max(currentPrefs.currentStep - 1, 0);
    const newPreferences = {
      ...currentPrefs,
      currentStep: newStep,
    };
    set({ localPreferences: newPreferences });
    savePreferences(newPreferences);
  },

  goToStep: (step) => {
    const currentPrefs = get().getPreferences();
    const newPreferences = {
      ...currentPrefs,
      currentStep: Math.max(0, Math.min(step, 6)),
    };
    set({ localPreferences: newPreferences });
    savePreferences(newPreferences);
  },

  completeOnboarding: async () => {
    const currentPrefs = get().getPreferences();
    const newPreferences = {
      ...currentPrefs,
      isCompleted: true,
      currentStep: 6,
    };
    set({ localPreferences: newPreferences });

    // Save to Supabase
    const { currentUser, updateOnboardingPreferences, completeOnboarding } = useAuthStore.getState();
    if (currentUser) {
      await updateOnboardingPreferences(newPreferences);
      await completeOnboarding();
    }
  },

  resetOnboarding: () => {
    set({ localPreferences: initialPreferences });
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
