import type { TurtleDifficulty, TurtleQuestionMeta } from './data/questions';

export type { TurtleDifficulty, TurtleQuestionMeta };

export type DifficultyChoice = TurtleDifficulty | 'random';

export type View = 'home' | 'browse' | 'rules' | 'game' | 'result';

export type Verdict = 'yes' | 'no' | 'partial' | 'irrelevant' | 'win' | 'unknown';

export type EntryKind = 'ask' | 'hint' | 'guess';

export interface ChatEntry {
  kind: EntryKind;
  /** 玩家的问题 / 推理内容；提示条目为空字符串 */
  question: string;
  /** AI 回复 / 提示文本 */
  reply: string;
  /** 仅 ask 条目有判定 */
  verdict?: Verdict;
}

export interface GameSession {
  question: TurtleQuestionMeta;
  entries: ChatEntry[];
  questionCount: number;
  hintsUsed: number;
  won: boolean;
  /** 通关或放弃后由服务端返回的汤底 */
  answer: string | null;
}

export const MAX_HINTS = 3;

export const DIFFICULTY_LABELS: Record<TurtleDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

/** 各难度评价阈值：[推理大师, 逻辑清晰, 渐入佳境]，超过最后一档为再接再厉 */
const RATING_THRESHOLDS: Record<TurtleDifficulty, [number, number, number]> = {
  easy: [5, 8, 12],
  medium: [8, 12, 16],
  hard: [12, 18, 25],
};

export interface Rating {
  label: string;
  stars: number;
}

export function rateGame(difficulty: TurtleDifficulty, questionCount: number): Rating {
  const [master, clear, good] = RATING_THRESHOLDS[difficulty];
  if (questionCount <= master) return { label: '推理大师', stars: 4 };
  if (questionCount <= clear) return { label: '逻辑清晰', stars: 3 };
  if (questionCount <= good) return { label: '渐入佳境', stars: 2 };
  return { label: '再接再厉', stars: 1 };
}
