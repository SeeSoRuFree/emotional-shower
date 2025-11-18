import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

interface QuoteCardProps {
  quote: string;
  onClose?: () => void;
}

export default function QuoteCard({ quote, onClose }: QuoteCardProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-gradient-to-b from-headspace-pastel-blue/50 to-headspace-pastel-purple/50 backdrop-blur-sm"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative max-w-sm w-full"
      >
        {/* Floating sparkles */}
        <motion.div
          animate={{
            y: [-10, -20, -10],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-10 left-1/2 transform -translate-x-1/2"
        >
          <Sparkles className="w-8 h-8 text-headspace-yellow" />
        </motion.div>

        <div className="bg-white rounded-3xl p-8 shadow-soft-lg">
          {/* Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-4"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-headspace-yellow to-yellow-400 flex items-center justify-center">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* Message */}
          <h3 className="font-bold text-center text-headspace-darkGray mb-3">
            오늘 하루 수고한 당신에게
          </h3>

          {/* Quote */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-headspace-textMuted leading-relaxed mb-6 px-2"
          >
            {quote}
          </motion.p>

          {/* Close button */}
          {onClose && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-semibold shadow-soft"
            >
              확인
            </motion.button>
          )}
        </div>

        {/* Decorative elements */}
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-headspace-pastel-pink to-headspace-pastel-purple rounded-full opacity-50 blur-xl"
        />
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-headspace-pastel-yellow to-headspace-pastel-blue rounded-full opacity-50 blur-xl"
        />
      </motion.div>
    </div>
  );
}
