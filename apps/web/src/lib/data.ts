import raw from '../data/vehicles.json';
import type { Vehicle } from '../types';

export const vehicles = raw as unknown as Vehicle[];
export const bySlug = (slug?: string) => vehicles.find((v) => v.slug === slug);

export const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8787';

export async function ask(question: string): Promise<{ answer: string; provider: string; sources: string[] }> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  if (res.status === 429) throw new Error('Too many questions for now. Please try again later.');
  if (!res.ok) throw new Error('The assistant is unavailable right now.');
  return res.json();
}
