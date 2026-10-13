// Scaffolds a draft vehicle record.
// Usage: npm run new-vehicle -- "Royal Enfield" "Classic 350" motorcycle 2021
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const [make, model, type, startYear] = process.argv.slice(2);
if (!make || !model || !['car', 'motorcycle'].includes(type) || !startYear) {
  console.error('Usage: npm run new-vehicle -- "<make>" "<model>" <car|motorcycle> <startYear>');
  process.exit(1);
}
const slug = `${make}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const file = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'data', 'vehicles', `${slug}.json`);
if (fs.existsSync(file)) { console.error(`${slug}.json already exists.`); process.exit(1); }

const specKeys = type === 'car'
  ? ['engine', 'power', 'torque', 'transmission', 'drivetrain', '0-100 km/h', 'top speed', 'length', 'width', 'height', 'wheelbase', 'weight', 'fuel']
  : ['engine', 'displacement', 'power', 'torque', 'gearbox', 'weight', 'seat height', 'tank size', 'ABS'];

const record = {
  slug, status: 'draft', make, model, type,
  years: [Number(startYear), null],
  tier: 'specs-only',
  summary: 'DRAFT: write 2-3 sentences in your own words.',
  specs: [],
  _todoSpecKeys: specKeys // delete this line once you have filled the specs you can verify
};
fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');
console.log(`Created data/vehicles/${slug}.json. Fill specs (two-source rule), set status to "live", then run npm run validate.`);
