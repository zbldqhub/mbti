// 排盘引擎对照测试
// 金标准：王亭之《安星法及推断实例》推断实例第一例（溥仪命盘）+ 总结文档例子

import { describe, it, expect } from 'vitest';
import { buildChart } from '../chart';
import { getZiweiBranch } from '../majorStars';
import { getMingBodyBranch, getPalaceStem } from '../palaces';
import { getJuNum } from '../nayin';
import { next } from '../constants';
import type { ChartData } from '../../types';

/** 通行起紫微算法（交叉验证用）：商数起寅，余数凑局，奇退偶进 */
function ziweiStandard(day: number, ju: number): number {
  if (day % ju === 0) return next(2, day / ju - 1);
  const x = ju - (day % ju);
  const q = (day + x) / ju;
  const base = next(2, q - 1);
  return x % 2 === 1 ? next(base, -x) : next(base, x);
}

function palaceOf(chart: ChartData, branch: number) {
  return chart.palaces[branch];
}

function starNames(chart: ChartData, branch: number): string[] {
  return palaceOf(chart, branch).stars.map((s) => s.name);
}

describe('安命身宫（文档例：三月巳时 → 命宫亥、身宫酉）', () => {
  it('三月巳时', () => {
    const { ming, body } = getMingBodyBranch(3, 5);
    expect(ming).toBe(11); // 亥
    expect(body).toBe(9); // 酉
  });
});

describe('五行局（文档例：命宫干支辛卯 → 木三局）', () => {
  it('辛卯纳音木', () => {
    expect(getJuNum(7, 3)).toBe(3);
  });
});

describe('起紫微', () => {
  it('文档例：22 日木三局 → 亥', () => {
    expect(getZiweiBranch(22, 3)).toBe(11);
  });
  it('溥仪例：13 日火六局 → 亥', () => {
    expect(getZiweiBranch(13, 6)).toBe(11);
  });
  it('书中安紫微星表转录抽检（水二局/火六局整行）', () => {
    const shui2 = [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 0, 0, 1, 1, 2, 2, 3, 3, 4];
    const huo6 = [9, 6, 11, 4, 1, 2, 10, 7, 0, 5, 2, 3, 11, 8, 1, 6, 3, 4, 0, 9, 2, 7, 4, 5, 1, 10, 3, 8, 5, 6];
    for (let d = 1; d <= 30; d++) {
      expect(getZiweiBranch(d, 2), `水二局${d}日`).toBe(shui2[d - 1]);
      expect(getZiweiBranch(d, 6), `火六局${d}日`).toBe(huo6[d - 1]);
    }
  });
  it('与通行算法全量交叉验证（日 1-30 × 局 2-6）', () => {
    for (let ju = 2; ju <= 6; ju++) {
      for (let day = 1; day <= 30; day++) {
        expect(getZiweiBranch(day, ju), `day=${day} ju=${ju}`).toBe(ziweiStandard(day, ju));
      }
    }
  });
});

describe('五虎遁（丙年：寅起庚）', () => {
  it('丙年各宫干', () => {
    expect(getPalaceStem(2, 2)).toBe(6); // 庚寅
    expect(getPalaceStem(2, 5)).toBe(9); // 癸巳
    expect(getPalaceStem(2, 8)).toBe(2); // 丙申
    expect(getPalaceStem(2, 0)).toBe(6); // 庚子
    expect(getPalaceStem(2, 1)).toBe(7); // 辛丑
  });
});

