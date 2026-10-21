import fs from 'node:fs'; import path from 'node:path'; import { gzipSync } from 'node:zlib';
const root = path.resolve(import.meta.dirname, '..'); const dist = path.join(root, 'apps', 'web', 'dist'); const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8'); const failures = [];
const initial = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => match[1]);
const gzip = (file) => gzipSync(fs.readFileSync(path.join(dist, file.replace(/^\//, '')))).length;
const initialBytes = initial.reduce((sum, file) => sum + gzip(file), 0); if (initialBytes > 250 * 1024) failures.push(`initial JavaScript ${(initialBytes / 1024).toFixed(1)} KiB gzip exceeds 250 KiB`);
for (const file of fs.readdirSync(path.join(dist, 'assets')).filter((name) => name.endsWith('.css'))) { const bytes = gzip(`/assets/${file}`); if (bytes > 45 * 1024) failures.push(`${file} ${(bytes / 1024).toFixed(1)} KiB gzip exceeds 45 KiB`); }
if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log(`Performance budgets passed: initial JavaScript ${(initialBytes / 1024).toFixed(1)} KiB gzip.`);
