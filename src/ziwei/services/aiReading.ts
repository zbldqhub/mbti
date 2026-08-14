// AI 白话解读服务层
// 复用全站 /api/chat（Vercel Function 代理 Kimi，密钥在服务端）。
// 排盘数据由本地引擎算好，AI 只负责「翻译」成普通人能懂的话。

import type { ChartData, PalaceData } from '../types';
import { PALACE_NAMES } from '../types';
import { STEMS, BRANCHES } from '../engine/constants';
import { getYearly } from '../engine/yearly';
import { detectPatterns } from '../data/patterns';
import { collectTianjiNotes } from '../data/tianjiNotes';

const API_URL = '/api/chat';
const MODEL = 'kimi-k3';

export interface AiAspect {
  name: string;
  stars: number;
  points: string[];
}

export interface AiReading {
  summary: string;
  natal: { title: string; points: string[] };
  decade: { title: string; intro: string; points: string[] };
  yearly: { title: string; intro: string; aspects: AiAspect[] };
  conclusion: {
    text: string;
    advice: { domain: string; text: string }[];
    motto: string;
  };
}

// ---------- 命盘数据摘要（喂给 AI 的完整信息） ----------

function starText(s: PalaceData['stars'][number]): string {
  let t = s.name;
  if (s.brightness) t += `(${s.brightness})`;
  if (s.sihua) t += `(化${s.sihua})`;
  return t;
}

function palaceLine(p: PalaceData): string {
  const majors = p.stars.filter((s) => s.category === 'major');
  const aux = p.stars.filter((s) => s.category === 'aux');
  const sha = p.stars.filter((s) => s.category === 'sha');
  const misc = p.stars.filter((s) => s.category === 'misc');
  const parts = [
    `${PALACE_NAMES[p.nameIndex]}（${STEMS[p.stem]}${BRANCHES[p.branch]}${p.isBodyPalace ? '，身宫所在' : ''}）`,
    `主星：${majors.length > 0 ? majors.map(starText).join('、') : '无正曜（借对宫论）'}`,
  ];
  if (aux.length > 0) parts.push(`辅佐：${aux.map(starText).join('、')}`);
  if (sha.length > 0) parts.push(`煞曜：${sha.map(starText).join('、')}`);
  if (misc.length > 0) parts.push(`杂曜：${misc.map((s) => s.name).join('、')}`);
  return `- ${parts.join('；')}`;
}

export function buildChartSummary(chart: ChartData, now = new Date()): string {
  const thisYear = now.getFullYear();
  const age = thisYear - chart.lunarYear + 1;
  const lines: string[] = [
    `姓名：${chart.name}（${chart.yinyang}），${chart.juName}`,
    `公历：${chart.solarText}；农历：${chart.lunarText}`,
    `命宫在${BRANCHES[chart.mingBranch]}，身宫在${BRANCHES[chart.bodyBranch]}；命主${chart.mingZhu}，身主${chart.shenZhu}`,
    '',
    '【十二宫星曜】',
    ...chart.palaces.map((p) => palaceLine(p)),
  ];

  // 生年四化
  const sihuaText = chart.sihua
    .map((s) => `${s.star}化${s.type}（入${PALACE_NAMES[chart.palaces[s.branch].nameIndex]}）`)
    .join('，');
  lines.push('', `【生年四化】${sihuaText}`);

  // 格局
  const patterns = detectPatterns(chart);
  if (patterns.length > 0) {
    lines.push(`【命盘格局】${patterns.map((p) => p.name).join('、')}`);
  }

  // 当前大限
  const dx = chart.daxian.find((d) => age >= d.startAge && age <= d.endAge);
  if (dx) {
    const p = chart.palaces[dx.branch];
    const majors = p.stars.filter((s) => s.category === 'major');
    lines.push(
      '',
      `【当前大限】${dx.startAge}–${dx.endAge}岁（虚岁），行${BRANCHES[dx.branch]}宫（${STEMS[dx.stem]}${BRANCHES[dx.branch]}），叠本命${PALACE_NAMES[p.nameIndex]}，主星：${majors.length > 0 ? majors.map((s) => s.name).join('、') : '无正曜'}`,
    );
  }

  // 今年流年
  const y = getYearly(chart, thisYear);
  const flowText = y.flowStars
    .filter((f) => ['流禄', '流权', '流科', '流忌'].includes(f.star))
    .map((f) => `${f.note}（入本命${PALACE_NAMES[chart.palaces[f.branch].nameIndex]}）`)
    .join('，');
  lines.push(
    '',
    `【今年流年】${thisYear}年（${y.ganZhi}），虚岁${age}，流年命宫在${BRANCHES[y.mingBranch]}（即本命${PALACE_NAMES[chart.palaces[y.mingBranch].nameIndex]}）`,
    `流年四化：${flowText}`,
  );

  return lines.join('\n');
}

