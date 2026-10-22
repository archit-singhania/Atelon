export type Appearance = { version: 3; theme: 'system' | 'obsidian' | 'pearl' | 'titanium' | 'midnight'; glass: 'full' | 'reduced'; motion: 'system' | 'reduced' };
export function readAppearance(): Appearance {
  try { const value = JSON.parse(localStorage.getItem('atelon-appearance-v3') || 'null'); if (value?.version === 3 && ['system','obsidian','pearl','titanium','midnight'].includes(value.theme) && ['full','reduced'].includes(value.glass) && ['system','reduced'].includes(value.motion)) return value; } catch {}
  let old:string|null=null;try{old=localStorage.getItem('atelon-theme');}catch{/* Browsing still works when persistence is blocked. */}
  return { version: 3, theme: old === 'light' ? 'pearl' : old === 'dark' ? 'obsidian' : 'system', glass: 'full', motion: 'system' };
}
export function applyAppearance(value: Appearance) {
  const theme = value.theme === 'system' ? matchMedia('(prefers-color-scheme: light)').matches ? 'pearl' : 'obsidian' : value.theme;
  const root = document.documentElement;
  root.dataset.theme = theme === 'pearl' ? 'light' : 'dark'; root.dataset.palette = theme;
  root.dataset.transparency = value.glass; root.dataset.motion = value.motion;
  root.style.colorScheme = theme === 'pearl' ? 'light' : 'dark';
  try{localStorage.setItem('atelon-appearance-v3', JSON.stringify(value));}catch{dispatchEvent(new CustomEvent('atelon-storage-error'));}
  dispatchEvent(new CustomEvent('atelon-appearance-change', { detail: value }));
}
