import type { TurtleDifficulty } from '../types';
import { DIFFICULTY_LABELS } from '../types';

const DOTS: Record<TurtleDifficulty, string> = {
  easy: '🟢',
  medium: '🟡',
  hard: '🔴',
};

export default function DifficultyBadge({ difficulty }: { difficulty: TurtleDifficulty }) {
  return (
    <span className={`ts-diff ts-diff-${difficulty}`}>
      {DOTS[difficulty]} {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}
