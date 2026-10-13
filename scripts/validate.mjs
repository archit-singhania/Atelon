// Validates vehicle JSON + license ledger. Usage: node scripts/validate.mjs [--strict]
// --strict also fails on drafts and on live vehicles with no specs (Phase 3 exit check).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vdir = path.join(root, 'data', 'vehicles');
const strict = process.argv.includes('--strict');
const TIERS = ['full', 'reference', 'specs-only'];
const TYPES = ['car', 'motorcycle'];
const OK_LICENSES = ['CC0', 'CC BY', 'CC BY 4.0', 'CC BY 3.0'];

const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);

// ledger
const ledgerPath = path.join(root, 'data', 'ledger.csv');
const ledger = {};
if (fs.existsSync(ledgerPath)) {
  const lines = fs.readFileSync(ledgerPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const head = lines.shift().split(',');
  for (const line of lines) {
    const cols = line.split(',');
    const row = Object.fromEntries(head.map((h, i) => [h.trim(), (cols[i] || '').trim()]));
    if (row.vehicle_slug) ledger[row.vehicle_slug] = row;
  }
}

const files = fs.existsSync(vdir) ? fs.readdirSync(vdir).filter((f) => f.endsWith('.json')) : [];
const seen = new Set();

for (const f of files) {
  let v;
  try {
    v = JSON.parse(fs.readFileSync(path.join(vdir, f), 'utf8'));
  } catch (e) {
    err(f, `invalid JSON (${e.message})`);
    continue;
  }
  for (const k of ['slug', 'status', 'make', 'model', 'type', 'years', 'tier', 'summary', 'specs']) {
    if (v[k] === undefined) err(f, `missing field "${k}"`);
  }
  if (v.slug !== f.replace(/\.json$/, '')) err(f, `slug "${v.slug}" must match file name`);
  if (seen.has(v.slug)) err(f, `duplicate slug "${v.slug}"`);
  seen.add(v.slug);
  if (!['draft', 'live'].includes(v.status)) err(f, `unknown status "${v.status}"`);
  if (!TIERS.includes(v.tier)) err(f, `unknown tier "${v.tier}"`);
  if (!TYPES.includes(v.type)) err(f, `unknown type "${v.type}"`);
  if (!Array.isArray(v.years) || v.years.length !== 2) err(f, 'years must be [start, end|null]');

  for (const [i, s] of (v.specs || []).entries()) {
    if (!s.key || s.value === undefined) err(f, `spec #${i} needs key and value`);
    if (!s.source || !/^https?:\/\//.test(s.source)) err(f, `spec "${s.key}" needs a source URL`);
  }

  if (v.tier !== 'specs-only') {
    if (!v.model3d?.glb) err(f, `tier "${v.tier}" needs model3d.glb`);
    else {
      const p = path.join(root, 'apps', 'web', 'public', v.model3d.glb.replace(/^\//, ''));
      if (!fs.existsSync(p)) err(f, `GLB not found: ${v.model3d.glb}`);
    }
    if (!v.model3d?.credit) err(f, 'model3d.credit (attribution line) required');
    const row = ledger[v.slug];
    if (!row) err(f, 'no ledger row for a 3D model');
    else if (!OK_LICENSES.includes(row.license)) err(f, `ledger license "${row.license}" is not accepted (see docs/license-policy.md)`);
  }

  if (strict) {
    if (v.status !== 'live') err(f, 'still a draft (strict mode)');
    if (!v.specs?.length) err(f, 'no specs (strict mode)');
  } else if (v.status === 'draft') warnings.push(`${f}: draft`);
}

console.log(`Checked ${files.length} vehicle file(s).`);
warnings.forEach((w) => console.log('  warn  ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('  FAIL  ' + e));
  process.exit(1);
}
console.log('OK');
