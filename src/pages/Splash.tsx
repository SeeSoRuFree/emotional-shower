import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Splash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-headspace-beige via-headspace-pastel-blue to-white flex items-center justify-center relative overflow-hidden">
      {/* Floating water droplets */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, opacity: 0, scale: 0 }}
          animate={{ 
            y: [0, 20, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 3 + (i * 0.5),
            delay: i * 0.3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute"
          style={{
            left: `${15 + i * 10}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
        >
          <div className="w-3 h-4 bg-headspace-blue/30 rounded-full" 
               style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }} />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center z-10"
      >
        {/* Simple Shower Icon */}
        <motion.div
          className="relative w-32 h-32 mb-8 flex items-center justify-center"
        >
          {/* Main circle background */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 rounded-full bg-white/80 backdrop-blur-md border border-white/60 shadow-soft-lg"
          />
          
          {/* Shower head */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10"
          >
            <div className="w-12 h-6 bg-headspace-blue/80 rounded-full mb-2 mx-auto shadow-soft" />
            
            {/* Water drops */}
            <div className="grid grid-cols-3 gap-1 w-8 mx-auto">
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-1.5 h-2 bg-headspace-blue rounded-full"
                  style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-bold text-headspace-darkGray mb-3 tracking-wide"
        >
          정서 샤워
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-headspace-textMuted text-lg"
        >
          매일 하는 마음 샤워
        </motion.p>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8"
        >
          <div className="flex justify-center gap-2">
            {[0, 0.15, 0.3].map((delay, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -8, 0],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay
                }}
                className="w-2.5 h-2.5 bg-headspace-blue rounded-full"
              />
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-headspace-textMuted/70 text-sm mt-4"
          >
            잠시만 기다려주세요...
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Corner decorative elements */}
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 left-8"
      >
        <div className="w-6 h-8 bg-headspace-blue/30 rounded-full" 
             style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }} />
      </motion.div>
      
      <motion.div
        animate={{ 
          y: [0, 10, 0],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-16 right-8"
      >
        <div className="w-4 h-6 bg-headspace-blue/40 rounded-full" 
             style={{ borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%' }} />
      </motion.div>
    </div>
  );
}