import { motion, AnimatePresence } from 'framer-motion';

interface CloudEffectProps {
  x: number;
  y: number;
  color: string;
  type?: 'pop' | 'gentle' | 'burst';
}

export default function CloudEffect({ x, y, color, type = 'pop' }: CloudEffectProps) {
  const effectVariants = {
    pop: {
      initial: { scale: 0, opacity: 1 },
      animate: { 
        scale: [0, 1.5, 2.5],
        opacity: [1, 0.6, 0]
      },
      transition: { duration: 0.8, ease: "easeOut" }
    },
    gentle: {
      initial: { scale: 0.5, opacity: 0.8 },
      animate: { 
        scale: [0.5, 2, 3],
        opacity: [0.8, 0.4, 0],
        y: [0, -20, -40]
      },
      transition: { duration: 1.2, ease: "easeOut" }
    },
    burst: {
      initial: { scale: 0, opacity: 1 },
      animate: { 
        scale: [0, 1, 2],
        opacity: [1, 0.8, 0]
      },
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const variant = effectVariants[type];

  return (
    <motion.div
      initial={variant.initial}
      animate={variant.animate}
      exit={{ opacity: 0 }}
      transition={variant.transition}
      className="absolute pointer-events-none"
      style={{ 
        left: x - 50, 
        top: y - 50,
        zIndex: 40
      }}
    >
      {/* Main cloud puff */}
      <div 
        className="w-[100px] h-[100px] relative"
      >
        {/* Central cloud */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${color}40 0%, ${color}20 50%, transparent 70%)`
          }}
        />
        
        {/* Cloud puffs around */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ 
              scale: [0, 1, 1.5],
              opacity: [1, 0.6, 0],
              x: [0, (i - 2) * 15],
              y: [0, (i % 2 === 0 ? -1 : 1) * 10]
            }}
            transition={{ 
              duration: 0.8, 
              delay: i * 0.1,
              ease: "easeOut" 
            }}
            className="absolute w-6 h-6 rounded-full"
            style={{ 
              background: `radial-gradient(circle, ${color}60 0%, transparent 70%)`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
        
        {/* Sparkle effects */}
        {type === 'pop' && [...Array(3)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            initial={{ scale: 0, opacity: 1, rotate: 0 }}
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360],
              x: [0, (i - 1) * 20],
              y: [0, -15 - i * 5]
            }}
            transition={{ 
              duration: 1, 
              delay: 0.2 + i * 0.1,
              ease: "easeOut" 
            }}
            className="absolute text-yellow-300 text-sm"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}