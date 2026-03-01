import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import type { Word } from './types';
import { useWords } from './hooks/useWords';
import WordCascade from './components/WordCascade';
import CollectionBasket from './components/CollectionBasket';
import PosterGenerator from './components/PosterGenerator';
import BackgroundEffects from './components/BackgroundEffects';
import { Sparkles, BookOpen, Info } from 'lucide-react';

// 飞行动画组件
const FlyingWord: React.FC<{
  word: Word;
  startX: number;
  startY: number;
  onComplete: () => void;
}> = ({ word, startX, startY, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed pointer-events-none z-50 text-2xl font-bold"
      style={{
        color: '#fff',
        textShadow: '0 0 20px currentColor',
        left: startX,
        top: startY,
      }}
      initial={{ opacity: 1, scale: 1 }}
      animate={{
        opacity: 0,
        scale: 0.5,
        x: window.innerWidth - startX - 100,
        y: 80 - startY,
      }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      {word.text}
    </motion.div>
  );
};

// 引导弹窗
const GuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 glass rounded-3xl p-8 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[#67e8f9] via-[#c084fc] to-[#fbbf24] bg-clip-text text-transparent">
              欢迎来到词语瀑布
            </h2>
            
            <div className="space-y-4 text-[#cbd5e1]">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✨</span>
                <p>从空中飘落的词语中，<span className="text-[#67e8f9]">点击捕获</span>你喜欢的词</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <p>收集<span className="text-[#fbbf24]">3个词</span>后，AI会为你创作独特的诗句和背景图</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🌊</span>
                <p>词语会<span className="text-[#86efac]">自动飘落</span>，有垂直、斜飞、弹跳、漂浮、螺旋等多种运动模式</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎨</span>
                <p>不同类别的词语有<span className="text-[#c084fc]">不同颜色</span>：天象青、自然绿、身体红、人造黄、抽象紫、时空灰</p>
              </div>
            </div>

            <motion.button
              onClick={onClose}
              className="w-full mt-8 py-3 rounded-xl bg-gradient-to-r from-[#67e8f9] to-[#c084fc] text-[#0f172a] font-bold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              开始游戏
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function App() {
  const { words, loading, error } = useWords();
  const [collectedWords, setCollectedWords] = useState<Word[]>([]);
  const [flyingWords, setFlyingWords] = useState<{ id: string; word: Word; x: number; y: number }[]>([]);
  const [showPoster, setShowPoster] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [showAbout, setShowAbout] = useState(false);

  // 处理词语收集
  const handleWordCollect = useCallback((word: Word, x: number, y: number) => {
    if (collectedWords.length >= 3) return;
    if (collectedWords.some(w => w.id === word.id)) return;

    // 添加飞行动画
    const flyingId = `flying_${Date.now()}`;
    setFlyingWords(prev => [...prev, { id: flyingId, word, x, y }]);

    // 延迟添加到收集篮
    setTimeout(() => {
      setCollectedWords(prev => {
        if (prev.length >= 3) return prev;
        return [...prev, word];
      });
    }, 400);
  }, [collectedWords]);

  // 移除词语
  const handleRemoveWord = useCallback((index: number) => {
    setCollectedWords(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 生成海报
  const handleGenerate = useCallback(() => {
    if (collectedWords.length === 3) {
      setShowPoster(true);
    }
  }, [collectedWords]);

  // 重置游戏
  const handleReset = useCallback(() => {
    setCollectedWords([]);
    setShowPoster(false);
  }, []);

  // 移除飞行动画
  const removeFlyingWord = useCallback((id: string) => {
    setFlyingWords(prev => prev.filter(fw => fw.id !== id));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-gradient">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-[#67e8f9] border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-[#94a3b8]">加载词库中...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-gradient">
        <div className="text-center">
          <p className="text-[#fca5a5] mb-4">加载失败: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-[#1e293b] text-white hover:bg-[#334155] transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      {/* 炫酷背景效果 */}
      <BackgroundEffects />
      {/* 顶部导航 - 只让按钮区域可点击 */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* 标题区域 - 不可点击，词语可以穿过 */}
          <div className="flex items-center gap-3 pointer-events-none">
            <Sparkles className="w-6 h-6 text-[#67e8f9]" />
            <h1 className="text-xl font-bold text-white">
              词语<span className="text-[#c084fc]">瀑布</span>
            </h1>
          </div>
          
          {/* 按钮区域 - 只有按钮本身可点击 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors pointer-events-auto"
              title="游戏说明"
            >
              <BookOpen className="w-5 h-5 text-[#94a3b8]" />
            </button>
            <button
              onClick={() => setShowAbout(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors pointer-events-auto"
              title="关于"
            >
              <Info className="w-5 h-5 text-[#94a3b8]" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* 词语瀑布区域 */}
      <main className="absolute inset-0 pt-20">
        <WordCascade
          words={words}
          onWordCollect={handleWordCollect}
          collectedWords={collectedWords}
          isCollectionFull={collectedWords.length >= 3}
        />
      </main>

      {/* 收集篮 */}
      <CollectionBasket
        collectedWords={collectedWords}
        onRemove={handleRemoveWord}
        onGenerate={handleGenerate}
      />

      {/* 飞行动画 */}
      {flyingWords.map(({ id, word, x, y }) => (
        <FlyingWord
          key={id}
          word={word}
          startX={x}
          startY={y}
          onComplete={() => removeFlyingWord(id)}
        />
      ))}

      {/* 海报生成器 */}
      <PosterGenerator
        words={collectedWords}
        isOpen={showPoster}
        onClose={() => setShowPoster(false)}
        onReset={handleReset}
      />

      {/* 引导弹窗 */}
      <GuideModal isOpen={showGuide} onClose={() => setShowGuide(false)} />

      {/* 关于弹窗 */}
      <AnimatePresence>
        {showAbout && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowAbout(false)}
            />
            <motion.div
              className="relative z-10 glass rounded-3xl p-8 max-w-sm w-full text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-4xl mb-4">✨</div>
              <h2 className="text-xl font-bold mb-4 text-white">词语瀑布</h2>
              <p className="text-[#94a3b8] mb-6">
                一个创意交互式文字游戏<br />
                从飘落的词语中捕获灵感<br />
                组合生成独特的诗句海报
              </p>
              <div className="text-sm text-[#64748b]">
                <p>词库收录 1400+ 精选词汇</p>
                <p className="mt-2">涵盖天象、自然、身体、人造物、抽象、时空六大类别</p>
              </div>
              <motion.button
                onClick={() => setShowAbout(false)}
                className="w-full mt-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                关闭
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部提示 */}
      <motion.div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-[#64748b] text-sm">
          点击飘落的词语捕获 · 收集3个词AI生成诗句和背景图
        </p>
      </motion.div>
    </div>
  );
}

export default App;
