// Generates apps/web/public/sitemap.xml and robots.txt from live vehicles.
// Usage: SITE_URL=https://your-domain node scripts/gen-sitemap.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = (process.env.SITE_URL || 'https://atelon.vercel.app').replace(/\/$/, '');
const vdir = path.join(root, 'data', 'vehicles');
const pub = path.join(root, 'apps', 'web', 'public');

const live = fs
  .readdirSync(vdir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(vdir, f), 'utf8')))
  .filter((v) => v.status === 'live');

const pages = ['', '/garage', '/compare', '/ask', '/credits', '/about', '/privacy', '/terms', '/suggest', ...live.map((v) => `/vehicle/${v.slug}`)];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${site}${p}</loc></url>`).join('\n')}\n</urlset>\n`;

fs.mkdirSync(pub, { recursive: true });
fs.writeFileSync(path.join(pub, 'sitemap.xml'), xml);
fs.writeFileSync(path.join(pub, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);
console.log(`Sitemap: ${pages.length} URLs for ${site}`);
