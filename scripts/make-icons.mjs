// Makes PWA/Android icons from Atelon_logo.png. Usage: npm run icons  (after npm install)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'Atelon_logo.png');
const out = path.join(root, 'apps', 'web', 'public', 'icons');
if (!fs.existsSync(src)) { console.error('Atelon_logo.png not found in repo root.'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });

const bg = { r: 7, g: 9, b: 13, alpha: 1 }; // --bg, so transparent logos look right
for (const size of [192, 512]) {
  await sharp(src).resize(size, size, { fit: 'contain', background: bg }).flatten({ background: bg }).png().toFile(path.join(out, `icon-${size}.png`));
  console.log(`icon-${size}.png`);
}
await sharp(src).resize(180, 180, { fit: 'contain', background: bg }).flatten({ background: bg }).png().toFile(path.join(out, 'apple-touch-icon.png'));
await sharp(src).resize(512, 512, { fit: 'contain' }).png().toFile(path.join(root, 'apps', 'web', 'public', 'logo.png'));
console.log('apple-touch-icon.png, logo.png');
