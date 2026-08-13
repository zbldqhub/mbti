import { useState } from 'react';
import type { BirthInput } from '../types';

interface Props {
  onSubmit: (input: BirthInput) => void;
}

export default function InputForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [date, setDate] = useState('1990-01-01');
  const [time, setTime] = useState('12:00');
  const [unknownTime, setUnknownTime] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const m = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) {
      setError('请填写正确的出生日期');
      return;
    }
    const [y, mo, d] = [+m[1], +m[2], +m[3]];
    if (y < 1900 || y > 2100) {
      setError('目前支持 1900–2100 年之间出生');
      return;
    }
    const [hh, mm] = unknownTime ? [12, 0] : time.split(':').map(Number);
    if (!name.trim()) {
      setError('请填写姓名');
      return;
    }
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

        <label className="zw-label">出生日期（公历）</label>
        <input
          className="zw-input"
          type="date"
          value={date}
          min="1900-01-01"
          max="2100-12-31"
          onChange={(e) => setDate(e.target.value)}
        />

        <label className="zw-label">出生时间</label>
        <input
          className="zw-input"
          type="time"
          value={time}
          disabled={unknownTime}
          onChange={(e) => setTime(e.target.value)}
        />
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
