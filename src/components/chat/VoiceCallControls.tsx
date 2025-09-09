import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square, Volume2, VolumeX } from 'lucide-react';
import { getRandomVoiceInput, RECORDING_DURATION, generateDummyAudioWave } from '@/utils/dummyVoice';

interface VoiceCallControlsProps {
  onVoiceInput: (text: string) => void;
  disabled?: boolean;
  isAIPlaying?: boolean;
}

export default function VoiceCallControls({ 
  onVoiceInput, 
  disabled = false, 
  isAIPlaying = false 
}: VoiceCallControlsProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(RECORDING_DURATION);
  const [isMuted, setIsMuted] = useState(false);
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
    if (disabled || isAIPlaying) return;
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

  // Recording wave animation for the mic button
  const RecordingWave = () => (
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
          className="absolute w-20 h-20 rounded-full border-2 border-headspace-coral/30"
        />
      ))}
    </div>
  );

  return (
    <div className="flex items-center justify-center">
      {/* Recording State UI */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-full max-w-sm"
          >
            <div className="bg-white/95 backdrop-blur rounded-3xl p-4 shadow-soft border border-headspace-coral/20">
              {/* Recording indicator */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 bg-headspace-coral rounded-full"
                />
                <span className="text-headspace-coral font-medium text-sm">
                  녹음 중
                </span>
                <div className="text-headspace-darkGray font-bold text-lg min-w-[30px] text-center">
                  {countdown}s
                </div>
              </div>
              
              {/* Audio wave visualization */}
              <div className="flex items-center justify-center gap-1 h-8 mb-3">
                {Array.from({ length: 20 }, (_, i) => (
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
                      delay: i * 0.03
                    }}
                    className="w-1 bg-headspace-coral rounded-full"
                  />
                ))}
              </div>
              
              {/* Stop button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={stopRecording}
                  className="flex items-center gap-2 bg-headspace-coral text-white px-4 py-2 rounded-full font-medium shadow-soft"
                >
                  <Square className="w-4 h-4" />
                  중지
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Controls */}
      <div className="flex items-center gap-6">
        {/* Mute/Unmute Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 rounded-full shadow-soft transition-all ${
            isMuted 
              ? 'bg-headspace-textMuted text-white' 
              : 'bg-white text-headspace-textMuted hover:bg-headspace-pastel-blue'
          }`}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </motion.button>

        {/* Main Mic Button */}
        <div className="relative">
          {isRecording && <RecordingWave />}
          
          <motion.button
            whileHover={{ scale: disabled || isAIPlaying ? 1 : 1.05 }}
            whileTap={{ scale: disabled || isAIPlaying ? 1 : 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled && !isRecording}
            className={`relative w-16 h-16 rounded-full shadow-lg transition-all ${
              isRecording
                ? 'bg-headspace-coral hover:bg-headspace-coral/90'
                : disabled || isAIPlaying
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-headspace-blue hover:bg-headspace-blue/90'
            }`}
          >
            {isRecording ? (
              <Square className="w-6 h-6 text-white mx-auto" />
            ) : (
              <Mic className={`w-6 h-6 mx-auto ${
                disabled || isAIPlaying ? 'text-gray-400' : 'text-white'
              }`} />
            )}
          </motion.button>
        </div>

        {/* Spacer for symmetry */}
        <div className="w-12 h-12" />
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {isAIPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          >
            <div className="bg-headspace-purple/10 backdrop-blur rounded-full px-4 py-2">
              <span className="text-sm text-headspace-purple font-medium">
                AI가 말하는 중이에요...
              </span>
            </div>
          </motion.div>
        )}
        
        {!isRecording && !isAIPlaying && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
          >
            <div className="bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-soft">
              <span className="text-sm text-headspace-textMuted">
                마이크를 눌러서 말씀해보세요
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}