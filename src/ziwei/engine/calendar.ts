// 公历 → 农历 / 干支 / 时辰 封装（基于 lunar-javascript）
// 规则（依王亭之《安星法》）：
// - 年干支以立春换年（lunar-javascript 的 getYearInGanZhi 即立春分界）
// - 日界为凌晨 00:00，晚子时（23:00-24:00）归当日，不跨日
// - 闰月以月中为界：前十五日照本月推算，十六日至月底作下月推算
//   （《中州派紫微斗数讲义》「过节气与闰月」节原文）

import { Solar, Lunar, LunarYear } from 'lunar-javascript';
import { STEMS, BRANCHES } from './constants';

export interface CalendarInfo {
  lunarYear: number;
  /** 农历月（闰月分界调整后的排盘用月）1-12 */
  lunarMonth: number;
  /** 原始农历月 1-12 */
  rawLunarMonth: number;
  isLeapMonth: boolean;
  /** 闰月十六日后出生，排盘按下月论 */
  monthAdjusted: boolean;
  /** 农历日 1-30 */
  lunarDay: number;
  yearStem: number;
  yearBranch: number;
  /** 时辰地支索引 0-11 */
  hourBranch: number;
  yearGanZhi: string;
  lunarText: string;
}

export function getCalendarInfo(
  year: number, month: number, day: number, hour: number, minute: number,
): CalendarInfo {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();

  const rawMonth = lunar.getMonth();
  const isLeapMonth = rawMonth < 0;
  const rawLunarMonth = Math.abs(rawMonth);
  const lunarDay = lunar.getDay();

  // 闰月分界：十六日起按下月
  const monthAdjusted = isLeapMonth && lunarDay >= 16;
  const lunarMonth = monthAdjusted ? (rawLunarMonth % 12) + 1 : rawLunarMonth;

  const gz = lunar.getYearInGanZhi();
  const yearStem = STEMS.indexOf(gz[0] as (typeof STEMS)[number]);
  const yearBranch = BRANCHES.indexOf(gz[1] as (typeof BRANCHES)[number]);

  // 时辰：23:00-01:00 为子时（晚子时归当日，仅取时辰支，不涉及换日）
  const hourBranch = Math.floor(((hour + 1) % 24) / 2);

  const lunarText = `${gz}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;

  return {
    lunarYear: lunar.getYear(),
    lunarMonth,
    rawLunarMonth,
    isLeapMonth,
    monthAdjusted,
    lunarDay,
    yearStem,
    yearBranch,
    hourBranch,
    yearGanZhi: gz,
    lunarText,
  };
}

/** 某公历年（按立春）的年干支索引，供流年推算 */
export function yearGanZhiOf(year: number): { stem: number; branch: number; ganZhi: string } {
  // 取该年 6 月 1 日，必在立春之后，年干支即该流年干支
  const lunar = Solar.fromYmd(year, 6, 1).getLunar();
  const gz = lunar.getYearInGanZhi();
  return {
    stem: STEMS.indexOf(gz[0] as (typeof STEMS)[number]),
    branch: BRANCHES.indexOf(gz[1] as (typeof BRANCHES)[number]),
    ganZhi: gz,
  };
}

/** 查询某农历年的闰月（无闰月返回 0） */
export function getLeapMonthOfYear(lunarYear: number): number {
  return LunarYear.fromYear(lunarYear).getLeapMonth();
}

/**
 * 农历日期 → 公历日期。
 * @param month 农历月 1-12；isLeap=true 表示闰月
 * @throws 该年无此闰月 / 该月无此日 时抛错
 */
export function lunarToSolar(
  lunarYear: number, month: number, day: number, isLeap: boolean,
): { year: number; month: number; day: number } {
  const ly = LunarYear.fromYear(lunarYear);
  if (isLeap && ly.getLeapMonth() !== month) {
    throw new Error(`农历${lunarYear}年没有闰${month}月（该年${ly.getLeapMonth() > 0 ? `闰${ly.getLeapMonth()}月` : '无闰月'}）`);
  }
  const monthObj = ly.getMonth(isLeap ? -month : month);
  if (!monthObj) throw new Error('非法农历月份');
  const dayCount = monthObj.getDayCount();
  if (day < 1 || day > dayCount) {
    throw new Error(`该月只有 ${dayCount} 天，没有${day}日`);
  }
  const solar = Lunar.fromYmd(lunarYear, isLeap ? -month : month, day).getSolar();
  return { year: solar.getYear(), month: solar.getMonth(), day: solar.getDay() };
}
