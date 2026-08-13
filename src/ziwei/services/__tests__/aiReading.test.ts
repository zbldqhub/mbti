import { describe, it, expect } from 'vitest';
import { extractJson, normalizeReading, buildChartSummary } from '../aiReading';
import { buildChart } from '../../engine/chart';
import { lunarToSolar, getLeapMonthOfYear } from '../../engine/calendar';

const VALID = {
  summary: '总述',
  natal: { title: '一、本命格局：测试', points: ['要点1', '要点2'] },
  decade: { title: '二、当前大限', intro: '定位', points: ['要点1'] },
  yearly: {
    title: '三、流年运势',
    intro: '基调',
    aspects: [
      { name: '事业运', stars: 4, points: ['a'] },
      { name: '财运', stars: 9, points: ['b'] }, // 超界应被夹到 5
    ],
  },
  conclusion: {
    text: '总结',
    advice: [{ domain: '事业', text: '建议' }],
    motto: '格言',
  },
};

describe('AI 解读输出解析', () => {
  it('标准 JSON 正常解析，星级夹取到 1-5', () => {
    const r = normalizeReading(extractJson(JSON.stringify(VALID)));
    expect(r.summary).toBe('总述');
    expect(r.yearly.aspects[0].stars).toBe(4);
    expect(r.yearly.aspects[1].stars).toBe(5);
  });

  it('流年方面固定六项、按规范顺序、缺失自动补默认', () => {
    const r = normalizeReading(extractJson(JSON.stringify(VALID)));
    expect(r.yearly.aspects.map((a) => a.name)).toEqual([
      '事业运', '财运', '感情运', '健康运', '贵人运', '出行变动运',
    ]);
    // VALID 只提供了事业/财运，其余补默认
    expect(r.yearly.aspects[2].stars).toBe(3);
    expect(r.yearly.aspects[2].points[0]).toContain('平稳');
  });

  it('容忍 markdown 代码块包裹与首尾杂文字', () => {
    const wrapped = `好的，以下是解读：\n\`\`\`json\n${JSON.stringify(VALID)}\n\`\`\`\n希望对你有帮助`;
    const r = normalizeReading(extractJson(wrapped));
    expect(r.natal.points).toHaveLength(2);
  });

  it('缺关键字段抛异常', () => {
    expect(() => normalizeReading({})).toThrow();
    expect(() => normalizeReading({ summary: 'x' })).toThrow();
  });

  it('extractJson 对无 JSON 文本抛异常', () => {
    expect(() => extractJson('没有 JSON')).toThrow();
  });
});

describe('农历转公历', () => {
  it('闰八月十九（1995）→ 1995-10-13', () => {
    expect(lunarToSolar(1995, 8, 19, true)).toEqual({ year: 1995, month: 10, day: 13 });
  });
  it('普通月：1990 五月初一 → 1990-05-24', () => {
    expect(lunarToSolar(1990, 5, 1, false)).toEqual({ year: 1990, month: 5, day: 24 });
  });
  it('该年无此闰月抛错', () => {
    expect(() => lunarToSolar(1990, 3, 15, true)).toThrow('没有闰3月');
  });
  it('该月无此日抛错（1995 闰八月仅 29 天）', () => {
    expect(() => lunarToSolar(1995, 8, 30, true)).toThrow('只有 29 天');
  });
  it('闰月查询：1995 闰八月、1990 闰五月', () => {
    expect(getLeapMonthOfYear(1995)).toBe(8);
    expect(getLeapMonthOfYear(1990)).toBe(5);
  });
});

describe('命盘摘要构造', () => {
  it('包含关键信息段', () => {
    const chart = buildChart({
      name: '溥仪', gender: 'male', year: 1906, month: 2, day: 6, hour: 11, minute: 30,
    });
    const s = buildChartSummary(chart, new Date('2026-08-13'));
    expect(s).toContain('阳男');
    expect(s).toContain('火六局');
    expect(s).toContain('命宫在申');
    expect(s).toContain('【十二宫星曜】');
    expect(s).toContain('【生年四化】');
    expect(s).toContain('天同化禄');
    expect(s).toContain('【当前大限】');
    expect(s).toContain('【今年流年】2026年（丙午）');
  });
});
