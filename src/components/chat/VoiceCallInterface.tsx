import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, Square } from 'lucide-react';
import { startSpeechRecognition, startTextToSpeech, RECORDING_DURATION, isSpeechRecognitionSupported, waitForVoices, isTextToSpeechSupported } from '@/utils/dummyVoice';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
}

interface VoiceCallInterfaceProps {
  messages: Message[];
  onVoiceInput: (text: string) => void;
  isTyping: boolean;
  aiVoicePlaying: boolean;
  timeLeft: number;
  sessionEnded: boolean;
  onGoBack: () => void;
  onAIVoiceStart?: () => void;
  onAIVoiceEnd?: () => void;
  dominantEmotion?: 'positive' | 'negative' | 'helping';
  emotionCounts?: {
    positive: number;
    negative: number;
    helping: number;
  };
  musicRecommendation?: {
    title: string;
    artist: string;
    url: string;
    thumbnail: string;
  };
  musicReason?: string;
}

export default function VoiceCallInterface({
  messages,
  onVoiceInput,
  isTyping,
  aiVoicePlaying,
  timeLeft,
  sessionEnded,
  onGoBack,
  onAIVoiceStart,
  onAIVoiceEnd,
  dominantEmotion = 'positive',
  emotionCounts = { positive: 0, negative: 0, helping: 0 },
  musicRecommendation,
  musicReason
}: VoiceCallInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(RECORDING_DURATION);
  const [speechRecognitionError, setSpeechRecognitionError] = useState<string>('');
  const [stopRecognition, setStopRecognition] = useState<(() => void) | null>(null);
  const [currentlyPlayingMessage, setCurrentlyPlayingMessage] = useState<string>('');
  const [closingMessagePlayed, setClosingMessagePlayed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastRecognizedText, setLastRecognizedText] = useState<string>('');
  const [voiceLoading, setVoiceLoading] = useState<boolean>(true);
  const lastProcessedMessageRef = useRef<string>('');
  const activeTTSRef = useRef<(() => void) | null>(null);
  const aiVoiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // AI 음성 상태를 안전하게 종료하는 함수
  const safeEndAIVoice = () => {
    console.log('🔊 AI Voice End - Resetting state');
    setCurrentlyPlayingMessage('');
    onAIVoiceEnd?.();
    activeTTSRef.current = null;
    
    // 타임아웃 정리
    if (aiVoiceTimeoutRef.current) {
      clearTimeout(aiVoiceTimeoutRef.current);
      aiVoiceTimeoutRef.current = null;
    }
  };

  // 음성 로딩 초기화
  useEffect(() => {
    (async () => {
      if (isTextToSpeechSupported()) {
        console.log('⏳ Initializing voice system...');
        try {
          const voices = await waitForVoices();
          const koreanVoices = voices.filter(voice => voice.lang.includes('ko'));
          console.log(`🎤 Voice system ready. Found ${koreanVoices.length} Korean voices out of ${voices.length} total.`);
        } catch (error) {
          console.error('❌ Voice initialization failed:', error);
        }
      } else {
        console.log('📱 TTS not supported, using simulation mode');
      }
      setVoiceLoading(false);
    })();
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (stopRecognition) {
        stopRecognition();
      }
      if (activeTTSRef.current) {
        activeTTSRef.current();
      }
      if (aiVoiceTimeoutRef.current) {
        clearTimeout(aiVoiceTimeoutRef.current);
      }
    };
  }, [stopRecognition]);

  // AI 메시지 자동 감지 및 TTS 재생
  useEffect(() => {
    if (messages.length === 0 || isRecording || currentlyPlayingMessage) return;

    // 가장 최근 AI 메시지 찾기
    const lastAIMessage = messages
      .filter(msg => msg.sender === 'ai')
      .pop();

    if (lastAIMessage && lastAIMessage.id !== lastProcessedMessageRef.current) {
      // 기존 TTS 중지
      if (activeTTSRef.current) {
        activeTTSRef.current();
        activeTTSRef.current = null;
      }
      
      lastProcessedMessageRef.current = lastAIMessage.id;
      setCurrentlyPlayingMessage(lastAIMessage.content);
      
      // TTS 재생 시작 (async 처리)
      console.log('🔊 AI Voice Start:', lastAIMessage.content.substring(0, 50) + '...');
      onAIVoiceStart?.();
      
      // 5초 타임아웃 설정 (빠른 복구를 위해 단축)
      aiVoiceTimeoutRef.current = setTimeout(() => {
        console.log('⚠️ AI Voice timeout - forcing end');
        safeEndAIVoice();
      }, 5000);
      
      // async TTS 시작
      (async () => {
        try {
          const stopFn = await startTextToSpeech(
            lastAIMessage.content,
            // onStart
            () => {
              console.log('🎵 TTS playback started');
            },
            // onEnd
            () => {
              console.log('✅ TTS playback completed');
              safeEndAIVoice();
            },
            // onProgress (optional)
            undefined,
            // options
            {
              rate: 0.9,
              pitch: 1.1,
              volume: 0.8
            }
          );
          
          activeTTSRef.current = stopFn;
        } catch (error) {
          console.error('❌ TTS initialization failed:', error);
          safeEndAIVoice();
        }
      })();
    }
  }, [messages, isRecording, currentlyPlayingMessage, onAIVoiceStart, onAIVoiceEnd]);

  // 세션 종료 시 마무리 멘트 TTS 재생
  useEffect(() => {
    if (sessionEnded && !closingMessagePlayed) {
      setClosingMessagePlayed(true);
      
      // 감정별 마무리 멘트
      const closingMessages = {
        positive: "오늘의 행복한 감정들을 잘 간직하세요. 내일도 좋은 일이 가득하길 바라요!",
        negative: "오늘 하루 정말 수고 많으셨어요. 내일은 조금 더 나은 날이 될 거예요.",
        helping: "평온한 마음 그대로 편안한 밤 보내세요. 잘 쉬시기 바라요."
      };
      
      const closingMessage = closingMessages[dominantEmotion] || closingMessages.positive;
      
      // 기존 TTS 중지
      if (activeTTSRef.current) {
        activeTTSRef.current();
        activeTTSRef.current = null;
      }
      
      // TTS로 마무리 멘트 재생 (async 처리)
      console.log('🔊 Closing message TTS start');
      onAIVoiceStart?.();
      
      // 8초 타임아웃 설정 (빠른 복구)
      aiVoiceTimeoutRef.current = setTimeout(() => {
        console.log('⚠️ Closing message timeout - forcing end');
        safeEndAIVoice();
      }, 8000);
      
      // async TTS 시작
      (async () => {
        try {
          const stopFn = await startTextToSpeech(
            `음성 상담이 끝났습니다. ${closingMessage}`,
            // onStart
            () => {
              console.log('🎵 Closing message TTS playback started');
            },
            // onEnd
            () => {
              console.log('✅ Closing message TTS completed');
              safeEndAIVoice();
            },
            // onProgress
            undefined,
            // options
            {
              rate: 0.8,
              pitch: 1.0,
              volume: 0.9
            }
          );
          
          activeTTSRef.current = stopFn;
        } catch (error) {
          console.error('❌ Closing message TTS failed:', error);
          safeEndAIVoice();
        }
      })();
    }
  }, [sessionEnded, closingMessagePlayed, dominantEmotion, onAIVoiceStart, onAIVoiceEnd]);

  const startRecording = () => {
    if (sessionEnded || aiVoicePlaying || isRecording) return;
    
    setSpeechRecognitionError('');
    setCountdown(RECORDING_DURATION);
    
    const stopFn = startSpeechRecognition(
      // onResult
      (text: string) => {
        setIsRecording(false);
        setCountdown(RECORDING_DURATION);
        setLastRecognizedText(text);
        
        // 인식된 텍스트를 잠시 보여주고 나서 처리
        setTimeout(() => {
          onVoiceInput(text);
          // 3초 후에 인식된 텍스트 숨김
          setTimeout(() => {
            setLastRecognizedText('');
          }, 3000);
        }, 500);
      },
      // onError
      (error: string) => {
        setIsRecording(false);
        setCountdown(RECORDING_DURATION);
        setSpeechRecognitionError(error);
      },
      // onStart
      () => {
        setIsRecording(true);
        // 카운트다운 시작
        const interval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              return RECORDING_DURATION;
            }
            return prev - 1;
          });
        }, 1000);
      },
      // onEnd
      () => {
        setIsRecording(false);
        setCountdown(RECORDING_DURATION);
      },
      // duration
      RECORDING_DURATION * 1000
    );
    
    setStopRecognition(() => stopFn);
  };

  const stopRecording = () => {
    if (!isRecording) return;
    
    if (stopRecognition) {
      stopRecognition();
      setStopRecognition(null);
    }
    
    setIsRecording(false);
    setCountdown(RECORDING_DURATION);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-headspace-pastel-blue/30 to-headspace-beige flex flex-col relative">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 50,
              opacity: 0 
            }}
            animate={{ 
              y: -50,
              opacity: [0, 0.3, 0.6, 0.3, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              delay: i * 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-2 h-2 bg-white/40 rounded-full"
          />
        ))}
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur shadow-soft z-20">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onGoBack}
              className="p-2 rounded-xl hover:bg-headspace-pastel-blue transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-headspace-darkGray" />
            </button>
            
            <div className="text-center">
              <h1 className="font-semibold text-headspace-darkGray">음성 상담</h1>
            </div>
            
            <div className="w-12 h-12" />
          </div>
        </div>
      </div>

      {/* Main Voice Call Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Large Timer Display */}
        <motion.div
          animate={{ 
            scale: timeLeft < 10 ? [1, 1.05, 1] : 1,
            opacity: timeLeft < 10 ? [1, 0.8, 1] : 1
          }}
          transition={{ 
            duration: 1, 
            repeat: timeLeft < 10 ? Infinity : 0 
          }}
          className="mb-8 text-center"
        >
          <div className={`text-6xl font-bold ${
            timeLeft < 10 ? 'text-headspace-coral' : 'text-headspace-blue'
          }`}>
            {formatTime(timeLeft)}
          </div>
          <p className="text-headspace-textMuted text-sm mt-2">남은 시간</p>
        </motion.div>

        {/* Status Display */}
        <div className="mb-8 h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {voiceLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center gap-2 text-headspace-blue">
                  <div className="flex gap-1">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          y: [0, -8, 0],
                          opacity: [0.4, 1, 0.4]
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
                  <span className="text-lg font-medium">음성 시스템 준비 중...</span>
                </div>
              </motion.div>
            ) : lastRecognizedText ? (
              <motion.div
                key="recognized"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center max-w-sm"
              >
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: 2 }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    <span className="text-green-600 text-sm font-medium">인식 완료!</span>
                  </div>
                  <p className="text-green-700 text-sm font-medium">
                    "{lastRecognizedText}"
                  </p>
                </div>
              </motion.div>
            ) : speechRecognitionError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center max-w-sm"
              >
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-red-600 text-sm font-medium">
                    {speechRecognitionError}
                  </p>
                  <button
                    onClick={() => setSpeechRecognitionError('')}
                    className="mt-2 text-xs text-red-500 hover:text-red-700"
                  >
                    다시 시도하기
                  </button>
                </div>
              </motion.div>
            ) : isRecording ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center gap-2 text-headspace-coral">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-3 h-3 bg-headspace-coral rounded-full"
                  />
                  <span className="text-lg font-medium">
                    {isSpeechRecognitionSupported() ? '음성 인식 중...' : '녹음 중...'} {countdown}초
                  </span>
                </div>
              </motion.div>
            ) : isTyping || aiVoicePlaying ? (
              <motion.div
                key="ai-speaking"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center gap-2 text-headspace-purple">
                  <div className="flex gap-1">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          y: [0, -8, 0],
                          opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay
                        }}
                        className="w-2 h-2 bg-headspace-purple rounded-full"
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium">AI가 응답 중...</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <p className="text-headspace-textMuted text-lg">
                  마이크 버튼을 눌러서 대화하세요
                </p>
                {!isSpeechRecognitionSupported() && (
                  <p className="text-xs text-headspace-textMuted mt-2 opacity-75">
                    💡 더미 모드: 실제 음성 인식은 지원되지 않습니다
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Debug Reset Button - 개발시에만 표시 */}
          {(isTyping || aiVoicePlaying) && !isRecording && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                console.log('🔧 Manual reset triggered');
                setIsTyping(false);
                safeEndAIVoice();
              }}
              className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors"
            >
              Reset (Debug)
            </motion.button>
          )}
        </div>

        {/* Large Mic Button */}
        <div className="relative">
          {/* Recording waves */}
          {isRecording && (
            <div className="absolute inset-0 flex items-center justify-center">
              {Array.from({ length: 3 }, (_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5 + i * 0.2, 1],
                    opacity: [0.6, 0.2, 0.6]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  className="absolute w-40 h-40 rounded-full border-2 border-headspace-coral/30"
                />
              ))}
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: sessionEnded || aiVoicePlaying || voiceLoading ? 1 : 1.05 }}
            whileTap={{ scale: sessionEnded || aiVoicePlaying || voiceLoading ? 1 : 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={sessionEnded || aiVoicePlaying || voiceLoading}
            className={`relative w-32 h-32 rounded-full shadow-2xl transition-all ${
              isRecording
                ? 'bg-headspace-coral hover:bg-headspace-coral/90'
                : sessionEnded || aiVoicePlaying || voiceLoading
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-headspace-blue hover:bg-headspace-blue/90'
            }`}
          >
            {isRecording ? (
              <Square className="w-12 h-12 text-white mx-auto" />
            ) : (
              <Mic className={`w-12 h-12 mx-auto ${
                sessionEnded || aiVoicePlaying || voiceLoading ? 'text-gray-400' : 'text-white'
              }`} />
            )}
          </motion.button>
        </div>
      </div>

      {/* Session End Overlay */}
      {sessionEnded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-30 p-6"
        >
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold text-headspace-darkGray mb-2">
              음성 상담이 끝났습니다
            </h3>
            <p className="text-headspace-textMuted mb-6">
              오늘 하루도 수고하셨어요
            </p>

            {/* Music Recommendation */}
            {musicRecommendation && musicReason && (
              <div className="mb-6">
                <p className="text-sm font-medium text-headspace-darkGray mb-3">
                  오늘의 감정에 어울리는 음악을 준비했어요 🎵
                </p>
                <motion.a
                  href={musicRecommendation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  className="block bg-gradient-to-r from-headspace-pastel-purple to-headspace-pastel-blue rounded-2xl p-4 shadow-soft"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{musicRecommendation.thumbnail}</div>
                    <div className="flex-1 text-left">
                      <p className="text-xs text-headspace-textMuted mb-1">{musicReason} 음악</p>
                      <h4 className="font-bold text-headspace-darkGray text-sm">{musicRecommendation.title}</h4>
                      <p className="text-xs text-headspace-textMuted">{musicRecommendation.artist}</p>
                    </div>
                    <div className="text-headspace-purple">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </motion.a>
              </div>
            )}

            {/* Feedback Section */}
            {!feedback && (
              <div className="mb-6">
                <h4 className="font-semibold text-headspace-darkGray text-center mb-4">
                  오늘의 음성 상담은 어떠셨나요?
                </h4>
                <div className="flex justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFeedback('refreshing')}
                    className="flex flex-col items-center gap-2 p-3"
                  >
                    <span className="text-2xl">😊</span>
                    <span className="text-xs text-headspace-textMuted">상쾌해요</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFeedback('comfortable')}
                    className="flex flex-col items-center gap-2 p-3"
                  >
                    <span className="text-2xl">😌</span>
                    <span className="text-xs text-headspace-textMuted">편안해요</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFeedback('soso')}
                    className="flex flex-col items-center gap-2 p-3"
                  >
                    <span className="text-2xl">🤔</span>
                    <span className="text-xs text-headspace-textMuted">그저 그래요</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Feedback Thank You */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6"
              >
                <div className="bg-gradient-to-r from-headspace-pastel-yellow to-headspace-pastel-pink rounded-2xl p-4">
                  <div className="text-2xl mb-2">✨</div>
                  <p className="text-headspace-darkGray font-medium mb-1">
                    피드백 감사합니다!
                  </p>
                  <p className="text-sm text-headspace-textMuted">
                    더 나은 음성 상담을 만들어갈게요 💙
                  </p>
                </div>
              </motion.div>
            )}

            <button
              onClick={onGoBack}
              className="w-full py-3 bg-headspace-blue text-white rounded-full font-medium hover:bg-headspace-blue/90 transition-colors"
            >
              처음으로 돌아가기
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}