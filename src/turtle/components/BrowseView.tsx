import { useMemo, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { questions } from '../data/questions';
import DifficultyBadge from './DifficultyBadge';
import type { TurtleDifficulty } from '../types';

interface Props {
  clearedIds: number[];
  onBack: () => void;
  onPlay: (id: number) => void;
}

type Tab = 'all' | TurtleDifficulty;

const TABS: Array<{ value: Tab; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'easy', label: '🟢 简单' },
  { value: 'medium', label: '🟡 中等' },
  { value: 'hard', label: '🔴 困难' },
];

const MAX_TAGS = 20;

export default function BrowseView({ clearedIds, onBack, onPlay }: Props) {
  const [tab, setTab] = useState<Tab>('all');
  const [tag, setTag] = useState<string | null>(null);

  const topTags = useMemo(() => {
    const freq = new Map<string, number>();
    for (const q of questions) {
      for (const t of q.tags) freq.set(t, (freq.get(t) ?? 0) + 1);
    }
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_TAGS)
      .map(([t]) => t);
  }, []);

  const clearedSet = useMemo(() => new Set(clearedIds), [clearedIds]);

  const filtered = useMemo(
    () =>
      questions.filter(
        q => (tab === 'all' || q.difficulty === tab) && (!tag || q.tags.includes(tag))
      ),
    [tab, tag]
  );

  return (
    <div className="ts-browse ts-fade-in">
      <header className="ts-page-header">
        <button className="ts-icon-btn" onClick={onBack} aria-label="返回">
          <ArrowLeft size={20} />
        </button>
        <h2>题库浏览</h2>
        <span className="ts-page-header-sub">{filtered.length} 题</span>
      </header>

      <div className="ts-tabs">
        {TABS.map(t => (
          <button
            key={t.value}
            className={`ts-tab ${tab === t.value ? 'active' : ''}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="ts-tag-row">
        {topTags.map(t => (
          <button
            key={t}
            className={`ts-tag-chip ${tag === t ? 'active' : ''}`}
            onClick={() => setTag(tag === t ? null : t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="ts-qlist">
        {filtered.map(q => (
          <button key={q.id} className="ts-qcard" onClick={() => onPlay(q.id)}>
            <div className="ts-qcard-head">
              <span className="ts-qcard-title">
                #{q.id} {q.title}
              </span>
              <DifficultyBadge difficulty={q.difficulty} />
              {clearedSet.has(q.id) && (
                <span className="ts-cleared">
                  <Check size={13} /> 已通关
                </span>
              )}
            </div>
            <p className="ts-qcard-surface">{q.surface}</p>
            <div className="ts-qcard-tags">
              {q.tags.map(t => (
                <span key={t} className="ts-tag">
                  {t}
                </span>
              ))}
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="ts-empty">没有符合条件的题目</div>}
      </div>
    </div>
  );
}
