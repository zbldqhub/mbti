/**
 * 规则怪谈：逃离手册 —— 共享类型定义
 */

export type SceneId = 'midnight_zoo' | 'abandoned_hospital' | 'infinite_corridor';

export const SCENE_IDS: SceneId[] = ['midnight_zoo', 'abandoned_hospital', 'infinite_corridor'];

export type WinPath = '正道' | '险道' | '诡道';

export const WIN_PATHS: WinPath[] = ['正道', '险道', '诡道'];

export type Phase = 'playing' | 'won' | 'lost';

export interface Ending {
  title: string;
  narrative: string;
}

export type HistoryKind = 'player' | 'ai' | 'system';

export interface HistoryEntry {
  kind: HistoryKind;
  text: string;
}

export interface ActiveEvent {
  id: string;
  remainingActions: number;
}

export interface LearnedRule {
  id: string;
  desc: string;
}

/** 引擎权威持有的完整对局状态 */
export interface GameState {
  sceneId: SceneId;
  actionCount: number;
  /** 当前时刻 HH:MM */
  time: string;
  location: string;
  /** 理智 0-100 */
  san: number;
  /** 污染 0-100 */
  con: number;
  items: string[];
  flags: string[];
  learnedRules: LearnedRule[];
  exposedRules: string[];
  activeEvents: ActiveEvent[];
  /** 倒计时：room_405 / wear_red_uniform / record_red */
  countdowns: Record<string, number>;
  lastCheckinHour: string | null;
  room404At: string | null;
  history: HistoryEntry[];
  phase: Phase;
  ending: Ending | null;
  winPath: WinPath | null;
  /** 建议动作（服务端下发；不可用时由引擎降级为通用移动建议） */
  suggestions: string[];
}

/** 倒计时 key → 徽章文案 */
export const COUNTDOWN_LABELS: Record<string, string> = {
  room_405: '坍缩',
  wear_red_uniform: '穿着',
  record_red: '变红',
};

/** 倒计时显示上限：引擎内部初值为预算+1（行动前先 -1 的扣费节奏所致），显示时按设计预算封顶 */
export const COUNTDOWN_DISPLAY_MAX: Record<string, number> = {
  room_405: 3,
  record_red: 8,
};

// ========== POST /api/rule-engine 契约（与服务端已实现版本一致） ==========

export interface EngineRequestState {
  actionCount: number;
  time: string;
  location: string;
  san: number;
  con: number;
  items: string[];
  flags: string[];
  learnedRules: string[];
  exposedRules: string[];
  activeEvents: ActiveEvent[];
  countdowns: Record<string, number>;
  lastCheckinHour: string | null;
  room404At: string | null;
  history: { input: string; narrative: string }[];
}

export interface Judgment {
  valid: boolean;
  narrative: string;
  warning: string;
  san_change: number;
  con_change: number;
  new_location: string | null;
  items_gained: string[];
  items_lost: string[];
  flags_added: string[];
  flags_lost: string[];
  rules_exposed: string[];
}

export interface SystemEffect {
  type: string;
  san_change?: number;
  con_change?: number;
  note: string;
}

export interface Outcome {
  status: Phase;
  win_path: WinPath | null;
  lose_type: string | null;
  ending: Ending | null;
}

export interface EngineResponse {
  /** 超时预检等场景下可能缺失，需判空 */
  judgment?: Judgment;
  rules_learned?: LearnedRule[];
  system_effects?: SystemEffect[];
  state_updates?: { lastCheckinHour?: string };
  outcome: Outcome;
  /** 建议动作列表（2-6 个；结局后为空数组）。旧版服务端可能缺失，需判空 */
  suggestions?: string[];
}
