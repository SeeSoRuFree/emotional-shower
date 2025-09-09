import { motion } from 'framer-motion';
import { ResponsiveModal } from '@/components/ui/responsive-modal';

interface EmotionOption {
  id: string;
  label: string;
  icon: string;
}

interface EmotionCategory {
  label: string;
  color: string;
  pastelColor: string;
  icon: string;
  subEmotions: EmotionOption[];
}

interface EmotionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  category: EmotionCategory | null;
  onEmotionSelect: () => void;
}

export function EmotionSelector({ 
  isOpen, 
  onClose, 
  category, 
  onEmotionSelect 
}: EmotionSelectorProps) {
  if (!category) return null;

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      className="md:min-w-[600px]"
    >
      {/* Modal Header */}
      <div className="flex items-center gap-4 p-6 pb-4">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: category.pastelColor }}
        >
          {category.icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-headspace-darkGray">
            {category.label}
          </h2>
          <p className="text-sm text-headspace-textMuted">
            더 자세히 알려주세요
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-auto w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          ✕
        </button>
      </div>
      
      {/* Sub-emotion Grid */}
      <div className="p-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {category.subEmotions.map((emotion, index) => (
            <motion.button
              key={emotion.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onEmotionSelect}
              className="p-4 md:p-5 rounded-2xl transition-all duration-200 flex items-center gap-4 border-2 border-transparent hover:border-current hover:shadow-lg group"
              style={{ 
                backgroundColor: category.pastelColor,
                color: category.color
              }}
            >
              <div className="text-2xl md:text-3xl group-hover:scale-110 transition-transform">
                {emotion.icon}
              </div>
              <div className="flex-1 text-left">
                <span className="text-base md:text-lg font-medium text-headspace-darkGray">
                  {emotion.label}
                </span>
              </div>
              <div className="text-headspace-textMuted group-hover:translate-x-1 transition-transform">
                →
              </div>
            </motion.button>
          ))}
        </div>
        
        {/* Additional info for desktop */}
        <div className="hidden md:block mt-6 p-4 bg-gray-50 rounded-2xl">
          <p className="text-sm text-headspace-textMuted text-center">
            💡 선택한 감정은 오늘의 기록에 추가되어 맞춤형 대화에 활용됩니다
          </p>
        </div>
      </div>
    </ResponsiveModal>
  );
}