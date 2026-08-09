/**
 * 规则怪谈 —— 本地存档与通关进度
 *
 * rule-tale-save-v1：按场景存放可恢复的对局快照（引擎状态 + 事件排程 + 时间戳）
 * rule-tale-progress-v1：{ sceneId: { clearedPaths: string[], bestActions: Record<string, number> } }
 */

import type { GameState, SceneId } from './types';

const SAVE_KEY = 'rule-tale-save-v1';
const PROGRESS_KEY = 'rule-tale-progress-v1';

export interface SaveData {
  state: GameState;
  /** 本局事件池（开局抽池结果） */
  poolIds: string[];
  /** any_time 事件的排程：第 atAction 次行动触发 */
  scheduled: { id: string; atAction: number }[];
  /** 已触发过的一次性事件 */
  triggered: string[];
  /** 上次固定间隔事件触发时的游戏分钟数 */
  lastFixedMin: number;
  savedAt: number;
}

export interface SceneProgress {
  clearedPaths: string[];
  bestActions: Record<string, number>;
}

export type Progress = Record<string, SceneProgress>;

const hasStore = (): boolean => {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
};

const readJson = (key: string): unknown => {
  if (!hasStore()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown): void => {
  if (!hasStore()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 隐私模式等场景下静默失败，不影响游戏
  }
};

const readSaveMap = (): Record<string, SaveData> => {
  const parsed = readJson(SAVE_KEY);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? (parsed as Record<string, SaveData>)
    : {};
};

export function loadSave(sceneId: SceneId): SaveData | null {
  const save = readSaveMap()[sceneId];
  if (!save || typeof save !== 'object') return null;
  if (!save.state || save.state.sceneId !== sceneId || save.state.phase !== 'playing') return null;
  return save;
}

export function writeSave(sceneId: SceneId, data: SaveData): void {
  const map = readSaveMap();
  map[sceneId] = data;
  writeJson(SAVE_KEY, map);
}

export function clearSave(sceneId: SceneId): void {
  const map = readSaveMap();
  if (sceneId in map) {
    delete map[sceneId];
    writeJson(SAVE_KEY, map);
  }
}

export function loadProgress(): Progress {
  const parsed = readJson(PROGRESS_KEY);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  const out: Progress = {};
  for (const [sceneId, value] of Object.entries(parsed as Record<string, unknown>)) {
    const v = value as Partial<SceneProgress> | null;
    out[sceneId] = {
      clearedPaths: Array.isArray(v?.clearedPaths)
        ? v.clearedPaths.filter((p): p is string => typeof p === 'string')
        : [],
      bestActions:
        v?.bestActions && typeof v.bestActions === 'object' && !Array.isArray(v.bestActions)
          ? (v.bestActions as Record<string, number>)
          : {},
    };
  }
  return out;
}

/** 记录通关：路径入册，最佳行动数取最小，返回更新后的进度 */
export function recordWin(sceneId: SceneId, path: string, actions: number): Progress {
  const progress = loadProgress();
  const prev = progress[sceneId] ?? { clearedPaths: [], bestActions: {} };
  const clearedPaths = prev.clearedPaths.includes(path)
    ? prev.clearedPaths
    : [...prev.clearedPaths, path];
  const prevBest = prev.bestActions[path];
  const bestActions = {
    ...prev.bestActions,
    [path]: prevBest === undefined ? actions : Math.min(prevBest, actions),
  };
  const next: Progress = { ...progress, [sceneId]: { clearedPaths, bestActions } };
  writeJson(PROGRESS_KEY, next);
  return next;
}
