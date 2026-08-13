// 推算共享辅助

import type { ChartData, PalaceData, StarInstance } from '../types';
import { PALACE_NAMES } from '../types';
import { next } from '../engine/constants';
import { STEMS, BRANCHES } from '../engine/constants';
import { STAR_NATURES, COMBO_NOTES, MINOR_NOTES } from '../data/starNatures';

export interface ReadingSection {
  key: string;
  title: string;
  paragraphs: string[];
}

export function gz(stem: number, branch: number): string {
  return `${STEMS[stem]}${BRANCHES[branch]}`;
}

export function branchName(branch: number): string {
  return BRANCHES[branch];
}

export function majorsOf(p: PalaceData): StarInstance[] {
  return p.stars.filter((s) => s.category === 'major');
}

export function minorsOf(p: PalaceData, cat: 'aux' | 'sha' | 'misc'): StarInstance[] {
  return p.stars.filter((s) => s.category === cat);
}

/** 三方四正宫支 */
export function sfz(branch: number): number[] {
  return [branch, next(branch, 6), next(branch, 4), next(branch, 8)];
}

const BRIGHT_SCORE: Record<string, number> = { 庙: 2, 旺: 1.5, 得: 1, 平: 0, 闲: -0.5, 陷: -2 };
const SIHUA_SCORE: Record<string, number> = { 禄: 1.5, 权: 1, 科: 1.2, 忌: -2 };

/** 单宫吉凶评分（仅作文字倾向参考） */
export function palaceScore(p: PalaceData): number {
  let score = 0;
  for (const s of p.stars) {
    if (s.category === 'major') score += BRIGHT_SCORE[s.brightness ?? '平'] ?? 0;
    if (s.category === 'aux') score += 0.6;
    if (s.category === 'sha') {
      score += (s.brightness === '庙' || s.brightness === '旺') ? -0.4 : -1.2;
    }
    if (s.sihua) score += SIHUA_SCORE[s.sihua] ?? 0;
  }
  return score;
}

/** 三方四正综合评分 */
export function palaceGroupScore(chart: ChartData, branch: number): number {
  return sfz(branch).reduce((sum, b) => sum + palaceScore(chart.palaces[b]), 0);
}

/** 主星组合键（如「紫微+七杀」） */
export function comboKey(p: PalaceData): string | null {
  const majors = majorsOf(p).map((s) => s.name);
  if (majors.length === 2) return majors.join('+');
  return null;
}

/** 亮度修饰语 */
export function brightnessNote(s: StarInstance): string {
  const nature = STAR_NATURES[s.name];
  if (!nature) return '';
  if (s.brightness === '庙' || s.brightness === '旺') return nature.brightNote;
  if (s.brightness === '陷') return nature.dimNote;
  return '';
}

/** 宫内四化标注句 */
export function sihuaNote(p: PalaceData): string[] {
  const notes: string[] = [];
  const map: Record<string, string> = {
    禄: '化禄入此宫，主缘厚财顺、所谋易成',
    权: '化权入此宫，主积极进取、掌权争胜',
    科: '化科入此宫，主声名清贵、逢难有解',
    忌: '化忌入此宫，主纠缠阻滞、须防执念误事',
  };
  for (const s of p.stars) {
    if (s.sihua) notes.push(`${s.name}${map[s.sihua]}。`);
  }
  return notes;
}

/** 辅佐煞曜概览句 */
export function minorSummary(p: PalaceData): string {
  const aux = minorsOf(p, 'aux').map((s) => s.name);
  const sha = minorsOf(p, 'sha').map((s) => s.name);
  const parts: string[] = [];
  if (aux.length > 0) parts.push(`得${aux.join('、')}相佐`);
  if (sha.length > 0) parts.push(`逢${sha.join('、')}相扰`);
  return parts.length > 0 ? `本宫${parts.join('，')}。` : '';
}

/** 重要杂曜提示（红鸾天喜等在特定宫位值得一提） */
export function miscNotes(p: PalaceData): string[] {
  const interesting = ['红鸾', '天喜', '天姚', '天刑', '孤辰', '寡宿', '截空', '旬空', '天伤', '天使'];
  return p.stars
    .filter((s) => interesting.includes(s.name))
    .map((s) => `${s.name}：${MINOR_NOTES[s.name]}。`);
}

/** 借星说明：本宫无正曜时借对宫 */
export function borrowNote(chart: ChartData, p: PalaceData): { text: string; borrowedFrom: PalaceData | null } {
  if (majorsOf(p).length > 0) return { text: '', borrowedFrom: null };
  const opp = chart.palaces[next(p.branch, 6)];
  const oppMajors = majorsOf(opp).map((s) => s.name);
  if (oppMajors.length === 0) return { text: '', borrowedFrom: null };
  return {
    text: `本宫无正曜，借对宫${oppMajors.join('、')}安宫论断，其吉凶受对宫牵动，环境影响力大。`,
    borrowedFrom: opp,
  };
}

export function palaceFullName(p: PalaceData): string {
  return PALACE_NAMES[p.nameIndex];
}

export { STAR_NATURES, COMBO_NOTES, MINOR_NOTES };
