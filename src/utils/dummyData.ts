import { addPost, addComment, loadPosts } from './communityStorage';
import { recommendQuote } from './quoteRecommendation';

// 방별 더미 게시글 데이터
const dummyPosts = {
  celebrate: [
    {
      content: "드디어 토익 800점 달성했어요! 6개월 동안 매일 공부한 보람이 있네요. 포기하지 않길 잘했어요 😊",
      comments: [
        "축하해요! 저도 토익 공부 중인데 정말 대단하세요. 어떻게 공부하셨나요?",
        "6개월 꾸준히 하신 게 정말 대단해요! 저도 동기부여 받고 갑니다 💪"
      ]
    },
    {
      content: "3개월 다이어트 목표 달성! 10kg 감량 성공했어요. 운동하기 싫었던 날들도 있었지만 끝까지 해내니까 정말 뿌듯해요 🏃‍♀️",
      comments: [
        "와 정말 대단하세요! 어떤 운동 위주로 하셨어요?",
        "10kg... 정말 존경합니다 👏 저도 다이어트 시작해볼게요!"
      ]
    },
    {
      content: "첫 직장 면접에서 합격 통보 받았어요! 떨렸는데 차분하게 답변한 게 좋았나봐요. 새로운 시작이 설레네요 ✨",
      comments: [
        "축하드려요! 첫 직장이라니 정말 의미있는 순간이네요",
        "면접 준비 고생하셨을텐데 좋은 결과가 있어서 다행이에요 😄",
        "새로운 출발 응원합니다! 좋은 직장생활 되시길 바라요"
      ]
    }
  ],
  grateful: [
    {
      content: "오늘 비 오는 날 버스 정류장에서 우산을 나눠주신 할머니께 정말 감사해요. 작은 친절이지만 하루 종일 마음이 따뜻했습니다 🌂",
      comments: [
        "이런 따뜻한 순간들이 정말 소중하죠. 할머니도 분명 기뻐하셨을 거예요",
        "저도 비슷한 경험이 있는데 정말 감동이었어요. 선한 영향력이 퍼져나가는 것 같아요"
      ]
    },
    {
      content: "힘든 시기에 곁에서 묵묵히 응원해준 친구들이 있어서 감사해요. 말로 표현하기 어렵지만 정말 고마운 마음이에요 💙",
      comments: [
        "좋은 친구들이 있다는 건 정말 큰 축복이죠",
        "저도 친구들에게 더 감사한 마음을 표현해야겠어요",
        "이런 마음을 글로 남기는 것도 참 의미있는 일 같아요"
      ]
    },
    {
      content: "매일 아침 따뜻한 커피 한 잔으로 하루를 시작할 수 있어서 감사해요. 소소하지만 이런 일상이 주는 위로가 크네요 ☕",
      comments: [
        "저도 모닝커피는 빠질 수 없어요! 작은 행복이죠",
        "일상의 소소한 감사함을 느끼는 마음이 아름다워요"
      ]
    }
  ],
  anxiety: [
    {
      content: "취업 준비가 너무 막막해요. 이력서 쓰는 것부터 막히고, 뭘 해야 할지 모르겠어서 불안감이 너무 커요. 어떻게 해야 할까요? 😔",
      comments: [
        "저도 똑같은 고민을 했어요. 일단 작은 것부터 하나씩 시작해보는 게 어떨까요?",
        "취업 준비는 정말 막막하죠. 혼자가 아니니까 너무 걱정하지 마세요",
        "주변에 조언 구할 수 있는 선배나 멘토가 있다면 도움을 요청해보세요"
      ]
    },
    {
      content: "미래가 너무 불안해요. 계획대로 되지 않을까 봐, 실패할까 봐 두렵습니다. 이런 마음을 어떻게 다스려야 할까요?",
      comments: [
        "미래에 대한 불안은 정말 자연스러운 감정이에요. 혼자가 아니에요",
        "완벽한 계획은 없다고 생각해요. 그때그때 최선을 다하는 게 중요한 것 같아요"
      ]
    },
    {
      content: "내일 중요한 발표가 있는데 너무 긴장돼요. 실수할까 봐 걱정되고 밤에 잠도 안 와요. 어떻게 마음을 진정시킬 수 있을까요? 😰",
      comments: [
        "발표 전 긴장은 당연해요. 깊게 숨을 쉬고 준비한 것을 믿어보세요",
        "저도 발표 전에 항상 긴장해요. 충분히 준비하셨으니까 잘 하실 거예요!",
        "긴장하는 만큼 열심히 준비하신 증거예요. 화이팅!"
      ]
    }
  ],
  tired: [
    {
      content: "요즘 정말 피곤해요. 아침에 일어나는 것부터 힘들고, 아무것도 하기 싫어요. 이런 무기력함이 언제까지 계속될까요? 😴",
      comments: [
        "저도 요즘 비슷해요. 충분한 휴식을 취하시는 게 중요할 것 같아요",
        "무기력할 때는 무리하지 마시고 푹 쉬세요. 금방 회복되실 거예요",
        "몸과 마음이 휴식이 필요하다는 신호일 수도 있어요"
      ]
    },
    {
      content: "번아웃이 온 것 같아요. 일에 대한 의욕도 없고, 취미 활동도 재미없어요. 모든 게 다 귀찮고 에너지가 바닥난 느낌이에요 💤",
      comments: [
        "번아웃은 정말 힘들죠. 잠시 모든 걸 내려놓고 쉬어가도 괜찮아요",
        "저도 비슷한 경험이 있어요. 조금씩 작은 것부터 시작해보는 게 도움이 되었어요"
      ]
    },
    {
      content: "하루 종일 집에만 있고 싶어요. 사람 만나는 것도 피곤하고, 그냥 혼자 조용히 있고 싶은 날들이 계속되네요 🏠",
      comments: [
        "혼자만의 시간이 필요할 때가 있어요. 그런 마음을 이해해요",
        "무리해서 사람 만나지 마시고 충분히 혼자 시간을 가져보세요",
        "저도 그런 날이 있어요. 자연스러운 감정이니까 너무 걱정하지 마세요"
      ]
    }
  ],
  anger: [
    {
      content: "직장에서 불공정한 대우를 받고 있어요. 같은 일을 해도 인정받지 못하고, 이유 없이 혼나기만 해요. 정말 화가 나고 억울해요 😤",
      comments: [
        "정말 억울하겠어요. 그런 상황에서 화가 나는 게 당연해요",
        "불공정한 대우는 정말 스트레스받죠. 신뢰할 수 있는 사람과 이야기해보세요",
        "상황이 개선되지 않으면 다른 대안도 생각해보시는 게 좋을 것 같아요"
      ]
    },
    {
      content: "친구가 약속을 또 펑크냈어요. 이번이 벌써 세 번째인데 매번 마지막에 급한 일이 생겼다고 하네요. 정말 화가 나요 🔥",
      comments: [
        "그런 친구 정말 스트레스받겠어요. 솔직하게 이야기해보는 게 어떨까요?",
        "약속을 지키지 않는 건 정말 기본이 안된 행동이죠"
      ]
    },
    {
      content: "대중교통에서 자꾸 새치기하고 시끄럽게 하는 사람들 때문에 스트레스받아요. 기본적인 예의도 없는 것 같아서 화가 나네요 😠",
      comments: [
        "대중교통에서 그런 일이 많죠. 정말 답답하고 화나는 마음 이해해요",
        "다른 사람을 바꿀 수는 없으니까 우리만이라도 예의를 지키자고 생각해요",
        "그런 상황에서 화나는 마음이 자연스러워요. 스트레스 해소 방법을 찾아보세요"
      ]
    }
  ]
};

