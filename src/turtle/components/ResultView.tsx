import { Home, RotateCcw } from 'lucide-react';
import DifficultyBadge from './DifficultyBadge';
import type { GameSession } from '../types';
import { rateGame } from '../types';

interface Props {
  session: GameSession;
  /** 本题历史最佳提问次数（含本局） */
  best?: number;
  onAgain: () => void;
  onHome: () => void;
}

export default function ResultView({ session, best, onAgain, onHome }: Props) {
  const rating = session.won ? rateGame(session.question.difficulty, session.questionCount) : null;

  return (
    <div className="ts-result ts-fade-in">
      <div className="ts-result-emoji">{session.won ? '🎉' : '😔'}</div>
      <h2 className="ts-result-title">{session.won ? '推理成功！' : '本局未通关'}</h2>

      <div className="ts-result-meta">
        <DifficultyBadge difficulty={session.question.difficulty} />
        <span className="ts-result-name">{session.question.title}</span>
      </div>

      {rating && (
        <div className="ts-rating">
          <span className="ts-stars">
            {'★'.repeat(rating.stars)}
            {'☆'.repeat(4 - rating.stars)}
          </span>
          <span className="ts-rating-label">{rating.label}</span>
        </div>
      )}

      <p className="ts-result-stats">
        {session.won
          ? `你用了 ${session.questionCount} 次提问猜中真相`
          : `提问 ${session.questionCount} 次后选择放弃`}
        {session.hintsUsed > 0 && ` · 使用提示 ${session.hintsUsed} 次`}
        {session.won && best !== undefined && ` · 本题最佳记录 ${best} 次`}
      </p>

      <section className="ts-answer-card">
        <div className="ts-card-label">汤底</div>
        <p>{session.answer}</p>
      </section>

      {session.entries.length > 0 && (
        <details className="ts-review">
          <summary>回顾本局推理记录（{session.entries.length} 条）</summary>
          <div className="ts-review-list">
            {session.entries.map((entry, i) => (
              <div key={i} className="ts-review-item">
                {entry.kind === 'hint' ? (
                    <div className="ts-review-a">💡 提示：{entry.reply}</div>
                  ) : (
                    <>
                      <div className="ts-review-q">
                        {entry.kind === 'guess' ? '【我的推理】' : `Q${i + 1}. `}
                        {entry.question}
                      </div>
                      <div className="ts-review-a">{entry.reply}</div>
                    </>
                  )}
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="ts-result-actions">
        <button className="ts-btn ts-btn-primary" onClick={onAgain}>
          <RotateCcw size={16} /> 再来一局
        </button>
        <button className="ts-btn" onClick={onHome}>
          <Home size={16} /> 返回首页
        </button>
      </div>
    </div>
  );
}
