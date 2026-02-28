import type { Word } from '../types';

/**
 * 使用 Picsum Photos 获取随机图片
 * 这是一个稳定的免费图片服务
 */
export function getRandomBackground(seed: string): string {
  // 使用种子确保相同的词语组合得到相同的图片
  const seedNum = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${seedNum}/1080/1920`;
}

/**
 * 根据词语类别获取主题图片
 */
export function getCategoryBackground(words: Word[]): string {
  const seed = words.map(w => w.text).join('-');
  
  // 使用 Lorem Picsum 的主题功能
  return `https://picsum.photos/seed/${seed}/1080/1920?blur=2`;
}

/**
 * 生成渐变背景 CSS
 */
export function generateGradientBackground(words: Word[]): string {
  const colors = words.map(w => {
    const colorMap: Record<string, string> = {
      'cosmic': '#67e8f9',
      'nature': '#86efac',
      'body': '#fca5a5',
      'artifact': '#fbbf24',
      'abstract': '#c084fc',
      'time': '#94a3b8',
    };
    return colorMap[w.category] || '#67e8f9';
  });
  
  return `linear-gradient(135deg, ${colors[0]}20 0%, ${colors[1]}20 50%, ${colors[2]}20 100%)`;
}

/**
 * 主函数：获取背景图
 * 优先使用免费图片服务
 */
export async function getBackgroundImage(words: Word[], verse: string): Promise<string> {
  try {
    // 使用 Picsum Photos 获取随机图片
    const seed = words.map(w => w.text).join('-') + verse.slice(0, 10);
    const imageUrl = getRandomBackground(seed);
    
    // 预加载验证
    const img = new Image();
    img.src = imageUrl;
    
    return imageUrl;
  } catch (error) {
    console.error('Failed to get background image:', error);
    return '';
  }
}
