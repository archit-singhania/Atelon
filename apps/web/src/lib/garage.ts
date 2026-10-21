const key = 'atelon-my-garage-v2';
export const readGarage = (): string[] => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
export const toggleGarage = (slug: string) => { const current = readGarage(); const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]; localStorage.setItem(key, JSON.stringify(next)); dispatchEvent(new CustomEvent('atelon-garage-change', { detail: next })); return next; };