// ---------- Prompt ----------

function buildPrompt(chart: ChartData, now: Date): string {
  const summary = buildChartSummary(chart, now);
  const thisYear = now.getFullYear();

  // 与本盘相关的天纪实例论断（选择性注入，供 AI 化用）
  const notes = collectTianjiNotes(chart, 8);
  const notesSection = notes.length > 0
    ? `\n【名家实例论断参考】（以下论断摘自倪海厦《天纪》实例讲义，与本命盘特征相关。请在解读中自然化用，增强实例感；其中涉及凶象的内容，务必转述为「风险提示 + 化解建议」，严禁预言生死、严禁恐吓）：\n${notes.map((n) => `◆ ${n.title}：${n.text}`).join('\n')}\n`
    : '';

  return `你是一位精通中州派紫微斗数的命理师，擅长把命盘翻译成普通人看得懂的大白话。下面是一张已经排好的命盘完整数据，请你直接基于这些数据做解读，不需要自己排盘，也不要质疑数据。

${summary}
${notesSection}
请严格按以下 JSON 结构输出（只输出 JSON，不要任何其他文字、不要用 markdown 代码块包裹）：
{
  "summary": "一段开场总述（80-120字）：用大白话概括此命的整体格局气质，点出最亮眼的配置，语气温和诚恳，用「你」称呼",
  "natal": {
    "title": "一、本命格局：XXXX（起一个有概括力的短标题，如「贪狼守命，紫府照临」）",
    "points": ["5-6条要点，每条以【宫位+星曜】开头，如「命宫贪狼（午宫）：…」，然后用大白话解释这个配置意味着什么性格、天赋或人生倾向，每条2-3句"]
  },
  "decade": {
    "title": "二、当前大限（XX–XX岁，干支大运）",
    "intro": "一句这十年的总体定位",
    "points": ["3-4条要点：这十年的重点领域（如婚姻、财运、事业、健康），结合大限宫位主星与其对本命的影响，说清机会与坑，每条2-3句"]
  },
  "yearly": {
    "title": "三、${thisYear}年（干支年）流年运势",
    "intro": "一句今年的总基调",
    "aspects": [
      {"name": "事业运", "stars": 1到5的整数, "points": ["2-3条具体解读与建议"]},
      {"name": "财运", "stars": 1到5的整数, "points": ["2-3条"]},
      {"name": "感情运", "stars": 1到5的整数, "points": ["2-3条"]},
      {"name": "健康运", "stars": 1到5的整数, "points": ["2-3条"]},
      {"name": "贵人运", "stars": 1到5的整数, "points": ["2-3条，结合流年命宫三方四正的天魁天钺、左辅右弼、化科等吉星，说清今年容不容易遇到贵人、贵人是长辈还是平辈、该主动链接哪类人"]},
      {"name": "出行变动运", "stars": 1到5的整数, "points": ["2-3条，结合流年迁移宫与天马、杀破狼等变动星曜的引动，说清今年宜不宜远行、搬迁、跳槽、变换环境"]}
    ]
  },
  "conclusion": {
    "text": "一段总结（60-100字）：今年的核心课题与应对心法",
    "advice": [
      {"domain": "事业", "text": "一句话可执行建议"},
      {"domain": "财运", "text": "一句话"},
      {"domain": "感情", "text": "一句话"},
      {"domain": "健康", "text": "一句话"},
      {"domain": "人际", "text": "一句话"}
    ],
    "motto": "一句有余味的比喻式收尾（如「命盘如地图，知路之崎岖，是为了择路而行」），20-40字"
  }
}

写作要求：
1. 全部用大白话，命理术语第一次出现时用括号或短句解释（如「化忌（容易纠缠卡壳）」）
2. 解读必须有依据：每个判断都要对应数据里的具体宫位星曜，不要空泛的万能话术；可参考上方名家实例论断，让解读有实例感
3. 吉凶都要说人话：好的说成具体机会，差的说成具体可防的风险，并给应对建议
4. 不做宿命论断言，强调「趋势+选择」；不说教、不恐吓、不预言生死
5. 若流年或大限逢化忌、煞星偏重，化解建议可融入「进德修业」的心法（坏年景宜读书进修、修炼技能、沉淀蓄力，好年景再放手进取）
6. 涉及健康只说「注意、防范」，不做疾病诊断`;
}

