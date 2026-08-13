// 吉凶格局识别规则（依《推断框架》第六章整理）
// 三方四正：本宫 + 对宫 + 两个三合宫（地支 ±4）

import type { ChartData } from '../types';
import { next } from '../engine/constants';

export interface PatternResult {
  name: string;
  level: '吉' | '凶' | '变';
  description: string;
}

/** 三方四正宫支（含本宫） */
export function sanfangSizheng(branch: number): number[] {
  return [branch, next(branch, 6), next(branch, 4), next(branch, 8)];
}

/** 左右夹宫 */
export function jiaGong(branch: number): [number, number] {
  return [next(branch, -1), next(branch, 1)];
}

function starsAt(chart: ChartData, branch: number): Set<string> {
  return new Set(chart.palaces[branch].stars.map((s) => s.name));
}

function starsIn(chart: ChartData, branches: number[]): Set<string> {
  const set = new Set<string>();
  for (const b of branches) for (const s of chart.palaces[b].stars) set.add(s.name);
  return set;
}

/** 化忌所在宫 */
function jiBranch(chart: ChartData): number | null {
  const e = chart.sihua.find((s) => s.type === '忌');
  return e ? e.branch : null;
}

export function detectPatterns(chart: ChartData): PatternResult[] {
  const results: PatternResult[] = [];
  const ming = chart.mingBranch;
  const mingSF = sanfangSizheng(ming);
  const mingStars = starsIn(chart, mingSF);
  const sihuaTypes = new Set(chart.sihua.map((s) => s.type));

  // 1. 百官朝拱：紫微守命，三方四正多辅佐
  if (starsAt(chart, ming).has('紫微')) {
    const auxCount = ['天府', '天相', '左辅', '右弼', '文昌', '文曲', '天魁', '天钺', '禄存', '天马']
      .filter((s) => mingStars.has(s)).length;
    if (auxCount >= 5) {
      results.push({ name: '百官朝拱', level: '吉', description: '紫微守命，辅佐诸吉朝拱，主权贵显达、一生得人拥戴扶助。' });
    }
  }

  // 2. 禄权科会（三奇嘉会）
  const sihuaInMingSF = chart.sihua.filter((s) => mingSF.includes(s.branch));
  const typesInMing = new Set(sihuaInMingSF.map((s) => s.type));
  if (typesInMing.has('禄') && typesInMing.has('权') && typesInMing.has('科')) {
    results.push({ name: '禄权科会（三奇嘉会）', level: '吉', description: '化禄化权化科会于命宫三方四正，主名利双收、机遇频仍。' });
  }

  // 3. 府相朝垣：天府天相分守命宫三合/对宫
  if (!starsAt(chart, ming).has('天府') && !starsAt(chart, ming).has('天相')
    && mingStars.has('天府') && mingStars.has('天相')) {
    results.push({ name: '府相朝垣', level: '吉', description: '天府天相拱照命宫，主衣食丰足、事业有成、一生安稳。' });
  }

  // 4. 禄马交驰：禄存天马同宫或对照（命/财/迁移范围内）
  const luBranch = chart.palaces.find((p) => p.stars.some((s) => s.name === '禄存'))?.branch;
  const maBranch = chart.palaces.find((p) => p.stars.some((s) => s.name === '天马'))?.branch;
  if (luBranch !== undefined && maBranch !== undefined
    && (luBranch === maBranch || next(luBranch, 6) === maBranch)
    && (mingSF.includes(luBranch) || mingSF.includes(maBranch))) {
    results.push({ name: '禄马交驰', level: '吉', description: '禄存与天马同度或互照，主财源远方来、动中生财、经商远行有利。' });
  }

  // 5. 辅弼拱命 / 辅弼夹命
  const [leftJia, rightJia] = jiaGong(ming);
  const hasFu = (b: number) => starsAt(chart, b).has('左辅');
  const hasBi = (b: number) => starsAt(chart, b).has('右弼');
  if ((hasFu(leftJia) && hasBi(rightJia)) || (hasBi(leftJia) && hasFu(rightJia))) {
    results.push({ name: '辅弼夹命', level: '吉', description: '左辅右弼夹持命宫，主一生多贵人助力、逢难有救。' });
  } else if (mingStars.has('左辅') && mingStars.has('右弼')) {
    results.push({ name: '辅弼拱照', level: '吉', description: '左辅右弼会照命宫，主助力多、人缘佳。' });
  }

  // 6. 昌曲夹命
  const hasChang = (b: number) => starsAt(chart, b).has('文昌');
  const hasQu = (b: number) => starsAt(chart, b).has('文曲');
  if ((hasChang(leftJia) && hasQu(rightJia)) || (hasQu(leftJia) && hasChang(rightJia))) {
    results.push({ name: '昌曲夹命', level: '吉', description: '文昌文曲夹持命宫，主才华出众、利文途科名。' });
  }

  // 7. 羊陀夹忌
  const jb = jiBranch(chart);
  if (jb !== null) {
    const [l, r] = jiaGong(jb);
    const yang = (b: number) => starsAt(chart, b).has('擎羊');
    const tuo = (b: number) => starsAt(chart, b).has('陀罗');
    if ((yang(l) && tuo(r)) || (tuo(l) && yang(r))) {
      const palaceName = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '交友宫', '事业宫', '田宅宫', '福德宫', '父母宫'][chart.palaces[jb].nameIndex];
      results.push({ name: '羊陀夹忌', level: '凶', description: `擎羊陀罗夹化忌于${palaceName}，主该宫事项困顿多阻，防灾病官非，行事宜守不宜进。` });
    }
  }

  // 8. 刑忌夹印：天相被天刑与化忌（或羊陀）相夹
  const xiangBranch = chart.palaces.find((p) => p.stars.some((s) => s.name === '天相'))?.branch;
  if (xiangBranch !== undefined) {
    const [l, r] = jiaGong(xiangBranch);
    const neighbors = starsIn(chart, [l, r]);
    const jiaJi = jb !== null && (l === jb || r === jb);
    if (neighbors.has('天刑') && jiaJi) {
      results.push({ name: '刑忌夹印', level: '凶', description: '天相被天刑化忌相夹，主压力大、多掣肘，防官非刑责与精神压力。' });
    }
  }

  // 9. 火铃夹命
  const huo = (b: number) => starsAt(chart, b).has('火星');
  const ling = (b: number) => starsAt(chart, b).has('铃星');
  if ((huo(leftJia) && ling(rightJia)) || (ling(leftJia) && huo(rightJia))) {
    results.push({ name: '火铃夹命', level: '凶', description: '火星铃星夹持命宫，主性格急躁、防突发变故，亦具异军奋起之机。' });
  }

  // 10. 空劫夹命 / 空劫同临
  const dk = (b: number) => starsAt(chart, b).has('地空');
  const dj = (b: number) => starsAt(chart, b).has('地劫');
  if ((dk(leftJia) && dj(rightJia)) || (dj(leftJia) && dk(rightJia))) {
    results.push({ name: '空劫夹命', level: '凶', description: '地空地劫夹持命宫，主理想易落空、财来财去，宜精神修为与务实并行。' });
  }
  if (dk(ming) && dj(ming)) {
    results.push({ name: '空劫同临命宫', level: '变', description: '地空地劫同坐命宫，主思想超脱、不走寻常路，利玄学技艺，不利守财。' });
  }

  // 11. 杀破狼格局
  const mingPalaceStars = starsAt(chart, ming);
  if (mingPalaceStars.has('七杀') || mingPalaceStars.has('破军') || mingPalaceStars.has('贪狼')) {
    results.push({ name: '杀破狼格局', level: '变', description: '七杀、破军、贪狼互为三方，守命者一生变动开创，吉则大发、凶则大败，成败全看运限把握。' });
  }

  // 12. 日月反背
  const sun = chart.palaces.find((p) => p.stars.some((s) => s.name === '太阳'));
  const moon = chart.palaces.find((p) => p.stars.some((s) => s.name === '太阴'));
  if (sun && moon) {
    const sunB = sun.stars.find((s) => s.name === '太阳')?.brightness;
    const moonB = moon.stars.find((s) => s.name === '太阴')?.brightness;
    if (sunB === '陷' && moonB === '陷') {
      results.push({ name: '日月反背', level: '凶', description: '太阳太阴皆落陷失辉，主劳碌少成、宜离乡发展或夜间行业，中年后渐开。' });
    }
  }

  // 13. 机月同梁
  if (['天机', '太阴', '天同', '天梁'].every((s) => mingStars.has(s))) {
    results.push({ name: '机月同梁', level: '吉', description: '天机太阴天同天梁会于三方，主性格稳细、宜公职文教与稳定机构发展。' });
  }

  // 14. 桃花成局：红鸾天喜 + 天姚等会于命或福德
  const taoHua = ['红鸾', '天喜', '天姚'];
  const fudeBranch = chart.palaces.find((p) => p.nameIndex === 10)!.branch;
  const taoCount = new Set([...starsIn(chart, sanfangSizheng(ming)), ...starsIn(chart, sanfangSizheng(fudeBranch))]);
  const taoHit = taoHua.filter((s) => taoCount.has(s)).length;
  if (taoHit >= 2 && (mingStars.has('贪狼') || mingStars.has('廉贞'))) {
    results.push({ name: '桃花滚浪', level: '变', description: '桃花诸曜会集命福，主魅力出众、感情丰富；须防情缘过多牵动事业与婚姻。' });
  }

  // 命无正曜提示（借星安宫）
  const hasMajor = chart.palaces[ming].stars.some((s) => s.category === 'major');
  if (!hasMajor) {
    results.push({ name: '命无正曜', level: '变', description: '命宫无正曜，须借对宫（迁移宫）星系论断，主一生易受环境影响，外出发展反佳。' });
  }

  void sihuaTypes;
  return results;
}
