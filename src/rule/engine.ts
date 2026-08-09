/**
 * 规则怪谈：逃离手册 —— 前端游戏引擎（纯 TS 模块，不依赖 React，可单测）
 *
 * 引擎权威持有全部游戏状态（理智/污染/时间/位置/物品/flags/规则习得/事件/倒计时），
 * 每轮把紧凑状态 + 玩家输入发往 /api/rule-engine，拿回服务端校验后的判定增量落账。
 * 场景数据只使用 src/rule/data/scenePublic.ts 的公开部分（无底牌）。
 */

import { scenes } from './data/scenePublic';
import type { PublicEvent, PublicScene } from './data/scenePublic';
import { fetchStartSuggestions, judgeAction } from './api';
import { clearSave, loadSave, recordWin, writeSave } from './storage';
import type { SaveData } from './storage';
import type {
  Ending,
  EngineRequestState,
  EngineResponse,
  GameState,
  HistoryEntry,
  SceneId,
} from './types';

export type JudgeFn = (
  sceneId: SceneId,
  input: string,
  state: EngineRequestState,
) => Promise<EngineResponse>;

export type StartSuggestionsFn = (sceneId: SceneId) => Promise<string[] | null>;

export interface EngineDeps {
  /** 随机源（测试可注入确定性序列） */
  random?: () => number;
  /** 判定请求（测试可注入 mock，默认走 /api/rule-engine） */
  judge?: JudgeFn;
  /** 开局建议请求（测试可注入 mock，默认走 /api/rule-engine start 模式） */
  suggest?: StartSuggestionsFn;
}

/** 404 房间漂移配置（仅 infinite_corridor 启用） */
const ROOM404_CONFIG: Record<SceneId, { initial: string | null; candidates: string[] }> = {
  midnight_zoo: { initial: null, candidates: [] },
  abandoned_hospital: { initial: null, candidates: [] },
  infinite_corridor: {
    initial: 'floor_3_corridor',
    candidates: ['floor_3_corridor', 'floor_4_corridor'],
  },
};

/** any_time 随机事件的排程窗口：第 4~20 次行动 */
const SCHEDULE_MIN_ACTION = 4;
const SCHEDULE_MAX_ACTION = 20;
/** 405 坍缩倒计时（次）。设计预算为进入后限 3 次行动；因行动开始前先 -1 再送服务端校验（<=0 即死），需设为预算+1 才能保证 3 次完整行动 */
const ROOM_405_COUNTDOWN = 4;
/** 红色工作服穿着倒计时（次） */
const WEAR_RED_COUNTDOWN = 2;
/** 固定间隔事件：每 120 分钟 */
const FIXED_INTERVAL_MIN = 120;
/** 时间类单点时刻的命中窗口（分钟），防止时间加速跨过 */
const POINT_WINDOW_MIN = 60;
/** time_location 事件的停留窗口（分钟） */
const TIME_LOCATION_WINDOW_MIN = 30;
/** 发给服务端的最近历史条数上限 */
const MAX_API_HISTORY = 10;
/** 玩家输入长度上限（与服务端 MAX_INPUT 一致） */
const MAX_INPUT = 500;

const GIVE_UP_ENDING: Ending = {
  title: '主动放弃',
  narrative:
    '你停下了脚步，不再试图逃离。黑暗安静地合拢过来——至少这一刻，它还愿意放过你。',
};

// ========== 时间工具（游戏时钟：以场景 start 为 0，跨午夜取模） ==========

