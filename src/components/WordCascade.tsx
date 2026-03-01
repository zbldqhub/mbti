import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import type { Word, FallingWord, Particle } from '../types';
import { categoryMeta } from '../hooks/useWords';
import { generateSingleWord } from '../services/wordGenerationService';

interface WordCascadeProps {
  words: Word[];
  maxWords?: number;
  spawnInterval?: number;
  onWordCollect: (word: Word, startX: number, startY: number) => void;
  collectedWords: Word[];
  isCollectionFull?: boolean;
}

// 使用 CSS 动画代替 framer-motion
const ParticleEffect: React.FC<{ particles: Particle[]; onComplete: () => void }> = memo(({ particles, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full pointer-events-none particle-effect"
          style={{
            backgroundColor: particle.color,
            boxShadow: `0 0 10px ${particle.color}`,
            left: particle.x,
            top: particle.y,
            '--vx': particle.vx * 80,
            '--vy': particle.vy * 80,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
});

// 单个下落词语组件 - 使用纯 CSS 变换
const FallingWordItem: React.FC<{
  word: FallingWord;
  onCollect: (word: FallingWord) => void;
  isCollecting: boolean;
}> = memo(({ word, onCollect, isCollecting }) => {
  const meta = categoryMeta[word.category];
  const elementRef = useRef<HTMLDivElement>(null);
  const isCollectedRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || isCollecting || isCollectedRef.current) return;

    const handleMouseDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isCollectedRef.current) return;
      isCollectedRef.current = true;
      
      onCollect(word);
    };

    element.addEventListener('mousedown', handleMouseDown as EventListener, true);
    element.addEventListener('touchstart', handleMouseDown as EventListener, { passive: false, capture: true });
    
    return () => {
      element.removeEventListener('mousedown', handleMouseDown as EventListener, true);
      element.removeEventListener('touchstart', handleMouseDown as EventListener, { capture: true });
    };
  }, [word, onCollect, isCollecting]);

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-pointer select-none whitespace-nowrap pointer-events-auto falling-word ${isCollecting ? 'collecting' : ''}`}
      style={{
        left: word.x,
        top: word.y,
        color: meta.color,
        textShadow: meta.glow,
        transform: `rotate(${word.rotation}deg)`,
      }}
    >
      {word.text}
    </div>
  );
});

// 运动模式类型
type MovementMode = 'fall' | 'diagonal' | 'bounce' | 'float' | 'spiral';

export const WordCascade: React.FC<WordCascadeProps> = ({
  words,
  maxWords = 20, // 减少最大词语数量
  spawnInterval = 600, // 增加生成间隔
  onWordCollect,
  collectedWords,
  isCollectionFull,
}) => {
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [particles, setParticles] = useState<{ id: string; particles: Particle[]; x: number; y: number }[]>([]);
  const [collectingIds, setCollectingIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const wordIdCounter = useRef(0);
  const lastSpawnTime = useRef(0);

  // 生成随机运动模式
  const getRandomMovementMode = (): MovementMode => {
    const modes: MovementMode[] = ['fall', 'diagonal', 'bounce', 'float', 'spiral'];
    return modes[Math.floor(Math.random() * modes.length)];
  };

  // 生成随机词语
  const spawnWord = useCallback(() => {
    const wordSource = words.length > 0 ? words : [generateSingleWord()];
    const randomWord = wordSource[Math.floor(Math.random() * wordSource.length)];
    
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    
    const mode = getRandomMovementMode();
    const x = Math.random() * (containerWidth - 100) + 50;
    const y = -60;
    const rotation = (Math.random() - 0.5) * 30;
    
    let vx = 0, vy = 0;
    switch (mode) {
      case 'fall':
        vx = (Math.random() - 0.5) * 0.5;
        vy = 2 + Math.random() * 2;
        break;
      case 'diagonal':
        vx = (Math.random() - 0.5) * 3;
        vy = 1.5 + Math.random() * 1.5;
        break;
      case 'bounce':
        vx = (Math.random() - 0.5) * 2;
        vy = 3 + Math.random() * 2;
        break;
      case 'float':
        vx = (Math.random() - 0.5) * 1;
        vy = 0.5 + Math.random() * 0.5;
        break;
      case 'spiral':
        vx = 0;
        vy = 1 + Math.random();
        break;
    }
    
    return {
      ...randomWord,
      x,
      y,
      rotation,
      speed: 1,
      vx,
      vy,
      mode,
      uniqueId: `falling_${wordIdCounter.current++}`,
      rotationSpeed: (Math.random() - 0.5) * 2,
      spiralAngle: 0,
    };
  }, [words]);

  // 创建粒子爆炸效果
  const createParticles = useCallback((x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    const particleCount = 6;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 1 + Math.random() * 2;
      newParticles.push({
        id: `p_${Date.now()}_${i}`,
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color,
        life: 1,
      });
    }
    
    const effectId = `effect_${Date.now()}`;
    setParticles(prev => [...prev, { id: effectId, particles: newParticles, x, y }]);
  }, []);

  // 收集词语
  const handleCollect = useCallback((word: FallingWord) => {
    if (isCollectionFull) return;
    if (collectingIds.has(word.uniqueId)) return;
    
    setCollectingIds(prev => new Set(prev).add(word.uniqueId));
    
    const meta = categoryMeta[word.category];
    createParticles(word.x, word.y, meta.color);
    
    setTimeout(() => {
      setFallingWords(prev => prev.filter(w => w.uniqueId !== word.uniqueId));
      setCollectingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(word.uniqueId);
        return newSet;
      });
    }, 100);
    
    onWordCollect(word, word.x, word.y);
  }, [createParticles, onWordCollect, collectingIds, isCollectionFull]);

  // 动画循环 - 使用 requestAnimationFrame 但降低频率
  useEffect(() => {
    let lastTime = 0;
    const targetFPS = 30; // 降低帧率到 30fps
    const frameInterval = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      // 控制帧率
      if (timestamp - lastTime < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTime = timestamp;

      // 生成新词
      if (timestamp - lastSpawnTime.current > spawnInterval) {
        setFallingWords(prev => {
          if (prev.length < maxWords) {
            const newWord = spawnWord();
            if (newWord) {
              lastSpawnTime.current = timestamp;
              return [...prev, newWord];
            }
          }
          return prev;
        });
      }

      // 更新词语位置
      setFallingWords(prev => {
        const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
        const containerHeight = containerRef.current?.clientHeight || window.innerHeight;
        
        return prev.map(word => {
          let newX = word.x;
          let newY = word.y;
          let newVx = word.vx;
          let newVy = word.vy;
          let newRotation = word.rotation;
          let newSpiralAngle = word.spiralAngle || 0;

          switch (word.mode) {
            case 'fall':
              newX += word.vx;
              newY += word.vy;
              newVx *= 0.995;
              newRotation += word.rotationSpeed || 0;
              break;

            case 'diagonal':
              newX += word.vx;
              newY += word.vy;
              newRotation += (word.rotationSpeed || 0) * 0.5;
              break;

            case 'bounce':
              newX += word.vx;
              newY += word.vy;
              
              if (newX <= 20 || newX >= containerWidth - 20) {
                newVx = -newVx * 0.8;
                newX = Math.max(20, Math.min(containerWidth - 20, newX));
              }
              
              if (newY >= containerHeight - 50) {
                newVy = -newVy * 0.7;
                newY = containerHeight - 50;
              }
              
              newVy += 0.1;
              newRotation += word.rotationSpeed || 0;
              break;

            case 'float':
              newX += Math.sin(timestamp * 0.001 + word.uniqueId.charCodeAt(0)) * 0.5;
              newY += word.vy;
              newRotation = Math.sin(timestamp * 0.002) * 10;
              break;

            case 'spiral':
              newSpiralAngle += 0.05;
              newX += Math.cos(newSpiralAngle) * 2;
              newY += word.vy;
              newRotation = newSpiralAngle * 30;
              break;
          }

          return {
            ...word,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            rotation: newRotation,
            spiralAngle: newSpiralAngle,
          };
        }).filter(word => word.y < containerHeight + 100 && word.y > -200);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [spawnInterval, maxWords, spawnWord]);

  // 清理粒子效果
  const removeParticles = useCallback((id: string) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  const collectedIds = new Set(collectedWords.map(w => w.id));

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
    >
      {fallingWords
        .filter(word => !collectedIds.has(word.id))
        .map(word => (
          <FallingWordItem
            key={word.uniqueId}
            word={word}
            onCollect={handleCollect}
            isCollecting={collectingIds.has(word.uniqueId)}
          />
        ))}
      
      {particles.map(({ id, particles: pList }) => (
        <ParticleEffect
          key={id}
          particles={pList}
          onComplete={() => removeParticles(id)}
        />
      ))}
    </div>
  );
};

export default WordCascade;
