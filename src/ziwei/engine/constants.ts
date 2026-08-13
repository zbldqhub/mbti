// 基础常量：天干地支、五行局、宫支网格

export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

/** 阳干：甲丙戊庚壬 */
export const YANG_STEMS = [0, 2, 4, 6, 8];

/** 五行局 */
export const JU_NAMES: Record<number, string> = {
  2: '水二局', 3: '木三局', 4: '金四局', 5: '土五局', 6: '火六局',
};

/** 长生十二神顺序 */
export const CHANGSHENG_12 = [
  '长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养',
] as const;

/**
 * 命盘 4×4 网格布局（中宫留白）。
 * grid[row][col] = 宫支索引，-1 表示中宫。
 * 巳 午 未 申
 * 辰        酉
 * 卯        戌
 * 寅 丑 子 亥
 */
export const GRID_LAYOUT: number[][] = [
  [5, 6, 7, 8],
  [4, -1, -1, 9],
  [3, -1, -1, 10],
  [2, 1, 0, 11],
];

/** 时辰名称 */
export const HOUR_BRANCH_NAMES = BRANCHES;

/** 阳宫（地支索引为偶数：子寅辰午申戌） */
export function isYangBranch(branch: number): boolean {
  return branch % 2 === 0;
}

/** 顺行 */
export function next(branch: number, steps = 1): number {
  return (((branch + steps) % 12) + 12) % 12;
}

/** 逆行 */
export function prev(branch: number, steps = 1): number {
  return next(branch, -steps);
}
