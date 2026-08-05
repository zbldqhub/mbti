// Vercel Serverless Function：代理讯飞星火图像生成 API，避免前端暴露 APPID/Secret/Key

import { createHmac } from 'crypto';

const XFYUN_API_URL = 'https://spark-api.cn-huabei-1.xf-yun.com/v2.1/tti';
const HOST = 'spark-api.cn-huabei-1.xf-yun.com';
const PATH = '/v2.1/tti';

function base64Encode(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}

function hmacSha256(message, secret) {
  return createHmac('sha256', secret).update(message).digest('base64');
}

function buildAuthUrl(appId, apiKey, apiSecret) {
  const date = new Date().toUTCString();
  const signatureOrigin = `host: ${HOST}\ndate: ${date}\nGET ${PATH} HTTP/1.1`;
  const signature = hmacSha256(signatureOrigin, apiSecret);
  const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = base64Encode(authorizationOrigin);
  return `${XFYUN_API_URL}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${HOST}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { XFYUN_APPID, XFYUN_API_SECRET, XFYUN_API_KEY } = process.env;
  if (!XFYUN_APPID || !XFYUN_API_SECRET || !XFYUN_API_KEY) {
    console.error('Xfyun credentials are not set');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    res.status(400).json({ error: 'prompt is required' });
    return;
  }

  try {
    const url = buildAuthUrl(XFYUN_APPID, XFYUN_API_KEY, XFYUN_API_SECRET);

    const requestBody = {
      header: {
        app_id: XFYUN_APPID,
        uid: 'user_' + Date.now(),
      },
      parameter: {
        chat: {
          domain: 'general',
          width: 1080,
          height: 1920,
        },
      },
      payload: {
        message: {
          text: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json().catch(() => ({}));

    // 如果讯飞直接返回了图片 base64，包装成 data URI 返回给前端
    const imageContent = data?.payload?.choices?.text?.[0]?.content;
    if (imageContent) {
      data.image = `data:image/jpeg;base64,${imageContent}`;
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error('Xfyun proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
