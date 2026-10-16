import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'apps', 'web', 'dist');
const failures = [];
const requireFile = (file) => { if (!fs.existsSync(path.join(dist, file))) failures.push(`missing dist/${file}`); };
if (!fs.existsSync(dist)) failures.push('apps/web/dist does not exist; run npm run build');
else {
  for (const file of ['index.html', '404.html', 'garage/index.html', 'ask/index.html', 'manifest.webmanifest', 'sw.js']) requireFile(file);
  const assets = fs.existsSync(path.join(dist, 'assets')) ? fs.readdirSync(path.join(dist, 'assets')).filter((file) => /\.(js|css)$/.test(file)) : [];
  const compiled = assets.map((file) => fs.readFileSync(path.join(dist, 'assets', file), 'utf8')).join('\n');
  if (/TODO|REPLACE_ME|your-domain/i.test(compiled)) failures.push('compiled assets contain a release placeholder');
  if (/http:\/\/localhost:8787/.test(compiled)) failures.push('compiled assets contain the local API URL');
  for (const file of fs.readdirSync(path.join(root, 'data', 'vehicles')).filter((file) => file.endsWith('.json'))) {
    const vehicle = JSON.parse(fs.readFileSync(path.join(root, 'data', 'vehicles', file), 'utf8'));
    if (vehicle.status === 'live') requireFile(`vehicle/${vehicle.slug}/index.html`);
  }
}
if (process.env.NODE_ENV === 'production') {
  if (!process.env.SITE_URL || !/^https:\/\//.test(process.env.SITE_URL)) failures.push('SITE_URL must be an https URL');
  if (!process.env.VITE_API_URL || !/^https:\/\//.test(process.env.VITE_API_URL)) failures.push('VITE_API_URL must be an https URL');
}
if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log('Release artifact checks passed.');
