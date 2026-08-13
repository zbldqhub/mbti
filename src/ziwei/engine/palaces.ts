// 安命身宫、布十二宫、安宫干（五虎遁）
// 口诀：斗柄建寅起正月，数至生月顺流行。子时起数生时止，逆回安命顺安身。

import { next, prev } from './constants';

/** 寅宫地支索引 */
const YIN = 2;

/**
 * 命宫地支：寅起正月顺数至生月，从该宫起子时逆数至生时。
 * 身宫地支：同起点，顺数至生时。
 */
export function getMingBodyBranch(lunarMonth: number, hourBranch: number): { ming: number; body: number } {
  const monthPalace = next(YIN, lunarMonth - 1);
  return {
    ming: prev(monthPalace, hourBranch),
    body: next(monthPalace, hourBranch),
  };
}

/**
 * 宫名序号（0=命宫 … 11=父母）：由命宫起逆行（地支递减）。
 */
export function getPalaceNameIndex(mingBranch: number, branch: number): number {
  return (((mingBranch - branch) % 12) + 12) % 12;
}

/** 五虎遁：年干 → 寅宫天干 */
const YIN_STEM_BY_YEAR_STEM: Record<number, number> = {
  0: 2, // 甲 → 丙寅
  1: 4, // 乙 → 戊寅
  2: 6, // 丙 → 庚寅
  3: 8, // 丁 → 壬寅
  4: 0, // 戊 → 甲寅
  5: 2, // 己 → 丙寅
  6: 4, // 庚 → 戊寅
  7: 6, // 辛 → 庚寅
  8: 8, // 壬 → 壬寅
  9: 0, // 癸 → 甲寅
};

/** 某宫支的天干 */
export function getPalaceStem(yearStem: number, branch: number): number {
  const yinStem = YIN_STEM_BY_YEAR_STEM[yearStem];
  const offset = ((branch - YIN) % 12 + 12) % 12; // 与寅宫的地支距离（顺行方向）
  return (yinStem + offset) % 10;
}
