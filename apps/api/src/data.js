import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'data', 'vehicles');

export function loadVehicles() {
  const includeDrafts = process.env.INCLUDE_DRAFTS === '1';
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
    .filter((v) => includeDrafts || v.status === 'live');
}

const tokens = (s) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
const normalized = (s) => tokens(s).join(' ');

export function scoreVehicle(v, queryTokens) {
  const hay = new Set(tokens(`${v.make} ${v.model} ${v.generation || ''} ${v.slug}`));
  let score = 0;
  for (const t of queryTokens) if (hay.has(t)) score += 1;
  return score;
}

export function search(vehicles, q, limit = 10) {
  const qt = tokens(q);
  if (!qt.length) return [];
  return vehicles
    .map((v) => ({ v, s: scoreVehicle(v, qt) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.v);
}

export function findForQuestion(vehicles, question, limit = 3) {
  const phrase = normalized(question);
  const explicit = vehicles.filter((v) => {
    const fullName = normalized(`${v.make} ${v.model}`);
    const model = normalized(v.model);
    return phrase.includes(fullName) || (model.split(' ').length >= 2 && phrase.includes(model));
  });
  if (explicit.length) return explicit.slice(0, limit);
  const qt = tokens(question);
  return vehicles
    .map((v) => ({ v, s: scoreVehicle(v, qt) }))
    .filter((x) => x.s >= 2) // need make+model style match, not one generic word
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.v);
}
