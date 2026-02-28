import { useState, useEffect, useCallback } from 'react';
import type { Word, WordCategory, CategoryMeta } from '../types';

// 类别元数据
export const categoryMeta: Record<WordCategory, CategoryMeta> = {
  cosmic: {
    label: '天象',
    color: '#67e8f9',
    glow: '0 0 20px #67e8f9, 0 0 40px rgba(103, 232, 249, 0.4)',
    icon: '✦'
  },
  nature: {
    label: '自然',
    color: '#86efac',
    glow: '0 0 20px #86efac, 0 0 40px rgba(134, 239, 172, 0.4)',
    icon: '❋'
  },
  body: {
    label: '身体',
    color: '#fca5a5',
    glow: '0 0 20px #fca5a5, 0 0 40px rgba(252, 165, 165, 0.4)',
    icon: '◉'
  },
  artifact: {
    label: '人造',
    color: '#fbbf24',
    glow: '0 0 20px #fbbf24, 0 0 40px rgba(251, 191, 36, 0.4)',
    icon: '✷'
  },
  abstract: {
    label: '抽象',
    color: '#c084fc',
    glow: '0 0 20px #c084fc, 0 0 40px rgba(192, 132, 252, 0.4)',
    icon: '◇'
  },
  time: {
    label: '时空',
    color: '#94a3b8',
    glow: '0 0 20px #94a3b8, 0 0 40px rgba(148, 163, 184, 0.4)',
    icon: '◐'
  }
};

// 诗意模板库 - 按词性组合分类
const poeticTemplates: Record<string, string[]> = {
  // 名词 + 形容词 + 动词
  'noun_adj_verb': [
    '{{word1}}在{{word2}}中{{word3}}',
    '{{word1}}，{{word2}}地{{word3}}',
    '当{{word1}}变得{{word2}}，开始{{word3}}',
    '{{word1}}是{{word2}}的，正在{{word3}}',
    '所有{{word1}}都{{word2}}地{{word3}}',
  ],
  // 名词 + 名词 + 动词
  'noun_noun_verb': [
    '{{word1}}与{{word2}}一同{{word3}}',
    '{{word1}}在{{word2}}中{{word3}}',
    '当{{word1}}遇见{{word2}}，开始{{word3}}',
    '{{word1}}和{{word2}}正在{{word3}}',
    '从{{word1}}到{{word2}}，不断{{word3}}',
  ],
  // 名词 + 名词 + 形容词
  'noun_noun_adj': [
    '{{word1}}的{{word2}}是{{word3}}的',
    '{{word1}}与{{word2}}，如此{{word3}}',
    '当{{word1}}变成{{word2}}，一切{{word3}}',
    '{{word1}}里的{{word2}}，永远{{word3}}',
  ],
  // 形容词 + 名词 + 动词
  'adj_noun_verb': [
    '{{word1}}的{{word2}}正在{{word3}}',
    '这{{word1}}的{{word2}}开始{{word3}}',
    '{{word1}}的{{word2}}，终将{{word3}}',
    '当{{word1}}的{{word2}}{{word3}}',
  ],
  // 形容词 + 名词 + 名词
  'adj_noun_noun': [
    '{{word1}}的{{word2}}，{{word3}}的梦',
    '在{{word1}}的{{word2}}里寻找{{word3}}',
    '{{word1}}的{{word2}}化作{{word3}}',
  ],
  // 动词 + 名词 + 名词
  'verb_noun_noun': [
    '{{word1}}了{{word2}}与{{word3}}',
    '去{{word1}}那{{word2}}和{{word3}}',
    '{{word1}}，为了{{word2}}与{{word3}}',
  ],
  // 通用诗意模板
  'universal': [
    '{{word1}}、{{word2}}与{{word3}}',
    '当{{word1}}遇见{{word2}}，{{word3}}',
    '{{word1}}是{{word2}}的{{word3}}',
    '所有{{word1}}终将{{word2}}成{{word3}}',
    '在{{word1}}与{{word2}}之间，{{word3}}',
    '{{word1}}从{{word2}}中{{word3}}',
    '如果{{word1}}是{{word2}}，那么{{word3}}',
    '{{word1}}，{{word2}}，以及{{word3}}',
    '关于{{word1}}的{{word2}}，都在{{word3}}',
    '{{word1}}在{{word2}}里{{word3}}',
    '把{{word1}}放进{{word2}}，让{{word3}}',
    '{{word1}}的尽头是{{word2}}，也是{{word3}}',
  ]
};

// 连接词映射
const connectors: Record<string, string[]> = {
  'cosmic': ['在星空中', '从银河', '穿越', '在极光里', '随着潮汐'],
  'nature': ['在风中', '从山谷', '穿越森林', '在雨中', '随着季节'],
  'body': ['在指尖', '从心跳', '透过呼吸', '在梦境里', '随着血液'],
  'artifact': ['在书页间', '从钟声', '透过玻璃', '在灯光下', '随着旋律'],
  'abstract': ['在时间里', '从记忆', '穿越虚空', '在沉默中', '随着思绪'],
  'time': ['在黎明前', '从过去', '穿越未来', '在瞬间', '随着时光'],
};

// 智能选择模板
export function selectTemplate(words: Word[]): string {
  const [w1, w2, w3] = words;
  const typeKey = `${w1.type}_${w2.type}_${w3.type}`;
  
  // 尝试匹配特定词性组合
  if (poeticTemplates[typeKey]) {
    const templates = poeticTemplates[typeKey];
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  // 尝试两两匹配
  if (w1.type === 'noun' && w2.type === 'noun') {
    return poeticTemplates['noun_noun_verb'][0];
  }
  if (w1.type === 'adj' && w2.type === 'noun') {
    return poeticTemplates['adj_noun_verb'][0];
  }
  if (w1.type === 'noun' && w3.type === 'verb') {
    return poeticTemplates['noun_adj_verb'][0];
  }
  
  // 默认使用通用模板
  const universal = poeticTemplates['universal'];
  return universal[Math.floor(Math.random() * universal.length)];
}

// 生成诗句
export function generateVerse(words: Word[]): string {
  if (words.length !== 3) return '';
  
  const template = selectTemplate(words);
  let verse = template
    .replace('{{word1}}', words[0].text)
    .replace('{{word2}}', words[1].text)
    .replace('{{word3}}', words[2].text);
  
  // 添加诗意修饰
  const connector1 = connectors[words[0].category]?.[Math.floor(Math.random() * 5)] || '';
  
  // 50% 概率添加前缀修饰
  if (Math.random() > 0.5 && connector1) {
    verse = connector1 + '，' + verse;
  }
  
  return verse;
}

export function useWords() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWords = async () => {
      try {
        const response = await fetch('/wordfall/words.json');
        if (!response.ok) {
          throw new Error('Failed to load words');
        }
        const data = await response.json();
        setWords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadWords();
  }, []);

  // 随机获取一个词语
  const getRandomWord = useCallback((): Word | null => {
    if (words.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
  }, [words]);

  // 根据权重随机获取词语
  const getWeightedRandomWord = useCallback((): Word | null => {
    if (words.length === 0) return null;
    
    const totalWeight = words.reduce((sum, w) => sum + (w.weight || 1), 0);
    let random = Math.random() * totalWeight;
    
    for (const word of words) {
      random -= (word.weight || 1);
      if (random <= 0) {
        return word;
      }
    }
    
    return words[words.length - 1];
  }, [words]);

  return {
    words,
    loading,
    error,
    getRandomWord,
    getWeightedRandomWord,
    generateVerse
  };
}
