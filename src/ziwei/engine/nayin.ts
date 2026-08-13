// 六十纳音 → 五行局
// 水二局=2 木三局=3 金四局=4 土五局=5 火六局=6

/** 三十对纳音（每对管两个甲子），元素对应局数 */
const NAYIN_PAIRS: { name: string; element: '金' | '木' | '水' | '火' | '土' }[] = [
  { name: '海中金', element: '金' }, // 甲子 乙丑
  { name: '炉中火', element: '火' }, // 丙寅 丁卯
  { name: '大林木', element: '木' }, // 戊辰 己巳
  { name: '路旁土', element: '土' }, // 庚午 辛未
  { name: '剑锋金', element: '金' }, // 壬申 癸酉
  { name: '山头火', element: '火' }, // 甲戌 乙亥
  { name: '涧下水', element: '水' }, // 丙子 丁丑
  { name: '城头土', element: '土' }, // 戊寅 己卯
  { name: '白蜡金', element: '金' }, // 庚辰 辛巳
  { name: '杨柳木', element: '木' }, // 壬午 癸未
  { name: '泉中水', element: '水' }, // 甲申 乙酉
  { name: '屋上土', element: '土' }, // 丙戌 丁亥
  { name: '霹雳火', element: '火' }, // 戊子 己丑
  { name: '松柏木', element: '木' }, // 庚寅 辛卯
  { name: '长流水', element: '水' }, // 壬辰 癸巳
  { name: '沙中金', element: '金' }, // 甲午 乙未
  { name: '山下火', element: '火' }, // 丙申 丁酉
  { name: '平地木', element: '木' }, // 戊戌 己亥
  { name: '壁上土', element: '土' }, // 庚子 辛丑
  { name: '金箔金', element: '金' }, // 壬寅 癸卯
  { name: '覆灯火', element: '火' }, // 甲辰 乙巳
  { name: '天河水', element: '水' }, // 丙午 丁未
  { name: '大驿土', element: '土' }, // 戊申 己酉
  { name: '钗钏金', element: '金' }, // 庚戌 辛亥
  { name: '桑柘木', element: '木' }, // 壬子 癸丑
  { name: '大溪水', element: '水' }, // 甲寅 乙卯
  { name: '沙中土', element: '土' }, // 丙辰 丁巳
  { name: '天上火', element: '火' }, // 戊午 己未
  { name: '石榴木', element: '木' }, // 庚申 辛酉
  { name: '大海水', element: '水' }, // 壬戌 癸亥
];

const ELEMENT_TO_JU: Record<string, number> = { 水: 2, 木: 3, 金: 4, 土: 5, 火: 6 };

/**
 * 由干支索引（干 0-9，支 0-11）求五行局局数。
 * 六十甲子序号：从甲子(0,0) 起，干支配对同步推进。
 */
export function getJuNum(stem: number, branch: number): number {
  // 六十甲子序号 n：n ≡ stem (mod 10)，n ≡ branch (mod 12)
  let n = -1;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stem && i % 12 === branch) { n = i; break; }
  }
  if (n < 0) throw new Error(`非法干支组合: ${stem}/${branch}`);
  const pair = NAYIN_PAIRS[Math.floor(n / 2)];
  return ELEMENT_TO_JU[pair.element];
}

/** 干支的纳音名（展示用） */
export function getNayinName(stem: number, branch: number): string {
  let n = -1;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stem && i % 12 === branch) { n = i; break; }
  }
  return NAYIN_PAIRS[Math.floor(n / 2)].name;
}
