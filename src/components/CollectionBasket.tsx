import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import type { Word } from '../types';
import { categoryMeta } from '../hooks/useWords';

interface CollectionBasketProps {
  collectedWords: Word[];
  maxCollection?: number;
  onRemove: (index: number) => void;
  onGenerate: () => void;
}

export const CollectionBasket: React.FC<CollectionBasketProps> = ({
  collectedWords,
  maxCollection = 3,
  onRemove,
  onGenerate,
}) => {
  const isFull = collectedWords.length >= maxCollection;
  const isEmpty = collectedWords.length === 0;

  return (
    <motion.div
      className="fixed top-6 right-6 z-50 pointer-events-none"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div
        className={`
          glass rounded-2xl p-3 min-w-[140px] pointer-events-auto
          transition-all duration-300
          ${isEmpty ? 'animate-pulse-border border-dashed border-2' : ''}
        `}
      >
        {/* 标题 */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#94a3b8]">
            捕获 {collectedWords.length}/{maxCollection}
          </span>
          <span className="text-sm">
            {isFull ? '✨' : isEmpty ? '○' : '◐'}
          </span>
        </div>

        {/* 已收集的词 */}
        <div className="space-y-1 min-h-[50px]">
          <AnimatePresence mode="popLayout">
            {collectedWords.map((word, index) => {
              const meta = categoryMeta[word.category];
              return (
                <motion.div
                  key={word.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.5, x: -50 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 25,
                    delay: index * 0.1 
                  }}
                  className="flex items-center justify-between group"
                >
                  <span
                    className="text-sm font-bold px-2 py-1 rounded-lg transition-all duration-200"
                    style={{
                      color: meta.color,
                      textShadow: meta.glow,
                      background: `${meta.color}15`,
                    }}
                  >
                    {meta.icon} {word.text}
                  </span>
                  <button
                    onClick={() => onRemove(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-white/10"
                  >
                    <X className="w-3 h-3 text-[#94a3b8]" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[#64748b] text-xs py-3"
            >
              点击词语捕获
            </motion.div>
          )}
        </div>

        {/* 生成按钮 */}
        <motion.button
          onClick={onGenerate}
          disabled={!isFull}
          className={`
            w-full mt-2 py-2 px-3 rounded-lg font-bold text-xs
            flex items-center justify-center gap-1
            transition-all duration-300
            ${isFull 
              ? 'bg-gradient-to-r from-[#67e8f9] via-[#c084fc] to-[#fbbf24] text-[#0f172a] animate-breathe cursor-pointer' 
              : 'bg-[#1e293b] text-[#64748b] cursor-not-allowed'
            }
          `}
          whileHover={isFull ? { scale: 1.02 } : {}}
          whileTap={isFull ? { scale: 0.98 } : {}}
        >
          <Sparkles className="w-3 h-3" />
          {isFull ? '生成诗句' : `还需 ${maxCollection - collectedWords.length} 个词`}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CollectionBasket;
