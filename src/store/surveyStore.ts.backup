import { create } from 'zustand';

// 설문 응답 (1-5 리커트 척도)
export interface SurveyResponse {
  questionId: string;
  value: number; // 1-5
}

// 설문 세트 (DAY 1 또는 DAY 30)
export interface SurveyData {
  type: 'pre' | 'post';
  completedAt: Date;
  responses: SurveyResponse[];

  // 척도별 점수
  flourishingScore: number;     // 14문항 평균
  lifeSatisfactionScore: number; // 5문항 평균
  selfCompassionScore: number;   // 12문항 평균
  kindnessScore: number;         // 3문항 평균
}

interface SurveyStore {
  preSurvey: SurveyData | null;
  postSurvey: SurveyData | null;

  // Actions
  submitPreSurvey: (responses: SurveyResponse[]) => void;
  submitPostSurvey: (responses: SurveyResponse[]) => void;
  calculateScores: (responses: SurveyResponse[]) => {
    flourishing: number;
    lifeSatisfaction: number;
    selfCompassion: number;
    kindness: number;
  };
  hasCompletedPreSurvey: () => boolean;
  hasCompletedPostSurvey: () => boolean;
}

const STORAGE_KEY = 'kindness-surveys';

// LocalStorage 로드
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        preSurvey: data.preSurvey ? {
          ...data.preSurvey,
          completedAt: new Date(data.preSurvey.completedAt)
        } : null,
        postSurvey: data.postSurvey ? {
          ...data.postSurvey,
          completedAt: new Date(data.postSurvey.completedAt)
        } : null
      };
    }
  } catch (error) {
    console.error('Failed to load survey data:', error);
  }
  return { preSurvey: null, postSurvey: null };
};

// LocalStorage 저장
const saveToStorage = (preSurvey: SurveyData | null, postSurvey: SurveyData | null) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ preSurvey, postSurvey }));
  } catch (error) {
    console.error('Failed to save survey data:', error);
  }
};

export const useSurveyStore = create<SurveyStore>((set, get) => {
  const { preSurvey, postSurvey } = loadFromStorage();

  return {
    preSurvey,
    postSurvey,

    // 점수 계산 로직
    calculateScores: (responses: SurveyResponse[]) => {
      // 문항 ID 규칙:
      // flourishing-1 ~ flourishing-14 (14문항)
      // satisfaction-1 ~ satisfaction-5 (5문항)
      // compassion-1 ~ compassion-12 (12문항)
      // kindness-1 ~ kindness-3 (3문항)

      const flourishingResponses = responses.filter(r => r.questionId.startsWith('flourishing'));
      const satisfactionResponses = responses.filter(r => r.questionId.startsWith('satisfaction'));
      const compassionResponses = responses.filter(r => r.questionId.startsWith('compassion'));
      const kindnessResponses = responses.filter(r => r.questionId.startsWith('kindness'));

      const calculateAverage = (items: SurveyResponse[]) => {
        if (items.length === 0) return 0;
        const sum = items.reduce((acc, item) => acc + item.value, 0);
        return Math.round((sum / items.length) * 100) / 100; // 소수점 2자리
      };

      return {
        flourishing: calculateAverage(flourishingResponses),
        lifeSatisfaction: calculateAverage(satisfactionResponses),
        selfCompassion: calculateAverage(compassionResponses),
        kindness: calculateAverage(kindnessResponses)
      };
    },

    // 사전 설문 제출
    submitPreSurvey: (responses: SurveyResponse[]) => {
      const scores = get().calculateScores(responses);

      const preSurveyData: SurveyData = {
        type: 'pre',
        completedAt: new Date(),
        responses,
        flourishingScore: scores.flourishing,
        lifeSatisfactionScore: scores.lifeSatisfaction,
        selfCompassionScore: scores.selfCompassion,
        kindnessScore: scores.kindness
      };

      set({ preSurvey: preSurveyData });
      saveToStorage(preSurveyData, get().postSurvey);
    },

    // 사후 설문 제출
    submitPostSurvey: (responses: SurveyResponse[]) => {
      const scores = get().calculateScores(responses);

      const postSurveyData: SurveyData = {
        type: 'post',
        completedAt: new Date(),
        responses,
        flourishingScore: scores.flourishing,
        lifeSatisfactionScore: scores.lifeSatisfaction,
        selfCompassionScore: scores.selfCompassion,
        kindnessScore: scores.kindness
      };

      set({ postSurvey: postSurveyData });
      saveToStorage(get().preSurvey, postSurveyData);
    },

    // 사전 설문 완료 여부
    hasCompletedPreSurvey: () => {
      return get().preSurvey !== null;
    },

    // 사후 설문 완료 여부
    hasCompletedPostSurvey: () => {
      return get().postSurvey !== null;
    }
  };
});

