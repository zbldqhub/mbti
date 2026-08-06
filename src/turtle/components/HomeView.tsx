import { useMemo, useState } from 'react';
import { BookOpen, ScrollText, Play } from 'lucide-react';
import { questions } from '../data/questions';
import type { DifficultyChoice, TurtleDifficulty } from '../types';
import type { Progress } from '../storage';

interface Props {
  progress: Progress;
  onStart: (choice: DifficultyChoice) => void;
  onBrowse: () => void;
  onRules: () => void;
}

const DIFFICULTY_CHOICES: Array<{ value: TurtleDifficulty; label: string }> = [
  { value: 'easy', label: '🟢 简单' },
  { value: 'medium', label: '🟡 中等' },
  { value: 'hard', label: '🔴 困难' },
];

export default function HomeView({ progress, onStart, onBrowse, onRules }: Props) {
  const [choice, setChoice] = useState<DifficultyChoice>('random');

  const stats = useMemo(() => {
    const clearedSet = new Set(progress.cleared);
    const byDifficulty: Record<TurtleDifficulty, { total: number; cleared: number }> = {
      easy: { total: 0, cleared: 0 },
      medium: { total: 0, cleared: 0 },
      hard: { total: 0, cleared: 0 },
    };
    for (const q of questions) {
      byDifficulty[q.difficulty].total += 1;
      if (clearedSet.has(q.id)) byDifficulty[q.difficulty].cleared += 1;
    }
    return {
      byDifficulty,
      total: questions.length,
      totalCleared:
        byDifficulty.easy.cleared + byDifficulty.medium.cleared + byDifficulty.hard.cleared,
    };
  }, [progress]);

  return (
    <div className="ts-home ts-fade-in">
      <header className="ts-home-header">
        <div className="ts-home-logo">🐢</div>
        <h1>AI 海龟汤</h1>
        <p className="ts-home-tagline">一碗看似离奇的汤，等你问出背后的真相</p>
      </header>

      <section className="ts-home-section">
        <div className="ts-home-label">选择难度</div>
        <div className="ts-pills">
          <button
            className={`ts-pill ${choice === 'random' ? 'active' : ''}`}
            onClick={() => setChoice('random')}
          >
            🎲 随机
            <span className="ts-pill-sub">{stats.totalCleared}/{stats.total}</span>
          </button>
          {DIFFICULTY_CHOICES.map(c => (
            <button
              key={c.value}
              className={`ts-pill ${choice === c.value ? 'active' : ''}`}
              onClick={() => setChoice(c.value)}
            >
              {c.label}
              <span className="ts-pill-sub">
                {stats.byDifficulty[c.value].cleared}/{stats.byDifficulty[c.value].total}
              </span>
            </button>
          ))}
        </div>
      </section>

      <button className="ts-btn ts-btn-primary ts-btn-lg" onClick={() => onStart(choice)}>
        <Play size={18} /> 开始游戏
      </button>

      <div className="ts-home-links">
        <button className="ts-btn" onClick={onBrowse}>
          <BookOpen size={16} /> 题库浏览
        </button>
        <button className="ts-btn" onClick={onRules}>
          <ScrollText size={16} /> 规则说明
        </button>
      </div>

      <footer className="ts-home-footer">已通关 {stats.totalCleared} / {stats.total} 题</footer>
    </div>
  );
}
