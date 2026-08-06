/**
 * api/turtle-chat.js 逻辑测试（mock fetch，不需要真实 API Key）
 *
 * 用法：node tools/test-turtle-chat.mjs
 * 覆盖：方法/参数校验、reveal 纯数据返回、ask/guess/hint 三种模式的
 *       Prompt 组装、JSON 解析与纯文本兜底、win/correct 时才返回汤底。
 */

import assert from 'node:assert/strict';

process.env.KIMI_API_KEY = 'test-key';

const { default: handler } = await import('../api/turtle-chat.js');

// ---------- mock req/res ----------
const makeReq = (method, body) => ({ method, body });
const makeRes = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

// ---------- mock fetch：按队列返回预设的模型输出 ----------
let fetchCalls = [];
let modelOutputs = [];
globalThis.fetch = async (url, opts) => {
  fetchCalls.push({ url, payload: JSON.parse(opts.body) });
  const content = modelOutputs.shift() ?? '{"verdict":"yes","reply":"是。"}';
  return {
    ok: true,
    status: 200,
    json: async () => ({ choices: [{ message: { content } }] }),
  };
};

const run = async (method, body) => {
  const res = makeRes();
  await handler(makeReq(method, body), res);
  return res;
};

let passed = 0;

console.log('turtle-chat handler 测试');

// ---- 基础校验 ----
let r = await run('GET', {});
assert.equal(r.statusCode, 405);
passed += 1;
console.log('  ✓ GET → 405');

r = await run('POST', '{bad json');
assert.equal(r.statusCode, 400);
passed += 1;
console.log('  ✓ 非法 JSON body → 400');

r = await run('POST', { mode: 'xxx', questionId: 1 });
assert.equal(r.statusCode, 400);
passed += 1;
console.log('  ✓ 非法 mode → 400');

r = await run('POST', { mode: 'ask', questionId: 9999, input: 'test' });
assert.equal(r.statusCode, 404);
passed += 1;
console.log('  ✓ 不存在的题目 → 404');

r = await run('POST', { mode: 'ask', questionId: 1 });
assert.equal(r.statusCode, 400);
passed += 1;
console.log('  ✓ ask 缺少 input → 400');

// ---- reveal：纯数据返回，不调用 AI ----
fetchCalls = [];
r = await run('POST', { mode: 'reveal', questionId: 1 });
assert.equal(r.statusCode, 200);
assert.ok(r.body.answer.includes('海龟肉'), 'reveal 应返回汤底');
assert.equal(fetchCalls.length, 0, 'reveal 不应调用 AI');
passed += 1;
console.log('  ✓ reveal 直接返回汤底且不调用 AI');

// ---- ask：JSON 正常解析 ----
fetchCalls = [];
modelOutputs = ['{"verdict":"no","reply":"否。"}'];
r = await run('POST', {
  mode: 'ask',
  questionId: 1,
  input: '汤里有毒吗？',
  history: [{ question: '死的是船长吗？', reply: '是。' }],
});
assert.equal(r.statusCode, 200);
assert.deepEqual(r.body, { verdict: 'no', reply: '否。' });
assert.equal(r.body.answer, undefined, '未猜中不应返回汤底');
passed += 1;
console.log('  ✓ ask 正常 JSON → verdict 解析正确，不带汤底');

// 组装的 Prompt 检查
const askCall = fetchCalls[0];
const sysMsg = askCall.payload.messages[0];
assert.equal(sysMsg.role, 'system');
assert.ok(sysMsg.content.includes('海龟肉熬制'), 'system prompt 应包含汤面');
assert.ok(sysMsg.content.includes('已故船员的肉'), 'system prompt 应包含汤底');
assert.equal(askCall.payload.messages.at(-1).content, '汤里有毒吗？');
assert.equal(askCall.payload.messages[1].content, '死的是船长吗？', '历史应拼入 messages');
assert.equal(askCall.payload.reasoning_effort, 'low', 'k3 应带 reasoning_effort');
assert.ok(askCall.payload.max_completion_tokens > 150, 'k3 应使用 max_completion_tokens 并留思考余量');
passed += 1;
console.log('  ✓ ask 的 system prompt 含汤面+汤底，历史与 k3 参数正确');

