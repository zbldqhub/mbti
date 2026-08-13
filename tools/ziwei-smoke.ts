// 冒烟脚本：打印完整排盘与推算文本，人工检查用
// 运行：node tools/ziwei-smoke.ts  （Node 24+ 直接执行 TS）

import { buildChart } from '../src/ziwei/engine/chart';
import { buildReading } from '../src/ziwei/interpret';
import { BRANCHES, STEMS } from '../src/ziwei/engine/constants';

const chart = buildChart({
  name: '测试者', gender: 'female', year: 1995, month: 8, day: 20, hour: 14, minute: 30,
});

console.log('===== 命盘结构 =====');
for (const p of chart.palaces) {
  const stars = p.stars
    .map((s) => `${s.name}${s.brightness ? `[${s.brightness}]` : ''}${s.sihua ? `{化${s.sihua}}` : ''}`)
    .join(' ');
  console.log(
    `${STEMS[p.stem]}${BRANCHES[p.branch]} ${['命', '兄', '夫', '子', '财', '疾', '迁', '友', '业', '田', '福', '父'][p.nameIndex]}${p.isBodyPalace ? '(身)' : ''} 大限${p.daxianStart}-${p.daxianEnd} ${p.changsheng} | ${stars}`,
  );
}

console.log('\n===== 推算文本 =====');
const sections = buildReading(chart, new Date('2026-08-13'));
for (const sec of sections) {
  console.log(`\n## ${sec.title}`);
  for (const para of sec.paragraphs) console.log(para);
}
