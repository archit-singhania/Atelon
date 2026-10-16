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
  browser = await puppeteer.launch({ executablePath, headless: true, userDataDir: profile, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  const failures = [];
  page.on('pageerror', (error) => failures.push(`page error: ${error.message}`));
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  for (const route of ['/', '/garage', '/vehicle/mahindra-thar-4x4', '/compare', '/ask', '/credits', '/design-system']) {
    const response = await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('h1', { timeout: 10000 });
    if (!response?.ok()) failures.push(`${route} returned ${response?.status()}`);
    const state = await page.evaluate(() => ({ title: document.title, heading: document.querySelector('h1')?.textContent, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2, main: Boolean(document.querySelector('main')) }));
    if (!state.title || !state.heading || !state.main || state.overflow) failures.push(`${route} invalid UI state: ${JSON.stringify(state)}`);
  }
  await page.goto('http://127.0.0.1:4173/ask', { waitUntil: 'domcontentloaded' });
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.classList.contains('skip-link'));
  if (!focused) failures.push('Skip link is not the first keyboard target.');
  const manifest = await page.evaluate(async () => (await fetch('/manifest.webmanifest')).json());
  if (manifest.name !== 'Atelon' || manifest.icons.length < 2) failures.push('PWA manifest is incomplete.');
  if (failures.length) throw new Error(failures.join('\n'));
  console.log('Browser smoke checks passed for 7 routes, mobile layout, keyboard entry, and PWA manifest.');
} finally {
  if (browser) await browser.close();
  web.close();
  try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 4, retryDelay: 250 }); } catch { console.warn(`Temporary browser profile retained at ${profile}`); }
}