// ---------- 调用与解析 ----------

/** 从 AI 输出提取 JSON（容忍 markdown 代码块与首尾杂文字） */
export function extractJson(text: string): unknown {
  let cleaned = text.trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) cleaned = fence[1].trim();
  const start = cleaned.search(/[[{]/);
  const end = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI 输出中未找到 JSON');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

/** 流年固定展示的六个方面（顺序即展示顺序） */
export const CANONICAL_ASPECTS = ['事业运', '财运', '感情运', '健康运', '贵人运', '出行变动运'] as const;

/** 校验并规范化 AI 输出；不合法抛异常。流年方面始终补齐为固定六项 */
export function normalizeReading(raw: unknown): AiReading {
  const r = raw as Partial<AiReading>;
  if (typeof r?.summary !== 'string' || !r.summary) throw new Error('missing summary');
  if (!Array.isArray(r?.natal?.points) || r.natal.points.length === 0) throw new Error('missing natal.points');
  if (!Array.isArray(r?.decade?.points) || r.decade.points.length === 0) throw new Error('missing decade.points');
  if (!Array.isArray(r?.yearly?.aspects) || r.yearly.aspects.length === 0) throw new Error('missing yearly.aspects');
  if (!Array.isArray(r?.conclusion?.advice)) throw new Error('missing conclusion.advice');

  // 六个固定方面：按名匹配 AI 输出，缺失的补默认项，保证每次都完整展示
  const byName = new Map<string, { stars?: number; points?: string[] }>();
  for (const a of r.yearly.aspects) {
    if (a && typeof a.name === 'string') {
      const key = a.name.replace(/\s/g, '');
      byName.set(key, a);
      byName.set(key.replace(/运$/, ''), a); // 兼容「出行运」/「出行」等写法
    }
  }
  const findAspect = (name: string) =>
    byName.get(name) ?? byName.get(name.replace(/运$/, '')) ?? byName.get(name.slice(0, 2));
  const aspects: AiAspect[] = CANONICAL_ASPECTS.map((name) => {
    const hit = findAspect(name);
    const points = Array.isArray(hit?.points)
      ? hit.points.filter((p): p is string => typeof p === 'string' && !!p)
      : [];
    return {
      name,
      stars: Math.max(1, Math.min(5, Math.round(Number(hit?.stars) || 3))),
      points: points.length > 0 ? points : ['今年此方面无显著吉凶引动，运势平稳，按部就班即可。'],
    };
  });

  return {
    summary: r.summary,
    natal: {
      title: r.natal.title || '一、本命格局',
      points: r.natal.points,
    },
    decade: {
      title: r.decade.title || '二、当前大限',
      intro: typeof r.decade.intro === 'string' ? r.decade.intro : '',
      points: r.decade.points,
    },
    yearly: {
      title: r.yearly.title || '三、流年运势',
      intro: typeof r.yearly.intro === 'string' ? r.yearly.intro : '',
      aspects,
    },
    conclusion: {
      text: typeof r.conclusion.text === 'string' ? r.conclusion.text : '',
      advice: r.conclusion.advice
        .filter((a): a is { domain: string; text: string } => typeof a?.domain === 'string' && typeof a?.text === 'string'),
      motto: typeof r.conclusion.motto === 'string' ? r.conclusion.motto : '',
    },
  };
}

async function callApi(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000); // 90s 前端兜底超时
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 6000,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI 服务请求失败（HTTP ${response.status}）`);
    }
    const data = await response.json();
    const content: string = data.choices?.[0]?.message?.content || '';
    if (!content) throw new Error('AI 返回了空内容');
    return content;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateAiReading(chart: ChartData, now = new Date()): Promise<AiReading> {
  const prompt = buildPrompt(chart, now);
  let lastError: unknown;
  // 失败自动重试一次（长输出偶发截断/网络抖动）
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const content = await callApi(prompt);
      return normalizeReading(extractJson(content));
    } catch (e) {
      lastError = e;
      if (e instanceof DOMException && e.name === 'AbortError') {
        lastError = new Error('AI 响应超时（90 秒），请稍后重试');
      } else if (e instanceof SyntaxError || (e instanceof Error && e.message.includes('JSON'))) {
        lastError = new Error('AI 输出格式异常，请点击重试');
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('AI 解读失败');
}
