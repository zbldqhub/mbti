import { describe, it, expect } from 'vitest';
import { extractJson, normalizeReading, buildChartSummary } from '../aiReading';
import { buildChart } from '../../engine/chart';

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
