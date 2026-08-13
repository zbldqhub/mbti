// lunar-javascript 最小类型声明（仅声明本项目用到的 API）

declare module 'lunar-javascript' {
  export interface Lunar {
    getYear(): number;
    /** 农历月，闰月为负数 */
    getMonth(): number;
    getDay(): number;
    getYearInGanZhi(): string;
    getYearInGanZhiExact(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getTimeInGanZhi(): string;
    getSolar(): Solar;
  }

  export interface Solar {
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
  }

  export interface LunarMonth {
    getDayCount(): number;
  }

  export interface LunarYear {
    /** 当年闰月（1-12），无闰月返回 0 */
    getLeapMonth(): number;
    /** month 传负数表示闰月 */
    getMonth(month: number): LunarMonth | null;
  }

  export const Solar: {
    fromYmd(year: number, month: number, day: number): Solar;
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
  };

  export const Lunar: {
    fromYmd(year: number, month: number, day: number): Lunar;
  };

  export const LunarYear: {
    fromYear(year: number): LunarYear;
  };
}
