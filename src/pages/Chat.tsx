import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Music, Sparkles, Clock, Heart, Mic } from 'lucide-react';
import { useEmotionStore, getTodayEmotions } from '@/store/emotionStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import ResponsiveNav from '@/components/common/ResponsiveNav';
import VoiceRecorder from '@/components/chat/VoiceRecorder';
import VoicePlayer from '@/components/chat/VoicePlayer';
import VoiceCallInterface from '@/components/chat/VoiceCallInterface';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

// 5분 (300초)
const CHAT_DURATION = 300; 

// 음악 추천 이유
const musicReasons = {
  positive: "오늘의 행복한 에너지를 더욱 높여줄",
  calm: "평온한 마음을 더욱 깊게 만들어줄",
  needSupport: "지친 마음을 따뜻하게 감싸줄"
};

// YouTube 음악 추천 (각 카테고리별 1개씩만)
const musicRecommendations = {
  positive: { 
    title: "Good Day", 
    artist: "Surfaces", 
    url: "https://www.youtube.com/watch?v=4GO3NovyF88",
    thumbnail: "☀️"
  },
  calm: { 
    title: "Weightless", 
    artist: "Marconi Union", 
    url: "https://www.youtube.com/watch?v=UfcAVejslrU",
    thumbnail: "☁️"
  },
  needSupport: { 
    title: "Fix You", 
    artist: "Coldplay", 
    url: "https://www.youtube.com/watch?v=k4V3Mo61fJM",
    thumbnail: "✨"
  }
};

// 감정별 AI 응답
const getEmotionBasedResponses = (emotionCounts: { positive: number, negative: number, helping: number }) => {
  const total = emotionCounts.positive + emotionCounts.negative + emotionCounts.helping;
  const dominantEmotion = emotionCounts.positive >= emotionCounts.negative 
    ? (emotionCounts.positive >= emotionCounts.helping ? 'positive' : 'helping')
    : (emotionCounts.negative >= emotionCounts.helping ? 'negative' : 'helping');

  const responses = {
    greeting: {
      positive: `오늘 행복한 순간이 ${emotionCounts.positive}번이나 있으셨네요! ☀️\n특히 어떤 순간이 가장 기억에 남으시나요?`,
      negative: `오늘 ${emotionCounts.negative}번의 힘든 순간을 견뎌내셨네요. 💙\n정말 수고 많으셨어요. 어떤 일이 있으셨는지 들려주실 수 있나요?`,
      helping: `오늘 평온한 시간이 ${emotionCounts.helping}번 있으셨군요. 🌿\n마음이 차분해지는 순간들이었나요?`,
      mixed: `오늘 ${total}번의 다양한 감정을 경험하셨네요. 🌈\n가장 인상 깊었던 순간은 어떤 것이었나요?`
    },
    empathy: {
      positive: [
        "그 순간이 정말 특별했겠어요! 그때의 기분을 한 단어로 표현한다면? ✨",
        "와, 정말 좋은 일이네요! 그 행복을 조금 더 자세히 나눠주시겠어요? 😊",
        "그런 순간들이 일상을 빛나게 만드는 것 같아요. 💫"
      ],
      negative: [
        "그런 일이 있으셨군요. 지금 이 순간, 제가 곁에 있다는 걸 기억해주세요. 🤗",
        "힘드셨겠어요. 그 감정을 충분히 느끼셔도 괜찮아요. 💙",
        "당신의 마음이 느껴져요. 조금씩 나아질 거예요. 🌱"
      ],
      helping: [
        "평온함 속에서 자신을 돌보는 시간이었군요. 🌊",
        "마음의 여유를 찾으셨네요. 그 고요함이 참 소중해요. ☁️",
        "차분한 하루를 보내셨군요. 때로는 그런 날들이 가장 의미있죠. 🍃"
      ]
    },
    selfKindness: "오늘 하루도 정말 열심히 사셨어요. 잠시 자신에게 '수고했어, 괜찮아'라고 말해주시겠어요? 💝",
    closing: {
      positive: "오늘의 행복한 감정들을 잘 간직하세요. 내일도 좋은 일이 가득하길! 🌟",
      negative: "오늘 하루 정말 수고 많으셨어요. 내일은 조금 더 나은 날이 될 거예요. 🌅",
      helping: "평온한 마음 그대로 편안한 밤 보내세요. 🌙"
    }
  };

  return { responses, dominantEmotion };
};

