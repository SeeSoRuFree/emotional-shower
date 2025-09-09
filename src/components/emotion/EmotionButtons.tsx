import { motion } from 'framer-motion';
import { useEmotionStore } from '@/store/emotionStore';
import { useToast } from '@/hooks/use-toast';

export default function EmotionButtons() {
  const addEmotion = useEmotionStore((state) => state.addEmotion);
  const { toast } = useToast();

  const handleEmotionClick = (type: 'positive' | 'negative' | 'helping') => {
    addEmotion(type);
    
    const messages = {
      positive: '긍정적인 감정을 기록했어요! 😊',
      negative: '감정을 기록했어요. 괜찮아요 💙',
      helping: '친절한 마음을 기록했어요! 🤝'
    };

    toast({
      description: messages[type],
      duration: 2000,
    });
  };

  const buttonVariants = {
    tap: { scale: 0.95 },
    hover: { scale: 1.05 },
  };

  return (
    <div className="flex justify-center gap-6 py-8">
      <motion.button
        whileTap="tap"
        whileHover="hover"
        variants={buttonVariants}
        onClick={() => handleEmotionClick('positive')}
        className="w-24 h-24 rounded-full bg-joy shadow-lg flex items-center justify-center text-4xl hover:shadow-xl transition-shadow"
      >
        😊
      </motion.button>

      <motion.button
        whileTap="tap"
        whileHover="hover"
        variants={buttonVariants}
        onClick={() => handleEmotionClick('negative')}
        className="w-24 h-24 rounded-full bg-sadness shadow-lg flex items-center justify-center text-4xl hover:shadow-xl transition-shadow"
      >
        😢
      </motion.button>

      <motion.button
        whileTap="tap"
        whileHover="hover"
        variants={buttonVariants}
        onClick={() => handleEmotionClick('helping')}
        className="w-24 h-24 rounded-full bg-helping shadow-lg flex items-center justify-center text-4xl hover:shadow-xl transition-shadow"
      >
        🤝
      </motion.button>
    </div>
  );
}