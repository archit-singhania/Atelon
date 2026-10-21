// Post-build static route snapshots for crawlers and direct navigation. React replaces each snapshot on boot.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'apps', 'web', 'dist');
const site = (process.env.SITE_URL || 'https://atelon.vercel.app').replace(/\/$/, '');
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const esc = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const vehicles = fs.readdirSync(path.join(root, 'data', 'vehicles')).filter((file) => file.endsWith('.json')).map((file) => JSON.parse(fs.readFileSync(path.join(root, 'data', 'vehicles', file), 'utf8'))).filter((vehicle) => vehicle.status === 'live');
function render({ route, title, description, body, image = '/brand/atelon-logo-dark.webp', jsonLd }) {
  const url = `${site}${route}`;
  const head = `<link rel="canonical" href="${url}" />\n    <meta property="og:type" content="website" /><meta property="og:site_name" content="Atelon" />\n    <meta property="og:title" content="${esc(title)}" /><meta property="og:description" content="${esc(description)}" />\n    <meta property="og:url" content="${url}" /><meta property="og:image" content="${site}${image}" />\n    <meta name="twitter:card" content="summary_large_image" />${jsonLd ? `\n    <script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : ''}`;
  return template.replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`).replace(/<meta name="description" content=".*?" \/>/s, `<meta name="description" content="${esc(description)}" />`).replace('</head>', `    ${head}\n  </head>`).replace('<div id="root"></div>', `<div id="root"><main class="static-snapshot">${body}</main></div>`);
}
function writeRoute(route, html) { const out = route === '/' ? dist : path.join(dist, route.replace(/^\//, '')); fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(path.join(out, 'index.html'), html); }
const pages = [
  ['/', 'Atelon | Every machine in 3D', 'Explore a sourced vehicle atlas with optimized interactive 3D and grounded AI.', '<h1>Every machine in 3D</h1><p>Explore nine sourced showcase vehicles, compare specifications, and ask questions grounded in the Atelon Garage.</p>'],
  ['/garage', 'Garage | Atelon', 'Browse the Atelon vehicle catalogue.', `<h1>Garage</h1><p>${vehicles.length} showcase vehicles with sourced specifications and interactive 3D.</p><ul>${vehicles.map((v) => `<li><a href="/vehicle/${v.slug}">${esc(v.make)} ${esc(v.model)}</a></li>`).join('')}</ul>`],
  ['/compare', 'Compare vehicles | Atelon', 'Compare sourced vehicle specifications side by side.', '<h1>Compare vehicles</h1><p>Select two Garage vehicles to compare their sourced specifications.</p>'],
  ['/ask', 'Ask Atelon | Vehicle help desk', 'Ask questions grounded in verified Atelon Garage data.', '<h1>Ask Atelon</h1><p>A vehicle help desk grounded only in the sourced records in the Garage.</p>'],
  ['/credits', 'Credits | Atelon', 'Model credits, provenance and source links for Atelon.', '<h1>Credits and provenance</h1><p>Review model attribution and source information for every showcase vehicle.</p>'],
  ['/about', 'About | Atelon', 'About the Atelon 3D vehicle atlas.', '<h1>About Atelon</h1><p>An independent, sourced 3D vehicle atlas.</p>'],
  ['/account', 'My Garage | Atelon', 'Sign in and synchronize your saved Atelon vehicles.', '<h1>My Garage</h1><p>Save vehicles locally and synchronize them securely across devices.</p>'],
  ['/privacy', 'Privacy | Atelon', 'Atelon privacy information.', '<h1>Privacy</h1>'], ['/terms', 'Terms | Atelon', 'Atelon terms of use.', '<h1>Terms</h1>'], ['/suggest', 'Suggest a vehicle | Atelon', 'Suggest a vehicle for the Atelon Garage.', '<h1>Suggest a vehicle</h1>'], ['/design-system', 'Design system | Atelon', 'Atelon component and accessibility states.', '<h1>Atelon design system</h1>']
];
for (const [route, title, description, body] of pages) writeRoute(route, render({ route, title, description, body }));
for (const vehicle of vehicles) {
  const name = `${vehicle.make} ${vehicle.model}`; const route = `/vehicle/${vehicle.slug}`; const description = `${name}: sourced specifications${vehicle.tier !== 'specs-only' ? ' and an interactive 3D model' : ''} on Atelon.`;
  const properties = vehicle.specs.map((spec) => ({ '@type': 'PropertyValue', name: spec.key, value: `${spec.value}${spec.unit ? ` ${spec.unit}` : ''}` }));
  const ld = { '@context': 'https://schema.org', '@type': 'Vehicle', name, vehicleModelDate: vehicle.years[0], vehicleConfiguration: vehicle.generation, description: vehicle.summary, brand: { '@type': 'Brand', name: vehicle.make }, url: `${site}${route}`, additionalProperty: properties };
  const specs = vehicle.specs.map((spec) => `<li><strong>${esc(spec.key)}:</strong> ${esc(spec.value)} ${esc(spec.unit || '')}</li>`).join('');
  const body = `<article><p>${esc(vehicle.generation || '')}</p><h1>${esc(name)}</h1><img src="${vehicle.poster || vehicle.posterSmall}" alt="${esc(name)} showroom view" width="1200" height="675" /><p>${esc(vehicle.summary)}</p><h2>Sourced specifications</h2><ul>${specs}</ul><p><a href="/credits">3D credits and provenance</a></p></article>`;
  writeRoute(route, render({ route, title: `${name} — specs and 3D | Atelon`, description, body, image: vehicle.poster || vehicle.posterSmall, jsonLd: ld }));
}
fs.writeFileSync(path.join(dist, '404.html'), render({ route: '/404', title: 'Page not found | Atelon', description: 'The requested Atelon page was not found.', body: '<h1>Page not found</h1><p><a href="/garage">Return to the Garage</a></p>' }));
console.log(`Prerendered ${pages.length + vehicles.length} crawlable route(s) and a static 404.`);
