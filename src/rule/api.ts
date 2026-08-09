/**
 * 规则怪谈前端 API 服务层
 *
 * 请求发往 /api/rule-engine（Vercel Serverless Function）。
 * 前端只提交 sceneId + 玩家输入 + 公开状态；场景底牌由服务端保管，
 * 胜负由服务端权威判定。
 */

import type { EngineRequestState, EngineResponse, SceneId } from './types';

const API_URL = '/api/rule-engine';

export async function judgeAction(
  sceneId: SceneId,
  input: string,
  state: EngineRequestState,
): Promise<EngineResponse> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sceneId, input, state }),
  });
  if (!response.ok) {
    throw new Error(`Rule engine request failed: ${response.status}`);
  }
  return (await response.json()) as EngineResponse;
}

/**
 * 开局建议：POST start 模式（服务端不调 AI，直接返回初始建议）。
 * 失败（网络异常 / 非 200 / 响应不含有效建议）时返回 null，由引擎静默降级为通用建议。
 */
export async function fetchStartSuggestions(sceneId: SceneId): Promise<string[] | null> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sceneId, mode: 'start' }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { suggestions?: unknown };
    if (!Array.isArray(data.suggestions)) return null;
    const suggestions = data.suggestions.filter((x): x is string => typeof x === 'string' && !!x);
    return suggestions.length > 0 ? suggestions : null;
  } catch {
    return null;
  }
}
