import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, Edit2, Trash2, Check, X, Sparkles, ImagePlus, Loader2 } from 'lucide-react';
import type { Action } from '@/store/dailyRecordStore';
import { uploadImage, compressImage } from '@/utils/imageUpload';

interface ActionListInputProps {
  title: string;
  examples: string[];
  actions: Action[];
  maxActions?: number;
  onAddAction: (label: string, isCustom: boolean, memo?: string, imageUrl?: string) => void;
  onUpdateAction: (actionId: string, newLabel: string, newMemo: string, newImageUrl?: string | null) => void;
  onRemoveAction: (actionId: string) => void;
  accentColor?: string;
  cohortId?: string;  // 이미지 업로드용
}

export default function ActionListInput({
  title,
  examples,
  actions,
  maxActions = 10,
  onAddAction,
  onUpdateAction,
  onRemoveAction,
  accentColor = '#0061EF',
  cohortId
}: ActionListInputProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newMemo, setNewMemo] = useState('');
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartAdding = () => {
    setIsAdding(true);
    setShowExamples(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewLabel('');
    setNewMemo('');
    setNewImageUrl(null);
    setNewImagePreview(null);
    setShowExamples(false);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cohortId) return;

    setIsUploadingImage(true);
    try {
      const compressed = await compressImage(file);

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => setNewImagePreview(reader.result as string);
      reader.readAsDataURL(compressed);

      // Upload
      const result = await uploadImage(compressed, 'daily-record-images', cohortId);
      setNewImageUrl(result.url);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setNewImageUrl(null);
    setNewImagePreview(null);
  };

  const handleSave = () => {
    if (!newLabel.trim()) return;

    if (editingId) {
      // Update existing action (pass newImageUrl: undefined to keep existing, null to remove)
      onUpdateAction(editingId, newLabel.trim(), newMemo.trim(), newImageUrl);
      setEditingId(null);
    } else {
      // Add new action
      if (actions.length >= maxActions) {
        alert(`최대 ${maxActions}개까지만 추가할 수 있습니다.`);
        return;
      }

      // Check if it's a custom action
      const isCustom = !examples.includes(newLabel.trim());
      // Pass memo and imageUrl directly
      onAddAction(newLabel.trim(), isCustom, newMemo.trim() || undefined, newImageUrl || undefined);

      setIsAdding(false);
    }

    // Reset
    setNewLabel('');
    setNewMemo('');
    setNewImageUrl(null);
    setNewImagePreview(null);
    setShowExamples(false);
  };

  const handleExampleClick = (example: string) => {
    setNewLabel(example);
    setShowExamples(false);
  };

  const handleStartEdit = (action: Action) => {
    setEditingId(action.id);
    setNewLabel(action.label);
    setNewMemo(action.memo || '');
    setNewImageUrl(action.imageUrl || null);
    setNewImagePreview(action.imageUrl || null);
    setShowExamples(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-bold text-headspace-darkGray text-lg">
          {title}
        </h3>
      </div>

      {/* Action List */}
      <div className="space-y-2 mb-3">
        <AnimatePresence mode="popLayout">
          {actions.map((action, index) => {
            const isEditing = editingId === action.id;
            const hasDescription = action.memo && action.memo.trim().length > 0;

            if (isEditing) {
              // Editing mode - inline form
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl p-5 shadow-soft-lg border-2"
                  style={{ borderColor: accentColor }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className="font-bold text-sm px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: `${accentColor}20`,
                        color: accentColor
                      }}
                    >
                      {index + 1}
                    </span>
                    <h4 className="font-semibold text-headspace-darkGray">
                      {index + 1}번째 행동 수정
                    </h4>
                  </div>

                  {/* Title input */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-headspace-darkGray mb-2">
                      행동 *
                    </label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onFocus={() => setShowExamples(true)}
                      placeholder="무엇을 했나요?"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                      autoFocus
                    />
                  </div>

                  {/* Example chips */}
                  <AnimatePresence>
                    {showExamples && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mb-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-3 h-3 text-headspace-purple" />
                          <p className="text-xs text-headspace-textMuted">
                            추천 예시 (클릭하면 자동 입력)
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {examples.slice(0, 8).map((example, exampleIndex) => (
                            <motion.button
                              key={exampleIndex}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: exampleIndex * 0.05 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleExampleClick(example)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-headspace-darkGray transition-colors"
                            >
                              {example}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Description input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-headspace-darkGray mb-2">
                      설명 (선택사항)
                    </label>
                    <textarea
                      value={newMemo}
                      onChange={(e) => setNewMemo(e.target.value)}
                      placeholder="예: 공원에서 30분 걸었어요. 날씨가 좋아서 기분이 좋았습니다."
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                    />
                    {newMemo && (
                      <p className="text-xs text-right text-headspace-textMuted mt-1">
                        {newMemo.length} / 200자
                      </p>
                    )}
                  </div>

                  {/* Image upload */}
                  {cohortId && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-headspace-darkGray mb-2">
                        사진 (선택사항)
                      </label>
                      {newImagePreview ? (
                        <div className="relative rounded-xl overflow-hidden bg-gray-100">
                          <img
                            src={newImagePreview}
                            alt="Preview"
                            className="w-full h-32 object-cover"
                          />
                          <button
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {isUploadingImage && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="w-full h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                              <span className="text-sm text-gray-400">업로드 중...</span>
                            </>
                          ) : (
                            <>
                              <ImagePlus className="w-5 h-5 text-gray-400" />
                              <span className="text-sm text-gray-400">사진 추가</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-3 bg-gray-100 rounded-full font-medium text-headspace-darkGray hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      취소
                    </button>
                    <motion.button
                      whileHover={newLabel.trim() ? { scale: 1.02 } : {}}
                      whileTap={newLabel.trim() ? { scale: 0.98 } : {}}
                      onClick={handleSave}
                      disabled={!newLabel.trim() || isUploadingImage}
                      className="flex-1 py-3 rounded-full font-medium text-white shadow-soft hover:shadow-soft-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ backgroundColor: accentColor }}
                    >
                      <Check className="w-4 h-4" />
                      저장하기
                    </motion.button>
                  </div>
                </motion.div>
              );
            }

            // Normal view
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-2xl shadow-soft overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleStartEdit(action)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-sm px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${accentColor}20`,
                            color: accentColor
                          }}
                        >
                          {index + 1}
                        </span>
                        <span className="font-medium text-headspace-darkGray">
                          {action.label}
                        </span>
                      </div>

                      {/* Preview of description */}
                      {hasDescription && (
                        <p className="text-sm text-headspace-textMuted mt-1 ml-8 line-clamp-1">
                          {action.memo}
                        </p>
                      )}

                      {/* Preview of image */}
                      {action.imageUrl && (
                        <div className="mt-2 ml-8">
                          <img
                            src={action.imageUrl}
                            alt="Action"
                            className="h-16 w-24 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(action);
                        }}
                        className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-headspace-blue" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`"${action.label}"을(를) 삭제하시겠어요?`)) {
                            onRemoveAction(action.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add new action - CTA Card or Input Form */}
      <AnimatePresence mode="wait">
        {!isAdding && actions.length < maxActions && (
          <motion.div
            key="cta-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleStartAdding}
            className="border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all"
            style={{
              borderColor: `${accentColor}40`,
              background: `linear-gradient(135deg, ${accentColor}08, ${accentColor}15)`
            }}
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl mb-2"
              >
                ✨
              </motion.div>
              <p className="font-semibold text-lg" style={{ color: accentColor }}>
                추가하기
              </p>
            </div>
          </motion.div>
        )}

        {isAdding && (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-5 shadow-soft-lg border-2"
            style={{ borderColor: accentColor }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="font-bold text-sm px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: `${accentColor}20`,
                  color: accentColor
                }}
              >
                {actions.length + 1}
              </span>
              <h4 className="font-semibold text-headspace-darkGray">
                {actions.length + 1}번째 행동
              </h4>
            </div>

            {/* Title input */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-headspace-darkGray mb-2">
                행동 *
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onFocus={() => setShowExamples(true)}
                placeholder="무엇을 했나요?"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                style={{
                  focusRing: accentColor
                }}
                autoFocus
              />
            </div>

            {/* Example chips (slide down on focus) */}
            <AnimatePresence>
              {showExamples && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mb-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3 text-headspace-purple" />
                    <p className="text-xs text-headspace-textMuted">
                      추천 예시 (클릭하면 자동 입력)
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {examples.slice(0, 8).map((example, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleExampleClick(example)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-headspace-darkGray transition-colors"
                      >
                        {example}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description input (always visible) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-headspace-darkGray mb-2">
                설명 (선택사항)
              </label>
              <textarea
                value={newMemo}
                onChange={(e) => setNewMemo(e.target.value)}
                placeholder="예: 공원에서 30분 걸었어요. 날씨가 좋아서 기분이 좋았습니다."
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all"
                style={{
                  focusRing: accentColor
                }}
              />
              {newMemo && (
                <p className="text-xs text-right text-headspace-textMuted mt-1">
                  {newMemo.length} / 200자
                </p>
              )}
            </div>

            {/* Image upload for new action */}
            {cohortId && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-headspace-darkGray mb-2">
                  사진 (선택사항)
                </label>
                {newImagePreview ? (
                  <div className="relative rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={newImagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                        <span className="text-sm text-gray-400">업로드 중...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-400">사진 추가</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 bg-gray-100 rounded-full font-medium text-headspace-darkGray hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                취소
              </button>
              <motion.button
                whileHover={newLabel.trim() ? { scale: 1.02 } : {}}
                whileTap={newLabel.trim() ? { scale: 0.98 } : {}}
                onClick={handleSave}
                disabled={!newLabel.trim() || isUploadingImage}
                className="flex-1 py-3 rounded-full font-medium text-white shadow-soft hover:shadow-soft-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: accentColor }}
              >
                <Check className="w-4 h-4" />
                저장하기
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Max limit message */}
      {actions.length >= maxActions && (
        <p className="text-center text-sm text-headspace-textMuted mt-3">
          최대 {maxActions}개까지 추가할 수 있습니다
        </p>
      )}

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
}
