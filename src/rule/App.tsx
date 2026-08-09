import { useState } from 'react';
import { scenes } from './data/scenePublic';
import type { PublicScene } from './data/scenePublic';
import { RuleEngine } from './engine';
import { loadProgress, loadSave } from './storage';
import type { Progress, SaveData } from './storage';
import { SCENE_IDS } from './types';
import type { GameState, SceneId } from './types';
import SceneSelect from './components/SceneSelect';
import GameView from './components/GameView';
import EndingView from './components/EndingView';

type View = 'select' | 'game' | 'ending';

const findScene = (id: SceneId): PublicScene => {
  const scene = scenes.find(s => s.id === id);
  if (!scene) throw new Error(`未知场景: ${id}`);
  return scene;
};

export default function App() {
  const [view, setView] = useState<View>('select');
  const [engine, setEngine] = useState<RuleEngine | null>(null);
  const [snapshot, setSnapshot] = useState<GameState | null>(null);
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enter = (e: RuleEngine) => {
    setEngine(e);
    setSnapshot(e.getSnapshot());
    setError(null);
    setView('game');
  };

  const startScene = (sceneId: SceneId) => {
    // start 为异步：会先请求服务端开局建议（失败时引擎内静默降级），再进入游戏
    void RuleEngine.start(sceneId).then(enter);
  };

  const continueScene = (sceneId: SceneId) => {
    const restored = RuleEngine.restore(sceneId);
    if (restored) {
      enter(restored);
    } else {
      startScene(sceneId);
    }
  };

  const handleAction = (text: string) => {
    const e = engine;
    if (!e || busy) return;
    setBusy(true);
    setError(null);
    void (async () => {
      try {
        const state = await e.act(text);
        setSnapshot(state);
        if (state.phase !== 'playing') {
          setProgress(loadProgress());
          setView('ending');
        }
      } catch (err) {
        console.error('判定请求失败:', err);
        setError('判定引擎暂时没有回应，请稍后重试。');
      } finally {
        setBusy(false);
      }
    })();
  };

  const handleGiveUp = () => {
    const e = engine;
    if (!e || busy) return;
    const state = e.giveUp();
    setSnapshot(state);
    setView('ending');
  };

  const backToSelect = () => {
    setEngine(null);
    setSnapshot(null);
    setError(null);
    setView('select');
  };

  // 场景选择页每次渲染时重读存档（继续/重新开始按钮据此展示）
  const saves: Partial<Record<SceneId, SaveData | null>> = {};
  for (const id of SCENE_IDS) saves[id] = loadSave(id);

  return (
    <div className="rt-app">
      {view === 'select' && (
        <SceneSelect
          progress={progress}
          saves={saves}
          onStart={startScene}
          onContinue={continueScene}
        />
      )}
      {view === 'game' && snapshot && (
        <GameView
          scene={findScene(snapshot.sceneId)}
          state={snapshot}
          busy={busy}
          error={error}
          onAction={handleAction}
          onGiveUp={handleGiveUp}
          onExit={backToSelect}
        />
      )}
      {view === 'ending' && snapshot && (
        <EndingView
          scene={findScene(snapshot.sceneId)}
          state={snapshot}
          onAgain={() => startScene(snapshot.sceneId)}
          onHome={backToSelect}
        />
      )}
    </div>
  );
}
