// 大限、小限、长生十二神、命主身主

import { next, prev, CHANGSHENG_12 } from './constants';
import type { Gender } from '../types';

/** 阳男阴女顺行，阴男阳女逆行 */
export function isForward(yearStem: number, gender: Gender): boolean {
  const yangYear = yearStem % 2 === 0;
  return (yangYear && gender === 'male') || (!yangYear && gender === 'female');
}

export interface DaxianSpec {
  branch: number;
  startAge: number;
  endAge: number;
}

/** 大限：起命宫，每十年一宫，起运岁数 = 五行局数 */
export function getDaxian(mingBranch: number, juNum: number, forward: boolean): DaxianSpec[] {
  const list: DaxianSpec[] = [];
  for (let k = 0; k < 12; k++) {
    list.push({
      branch: forward ? next(mingBranch, k) : prev(mingBranch, k),
      startAge: juNum + k * 10,
      endAge: juNum + k * 10 + 9,
    });
  }
  return list;
}

/** 长生十二神起点：金生巳，木生亥，火生寅，水土生申 */
export function getChangshengStart(juNum: number): number {
  const table: Record<number, number> = { 4: 5, 3: 11, 6: 2, 2: 8, 5: 8 };
  return table[juNum];
}

/** 各宫支的长生十二神 */
export function getChangshengMap(juNum: number, forward: boolean): Record<number, string> {
  const start = getChangshengStart(juNum);
  const map: Record<number, string> = {};
  for (let i = 0; i < 12; i++) {
    const branch = forward ? next(start, i) : prev(start, i);
    map[branch] = CHANGSHENG_12[i];
  }
  return map;
}

/** 小限起点（冲墓库）：申子辰起戌，寅午戌起辰，巳酉丑起未，亥卯未起丑 */
export function getXiaoxianStart(yearBranch: number): number {
  if ([8, 0, 4].includes(yearBranch)) return 10;
  if ([2, 6, 10].includes(yearBranch)) return 4;
  if ([5, 9, 1].includes(yearBranch)) return 7;
  return 1;
}

/** 某虚岁的小限宫（男顺女逆） */
export function getXiaoxianBranch(yearBranch: number, gender: Gender, age: number): number {
  const start = getXiaoxianStart(yearBranch);
  return gender === 'male' ? next(start, age - 1) : prev(start, age - 1);
}

/** 命主（生年支）：子贪狼 丑亥巨门 寅戌禄存 卯酉文曲 辰申廉贞 巳未武曲 午破军 */
export function getMingZhu(yearBranch: number): string {
  return ['贪狼', '巨门', '禄存', '文曲', '廉贞', '武曲', '破军', '武曲', '廉贞', '文曲', '禄存', '巨门'][yearBranch];
}

/** 身主（生年支）：子午火星 丑未天相 寅申天梁 卯酉天同 辰戌文昌 巳亥天机 */
export function getShenZhu(yearBranch: number): string {
  return ['火星', '天相', '天梁', '天同', '文昌', '天机', '火星', '天相', '天梁', '天同', '文昌', '天机'][yearBranch];
}