// 샤워 효과 컴포넌트 - 배경 채우기 효과
const ShowerEffect = ({ x, y, color }: { x: number, y: number, color: string }) => {
  return (
    <>
      {/* 클릭 지점 파동 효과 */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 4, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute pointer-events-none"
        style={{ 
          left: x - 100, 
          top: y - 100,
          zIndex: 35
        }}
      >
        <div 
          className="w-[200px] h-[200px] rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${color}60 0%, transparent 70%)`
          }}
        />
      </motion.div>

      {/* 배경 물 채우기 효과 */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: '100%' }}
        exit={{ opacity: 0 }}
        transition={{ 
          duration: 1.5,
          ease: "easeInOut"
        }}
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ zIndex: 30 }}
      >
        <div 
          className="w-full h-full"
          style={{ 
            background: `linear-gradient(to top, ${color}15 0%, ${color}05 100%)`
          }}
        />
        
        {/* 물결 효과 */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-0 right-0 h-20"
          style={{ 
            background: `linear-gradient(to bottom, ${color}20 0%, transparent 100%)`
          }}
        />
      </motion.div>
    </>
  );
};

// 풍선 컴포넌트
const FloatingBubble = ({ emotion, index, onClick, isPopped }: { 
  emotion: any, 
  index: number, 
  onClick: (e: React.MouseEvent) => void,
  isPopped: boolean 
}) => {
  const colors = {
    positive: '#FFCE00',
    negative: '#FFA1CC',
    helping: '#8CE1FF'
  };

  if (isPopped) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ 
        y: [-20, -40, -20],
        x: [0, 10 * (index % 2 === 0 ? 1 : -1), 0],
        opacity: 1
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        y: { duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" },
        x: { duration: 4 + index * 0.3, repeat: Infinity, ease: "easeInOut" },
      }}
      onClick={onClick}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.8 }}
      className="absolute cursor-pointer"
      style={{
        left: `${20 + (index * 25) % 60}%`,
        top: `${30 + (index * 15) % 40}%`,
        zIndex: 25
      }}
    >
      <div 
        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
        style={{ backgroundColor: colors[emotion.type as keyof typeof colors] }}
      >
        {emotion.type === 'positive' ? '☀️' : emotion.type === 'negative' ? '💗' : '💙'}
      </div>
    </motion.div>
  );
};

// 물방울 배경 애니메이션 (기하학적 도형으로 변경)
const WaterDroplet = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ y: -20, opacity: 0 }}
    animate={{ 
      y: window.innerHeight + 20,
      opacity: [0, 0.2, 0.3, 0.2, 0]
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "linear"
    }}
    className="absolute"
    style={{
      left: `${Math.random() * 100}%`,
    }}
  >
    <div className="w-3 h-3 bg-gradient-to-br from-headspace-pastel-blue to-headspace-blue rounded-full opacity-40" />
  </motion.div>
);

// 음악 카드 컴포넌트
const MusicCard = ({ music, reason }: { music: any, reason: string }) => (
  <motion.a
    href={music.url}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="block bg-gradient-to-r from-headspace-pastel-purple to-headspace-pastel-blue rounded-3xl p-6 shadow-soft"
  >
    <div className="flex items-center gap-4">
      <div className="text-4xl">{music.thumbnail}</div>
      <div className="flex-1">
        <p className="text-xs text-headspace-textMuted mb-2">{reason} 음악</p>
        <h3 className="font-bold text-headspace-darkGray">{music.title}</h3>
        <p className="text-sm text-headspace-textMuted">{music.artist}</p>
      </div>
      <Music className="w-5 h-5 text-headspace-purple" />
    </div>
  </motion.a>
);

