/**
 * MBTI AI 服务层
 *
 * 通过 Vercel Function（/api/chat）代理调用 Kimi API：
 * 1. generateBasicQuestions / generateProQuestions - AI 动态出题
 * 2. generateAIReport - 基于答题记录生成个性化报告
 *
 * 所有 AI 调用失败时回退到本地固定题库 / 模板文案，保证测试永远可用。
 */

import { questions as fixedQuestions } from '../data/questions.js';

const API_URL = '/api/chat';
const MODEL = 'moonshot-v1-8k';

// 每批出题数量（控制单次响应长度）
const BATCH_SIZE = 8;

// 维度元信息
const DIMENSIONS = {
  EI: { letters: ['E', 'I'], desc: '外向(E) vs 内向(I)：精力来源与社交偏好' },
  SN: { letters: ['S', 'N'], desc: '实感(S) vs 直觉(N)：获取信息的方式' },
  TF: { letters: ['T', 'F'], desc: '思考(T) vs 情感(F)：做决定的方式' },
  JP: { letters: ['J', 'P'], desc: '判断(J) vs 知觉(P)：生活方式与节奏' }
};

// ========== 基础调用 ==========

/**
 * 调用 Kimi 代理，返回文本内容；失败抛异常
 */
const callKimi = async (messages, maxTokens) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.9,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    throw new Error(`Kimi API request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  if (!content) {
    throw new Error('Kimi API returned empty content');
  }
  return content;
};

/**
 * 从 AI 输出中提取 JSON（容忍 markdown 代码块包裹）
 */
const extractJson = (text) => {
  let cleaned = text.trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    cleaned = fence[1].trim();
  }
  // 截取第一个 [/{ 到最后一个 ]/}，去掉首尾多余文字
  const start = cleaned.search(/[[{]/);
  const end = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON found in AI output');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
};

// ========== AI 出题 ==========

/**
 * 校验并规范化一批 AI 题目；不合法返回 null
 */
const normalizeQuestions = (raw, dimension) => {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const { letters } = DIMENSIONS[dimension];
  const result = [];

  for (const item of raw) {
    if (typeof item?.question !== 'string' || !item.question.trim()) return null;
    if (!Array.isArray(item.options) || item.options.length !== 2) return null;

    const types = item.options.map(o => o?.type);
    const texts = item.options.map(o => o?.text);
    // 两个选项必须分别对应维度两端，且文本非空
    if (!types.includes(letters[0]) || !types.includes(letters[1])) return null;
    if (texts.some(t => typeof t !== 'string' || !t.trim())) return null;

    result.push({
      dimension,
      question: item.question.trim(),
      options: item.options.map(o => ({ text: o.text.trim(), score: 1, type: o.type }))
    });
  }

  return result;
};

/**
 * 从固定题库中取该维度的题作为兜底
 */
const fallbackQuestions = (dimension, count, usedTexts) => {
  const pool = fixedQuestions.filter(
    q => q.dimension === dimension && !usedTexts.has(q.question)
  );
  return pool.slice(0, count).map(q => ({
    dimension: q.dimension,
    question: q.question,
    options: q.options.map(o => ({ ...o }))
  }));
};

/**
 * 生成单个维度的一批题目（一次 API 调用），失败返回 null
 */
const generateBatch = async (dimension, count, avoidTexts) => {
  const { letters, desc } = DIMENSIONS[dimension];

  const avoidClause = avoidTexts.length > 0
    ? `\n7. 不要出与以下题目语义重复的题目：${avoidTexts.slice(0, 10).map(t => `「${t}」`).join('、')}`
    : '';

  const prompt = `你是一位专业的 MBTI 心理测评出题专家。请围绕「${desc}」这一维度出 ${count} 道 MBTI 测评题。

要求：
1. 每题是一个生活化的情境或偏好问题，两个选项分别体现 ${letters[0]} 倾向和 ${letters[1]} 倾向
2. 两个选项要势均力敌，不能有明显的好坏之分
3. 题目之间覆盖不同的生活场景（工作、社交、学习、休闲、决策等），不要雷同
4. 语言自然口语化，适合中文年轻用户
5. 只输出 JSON 数组，不要输出任何其他文字
6. JSON 格式：[{"question":"题目文本","options":[{"text":"选项一","type":"${letters[0]}"},{"text":"选项二","type":"${letters[1]}"}]}]${avoidClause}`;

  try {
    const content = await callKimi([{ role: 'user', content: prompt }], 2000);
    return normalizeQuestions(extractJson(content), dimension);
  } catch (error) {
    console.error(`AI 出题失败（${dimension}）:`, error);
    return null;
  }
};

/**
 * 生成指定维度指定数量的题目（分批并行，逐批兜底）
 */
const generateDimensionQuestions = async (dimension, count, existingTexts = []) => {
  const usedTexts = new Set(existingTexts);

  // 拆分批次
  const batchCounts = [];
  let remaining = count;
  while (remaining > 0) {
    batchCounts.push(Math.min(BATCH_SIZE, remaining));
    remaining -= BATCH_SIZE;
  }

  const batches = await Promise.all(
    batchCounts.map(batchCount => generateBatch(dimension, batchCount, [...usedTexts]))
  );

  const result = [];
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    if (batch && batch.length > 0) {
      for (const q of batch.slice(0, batchCounts[i])) {
        if (!usedTexts.has(q.question)) {
          usedTexts.add(q.question);
          result.push(q);
        }
      }
    }
  }

  // 缺口用固定题库补齐
  if (result.length < count) {
    result.push(...fallbackQuestions(dimension, count - result.length, usedTexts));
  }

  return result;
};

/**
 * 生成基础版 28 题（EI 23 + SN 5），保持与固定题库相同的维度分布
 */
export const generateBasicQuestions = async () => {
  const [ei, sn] = await Promise.all([
    generateDimensionQuestions('EI', 23),
    generateDimensionQuestions('SN', 5)
  ]);
  return [...ei, ...sn].map((q, i) => ({ id: i + 1, ...q }));
};

/**
 * 生成深度版 65 题（SN 18 + TF 23 + JP 24），避开基础版已出题目的语义
 */
export const generateProQuestions = async (basicQuestions = []) => {
  const existingTexts = basicQuestions.map(q => q.question);
  const [sn, tf, jp] = await Promise.all([
    generateDimensionQuestions('SN', 18, existingTexts),
    generateDimensionQuestions('TF', 23, existingTexts),
    generateDimensionQuestions('JP', 24, existingTexts)
  ]);
  return [...sn, ...tf, ...jp].map((q, i) => ({ id: 29 + i, ...q }));
};

// ========== AI 个性化报告 ==========

/**
 * 基于答题记录生成个性化报告；失败返回 null（调用方回退到本地模板）
 *
 * @param {string} type MBTI 类型（如 INFP）
 * @param {object} percentages 八维百分比 {E, I, S, N, T, F, J, P}
 * @param {Array<{question: string, answer: string}>} qaPairs 答题记录（题目 + 所选选项文本）
 * @param {boolean} isComplete 是否已完成全部 93 题
 */
export const generateAIReport = async ({ type, percentages, qaPairs = [], isComplete = false }) => {
  // 答题记录摘要（截断控制长度）
  const qaSummary = qaPairs
    .slice(0, 93)
    .map((qa, i) => `${i + 1}. ${qa.question} → ${qa.answer}`)
    .join('\n');

  const deepFields = isComplete
    ? `,\n  "cognitiveFunctions": {"primary":"主导功能(功能名+一句话)","secondary":"辅助功能","tertiary":"第三功能","inferior":"劣势功能"},\n  "stressMode":"该用户在压力下的典型表现和调节建议(80字左右)",\n  "careerMatch":["详细职业匹配方向1","方向2","方向3","方向4","方向5","方向6"]`
    : '';

  const prompt = `你是一位专业的 MBTI 性格分析师。一位用户完成了 MBTI 测试，结果是 ${type} 型。

各维度得分百分比：
- 外向E ${percentages.E}% / 内向I ${percentages.I}%
- 实感S ${percentages.S}% / 直觉N ${percentages.N}%
- 思考T ${percentages.T}% / 情感F ${percentages.F}%
- 判断J ${percentages.J}% / 知觉P ${percentages.P}%

${qaSummary ? `用户的具体答题记录（题目 → 用户选择）：\n${qaSummary}\n` : ''}
请基于该用户的【具体答题选择】（不要只写类型通用描述），生成一份个性化的性格分析。语气亲切，用"你"称呼。

只输出 JSON，不要输出其他文字：
{
  "traits": ["核心特质1(结合其答题选择)","核心特质2","核心特质3","核心特质4"],
  "careers": ["推荐职业1","推荐职业2","推荐职业3","推荐职业4","推荐职业5"],
  "relationships": "人际关系与情感建议(80字左右，结合其答题倾向)"${deepFields}
}`;

  try {
    const content = await callKimi([{ role: 'user', content: prompt }], 2000);
    const report = extractJson(content);

    // 基本校验
    if (!Array.isArray(report.traits) || report.traits.length === 0) return null;
    if (!Array.isArray(report.careers) || report.careers.length === 0) return null;
    if (typeof report.relationships !== 'string' || !report.relationships) return null;

    return report;
  } catch (error) {
    console.error('AI 报告生成失败:', error);
    return null;
  }
};
