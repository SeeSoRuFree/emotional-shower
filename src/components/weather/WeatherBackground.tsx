import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'dawn' | 'dusk' | 'night';

interface WeatherBackgroundProps {
  weather: WeatherType;
  className?: string;
  children?: React.ReactNode;
}

const weatherConfigs = {
  sunny: {
    gradient: 'from-blue-200 via-headspace-pastel-blue to-blue-100',
    cloudColor: 'bg-white/90',
    cloudCount: 3,
    animationSpeed: 20,
  },
  cloudy: {
    gradient: 'from-gray-300 via-gray-200 to-gray-100',
    cloudColor: 'bg-white/95',
    cloudCount: 5,
    animationSpeed: 15,
  },
  rainy: {
    gradient: 'from-slate-400 via-gray-300 to-blue-200',
    cloudColor: 'bg-white/85',
    cloudCount: 4,
    animationSpeed: 25,
  },
  dawn: {
    gradient: 'from-headspace-beige via-headspace-pastel-orange to-headspace-pastel-pink',
    cloudColor: 'bg-white/80',
    cloudCount: 3,
    animationSpeed: 30,
  },
  dusk: {
    gradient: 'from-headspace-pastel-purple via-headspace-pastel-pink to-headspace-pastel-orange',
    cloudColor: 'bg-white/75',
    cloudCount: 4,
    animationSpeed: 25,
  },
  night: {
    gradient: 'from-headspace-purple via-purple-800 to-indigo-900',
    cloudColor: 'bg-white/40',
    cloudCount: 2,
    animationSpeed: 35,
  },
};

interface CloudProps {
  size: 'small' | 'medium' | 'large';
  delay: number;
  duration: number;
  color: string;
}

const Cloud = ({ size, delay, duration, color }: CloudProps) => {
  const sizeClasses = {
    small: 'w-16 h-8',
    medium: 'w-24 h-12',
    large: 'w-32 h-16',
  };

  return (
    <motion.div
      className={`absolute ${sizeClasses[size]} ${color} rounded-full`}
      initial={{ x: '-100%', opacity: 0 }}
      animate={{ 
        x: 'calc(100vw + 100%)',
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        top: Math.random() * 60 + 10 + '%',
        filter: 'blur(1px)',
      }}
    >
      {/* Cloud shape using multiple circles */}
      <div className="relative w-full h-full">
        <div className="absolute left-0 top-1/2 w-1/3 h-full rounded-full bg-inherit transform -translate-y-1/2" />
        <div className="absolute left-1/4 top-0 w-1/2 h-4/5 rounded-full bg-inherit" />
        <div className="absolute right-0 top-1/3 w-1/3 h-2/3 rounded-full bg-inherit" />
      </div>
    </motion.div>
  );
};

const RainDrops = () => {
  const drops = Array.from({ length: 50 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-0.5 h-4 bg-blue-300/60 rounded-full"
      initial={{ y: '-10px', opacity: 0 }}
      animate={{ 
        y: 'calc(100vh + 10px)',
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: Math.random() * 2 + 1,
        delay: Math.random() * 5,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        left: Math.random() * 100 + '%',
      }}
    />
  ));

  return <div className="absolute inset-0 overflow-hidden">{drops}</div>;
};

export default function WeatherBackground({ 
  weather, 
  className = '', 
  children 
}: WeatherBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const config = weatherConfigs[weather];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`min-h-screen bg-gradient-to-b from-blue-200 to-blue-100 ${className}`}>
        {children}
      </div>
    );
  }

  const clouds = Array.from({ length: config.cloudCount }, (_, i) => (
    <Cloud
      key={i}
      size={['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as 'small' | 'medium' | 'large'}
      delay={i * (config.animationSpeed / config.cloudCount) + Math.random() * 10}
      duration={config.animationSpeed + Math.random() * 10}
      color={config.cloudColor}
    />
  ));

  return (
    <motion.div 
      key={weather}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className={`min-h-screen bg-gradient-to-b ${config.gradient} relative overflow-hidden ${className}`}
    >
      {/* Moving clouds */}
      <div className="absolute inset-0">
        {clouds}
      </div>

      {/* Rain effect for rainy weather */}
      {weather === 'rainy' && <RainDrops />}

      {/* Stars for night weather */}
      {weather === 'night' && (
        <div className="absolute inset-0">
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 50 + '%',
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}