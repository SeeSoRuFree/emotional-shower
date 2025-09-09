import { create } from 'zustand';

export interface EmotionRecord {
  id: string;
  type: 'joy' | 'sad' | 'helping';
  timestamp: Date;
  keyword?: string;
  weather?: 'sunny' | 'cloudy' | 'rainy';
  emotions?: string[];
  isFromOnboarding?: boolean;
}

interface EmotionStore {
  emotions: EmotionRecord[];
  addEmotion: (type: EmotionRecord['type']) => void;
  addOnboardingEmotion: (
    type: EmotionRecord['type'], 
    weather: 'sunny' | 'cloudy' | 'rainy', 
    emotions: string[]
  ) => void;
}

// Legacy data migration helper
const migrateLegacyEmotionType = (type: string): 'joy' | 'sad' | 'helping' => {
  switch (type) {
    case 'positive':
      return 'joy';
    case 'negative':
      return 'sad';
    case 'helping':
      return 'helping';
    default:
      return 'joy'; // default fallback
  }
};

export const useEmotionStore = create<EmotionStore>((set) => ({
  emotions: JSON.parse(localStorage.getItem('emotions') || '[]').map((e: any) => ({
    ...e,
    type: migrateLegacyEmotionType(e.type), // Migrate legacy types
    timestamp: new Date(e.timestamp)
  })),

  addEmotion: (type) => {
    const newEmotion: EmotionRecord = {
      id: Date.now().toString(),
      type,
      timestamp: new Date(),
    };

    set((state) => {
      const updatedEmotions = [...state.emotions, newEmotion];
      localStorage.setItem('emotions', JSON.stringify(updatedEmotions));
      return { 
        emotions: updatedEmotions
      };
    });
  },

  addOnboardingEmotion: (type, weather, emotions) => {
    const newEmotion: EmotionRecord = {
      id: `onboarding-${Date.now()}`,
      type,
      timestamp: new Date(),
      weather,
      emotions,
      isFromOnboarding: true,
    };

    set((state) => {
      const updatedEmotions = [...state.emotions, newEmotion];
      localStorage.setItem('emotions', JSON.stringify(updatedEmotions));
      return { 
        emotions: updatedEmotions
      };
    });
  }
}));

// Selector functions to derive state
export const getTodayEmotions = (emotions: EmotionRecord[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return emotions.filter(emotion => {
    const emotionDate = new Date(emotion.timestamp);
    emotionDate.setHours(0, 0, 0, 0);
    return emotionDate.getTime() === today.getTime();
  });
};

export const getEmotionStats = (emotions: EmotionRecord[]) => {
  const todayEmotions = getTodayEmotions(emotions);
  const stats = {
    joy: 0,
    sad: 0,
    helping: 0,
    total: todayEmotions.length
  };

  todayEmotions.forEach(emotion => {
    stats[emotion.type]++;
  });

  return stats;
};