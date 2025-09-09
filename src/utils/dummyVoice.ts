// Web Speech API 타입 선언
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// 브라우저 호환성을 위한 SpeechRecognition
const getSpeechRecognition = () => {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
};

// Speech Recognition이 지원되는지 확인
export const isSpeechRecognitionSupported = () => {
  return !!getSpeechRecognition();
};

// 더미 음성 입력 데이터 (폴백용)
export const dummyVoiceInputs = [
  "오늘 하루가 정말 힘들었어요",
  "기분이 좋지 않네요", 
  "스트레스를 많이 받았어요",
  "조금 우울한 것 같아요",
  "괜찮아질까요?",
  "마음이 무거워요",
  "피곤하고 지쳐요",
  "불안한 마음이 들어요",
  "혼자 있고 싶어요",
  "잠이 잘 안 와요",
  "걱정이 많아요",
  "외로운 기분이에요",
  "답답한 마음이에요",
  "화가 조금 나요",
  "슬픈 마음이 들어요"
];

// 랜덤 더미 음성 입력 선택 (폴백용)
export const getRandomVoiceInput = () => {
  return dummyVoiceInputs[Math.floor(Math.random() * dummyVoiceInputs.length)];
};

// 실제 음성 인식 함수
export const startSpeechRecognition = (
  onResult: (text: string) => void,
  onError: (error: string) => void,
  onStart: () => void,
  onEnd: () => void,
  duration: number = RECORDING_DURATION * 1000
): (() => void) => {
  // Speech Recognition이 지원되지 않는 경우 더미 데이터 사용
  if (!isSpeechRecognitionSupported()) {
    onStart();
    setTimeout(() => {
      onResult(getRandomVoiceInput());
      onEnd();
    }, duration);
    return () => {};
  }

  const SpeechRecognition = getSpeechRecognition();
  const recognition = new SpeechRecognition();

  // 음성 인식 설정
  recognition.lang = 'ko-KR'; // 한국어 설정
  recognition.continuous = false; // 한 번의 음성만 인식
  recognition.interimResults = false; // 중간 결과 비활성화
  recognition.maxAlternatives = 1; // 최대 1개의 결과만

  let timeoutId: NodeJS.Timeout;
  let isCompleted = false;

  // 음성 인식 시작
  recognition.onstart = () => {
    onStart();
    // 지정된 시간 후 자동 종료
    timeoutId = setTimeout(() => {
      if (!isCompleted) {
        recognition.stop();
      }
    }, duration);
  };

  // 음성 인식 결과 처리
  recognition.onresult = (event) => {
    if (event.results.length > 0) {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) {
        isCompleted = true;
        onResult(transcript);
      }
    }
  };

  // 음성 인식 종료
  recognition.onend = () => {
    clearTimeout(timeoutId);
    onEnd();
    
    // 결과가 없으면 기본 메시지 반환
    if (!isCompleted) {
      onResult("죄송해요, 음성을 인식하지 못했습니다.");
    }
  };

  // 에러 처리
  recognition.onerror = (event) => {
    clearTimeout(timeoutId);
    isCompleted = true;
    
    let errorMessage = "음성 인식 중 오류가 발생했습니다.";
    
    switch (event.error) {
      case 'not-allowed':
        errorMessage = "마이크 권한을 허용해주세요.";
        break;
      case 'no-speech':
        errorMessage = "음성이 감지되지 않았습니다.";
        break;
      case 'audio-capture':
        errorMessage = "마이크를 사용할 수 없습니다.";
        break;
      case 'network':
        errorMessage = "네트워크 연결을 확인해주세요.";
        break;
    }
    
    onError(errorMessage);
  };

  // 음성 인식 시작
  try {
    recognition.start();
  } catch (error) {
    onError("음성 인식을 시작할 수 없습니다.");
  }

  // 정지 함수 반환
  return () => {
    isCompleted = true;
    clearTimeout(timeoutId);
    recognition.stop();
  };
};

// Text-to-Speech 지원 여부 확인
export const isTextToSpeechSupported = () => {
  return 'speechSynthesis' in window;
};

// 음성 로딩 완료 확인 (Promise 기반)
export const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (!isTextToSpeechSupported()) {
      resolve([]);
      return;
    }

    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      console.log('🎤 Voices already loaded:', voices.length);
      resolve(voices);
      return;
    }

    console.log('⏳ Waiting for voices to load...');
    
    // 음성 로딩 완료 이벤트 대기
    const onVoicesChanged = () => {
      const loadedVoices = speechSynthesis.getVoices();
      console.log('🎤 Voices loaded:', loadedVoices.length);
      speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(loadedVoices);
    };

    speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    
    // 5초 타임아웃 - 음성이 로드되지 않으면 빈 배열 반환
    setTimeout(() => {
      const finalVoices = speechSynthesis.getVoices();
      console.log('⚠️ Voice loading timeout, using available voices:', finalVoices.length);
      speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(finalVoices);
    }, 5000);
  });
};

// 한국어 음성 찾기
export const getKoreanVoices = () => {
  if (!isTextToSpeechSupported()) return [];
  
  const voices = speechSynthesis.getVoices();
  return voices.filter(voice => voice.lang.includes('ko'));
};

