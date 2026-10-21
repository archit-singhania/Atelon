export interface Collection { id: string; name: string; slugs: string[]; notes: Record<string, string>; updatedAt: string }
export interface Bookmark { id: string; title: string; text: string; source?: string; url: string }
export function readLocal<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; } }
export function saveLocal(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); dispatchEvent(new CustomEvent('atelon-research-change')); }
export function bookmark(item: Omit<Bookmark, 'id'>) { const list = readLocal<Bookmark[]>('atelon-bookmarks-v3', []); if (!list.some(row => row.url === item.url && row.title === item.title)) saveLocal('atelon-bookmarks-v3', [...list, { ...item, id: crypto.randomUUID() }]); }
export function downloadText(name: string, text: string, type = 'text/plain') { const url = URL.createObjectURL(new Blob([text], { type })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
