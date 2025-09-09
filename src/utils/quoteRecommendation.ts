// 글 내용 기반 명언 추천 시스템

// 감정별 명언 데이터
const quotes = {
  celebrate: [
    "성공은 준비된 사람에게 찾아온 기회다. - 루이 파스퇴르",
    "작은 발걸음도 계속하면 멀리 갈 수 있다. - 중국 속담",
    "노력하는 자에게는 하늘도 감동한다. - 한국 속담",
    "오늘의 성취는 어제의 꿈이었다.",
    "당신이 할 수 있다고 믿는 순간, 이미 절반은 이룬 것이다.",
    "작은 승리도 큰 의미가 있다. 자신을 축하하라.",
    "성취의 기쁨은 과정의 어려움을 잊게 한다.",
    "매일 조금씩 나아가는 것이 가장 확실한 방법이다."
  ],
  grateful: [
    "감사하는 마음은 가장 큰 미덕이다. - 키케로",
    "행복의 문은 안에서 열린다. - 마르셀 프루스트",
    "작은 것에 감사할 줄 아는 자가 큰 것을 얻는다. - 탈무드",
    "감사는 과거를 의미 있게 하고, 오늘을 평화롭게 한다.",
    "당연한 것은 없다. 모든 순간이 선물이다.",
    "감사는 마음을 풍요롭게 하는 마법이다.",
    "고마움을 표현하는 것은 받은 것보다 더 큰 선물이다.",
    "감사하는 마음은 더 많은 행복을 불러온다."
  ],
  anxiety: [
    "용기란 두려움이 없는 것이 아니라, 두려움을 이겨내는 것이다. - 넬슨 만델라",
    "걱정은 내일의 고통을 덜어주지 못하고, 오늘의 기쁨만 빼앗는다. - 레오 부스칼리아",
    "현재에 머물러라. 지금 이 순간이 전부다. - 부처",
    "폭풍이 지나간 자리에는 무지개가 뜬다.",
    "모든 어둠 뒤에는 새벽이 기다리고 있다.",
    "불안은 미래의 그림자일 뿐, 현실이 아니다.",
    "걱정의 99%는 일어나지 않는다.",
    "깊은 숨 하나로 마음은 다시 평온해진다."
  ],
  tired: [
    "지친 마음도 쉬면 다시 힘을 얻는다. - 괴테",
    "휴식은 녹슨 것을 방지하는 기름과 같다. - 벤자민 프랭클린",
    "때로는 느린 것이 더 빠를 수 있다.",
    "오늘 쉬는 것은 내일을 위한 준비다.",
    "자신에게 친절하라. 당신도 위로가 필요한 사람이다.",
    "피로는 열심히 살았다는 증거다.",
    "쉼표 없는 문장이 없듯, 쉼 없는 삶도 없다.",
    "때로는 아무것도 하지 않는 것이 최선이다."
  ],
  anger: [
    "화를 다스리는 것은 적을 이기는 것보다 어렵다. - 아인슈타인",
    "분노는 어리석음으로 시작해서 후회로 끝난다. - 피타고라스",
    "마음의 평화는 복수보다 달콤하다. - 간디",
    "화가 날 때는 백까지 세어라. 아주 화가 날 때는 천까지.",
    "분노는 바람과 같다. 머물지 않고 지나간다.",
    "화는 뜨거운 석탄, 던지려는 자가 먼저 데인다.",
    "분노는 일시적이지만, 후회는 오래간다.",
    "깊은 숨 하나로 분노는 지혜로 바뀐다."
  ]
};

