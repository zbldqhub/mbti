// 原局（本命）推断：总览、命宫性格、身宫、福德同参、十二宫逐宫

import type { ChartData, PalaceData } from '../types';
import { PALACE_NAMES } from '../types';
import type { ReadingSection } from './common';
import {
  gz, branchName, majorsOf, minorsOf, palaceScore, palaceGroupScore,
  comboKey, brightnessNote, sihuaNote, minorSummary, miscNotes, borrowNote,
  STAR_NATURES, COMBO_NOTES,
} from './common';
import { PALACE_READINGS } from '../data/palaceReadings';
import { detectPatterns } from '../data/patterns';

/** 身宫落宫断语 */
const BODY_PALACE_NOTE: Record<number, string> = {
  0: '身命同宫，一生行止与本性一致，主观强、命运由自己开创，中年后愈发彰显本性格局。',
  2: '身宫在夫妻宫，后天运势与婚姻感情关系密切，配偶对人生影响深远，成家而后立业。',
  4: '身宫在财帛宫，一生重心在求财理财，中年后财运为人生主线，宜精研理财经营之道。',
  6: '身宫在迁移宫，宜离乡外出发展，异地谋生反能大展拳脚，在外机缘胜于故土。',
  8: '身宫在事业宫，一生以事业为重，中年后功名心强，宜专注专业领域深耕。',
  10: '身宫在福德宫，重精神生活与内在修养，中年后心境趋向安逸，晚运享福。',
};

export function interpretLifetime(chart: ChartData, currentAge: number): ReadingSection[] {
  const sections: ReadingSection[] = [];

  // ---- 1. 命盘总览 ----
  const mingP = chart.palaces[chart.mingBranch];
  const bodyP = chart.palaces[chart.bodyBranch];
  const overview: string[] = [
    `${chart.name}（${chart.yinyang}），公历${chart.solarText}，农历${chart.lunarText}${chart.isLeapMonth ? '（闰月按当月计）' : ''}。`,
    `命宫在${branchName(chart.mingBranch)}（${gz(mingP.stem, chart.mingBranch)}），身宫在${branchName(chart.bodyBranch)}${chart.mingBranch === chart.bodyBranch ? '（身命同宫）' : `（落于${PALACE_NAMES[bodyP.nameIndex]}）`}，${chart.juName}，命主${chart.mingZhu}、身主${chart.shenZhu}。`,
  ];
  if (chart.unknownTime) {
    overview.push('※ 出生时辰不详，命盘按午时排定，命宫位置及星曜分布可能有偏差，推算结果仅供参考。');
  }
  sections.push({ key: 'overview', title: '命盘总览', paragraphs: overview });

  // ---- 2. 命宫性格格局 ----
  const mingParas: string[] = [];
  const mingMajors = majorsOf(mingP);
  if (mingMajors.length === 0) {
    const { text, borrowedFrom } = borrowNote(chart, mingP);
    mingParas.push(`命宫无主星。${text}`);
    if (borrowedFrom) {
      for (const s of majorsOf(borrowedFrom)) {
        const n = STAR_NATURES[s.name];
        if (n) mingParas.push(`借星${s.name}（${n.wuxing}，${n.role}）：${n.atMing}`);
      }
    }
  } else {
    const ck = comboKey(mingP);
    if (ck && COMBO_NOTES[ck]) mingParas.push(COMBO_NOTES[ck]);
    for (const s of mingMajors) {
      const n = STAR_NATURES[s.name];
      if (!n) continue;
      mingParas.push(`${s.name}（${n.wuxing}，${n.role}）守命：${n.atMing}`);
      const bn = brightnessNote(s);
      if (bn) {
        const label = s.brightness === '庙' ? '入庙' : s.brightness === '旺' ? '坐旺' : '落陷';
        mingParas.push(`${s.name}${label}：${bn}`);
      }
    }
  }
  mingParas.push(...sihuaNote(mingP));
  const ms = minorSummary(mingP);
  if (ms) mingParas.push(ms);
  const group = palaceGroupScore(chart, chart.mingBranch);
  if (group >= 3) mingParas.push('命宫三方四正吉多吉顺，格局偏上，一生多得助力、机遇频仍。');
  else if (group <= -3) mingParas.push('命宫三方四正煞忌偏重，格局多磨，一生成败起伏较大，宜守稳修身、借势而为。');
  sections.push({ key: 'ming', title: '命宫 · 性格格局', paragraphs: mingParas });

  // ---- 3. 身宫 ----
  const shenParas: string[] = [];
  if (BODY_PALACE_NOTE[bodyP.nameIndex]) shenParas.push(BODY_PALACE_NOTE[bodyP.nameIndex]);
  else shenParas.push(`身宫落于${PALACE_NAMES[bodyP.nameIndex]}，后天发展与该宫事项息息相关。`);
  const bodyMajors = majorsOf(bodyP);
  if (bodyMajors.length > 0) {
    shenParas.push(`身宫主星${bodyMajors.map((s) => s.name).join('、')}，后天发展方向以此星性为归。`);
  }
  sections.push({ key: 'shen', title: '身宫 · 后天趋向', paragraphs: shenParas });

  // ---- 4. 福德宫（与命宫同参） ----
  const fudeP = chart.palaces.find((p) => p.nameIndex === 10)!;
  const fudeParas: string[] = [];
  const fudeMajors = majorsOf(fudeP);
  if (fudeMajors.length === 0) {
    fudeParas.push(borrowNote(chart, fudeP).text);
  } else {
    for (const s of fudeMajors) {
      const n = STAR_NATURES[s.name];
      if (n?.fortune) fudeParas.push(`${s.name}：${n.fortune}`);
    }
  }
  const mingScore = palaceGroupScore(chart, chart.mingBranch);
  const fudeScore = palaceGroupScore(chart, fudeP.branch);
  if (mingScore >= 2 && fudeScore >= 2) fudeParas.push('命福皆佳，实质运程与精神享受相配，一生顺遂、家庭和美。');
  else if (mingScore >= 2 && fudeScore < 0) fudeParas.push('命强福弱，事业有成而精神难安，须防婚姻或内心隐忧，宜重修身养性。');
  else if (mingScore < 0 && fudeScore >= 2) fudeParas.push('命弱福厚，物质运程多磨而精神世界富足，安贫乐道反得其乐。');
  else if (mingScore < 0 && fudeScore < 0) fudeParas.push('命福俱弱，一生多磨砺，宜早立定力、借运限与贵人转圜。');
  sections.push({ key: 'fude', title: '福德宫 · 精神世界', paragraphs: fudeParas.filter(Boolean) });

  // ---- 5. 格局判定 ----
  const patterns = detectPatterns(chart);
  if (patterns.length > 0) {
    sections.push({
      key: 'patterns',
      title: '格局判定',
      paragraphs: patterns.map((p) => `【${p.name}】（${p.level}）${p.description}`),
    });
  }

  // ---- 6. 十二宫逐宫批注 ----
  const palaceParas: string[] = [];
  for (let nameIndex = 0; nameIndex < 12; nameIndex++) {
    if (nameIndex === 0) continue; // 命宫已详批
    const p = chart.palaces.find((x) => x.nameIndex === nameIndex)!;
    palaceParas.push(`◆ ${PALACE_READINGS[nameIndex].name}（${gz(p.stem, p.branch)}）${p.isBodyPalace ? '【身宫所在】' : ''}：${interpretOnePalace(chart, p)}`);
  }
  sections.push({ key: 'palaces', title: '十二宫逐宫批注', paragraphs: palaceParas });

  void currentAge;
  return sections;
}

