import type { Word } from '../types';

// Kimi API 配置
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const API_KEY = 'sk-MdjyLzEcqxLyDv4haXgLK1d7gKlZnikeWrPIdf0DdCMJI3bJ';
const MODEL = 'moonshot-v1-8k';

// Pollinations AI 绘画 API (免费)
const IMAGE_API_URL = 'https://image.pollinations.ai/prompt';

// 备用：使用 Unsplash 搜索相关图片
const UNSPLASH_URL = 'https://source.unsplash.com';

/**
 * 使用 Kimi AI 生成诗句
 * @param words 三个词语
 * @returns 生成的诗句
 */
export async function generatePoemWithAI(words: Word[]): Promise<string> {
  if (words.length !== 3) {
    return '';
  }

  const [w1, w2, w3] = words;
  
  // 构建提示词
  const prompt = `请用这三个词创作一句富有诗意的现代诗短句（10-20字）："${w1.text}"、"${w2.text}"、"${w3.text}"。

要求：
1. 必须包含这三个词
2. 语言优美、有意境、有诗意
3. 可以调整词序，让句子更通顺
4. 直接输出诗句，不要解释
5. 不要加引号
6. 输出格式：直接输出诗句文本

示例：
输入："星空"、"温柔"、"流淌"
输出：温柔的星空下，时光静静流淌`;

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
        temperature: 0.8,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Kimi API error:', errorData);
      throw new Error(`Kimi API request failed: ${response.status}`);
    }

    const data = await response.json();
    const poem = data.choices?.[0]?.message?.content || '';
    
    // 清理输出
    return poem.trim().replace(/^["'"'"'"'"']|["'"'"'"'"']$/g, '');
  } catch (error) {
    console.error('AI generation failed:', error);
    // 失败时回退到本地生成
    return generateLocalPoem(words);
  }
}

/**
 * 本地生成诗句（作为备用）
 */
function generateLocalPoem(words: Word[]): string {
  const [w1, w2, w3] = words;
  
  // 根据词性选择更合适的模板
  const templates: Record<string, string[]> = {
    'noun_adj_verb': [
      `${w1.text}在${w2.text}中${w3.text}`,
      `${w1.text}，${w2.text}地${w3.text}`,
      `当${w1.text}变得${w2.text}，开始${w3.text}`,
    ],
    'noun_noun_verb': [
      `${w1.text}与${w2.text}一同${w3.text}`,
      `${w1.text}在${w2.text}中${w3.text}`,
      `当${w1.text}遇见${w2.text}，开始${w3.text}`,
    ],
    'adj_noun_verb': [
      `${w1.text}的${w2.text}正在${w3.text}`,
      `这${w1.text}的${w2.text}开始${w3.text}`,
      `${w1.text}的${w2.text}，终将${w3.text}`,
    ],
    'default': [
      `${w1.text}与${w2.text}，在${w3.text}中相遇`,
      `当${w1.text}遇见${w2.text}，${w3.text}成了诗`,
      `${w1.text}的尽头，${w2.text}正在${w3.text}`,
      `把${w1.text}放进${w2.text}，让${w3.text}生长`,
      `${w1.text}、${w2.text}、${w3.text}，时间的碎片`,
      `在${w1.text}里寻找${w2.text}，只为${w3.text}`,
      `${w1.text}是${w2.text}的${w3.text}，也是梦`,
      `所有${w1.text}终将${w2.text}成${w3.text}`,
    ]
  };
  
  const typeKey = `${w1.type}_${w2.type}_${w3.type}`;
  const availableTemplates = templates[typeKey] || templates['default'];
  
  return availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
}

/**
 * 根据诗句生成图像提示词
 * @param verse 诗句
 * @param words 三个词语
 * @returns 图像提示词
 */
export async function generateImagePrompt(verse: string, words: Word[]): Promise<string> {
  const prompt = `请根据这句诗生成一个AI绘画的英文提示词（prompt），用于生成符合诗意的背景图：

诗句："${verse}"
关键词：${words.map(w => w.text).join('、')}

要求：
1. 用英文描述
2. 描述一个梦幻、诗意的场景
3. 包含星空、光影、氛围感
4. 风格：digital art, dreamy atmosphere, soft lighting, ethereal
5. 直接输出提示词，不要解释
6. 50-100个单词

示例输出：
Dreamy night sky with floating stars and soft aurora lights, ethereal atmosphere, digital art style, gentle gradients of blue and purple, mysterious and poetic mood, soft glowing particles, cinematic lighting`;

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
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error('Kimi API request failed');
    }

    const data = await response.json();
    const imagePrompt = data.choices?.[0]?.message?.content || '';
    
    return imagePrompt.trim();
  } catch (error) {
    console.error('Image prompt generation failed:', error);
    // 返回默认提示词
    return `Dreamy ethereal scene with ${words.map(w => w.text).join(', ')}, soft glowing lights, digital art style, blue and purple gradient, poetic atmosphere, floating particles, cinematic lighting`;
  }
}

/**
 * 生成背景图 URL
 * @param verse 诗句
 * @param words 三个词语
 * @returns 图片 URL
 */
export async function generateBackgroundImage(verse: string, words: Word[]): Promise<string> {
  try {
    // 先获取图像提示词
    const imagePrompt = await generateImagePrompt(verse, words);
    console.log('Generated image prompt:', imagePrompt);
    
    // 使用 Pollinations AI 生成图片
    const encodedPrompt = encodeURIComponent(imagePrompt);
    const seed = Date.now();
    
    // 构建图片 URL
    const imageUrl = `${IMAGE_API_URL}/${encodedPrompt}?width=1080&height=1920&seed=${seed}&nologo=true`;
    
    console.log('Generated image URL:', imageUrl);
    
    // 返回 URL
    return imageUrl;
  } catch (error) {
    console.error('Background image generation failed:', error);
    return '';
  }
}

/**
 * 获取 Unsplash 随机图片作为备用
 * @param keywords 关键词
 * @returns 图片 URL
 */
export function getUnsplashBackground(keywords: string[]): string {
  const searchTerms = keywords.join(',');
  return `${UNSPLASH_URL}/1080x1920/?${encodeURIComponent(searchTerms)}`;
}

/**
 * 批量生成多个诗句选项
 */
export async function generatePoemOptions(words: Word[], count: number = 3): Promise<string[]> {
  const options: string[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const poem = await generatePoemWithAI(words);
      if (poem && !options.includes(poem)) {
        options.push(poem);
      }
    } catch (error) {
      console.error('Generation error:', error);
    }
  }
  
  // 如果 AI 生成失败，使用本地模板
  if (options.length === 0) {
    options.push(generateLocalPoem(words));
  }
  
  return options;
}
