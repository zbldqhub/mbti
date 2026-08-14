import { useMemo, useState } from 'react';
import type { BirthInput } from '../types';
import { lunarToSolar, getLeapMonthOfYear } from '../engine/calendar';

interface Props {
  onSubmit: (input: BirthInput) => void;
}

const LUNAR_MONTHS = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
const LUNAR_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
];

const SOLAR_YEARS = Array.from({ length: 201 }, (_, i) => 1900 + i);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function daysInSolarMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default function InputForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [calType, setCalType] = useState<'solar' | 'lunar'>('solar');

  // 公历
  const [solarYear, setSolarYear] = useState(1990);
  const [solarMonth, setSolarMonth] = useState(1);
  const [solarDay, setSolarDay] = useState(1);
  // 农历
  const [lunarYear, setLunarYear] = useState(1990);
  const [lunarMonth, setLunarMonth] = useState(1);
  const [lunarDay, setLunarDay] = useState(1);
  const [isLeap, setIsLeap] = useState(false);
  // 时间
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [unknownTime, setUnknownTime] = useState(false);

  const [error, setError] = useState('');

  // 公历当月天数（年月变化时日序钳位）
  const maxSolarDay = daysInSolarMonth(solarYear, solarMonth);
  const effectiveSolarDay = Math.min(solarDay, maxSolarDay);

  // 所选农历年的闰月（决定「闰」是否可选）
  const leapMonth = useMemo(() => getLeapMonthOfYear(lunarYear), [lunarYear]);
  const leapSelectable = leapMonth === lunarMonth;

  // 农历 → 公历 实时预览
  const lunarPreview = useMemo(() => {
    if (calType !== 'lunar') return '';
    try {
      const s = lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap && leapSelectable);
      return `对应公历：${s.year}年${s.month}月${s.day}日`;
    } catch (e) {
      return e instanceof Error ? e.message : '日期无效';
    }
  }, [calType, lunarYear, lunarMonth, lunarDay, isLeap, leapSelectable]);

  const handleSubmit = () => {
    let y: number; let mo: number; let d: number;

    if (calType === 'solar') {
      [y, mo, d] = [solarYear, solarMonth, effectiveSolarDay];
    } else {
      try {
        const s = lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap && leapSelectable);
        [y, mo, d] = [s.year, s.month, s.day];
      } catch (e) {
        setError(e instanceof Error ? e.message : '农历日期无效');
        return;
      }
    }

    if (y < 1900 || y > 2100) {
      setError('目前支持 1900–2100 年之间出生');
      return;
    }
    if (!name.trim()) {
      setError('请填写姓名');
      return;
    }
    const [hh, mm] = unknownTime ? [12, 0] : [hour, minute];
    setError('');
    onSubmit({
      name: name.trim(), gender, year: y, month: mo, day: d,
      hour: hh, minute: mm, unknownTime,
    });
  };

  return (
    <div className="zw-input-page">
      <div className="zw-input-card">
        <h1 className="zw-title">紫微斗数排盘</h1>
        <p className="zw-subtitle">中州派天盘排盘 · 依《安星法》《星曜性质》推演</p>

        <label className="zw-label">姓名</label>
        <input
          className="zw-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入姓名"
          maxLength={12}
        />

        <label className="zw-label">性别</label>
        <div className="zw-radio-row">
          <button
            type="button"
            className={`zw-radio ${gender === 'male' ? 'active' : ''}`}
            onClick={() => setGender('male')}
          >乾造（男）</button>
          <button
            type="button"
            className={`zw-radio ${gender === 'female' ? 'active' : ''}`}
            onClick={() => setGender('female')}
          >坤造（女）</button>
        </div>

        <label className="zw-label">历法</label>
        <div className="zw-radio-row">
          <button
            type="button"
            className={`zw-radio ${calType === 'solar' ? 'active' : ''}`}
            onClick={() => setCalType('solar')}
          >公历</button>
          <button
            type="button"
            className={`zw-radio ${calType === 'lunar' ? 'active' : ''}`}
            onClick={() => setCalType('lunar')}
          >农历（可含闰月）</button>
        </div>

        {calType === 'solar' ? (
          <>
            <label className="zw-label">出生日期（公历）</label>
            <div className="zw-lunar-row">
              <select
                className="zw-input"
                value={solarYear}
                onChange={(e) => setSolarYear(+e.target.value)}
              >
                {SOLAR_YEARS.map((y) => <option key={y} value={y}>{y}年</option>)}
              </select>
              <select
                className="zw-input"
                value={solarMonth}
                onChange={(e) => setSolarMonth(+e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{m}月</option>
                ))}
              </select>
              <select
                className="zw-input"
                value={effectiveSolarDay}
                onChange={(e) => setSolarDay(+e.target.value)}
              >
                {Array.from({ length: maxSolarDay }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}日</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <label className="zw-label">出生日期（农历）</label>
            <div className="zw-lunar-row">
              <select
                className="zw-input"
                value={lunarYear}
                onChange={(e) => setLunarYear(+e.target.value)}
              >
                {SOLAR_YEARS.map((y) => <option key={y} value={y}>{y}年</option>)}
              </select>
              <select
                className="zw-input"
                value={lunarMonth}
                onChange={(e) => {
                  setLunarMonth(+e.target.value);
                  setIsLeap(false);
                }}
              >
                {LUNAR_MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                className="zw-input"
                value={lunarDay}
                onChange={(e) => setLunarDay(+e.target.value)}
              >
                {LUNAR_DAYS.map((d, i) => (
                  <option key={d} value={i + 1}>{d}</option>
                ))}
              </select>
            </div>
            <label className={`zw-check ${leapSelectable ? '' : 'disabled'}`}>
              <input
                type="checkbox"
                checked={isLeap && leapSelectable}
                disabled={!leapSelectable}
                onChange={(e) => setIsLeap(e.target.checked)}
              />
              闰{LUNAR_MONTHS[lunarMonth - 1]}{leapSelectable ? '' : `（该年${leapMonth > 0 ? `只有闰${LUNAR_MONTHS[leapMonth - 1]}` : '无闰月'}）`}
            </label>
            <p className="zw-lunar-preview">{lunarPreview}</p>
          </>
        )}

        <label className="zw-label">出生时间</label>
        <div className="zw-lunar-row">
          <select
            className="zw-input"
            value={hour}
            disabled={unknownTime}
            onChange={(e) => setHour(+e.target.value)}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>{String(h).padStart(2, '0')}时</option>
            ))}
          </select>
          <select
            className="zw-input"
            value={minute}
            disabled={unknownTime}
            onChange={(e) => setMinute(+e.target.value)}
          >
            {MINUTES.map((m) => (
              <option key={m} value={m}>{String(m).padStart(2, '0')}分</option>
            ))}
          </select>
        </div>
        <label className="zw-check">
          <input
            type="checkbox"
            checked={unknownTime}
            onChange={(e) => setUnknownTime(e.target.checked)}
          />
          时辰不详（按午时排盘，结果仅供参考）
        </label>

        {error && <p className="zw-error">{error}</p>}

        <button type="button" className="zw-submit" onClick={handleSubmit}>
          开始排盘
        </button>

        <p className="zw-disclaimer">
          本工具依据传统命理书籍推演，结果仅供文化研习与娱乐参考，不构成任何人生决策建议。
        </p>
      </div>
    </div>
  );
}
