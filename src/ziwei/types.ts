// 紫微斗数排盘 — 类型定义
// 地支索引：子=0 丑=1 寅=2 卯=3 辰=4 巳=5 午=6 未=7 申=8 酉=9 戌=10 亥=11
// 天干索引：甲=0 乙=1 丙=2 丁=3 戊=4 己=5 庚=6 辛=7 壬=8 癸=9

export type Gender = 'male' | 'female';

export interface BirthInput {
  name: string;
  gender: Gender;
  /** 公历 */
  year: number;
  month: number;
  day: number;
  /** 24 小时制 */
  hour: number;
  minute: number;
  /** 时辰不详时按午时处理并标注 */
  unknownTime?: boolean;
}

/** 星曜类别 */
export type StarCategory = 'major' | 'aux' | 'sha' | 'misc';

/** 亮度：庙 / 旺 / 得 / 平 / 闲 / 陷（书中部分宫位标「地」即得地，部分星曜无评定） */
export type Brightness = '庙' | '旺' | '得' | '平' | '闲' | '陷' | '';

export type SihuaType = '禄' | '权' | '科' | '忌';

export interface StarInstance {
  name: string;
  category: StarCategory;
  brightness?: Brightness;
  /** 生年四化标记（化禄/化权/化科/化忌挂于正曜或昌曲等） */
  sihua?: SihuaType;
}

/** 十二宫名称（从命宫起逆行） */
export const PALACE_NAMES = [
  '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
  '迁移', '交友', '事业', '田宅', '福德', '父母',
] as const;

export interface PalaceData {
  /** 宫支索引 0-11 */
  branch: number;
  /** 宫干索引 0-9 */
  stem: number;
  /** 宫名序号：0=命宫 … 11=父母 */
  nameIndex: number;
  isBodyPalace: boolean;
  stars: StarInstance[];
  /** 长生十二神之一 */
  changsheng: string;
  /** 大限虚岁区间（每宫必有一段） */
  daxianStart: number;
  daxianEnd: number;
  /** 小限虚岁（哪些虚岁小限落本宫） */
  xiaoxianAges: number[];
}

export interface DaxianEntry {
  index: number;
  branch: number;
  stem: number;
  startAge: number;
  endAge: number;
  palaceNameIndex: number;
}

export interface ChartData {
  name: string;
  gender: Gender;
  yinyang: '阳男' | '阴男' | '阳女' | '阴女';
  unknownTime: boolean;
  solarText: string;
  lunarYearGanZhi: string;
  /** 农历年（数字，虚岁推算用） */
  lunarYear: number;
  lunarMonth: number;
  /** 闰月十六日后出生，排盘月按下月论 */
  monthAdjusted: boolean;
  lunarDay: number;
  isLeapMonth: boolean;
  lunarText: string;
  hourBranch: number;
  yearStem: number;
  yearBranch: number;
  mingBranch: number;
  bodyBranch: number;
  /** 五行局局数 2-6 */
  juNum: number;
  juName: string;
  mingZhu: string;
  shenZhu: string;
  /** 按地支索引 0-11 的十二宫 */
  palaces: PalaceData[];
  daxian: DaxianEntry[];
  /** 小限起点宫支 */
  xiaoxianStartBranch: number;
  sihua: { star: string; type: SihuaType; branch: number }[];
}

/** 流年数据 */
export interface YearlyData {
  year: number;
  ganZhi: string;
  stem: number;
  branch: number;
  /** 虚岁 */
  age: number;
  /** 流年命宫（太岁宫）地支 */
  mingBranch: number;
  /** 该年所在大限 */
  daxian: DaxianEntry | null;
  /** 流年四化/禄存/羊陀/魁钺落宫 */
  flowStars: { star: string; branch: number; note: string }[];
  /** 当年斗君所在宫 */
  doujunBranch: number;
  /** 小限所在宫 */
  xiaoxianBranch: number;
}
