import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { startTextToSpeech, isTextToSpeechSupported } from '@/utils/dummyVoice';

interface VoicePlayerProps {
  text: string;
  autoPlay?: boolean;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  className?: string;
}

export default function VoicePlayer({ 
  text, 
  autoPlay = false, 
  onPlayStart, 
  onPlayEnd,
  className = ''
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [stopTTS, setStopTTS] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (autoPlay && text) {
      startPlayback();
    } else {
      setDisplayText(text);
      setIsComplete(true);
    }
  }, [text, autoPlay]);

  // 컴포넌트 언마운트 시 TTS 정리
  useEffect(() => {
    return () => {
      if (stopTTS) {
        stopTTS();
      }
    };
  }, [stopTTS]);

  const startPlayback = () => {
    if (isPlaying) return;
    
    setIsComplete(false);
    setDisplayText('');
    onPlayStart?.();

    const stopFn = startTextToSpeech(
      text,
      // onStart
      () => {
        setIsPlaying(true);
      },
      // onEnd
      () => {
        setIsPlaying(false);
        setIsComplete(true);
        setDisplayText(text);
        onPlayEnd?.();
      },
      // onProgress (optional)
      (currentText, complete) => {
        setDisplayText(currentText);
        setIsComplete(complete);
      },
      // options
      {
        rate: 0.9,
        pitch: 1.1,
        volume: isMuted ? 0 : 0.8
      }
    );

    setStopTTS(() => stopFn);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      // TTS 중지
      if (stopTTS) {
        stopTTS();
        setStopTTS(null);
      }
      setIsPlaying(false);
      setDisplayText(text);
      setIsComplete(true);
    } else {
      startPlayback();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const SpeakerWave = () => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 4 }, (_, i) => (
        <motion.div
          key={i}
          animate={isPlaying && !isMuted ? {
            height: [2, 8, 2],
            opacity: [0.3, 1, 0.3]
          } : {}}
          transition={{
            duration: 0.6,
            repeat: isPlaying && !isMuted ? Infinity : 0,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          className="w-0.5 h-2 bg-headspace-blue rounded-full"
        />
      ))}
    </div>
  );

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {/* 스피커 아이콘과 컨트롤 */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={togglePlayback}
          className="p-2 bg-headspace-purple/10 rounded-full hover:bg-headspace-purple/20 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-headspace-purple" />
          ) : (
            <Play className="w-4 h-4 text-headspace-purple" />
          )}
        </motion.button>

        <SpeakerWave />

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMute}
          className="p-1 hover:bg-headspace-purple/10 rounded transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-3 h-3 text-headspace-textMuted" />
          ) : (
            <Volume2 className="w-3 h-3 text-headspace-textMuted" />
          )}
        </motion.button>
      </div>

      {/* 텍스트 표시 영역 */}
      <div className="flex-1 max-w-[70%]">
        <div className="bg-white text-headspace-darkGray px-4 py-3 rounded-2xl shadow-soft relative">
          <p className="whitespace-pre-line">
            {displayText}
            {isPlaying && !isComplete && (
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-1 h-4 bg-headspace-blue ml-1"
              />
            )}
          </p>
          
          {/* 재생 상태 표시 */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -bottom-2 right-2 bg-headspace-purple text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-2 h-2 border border-white border-t-transparent rounded-full"
                />
                재생 중
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 재생 완료 표시 */}
        {isComplete && !isPlaying && autoPlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-headspace-textMuted mt-2 flex items-center gap-1"
          >
            <Volume2 className="w-3 h-3" />
            {isTextToSpeechSupported() ? '음성 재생 완료' : '텍스트 표시 완료'}
          </motion.div>
        )}

        {/* TTS 미지원 안내 */}
        {autoPlay && !isTextToSpeechSupported() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-headspace-textMuted mt-2 opacity-75"
          >
            💡 더미 모드: 실제 음성 재생은 지원되지 않습니다
          </motion.div>
        )}
      </div>
    </div>
  );
}