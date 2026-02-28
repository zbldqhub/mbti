import type { Word } from '../types';

// Kimi API 配置
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const API_KEY = 'sk-MdjyLzEcqxLyDv4haXgLK1d7gKlZnikeWrPIdf0DdCMJI3bJ';
const MODEL = 'moonshot-v1-8k';

// 词语类别
const categories = ['cosmic', 'nature', 'body', 'artifact', 'abstract', 'time'] as const;
const types = ['noun', 'adj', 'verb'] as const;

// 本地备用词库（当 AI 不可用时使用）
const fallbackWords: Record<string, string[]> = {
  cosmic: ['星群', '银河', '极光', '黑洞', '星云', '彗星', '月食', '日冕', '星尘', '宇宙'],
  nature: ['森林', '海洋', '山脉', '河流', '花朵', '落叶', '雪花', '雷电', '彩虹', '晨露'],
  body: ['心跳', '呼吸', '指尖', '眼眸', '灵魂', '梦境', '思绪', '血液', '骨骼', '肌肤'],
  artifact: ['钟楼', '书页', '琴弦', '画笔', '齿轮', '镜子', '钥匙', '信封', '灯塔', '桥梁'],
  abstract: ['时间', '记忆', '永恒', '虚无', '希望', '孤独', '自由', '命运', '真理', '幻想'],
  time: ['黎明', '黄昏', '午夜', '瞬间', '永恒', '往昔', '未来', '此刻', '季节', '年代'],
};

/**
 * 使用 Kimi AI 生成随机词语
 * @param count 生成数量
 * @returns 生成的词语数组
 */
export async function generateWordsWithAI(count: number = 5): Promise<Word[]> {
  const prompt = `请生成${count}个富有诗意的词语，用于一个创意文字游戏。

要求：
1. 词语类型包括：名词、形容词、动词
2. 词语类别包括：天象、自然、身体、人造物、抽象、时间
3. 每个词语2-4个字
4. 词语要有文学性和意境
5. 输出格式为JSON数组

示例输出格式：
[
  {"text": "星群", "category": "cosmic", "type": "noun"},
  {"text": "温柔", "category": "abstract", "type": "adj"},
  {"text": "流淌", "category": "nature", "type": "verb"}
]

请直接输出JSON，不要其他解释。`;

  try {
    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.9,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // 解析 JSON
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const words = JSON.parse(jsonMatch[0]);
      return words.map((w: any, index: number) => ({
        id: `ai_${Date.now()}_${index}`,
        text: w.text,
        category: w.category,
        type: w.type,
        weight: 1,
      }));
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('AI word generation failed:', error);
    // 回退到本地生成
    return generateLocalWords(count);
  }
}

/**
 * 本地生成词语（备用）
 */
function generateLocalWords(count: number): Word[] {
  const words: Word[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const categoryWords = fallbackWords[category];
    const text = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    
    words.push({
      id: `local_${Date.now()}_${i}`,
      text,
      category,
      type,
      weight: 1,
    });
  }
  
  return words;
}

/**
 * 生成单个随机词语
 */
export function generateSingleWord(): Word {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  const categoryWords = fallbackWords[category];
  const text = categoryWords[Math.floor(Math.random() * categoryWords.length)];
  
  return {
    id: `word_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    text,
    category,
    type,
    weight: 1,
  };
}
