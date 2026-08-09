import { Play, RotateCcw, ScrollText } from 'lucide-react';
import { scenes } from '../data/scenePublic';
import type { PublicScene } from '../data/scenePublic';
import type { SaveData, SceneProgress } from '../storage';
import { WIN_PATHS } from '../types';
import type { SceneId } from '../types';

interface Props {
  progress: Record<string, SceneProgress>;
  saves: Partial<Record<SceneId, SaveData | null>>;
  onStart: (sceneId: SceneId) => void;
  onContinue: (sceneId: SceneId) => void;
}

export default function SceneSelect({ progress, saves, onStart, onContinue }: Props) {
  return (
    <div className="rt-select rt-fade-in">
      <header className="rt-select-header">
        <div className="rt-select-logo">📜</div>
        <h1>规则怪谈：逃离手册</h1>
        <p className="rt-select-tagline">遵守规则，识破谎言，在天亮之前逃出去</p>
      </header>

      <div className="rt-scene-list">
        {scenes.map(scene => (
          <SceneCard
            key={scene.id}
            scene={scene}
            progress={progress[scene.id]}
            save={saves[scene.id as SceneId] ?? null}
            onStart={() => onStart(scene.id as SceneId)}
            onContinue={() => onContinue(scene.id as SceneId)}
          />
        ))}
      </div>

      <footer className="rt-select-footer">每个场景都藏着多条生路：正道 · 险道 · 诡道</footer>
    </div>
  );
}

interface CardProps {
  scene: PublicScene;
  progress?: SceneProgress;
  save: SaveData | null;
  onStart: () => void;
  onContinue: () => void;
}

function SceneCard({ scene, progress, save, onStart, onContinue }: CardProps) {
  const cleared = new Set(progress?.clearedPaths ?? []);
  const best = progress?.bestActions ?? {};

  const handleStart = () => {
    if (save && !window.confirm('该场景已有进行中的存档，重新开始将覆盖它，确定吗？')) {
      return;
    }
    onStart();
  };

  return (
    <section className="rt-scene-card">
      <div className="rt-scene-head">
        <h2>{scene.name}</h2>
        <span className="rt-scene-theme">{scene.theme}</span>
      </div>
      <p className="rt-scene-bg">{scene.background}</p>

      <div className="rt-scene-paths">
        {WIN_PATHS.map(path => (
          <span key={path} className={`rt-path-chip ${cleared.has(path) ? 'cleared' : ''}`}>
            {path}
            {cleared.has(path) && best[path] !== undefined && <em>最佳 {best[path]} 次</em>}
          </span>
        ))}
      </div>

      <div className="rt-scene-actions">
        {save && (
          <button className="rt-btn rt-btn-primary" onClick={onContinue}>
            <Play size={16} /> 继续（第 {save.state.actionCount} 次行动 · {save.state.time}）
          </button>
        )}
        <button className={`rt-btn ${save ? '' : 'rt-btn-primary'}`} onClick={handleStart}>
          {save ? (
            <>
              <RotateCcw size={15} /> 重新开始
            </>
          ) : (
            <>
              <ScrollText size={15} /> 进入场景
            </>
          )}
        </button>
      </div>
    </section>
  );
}
