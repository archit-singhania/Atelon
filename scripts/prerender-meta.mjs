// Post-build: writes apps/web/dist/vehicle/<slug>/index.html for every live vehicle, with its own
// <title>, description, canonical link, Open Graph tags and JSON-LD. The React app still boots normally.
// Usage (runs automatically in the web build): SITE_URL=https://your-domain node scripts/prerender-meta.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'apps', 'web', 'dist');
const vdir = path.join(root, 'data', 'vehicles');
const site = (process.env.SITE_URL || 'https://atelon.vercel.app').replace(/\/$/, '');

const indexPath = path.join(dist, 'index.html');
if (!fs.existsSync(indexPath)) { console.error('dist/index.html not found. Run vite build first.'); process.exit(1); }
const template = fs.readFileSync(indexPath, 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const live = fs.readdirSync(vdir).filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(vdir, f), 'utf8')))
  .filter((v) => v.status === 'live');

for (const v of live) {
  const name = `${v.make} ${v.model}`;
  const title = `${name} - specs and 3D | Atelon`;
  const desc = `${name}: sourced specifications${v.tier !== 'specs-only' ? ' and an interactive 3D model' : ''} on Atelon.`;
  const url = `${site}/vehicle/${v.slug}`;
  const ld = { '@context': 'https://schema.org', '@type': 'Product', name, category: v.type, description: v.summary, brand: { '@type': 'Brand', name: v.make }, url };
  const head = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`
  ].join('\n    ');

  const html = template
    .replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content=".*?" \/>/s, `<meta name="description" content="${esc(desc)}" />`)
    .replace('</head>', `    ${head}\n  </head>`);

  const out = path.join(dist, 'vehicle', v.slug);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), html);
}
console.log(`Prerendered metadata for ${live.length} vehicle page(s).`);
