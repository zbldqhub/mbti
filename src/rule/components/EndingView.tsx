import { Home, RotateCcw } from 'lucide-react';
import type { PublicScene } from '../data/scenePublic';
import type { GameState } from '../types';

interface Props {
  scene: PublicScene;
  state: GameState;
  onAgain: () => void;
  onHome: () => void;
}

const toMin = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** 场景开局到当前时刻的游戏内用时（跨午夜取模） */
const elapsedText = (start: string, end: string): string => {
  const mins = (toMin(end) - toMin(start) + 1440) % 1440;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} 分钟`;
  return m === 0 ? `${h} 小时` : `${h} 小时 ${m} 分`;
};

export default function EndingView({ scene, state, onAgain, onHome }: Props) {
  const won = state.phase === 'won';
  const ending = state.ending ?? { title: won ? '逃离成功' : '游戏结束', narrative: '' };

  return (
    <div className="rt-ending rt-fade-in">
      <div className="rt-ending-emoji">{won ? '🌅' : '🕯️'}</div>
      <h2 className={`rt-ending-title ${won ? 'won' : 'lost'}`}>{ending.title}</h2>

      <div className="rt-ending-meta">
        <span className="rt-ending-scene">{scene.name}</span>
        {won && state.winPath && <span className="rt-path-chip cleared">{state.winPath}</span>}
      </div>

      <p className="rt-ending-stats">
        行动 {state.actionCount} 次 · 游戏内用时 {elapsedText(scene.time_config.start, state.time)}
        {won && state.winPath && ` · 通关路径「${state.winPath}」`}
      </p>

      {ending.narrative && (
        <section className="rt-ending-card">
          <div className="rt-card-label">结局</div>
          <p>{ending.narrative}</p>
        </section>
      )}

      {state.history.length > 0 && (
        <details className="rt-review">
          <summary>回顾本局记录（{state.history.length} 条）</summary>
          <div className="rt-review-list">
            {state.history.map((entry, i) => (
              <div key={i} className={`rt-review-item rt-review-${entry.kind}`}>
                {entry.kind === 'player' ? `▶ ${entry.text}` : entry.text}
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="rt-ending-actions">
        <button className="rt-btn rt-btn-primary" onClick={onAgain}>
          <RotateCcw size={16} /> 再来一局
        </button>
        <button className="rt-btn" onClick={onHome}>
          <Home size={16} /> 返回场景选择
        </button>
      </div>
    </div>
  );
}