// ---- ask：纯文本兜底 + win 检测 ----
modelOutputs = ['是，你猜对了！'];
r = await run('POST', { mode: 'ask', questionId: 1, input: '是不是当年船员用人肉骗他说是海龟肉？' });
assert.equal(r.body.verdict, 'win');
assert.ok(r.body.answer, 'win 时应返回汤底');
passed += 1;
console.log('  ✓ ask 纯文本兜底 → 推断 win 并返回汤底');

// ---- guess：correct 判定 ----
modelOutputs = ['{"correct":true,"reply":"你猜对了！关键因果链完全正确。"}'];
r = await run('POST', { mode: 'guess', questionId: 2, input: '他以为眼睛又瞎了所以自杀' });
assert.equal(r.body.correct, true);
assert.ok(r.body.answer.includes('隧道'), 'guess 命中应返回汤底');
passed += 1;
console.log('  ✓ guess JSON → correct=true 并带汤底');

modelOutputs = ['不完全对，注意他经过隧道时的处境，继续推理。'];
r = await run('POST', { mode: 'guess', questionId: 2, input: '他是被仇人推下火车的' });
assert.equal(r.body.correct, false);
assert.equal(r.body.answer, undefined, 'guess 未命中不带汤底');
passed += 1;
console.log('  ✓ guess 纯文本兜底 → correct=false');

// guess 的 system prompt 应为裁判模式
modelOutputs = ['{"correct":false,"reply":"不对。"}'];
fetchCalls = [];
await run('POST', { mode: 'guess', questionId: 1, input: '随便猜猜' });
assert.ok(fetchCalls[0].payload.messages[0].content.includes('裁判'));
passed += 1;
console.log('  ✓ guess 使用裁判 prompt');

// ---- hint ----
modelOutputs = ['你可以关注一下汤的来源。'];
r = await run('POST', { mode: 'hint', questionId: 1, history: [], hintCount: 1 });
assert.equal(r.statusCode, 200);
assert.equal(r.body.reply, '你可以关注一下汤的来源。');
assert.equal(r.body.answer, undefined);
passed += 1;
console.log('  ✓ hint 返回纯文本提示，不带汤底');

// ---- history 超限截断 ----
fetchCalls = [];
modelOutputs = ['{"verdict":"irrelevant","reply":"这与真相无关。"}'];
const longHistory = Array.from({ length: 60 }, (_, i) => ({ question: `问题${i}`, reply: '否。' }));
await run('POST', { mode: 'ask', questionId: 1, input: 'test', history: longHistory });
const sentMessages = fetchCalls[0].payload.messages;
// system(1) + 40 条历史×2 + 当前问题(1)
assert.equal(sentMessages.length, 82, '历史应截断到 40 条');
assert.equal(sentMessages[1].content, '问题20', '应保留最近的历史');
passed += 1;
console.log('  ✓ history 超过 40 条时服务端截断');

// ---- 缺少 API Key ----
delete process.env.KIMI_API_KEY;
// 重新 import 以拿到没有 key 的模块状态 —— 模块级常量已缓存，需用 query 绕过缓存
const { default: handlerNoKey } = await import('../api/turtle-chat.js?nokey=1');
const resNoKey = makeRes();
await handlerNoKey(makeReq('POST', { mode: 'ask', questionId: 1, input: 'x' }), resNoKey);
assert.equal(resNoKey.statusCode, 500);
passed += 1;
console.log('  ✓ 缺少 KIMI_API_KEY 时 AI 模式返回 500');

// reveal 无 key 也应可用（纯数据）
const resReveal = makeRes();
await handlerNoKey(makeReq('POST', { mode: 'reveal', questionId: 1 }), resReveal);
assert.equal(resReveal.statusCode, 200);
passed += 1;
console.log('  ✓ 无 key 时 reveal 仍可用');

console.log(`\n全部通过：${passed} 项`);
