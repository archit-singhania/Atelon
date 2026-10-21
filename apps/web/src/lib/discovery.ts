import type { Vehicle } from '../types';
export function interpretDiscovery(query: string) {
  const text = query.toLowerCase().trim(); const chips: string[] = []; let sort = ''; let classic = false; let type = '';
  if (/\b(lightweight|lightest|lowest weight)\b/.test(text)) { sort = 'weight'; chips.push('Lowest recorded weight first'); }
  if (/\b(powerful|highest power)\b/.test(text)) { sort = 'power'; chips.push('Highest recorded power first'); }
  if (/\b(classic|classics|vintage)\b/.test(text)) { classic = true; chips.push('Production began before 1990'); }
  if (/\b(bikes|motorcycles)\b/.test(text)) { type = 'motorcycle'; chips.push('Motorcycles'); }
  else if (/\b(cars)\b/.test(text)) { type = 'car'; chips.push('Cars'); }
  const remaining = chips.length ? text.replace(/\b(show|me|find|the|most|in|this|catalogue|please|all|lightweight|lightest|lowest weight|powerful|fastest|highest power|classic|classics|vintage|bikes|motorcycles|cars|and)\b/g, '').replace(/\s+/g, ' ').trim() : text;
  return { sort, classic, type, chips, remaining };
}
export function comparableNumber(vehicle: Vehicle, needle: string) { const spec = vehicle.specs.find(spec => spec.key.toLowerCase().includes(needle)); if (!spec || typeof spec.value !== 'number') return null; const unit = spec.unit?.toLowerCase(); if (needle === 'power') return spec.value * (unit === 'hp' || unit === 'bhp' ? .745699872 : unit === 'ps' ? .73549875 : 1); return spec.value * (unit === 'lb' || unit === 'lbs' ? .45359237 : 1); }
