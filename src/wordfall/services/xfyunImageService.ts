import type { Word } from '../types';

// 讯飞星火图像生成 API（通过 Vercel Function 代理，避免在前端暴露 APPID/Secret/Key）
const API_URL = '/api/xfyun-image';

/**
 * 使用讯飞星火生成图像
 * @param prompt 图像描述
 * @returns 生成的图像 Base64 数据
 */
export async function generateImageWithXfyun(prompt: string): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();

  // 后端已经把 Base64 图片内容包装成 data URI
  if (data.image) {
    return data.image;
  }

  // 兼容原始返回结构
  const imageContent = data?.payload?.choices?.text?.[0]?.content;
  if (imageContent) {
    return `data:image/jpeg;base64,${imageContent}`;
  }

  throw new Error('No image data in response');
}

/**
 * 根据诗句和词语生成背景图
 * @param verse 诗句
 * @param words 三个词语
 * @returns 图像 Base64 数据
 */
export async function generateBackgroundWithXfyun(verse: string, words: Word[]): Promise<string> {
  // 构建中文提示词
  const prompt = `请根据以下诗句创作一幅梦幻、诗意的背景图：

诗句："${verse}"
关键词：${words.map(w => w.text).join('、')}

要求：
1. 画面风格：梦幻、唯美、诗意
2. 色调：深蓝、紫色渐变，带有星光效果
3. 元素：可以包含星空、光晕、粒子、渐变等
4. 氛围：神秘、浪漫、富有想象力
5. 适合作为诗句海报的背景

请直接生成图像。`;

  return generateImageWithXfyun(prompt);
}
