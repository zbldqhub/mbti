import { useMemo, useState } from 'react';
import type { BirthInput, ChartData } from './types';
import { buildChart } from './engine/chart';
import { buildReading } from './interpret';
import { getYearly } from './engine/yearly';
import { generateAiReading, todayRemaining, bumpTodayUsage, DAILY_FREE_LIMIT, type AiReading } from './services/aiReading';
import InputForm from './components/InputForm';
import ChartBoard from './components/ChartBoard';
import ReadingView from './components/ReadingView';
import AiReadingView from './components/AiReadingView';

type AiState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; reading: AiReading }
  | { status: 'error'; message: string };

export default function App() {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [ai, setAi] = useState<AiState>({ status: 'idle' });

  const handleSubmit = (input: BirthInput) => {
    setChart(buildChart(input));
    setAi({ status: 'idle' });
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

  const handleAiRead = async () => {
    if (!chart || ai.status === 'loading') return;
    if (todayRemaining() <= 0) {
      setAi({ status: 'error', message: `今天免费解读次数（每日 ${DAILY_FREE_LIMIT} 次）已用完，明天再来吧` });
      return;
    }
    setAi({ status: 'loading' });
    try {
      const reading = await generateAiReading(chart);
      bumpTodayUsage();
      setAi({ status: 'done', reading });
    } catch (e) {
      setAi({ status: 'error', message: e instanceof Error ? e.message : 'AI 解读失败' });
    }
  };

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

      {/* AI 白话解读 */}
      <div className="zw-ai-card">
        <h2 className="zw-section-title">AI 白话解读</h2>

        {ai.status === 'idle' && (
          <div className="zw-ai-cta">
            <p>看不懂星曜术语？让 AI 用大白话为你拆解本命格局、当前大限与今年流年。</p>
            <button type="button" className="zw-ai-btn" onClick={handleAiRead}>
              ✦ 开始 AI 解读
            </button>
            <p className="zw-ai-quota">今日免费剩余 {todayRemaining()} 次</p>
          </div>
        )}

        {ai.status === 'loading' && (
          <div className="zw-ai-loading">
            <div className="zw-ai-spinner" />
            <p>正在推演命盘，请稍候…</p>
            <p className="zw-ai-loading-sub">约需 10–30 秒</p>
          </div>
        )}

        {ai.status === 'error' && (
          <div className="zw-ai-cta">
            <p className="zw-ai-error">解读失败：{ai.message}（本地排盘结果不受影响，可继续查看下方详批）</p>
            <button type="button" className="zw-ai-btn" onClick={handleAiRead}>
              重试
            </button>
          </div>
        )}

        {ai.status === 'done' && <AiReadingView reading={ai.reading} />}
      </div>

      <ReadingView sections={derived.reading} />

      <footer className="zw-footer">
        本工具依据传统命理书籍推演，AI 解读由大模型生成，结果仅供文化研习与娱乐参考。
      </footer>
    </div>
  );
}
