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
