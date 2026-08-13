// 推算总装：原局 + 大限 + 流年

import type { ChartData } from '../types';
import { interpretLifetime } from './lifetime';
import { interpretDecade } from './decade';
import { interpretYearly } from './yearly';
import type { ReadingSection } from './common';

export type { ReadingSection };

export function buildReading(chart: ChartData, now: Date = new Date()): ReadingSection[] {
  const thisYear = now.getFullYear();
  const age = thisYear - chart.lunarYear + 1;
  return [
    ...interpretLifetime(chart, age),
    interpretDecade(chart, age),
    interpretYearly(chart, thisYear, 6),
  ];
}
