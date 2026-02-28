// 词语类型
export interface Word {
  id: string;
  text: string;
  category: WordCategory;
  type: WordType;
  weight?: number;
}

// 词语类别
export type WordCategory = 'cosmic' | 'nature' | 'body' | 'artifact' | 'abstract' | 'time';

// 词性
export type WordType = 'noun' | 'adj' | 'verb';

// 类别元数据
export interface CategoryMeta {
  label: string;
  color: string;
  glow: string;
  icon: string;
}

// 运动模式
type MovementMode = 'fall' | 'diagonal' | 'bounce' | 'float' | 'spiral';

// 下落中的词语
export interface FallingWord extends Word {
  x: number;
  y: number;
  rotation: number;
  speed: number;
  vx: number;
  vy: number;
  uniqueId: string;
  mode?: MovementMode;
  rotationSpeed?: number;
  spiralAngle?: number;
}

// 粒子
export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

// 海报配置
export interface PosterConfig {
  verse: string;
  words: Word[];
  date: string;
  background: 'gradient' | 'constellation' | 'particles';
}
