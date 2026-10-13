// Phase 10 licence re-audit helper. Usage: npm run audit:licenses
// Lists ledger rows to re-open (older than 90 days), and checks credits match the ledger.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lines = fs.readFileSync(path.join(root, 'data', 'ledger.csv'), 'utf8').split(/\r?\n/).filter(Boolean);
const head = lines.shift().split(',');
const rows = lines.map((l) => { const c = l.split(','); return Object.fromEntries(head.map((h, i) => [h.trim(), (c[i] || '').trim()])); });

let problems = 0;
const now = Date.now();
for (const r of rows) {
  const age = r.date_checked ? (now - Date.parse(r.date_checked)) / 86400000 : Infinity;
  if (!(age <= 90)) { console.log(`RE-CHECK  ${r.vehicle_slug}: last checked ${r.date_checked || 'never'}  ${r.source_url}`); problems++; }

  const vf = path.join(root, 'data', 'vehicles', `${r.vehicle_slug}.json`);
  if (!fs.existsSync(vf)) { console.log(`MISSING   ${r.vehicle_slug}: no vehicle file`); problems++; continue; }
  const v = JSON.parse(fs.readFileSync(vf, 'utf8'));
  if (r.license.startsWith('CC BY') && r.attribution_line && v.model3d?.credit !== r.attribution_line) {
    console.log(`CREDIT    ${r.vehicle_slug}: vehicle credit differs from ledger attribution_line`); problems++;
  }
}
console.log(problems ? `${problems} issue(s).` : `All ${rows.length} ledger row(s) OK.`);
process.exit(problems ? 1 : 0);