// 키워드 매핑
const keywordMap = {
  celebrate: [
    // 성취/성공 관련
    '성공', '달성', '합격', '승진', '완성', '해냈', '이뤘', '통과', '성취', '목표',
    '졸업', '취업', '시험', '면접', '프로젝트', '완료', '끝냈', '마무리',
    '운동', '다이어트', '습관', '연속', '기록', '도전', '극복',
    // 긍정적 감정
    '기뻐', '행복', '신나', '뿌듯', '자랑', '만족', '좋았', '최고', '완벽'
  ],
  grateful: [
    // 감사 표현
    '감사', '고마워', '고맙', '고마운', '도움', '배려', '친절', '선물', '주셨',
    '받았', '베풀', '챙겨', '위로', '응원', '격려', '지지', '사랑',
    // 일상의 소소한 것들
    '건강', '가족', '친구', '동료', '날씨', '음식', '집', '평범한', '일상'
  ],
  anxiety: [
    // 불안/걱정 표현
    '불안', '걱정', '염려', '두려', '무서', '떨려', '긴장', '스트레스', '근심',
    '초조', '조급', '답답', '막막', '걱정돼', '불안해', '두려워',
    // 미래에 대한 우려
    '미래', '내일', '앞으로', '시험', '면접', '발표', '결과', '판단', '선택',
    '결정', '혼란', '갈등', '고민'
  ],
  tired: [
    // 피로/무기력 표현
    '피곤', '지쳐', '힘들어', '무기력', '의욕없', '번아웃', '탈진', '지침',
    '에너지없', '동기부여', '의미없', '공허', '허탈', '슬럼프',
    // 쉬고 싶다는 표현
    '쉬고싶', '잠자고싶', '아무것도', '하기싫', '집에가고싶', '혼자있고싶',
    '조용', '평화', '침대', '잠'
  ],
  anger: [
    // 분노/짜증 표현
    '화나', '짜증', '열받', '분노', '억울', '화가나', '빡쳐', '열받아',
    '미칠것같', '답답해', '속상', '분해', '화가', '울화',
    // 부정적 상황
    '부당', '불공평', '이해안돼', '말이안돼', '너무해', '어이없',
    '실망', '배신', '무시', '차별'
  ]
};

// 텍스트 분석 함수
const analyzeContent = (content: string): string[] => {
  const text = content.toLowerCase();
  const detectedCategories: string[] = [];
  
  // 각 카테고리별로 키워드 매칭 점수 계산
  Object.entries(keywordMap).forEach(([category, keywords]) => {
    let score = 0;
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        // 키워드 길이에 따른 가중치 (긴 키워드일수록 더 구체적)
        score += keyword.length > 2 ? 2 : 1;
      }
    });
    
    if (score > 0) {
      detectedCategories.push(category);
    }
  });
  
  return detectedCategories;
};

// 기본 카테고리 결정 (키워드 매칭이 안 될 때)
const getDefaultCategory = (content: string, roomId: string): string => {
  // 현재 방의 주제를 기본으로 사용
  return roomId;
};

// 명언 추천 메인 함수
export const recommendQuote = (content: string, roomId: string): string | null => {
  if (!content || content.trim().length < 10) {
    // 너무 짧은 글에는 명언 추천 안 함
    return null;
  }
  
  const detectedCategories = analyzeContent(content);
  
  let selectedCategory = '';
  
  if (detectedCategories.length > 0) {
    // 매칭된 카테고리 중에서 선택
    // 여러 카테고리가 매칭되면 첫 번째 것을 사용 (추후 점수 기반 선택으로 개선 가능)
    selectedCategory = detectedCategories[0];
  } else {
    // 키워드 매칭이 안 되면 현재 방 기반으로 선택
    selectedCategory = getDefaultCategory(content, roomId);
  }
  
  // 해당 카테고리의 명언 중 랜덤 선택
  const categoryQuotes = quotes[selectedCategory as keyof typeof quotes];
  if (!categoryQuotes || categoryQuotes.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
  return categoryQuotes[randomIndex];
};

// 카테고리별 명언 개수 반환 (디버깅/통계용)
export const getQuoteStats = () => {
  return Object.entries(quotes).map(([category, quoteList]) => ({
    category,
    count: quoteList.length
  }));
};

// 특정 카테고리의 명언 반환 (테스트용)
export const getQuotesByCategory = (category: string): string[] => {
  return quotes[category as keyof typeof quotes] || [];
};