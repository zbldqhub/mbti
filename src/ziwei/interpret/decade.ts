// 大限推断：各大限总览 + 当前大限详批
// 依《推断框架》：以大限所在宫为十年命宫，看正曜及三方四正；
// 大限吉曜叠原局吉处则吉上加吉，煞忌冲原局弱点则凶象显现。

import type { ChartData, DaxianEntry } from '../types';
import { PALACE_NAMES } from '../types';
import type { ReadingSection } from './common';
import {
  gz, branchName, majorsOf, palaceGroupScore, sihuaNote, STAR_NATURES,
} from './common';
import { getSihua } from '../engine/sihua';
import { next } from '../engine/constants';

function decadeParagraph(chart: ChartData, d: DaxianEntry, detailed: boolean): string {
  const p = chart.palaces[d.branch];
  const majors = majorsOf(p);
  const starText = majors.length > 0
    ? majors.map((s) => `${s.name}${s.brightness ? `（${s.brightness}）` : ''}`).join('、')
    : '无正曜（借对宫论）';
  const natalPalace = PALACE_NAMES[p.nameIndex];
  const score = palaceGroupScore(chart, d.branch);
  const tendency = score >= 3 ? '此十年运势偏吉，谋事多成' : score <= -3 ? '此十年运势多磨，宜守稳蓄势' : '此十年运势平顺，稳中有变';

  let text = `${d.startAge}–${d.endAge}岁 行${branchName(d.branch)}宫（${gz(d.stem, d.branch)}），叠本命${natalPalace}：主星${starText}，${tendency}。`;

  if (detailed) {
    // 主星星性展开
    const natures = majors
      .map((s) => STAR_NATURES[s.name])
      .filter(Boolean)
      .map((n) => n.keywords)
      .join('、');
    if (natures) text += ` 星性主${natures}。`;

    // 大限四化（以大限宫干起）落本命何宫
    const dxSihua = getSihua(d.stem);
    const notes: string[] = [];
    for (const { star, type } of dxSihua) {
      const target = chart.palaces.find((pp) => pp.stars.some((s) => s.name === star));
      if (!target) continue;
      const pn = PALACE_NAMES[target.nameIndex];
      if (type === '忌') notes.push(`大限化忌（${star}）入本命${pn}，该宫事项此十年易生阻滞，须多留意`);
      if (type === '禄') notes.push(`大限化禄（${star}）入本命${pn}，该宫事项此十年缘厚顺遂`);
    }
    if (notes.length > 0) text += ' ' + notes.join('；') + '。';

    // 本命四化在大限三方
    const natalSihua = sihuaNote(p);
    if (natalSihua.length > 0) text += ' 本命四化应于此宫：' + natalSihua.join('');
  }
  return text;
}

export function interpretDecade(chart: ChartData, currentAge: number): ReadingSection {
  const paragraphs: string[] = [];
  const current = chart.daxian.find((d) => currentAge >= d.startAge && currentAge <= d.endAge);

  paragraphs.push(
    `${chart.yinyang}，大限${chart.daxian[1].branch === next(chart.daxian[0].branch) ? '顺行' : '逆行'}，${chart.juNum}岁起运。各大限走势如下：`,
  );

  // 展示前 10 大限（覆盖至百岁左右）；若当前大限超出展示范围则单独补出
  const shown = chart.daxian.slice(0, 10);
  for (const d of shown) {
    const isCurrent = current?.index === d.index;
    paragraphs.push(`${isCurrent ? '▶ ' : ''}${decadeParagraph(chart, d, !!isCurrent)}`);
  }
  if (current && !shown.includes(current)) {
    paragraphs.push(`▶ ${decadeParagraph(chart, current, true)}`);
  }

  if (current) {
    paragraphs.push(`—— 当前正行${current.startAge}–${current.endAge}岁大限（${branchName(current.branch)}宫），为现阶段十年总运，宜结合上方详批参看。`);
  }

  return { key: 'decade', title: '大限十年运', paragraphs };
}
