import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit3 } from 'lucide-react';
import type { Action } from '@/store/dailyRecordStore';

interface ActionTagInputProps {
  title: string;
  examples: string[];
  actions: Action[];
  maxActions?: number;
  onAddAction: (label: string, isCustom: boolean) => void;
  onRemoveAction: (actionId: string) => void;
  onOpenMemo: (action: Action) => void;
  accentColor?: string;
}

export default function ActionTagInput({
  title,
  examples,
  actions,
  maxActions = 10,
  onAddAction,
  onRemoveAction,
  onOpenMemo,
  accentColor = '#0061EF'
}: ActionTagInputProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customLabel, setCustomLabel] = useState('');

  const handleExampleClick = (example: string) => {
    // Check if already added
    if (actions.some(a => a.label === example)) {
      return; // Already added
    }

    if (actions.length >= maxActions) {
      alert(`최대 ${maxActions}개까지만 추가할 수 있습니다.`);
      return;
    }

    onAddAction(example, false);
  };

  const handleCustomAdd = () => {
    if (!customLabel.trim()) return;

    if (actions.length >= maxActions) {
      alert(`최대 ${maxActions}개까지만 추가할 수 있습니다.`);
      return;
    }

    onAddAction(customLabel.trim(), true);
    setCustomLabel('');
    setShowCustomInput(false);
  };

  return (
    <div>
      <h3 className="font-bold text-headspace-darkGray mb-3 flex items-center gap-2">
        <span className="text-lg">{title}</span>
        <span className="text-sm font-normal text-headspace-textMuted">
          ({actions.length}/{maxActions})
        </span>
      </h3>

      {/* Added actions (태그 형태) */}
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <AnimatePresence mode="popLayout">
            {actions.map((action) => (
              <motion.div
                key={action.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                className="group relative"
              >
                <button
                  onClick={() => onOpenMemo(action)}
                  className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-soft hover:shadow-soft-lg transition-all flex items-center gap-2"
                  style={{ backgroundColor: accentColor }}
                >
                  {action.label}
                  {action.memo && (
                    <Edit3 className="w-3 h-3 opacity-70" />
                  )}
                </button>

                {/* Remove button */}
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveAction(action.id);
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Example chips */}
      <div className="mb-4">
        <p className="text-xs text-headspace-textMuted mb-2">💡 예시 (클릭하여 추가)</p>
        <div className="flex flex-wrap gap-2">
          {examples.slice(0, 10).map((example, index) => {
            const isAdded = actions.some(a => a.label === example);

            return (
              <motion.button
                key={index}
                whileHover={!isAdded ? { scale: 1.05 } : {}}
                whileTap={!isAdded ? { scale: 0.95 } : {}}
                onClick={() => handleExampleClick(example)}
                disabled={isAdded}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  isAdded
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-headspace-darkGray hover:border-gray-300 hover:shadow-soft'
                }`}
              >
                {example}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom input */}
      <AnimatePresence>
        {showCustomInput ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 rounded-2xl p-4 flex gap-2">
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomAdd()}
                placeholder="직접 입력하기..."
                className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gray-300"
                autoFocus
              />
              <button
                onClick={handleCustomAdd}
                disabled={!customLabel.trim()}
                className="px-4 py-2 text-white rounded-full text-sm font-medium shadow-soft disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: accentColor }}
              >
                추가
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomLabel('');
                }}
                className="px-4 py-2 bg-gray-200 rounded-full text-sm font-medium"
              >
                취소
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCustomInput(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-headspace-darkGray hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            직접 추가하기
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
