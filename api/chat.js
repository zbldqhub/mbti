// Vercel Serverless Function：代理 Kimi API，避免前端暴露 Key

// 长文生成（如紫微 AI 解读）需要更长执行时间，Hobby 计划上限 60s
export const maxDuration = 60;

const ALLOWED_MODELS = new Set([
  'kimi-k3',
  'moonshot-v1-8k',
  'moonshot-v1-32k',
]);

const DEFAULT_MODEL = process.env.KIMI_MODEL || 'kimi-k3';
const API_KEY = process.env.KIMI_API_KEY;

// 紫微解读限流：每 IP 每日 3 次（实例内存计数，best-effort）
const ZIWEI_DAILY_USES = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!API_KEY) {
    console.error('KIMI_API_KEY is not set');
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

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    res.status(400).json({ error: 'messages must be a non-empty array' });
    return;
  }

  const requestedModel = body.model || DEFAULT_MODEL;
  if (!ALLOWED_MODELS.has(requestedModel)) {
    res.status(400).json({ error: 'Model not allowed' });
    return;
  }

  const maxTokens = Math.min(
    typeof body.max_tokens === 'number' && body.max_tokens > 0 ? body.max_tokens : 100,
    8000
  );

  const temperature =
    typeof body.temperature === 'number' && body.temperature >= 0 && body.temperature <= 2
      ? body.temperature
      : 0.8;

  // 紫微解读：轻量限流（每 IP 每日 3 次，内存计数，实例级 best-effort，防连点与脚本刷）
  if (body.scope === 'ziwei') {
    const ip = String(req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
    const day = new Date().toISOString().slice(0, 10);
    const key = `${ip}:${day}`;
    const n = (ZIWEI_DAILY_USES.get(key) || 0) + 1;
    ZIWEI_DAILY_USES.set(key, n);
    // 防内存膨胀：超过一万条清空（约一天量）
    if (ZIWEI_DAILY_USES.size > 10000) ZIWEI_DAILY_USES.clear();
    if (n > 3) {
      res.status(429).json({ error: 'RATE_LIMITED' });
      return;
    }
  }

  try {
    // Kimi K3 参数差异：
    // - 始终开启思考模式，用 reasoning_effort=low 降低推理开销（生成类任务不需要深度推理）
    // - temperature 固定为 1.0，不能显式传入
    // - 用 max_completion_tokens 代替 max_tokens，且思考 token 也计入其中，需留推理余量
    const isK3 = requestedModel === 'kimi-k3';
    const payload = isK3
      ? {
          model: requestedModel,
          messages: body.messages,
          reasoning_effort: 'low',
          max_completion_tokens: maxTokens + 1000,
        }
      : {
          model: requestedModel,
          messages: body.messages,
          temperature,
          max_tokens: maxTokens,
        };

    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Kimi proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