// 설문 문항 데이터 (실제 설문에서 사용)
export const SURVEY_QUESTIONS = {
  flourishing: [
    { id: 'flourishing-1', text: '나는 내 삶의 목적과 의미를 느낀다' },
    { id: 'flourishing-2', text: '나의 사회적 관계는 지지적이고 보람있다' },
    { id: 'flourishing-3', text: '나는 일상 활동에 참여하고 흥미를 느낀다' },
    { id: 'flourishing-4', text: '나는 사회에 적극적으로 기여한다' },
    { id: 'flourishing-5', text: '나는 유능하고 능력있다' },
    { id: 'flourishing-6', text: '나는 좋은 사람이고, 좋은 삶을 살고 있다' },
    { id: 'flourishing-7', text: '나는 낙관적이다' },
    { id: 'flourishing-8', text: '사람들은 나를 존중한다' },
    { id: 'flourishing-9', text: '나에게는 나를 돌보는 사람들이 있다' },
    { id: 'flourishing-10', text: '내가 하는 일의 대부분이 목적이 있다' },
    { id: 'flourishing-11', text: '나는 미래를 기대한다' },
    { id: 'flourishing-12', text: '나는 나의 삶을 즐긴다' },
    { id: 'flourishing-13', text: '나는 전반적으로 만족스럽다' },
    { id: 'flourishing-14', text: '나는 성장하고 발전하고 있다' }
  ],
  satisfaction: [
    { id: 'satisfaction-1', text: '대체로 내 삶은 내가 이상적으로 여기는 것에 가깝다' },
    { id: 'satisfaction-2', text: '내 삶의 조건들은 아주 좋다' },
    { id: 'satisfaction-3', text: '나는 내 삶에 만족한다' },
    { id: 'satisfaction-4', text: '지금까지 나는 내 삶에서 원하는 중요한 것들을 얻었다' },
    { id: 'satisfaction-5', text: '다시 태어나도 나는 거의 아무것도 바꾸지 않을 것이다' }
  ],
  compassion: [
    { id: 'compassion-1', text: '나는 나 자신에게 친절하게 대한다' },
    { id: 'compassion-2', text: '힘든 시기를 겪을 때, 나는 나 자신을 돌본다' },
    { id: 'compassion-3', text: '나의 부족함은 인간 존재의 일부라고 생각한다' },
    { id: 'compassion-4', text: '고통스러울 때, 나는 나 자신을 사랑으로 대한다' },
    { id: 'compassion-5', text: '실패할 때, 나는 따뜻함으로 나를 감싼다' },
    { id: 'compassion-6', text: '나는 나의 실수와 부적절함을 인간 조건의 일부로 본다' },
    { id: 'compassion-7', text: '나는 나의 고통이 더 큰 인간 경험의 일부임을 상기한다' },
    { id: 'compassion-8', text: '나는 나의 약점에 대해 이해하고 인내한다' },
    { id: 'compassion-9', text: '고통스러울 때, 나는 균형잡힌 관점을 유지한다' },
    { id: 'compassion-10', text: '실패했을 때, 나는 다른 사람들도 실패한다는 것을 기억한다' },
    { id: 'compassion-11', text: '나는 나의 감정을 균형잡힌 방식으로 다룬다' },
    { id: 'compassion-12', text: '나는 내 자신을 있는 그대로 받아들인다' }
  ],
  kindness: [
    { id: 'kindness-1', text: '나는 다른 사람들을 친절하게 대한다' },
    { id: 'kindness-2', text: '나는 다른 사람들을 돕는 것을 즐긴다' },
    { id: 'kindness-3', text: '나는 타인에게 배려심이 있다' }
  ]
};
