// 流年 / 大限叠加 / 斗君 / 流月
// 依《安星法》：推流年以太岁宫为流年命宫，逆布十二宫；
// 流曜（流四化、流禄存、流羊陀、流魁钺）依流年天干起，起法与命盘相同。

import { next, prev } from './constants';
import { yearGanZhiOf } from './calendar';
import { getSihua } from './sihua';
import { lucunYangTuo, tiankuiTianyue } from './minorStars';
import { getXiaoxianBranch } from './limits';
import type { ChartData, YearlyData, DaxianEntry } from '../types';

/** 安斗君：太岁宫中起正月，逆数至生月；再由此宫起子时顺数至生时 */
export function getDoujunBranch(taiSuiBranch: number, lunarMonth: number, hourBranch: number): number {
  const monthPalace = prev(taiSuiBranch, lunarMonth - 1);
  return next(monthPalace, hourBranch);
}

/** 星曜在本命盘的落宫（供流年四化定位） */
function findStarBranch(chart: ChartData, starName: string): number {
  for (const p of chart.palaces) {
    if (p.stars.some((s) => s.name === starName)) return p.branch;
  }
  return -1;
}

/** 计算某一流年数据（age 为虚岁） */
export function getYearly(chart: ChartData, year: number): YearlyData {
  const { stem, branch, ganZhi } = yearGanZhiOf(year);
  const age = year - chart.lunarYear + 1;

  // 流年四化（落宫 = 本命该星所在宫）
  const flowStars: { star: string; branch: number; note: string }[] = [];
  for (const { star, type } of getSihua(stem)) {
    const b = findStarBranch(chart, star);
    if (b >= 0) flowStars.push({ star: `流${type}`, branch: b, note: `${star}化${type}` });
  }
  // 流禄存、流羊陀、流魁钺
  const { lucun, qingyang, tuoluo } = lucunYangTuo(stem);
  const { kui, yue } = tiankuiTianyue(stem);
  flowStars.push({ star: '流禄', branch: lucun, note: '流禄存' });
  flowStars.push({ star: '流羊', branch: qingyang, note: '流擎羊' });
  flowStars.push({ star: '流陀', branch: tuoluo, note: '流陀罗' });
  flowStars.push({ star: '流魁', branch: kui, note: '流天魁' });
  flowStars.push({ star: '流钺', branch: yue, note: '流天钺' });

  // 所在大限
  const daxian: DaxianEntry | null =
    chart.daxian.find((d) => age >= d.startAge && age <= d.endAge) ?? null;

  return {
    year,
    ganZhi,
    stem,
    branch,
    age,
    mingBranch: branch,
    daxian,
    flowStars,
    doujunBranch: getDoujunBranch(branch, chart.lunarMonth, chart.hourBranch),
    xiaoxianBranch: getXiaoxianBranch(chart.yearBranch, chart.gender, age),
  };
}

/** 流月命宫序列：斗君宫为正月，顺行 */
export function getLiuYueBranches(doujunBranch: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < 12; i++) arr.push(next(doujunBranch, i));
  return arr;
}
