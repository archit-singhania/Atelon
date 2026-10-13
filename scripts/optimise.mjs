// One-command GLB optimiser. Needs: npm i -g @gltf-transform/cli
// Usage: node scripts/optimise.mjs            (all of assets/raw/*.glb)
//        node scripts/optimise.mjs my-slug    (one file: assets/raw/my-slug.glb)
// Output: apps/web/public/models/<slug>.glb  (budget: <5 MB, <~150k triangles)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawDir = path.join(root, 'assets', 'raw');
const outDir = path.join(root, 'apps', 'web', 'public', 'models');
fs.mkdirSync(outDir, { recursive: true });

const only = process.argv[2];
const files = fs.readdirSync(rawDir).filter((f) => f.endsWith('.glb') && (!only || f === `${only}.glb`));
if (!files.length) {
  console.log('No .glb files found in assets/raw. Export cleaned models from Blender there first.');
  process.exit(0);
}

for (const f of files) {
  const input = path.join(rawDir, f);
  const output = path.join(outDir, f);
  console.log(`Optimising ${f} ...`);
  const r = spawnSync(
    'gltf-transform',
    ['optimize', input, output, '--compress', 'meshopt', '--texture-compress', 'webp', '--texture-size', '2048'],
    { stdio: 'inherit', shell: true }
  );
  if (r.status !== 0) {
    console.error(`FAILED: ${f}`);
    continue;
  }
  const mb = fs.statSync(output).size / 1048576;
  console.log(`  -> ${mb.toFixed(2)} MB${mb > 5 ? '  OVER 5 MB BUDGET' : ''}`);
}
