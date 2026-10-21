import raw from '../data/vehicles.json';
import type { Vehicle } from '../types';

export const vehicles = raw as unknown as Vehicle[];
export const bySlug = (slug?: string) => vehicles.find((v) => v.slug === slug);

export const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? (import.meta.env.DEV ? 'http://localhost:8787' : '');

export interface ChatReply { answer: string; provider: string; sources: string[]; matchedVehicles: string[]; fallback: boolean; fallbackReason?: string | null; retryable?: boolean; attemptedProviders?: string[] }
export async function ask(question: string): Promise<ChatReply> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
  } catch {
    throw new Error('The help desk could not connect. Check your connection and try again.');
  }
  if (res.status === 429) throw new Error('The help desk has reached its hourly limit. Please try again later.');
  if (res.status >= 500) throw new Error('The help desk is temporarily unavailable. Your Garage and sourced specifications still work.');
  if (!res.ok) throw new Error('That message could not be processed. Please shorten it and try again.');
  return res.json();
}

export type StreamEvent = { type: 'status' | 'answer_delta' | 'citation' | 'matched_vehicle' | 'fallback' | 'done' | 'error'; data: Record<string, unknown> };
export async function askStream(question: string, onEvent: (event: StreamEvent) => void, signal?: AbortSignal, contextVehicles: string[] = []) {
  const response = await fetch(`${API_URL}/api/v2/chat/stream`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, contextVehicles: contextVehicles.slice(0, 4) }), signal });
  if (!response.ok || !response.body) throw new Error(response.status === 429 ? 'The help desk has reached its hourly limit.' : 'The streaming help desk is temporarily unavailable.');
  const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
  let completed=false;
  try { while (true) { const { value, done } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const blocks = buffer.split('\n\n'); buffer = blocks.pop() || ''; for (const block of blocks) { const type = block.match(/^event: (.+)$/m)?.[1] as StreamEvent['type']; const raw = block.match(/^data: (.+)$/m)?.[1]; if (type && raw) { const data=JSON.parse(raw);if(type==='error')throw new Error(data.message || 'The response could not finish.');if(type==='done')completed=true;onEvent({ type, data }); } } } if(!completed)throw new Error('The response was interrupted. Please retry.'); } finally { await reader.cancel().catch(()=>undefined); }
}