export default function Chat() {
  const navigate = useNavigate();
  const [showStartModal, setShowStartModal] = useState(true);
  const [textMessages, setTextMessages] = useState<Message[]>([]);
  const [voiceMessages, setVoiceMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CHAT_DURATION);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [textMessageCount, setTextMessageCount] = useState(0);
  const [voiceMessageCount, setVoiceMessageCount] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [poppedBubbles, setPoppedBubbles] = useState<Set<string>>(new Set());
  const [showerEffects, setShowerEffects] = useState<Array<{id: string, x: number, y: number, color: string}>>([]);
  const [showerHeadAnimating, setShowerHeadAnimating] = useState(false);
  
  // Voice chat states
  const [chatMode, setChatMode] = useState<'text' | 'voice'>('text');
  const [isRecording, setIsRecording] = useState(false);
  const [aiVoicePlaying, setAiVoicePlaying] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get onboarding preferences
  const { conversationMethod } = useOnboardingStore();
  
  const emotions = useEmotionStore((state) => state.emotions);
  const todayEmotions = getTodayEmotions(emotions);
  
  // 감정 통계 계산
  const emotionCounts = {
    positive: todayEmotions.filter(e => e.type === 'positive').length,
    negative: todayEmotions.filter(e => e.type === 'negative').length,
    helping: todayEmotions.filter(e => e.type === 'helping').length
  };

  const { responses, dominantEmotion } = getEmotionBasedResponses(emotionCounts);

  // Get current messages based on chat mode
  const getCurrentMessages = () => {
    return chatMode === 'voice' ? voiceMessages : textMessages;
  };

  const setCurrentMessages = (messages: Message[] | ((prev: Message[]) => Message[])) => {
    if (chatMode === 'voice') {
      setVoiceMessages(messages);
    } else {
      setTextMessages(messages);
    }
  };

  const getCurrentMessageCount = () => {
    return chatMode === 'voice' ? voiceMessageCount : textMessageCount;
  };

  const setCurrentMessageCount = (count: number | ((prev: number) => number)) => {
    if (chatMode === 'voice') {
      setVoiceMessageCount(count);
    } else {
      setTextMessageCount(count);
    }
  };

  // 대화 시작
  const startChat = () => {
    setShowStartModal(false);
    setSessionStarted(true);
    
    const total = emotionCounts.positive + emotionCounts.negative + emotionCounts.helping;
    let greeting = responses.greeting.mixed;
    
    if (total === 0) {
      greeting = "안녕하세요! 오늘 첫 대화네요. 🌈\n지금 기분은 어떠신가요?";
    } else if (dominantEmotion === 'positive') {
      greeting = responses.greeting.positive;
    } else if (dominantEmotion === 'negative') {
      greeting = responses.greeting.negative;
    } else {
      greeting = responses.greeting.helping;
    }

    const welcomeMessage = {
      id: '1',
      sender: 'ai' as const,
      content: greeting,
      timestamp: new Date(),
      isVoice: chatMode === 'voice'
    };

    setCurrentMessages([welcomeMessage]);
  };

  // 풍선 터뜨리기
  const popBubble = (emotionId: string, event: React.MouseEvent, emotionType: string) => {
    event.stopPropagation();
    setPoppedBubbles(prev => new Set([...prev, emotionId]));
    
    // 색상 결정
    const colors = {
      positive: '#FFCE00',
      negative: '#FFA1CC',
      helping: '#8CE1FF'
    };
    
    // 샤워 효과 추가
    const effect = {
      id: emotionId,
      x: event.clientX,
      y: event.clientY,
      color: colors[emotionType as keyof typeof colors]
    };
    
    setShowerEffects(prev => [...prev, effect]);
    setShowerHeadAnimating(true);
    
    // 효과 제거
    setTimeout(() => {
      setShowerEffects(prev => prev.filter(e => e.id !== emotionId));
      setShowerHeadAnimating(false);
    }, 2000);
  };

  // Initialize chat mode from onboarding preferences
  useEffect(() => {
    if (conversationMethod) {
      setChatMode(conversationMethod);
    }
  }, [conversationMethod]);

  // Set initial chat mode based on onboarding when component mounts
  useEffect(() => {
    if (conversationMethod && showStartModal) {
      setChatMode(conversationMethod);
    }
  }, [conversationMethod, showStartModal]);

  // Voice input handler
  const handleVoiceInput = (text: string) => {
    if (sessionEnded) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: text,
      timestamp: new Date(),
      isVoice: true
    };

    setVoiceMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Use current voiceMessageCount + 1 for response logic
    const currentCount = voiceMessageCount + 1;
    setVoiceMessageCount(currentCount);

    // AI response with voice
    setTimeout(() => {
      let response = "";
      
      if (currentCount <= 2) {
        const empathyResponses = responses.empathy[dominantEmotion as keyof typeof responses.empathy] || responses.empathy.positive;
        response = Array.isArray(empathyResponses) 
          ? empathyResponses[Math.floor(Math.random() * empathyResponses.length)]
          : empathyResponses;
      } else if (currentCount === 3) {
        response = responses.selfKindness;
      } else if (currentCount < 6) {
        response = "그 마음을 제가 함께 담아둘게요. 오늘 하루도 정말 의미있었어요. 💝";
      }

      if (response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: response,
          timestamp: new Date(),
          isVoice: true
        };
        
        setVoiceMessages(prev => [...prev, aiMessage]);
      }
      setIsTyping(false);
    }, 1500);
  };

  // Chat mode change handler
  const handleModeChange = (mode: 'text' | 'voice') => {
    setChatMode(mode);
    // Save preference to localStorage
    localStorage.setItem('preferredChatMode', mode);
  };

  // Go back to start modal
  const goBackToStart = () => {
    setShowStartModal(true);
    setSessionStarted(false);
    setSessionEnded(false);
    setTimeLeft(CHAT_DURATION);
    setIsTyping(false);
    setAiVoicePlaying(false);
  };

  // Timer
  useEffect(() => {
    if (sessionStarted && timeLeft > 0 && !sessionEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      
      // 10초 남았을 때 마무리 시작
      if (timeLeft === 10 && !sessionEnded) {
        const closingMessage = responses.closing[dominantEmotion as keyof typeof responses.closing] || responses.closing.positive;
        const closingMsg = {
          id: Date.now().toString(),
          sender: 'ai' as const,
          content: closingMessage,
          timestamp: new Date(),
          isVoice: chatMode === 'voice'
        };
        setCurrentMessages(prev => [...prev, closingMsg]);
        setTimeout(endSession, 2000);
      }
      
      return () => clearTimeout(timer);
    } else if (sessionStarted && timeLeft === 0 && !sessionEnded) {
      endSession();
    }
  }, [sessionStarted, timeLeft, sessionEnded]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [textMessages, voiceMessages]);

  const endSession = () => {
    setSessionEnded(true);
    
    // 음악 추천 메시지 추가 (텍스트 모드에서만)
    if (chatMode === 'text') {
      setTextMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: "오늘의 감정에 어울리는 음악을 준비했어요 🎵",
        timestamp: new Date(),
        isVoice: false
      }]);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() || sessionEnded) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputValue,
      timestamp: new Date(),
      isVoice: false
    };

    setTextMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setTextMessageCount(prev => prev + 1);

    // AI response based on message count and emotion
    setTimeout(() => {
      let response = "";
      
      if (textMessageCount < 2) {
        // 초반: 감정 탐색
        const empathyResponses = responses.empathy[dominantEmotion as keyof typeof responses.empathy] || responses.empathy.positive;
        response = Array.isArray(empathyResponses) 
          ? empathyResponses[Math.floor(Math.random() * empathyResponses.length)]
          : empathyResponses;
      } else if (textMessageCount === 2) {
        // 중반: 자기친절 유도
        response = responses.selfKindness;
      } else if (textMessageCount < 5) {
        // 후반: 정리
        response = "그 마음을 제가 함께 담아둘게요. 오늘 하루도 정말 의미있었어요. 💝";
      }

      if (response) {
        setTextMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: response,
          timestamp: new Date(),
          isVoice: false
        }]);
      }
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFeedback = (value: string) => {
    setFeedback(value);
    localStorage.setItem('lastChatFeedback', value);
    // 피드백 저장 로직 추가 가능
  };

  // 시작 모달
  if (showStartModal) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-b from-headspace-pastel-blue via-white to-headspace-pastel-green flex items-center justify-center p-6 relative overflow-hidden pb-20">
          {/* 물방울 배경 */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <WaterDroplet key={i} delay={i * 2} />
            ))}
          </div>
          
          {/* 샤워헤드 */}
          <motion.div
            animate={showerHeadAnimating ? {
              rotate: [-5, 5, -5, 5, 0],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 0.5 }}
            className="absolute top-10 left-1/2 transform -translate-x-1/2 text-5xl z-10"
          >
            🚿
          </motion.div>
          
          {/* 오늘의 감정 풍선들 */}
          <AnimatePresence>
            {todayEmotions.slice(0, 5).map((emotion, index) => (
              <FloatingBubble
                key={emotion.id}
                emotion={emotion}
                index={index}
                onClick={(e) => popBubble(emotion.id, e, emotion.type)}
                isPopped={poppedBubbles.has(emotion.id)}
              />
            ))}
          </AnimatePresence>
          
          {/* 샤워 효과 */}
          <AnimatePresence>
            {showerEffects.map(effect => (
              <ShowerEffect
                key={effect.id}
                x={effect.x}
                y={effect.y}
                color={effect.color}
              />
            ))}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-soft-lg max-w-sm w-full relative z-20"
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🌊</div>
              <h1 className="text-2xl font-bold text-headspace-darkGray mb-2">
                오늘의 정서샤워
              </h1>
              <p className="text-headspace-textMuted mb-6">
                {todayEmotions.length > 0 
                  ? `오늘 기록한 ${todayEmotions.length}개의 감정과 함께\n5분간 마음을 정리해볼까요?`
                  : "오늘 하루를 돌아보며\n5분간 마음을 정리해볼까요?"
                }
              </p>
              
              {todayEmotions.length > 0 && (
                <p className="text-xs text-headspace-textMuted mb-4">
                  💡 떠다니는 풍선을 터치해보세요!
                </p>
              )}

              {/* Conversation Mode Selection */}
              <div className="mb-6">
                <p className="text-sm font-medium text-headspace-darkGray mb-3 text-center">
                  대화 방식을 선택해주세요
                </p>
                {conversationMethod && (
                  <p className="text-xs text-headspace-textMuted mb-3 text-center">
                    💡 온보딩에서 선택하신 {conversationMethod === 'voice' ? '음성' : '텍스트'} 방식이 기본으로 선택됩니다
                  </p>
                )}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setChatMode('text')}
                    className={`flex-1 py-3 px-4 rounded-2xl border-2 transition-all ${
                      chatMode === 'text'
                        ? 'bg-headspace-blue text-white border-headspace-blue'
                        : 'bg-white text-headspace-textMuted border-headspace-border hover:border-headspace-blue'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">💬</div>
                      <div className="text-sm font-medium">텍스트</div>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setChatMode('voice')}
                    className={`flex-1 py-3 px-4 rounded-2xl border-2 transition-all ${
                      chatMode === 'voice'
                        ? 'bg-headspace-purple text-white border-headspace-purple'
                        : 'bg-white text-headspace-textMuted border-headspace-border hover:border-headspace-purple'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎙️</div>
                      <div className="text-sm font-medium">음성</div>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* AI Disclaimer */}
              <div className="bg-headspace-pastel-yellow/20 border border-headspace-pastel-yellow rounded-2xl p-3 mb-6">
                <p className="text-xs text-headspace-darkGray text-center">
                  <span className="text-headspace-yellow">💡 </span>
                  <strong>데모 버전</strong>입니다. AI 대화는 미리 준비된 응답으로 제공됩니다.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startChat}
                className={`w-full py-4 text-white rounded-full font-semibold shadow-soft relative z-30 ${
                  chatMode === 'voice'
                    ? 'bg-gradient-to-r from-headspace-purple to-headspace-blue'
                    : 'bg-gradient-to-r from-headspace-blue to-headspace-purple'
                }`}
              >
                {chatMode === 'voice' ? '음성 상담 시작하기' : '텍스트 상담 시작하기'}
              </motion.button>
              
              <button
                onClick={() => navigate('/home')}
                className="mt-3 text-headspace-textMuted text-sm relative z-30"
              >
                나중에 할게요
              </button>
            </div>
          </motion.div>
        </div>
        <ResponsiveNav />
      </>
    );
  }

  // Render VoiceCallInterface for voice mode
  if (chatMode === 'voice') {
    const musicRecommendation = musicRecommendations[
      dominantEmotion === 'positive' ? 'positive' : 
      dominantEmotion === 'negative' ? 'needSupport' : 'calm'
    ];
    const musicReason = musicReasons[
      dominantEmotion === 'positive' ? 'positive' : 
      dominantEmotion === 'negative' ? 'needSupport' : 'calm'
    ];

    return (
      <VoiceCallInterface
        messages={voiceMessages}
        onVoiceInput={handleVoiceInput}
        isTyping={isTyping}
        aiVoicePlaying={aiVoicePlaying}
        timeLeft={timeLeft}
        sessionEnded={sessionEnded}
        onGoBack={goBackToStart}
        onAIVoiceStart={() => setAiVoicePlaying(true)}
        onAIVoiceEnd={() => setAiVoicePlaying(false)}
        dominantEmotion={dominantEmotion}
        emotionCounts={emotionCounts}
        musicRecommendation={musicRecommendation}
        musicReason={musicReason}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-headspace-pastel-blue/30 to-headspace-beige flex flex-col relative">
      {/* 물방울 배경 애니메이션 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <WaterDroplet key={i} delay={i * 3} />
        ))}
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur shadow-soft z-20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={goBackToStart}
              className="p-2 rounded-xl hover:bg-headspace-pastel-blue transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-headspace-darkGray" />
            </button>
            
            <div className="text-center">
              <h1 className="font-semibold text-headspace-darkGray">마음구름 대화</h1>
              <div className="flex items-center justify-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-headspace-textMuted" />
                <div className={`text-sm font-medium ${
                  timeLeft < 10 ? 'text-headspace-coral' : 'text-headspace-textMuted'
                }`}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
            
            <div className="w-12 h-12" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pt-24 pb-20 relative z-10">
        <AnimatePresence>
          {textMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'ai' && !message.isVoice && (
                <div className="w-8 h-8 bg-gradient-to-br from-headspace-purple to-headspace-blue rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              
              {/* Voice message rendering */}
              {message.sender === 'ai' && message.isVoice ? (
                <VoicePlayer 
                  text={message.content}
                  autoPlay={true}
                  onPlayStart={() => setAiVoicePlaying(true)}
                  onPlayEnd={() => setAiVoicePlaying(false)}
                />
              ) : (
                <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-soft ${
                  message.sender === 'user' 
                    ? message.isVoice 
                      ? 'bg-headspace-purple text-white border-2 border-headspace-purple/30' 
                      : 'bg-headspace-blue text-white'
                    : 'bg-white text-headspace-darkGray'
                }`}>
                  <p className="whitespace-pre-line">{message.content}</p>
                  {message.isVoice && message.sender === 'user' && (
                    <div className="flex items-center gap-1 mt-2 text-xs opacity-75">
                      <Mic className="w-3 h-3" />
                      음성 메시지
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-headspace-purple to-headspace-blue rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl shadow-soft">
              <div className="flex gap-1">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -6, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay
                    }}
                    className="w-2 h-2 bg-headspace-blue rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Music recommendation */}
        {sessionEnded && !feedback && (
          <div className="space-y-4 mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-4"
            >
              <Heart className="w-8 h-8 text-headspace-pink mx-auto mb-2" />
              <p className="text-headspace-darkGray font-medium">오늘 하루도 수고하셨어요</p>
            </motion.div>
            
            <MusicCard 
              music={musicRecommendations[
                dominantEmotion === 'positive' ? 'positive' : 
                dominantEmotion === 'negative' ? 'needSupport' : 'calm'
              ]}
              reason={musicReasons[
                dominantEmotion === 'positive' ? 'positive' : 
                dominantEmotion === 'negative' ? 'needSupport' : 'calm'
              ]}
            />

            {/* Feedback section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-soft mt-6"
            >
              <h3 className="font-semibold text-headspace-darkGray text-center mb-4">
                오늘의 정서샤워는 어떠셨나요?
              </h3>
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFeedback('refreshing')}
                  className="flex flex-col items-center gap-2 p-3"
                >
                  <span className="text-3xl">😊</span>
                  <span className="text-xs text-headspace-textMuted">상쾌해요</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFeedback('comfortable')}
                  className="flex flex-col items-center gap-2 p-3"
                >
                  <span className="text-3xl">😌</span>
                  <span className="text-xs text-headspace-textMuted">편안해요</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFeedback('soso')}
                  className="flex flex-col items-center gap-2 p-3"
                >
                  <span className="text-3xl">🤔</span>
                  <span className="text-xs text-headspace-textMuted">그저 그래요</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Feedback thank you message */}
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mt-6"
          >
            <div className="bg-gradient-to-r from-headspace-pastel-yellow to-headspace-pastel-pink rounded-3xl p-6 shadow-soft">
              <Sparkles className="w-8 h-8 text-headspace-purple mx-auto mb-3" />
              <p className="text-headspace-darkGray font-medium mb-2">
                피드백 감사합니다!
              </p>
              <p className="text-sm text-headspace-textMuted">
                더 나은 정서샤워를 만들어갈게요 💙
              </p>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-headspace-border z-20">
        {!sessionEnded ? (
          <div className="flex items-center justify-center gap-2">
            {chatMode === 'voice' ? (
              <VoiceRecorder 
                onVoiceInput={handleVoiceInput}
                disabled={aiVoicePlaying}
              />
            ) : (
              <>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="마음을 나눠주세요..."
                  className="flex-1 bg-headspace-pastel-blue/30 border border-headspace-border rounded-full px-4 py-3 text-headspace-darkGray placeholder-headspace-textMuted focus:outline-none focus:border-headspace-blue transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="p-3 bg-headspace-blue rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-soft"
                >
                  <Send className="w-5 h-5 text-white" />
                </motion.button>
              </>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {feedback && (
              <button
                onClick={() => navigate('/home')}
                className="w-full py-3 bg-headspace-blue text-white rounded-full font-medium hover:bg-opacity-90 transition-colors shadow-soft"
              >
                홈으로 돌아가기
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}