// 실제 Text-to-Speech 함수 (음성 로딩 대기 포함)
export const startTextToSpeech = async (
  text: string,
  onStart: () => void,
  onEnd: () => void,
  onProgress?: (displayText: string, isComplete: boolean) => void,
  options: {
    rate?: number; // 0.1 ~ 10 (기본 1)
    pitch?: number; // 0 ~ 2 (기본 1)  
    volume?: number; // 0 ~ 1 (기본 1)
  } = {}
): Promise<(() => void)> => {
  console.log('🔊 Starting TTS for:', text.substring(0, 50) + '...');
  
  // TTS가 지원되지 않는 경우 시뮬레이션 사용
  if (!isTextToSpeechSupported()) {
    console.log('📱 TTS not supported, using simulation');
    return simulateTextToSpeech(text, onProgress || (() => {}), onStart, onEnd);
  }

  // 음성 로딩 대기 (최대 2초)
  let voices: SpeechSynthesisVoice[] = [];
  try {
    const voiceLoadPromise = waitForVoices();
    const timeoutPromise = new Promise<SpeechSynthesisVoice[]>(resolve => 
      setTimeout(() => resolve([]), 2000)
    );
    voices = await Promise.race([voiceLoadPromise, timeoutPromise]);
  } catch (error) {
    console.error('❌ Voice loading failed:', error);
  }

  // 음성이 로드되지 않았거나 한국어 음성이 없으면 시뮬레이션 사용
  const koreanVoices = voices.filter(voice => voice.lang.includes('ko'));
  if (voices.length === 0 || koreanVoices.length === 0) {
    console.log('📱 No suitable voices found, using simulation');
    return simulateTextToSpeech(text, onProgress || (() => {}), onStart, onEnd);
  }

  console.log('🎤 Using real TTS with', koreanVoices.length, 'Korean voices');
  
  // 기존에 재생 중인 음성 중지
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  // 한국어 음성 설정
  const femaleVoice = koreanVoices.find(voice => 
    voice.name.includes('Female') || voice.name.includes('여성')
  );
  utterance.voice = femaleVoice || koreanVoices[0];

  // 음성 옵션 설정
  utterance.rate = options.rate || 0.9;
  utterance.pitch = options.pitch || 1.1;
  utterance.volume = options.volume || 0.8;

  let isCancelled = false;
  let hasStarted = false;
  let hasEnded = false;

  // 3초 안에 시작되지 않으면 강제 종료
  const startTimeout = setTimeout(() => {
    if (!hasStarted && !isCancelled) {
      console.log('⚠️ TTS start timeout, falling back to simulation');
      isCancelled = true;
      speechSynthesis.cancel();
      // 시뮬레이션으로 폴백
      simulateTextToSpeech(text, onProgress || (() => {}), onStart, onEnd);
    }
  }, 3000);

  // TTS 이벤트 처리
  utterance.onstart = () => {
    clearTimeout(startTimeout);
    hasStarted = true;
    if (!isCancelled) {
      console.log('✅ Real TTS started');
      onStart();
      
      // 진행률 시뮬레이션
      if (onProgress) {
        simulateProgress(text, onProgress, utterance.rate);
      }
    }
  };

  utterance.onend = () => {
    if (!hasEnded) {
      hasEnded = true;
      console.log('✅ Real TTS ended');
      if (!isCancelled) {
        onEnd();
      }
    }
  };

  utterance.onerror = (event) => {
    console.error('❌ TTS Error:', event.error);
    if (!hasEnded) {
      hasEnded = true;
      if (!isCancelled) {
        onEnd();
      }
    }
  };

  // TTS 시작
  try {
    speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('❌ Failed to start TTS:', error);
    clearTimeout(startTimeout);
    return simulateTextToSpeech(text, onProgress || (() => {}), onStart, onEnd);
  }

  // 중지 함수 반환
  return () => {
    isCancelled = true;
    clearTimeout(startTimeout);
    speechSynthesis.cancel();
  };
};

// TTS 진행률 시뮬레이션 (실제 API에는 진행률이 없으므로)
const simulateProgress = (
  text: string,
  onProgress: (displayText: string, isComplete: boolean) => void,
  rate: number = 1
) => {
  const estimatedDuration = (text.length * 100) / rate; // 대략적인 재생 시간
  const updateInterval = estimatedDuration / text.length;
  let currentIndex = 0;
  
  const interval = setInterval(() => {
    currentIndex++;
    const displayText = text.substring(0, currentIndex);
    const isComplete = currentIndex >= text.length;
    
    onProgress(displayText, isComplete);
    
    if (isComplete) {
      clearInterval(interval);
    }
  }, updateInterval);

  return () => clearInterval(interval);
};

// 폴백용 시뮬레이션 TTS
const simulateTextToSpeech = (
  text: string,
  onProgress: (displayText: string, isComplete: boolean) => void,
  onStart: () => void,
  onEnd: () => void,
  speed: number = 50
) => {
  onStart();
  let currentIndex = 0;
  
  const interval = setInterval(() => {
    currentIndex++;
    const displayText = text.substring(0, currentIndex);
    const isComplete = currentIndex >= text.length;
    
    onProgress(displayText, isComplete);
    
    if (isComplete) {
      clearInterval(interval);
      onEnd();
    }
  }, speed);
  
  return () => clearInterval(interval);
};

// 녹음 시뮬레이션 시간 (초)
export const RECORDING_DURATION = 3;

// 음성 재생 시뮬레이션 속도 설정
export const TTS_SPEEDS = {
  slow: 80,
  normal: 50,
  fast: 30
};

// 웨이브 애니메이션을 위한 더미 오디오 데이터 생성
export const generateDummyAudioWave = (duration: number = 3000) => {
  const waves = [];
  const intervals = Math.floor(duration / 100); // 100ms 간격
  
  for (let i = 0; i < intervals; i++) {
    waves.push(Math.random() * 100); // 0-100 범위의 랜덤 높이
  }
  
  return waves;
};