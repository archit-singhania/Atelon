export type Appearance = { version: 3; theme: 'system' | 'obsidian' | 'pearl' | 'titanium' | 'midnight'; glass: 'full' | 'reduced'; motion: 'system' | 'reduced' };
export function readAppearance(): Appearance {
  try { const value = JSON.parse(localStorage.getItem('atelon-appearance-v3') || 'null'); if (value?.version === 3) return value; } catch {}
  const old = localStorage.getItem('atelon-theme');
  return { version: 3, theme: old === 'light' ? 'pearl' : old === 'dark' ? 'obsidian' : 'system', glass: 'full', motion: 'system' };
}
export function applyAppearance(value: Appearance) {
  const theme = value.theme === 'system' ? matchMedia('(prefers-color-scheme: light)').matches ? 'pearl' : 'obsidian' : value.theme;
  const root = document.documentElement;
  root.dataset.theme = theme === 'pearl' ? 'light' : 'dark'; root.dataset.palette = theme;
  root.dataset.transparency = value.glass; root.dataset.motion = value.motion;
  root.style.colorScheme = theme === 'pearl' ? 'light' : 'dark';
  localStorage.setItem('atelon-appearance-v3', JSON.stringify(value));
  dispatchEvent(new CustomEvent('atelon-appearance-change', { detail: value }));
}
