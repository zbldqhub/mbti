import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Flag, Lightbulb, Send, Target } from 'lucide-react';
import DifficultyBadge from './DifficultyBadge';
import type { ChatEntry, GameSession, Verdict } from '../types';
import { MAX_HINTS } from '../types';

interface Props {
  session: GameSession;
  busy: boolean;
  error: string | null;
  onAsk: (text: string) => void;
  onGuess: (text: string) => void;
  onHint: () => void;
  onGiveUp: () => void;
  onExit: () => void;
}

const VERDICT_LABELS: Record<Verdict, string> = {
  yes: '是',
  no: '否',
  partial: '是也不是',
  irrelevant: '无关',
  win: '猜对了',
  unknown: '',
};

export default function GameView({
  session,
  busy,
  error,
  onAsk,
  onGuess,
  onHint,
  onGiveUp,
  onExit,
}: Props) {
  const [input, setInput] = useState('');
  const [guessOpen, setGuessOpen] = useState(false);
  const [guessText, setGuessText] = useState('');
  const [giveUpOpen, setGiveUpOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);

  // 新消息或等待状态时滚动到底部
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [session.entries.length, busy]);

  const submitAsk = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    onAsk(text);
  };

  const submitGuess = () => {
    const text = guessText.trim();
    if (!text || busy) return;
    setGuessOpen(false);
    setGuessText('');
    onGuess(text);
  };

  const handleExit = () => {
    if (session.entries.length === 0 || window.confirm('本局进度将丢失，确定返回首页吗？')) {
      onExit();
    }
  };

  const { question } = session;

  return (
    <div className="ts-game">
      <header className="ts-game-header">
        <button className="ts-icon-btn" onClick={handleExit} aria-label="返回首页">
          <ArrowLeft size={20} />
        </button>
        <div className="ts-game-title">
          <DifficultyBadge difficulty={question.difficulty} />
          <h2>{question.title}</h2>
        </div>
        <div className="ts-game-stats">
          提问 {session.questionCount} · 提示 {session.hintsUsed}/{MAX_HINTS}
        </div>
      </header>

      <section className="ts-surface-card">
        <div className="ts-card-label">汤面</div>
        <p>{question.surface}</p>
      </section>

      <div className="ts-chat" ref={chatRef}>
        {session.entries.length === 0 && (
          <div className="ts-chat-empty">
            围绕汤面提出「是/否」问题，逐步逼近真相。
            <br />
            例如：「死者的死是意外吗？」「汤里有毒吗？」
          </div>
        )}
        {session.entries.map((entry, i) => (
          <EntryView key={i} entry={entry} />
        ))}
        {busy && <div className="ts-msg ts-msg-ai ts-typing">主持人思索中…</div>}
        {error && <div className="ts-error">{error}</div>}
      </div>

      <footer className="ts-game-footer">
        <div className="ts-input-row">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) submitAsk();
            }}
            placeholder="输入一个是/否问题…"
            maxLength={200}
          />
          <button
            className="ts-btn ts-btn-primary ts-send-btn"
            onClick={submitAsk}
            disabled={busy || !input.trim()}
            aria-label="发送"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="ts-actions">
          <button className="ts-btn ts-btn-accent" disabled={busy} onClick={() => setGuessOpen(true)}>
            <Target size={15} /> 我猜到了
          </button>
          <button
            className="ts-btn"
            disabled={busy || session.hintsUsed >= MAX_HINTS}
            onClick={onHint}
          >
            <Lightbulb size={15} /> 要提示 {session.hintsUsed}/{MAX_HINTS}
          </button>
          <button className="ts-btn ts-btn-danger" disabled={busy} onClick={() => setGiveUpOpen(true)}>
            <Flag size={15} /> 放弃
          </button>
        </div>
      </footer>

      {guessOpen && (
        <div className="ts-modal-mask" onClick={() => setGuessOpen(false)}>
          <div className="ts-modal" onClick={e => e.stopPropagation()}>
            <h3>说出你的完整推理</h3>
            <p className="ts-modal-tip">AI 会判断是否命中汤底核心逻辑，不要求一字不差。</p>
            <textarea
              value={guessText}
              onChange={e => setGuessText(e.target.value)}
              rows={5}
              maxLength={500}
              placeholder="我认为真相是…"
              autoFocus
            />
            <div className="ts-modal-actions">
              <button className="ts-btn" onClick={() => setGuessOpen(false)}>
                取消
              </button>
              <button
                className="ts-btn ts-btn-primary"
                disabled={!guessText.trim() || busy}
                onClick={submitGuess}
              >
                提交推理
              </button>
            </div>
          </div>
        </div>
      )}

      {giveUpOpen && (
        <div className="ts-modal-mask" onClick={() => setGiveUpOpen(false)}>
          <div className="ts-modal" onClick={e => e.stopPropagation()}>
            <h3>确定放弃吗？</h3>
            <p className="ts-modal-tip">放弃后将直接展示汤底，本局记为未通关。</p>
            <div className="ts-modal-actions">
              <button className="ts-btn" onClick={() => setGiveUpOpen(false)}>
                再想想
              </button>
              <button
                className="ts-btn ts-btn-danger"
                disabled={busy}
                onClick={() => {
                  setGiveUpOpen(false);
                  onGiveUp();
                }}
              >
                放弃，看汤底
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EntryView({ entry }: { entry: ChatEntry }) {
  if (entry.kind === 'hint') {
    return <div className="ts-hint">💡 提示：{entry.reply}</div>;
  }
  if (entry.kind === 'guess') {
    return (
      <>
        <div className="ts-msg ts-msg-user">
          <span className="ts-msg-tag">我的推理</span>
          {entry.question}
        </div>
        <div className="ts-msg ts-msg-ai">{entry.reply}</div>
      </>
    );
  }
  const label = entry.verdict ? VERDICT_LABELS[entry.verdict] : '';
  return (
    <>
      <div className="ts-msg ts-msg-user">{entry.question}</div>
      <div className="ts-msg ts-msg-ai">
        {label && <span className={`ts-verdict ts-verdict-${entry.verdict}`}>{label}</span>}
        {entry.reply}
      </div>
    </>
  );
}