const toMinutes = (t: string): number | null => {
  const m = /^(\d{2}):(\d{2})$/.exec(t);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

const formatMinutes = (m: number): string => {
  const v = ((m % 1440) + 1440) % 1440;
  return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
};

/** t 距场景 start 的分钟数（0~1439，跨午夜自动取模） */
const gameMinutes = (t: string, start: string): number => {
  const tm = toMinutes(t);
  const sm = toMinutes(start);
  if (tm === null || sm === null) return 0;
  return (tm - sm + 1440) % 1440;
};

const shiftTime = (t: string, deltaMin: number): string => {
  const tm = toMinutes(t);
  return tm === null ? t : formatMinutes(tm + deltaMin);
};

// ========== 事件 effect 字段读取（effect 为松散 JSON） ==========

const readNum = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;

const readStr = (v: unknown): string | undefined =>
  typeof v === 'string' && v ? v : undefined;

const clampStat = (n: number): number => Math.min(100, Math.max(0, n));

/** 解析时间触发窗口，返回游戏分钟区间 [from, to) */
const parseTimeWindow = (value: string, start: string): { from: number; to: number } | null => {
  const range = /^(\d{2}:\d{2})-(\d{2}:\d{2})$/.exec(value);
  if (range) {
    return { from: gameMinutes(range[1], start), to: gameMinutes(range[2], start) };
  }
  const after = /^(\d{2}:\d{2})后$/.exec(value);
  if (after) {
    return { from: gameMinutes(after[1], start), to: 1440 };
  }
  const point = /^(\d{2}:\d{2})$/.exec(value);
  if (point) {
    const at = gameMinutes(point[1], start);
    return { from: at, to: at + POINT_WINDOW_MIN };
  }
  return null;
};

/** 把叙事日志整理为发给服务端的「输入 → 叙述」对（最近 ≤10 条） */
const buildApiHistory = (
  entries: HistoryEntry[],
): { input: string; narrative: string }[] => {
  const pairs: { input: string; narrative: string }[] = [];
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].kind !== 'player') continue;
    let narrative = '';
    for (let j = i + 1; j < entries.length; j++) {
      if (entries[j].kind === 'player') break;
      if (entries[j].kind === 'ai') {
        narrative = entries[j].text;
        break;
      }
    }
    pairs.push({ input: entries[i].text, narrative });
  }
  return pairs.slice(-MAX_API_HISTORY);
};

interface ScheduledEvent {
  id: string;
  atAction: number;
}

export class RuleEngine {
  private state: GameState;
  /** 本局事件池（开局抽池结果） */
  private pool: PublicEvent[];
  private scheduled: ScheduledEvent[];
  private triggered: Set<string>;
  private lastFixedMin: number;
  private readonly scene: PublicScene;
  private readonly random: () => number;
  private readonly judge: JudgeFn;
  private readonly suggest: StartSuggestionsFn;

  private constructor(scene: PublicScene, deps: EngineDeps, save?: SaveData) {
    this.scene = scene;
    this.random = deps.random ?? Math.random;
    this.judge = deps.judge ?? judgeAction;
    this.suggest = deps.suggest ?? fetchStartSuggestions;
    if (save) {
      this.state = save.state;
      // 旧版存档无 suggestions 字段：降级为当前区域的通用移动建议
      if (!Array.isArray(this.state.suggestions)) {
        this.state.suggestions = this.defaultSuggestions();
      }
      this.pool = this.scene.events.filter(ev => save.poolIds.includes(ev.id));
      this.scheduled = save.scheduled.map(x => ({ ...x }));
      this.triggered = new Set(save.triggered);
      this.lastFixedMin = save.lastFixedMin;
    } else {
      this.state = this.initialState();
      // 先落通用移动建议，start() 拿到服务端开局建议后会覆盖
      this.state.suggestions = this.defaultSuggestions();
      this.pool = this.drawPool();
      // random + any_time 事件：开局时随机排到第 4~20 行动之一
      this.scheduled = this.pool
        .filter(ev => ev.trigger_type === 'random' && ev.trigger_value === 'any_time')
        .map(ev => ({
          id: ev.id,
          atAction:
            SCHEDULE_MIN_ACTION +
            Math.floor(this.random() * (SCHEDULE_MAX_ACTION - SCHEDULE_MIN_ACTION + 1)),
        }));
      this.triggered = new Set();
      this.lastFixedMin = 0;
      this.persist();
    }
  }

