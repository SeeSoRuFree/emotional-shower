import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Action } from '@/store/dailyRecordStore';

interface MemoModalProps {
  isOpen: boolean;
  action: Action | null;
  onClose: () => void;
  onSave: (actionId: string, memo: string) => void;
}

export default function MemoModal({ isOpen, action, onClose, onSave }: MemoModalProps) {
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (action) {
      setMemo(action.memo || '');
    }
  }, [action]);

  const handleSave = () => {
    if (action) {
      onSave(action.id, memo);
    }
    onClose();
  };

  if (!isOpen || !action) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-3xl p-6 shadow-soft-lg max-w-md w-full"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-headspace-darkGray" />
          </button>

          {/* Header */}
          <h3 className="font-bold text-lg text-headspace-darkGray mb-2">
            메모 추가하기
          </h3>
          <p className="text-sm text-headspace-textMuted mb-4">
            <strong>"{action.label}"</strong>에 대해 더 자세히 기록해보세요 (선택사항)
          </p>

          {/* Textarea */}
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예: 공원에서 30분 산책했어요. 날씨가 좋아서 기분이 좋았습니다."
            className="w-full min-h-[120px] bg-gray-50 rounded-2xl p-4 text-headspace-darkGray placeholder-headspace-textMuted resize-none focus:outline-none focus:ring-2 focus:ring-headspace-blue"
            autoFocus
          />

          {/* Character count */}
          <p className="text-xs text-right text-headspace-textMuted mt-2">
            {memo.length} / 200자
          </p>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 rounded-full font-medium text-headspace-darkGray hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-gradient-to-r from-headspace-blue to-headspace-purple text-white rounded-full font-medium shadow-soft hover:shadow-soft-lg transition-all"
            >
              저장
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