// 더미 데이터 생성 시간 (며칠 전부터 분산)
const getRandomTimestamp = (daysAgo: number = 0) => {
  const now = Date.now();
  const daysInMs = 24 * 60 * 60 * 1000;
  const randomHours = Math.random() * 24 * 60 * 60 * 1000; // 0-24시간 랜덤
  return now - (daysAgo * daysInMs) - randomHours;
};

// 특정 방에 더미 데이터가 이미 있는지 확인
const hasDummyData = (roomId: string): boolean => {
  const posts = loadPosts(roomId);
  return posts.length > 0;
};

// 단일 방에 더미 데이터 추가
const seedRoomData = (roomId: string) => {
  if (hasDummyData(roomId)) {
    console.log(`${roomId} room already has data, skipping...`);
    return;
  }

  const roomPosts = dummyPosts[roomId as keyof typeof dummyPosts];
  if (!roomPosts) return;

  console.log(`Seeding ${roomId} room with dummy data...`);

  roomPosts.forEach((postData, index) => {
    // 게시글 추가 (2-4일 전 분산)
    const postTimestamp = getRandomTimestamp(index + 1);
    const recommendedQuote = recommendQuote(postData.content, roomId);
    
    // 게시글 생성
    const post = addPost(roomId, postData.content, recommendedQuote || undefined);
    
    // 댓글 추가 (게시글 이후 시간대에 분산)
    postData.comments.forEach((commentContent, commentIndex) => {
      // 게시글 작성 후 몇 시간 후에 댓글 달린 것처럼
      const commentDelayHours = (commentIndex + 1) * Math.random() * 6; // 0-6시간 랜덤 지연
      
      setTimeout(() => {
        addComment(roomId, post.id, commentContent);
      }, commentIndex * 100); // 순서 보장을 위한 작은 지연
    });
  });
};

// 모든 방에 더미 데이터 추가
export const seedAllRoomsWithDummyData = () => {
  console.log('Starting dummy data seeding...');
  
  const rooms = ['celebrate', 'grateful', 'anxiety', 'tired', 'anger'];
  
  rooms.forEach(roomId => {
    seedRoomData(roomId);
  });
  
  console.log('Dummy data seeding completed!');
};

// 특정 방의 더미 데이터 삭제 (개발/테스트용)
export const clearRoomData = (roomId: string) => {
  localStorage.removeItem(`community_posts_${roomId}`);
  console.log(`Cleared data for ${roomId} room`);
};

// 모든 방의 더미 데이터 삭제 (개발/테스트용)
export const clearAllRoomsData = () => {
  const rooms = ['celebrate', 'grateful', 'anxiety', 'tired', 'anger'];
  rooms.forEach(roomId => {
    clearRoomData(roomId);
  });
  console.log('Cleared all rooms data');
};

// 더미 데이터 통계 확인
export const getDummyDataStats = () => {
  const rooms = ['celebrate', 'grateful', 'anxiety', 'tired', 'anger'];
  const stats = rooms.map(roomId => {
    const posts = loadPosts(roomId);
    const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
    return {
      room: roomId,
      posts: posts.length,
      comments: totalComments
    };
  });
  
  console.table(stats);
  return stats;
};