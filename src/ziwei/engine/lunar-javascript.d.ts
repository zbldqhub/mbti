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
  }

  export interface Solar {
    getLunar(): Lunar;
  }

  export const Solar: {
    fromYmd(year: number, month: number, day: number): Solar;
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
  };
}
