// Merges data/vehicles/*.json into apps/web/src/data/vehicles.json (no database needed).
// Usage: node scripts/build-data.mjs [--live]   (--live drops drafts; use for production builds)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vdir = path.join(root, 'data', 'vehicles');
const outDir = path.join(root, 'apps', 'web', 'src', 'data');
const live = process.argv.includes('--live') || !!process.env.VERCEL;

const all = fs
  .readdirSync(vdir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(vdir, f), 'utf8')));
const vehicles = all
  .filter((v) => !live || v.status === 'live')
  .sort((a, b) => (a.make + a.model).localeCompare(b.make + b.model));

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'vehicles.json'), JSON.stringify(vehicles));
console.log(`Wrote ${vehicles.length} vehicle(s)${live ? ' (live only)' : ' (drafts included)'}.`);
