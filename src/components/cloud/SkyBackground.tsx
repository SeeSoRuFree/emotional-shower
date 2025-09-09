import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface SkyBackgroundProps {
  timeOfDay?: 'morning' | 'day' | 'evening' | 'night';
  cloudDensity?: 'low' | 'medium' | 'high';
  children?: React.ReactNode;
  className?: string;
}

// Sky gradients for different times of day
const skyGradients = {
  morning: 'linear-gradient(180deg, #FFE0B2 0%, #FFF3E0 50%, #F0F8FF 100%)',
  day: 'linear-gradient(180deg, #E3F2FD 0%, #F0F8FF 30%, #FFFFFF 100%)',
  evening: 'linear-gradient(180deg, #FFCDD2 0%, #FFE0B2 50%, #F0F8FF 100%)',
  night: 'linear-gradient(180deg, #283593 0%, #3F51B5 50%, #5C6BC0 100%)'
};

// Cloud configurations
const cloudConfigs = {
  low: { count: 3, opacity: 0.3 },
  medium: { count: 5, opacity: 0.4 },
  high: { count: 8, opacity: 0.5 }
};

interface CloudProps {
  size: 'small' | 'medium' | 'large';
  left: string;
  top: string;
  delay: number;
  opacity: number;
}

const CloudElement = ({ size, left, top, delay, opacity }: CloudProps) => {
  const sizeClasses = {
    small: 'w-16 h-8',
    medium: 'w-24 h-12',
    large: 'w-32 h-16'
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ 
        x: [0, 20, 0],
        y: [0, -10, 0],
        opacity: [opacity * 0.5, opacity, opacity * 0.7, opacity]
      }}
      transition={{
        duration: 20 + delay * 2,
        repeat: Infinity,
        delay,
        ease: "linear"
      }}
      className={`absolute ${sizeClasses[size]} pointer-events-none`}
      style={{ left, top }}
    >
      {/* Main cloud body */}
      <div className="relative w-full h-full">
        <div 
          className="absolute inset-0 bg-white rounded-full opacity-80"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.7) 100%)',
            filter: 'blur(1px)'
          }}
        />
        
        {/* Cloud puffs */}
        <div 
          className="absolute w-3/5 h-3/5 bg-white rounded-full opacity-60"
          style={{ 
            top: '-20%', 
            left: '10%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,249,250,0.6) 100%)',
            filter: 'blur(1px)'
          }}
        />
        <div 
          className="absolute w-1/2 h-1/2 bg-white rounded-full opacity-50"
          style={{ 
            top: '-15%', 
            right: '15%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(248,249,250,0.5) 100%)',
            filter: 'blur(1px)'
          }}
        />
        <div 
          className="absolute w-2/5 h-2/5 bg-white rounded-full opacity-40"
          style={{ 
            top: '-10%', 
            left: '60%',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(248,249,250,0.4) 100%)',
            filter: 'blur(0.5px)'
          }}
        />
      </div>
    </motion.div>
  );
};

export default function SkyBackground({ 
  timeOfDay = 'day', 
  cloudDensity = 'medium',
  children,
  className = ''
}: SkyBackgroundProps) {
  // Generate clouds with random positions
  const clouds = useMemo(() => {
    const config = cloudConfigs[cloudDensity];
    return Array.from({ length: config.count }, (_, i) => ({
      id: i,
      size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large',
      left: `${Math.random() * 80}%`,
      top: `${Math.random() * 60 + 10}%`,
      delay: Math.random() * 10,
      opacity: config.opacity * (0.5 + Math.random() * 0.5)
    }));
  }, [cloudDensity]);

  return (
    <div 
      className={`relative min-h-screen overflow-hidden ${className}`}
      style={{
        background: skyGradients[timeOfDay]
      }}
    >
      {/* Background clouds */}
      <div className="absolute inset-0 overflow-hidden">
        {clouds.map((cloud) => (
          <CloudElement
            key={cloud.id}
            size={cloud.size}
            left={cloud.left}
            top={cloud.top}
            delay={cloud.delay}
            opacity={cloud.opacity}
          />
        ))}
      </div>
      
      {/* Subtle sky texture */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 40%, rgba(255,255,255,0.05) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)
          `
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}