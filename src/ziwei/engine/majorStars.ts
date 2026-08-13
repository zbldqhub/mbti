// 安十四正曜
// 起紫微：直接采用《安星法及推断实例》书末「安紫微星表」全表（五行局 × 农历生日 → 宫支），
// 已与通行「商数起寅、凑局奇退偶进」算法做 150 组全量交叉验证，结果一致。
// 索引：子=0 丑=1 寅=2 卯=3 辰=4 巳=5 午=6 未=7 申=8 酉=9 戌=10 亥=11

import { next, prev } from './constants';

/** 安紫微星表：ZIWEI_TABLE[局数][生日-1] = 宫支索引 */
const ZIWEI_TABLE: Record<number, number[]> = {
  2: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 0, 0, 1, 1, 2, 2, 3, 3, 4],
  3: [4, 1, 2, 5, 2, 3, 6, 3, 4, 7, 4, 5, 8, 5, 6, 9, 6, 7, 10, 7, 8, 11, 8, 9, 0, 9, 10, 1, 10, 11],
  4: [11, 4, 1, 2, 0, 5, 2, 3, 1, 6, 3, 4, 2, 7, 4, 5, 3, 8, 5, 6, 4, 9, 6, 7, 5, 10, 7, 8, 6, 11],
  5: [6, 11, 4, 1, 2, 7, 0, 5, 2, 3, 8, 1, 6, 3, 4, 9, 2, 7, 4, 5, 10, 3, 8, 5, 6, 11, 4, 9, 6, 7],
  6: [9, 6, 11, 4, 1, 2, 10, 7, 0, 5, 2, 3, 11, 8, 1, 6, 3, 4, 0, 9, 2, 7, 4, 5, 1, 10, 3, 8, 5, 6],
};

/** 紫微星所在宫支 */
export function getZiweiBranch(lunarDay: number, juNum: number): number {
  return ZIWEI_TABLE[juNum][lunarDay - 1];
}

/** 天府与紫微斜对寅申轴（已核书中「紫微天府对照表」） */
export function getTianfuBranch(ziwei: number): number {
  return (((4 - ziwei) % 12) + 12) % 12;
}

/** 紫微系（自紫微逆行）偏移，已核书中紫微系安星表 */
const ZIWEI_SERIES: { star: string; offset: number }[] = [
  { star: '天机', offset: 1 },
  { star: '太阳', offset: 3 },
  { star: '武曲', offset: 4 },
  { star: '天同', offset: 5 },
  { star: '廉贞', offset: 8 },
];

/** 天府系（自天府顺行）偏移，已核书中天府系安星表 */
const TIANFU_SERIES: { star: string; offset: number }[] = [
  { star: '太阴', offset: 1 },
  { star: '贪狼', offset: 2 },
  { star: '巨门', offset: 3 },
  { star: '天相', offset: 4 },
  { star: '天梁', offset: 5 },
  { star: '七杀', offset: 6 },
  { star: '破军', offset: 10 },
];

/** 返回十四正曜落宫：star → branch */
export function placeMajorStars(ziwei: number): Record<string, number> {
  const result: Record<string, number> = { 紫微: ziwei };
  for (const { star, offset } of ZIWEI_SERIES) {
    result[star] = prev(ziwei, offset);
  }
  const tianfu = getTianfuBranch(ziwei);
  result['天府'] = tianfu;
  for (const { star, offset } of TIANFU_SERIES) {
    result[star] = next(tianfu, offset);
  }
  return result;
}
