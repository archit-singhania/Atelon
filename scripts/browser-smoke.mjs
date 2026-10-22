import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import puppeteer from 'puppeteer-core';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'apps', 'web', 'dist');
const contentType = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.webp': 'image/webp', '.png': 'image/png', '.glb': 'model/gltf-binary' };
const web = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const localPath = pathname.replace(/^\/+/, '');
  const candidates = [path.join(dist, localPath), path.join(dist, localPath, 'index.html'), path.join(dist, 'index.html')];
  const file = candidates.find((candidate) => { try { return fs.statSync(candidate).isFile(); } catch { return false; } });
  response.setHeader('Content-Type', contentType[path.extname(file || '')] || 'application/octet-stream');
  fs.createReadStream(file).pipe(response);
});
await new Promise((resolve) => web.listen(4173, '127.0.0.1', resolve));
const candidates = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
let browser;
const profile = fs.mkdtempSync(path.join(root, '.browser-smoke-'));
try {
  const executablePath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!executablePath) throw new Error('Chrome/Edge not found; set CHROME_PATH.');
  browser = await puppeteer.launch({ executablePath, headless: true, userDataDir: profile, args: process.env.ATELON_QA_WEBGL === '1' ? ['--no-sandbox', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--disable-dev-shm-usage'] : ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  const failures = [];
  page.on('pageerror', (error) => failures.push(`page error: ${error.message}`));
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  for (const route of ['/', '/garage', '/vehicle/mahindra-thar-4x4', '/compare', '/ask', '/account', '/research', '/credits', '/design-system']) {
    const response = await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 10000 });
    if (!response?.ok()) failures.push(`${route} returned ${response?.status()}`);
    const state = await page.evaluate(() => ({ title: document.title, heading: document.querySelector('h1')?.textContent, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2, main: Boolean(document.querySelector('main')) }));
    if (!state.title || !state.heading || !state.main || state.overflow) failures.push(`${route} invalid UI state: ${JSON.stringify(state)}`);
  }
  await page.goto('http://127.0.0.1:4173/ask', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { document.body.tabIndex = -1; document.body.focus(); });
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.classList.contains('skip-link'));
  if (!focused) failures.push('Skip link is not the first keyboard target.');
  await page.keyboard.down('Control'); await page.keyboard.press('KeyK'); await page.keyboard.up('Control');
  if (!await page.evaluate(() => Boolean(document.querySelector('[role="dialog"][aria-label="Navigate Atelon"]')))) failures.push('Command palette did not open from the keyboard shortcut.');
  const manifest = await page.evaluate(async () => (await fetch('/manifest.webmanifest')).json());
  if (manifest.name !== 'Atelon' || manifest.icons.length < 2) failures.push('PWA manifest is incomplete.');
  await page.keyboard.press('Escape');
  await page.click('button[aria-label="Appearance settings"]');
  await page.waitForSelector('dialog[open]');
  await page.evaluate(() => [...document.querySelectorAll('.theme-swatch')].find(button => button.textContent === 'midnight')?.click());
  if (await page.evaluate(() => document.documentElement.dataset.palette) !== 'midnight') failures.push('Midnight theme did not apply.');
  await page.select('dialog select', 'reduced');
  await page.click('button[aria-label="Close appearance settings"]');
  await page.goto('http://127.0.0.1:4173/research', { waitUntil: 'domcontentloaded' });
  await page.type('input[aria-label="Collection name"]', 'Browser QA collection');
  await page.focus('input[aria-label="Collection name"]');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.body.textContent.includes('Browser QA collection'), { timeout: 5000 }).catch(async () => failures.push(`Collection creation failed: ${JSON.stringify(await page.evaluate(() => ({ value: document.querySelector('input[aria-label="Collection name"]')?.value, saved: localStorage.getItem('atelon-collections-v3') })))}`));
  await page.evaluate(() => [...document.querySelectorAll('button')].find(button => button.textContent === 'Download posters & facts')?.click());
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('atelon-offline-packs-v3') || '[]').length > 0, { timeout: 10000 });
  await page.setOfflineMode(true);
  const offlineFacts = await page.evaluate(async () => { const slug=JSON.parse(localStorage.getItem('atelon-offline-packs-v3'))[0]; const cache=await caches.open(`atelon-pack-${slug}`); const record=await (await cache.match(`/offline-data/${slug}`)).json(); return Boolean(record.downloadedAt && record.specs.length && await cache.match(record.posterSmall)); });
  if(!offlineFacts)failures.push('Offline pack does not contain dated facts and a poster.');
  await page.setOfflineMode(false);
  await page.goto('http://127.0.0.1:4173/compare?a=mahindra-thar-4x4&b=mazda-furai&units=imperial', { waitUntil: 'domcontentloaded' });
  if (!await page.evaluate(() => [...document.querySelectorAll('.compare-matrix strong')].some(element => /lb|hp|mph/.test(element.textContent)))) failures.push('Imperial unit conversion not rendered.');
  const qaDir = path.join(root, '.qa-v3'); fs.mkdirSync(qaDir, { recursive: true });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(qaDir, 'mobile-midnight.png'), fullPage: false });
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.screenshot({ path: path.join(qaDir, 'desktop-midnight.png'), fullPage: false });
  await page.click('button[aria-label="Appearance settings"]');
  await page.evaluate(() => [...document.querySelectorAll('.theme-swatch')].find(button => button.textContent === 'pearl')?.click());
  await page.click('button[aria-label="Close appearance settings"]');
  await page.screenshot({ path: path.join(qaDir, 'desktop-pearl.png'), fullPage: false });
  if (process.env.ATELON_QA_WEBGL === '1') {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
    await page.goto('http://127.0.0.1:4173/vehicle/mahindra-thar-4x4?scene=studio', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => { document.querySelector('.vehicle-showroom .model-consent button')?.click(); const canvas = document.querySelector('.vehicle-showroom canvas'); if (!canvas || document.querySelector('.vehicle-showroom .model-loading')) return false; let element = canvas; while (element && !element.classList.contains('vehicle-showroom')) { if (Number.parseFloat(getComputedStyle(element).opacity) < .95) return false; element = element.parentElement; } return true; }, { timeout: 90000 }).catch(async error => { console.error('Showroom load state:', await page.evaluate(() => ({ loading: document.querySelector('.vehicle-showroom .model-loading')?.textContent, fallback: document.querySelector('.vehicle-showroom .placeholder')?.textContent, resources: performance.getEntriesByType('resource').filter(row => row.name.includes('.glb')).map(row => ({ name: row.name, duration: row.duration })) }))); throw error; });
    await page.$eval('.vehicle-showroom', element => element.scrollIntoView({ block: 'center' }));
    await page.screenshot({ path: path.join(qaDir, 'showroom-gallery.png'), fullPage: false });
  }
  if (failures.length) throw new Error(failures.join('\n'));
  console.log('Browser smoke checks passed for 9 routes, appearance persistence, collection creation, imperial conversion, mobile layout, keyboard entry, and PWA manifest. Screenshots saved to .qa-v3.');
} finally {
  if (browser) await browser.close();
  web.close();
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 4, retryDelay: 250 }); } catch { console.warn(`Temporary browser profile retained at ${profile}`); }
}