/** 单宫批注 */
function interpretOnePalace(chart: ChartData, p: PalaceData): string {
  const parts: string[] = [];
  const reading = PALACE_READINGS[p.nameIndex];
  const majors = majorsOf(p);

  // 主星断语
  if (majors.length === 0) {
    parts.push(borrowNote(chart, p).text);
  } else {
    const fieldMap: Record<number, 'spouse' | 'wealth' | 'career' | 'health' | 'fortune' | 'travel'> = {
      2: 'spouse', 4: 'wealth', 8: 'career', 5: 'health', 10: 'fortune', 6: 'travel',
    };
    const field = fieldMap[p.nameIndex];
    const ck = comboKey(p);
    if (ck && COMBO_NOTES[ck]) parts.push(COMBO_NOTES[ck]);
    for (const s of majors) {
      const n = STAR_NATURES[s.name];
      if (!n) continue;
      const specific = field ? n[field] : undefined;
      const body = specific ?? `主${n.keywords}`;
      parts.push(`${s.name}（${s.brightness || '平'}）${body}${body.endsWith('。') ? '' : '。'}`);
    }
  }

  // 吉凶总评
  const score = palaceScore(p);
  const group = palaceGroupScore(chart, p.branch);
  if (score + group * 0.5 >= 2) parts.push(reading.auspicious);
  else if (score + group * 0.5 <= -2) parts.push(reading.inauspicious);

  // 四化与杂曜
  parts.push(...sihuaNote(p));
  const aux = minorsOf(p, 'aux');
  if (aux.length > 0) parts.push(`吉辅：${aux.map((s) => s.name).join('、')}。`);
  parts.push(...miscNotes(p));

  return parts.filter(Boolean).join('');
}
