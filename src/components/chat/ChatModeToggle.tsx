import { motion } from 'framer-motion';
import { MessageCircle, Mic } from 'lucide-react';

interface ChatModeToggleProps {
  mode: 'text' | 'voice';
  onModeChange: (mode: 'text' | 'voice') => void;
  disabled?: boolean;
}

export default function ChatModeToggle({ mode, onModeChange, disabled = false }: ChatModeToggleProps) {
  return (
    <div className="relative bg-headspace-pastel-blue/30 rounded-full p-1 flex items-center gap-1">
      {/* 슬라이딩 배경 */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute bg-white rounded-full shadow-soft"
        style={{
          left: mode === 'text' ? '4px' : '50%',
          right: mode === 'voice' ? '4px' : '50%',
          top: '4px',
          bottom: '4px'
        }}
      />

      {/* 텍스트 모드 버튼 */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={() => !disabled && onModeChange('text')}
        disabled={disabled}
        className={`relative z-10 flex items-center gap-2 px-3 py-2 rounded-full font-medium text-sm transition-colors ${
          mode === 'text' 
            ? 'text-headspace-darkGray' 
            : 'text-headspace-textMuted hover:text-headspace-darkGray'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <MessageCircle className="w-4 h-4" />
        텍스트
      </motion.button>

      {/* 음성 모드 버튼 */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        onClick={() => !disabled && onModeChange('voice')}
        disabled={disabled}
        className={`relative z-10 flex items-center gap-2 px-3 py-2 rounded-full font-medium text-sm transition-colors ${
          mode === 'voice' 
            ? 'text-headspace-darkGray' 
            : 'text-headspace-textMuted hover:text-headspace-darkGray'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Mic className="w-4 h-4" />
        음성
      </motion.button>

      {/* 모드 변경 안내 */}
      {mode === 'voice' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
        >
          <div className="bg-headspace-darkGray text-white text-xs px-2 py-1 rounded-full">
            음성으로 대화하기
          </div>
        </motion.div>
      )}
    </div>
  );
}