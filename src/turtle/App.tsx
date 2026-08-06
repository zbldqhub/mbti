import { useState } from 'react';
import { questions } from './data/questions';
import HomeView from './components/HomeView';
import BrowseView from './components/BrowseView';
import RulesView from './components/RulesView';
import GameView from './components/GameView';
import ResultView from './components/ResultView';
import { askHost, judgeGuess, requestHint, revealAnswer } from './api';
import type { HistoryItem } from './api';
import { loadProgress, markCleared } from './storage';
import type { Progress } from './storage';
import type {
  ChatEntry,
  DifficultyChoice,
  GameSession,
  TurtleQuestionMeta,
  View,
} from './types';
import { MAX_HINTS } from './types';

/** 把聊天记录序列化为发给服务端的问答对 */
const buildHistory = (entries: ChatEntry[]): HistoryItem[] =>
  entries.map(entry => {
    if (entry.kind === 'hint') {
      return { question: '（玩家请求了提示）', reply: entry.reply };
    }
    if (entry.kind === 'guess') {
      return { question: `（玩家尝试完整推理）${entry.question}`, reply: entry.reply };
    }
    return { question: entry.question, reply: entry.reply };
  });

export default function App() {
  const [view, setView] = useState<View>('home');
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [session, setSession] = useState<GameSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startGame = (choice: DifficultyChoice, specificId?: number) => {
    let picked: TurtleQuestionMeta | undefined;
    if (specificId !== undefined) {
      picked = questions.find(q => q.id === specificId);
    } else {
      const pool =
        choice === 'random' ? questions : questions.filter(q => q.difficulty === choice);
      const clearedSet = new Set(progress.cleared);
      const fresh = pool.filter(q => !clearedSet.has(q.id));
      if (fresh.length === 0) {
        if (!window.confirm('该难度题目已全部通关，是否重复挑战？')) return;
      }
      const source = fresh.length > 0 ? fresh : pool;
      picked = source[Math.floor(Math.random() * source.length)];
    }
    if (!picked) return;
    setSession({
      question: picked,
      entries: [],
      questionCount: 0,
      hintsUsed: 0,
      won: false,
      answer: null,
    });
    setError(null);
    setView('game');
  };

  /** AI 调用的统一包装：防并发、统一错误提示 */
  const runAi = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      console.error('AI 调用失败:', err);
      setError('AI 主持人暂时走神了，请稍后重试。');
    } finally {
      setBusy(false);
    }
  };

  const handleAsk = (text: string) => {
    const s = session;
    if (!s) return;
    void runAi(async () => {
      const res = await askHost(s.question.id, buildHistory(s.entries), text);
      const entry: ChatEntry = {
        kind: 'ask',
        question: text,
        reply: res.reply,
        verdict: res.verdict,
      };
      const won = res.verdict === 'win';
      const questionCount = s.questionCount + 1;
      setSession({
        ...s,
        entries: [...s.entries, entry],
        questionCount,
        won,
        answer: res.answer ?? s.answer,
      });
      if (won) {
        setProgress(markCleared(s.question.id, questionCount));
        setView('result');
      }
    });
  };

  const handleGuess = (text: string) => {
    const s = session;
    if (!s) return;
    void runAi(async () => {
      const res = await judgeGuess(s.question.id, buildHistory(s.entries), text);
      const entry: ChatEntry = { kind: 'guess', question: text, reply: res.reply };
      setSession({
        ...s,
        entries: [...s.entries, entry],
        won: res.correct,
        answer: res.answer ?? s.answer,
      });
      if (res.correct) {
        setProgress(markCleared(s.question.id, s.questionCount));
        setView('result');
      }
    });
  };

  const handleHint = () => {
    const s = session;
    if (!s || s.hintsUsed >= MAX_HINTS) return;
    void runAi(async () => {
      const res = await requestHint(s.question.id, buildHistory(s.entries), s.hintsUsed + 1);
      setSession({
        ...s,
        entries: [...s.entries, { kind: 'hint', question: '', reply: res.reply }],
        hintsUsed: s.hintsUsed + 1,
      });
    });
  };

  const handleGiveUp = () => {
    const s = session;
    if (!s) return;
    void runAi(async () => {
      const res = await revealAnswer(s.question.id);
      setSession({ ...s, won: false, answer: res.answer });
      setView('result');
    });
  };

  return (
    <div className="ts-app">
      {view === 'home' && (
        <HomeView
          progress={progress}
          onStart={choice => startGame(choice)}
          onBrowse={() => setView('browse')}
          onRules={() => setView('rules')}
        />
      )}
      {view === 'browse' && (
        <BrowseView
          clearedIds={progress.cleared}
          onBack={() => setView('home')}
          onPlay={id => startGame('random', id)}
        />
      )}
      {view === 'rules' && <RulesView onBack={() => setView('home')} />}
      {view === 'game' && session && (
        <GameView
          session={session}
          busy={busy}
          error={error}
          onAsk={handleAsk}
          onGuess={handleGuess}
          onHint={handleHint}
          onGiveUp={handleGiveUp}
          onExit={() => setView('home')}
        />
      )}
      {view === 'result' && session && (
        <ResultView
          session={session}
          best={progress.best[session.question.id]}
          onAgain={() => startGame(session.question.difficulty)}
          onHome={() => setView('home')}
        />
      )}
    </div>
  );
}
