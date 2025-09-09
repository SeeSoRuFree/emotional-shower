import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';

interface VoiceCallAvatarProps {
  isAI: boolean;
  isActive: boolean; // Speaking or processing
  isListening: boolean; // Listening to the other party
  size?: 'small' | 'large';
}

export default function VoiceCallAvatar({ 
  isAI, 
  isActive, 
  isListening,
  size = 'large' 
}: VoiceCallAvatarProps) {
  const avatarSize = size === 'large' ? 'w-24 h-24' : 'w-16 h-16';
  const waveSize = size === 'large' ? 'w-32 h-32' : 'w-20 h-20';
  
  // Voice wave animation
  const VoiceWaves = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Outer wave */}
      <motion.div
        animate={isActive ? {
          scale: [1, 1.4, 1],
          opacity: [0.6, 0.2, 0.6]
        } : {}}
        transition={{
          duration: 2,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut"
        }}
        className={`absolute ${waveSize} rounded-full border-2 ${
          isAI 
            ? 'border-headspace-purple/30 bg-headspace-purple/5' 
            : 'border-headspace-blue/30 bg-headspace-blue/5'
        }`}
      />
      
      {/* Middle wave */}
      <motion.div
        animate={isActive ? {
          scale: [1, 1.25, 1],
          opacity: [0.4, 0.1, 0.4]
        } : {}}
        transition={{
          duration: 2,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
          delay: 0.3
        }}
        className={`absolute ${waveSize} rounded-full border ${
          isAI 
            ? 'border-headspace-purple/20 bg-headspace-purple/3' 
            : 'border-headspace-blue/20 bg-headspace-blue/3'
        }`}
        style={{ 
          width: size === 'large' ? '120px' : '80px',
          height: size === 'large' ? '120px' : '80px'
        }}
      />
      
      {/* Inner wave */}
      <motion.div
        animate={isActive ? {
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.05, 0.3]
        } : {}}
        transition={{
          duration: 2,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut",
          delay: 0.6
        }}
        className={`absolute rounded-full border ${
          isAI 
            ? 'border-headspace-purple/15 bg-headspace-purple/2' 
            : 'border-headspace-blue/15 bg-headspace-blue/2'
        }`}
        style={{ 
          width: size === 'large' ? '110px' : '70px',
          height: size === 'large' ? '110px' : '70px'
        }}
      />
    </div>
  );

  // Listening indicator
  const ListeningIndicator = () => (
    <motion.div
      animate={isListening ? {
        scale: [1, 1.1, 1],
        opacity: [0.5, 0.8, 0.5]
      } : {}}
      transition={{
        duration: 1.5,
        repeat: isListening ? Infinity : 0,
        ease: "easeInOut"
      }}
      className={`absolute inset-0 rounded-full border-2 ${
        isAI 
          ? 'border-headspace-purple/50' 
          : 'border-headspace-blue/50'
      }`}
      style={{ 
        width: size === 'large' ? '100px' : '68px',
        height: size === 'large' ? '100px' : '68px'
      }}
    />
  );

  return (
    <div className="relative flex items-center justify-center">
      {/* Voice waves when active */}
      {isActive && <VoiceWaves />}
      
      {/* Listening indicator when listening */}
      {isListening && !isActive && <ListeningIndicator />}
      
      {/* Main avatar */}
      <motion.div
        animate={isActive ? {
          scale: [1, 1.05, 1]
        } : {}}
        transition={{
          duration: 1.5,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut"
        }}
        className={`relative ${avatarSize} rounded-full shadow-soft flex items-center justify-center ${
          isAI 
            ? 'bg-gradient-to-br from-headspace-purple to-headspace-blue' 
            : 'bg-gradient-to-br from-headspace-blue to-headspace-purple'
        }`}
      >
        {isAI ? (
          <Sparkles className={`${size === 'large' ? 'w-10 h-10' : 'w-6 h-6'} text-white`} />
        ) : (
          <User className={`${size === 'large' ? 'w-10 h-10' : 'w-6 h-6'} text-white`} />
        )}
        
        {/* Active indicator dot */}
        {isActive && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={`absolute -bottom-2 -right-2 w-4 h-4 rounded-full ${
              isAI ? 'bg-headspace-purple' : 'bg-headspace-blue'
            } border-2 border-white shadow-sm`}
          />
        )}
      </motion.div>
      
      {/* Avatar label */}
      <div className={`absolute ${size === 'large' ? '-bottom-8' : '-bottom-6'} left-1/2 transform -translate-x-1/2`}>
        <div className="bg-white/90 backdrop-blur rounded-full px-3 py-1 shadow-soft">
          <span className={`${size === 'large' ? 'text-sm' : 'text-xs'} font-medium ${
            isAI ? 'text-headspace-purple' : 'text-headspace-blue'
          }`}>
            {isAI ? 'AI 상담사' : '나'}
          </span>
        </div>
      </div>
      
      {/* Status text */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`absolute ${size === 'large' ? '-bottom-16' : '-bottom-12'} left-1/2 transform -translate-x-1/2 whitespace-nowrap`}
        >
          <div className={`bg-${isAI ? 'headspace-purple' : 'headspace-blue'}/10 backdrop-blur rounded-full px-3 py-1`}>
            <span className={`text-xs text-${isAI ? 'headspace-purple' : 'headspace-blue'}`}>
              {isAI ? '말하는 중...' : '녹음 중...'}
            </span>
          </div>
        </motion.div>
      )}
      
      {isListening && !isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`absolute ${size === 'large' ? '-bottom-16' : '-bottom-12'} left-1/2 transform -translate-x-1/2 whitespace-nowrap`}
        >
          <div className="bg-headspace-textMuted/10 backdrop-blur rounded-full px-3 py-1">
            <span className="text-xs text-headspace-textMuted">
              듣는 중...
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}