/**
 * 海龟汤题库拆分脚本
 *
 * 将 tools/turtle_soup_questions.json（含汤底的完整题库，作为源数据）拆分为：
 *   1. api/turtle-questions.js      —— 服务端专用（含汤底，只在 Serverless Function 中使用，绝不发送到浏览器）
 *   2. src/turtle/data/questions.ts —— 前端公开数据（仅汤面，打包进前端 bundle）
 *
 * 用法：node tools/split-turtle-questions.cjs
 * 题库更新后重新运行本脚本即可。
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const sourcePath = path.join(__dirname, 'turtle_soup_questions.json');
const serverOutPath = path.join(root, 'api', 'turtle-questions.js');
const clientOutPath = path.join(root, 'src', 'turtle', 'data', 'questions.ts');

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const questions = raw.questions;

if (!Array.isArray(questions) || questions.length === 0) {
  console.error('源题库格式不正确：questions 必须是非空数组');
  process.exit(1);
}

// 基础校验：缺字段或难度非法直接报错，避免生成坏数据
const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);
const seenIds = new Set();
for (const q of questions) {
  for (const field of ['id', 'title', 'difficulty', 'surface', 'answer', 'tags']) {
    if (q[field] === undefined || q[field] === '') {
      console.error(`题目 id=${q.id} 缺少字段 ${field}`);
      process.exit(1);
    }
  }
  if (!DIFFICULTIES.has(q.difficulty)) {
    console.error(`题目 id=${q.id} 难度非法：${q.difficulty}`);
    process.exit(1);
  }
  if (seenIds.has(q.id)) {
    console.error(`题目 id 重复：${q.id}`);
    process.exit(1);
  }
  seenIds.add(q.id);
}

const header = `// 本文件由 tools/split-turtle-questions.cjs 自动生成，请勿手工修改。
// 题库更新流程：修改 tools/turtle_soup_questions.json 后重新运行该脚本。
`;

// 1. 服务端完整题库（含汤底）
const serverData = questions.map(q => ({
  id: q.id,
  title: q.title,
  difficulty: q.difficulty,
  surface: q.surface,
  answer: q.answer,
  tags: q.tags,
}));

fs.mkdirSync(path.dirname(serverOutPath), { recursive: true });
fs.writeFileSync(
  serverOutPath,
  `${header}// 包含汤底，仅供 Serverless Function 使用，绝不可被前端引用。\n\nconst questions = ${JSON.stringify(serverData, null, 2)};\n\nexport default questions;\n`,
  'utf8'
);

// 2. 前端公开题库（无汤底）
const clientData = questions.map(q => ({
  id: q.id,
  title: q.title,
  difficulty: q.difficulty,
  surface: q.surface,
  tags: q.tags,
}));

const clientTs = `${header}
export type TurtleDifficulty = 'easy' | 'medium' | 'hard';

export interface TurtleQuestionMeta {
  id: number;
  title: string;
  difficulty: TurtleDifficulty;
  surface: string;
  tags: string[];
}

export const questions: TurtleQuestionMeta[] = ${JSON.stringify(clientData, null, 2)};
`;

fs.mkdirSync(path.dirname(clientOutPath), { recursive: true });
fs.writeFileSync(clientOutPath, clientTs, 'utf8');

console.log(`拆分完成：共 ${questions.length} 题`);
console.log(`  服务端题库（含汤底）→ ${path.relative(root, serverOutPath)}`);
console.log(`  前端题库（仅汤面）  → ${path.relative(root, clientOutPath)}`);
