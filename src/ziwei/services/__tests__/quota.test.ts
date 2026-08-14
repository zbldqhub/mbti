import { describe, it, expect } from 'vitest';
import {
  getTodayUsage, todayRemaining, bumpTodayUsage, DAILY_FREE_LIMIT,
} from '../aiReading';

function fakeStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => { map.set(k, v); },
  };
}

describe('每日免费次数计数', () => {
  const now = new Date('2026-08-14T10:00:00');

  it('初始为 0，剩余等于上限', () => {
    const s = fakeStorage();
    expect(getTodayUsage(s, now)).toBe(0);
    expect(todayRemaining(s, now)).toBe(DAILY_FREE_LIMIT);
  });

  it('成功后记一次，剩余递减', () => {
    const s = fakeStorage();
    bumpTodayUsage(s, now);
    bumpTodayUsage(s, now);
    expect(getTodayUsage(s, now)).toBe(2);
    expect(todayRemaining(s, now)).toBe(DAILY_FREE_LIMIT - 2);
  });

  it('跨天自动清零', () => {
    const s = fakeStorage();
    bumpTodayUsage(s, now);
    bumpTodayUsage(s, now);
    const tomorrow = new Date('2026-08-15T08:00:00');
    expect(getTodayUsage(s, tomorrow)).toBe(0);
    expect(todayRemaining(s, tomorrow)).toBe(DAILY_FREE_LIMIT);
  });

  it('损坏数据按 0 处理', () => {
    const s = fakeStorage();
    s.setItem('ziwei_read_usage', 'not-json');
    expect(getTodayUsage(s, now)).toBe(0);
  });

  it('剩余次数不为负', () => {
    const s = fakeStorage();
    for (let i = 0; i < 10; i++) bumpTodayUsage(s, now);
    expect(todayRemaining(s, now)).toBe(0);
  });
});
