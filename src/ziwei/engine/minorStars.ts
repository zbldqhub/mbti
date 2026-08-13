// 安辅佐煞杂曜 —— 口诀出自《安星法》，均经书中金标准命盘核对
// 约定：m=农历月(1-12)，d=农历日(1-30)，h=时辰支(0-11)，
//       ys=年干(0-9)，yb=年支(0-11)，next/prev 为顺/逆行

import { next, prev } from './constants';

/** 左辅：辰上起正月顺数至生月；右弼：戌上起正月逆数至生月 */
export function zuofuYoubi(m: number): { zuofu: number; youbi: number } {
  return { zuofu: next(4, m - 1), youbi: prev(10, m - 1) };
}

/** 文曲：辰上起子时顺数至生时；文昌：戌上起子时逆数至生时 */
export function wenchangWenqu(h: number): { wenchang: number; wenqu: number } {
  return { wenchang: prev(10, h), wenqu: next(4, h) };
}

/** 地劫：亥上起子时顺数；地空：亥上起子时逆数 */
export function dikongDijie(h: number): { dikong: number; dijie: number } {
  return { dikong: prev(11, h), dijie: next(11, h) };
}

/** 天魁天钺（年干）：甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，六辛逢马虎 */
export function tiankuiTianyue(ys: number): { kui: number; yue: number } {
  const table: Record<number, [number, number]> = {
    0: [1, 7], 4: [1, 7], 6: [1, 7], // 甲戊庚 → 丑未
    1: [0, 8], 5: [0, 8], // 乙己 → 子申
    2: [11, 9], 3: [11, 9], // 丙丁 → 亥酉
    8: [3, 5], 9: [3, 5], // 壬癸 → 卯巳
    7: [6, 2], // 辛 → 午寅
  };
  const [kui, yue] = table[ys];
  return { kui, yue };
}

/** 禄存（年干）；擎羊在禄前一宫（顺行），陀罗在禄后一宫（逆行） */
export function lucunYangTuo(ys: number): { lucun: number; qingyang: number; tuoluo: number } {
  const table: Record<number, number> = {
    0: 2, 1: 3, 2: 5, 3: 6, 4: 5, 5: 6, 6: 8, 7: 9, 8: 11, 9: 0,
  }; // 甲寅乙卯丙戊巳丁己午庚申辛酉壬亥癸子
  const lucun = table[ys];
  return { lucun, qingyang: next(lucun), tuoluo: prev(lucun) };
}

/** 火星铃星（年支+生时）：申子辰人寅戌扬，寅午戌人丑卯方，巳酉丑人卯戌位，亥卯未人酉戌房 */
export function huoling(yb: number, h: number): { huo: number; ling: number } {
  let huoBase: number; let lingBase: number;
  if ([8, 0, 4].includes(yb)) { huoBase = 2; lingBase = 10; } // 申子辰 → 火寅铃戌
  else if ([2, 6, 10].includes(yb)) { huoBase = 1; lingBase = 3; } // 寅午戌 → 火丑铃卯
  else if ([5, 9, 1].includes(yb)) { huoBase = 3; lingBase = 10; } // 巳酉丑 → 火卯铃戌
  else { huoBase = 9; lingBase = 10; } // 亥卯未 → 火酉铃戌
  return { huo: next(huoBase, h), ling: next(lingBase, h) };
}

/** 天马（年支）：申子辰在寅，寅午戌在申，巳酉丑在亥，亥卯未在巳 */
export function tianma(yb: number): number {
  if ([8, 0, 4].includes(yb)) return 2;
  if ([2, 6, 10].includes(yb)) return 8;
  if ([5, 9, 1].includes(yb)) return 11;
  return 5;
}

/** 天空：年支前一宫（顺行下一宫），已核：午年天空在未 */
export function tiankong(yb: number): number {
  return next(yb);
}

/** 红鸾：卯上起子年逆数至生年支；天喜在对宫 */
export function hongluanTianxi(yb: number): { hongluan: number; tianxi: number } {
  const hongluan = prev(3, yb);
  return { hongluan, tianxi: next(hongluan, 6) };
}

/** 天哭：午宫起子年逆数；天虚：午宫起子年顺数 */
export function tiankuTianxu(yb: number): { ku: number; xu: number } {
  return { ku: prev(6, yb), xu: next(6, yb) };
}

/** 孤辰寡宿（年支三会方）：寅卯辰方安巳丑，巳午未方怕申辰，申酉戌方属亥未，亥子丑方寅戌嗔 */
export function guchenGuasu(yb: number): { gu: number; gua: number } {
  if ([2, 3, 4].includes(yb)) return { gu: 5, gua: 1 };
  if ([5, 6, 7].includes(yb)) return { gu: 8, gua: 4 };
  if ([8, 9, 10].includes(yb)) return { gu: 11, gua: 7 };
  return { gu: 2, gua: 10 };
}

