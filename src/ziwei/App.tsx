import { useMemo, useState } from 'react';
import type { BirthInput, ChartData } from './types';
import { buildChart } from './engine/chart';
import { buildReading } from './interpret';
import { getYearly } from './engine/yearly';
import InputForm from './components/InputForm';
import ChartBoard from './components/ChartBoard';
import ReadingView from './components/ReadingView';

export default function App() {
  const [chart, setChart] = useState<ChartData | null>(null);

  const handleSubmit = (input: BirthInput) => {
    setChart(buildChart(input));
    window.scrollTo(0, 0);
  };

  const derived = useMemo(() => {
    if (!chart) return null;
    const now = new Date();
    const thisYear = now.getFullYear();
    const age = thisYear - chart.lunarYear + 1;
    const currentDaxian = chart.daxian.find((d) => age >= d.startAge && age <= d.endAge) ?? null;
    const yearly = getYearly(chart, thisYear);
    return {
      reading: buildReading(chart, now),
      currentDaxianBranch: currentDaxian?.branch,
      yearlyBranch: yearly.mingBranch,
    };
  }, [chart]);

  if (!chart || !derived) {
    return <InputForm onSubmit={handleSubmit} />;
  }

  return (
    <div className="zw-result-page">
      <header className="zw-result-header">
        <h1 className="zw-title">紫微命盘</h1>
        <button type="button" className="zw-back" onClick={() => setChart(null)}>
          重新排盘
        </button>
      </header>

      <ChartBoard
        chart={chart}
        currentDaxianBranch={derived.currentDaxianBranch}
        yearlyBranch={derived.yearlyBranch}
      />
      <div className="zw-legend">
        <span><i className="dot is-ming" /> 命宫</span>
        <span><i className="dot is-daxian" /> 当前大限</span>
        <span><i className="dot is-yearly" /> 今年太岁</span>
        <span><sup className="zw-sh sh-lu">禄</sup><sup className="zw-sh sh-quan">权</sup><sup className="zw-sh sh-ke">科</sup><sup className="zw-sh sh-ji">忌</sup> 生年四化</span>
      </div>

      <ReadingView sections={derived.reading} />

      <footer className="zw-footer">
        本工具依据传统命理书籍推演，结果仅供文化研习与娱乐参考。
      </footer>
    </div>
  );
}
