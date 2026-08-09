import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Clock, Flag, MapPin, Send } from 'lucide-react';
import type { PublicScene } from '../data/scenePublic';
import { COUNTDOWN_LABELS, COUNTDOWN_DISPLAY_MAX } from '../types';
import type { GameState, HistoryEntry } from '../types';

interface Props {
  scene: PublicScene;
  state: GameState;
  busy: boolean;
  error: string | null;
  onAction: (text: string) => void;
  onGiveUp: () => void;
  onExit: () => void;
}

/** 理智条颜色：满值青绿 → 空值血红 */
const sanColor = (v: number): string => `hsl(${Math.round(v * 1.2)}, 45%, 42%)`;

export default function GameView({
  scene,
  state,
  busy,
  error,
  onAction,
  onGiveUp,
  onExit,
}: Props) {
  const [input, setInput] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const [giveUpOpen, setGiveUpOpen] = useState(false);
  const logRef = useRef<HTMLDivElement | null>(null);

  // 新消息或等待状态时滚动到底部
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.history.length, busy]);

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    onAction(text);
  };

  const handleExit = () => {
    if (window.confirm('进度已自动保存，确定返回场景选择吗？')) {
      onExit();
    }
  };

  const areaName = (id: string): string =>
    scene.areas.find(a => a.id === id)?.name ?? (id === 'outside' ? '外面' : id);

  const itemName = (id: string): string =>
    scene.itemsPublic.find(i => i.id === id)?.name ?? id;

  const eventName = (id: string): string =>
    scene.events.find(e => e.id === id)?.name ?? id;

  const countdownEntries = Object.entries(state.countdowns);

  return (
    <div className="rt-game">
      <header className="rt-game-header">
        <button className="rt-icon-btn" onClick={handleExit} aria-label="返回场景选择">
          <ArrowLeft size={20} />
        </button>
        <div className="rt-game-title">
          <h2>{scene.name}</h2>
          <span className="rt-game-loc">
            <MapPin size={13} /> {areaName(state.location)}
          </span>
        </div>
        <div className="rt-game-clock">
          <Clock size={15} /> {state.time}
          <span className="rt-game-actions">行动 {state.actionCount}</span>
        </div>
      </header>

      <section className="rt-status">
        <div className="rt-meter">
          <div className="rt-meter-label">
            理智 <em>{state.san}</em>
          </div>
          <div className="rt-meter-track">
            <div
              className="rt-meter-fill"
              style={{ width: `${state.san}%`, background: sanColor(state.san) }}
            />
          </div>
        </div>
        <div className="rt-meter">
          <div className="rt-meter-label">
            污染 <em>{state.con}</em>
          </div>
          <div className="rt-meter-track">
            <div className="rt-meter-fill rt-meter-con" style={{ width: `${state.con}%` }} />
          </div>
        </div>
        {(countdownEntries.length > 0 || state.activeEvents.length > 0) && (
          <div className="rt-badges">
            {countdownEntries.map(([key, value]) => (
              <span key={key} className="rt-badge rt-badge-countdown">
                {COUNTDOWN_LABELS[key] ?? key} {Math.min(value, COUNTDOWN_DISPLAY_MAX[key] ?? value)}
              </span>
            ))}
            {state.activeEvents.map(ev => (
              <span key={ev.id} className="rt-badge rt-badge-event">
                {eventName(ev.id)}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="rt-log" ref={logRef}>
        {state.history.length === 0 && (
          <div className="rt-log-empty">
            {scene.background}
            <br />
            <br />
            输入你的行动，例如「前往中央广场」「搜索岗亭」「阅读日记」。
          </div>
        )}
        {state.history.map((entry, i) => (
          <LogEntry key={i} entry={entry} />
        ))}
        {busy && <div className="rt-msg rt-msg-ai rt-typing">判定中…</div>}
        {error && <div className="rt-error">{error}</div>}
      </div>

      {state.items.length > 0 && (
        <div className="rt-items">
          {state.items.map(id => (
            <span key={id} className="rt-item-chip">
              {itemName(id)}
            </span>
          ))}
        </div>
      )}

      {rulesOpen && (
        <div className="rt-rules">
          <div className="rt-rules-title">规则手册（已习得 {state.learnedRules.length} 条）</div>
          <ul>
            {state.learnedRules.map(rule => {
              const exposed = state.exposedRules.includes(rule.id);
              return (
                <li key={rule.id} className={exposed ? 'rt-rule-exposed' : ''}>
                  <span className="rt-rule-id">{rule.id}</span>
                  {rule.desc}
                  {exposed && <span className="rt-rule-tag">❌ 已识破</span>}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <footer className="rt-game-footer">
        <div className="rt-input-row">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) submit();
            }}
            placeholder="输入你的行动…"
            maxLength={500}
            disabled={busy}
          />
          <button
            className="rt-btn rt-btn-primary rt-send-btn"
            onClick={submit}
            disabled={busy || !input.trim()}
            aria-label="发送"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="rt-actions">
          <button
            className={`rt-btn ${rulesOpen ? 'rt-btn-active' : ''}`}
            disabled={busy}
            onClick={() => setRulesOpen(o => !o)}
          >
            <BookOpen size={15} /> 规则手册
          </button>
          <button className="rt-btn rt-btn-danger" disabled={busy} onClick={() => setGiveUpOpen(true)}>
            <Flag size={15} /> 放弃
          </button>
        </div>
      </footer>

      {giveUpOpen && (
        <div className="rt-modal-mask" onClick={() => setGiveUpOpen(false)}>
          <div className="rt-modal" onClick={e => e.stopPropagation()}>
            <h3>确定放弃吗？</h3>
            <p className="rt-modal-tip">放弃后本局立即结束并记为失败，存档将被清除。</p>
            <div className="rt-modal-actions">
              <button className="rt-btn" onClick={() => setGiveUpOpen(false)}>
                再坚持一下
              </button>
              <button
                className="rt-btn rt-btn-danger"
                disabled={busy}
                onClick={() => {
                  setGiveUpOpen(false);
                  onGiveUp();
                }}
              >
                确认放弃
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LogEntry({ entry }: { entry: HistoryEntry }) {
  if (entry.kind === 'player') {
    return <div className="rt-msg rt-msg-player">{entry.text}</div>;
  }
  if (entry.kind === 'ai') {
    return <div className="rt-msg rt-msg-ai">{entry.text}</div>;
  }
  return <div className="rt-msg-system">{entry.text}</div>;
}
