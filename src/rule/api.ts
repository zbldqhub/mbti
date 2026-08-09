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
