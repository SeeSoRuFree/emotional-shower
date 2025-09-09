import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square } from 'lucide-react';
import { getRandomVoiceInput, RECORDING_DURATION, generateDummyAudioWave } from '@/utils/dummyVoice';

interface VoiceRecorderProps {
  onVoiceInput: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onVoiceInput, disabled = false }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(RECORDING_DURATION);
  const [audioWave, setAudioWave] = useState<number[]>([]);

  useEffect(() => {
    if (isRecording) {
      const waves = generateDummyAudioWave(RECORDING_DURATION * 1000);
      setAudioWave(waves);
      
      // 카운트다운 타이머
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            stopRecording();
            return RECORDING_DURATION;
          }
          return prev - 1;
        });
      }, 1000);

      // 자동 중지 타이머
      const stopTimer = setTimeout(() => {
        stopRecording();
      }, RECORDING_DURATION * 1000);

      return () => {
        clearInterval(countdownInterval);
        clearTimeout(stopTimer);
      };
    }
  }, [isRecording]);

  const startRecording = () => {
    if (disabled) return;
    setIsRecording(true);
    setCountdown(RECORDING_DURATION);
  };

  const stopRecording = () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    setCountdown(RECORDING_DURATION);
    setAudioWave([]);
    
    // 더미 음성 인식 결과 전송
    setTimeout(() => {
      const dummyText = getRandomVoiceInput();
      onVoiceInput(dummyText);
    }, 500);
  };

  const WaveAnimation = () => (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={i}
          animate={{
            height: [8, Math.random() * 24 + 8, 8],
            opacity: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05
          }}
          className="w-1 bg-headspace-blue rounded-full"
        />
      ))}
    </div>
  );

  return (
    <div className="flex items-center gap-3">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-3 bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-soft"
          >
            {/* 웨이브 애니메이션 */}
            <WaveAnimation />
            
            {/* 카운트다운 */}
            <div className="text-sm font-medium text-headspace-darkGray min-w-[20px] text-center">
              {countdown}s
            </div>
            
            {/* 중지 버튼 */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={stopRecording}
              className="p-2 bg-headspace-coral rounded-full shadow-soft"
            >
              <Square className="w-4 h-4 text-white" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isRecording && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startRecording}
          disabled={disabled}
          className={`p-3 rounded-full shadow-soft transition-all ${
            disabled
              ? 'bg-gray-200 cursor-not-allowed'
              : 'bg-headspace-blue hover:bg-headspace-blue/90'
          }`}
        >
          <Mic className={`w-5 h-5 ${disabled ? 'text-gray-400' : 'text-white'}`} />
        </motion.button>
      )}

      {/* 녹음 상태 표시 */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-headspace-coral text-white text-xs px-3 py-1 rounded-full flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-white rounded-full"
              />
              녹음 중
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}