import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, RefreshCw, Share2, Sparkles } from 'lucide-react';
import domtoimage from 'dom-to-image';
import type { Word } from '../types';
import { categoryMeta } from '../hooks/useWords';
import { generatePoemWithAI } from '../services/aiService';
import { getBackgroundImage } from '../services/imageService';

interface PosterGeneratorProps {
  words: Word[];
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

export const PosterGenerator: React.FC<PosterGeneratorProps> = ({
  words,
  isOpen,
  onClose,
  onReset,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [verse, setVerse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isOpen && words.length === 3) {
      generateAIVerse();
    }
  }, [isOpen, words]);

  const generateAIVerse = async () => {
    setIsAILoading(true);
    setIsImageLoading(true);
    setVerse('');
    setBackgroundImage('');
    
    try {
      // 并行生成诗句和背景图
      const [poem, imageUrl] = await Promise.all([
        generatePoemWithAI(words),
        getBackgroundImage(words, '') // 先不传诗句，用词语生成
      ]);
      
      setVerse(poem);
      
      // 预加载图片
      if (imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          setBackgroundImage(imageUrl);
          setIsImageLoading(false);
          setIsAILoading(false);
        };
        img.onerror = () => {
          console.error('Background image failed to load');
          setIsImageLoading(false);
          setIsAILoading(false);
        };
        img.src = imageUrl;
      } else {
        setIsImageLoading(false);
        setIsAILoading(false);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setIsAILoading(false);
      setIsImageLoading(false);
    }
  };

  const handleExport = async () => {
    if (!posterRef.current) return;
    
    setIsGenerating(true);
    try {
      const dataUrl = await domtoimage.toPng(posterRef.current, {
        quality: 1,
        bgcolor: undefined,
        style: {
          transform: 'none',
        },
      });
      
      const link = document.createElement('a');
      const wordNames = words.map(w => w.text).join('_');
      link.download = `${wordNames}.png`;
      link.href = dataUrl;
      link.click();
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '词语瀑布',
          text: verse,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(verse);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const currentDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 背景遮罩 */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 海报内容 */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* 海报 */}
            <div
              ref={posterRef}
              data-poster="true"
              className="relative w-[320px] h-[568px] rounded-2xl overflow-hidden"
              style={{
                background: backgroundImage 
                  ? `linear-gradient(180deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 27, 75, 0.3) 100%), url(${backgroundImage})`
                  : 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {/* 背景图加载遮罩 */}
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <motion.div
                    className="w-8 h-8 border-3 border-[#67e8f9] border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              )}
              
              {/* 装饰背景 - 只在没有AI背景图时显示 */}
              {!backgroundImage && (
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 320 568">
                    {[...Array(20)].map((_, i) => (
                      <circle
                        key={i}
                        cx={Math.random() * 320}
                        cy={Math.random() * 568}
                        r={Math.random() * 2 + 1}
                        fill="white"
                      />
                    ))}
                    {[...Array(5)].map((_, i) => (
                      <line
                        key={`line-${i}`}
                        x1={Math.random() * 320}
                        y1={Math.random() * 568}
                        x2={Math.random() * 320}
                        y2={Math.random() * 568}
                        stroke="white"
                        strokeWidth="0.5"
                      />
                    ))}
                  </svg>
                </div>
              )}

              {/* 内容 */}
              <div className="relative h-full flex flex-col items-center justify-center p-8">
                {/* 顶部装饰 */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2">
                  {words.map((word, i) => (
                    <span
                      key={i}
                      className="text-2xl"
                      style={{ color: categoryMeta[word.category].color }}
                    >
                      {categoryMeta[word.category].icon}
                    </span>
                  ))}
                </div>

                {/* 中间区域 - 诗句居中 */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    {isAILoading || isImageLoading ? (
                      <motion.div
                        className="flex flex-col items-center gap-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="w-12 h-12 border-4 border-[#67e8f9] border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        <p className="text-[#94a3b8] text-sm">
                          {isAILoading && isImageLoading 
                            ? 'AI正在创作诗句和背景...' 
                            : isAILoading 
                              ? 'AI正在创作诗句...' 
                              : '正在生成背景...'}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.p
                        className="text-3xl font-bold leading-relaxed tracking-wider"
                        style={{
                          color: '#f8fafc',
                          textShadow: '0 0 30px rgba(255,255,255,0.3)',
                          fontFamily: "'Noto Serif SC', serif",
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {verse}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* 使用的词 - 放在底部 */}
                <div className="flex flex-col items-center gap-4 pb-8">
                  <div className="flex gap-3">
                    {words.map((word, i) => (
                      <motion.span
                        key={i}
                        className="px-3 py-1.5 rounded-full text-sm"
                        style={{
                          color: categoryMeta[word.category].color,
                          background: `${categoryMeta[word.category].color}20`,
                          border: `1px solid ${categoryMeta[word.category].color}40`,
                          display: 'inline-block',
                          lineHeight: 1,
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        {word.text}
                      </motion.span>
                    ))}
                  </div>

                  {/* 底部信息 */}
                  <p className="text-[#64748b] text-xs tracking-widest">
                    词语瀑布 · {currentDate}
                  </p>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap justify-center gap-3">
              <motion.button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4" />
                重新开始
              </motion.button>
              
              <motion.button
                onClick={generateAIVerse}
                disabled={isAILoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors text-sm disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-4 h-4" />
                {isAILoading ? 'AI创作中...' : '重新生成'}
              </motion.button>
              
              <motion.button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 className="w-4 h-4" />
                分享
              </motion.button>
              
              <motion.button
                onClick={handleExport}
                disabled={isGenerating}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#67e8f9] to-[#c084fc] text-[#0f172a] font-bold transition-all disabled:opacity-50 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4" />
                {isGenerating ? '生成中...' : '保存海报'}
              </motion.button>
            </div>

            {/* Toast提示 */}
            <AnimatePresence>
              {showToast && (
                <motion.div
                  className="absolute bottom-20 px-4 py-2 rounded-full bg-black/80 text-white text-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  已保存到相册
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PosterGenerator;
