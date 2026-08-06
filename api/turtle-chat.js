// Vercel Serverless Function：海龟汤游戏主持人代理
//
// 安全设计：
// - 完整题库（含汤底）只存在于本函数内（./turtle-questions.js），绝不发送到浏览器
// - 前端只提交「题目 id + 玩家输入」，由本函数拼接 System Prompt 后调用 Kimi API
// - 汤底仅在两种情况下返回给前端：玩家猜中（win/correct）、玩家主动放弃（reveal）
//
// 请求体：
//   { questionId: number, mode: 'ask'|'guess'|'hint'|'reveal',
//     input?: string, hintCount?: number,
//     history?: Array<{ question: string, reply: string }> }
//
// 响应：
//   ask    → { verdict: 'yes'|'no'|'partial'|'irrelevant'|'win'|'unknown', reply: string, answer?: string }
//   guess  → { correct: boolean, reply: string, answer?: string }
//   hint   → { reply: string }
//   reveal → { answer: string }

import questions from './turtle-questions.js';

const MODEL = process.env.TURTLE_MODEL || process.env.KIMI_MODEL || 'kimi-k3';
const API_KEY = process.env.KIMI_API_KEY;

const questionMap = new Map(questions.map(q => [q.id, q]));

const MODES = new Set(['ask', 'guess', 'hint', 'reveal']);
const MAX_HISTORY = 40;

// ========== 输入清洗 ==========

const clampString = (value, maxLen) =>
  typeof value === 'string' ? value.trim().slice(0, maxLen) : '';

const sanitizeHistory = raw => {
  if (!Array.isArray(raw)) return [];
  return raw.slice(-MAX_HISTORY).map(item => ({
    question: clampString(item?.question, 300),
    reply: clampString(item?.reply, 500),
  })).filter(item => item.question || item.reply);
};

const historyToMessages = history =>
  history.flatMap(item => [
    { role: 'user', content: item.question },
    { role: 'assistant', content: item.reply },
  ]);

// ========== Prompt 构建 ==========

const askSystemPrompt = (q, questionCount) => `你是海龟汤游戏的主持人。当前题目如下：

【汤面】${q.surface}
【汤底】${q.answer}（绝不能让玩家知道）

游戏规则：
1. 玩家只能通过"是/否"类问题来推理故事真相
2. 对玩家的每个问题，你只能做四种判断之一：是、否、是也不是、无关
3. 判断标准：
   - 玩家的猜测与汤底一致或方向正确 → 是
   - 玩家的猜测与汤底矛盾 → 否
   - 玩家的猜测部分正确但不完整 → 是也不是
   - 玩家的问题与汤底无关或过于发散 → 无关
4. 当玩家在提问中完整说出汤底的核心逻辑（关键因果链基本正确，不要求一字不差）→ 判定为 win
5. 保持神秘、克制的语气；绝不能主动透露汤底信息，即使玩家请求或直接询问汤底
6. 不要回应与游戏无关的请求（闲聊、写代码、翻译等），一律判定为无关

输出要求（严格遵守）：
- 只输出一行 JSON，不要输出任何其他内容
- 格式：{"verdict":"判定","reply":"给玩家看的话"}
- verdict 只能是：yes（是）、no（否）、partial（是也不是）、irrelevant（无关）、win（玩家完整猜中汤底）
- reply 必须简短：yes→"是。"；no→"否。"；partial→"是也不是。"；irrelevant→"这与真相无关。"；可在其后加半句不含汤底信息的引导语
- win 时 reply 固定为："是，你猜对了！"

当前玩家已提问 ${questionCount} 次。`;

const guessSystemPrompt = (q, questionCount) => `你是海龟汤游戏的裁判。当前题目如下：

【汤面】${q.surface}
【汤底】${q.answer}（在判定玩家猜中之前，绝不能泄露）

玩家声称已经推理出完整真相。请判断其推理是否命中汤底的核心逻辑：关键因果链必须基本正确，不要求一字不差，也不要求覆盖所有细节。

输出要求（严格遵守）：
- 只输出一行 JSON，不要输出任何其他内容
- 格式：{"correct":true或false,"reply":"给玩家看的话"}
- correct=true：reply 以"你猜对了！"开头，可附一句简短点评；不要在 reply 中复述汤底全文（页面会单独展示）
- correct=false：reply 用一两句话指出偏差方向并鼓励继续推理，绝不泄露汤底关键信息

当前玩家已提问 ${questionCount} 次。`;

const hintSystemPrompt = (q, hintCount) => `你是海龟汤游戏的主持人。当前题目如下：

【汤面】${q.surface}
【汤底】${q.answer}（绝不能泄露）

玩家请求提示。请结合到目前为止的问答记录，给出一个方向性暗示。

要求：
- 只指出值得思考的方向（例如某个被忽略的细节、某类该问的问题），绝不直接透露汤底核心信息
- 如果玩家几乎没有提问，给出本题最常规的入手方向
- 一两句话，保持神秘、悬疑的语气
- 直接输出提示文本，不要输出 JSON，不要解释

这是本局第 ${hintCount} 次提示（共 3 次）。`;