// ========== 金标准：溥仪命盘 ==========
// 《安星法》推断实例第一例：丙午年正月十三日午时，阳男，火六局
// （公历 1906-02-06 午时；命书即以此盘为准）
describe('溥仪命盘（书载金标准）', () => {
  const chart = buildChart({
    name: '溥仪', gender: 'male',
    year: 1906, month: 2, day: 6, hour: 11, minute: 30,
  });

  it('基本信息', () => {
    expect(chart.lunarYearGanZhi).toBe('丙午');
    expect(chart.lunarMonth).toBe(1);
    expect(chart.lunarDay).toBe(13);
    expect(chart.hourBranch).toBe(6); // 午时
    expect(chart.yinyang).toBe('阳男');
    expect(chart.juNum).toBe(6); // 火六局
    expect(chart.juName).toBe('火六局');
    expect(chart.mingBranch).toBe(8); // 命宫在申
    expect(chart.bodyBranch).toBe(8); // 身命同宫
    expect(chart.mingZhu).toBe('破军');
    expect(chart.shenZhu).toBe('火星');
  });

  it('十四正曜', () => {
    const expectStar = (star: string, branch: number) =>
      expect(starNames(chart, branch), `${star}应在${branch}`).toContain(star);
    expectStar('紫微', 11); expectStar('七杀', 11); // 亥：紫杀
    expectStar('天机', 10); expectStar('天梁', 10); // 戌：机梁
    expectStar('太阳', 8); expectStar('巨门', 8); // 申：日巨
    expectStar('武曲', 7); expectStar('贪狼', 7); // 未：武贪
    expectStar('天同', 6); expectStar('太阴', 6); // 午：同阴
    expectStar('天府', 5); // 巳
    expectStar('天相', 9); // 酉
    expectStar('廉贞', 3); expectStar('破军', 3); // 卯：廉破
  });

  it('四化（丙年：同禄机权昌科廉忌）', () => {
    const sihuaOf = (star: string) =>
      chart.sihua.find((s) => s.star === star)?.type;
    expect(sihuaOf('天同')).toBe('禄');
    expect(sihuaOf('天机')).toBe('权');
    expect(sihuaOf('文昌')).toBe('科');
    expect(sihuaOf('廉贞')).toBe('忌');
  });

  it('辅佐煞杂曜', () => {
    const has = (star: string, branch: number) =>
      expect(starNames(chart, branch), `${star}应在宫${branch}`).toContain(star);
    has('禄存', 5); has('擎羊', 6); has('陀罗', 4);
    has('天魁', 11); has('天钺', 9);
    has('文昌', 4); has('文曲', 10);
    has('左辅', 4); has('右弼', 10);
    has('火星', 7); has('铃星', 9);
    has('地空', 5); has('地劫', 5);
    has('天马', 8); has('天空', 7);
    has('红鸾', 9); has('天喜', 3);
    has('天哭', 0); has('天虚', 0);
    has('孤辰', 8); has('寡宿', 4);
    has('天官', 5); has('天福', 0);
    has('截空', 4); has('截空', 5);
    has('旬空', 2); has('旬空', 3);
    has('天刑', 9); has('天姚', 1);
    has('解神', 8); has('天巫', 5);
    has('天月', 10); has('阴煞', 2);
    has('三台', 4); has('八座', 10);
    has('恩光', 3); has('天贵', 9);
    has('台辅', 0); has('封诰', 8);
  });

  it('天伤天使（阳男：伤在交友、使在疾厄）', () => {
    const jie厄 = chart.palaces.find((p) => p.nameIndex === 5)!;
    const jiaoYou = chart.palaces.find((p) => p.nameIndex === 7)!;
    expect(jiaoYou.stars.map((s) => s.name)).toContain('天伤');
    expect(jie厄.stars.map((s) => s.name)).toContain('天使');
  });

  it('大限（阳男顺行，6 岁起）', () => {
    expect(chart.daxian[0]).toMatchObject({ branch: 8, startAge: 6, endAge: 15 });
    expect(chart.daxian[1]).toMatchObject({ branch: 9, startAge: 16, endAge: 25 });
    expect(chart.daxian[2]).toMatchObject({ branch: 10, startAge: 26, endAge: 35 });
  });

  it('长生十二神（火六局长生在寅，顺行）', () => {
    expect(palaceOf(chart, 2).changsheng).toBe('长生');
    expect(palaceOf(chart, 3).changsheng).toBe('沐浴');
    expect(palaceOf(chart, 8).changsheng).toBe('病');
    expect(palaceOf(chart, 0).changsheng).toBe('胎');
  });

  it('小限（丙午年起辰宫，男顺行）', () => {
    expect(chart.xiaoxianStartBranch).toBe(4);
    expect(palaceOf(chart, 4).xiaoxianAges).toContain(1);
    expect(palaceOf(chart, 5).xiaoxianAges).toContain(2);
  });
});

// ========== 闰月分界（王亭之：闰月前十五日按本月，十六日起按下月） ==========
describe('闰月分界', () => {
  it('闰八月十九（1995-10-13 巳时 女）→ 按九月论，命宫在巳（辛巳）', () => {
    const c = buildChart({
      name: '闰月', gender: 'female',
      year: 1995, month: 10, day: 13, hour: 10, minute: 30,
    });
    expect(c.isLeapMonth).toBe(true);
    expect(c.monthAdjusted).toBe(true);
    expect(c.lunarMonth).toBe(9); // 排盘按九月
    expect(c.mingBranch).toBe(5); // 命宫在巳
    const ming = c.palaces[5];
    expect(ming.stem).toBe(7); // 辛
  });

  it('闰八月十五（1995-10-09 巳时）→ 仍按本月八月论，命宫在辰（庚辰）', () => {
    const c = buildChart({
      name: '闰月边界', gender: 'female',
      year: 1995, month: 10, day: 9, hour: 10, minute: 30,
    });
    expect(c.isLeapMonth).toBe(true);
    expect(c.monthAdjusted).toBe(false);
    expect(c.lunarMonth).toBe(8);
    expect(c.mingBranch).toBe(4); // 命宫在辰
    expect(c.palaces[4].stem).toBe(6); // 庚
  });
});

// ========== 阴男阳女逆行验证 ==========
describe('阳女（同生辰改性别）：大限逆行、长生逆行', () => {
  const chart = buildChart({
    name: '测试', gender: 'female',
    year: 1906, month: 2, day: 6, hour: 11, minute: 30,
  });

  it('大限逆行', () => {
    expect(chart.daxian[0]).toMatchObject({ branch: 8, startAge: 6 });
    expect(chart.daxian[1]).toMatchObject({ branch: 7, startAge: 16 });
    expect(chart.daxian[2]).toMatchObject({ branch: 6, startAge: 26 });
  });

  it('长生逆行', () => {
    expect(palaceOf(chart, 2).changsheng).toBe('长生');
    expect(palaceOf(chart, 1).changsheng).toBe('沐浴');
    expect(palaceOf(chart, 0).changsheng).toBe('冠带');
  });

  it('天伤天使互换（伤在疾厄、使在交友）', () => {
    const jie厄 = chart.palaces.find((p) => p.nameIndex === 5)!;
    const jiaoYou = chart.palaces.find((p) => p.nameIndex === 7)!;
    expect(jie厄.stars.map((s) => s.name)).toContain('天伤');
    expect(jiaoYou.stars.map((s) => s.name)).toContain('天使');
  });

  it('小限女逆行', () => {
    expect(palaceOf(chart, 4).xiaoxianAges).toContain(1);
    expect(palaceOf(chart, 3).xiaoxianAges).toContain(2);
  });
});
