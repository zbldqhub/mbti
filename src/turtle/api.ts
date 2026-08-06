/**
 * 海龟汤前端 API 服务层
 *
 * 所有请求发往 /api/turtle-chat（Vercel Serverless Function）。
 * 前端只发送题目 id 与玩家输入；汤底由服务端保管，
 * 仅在猜中（AskResponse/GuessResponse.answer）或放弃（revealAnswer）时返回。
 */

import type { Verdict } from './types';

const API_URL = '/api/turtle-chat';

export interface HistoryItem {
  question: string;
  reply: string;
}

export interface AskResponse {
  verdict: Verdict;
  reply: string;
  answer?: string;
}

export interface GuessResponse {
  correct: boolean;
  reply: string;
  answer?: string;
}

const post = async <T>(payload: Record<string, unknown>): Promise<T> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Turtle API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
};

export const askHost = (questionId: number, history: HistoryItem[], input: string) =>
  post<AskResponse>({ questionId, mode: 'ask', history, input });

export const judgeGuess = (questionId: number, history: HistoryItem[], input: string) =>
  post<GuessResponse>({ questionId, mode: 'guess', history, input });

export const requestHint = (questionId: number, history: HistoryItem[], hintCount: number) =>
  post<{ reply: string }>({ questionId, mode: 'hint', history, hintCount });

export const revealAnswer = (questionId: number) =>
  post<{ answer: string }>({ questionId, mode: 'reveal' });
