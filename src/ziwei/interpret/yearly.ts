// 流年推断：以太岁宫为流年命宫，流年天干起流曜，与本命叠象
// 依《推断框架》：流年羊陀叠天盘羊陀则煞力倍增；化忌重叠则事端必发。

import type { ChartData, YearlyData } from '../types';
import { PALACE_NAMES } from '../types';
import type { ReadingSection } from './common';
import { branchName, majorsOf, palaceGroupScore, STAR_NATURES } from './common';
import { getYearly } from '../engine/yearly';

function yearlyParagraph(chart: ChartData, y: YearlyData): string {
  const p = chart.palaces[y.mingBranch];
  const majors = majorsOf(p);
  const starText = majors.length > 0
    ? majors.map((s) => s.name).join('、')
    : '无正曜（借对宫）';
  const natalPalace = PALACE_NAMES[p.nameIndex];
  const score = palaceGroupScore(chart, y.mingBranch);
  const tendency = score >= 3 ? '流年偏顺' : score <= -3 ? '流年多阻' : '流年平稳';

  const parts: string[] = [
    `${y.year}年（${y.ganZhi}，虚岁${y.age}）：太岁入${branchName(y.mingBranch)}宫，流年命宫即本命${natalPalace}（主星${starText}），${tendency}。`,
  ];

  // 流年四化落本命宫
  const sihuaNotes = y.flowStars.filter((f) => f.star.startsWith('流'));
  const jiNote = sihuaNotes.find((f) => f.star === '流忌');
  const luNote = sihuaNotes.find((f) => f.star === '流禄');
  const keNote = sihuaNotes.find((f) => f.star === '流科');
  const quanNote = sihuaNotes.find((f) => f.star === '流权');
  const notes: string[] = [];
  if (luNote) notes.push(`流禄（${luNote.note}）入本命${PALACE_NAMES[chart.palaces[luNote.branch].nameIndex]}`);
  if (quanNote) notes.push(`流权（${quanNote.note}）入本命${PALACE_NAMES[chart.palaces[quanNote.branch].nameIndex]}`);
  if (keNote) notes.push(`流科（${keNote.note}）入本命${PALACE_NAMES[chart.palaces[keNote.branch].nameIndex]}`);
  if (jiNote) {
    const jiPalace = chart.palaces[jiNote.branch];
    let jiText = `流忌（${jiNote.note}）入本命${PALACE_NAMES[jiPalace.nameIndex]}，该宫事项今年易生纠缠`;
    // 叠象：本命化忌同宫
    const natalJi = chart.sihua.find((s) => s.type === '忌');
    if (natalJi && natalJi.branch === jiNote.branch) {
      jiText += '，与本命化忌重叠（双忌同宫），其象尤显，务必谨慎应对';
    }
    notes.push(jiText);
  }
  if (notes.length > 0) parts.push(notes.join('；') + '。');

  // 大限提示
  if (y.daxian) {
    parts.push(`时行${y.daxian.startAge}–${y.daxian.endAge}岁大限（${branchName(y.daxian.branch)}宫），流年与大限${y.daxian.branch === y.mingBranch ? '同宫相叠，应象加倍明显' : '相参而论'}。`);
  }

  return parts.join('');
}

export function interpretYearly(chart: ChartData, thisYear: number, count = 6): ReadingSection {
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) {
    const y = getYearly(chart, thisYear + i);
    paragraphs.push(yearlyParagraph(chart, y));
  }
  return {
    key: 'yearly',
    title: `流年运势（${thisYear}–${thisYear + count - 1}）`,
    paragraphs,
  };
}

/** 星性关键词（供 UI 展示流年主星） */
export function starKeywordsOf(chart: ChartData, branch: number): string {
  const majors = majorsOf(chart.palaces[branch]);
  return majors.map((s) => STAR_NATURES[s.name]?.keywords ?? s.name).join('；');
}
