const STORAGE_KEY = 'turtle-soup-progress-v1';

export interface Progress {
  /** 已通关题目 id */
  cleared: number[];
  /** 每题最佳记录：题目 id → 最少提问次数 */
  best: Record<number, number>;
}

const EMPTY: Progress = { cleared: [], best: {} };

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      cleared: Array.isArray(parsed?.cleared)
        ? parsed.cleared.filter((n: unknown) => typeof n === 'number')
        : [],
      best: parsed?.best && typeof parsed.best === 'object' ? parsed.best : {},
    };
  } catch {
    return EMPTY;
  }
}

const save = (progress: Progress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // 隐私模式等场景下静默失败，不影响游戏
  }
};

/** 记录通关，返回更新后的进度 */
export function markCleared(questionId: number, questionCount: number): Progress {
  const progress = loadProgress();
  const cleared = progress.cleared.includes(questionId)
    ? progress.cleared
    : [...progress.cleared, questionId];
  const prevBest = progress.best[questionId];
  const best = {
    ...progress.best,
    [questionId]: prevBest === undefined ? questionCount : Math.min(prevBest, questionCount),
  };
  const next = { cleared, best };
  save(next);
  return next;
}
