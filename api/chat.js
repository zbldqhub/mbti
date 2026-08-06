// Vercel Serverless Function：代理 Kimi API，避免前端暴露 Key

const ALLOWED_MODELS = new Set([
  'moonshot-v1-8k',
  'moonshot-v1-32k',
]);

const DEFAULT_MODEL = process.env.KIMI_MODEL || 'moonshot-v1-8k';
const API_KEY = process.env.KIMI_API_KEY;

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
    4000
  );

  const temperature =
    typeof body.temperature === 'number' && body.temperature >= 0 && body.temperature <= 2
      ? body.temperature
      : 0.8;

  try {
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: requestedModel,
        messages: body.messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Kimi proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