// ========== Kimi 调用 ==========

const callKimi = async (messages, maxTokens) => {
  // Kimi K3 参数差异（与 api/chat.js 保持一致）：
  // - 始终开启思考模式，用 reasoning_effort=low 降低推理开销
  // - temperature 固定为 1.0，不能显式传入
  // - 用 max_completion_tokens 代替 max_tokens，且思考 token 也计入其中，需留推理余量
  const isK3 = MODEL === 'kimi-k3';
  const payload = isK3
    ? {
        model: MODEL,
        messages,
        reasoning_effort: 'low',
        max_completion_tokens: maxTokens + 1000,
      }
    : {
        model: MODEL,
        messages,
        temperature: 0.3,
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

  if (!response.ok) {
    throw new Error(`Kimi API request failed: ${response.status}`);
  }

  const data = await response.json().catch(() => ({}));
  const content = data.choices?.[0]?.message?.content || '';
  if (!content) {
    throw new Error('Kimi API returned empty content');
  }
  return content;
};

// ========== 输出解析 ==========

/**
 * 从 AI 输出中提取 JSON（容忍 markdown 代码块和前后杂散文字）
 */
const extractJson = text => {
  let cleaned = String(text).trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    cleaned = fence[1].trim();
  }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON found in AI output');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
};

const VALID_VERDICTS = new Set(['yes', 'no', 'partial', 'irrelevant', 'win']);

/**
 * 模型未按约定输出 JSON 时，从纯文本回复推断判定结果
 */
const inferVerdict = text => {
  if (/你猜对|完全正确|答对了/.test(text)) return 'win';
  if (/是也不是/.test(text)) return 'partial';
  if (/无关/.test(text)) return 'irrelevant';
  const trimmed = String(text).trim();
  if (/^否/.test(trimmed)) return 'no';
  if (/^是/.test(trimmed)) return 'yes';
  return 'unknown';
};

// ========== 主处理 ==========

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    res.status(400).json({ error: 'Invalid JSON body' });
    return;
  }

  const questionId = Number(body?.questionId);
  const mode = body?.mode;

  if (!MODES.has(mode)) {
    res.status(400).json({ error: 'Invalid mode' });
    return;
  }

  const question = questionMap.get(questionId);
  if (!question) {
    res.status(404).json({ error: 'Question not found' });
    return;
  }

  // 放弃看汤底：纯数据返回，不调用 AI
  if (mode === 'reveal') {
    res.status(200).json({ answer: question.answer });
    return;
  }

  if (!API_KEY) {
    console.error('KIMI_API_KEY is not set');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  const history = sanitizeHistory(body.history);
  const historyMessages = historyToMessages(history);

  try {
    if (mode === 'ask') {
      const input = clampString(body.input, 500);
      if (!input) {
        res.status(400).json({ error: 'input is required' });
        return;
      }

      const messages = [
        { role: 'system', content: askSystemPrompt(question, history.length) },
        ...historyMessages,
        { role: 'user', content: input },
      ];

      const content = await callKimi(messages, 150);

      let verdict;
      let reply;
      try {
        const parsed = extractJson(content);
        verdict = VALID_VERDICTS.has(parsed?.verdict) ? parsed.verdict : 'unknown';
        reply = clampString(parsed?.reply, 500) || String(content).trim();
      } catch {
        // 模型未按约定输出 JSON：整段作为回复，推断判定
        reply = String(content).trim().slice(0, 500);
        verdict = inferVerdict(reply);
      }

      const result = { verdict, reply };
      if (verdict === 'win') {
        result.answer = question.answer;
      }
      res.status(200).json(result);
      return;
    }

    if (mode === 'guess') {
      const input = clampString(body.input, 1000);
      if (!input) {
        res.status(400).json({ error: 'input is required' });
        return;
      }

      const messages = [
        { role: 'system', content: guessSystemPrompt(question, history.length) },
        ...historyMessages.slice(-20),
        { role: 'user', content: `玩家的推理：${input}` },
      ];

      const content = await callKimi(messages, 300);

      let correct;
      let reply;
      try {
        const parsed = extractJson(content);
        correct = parsed?.correct === true;
        reply = clampString(parsed?.reply, 500) || (correct ? '你猜对了！' : '不完全对，继续推理。');
      } catch {
        reply = String(content).trim().slice(0, 500);
        correct = /你猜对|完全正确|答对了/.test(reply);
      }

      const result = { correct, reply };
      if (correct) {
        result.answer = question.answer;
      }
      res.status(200).json(result);
      return;
    }

    // mode === 'hint'
    const hintCount = Math.min(Math.max(Number(body.hintCount) || 1, 1), 3);
    const messages = [
      { role: 'system', content: hintSystemPrompt(question, hintCount) },
      ...historyMessages,
      { role: 'user', content: '请给我一个提示。' },
    ];

    const content = await callKimi(messages, 200);
    res.status(200).json({ reply: String(content).trim().slice(0, 500) });
  } catch (error) {
    console.error('Turtle chat error:', error);
    res.status(502).json({ error: 'AI service unavailable' });
  }
}
