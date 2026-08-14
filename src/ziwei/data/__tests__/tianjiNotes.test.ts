// 天纪论断库 + 新增格局（半空折翅）测试

import { describe, it, expect } from 'vitest';
import { collectTianjiNotes, TIANJI_NOTES } from '../tianjiNotes';
import { detectPatterns } from '../patterns';
import { buildChart } from '../../engine/chart';

const PU_YI = { name: '溥仪', gender: 'male' as const, year: 1906, month: 2, day: 6, hour: 11, minute: 30 };
const LADY_95 = { name: '测试', gender: 'female' as const, year: 1995, month: 10, day: 13, hour: 10, minute: 30 };
// 木三局，命宫在巳，紫微在丑 → 廉贞贪狼双陷巳宫守命（半空折翅）
const LIAN_TAN = { name: '廉贪', gender: 'male' as const, year: 1990, month: 1, day: 24, hour: 15, minute: 0 };
// 化忌在命宫对宫（化忌冲命）
const JI_CHONG = { name: '忌冲', gender: 'female' as const, year: 1992, month: 6, day: 22, hour: 10, minute: 0 };

describe('天纪论断库', () => {
  it('条目文本完整、无编辑残留', () => {
    for (const n of TIANJI_NOTES) {
      expect(n.text.length).toBeGreaterThan(20);
      expect(n.text).not.toContain('softened');
      expect(n.text).not.toContain('placeholder');
    }
  });

  it('溥仪盘命中「煞星庙陷之别」，不命中男女有别', () => {
    const notes = collectTianjiNotes(buildChart(PU_YI));
    const ids = notes.map((n) => n.id);
    expect(ids).toContain('sha-miao-xian');
    expect(ids).not.toContain('nan-nv-you-bie');
  });

  it('1995 女命盘命中「男女有别」「紫微无辅弼」', () => {
    const notes = collectTianjiNotes(buildChart(LADY_95));
    const ids = notes.map((n) => n.id);
    expect(ids).toContain('nan-nv-you-bie');
    expect(ids).toContain('ziwei-wu-fu');
  });

  it('廉贪双陷巳宫守命 → 命中半空折翅论断', () => {
    const chart = buildChart(LIAN_TAN);
    expect(chart.mingBranch).toBe(5);
    const ids = collectTianjiNotes(chart).map((n) => n.id);
    expect(ids).toContain('ban-kong-zhe-chi');
  });

  it('注入条数不超过上限', () => {
    expect(collectTianjiNotes(buildChart(LADY_95), 3).length).toBeLessThanOrEqual(3);
  });
});

describe('格局：半空折翅（天纪）', () => {
  it('廉贪守命命中', () => {
    const patterns = detectPatterns(buildChart(LIAN_TAN));
    expect(patterns.map((p) => p.name)).toContain('半空折翅（天纪凶格）');
  });

  it('化忌冲命命中', () => {
    const patterns = detectPatterns(buildChart(JI_CHONG));
    expect(patterns.map((p) => p.name)).toContain('半空折翅（天纪凶格）');
  });

  it('溥仪盘不命中（化忌不冲命、无廉贪巳亥）', () => {
    const patterns = detectPatterns(buildChart(PU_YI));
    expect(patterns.map((p) => p.name)).not.toContain('半空折翅（天纪凶格）');
  });
});

// ========== 天纪吉格（真实生辰夹具） ==========
describe('天纪吉格识别', () => {
  const cases: [string, typeof PU_YI][] = [
    ['巨日格', { name: 't', gender: 'male', year: 1991, month: 1, day: 2, hour: 9, minute: 0 }],
    ['日月并明', { name: 't', gender: 'male', year: 1991, month: 1, day: 2, hour: 9, minute: 0 }],
    ['将星入命', { name: 't', gender: 'male', year: 1991, month: 1, day: 7, hour: 9, minute: 0 }],
    ['日月夹命', { name: 't', gender: 'male', year: 1991, month: 1, day: 9, hour: 21, minute: 0 }],
    ['七杀朝斗', { name: 't', gender: 'male', year: 1991, month: 1, day: 17, hour: 9, minute: 0 }],
    ['紫府坐垣', { name: 't', gender: 'male', year: 1991, month: 1, day: 20, hour: 21, minute: 0 }],
    ['英星入庙', { name: 't', gender: 'male', year: 1991, month: 1, day: 21, hour: 1, minute: 0 }],
    ['水澄桂萼', { name: 't', gender: 'male', year: 1991, month: 1, day: 25, hour: 1, minute: 0 }],
  ];
  for (const [name, input] of cases) {
    it(`${name} 命中且对应论断注入`, () => {
      const chart = buildChart(input);
      expect(detectPatterns(chart).map((p) => p.name)).toContain(name);
    });
  }

  it('紫府坐垣盘同时注入紫府坐垣论断', () => {
    const chart = buildChart({ name: 't', gender: 'male', year: 1991, month: 1, day: 20, hour: 21, minute: 0 });
    const ids = collectTianjiNotes(chart).map((n) => n.id);
    expect(ids).toContain('zifu-zuoyuan');
  });
});