  /**
   * 开新局（会覆盖该场景已有存档）。
   * 构造后请求服务端开局建议（start 模式，不调 AI）；失败时保留构造期写入的通用移动建议。
   */
  static async start(sceneId: SceneId, deps: EngineDeps = {}): Promise<RuleEngine> {
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) throw new Error(`未知场景: ${sceneId}`);
    const engine = new RuleEngine(scene, deps);
    const suggestions = await engine.suggest(sceneId);
    if (suggestions && suggestions.length > 0) {
      engine.state.suggestions = suggestions;
      engine.persist();
    }
    return engine;
  }

  /** 从本地存档恢复；无存档或存档已完结时返回 null */
  static restore(sceneId: SceneId, deps: EngineDeps = {}): RuleEngine | null {
    const scene = scenes.find(s => s.id === sceneId);
    const save = loadSave(sceneId);
    if (!scene || !save) return null;
    return new RuleEngine(scene, deps, save);
  }

  getSnapshot(): GameState {
    return { ...this.state };
  }

  // ========== 初始化 ==========

  private initialState(): GameState {
    const pc = this.scene.player_config;
    return {
      sceneId: this.scene.id as SceneId,
      actionCount: 0,
      time: this.scene.time_config.start,
      location: pc.location,
      san: pc.san,
      con: pc.con,
      items: [...pc.items],
      flags: [],
      learnedRules: this.scene.baseRules.map(r => ({ id: r.id, desc: r.desc })),
      exposedRules: [],
      activeEvents: [],
      countdowns: {},
      lastCheckinHour: null,
      room404At: ROOM404_CONFIG[this.scene.id as SceneId]?.initial ?? null,
      history: [],
      phase: 'playing',
      ending: null,
      winPath: null,
      suggestions: [],
    };
  }

  /** 通用降级建议：当前区域「前往{连接区域名}」列表（id→name 映射）+「查看四周」 */
  private defaultSuggestions(): string[] {
    const area = this.scene.areas.find(a => a.id === this.state.location);
    const moves = (area?.connections ?? [])
      .map(id => this.scene.areas.find(a => a.id === id)?.name)
      .filter((name): name is string => !!name)
      .map(name => `前往${name}`);
    return [...moves, '查看四周'];
  }

  /**
   * 开局抽池：story / core_mechanic 必入；random 按概率独立抽取，
   * 不足 2 个按概率从高到低补足，最多 4 个（保留概率最高者）。
   */
  private drawPool(): PublicEvent[] {
    const events = this.scene.events ?? [];
    const byProbDesc = (a: PublicEvent, b: PublicEvent) =>
      (b.probability ?? 0) - (a.probability ?? 0);
    const mandatory = events.filter(
      ev => ev.category === 'story' || ev.category === 'core_mechanic',
    );
    const randoms = events.filter(ev => ev.category === 'random');
    const chosen = randoms.filter(ev => this.random() < (ev.probability ?? 0));
    if (chosen.length < 2) {
      for (const ev of randoms.filter(e => !chosen.includes(e)).sort(byProbDesc)) {
        if (chosen.length >= 2) break;
        chosen.push(ev);
      }
    }
    return [...mandatory, ...chosen.sort(byProbDesc).slice(0, 4)];
  }

  // ========== 行动流 ==========

  /**
   * 执行一次行动：触发到期事件 → 递减倒计时/事件剩余 → POST →
   * 应用判定与系统效果 → 推进时钟 → 落账结局或存快照。
   */
  async act(rawInput: string): Promise<GameState> {
    const s = this.state;
    if (s.phase !== 'playing') return this.getSnapshot();
    const input = rawInput.trim().slice(0, MAX_INPUT);
    if (!input) return this.getSnapshot();

    s.history.push({ kind: 'player', text: input });

    // 请求失败时用于回滚的备份（允许玩家重试同一行动）
    const backup = {
      activeEvents: s.activeEvents.map(ev => ({ ...ev })),
      countdowns: { ...s.countdowns },
      san: s.san,
      con: s.con,
      time: s.time,
      room404At: s.room404At,
      historyLen: s.history.length,
      triggered: new Set(this.triggered),
      lastFixedMin: this.lastFixedMin,
    };

    // 行动开始：递减进行中事件（归零移除），再触发本轮到期的（新触发的不参与本轮递减）
    this.tickEvents();
    this.checkPreTriggers(input);
    // 进行中事件的引擎自管每行动效果（如停电的理智流失）
    this.applyEventPenalties();
    // 倒计时递减（进入/获得当轮不计，见 updateCountdownLifecycle）
    this.tickCountdowns();

    // 本行动的时间倍率（时间加速类事件进行中则 step 翻倍）
    const timeMultiplier = this.currentTimeMultiplier();

    let res: EngineResponse;
    try {
      res = await this.judge(s.sceneId, input, this.toRequestState());
    } catch (err) {
      s.activeEvents = backup.activeEvents;
      s.countdowns = backup.countdowns;
      s.san = backup.san;
      s.con = backup.con;
      s.time = backup.time;
      s.room404At = backup.room404At;
      s.history.length = backup.historyLen;
      this.triggered = backup.triggered;
      this.lastFixedMin = backup.lastFixedMin;
      throw err;
    }

    const prevLocation = s.location;
    const hadWearFlag = s.flags.includes('wearing_red_uniform');
    this.applyResponse(res);
    // 上下文触发：乘电梯 / 获得指定物品
    this.checkPostTriggers(res, prevLocation);
    // 倒计时生命周期：进入 405 设 3、离开清除；穿上红制服设 2、脱下清除
    this.updateCountdownLifecycle(prevLocation, hadWearFlag);

    s.actionCount += 1;
    s.time = shiftTime(s.time, this.stepMinutes() * timeMultiplier);

    const outcome = res.outcome;
    if (outcome && outcome.status !== 'playing') {
      s.phase = outcome.status;
      s.winPath = outcome.win_path;
      s.ending = outcome.ending ?? {
        title: outcome.status === 'won' ? '逃离成功' : '游戏结束',
        narrative: '',
      };
      if (outcome.status === 'won' && outcome.win_path) {
        recordWin(s.sceneId, outcome.win_path, s.actionCount);
      }
      clearSave(s.sceneId);
    } else {
      this.persist();
    }
    return this.getSnapshot();
  }

  /** 主动放弃：直接判负，不调 API */
  giveUp(): GameState {
    const s = this.state;
    if (s.phase !== 'playing') return this.getSnapshot();
    s.phase = 'lost';
    s.winPath = null;
    s.ending = GIVE_UP_ENDING;
    s.history.push({ kind: 'system', text: '【放弃】你放弃了逃离的念头。' });
    clearSave(s.sceneId);
    return this.getSnapshot();
  }

  // ========== 事件系统 ==========

  private stepMinutes(): number {
    return this.scene.time_config.step_minutes || 15;
  }

  private findEvent(id: string): PublicEvent | undefined {
    return this.scene.events.find(e => e.id === id);
  }

  /** 递减进行中事件的剩余行动数，归零移除（本行动开始前调用） */
  private tickEvents(): void {
    this.state.activeEvents = this.state.activeEvents
      .map(ev => ({ ...ev, remainingActions: ev.remainingActions - 1 }))
      .filter(ev => ev.remainingActions > 0);
  }

  /** 行动开始前的触发检查：time / time_location / random(any_time、in_any_room、following_cat) / fixed */
  private checkPreTriggers(input: string): void {
    const s = this.state;
    const start = this.scene.time_config.start;
    const gNow = gameMinutes(s.time, start);
    for (const ev of this.pool) {
      if (this.triggered.has(ev.id)) continue;
      if (s.activeEvents.some(a => a.id === ev.id)) continue;
      const value = ev.trigger_value ?? '';
      switch (ev.trigger_type) {
        case 'time': {
          const win = parseTimeWindow(value, start);
          if (win && gNow >= win.from && gNow < win.to) this.trigger(ev);
          break;
        }
        case 'time_location': {
          const m = /^(\d{2}:\d{2})\s+at\s+(\S+)$/.exec(value);
          if (m) {
            const from = gameMinutes(m[1], start);
            if (gNow >= from && gNow < from + TIME_LOCATION_WINDOW_MIN && s.location === m[2]) {
              this.trigger(ev);
            }
          }
          break;
        }
        case 'random': {
          if (value === 'any_time') {
            const sch = this.scheduled.find(x => x.id === ev.id);
            if (sch && s.actionCount + 1 >= sch.atAction) this.trigger(ev);
          } else if (value === 'in_any_room') {
            if (s.location.startsWith('room_') && this.random() < (ev.probability ?? 0)) {
              this.trigger(ev, false);
            }
          } else if (value === 'following_cat') {
            if (input.includes('跟随') && this.random() < (ev.probability ?? 0)) {
              this.trigger(ev, false);
            }
          }
          break;
        }
        case 'fixed': {
          if (value === 'every_120min' && gNow - this.lastFixedMin >= FIXED_INTERVAL_MIN) {
            this.lastFixedMin = gNow;
            this.trigger(ev, false);
          }
          break;
        }
        default:
          break;
      }
    }
  }

  /** 判定返回后的触发检查：random(using_elevator) / item_obtain */
  private checkPostTriggers(res: EngineResponse, prevLocation: string): void {
    const s = this.state;
    const j = res.judgment;
    const newLocation = j?.new_location ?? null;
    const gained = j?.items_gained ?? [];
    for (const ev of this.pool) {
      if (this.triggered.has(ev.id)) continue;
      if (s.activeEvents.some(a => a.id === ev.id)) continue;
      if (ev.trigger_type === 'random' && ev.trigger_value === 'using_elevator') {
        const arrived =
          newLocation !== null &&
          newLocation !== prevLocation &&
          (newLocation === 'elevator' || newLocation === 'elevator_hall');
        if (arrived && this.random() < (ev.probability ?? 0)) this.trigger(ev, false);
      } else if (ev.trigger_type === 'item_obtain') {
        if (
          ev.trigger_value &&
          gained.includes(ev.trigger_value) &&
          this.random() < (ev.probability ?? 0)
        ) {
          this.trigger(ev);
        }
      }
    }
  }

  /**
   * 触发事件：插入 system 行、设定剩余行动数（duration_minutes/15，无则 1），
   * 并处理引擎自管效果（404 漂移 / 时间回拨 / 病历本变红倒计时）。
   */
  private trigger(ev: PublicEvent, once = true): void {
    const s = this.state;
    if (once) this.triggered.add(ev.id);
    const effect = ev.effect ?? {};
    const durationMin = readNum(effect.duration_minutes);
    const remaining = durationMin ? Math.max(1, Math.round(durationMin / this.stepMinutes())) : 1;
    s.activeEvents.push({ id: ev.id, remainingActions: remaining });

    const name = readStr(ev.name) ?? ev.id;
    const desc = readStr(effect.desc);
    s.history.push({ kind: 'system', text: `【事件】${name}${desc ? `：${desc}` : ''}` });

    if (effect.room_404_relocate === true) this.relocateRoom404();
    const rewindMin = readNum(effect.time_rewind_minutes);
    if (rewindMin) s.time = shiftTime(s.time, -rewindMin);
    const rewindHours = readNum(effect.time_rewind_hours);
    if (rewindHours) s.time = shiftTime(s.time, -rewindHours * 60);
    // E05 类：病历本变色 → record_red 倒计时（+1：行动开始前先 -1 再送服务端，保证 time_limit_actions 次完整行动）
    const timeLimit = readNum(effect.time_limit_actions);
    if (timeLimit) s.countdowns.record_red = timeLimit + 1;
  }

  /** 404 漂移：换到候选位置中的另一个 */
  private relocateRoom404(): void {
    const cfg = ROOM404_CONFIG[this.state.sceneId];
    if (!cfg || cfg.candidates.length === 0) return;
    this.state.room404At =
      cfg.candidates.find(c => c !== this.state.room404At) ?? cfg.candidates[0];
  }

  /** 进行中事件的引擎自管每行动扣 san（如停电 san_penalty_per_action） */
  private applyEventPenalties(): void {
    const s = this.state;
    for (const active of s.activeEvents) {
      const def = this.findEvent(active.id);
      const penalty = readNum(def?.effect?.san_penalty_per_action);
      if (penalty) {
        s.san = clampStat(s.san - penalty);
        const name = readStr(def?.name) ?? active.id;
        s.history.push({ kind: 'system', text: `【事件】${name}持续影响：理智 -${penalty}` });
      }
    }
  }

  /** 本行动的时间倍率：取进行中事件里最大的 time_multiplier */
  private currentTimeMultiplier(): number {
    let mult = 1;
    for (const active of this.state.activeEvents) {
      const def = this.findEvent(active.id);
      const m = readNum(def?.effect?.time_multiplier);
      if (m && m > mult) mult = m;
    }
    return mult;
  }

  // ========== 倒计时 ==========

  /** 每轮行动开始前，所有存续倒计时 -1（下限 0） */
  private tickCountdowns(): void {
    const cd = this.state.countdowns;
    for (const key of Object.keys(cd)) {
      cd[key] = Math.max(0, cd[key] - 1);
    }
  }

  private updateCountdownLifecycle(prevLocation: string, hadWearFlag: boolean): void {
    const s = this.state;
    const cd = s.countdowns;
    // room_405：进入（new_location 变为 room_405 且之前不在）设 3，离开即清除
    if (s.location === 'room_405' && prevLocation !== 'room_405') {
      cd.room_405 = ROOM_405_COUNTDOWN;
    }
    if (s.location !== 'room_405' && 'room_405' in cd) {
      delete cd.room_405;
    }
    // wearing_red_uniform：获得 flag 设 2，flag 移除即清除
    const hasWear = s.flags.includes('wearing_red_uniform');
    if (hasWear && !hadWearFlag) {
      cd.wear_red_uniform = WEAR_RED_COUNTDOWN;
    }
    if (!hasWear && 'wear_red_uniform' in cd) {
      delete cd.wear_red_uniform;
    }
  }

  // ========== 判定落账 ==========

  private applyResponse(res: EngineResponse): void {
    const s = this.state;
    const j = res.judgment;
    if (j) {
      // valid=false 时服务端已清零 AI 增量，此处按值落账即可
      if (j.valid !== false) {
        s.san = clampStat(s.san + (j.san_change ?? 0));
        // con_change 正 = 污染涨
        s.con = clampStat(s.con + (j.con_change ?? 0));
        if (j.new_location) s.location = j.new_location;
        for (const id of j.items_lost ?? []) {
          s.items = s.items.filter(x => x !== id);
        }
        for (const id of j.items_gained ?? []) {
          if (!s.items.includes(id)) s.items.push(id);
        }
        for (const id of j.flags_lost ?? []) {
          s.flags = s.flags.filter(x => x !== id);
        }
        for (const id of j.flags_added ?? []) {
          if (!s.flags.includes(id)) s.flags.push(id);
        }
        for (const id of j.rules_exposed ?? []) {
          if (!s.exposedRules.includes(id)) s.exposedRules.push(id);
        }
      }
      s.history.push({ kind: 'ai', text: j.narrative || '……' });
      if (j.warning) {
        s.history.push({ kind: 'system', text: `【警告】${j.warning}` });
      }
    } else {
      // 超时预检等场景：judgment 缺失，以结局文案兜底
      s.history.push({ kind: 'ai', text: res.outcome?.ending?.narrative ?? '……' });
    }

    for (const eff of res.system_effects ?? []) {
      s.san = clampStat(s.san + (eff.san_change ?? 0));
      s.con = clampStat(s.con + (eff.con_change ?? 0));
      if (eff.note) {
        s.history.push({ kind: 'system', text: `【系统】${eff.note}` });
      }
    }

    for (const rule of res.rules_learned ?? []) {
      if (!s.learnedRules.some(r => r.id === rule.id)) {
        s.learnedRules.push({ id: rule.id, desc: rule.desc });
      }
    }

    if (res.state_updates?.lastCheckinHour) {
      s.lastCheckinHour = res.state_updates.lastCheckinHour;
    }

    // 服务端下发了建议动作则整体覆盖（结局后为空数组）；未下发则保留现状
    if (Array.isArray(res.suggestions)) {
      s.suggestions = res.suggestions;
    }
  }

  // ========== 存档 ==========

  private toRequestState(): EngineRequestState {
    const s = this.state;
    return {
      actionCount: s.actionCount,
      time: s.time,
      location: s.location,
      san: s.san,
      con: s.con,
      items: [...s.items],
      flags: [...s.flags],
      learnedRules: s.learnedRules.map(r => r.id),
      exposedRules: [...s.exposedRules],
      activeEvents: s.activeEvents.map(ev => ({ ...ev })),
      countdowns: { ...s.countdowns },
      lastCheckinHour: s.lastCheckinHour,
      room404At: s.room404At,
      history: buildApiHistory(s.history),
    };
  }

  private persist(): void {
    writeSave(this.state.sceneId, {
      state: { ...this.state },
      poolIds: this.pool.map(ev => ev.id),
      scheduled: this.scheduled.map(x => ({ ...x })),
      triggered: [...this.triggered],
      lastFixedMin: this.lastFixedMin,
      savedAt: Date.now(),
    });
  }
}
