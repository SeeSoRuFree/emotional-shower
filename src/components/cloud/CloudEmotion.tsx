import { motion } from 'framer-motion';
import { useState } from 'react';

interface CloudEmotionProps {
  emotion: {
    id: string;
    type: 'joy' | 'sad' | 'helping';
    timestamp: Date;
  };
  index: number;
  onClick?: (emotionId: string) => void;
  size?: 'small' | 'medium' | 'large';
  isPopped?: boolean;
}

const emotionColors = {
  joy: {
    primary: '#FFD93D',
    gradient: 'linear-gradient(135deg, #FFD93D 0%, #FFEB3B 50%, #FFF176 100%)',
    shadow: 'rgba(255, 217, 61, 0.3)',
    icon: '☀️'
  },
  sad: {
    primary: '#90CAF9',
    gradient: 'linear-gradient(135deg, #90CAF9 0%, #BBDEFB 50%, #E1F5FE 100%)',
    shadow: 'rgba(144, 202, 249, 0.3)',
    icon: '💙'
  },
  helping: {
    primary: '#64B5F6',
    gradient: 'linear-gradient(135deg, #64B5F6 0%, #81C784 50%, #A5D6A7 100%)',
    shadow: 'rgba(100, 181, 246, 0.3)',
    icon: '🤝'
  }
};

const sizeClasses = {
  small: 'w-8 h-8 text-xs',
  medium: 'w-12 h-12 text-sm',
  large: 'w-16 h-16 text-base'
};

export default function CloudEmotion({ 
  emotion, 
  index, 
  onClick, 
  size = 'medium',
  isPopped = false 
}: CloudEmotionProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Safe access with fallback
  const colors = emotionColors[emotion.type] || emotionColors.joy;
  
  if (isPopped) {
    return null;
  }

  // Generate unique floating properties for each cloud
  const animationProps = {
    yAmplitude: 3 + (index % 3) * 2,
    xAmplitude: 2 + (index % 4) * 1.5,
    rotateDegree: 2 + (index % 3) * 2,
    duration: 4 + (index % 4) * 2,
    delay: (index * 0.2) % 2,
  };

  return (
    <motion.div
      initial={{ 
        y: 50, 
        opacity: 0, 
        scale: 0.8 
      }}
      animate={{ 
        y: [0, -animationProps.yAmplitude, 0, -animationProps.yAmplitude * 0.7, 0],
        x: [0, animationProps.xAmplitude, -animationProps.xAmplitude, animationProps.xAmplitude * 0.5, 0],
        opacity: 1,
        scale: [0.8, 1, 0.98, 1.02, 1],
        rotate: [0, animationProps.rotateDegree, -animationProps.rotateDegree, animationProps.rotateDegree * 0.5, 0]
      }}
      transition={{
        duration: animationProps.duration,
        repeat: Infinity,
        delay: animationProps.delay,
        ease: "easeInOut"
      }}
      className="relative transform-gpu cursor-pointer"
      style={{ 
        transformOrigin: 'center bottom',
        filter: `drop-shadow(0 4px 20px ${colors.shadow})`
      }}
      onClick={() => onClick?.(emotion.id)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Main cloud body */}
      <div 
        className={`${sizeClasses[size]} cloud-emotion relative`}
        style={{
          background: colors.gradient,
          boxShadow: `0 6px 20px ${colors.shadow}, inset 0 1px 0 rgba(255,255,255,0.5)`
        }}
      >
        {/* Cloud puffs - decorative elements */}
        <div 
          className="absolute w-1/3 h-1/3 rounded-full opacity-80"
          style={{ 
            background: colors.gradient,
            top: '-10%', 
            left: '15%',
            filter: 'blur(0.5px)'
          }}
        />
        <div 
          className="absolute w-1/4 h-1/4 rounded-full opacity-60"
          style={{ 
            background: colors.gradient,
            top: '-8%', 
            right: '20%',
            filter: 'blur(0.5px)'
          }}
        />
        
        {/* Emotion icon */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-lg opacity-80">
            {colors.icon}
          </span>
        </div>
        
        {/* Sparkle effect on hover */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1.2, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-1 -right-1 text-yellow-400 text-xs z-20"
          >
            ✨
          </motion.div>
        )}
      </div>
      
      {/* Cloud trail/wisp effect */}
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [0.8, 1, 0.8],
          x: [-2, 2, -2]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: animationProps.delay + 0.5,
          ease: "easeInOut"
        }}
        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 rounded-full opacity-30"
        style={{ 
          background: colors.primary,
          filter: 'blur(1px)'
        }}
      />
    </motion.div>
  );
}