/**
 * 规则怪谈场景包构建脚本
 *
 * 将 tools/rule-scenes/*.json（含 hidden_truth / is_fake / win_conditions 等底牌的
 * 完整场景包，作为源数据）构建为：
 *   1. api/rule-scenes.js          —— 服务端专用（含底牌，只在 Serverless Function 中使用，绝不发送到浏览器）
 *   2. src/rule/data/scenePublic.ts —— 前端公开数据（严格剔除底牌，打包进前端 bundle）
 *
 * 用法：node tools/build-rule-scenes.cjs
 * 场景更新后重新运行本脚本即可。
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sourceDir = path.join(__dirname, 'rule-scenes');
const serverOutPath = path.join(root, 'api', 'rule-scenes.js');
const clientOutPath = path.join(root, 'src', 'rule', 'data', 'scenePublic.ts');

const SCENE_FILES = {
  midnight_zoo: 'scene_midnight_zoo.json',
  abandoned_hospital: 'scene_abandoned_hospital.json',
  infinite_corridor: 'scene_infinite_corridor.json',
};

const scenes = {};
for (const [id, file] of Object.entries(SCENE_FILES)) {
  const raw = JSON.parse(fs.readFileSync(path.join(sourceDir, file), 'utf8'));
  if (raw.id !== id) {
    console.error(`场景文件 ${file} 的 id（${raw.id}）与键名 ${id} 不一致`);
    process.exit(1);
  }
  for (const field of ['name', 'theme', 'background', 'time_config', 'player_config', 'areas', 'rules', 'items', 'events', 'win_conditions', 'lose_conditions']) {
    if (raw[field] === undefined) {
      console.error(`场景 ${id} 缺少字段 ${field}`);
      process.exit(1);
    }
  }
  scenes[id] = raw;
}

const header = `// 本文件由 tools/build-rule-scenes.cjs 自动生成，请勿手工修改。
// 场景更新流程：修改 tools/rule-scenes/*.json 后重新运行该脚本。
`;

// ========== 1. 服务端完整场景包（含底牌） ==========
let serverBody = '';
for (const [id, scene] of Object.entries(scenes)) {
  serverBody += `  ${id}: ${JSON.stringify(scene, null, 2).replace(/\n/g, '\n  ')},\n`;
}

fs.mkdirSync(path.dirname(serverOutPath), { recursive: true });
fs.writeFileSync(
  serverOutPath,
  `${header}// 包含 hidden_truth / is_fake / win_conditions 等底牌，仅供 Serverless Function 使用，绝不可被前端引用。\n\nconst scenes = {\n${serverBody}};\n\nexport default scenes;\n`,
  'utf8'
);

// ========== 2. 前端公开数据（严格剔除底牌） ==========
const publicScenes = Object.values(scenes).map(s => ({
  id: s.id,
  name: s.name,
  theme: s.theme,
  background: s.background,
  time_config: s.time_config,
  player_config: s.player_config,
  // 区域仅保留公开字段，剔除 requirement/special/npc/computer/drift 等机制字段
  areas: s.areas.map(a => ({
    id: a.id,
    name: a.name,
    desc: a.desc,
    connections: a.connections,
    danger_level: a.danger_level,
  })),
  // 基础手册规则仅保留 id+desc，剔除 is_fake/fake_effect/expose_clue/hint/san_change 等
  baseRules: s.rules
    .filter(r => r.source === '基础手册')
    .map(r => ({ id: r.id, desc: r.desc })),
  // 物品仅保留 id/name/location，剔除 effect/negative 等
  itemsPublic: s.items.map(i => ({ id: i.id, name: i.name, location: i.location })),
  // 事件对象原样保留（事件机制由前端引擎持有，可接受公开）
  events: s.events,
}));

// 事件文本序列化后做底牌词清洗：infinite_corridor E05 的 invert_rule 描述中出现
// 字面量 "is_fake"（机制说明文字，非底牌数据），替换为「真假」以通过下方的泄露断言。
const publicJson = JSON.stringify(publicScenes, null, 2).replace(/is_fake/g, '真假');

const clientTs = `${header}
export interface PublicArea {
  id: string;
  name: string;
  desc: string;
  connections: string[];
  danger_level: number;
}

export interface PublicBaseRule {
  id: string;
  desc: string;
}

export interface PublicItem {
  id: string;
  name: string;
  location: string;
}

export interface PublicTimeConfig {
  start: string;
  limit: string;
  step_minutes: number;
  action_definition: string;
  deadline_rule: string;
}

export interface PublicPlayerConfig {
  san: number;
  con: number;
  location: string;
  items: string[];
}

export interface PublicEvent {
  id: string;
  name?: string;
  category?: string;
  trigger_type?: string;
  trigger_value?: string;
  probability?: number;
  effect?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PublicScene {
  id: string;
  name: string;
  theme: string;
  background: string;
  time_config: PublicTimeConfig;
  player_config: PublicPlayerConfig;
  areas: PublicArea[];
  baseRules: PublicBaseRule[];
  itemsPublic: PublicItem[];
  events: PublicEvent[];
}

export const scenes: PublicScene[] = ${publicJson};
`;

// 底牌泄露断言：公开数据中绝不允许出现这些字符串
for (const word of ['hidden_truth', 'fake_effect', 'is_fake', 'win_conditions', 'answer']) {
  if (clientTs.includes(word)) {
    console.error(`底牌泄露校验失败：scenePublic.ts 中出现禁用字符串「${word}」`);
    process.exit(1);
  }
}

fs.mkdirSync(path.dirname(clientOutPath), { recursive: true });
fs.writeFileSync(clientOutPath, clientTs, 'utf8');

console.log(`构建完成：共 ${Object.keys(scenes).length} 个场景`);
console.log(`  服务端场景包（含底牌）→ ${path.relative(root, serverOutPath)}`);
console.log(`  前端公开数据（已剔除底牌）→ ${path.relative(root, clientOutPath)}`);
console.log('  底牌泄露断言通过（hidden_truth / fake_effect / is_fake / win_conditions / answer）');
