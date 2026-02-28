import type { Word } from '../types';

// 讯飞星火图像生成 API 配置
const XFYUN_API_URL = 'https://spark-api.cn-huabei-1.xf-yun.com/v2.1/tti';
const APPID = '2db99d2b';
const API_SECRET = 'OWU5NTliMzg2ZGQ5ZmNhYTdhYmZkZmIw';
const API_KEY = 'eaeca14d100866585fbc2607f2fd372e';

/**
 * 使用 Web Crypto API 进行 HMAC-SHA256 签名
 */
async function hmacSha256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  
  // 转换为 Base64
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 生成讯飞 API 的鉴权 URL
 */
async function getAuthorizationUrl(): Promise<string> {
  const host = 'spark-api.cn-huabei-1.xf-yun.com';
  const path = '/v2.1/tti';
  const date = new Date().toUTCString();
  
  // 构建签名字符串
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  
  // 使用 HMAC-SHA256 签名
  const signature = await hmacSha256(signatureOrigin, API_SECRET);
  
  // 构建 authorization
  const authorizationOrigin = `api_key="${API_KEY}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);
  
  // 构建完整 URL
  return `${XFYUN_API_URL}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
}

/**
 * 使用讯飞星火生成图像
 * @param prompt 图像描述
 * @returns 生成的图像 Base64 数据
 */
export async function generateImageWithXfyun(prompt: string): Promise<string> {
  const url = await getAuthorizationUrl();
  
  const requestBody = {
    header: {
      app_id: APPID,
      uid: 'user_' + Date.now(),
    },
    parameter: {
      chat: {
        domain: 'general',
        width: 1080,
        height: 1920,
      }
    },
    payload: {
      message: {
        text: [
          {
            role: 'user',
            content: prompt,
          }
        ]
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // 解析返回的图像数据
    if (data.payload && data.payload.choices && data.payload.choices.text) {
      const imageContent = data.payload.choices.text[0]?.content;
      if (imageContent) {
        // 讯飞返回的是 Base64 编码的图像
        return `data:image/jpeg;base64,${imageContent}`;
      }
    }
    
    throw new Error('No image data in response');
  } catch (error) {
    console.error('Xfyun image generation failed:', error);
    throw error;
  }
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