/** 天官天福（年干）：甲喜羊鸡乙龙猴，丙年蛇鼠一窝谋，丁虎擒猪戊玉兔，
 *  己鸡居然与虎俦，庚猪马辛鸡蛇走，壬犬马癸马蛇游（前为天官，后为天福） */
export function tianguanTianfu(ys: number): { guan: number; fu: number } {
  const table: Record<number, [number, number]> = {
    0: [7, 9], // 甲：未酉
    1: [4, 8], // 乙：辰申
    2: [5, 0], // 丙：巳子
    3: [2, 11], // 丁：寅亥
    4: [3, 3], // 戊：卯（官福同宫）
    5: [9, 2], // 己：酉寅
    6: [11, 6], // 庚：亥午
    7: [9, 5], // 辛：酉巳
    8: [10, 6], // 壬：戌午
    9: [6, 5], // 癸：午巳
  };
  const [guan, fu] = table[ys];
  return { guan, fu };
}

/**
 * 截空（年干）：戊癸子丑起，推至甲己止；申酉是截空，戌亥不论此。
 * 即：戊癸→子丑，丁壬→寅卯，丙辛→辰巳，乙庚→午未，甲己→申酉。
 * 阳年生人阳宫为正空、阴宫为傍空；阴年生人反之。
 */
export function jiekong(ys: number): { zheng: number; bang: number } {
  const pairByStem: Record<number, [number, number]> = {
    4: [0, 1], 9: [0, 1], // 戊癸 → 子丑
    3: [2, 3], 8: [2, 3], // 丁壬 → 寅卯
    2: [4, 5], 7: [4, 5], // 丙辛 → 辰巳
    1: [6, 7], 6: [6, 7], // 乙庚 → 午未
    0: [8, 9], 5: [8, 9], // 甲己 → 申酉
  };
  const [a, b] = pairByStem[ys];
  const yangYear = ys % 2 === 0;
  const aYang = a % 2 === 0;
  // 阳年：阳宫为正空；阴年：阴宫为正空
  const zheng = yangYear === aYang ? a : b;
  const bang = zheng === a ? b : a;
  return { zheng, bang };
}

/** 旬空（年干支）：年干支顺数至癸后二位。正傍空规则同截空。 */
export function xunkong(ys: number, yb: number): { zheng: number; bang: number } {
  const a = (((yb - ys - 2) % 12) + 12) % 12;
  const b = (((yb - ys - 1) % 12) + 12) % 12;
  const yangYear = ys % 2 === 0;
  const aYang = a % 2 === 0;
  const zheng = yangYear === aYang ? a : b;
  const bang = zheng === a ? b : a;
  return { zheng, bang };
}

/** 天刑：酉上起正月顺数；天姚：丑上起正月顺数 */
export function tianxingTianyao(m: number): { xing: number; yao: number } {
  return { xing: next(9, m - 1), yao: next(1, m - 1) };
}

/** 解神：单月取月建冲宫，双月同前一单月（正月起申，已核） */
export function jieshen(m: number): number {
  const odd = m % 2 === 1 ? m : m - 1;
  // 月建宫 = 寅 + (月-1)，冲宫 = +6
  return next(next(2, odd - 1), 6);
}

/** 天巫：巳申寅亥分轮十二月（正月起巳，已核） */
export function tianwu(m: number): number {
  return [5, 8, 2, 11][(m - 1) % 4];
}

/** 天月：一犬二蛇三在龙，四虎五羊六兔宫，七猪八羊九在虎，十马冬犬腊寅中 */
export function tianyue(m: number): number {
  return [10, 5, 4, 2, 7, 3, 11, 7, 2, 6, 10, 2][m - 1];
}

/** 阴煞：寅子戌申午辰，分六月轮排（正月起寅，已核） */
export function yinsha(m: number): number {
  return [2, 0, 10, 8, 6, 4][(m - 1) % 6];
}

/** 三台：左辅起初一顺数至生日；八座：右弼起初一逆数至生日 */
export function santaiBazuo(zuofu: number, youbi: number, d: number): { santai: number; bazuo: number } {
  return { santai: next(zuofu, d - 1), bazuo: prev(youbi, d - 1) };
}

/** 恩光：文昌顺数至生日退后一步；天贵：文曲顺数至生日退后一步 */
export function enguangTiangui(wenchang: number, wenqu: number, d: number): { enguang: number; tiangui: number } {
  return { enguang: next(wenchang, d - 2), tiangui: next(wenqu, d - 2) };
}

/** 台辅：文曲前二位（顺行）；封诰：文曲后二位（逆行） */
export function taifuFenggao(wenqu: number): { taifu: number; fenggao: number } {
  return { taifu: next(wenqu, 2), fenggao: prev(wenqu, 2) };
}
