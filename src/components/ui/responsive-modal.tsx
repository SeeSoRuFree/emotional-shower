import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

export function ResponsiveModal({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  className = "" 
}: ResponsiveModalProps) {
  
  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ 
              y: '100%',
              opacity: 0,
              scale: 0.95
            }}
            animate={{ 
              y: 0,
              opacity: 1,
              scale: 1
            }}
            exit={{ 
              y: '100%',
              opacity: 0,
              scale: 0.95
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              opacity: { duration: 0.2 }
            }}
            className={`
              w-full md:w-auto md:min-w-[500px] md:max-w-2xl
              max-h-[85vh] md:max-h-[80vh]
              bg-white
              rounded-t-3xl md:rounded-3xl
              shadow-2xl
              overflow-hidden
              ${className}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-headspace-darkGray">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-headspace-textMuted" />
                </button>
              </div>
            )}
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] md:max-h-[calc(80vh-80px)]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}