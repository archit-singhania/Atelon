import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vehicles = fs.readdirSync(path.join(root, 'data', 'vehicles'))
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(fs.readFileSync(path.join(root, 'data', 'vehicles', file), 'utf8')))
  .filter((vehicle) => vehicle.status === 'live' && vehicle.model3d?.glb);
const output = path.join(root, 'apps', 'web', 'public', 'posters');
fs.mkdirSync(output, { recursive: true });

const chrome = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
].find(fs.existsSync);
if (!chrome) throw new Error('Chrome or Edge is required to render posters.');

const server = spawn(process.execPath, [path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'), '--host', '127.0.0.1', '--port', '4176'], {
  cwd: path.join(root, 'apps', 'web'),
  stdio: ['ignore', 'pipe', 'pipe'],
});

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:4176');
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('Timed out waiting for the poster studio.');
}

let browser;
try {
  await waitForServer();
  console.log('Poster studio ready; launching renderer.');
  browser = await puppeteer.launch({ executablePath: chrome, headless: true, timeout: 120000, protocolTimeout: 120000, args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  console.log('Renderer launched.');
  const page = await browser.newPage();
  page.on('console', (message) => console.log(`[browser:${message.type()}] ${message.text()}`));
  page.on('pageerror', (error) => console.error(`[browser:error] ${error.message}`));
  page.setDefaultTimeout(120000);
  page.setDefaultNavigationTimeout(120000);
  for (const vehicle of vehicles) {
    for (const width of [1200, 400]) {
      const height = Math.round(width * 9 / 16);
      await page.setViewport({ width, height, deviceScaleFactor: 1 });
      console.log(`Loading ${vehicle.slug} at ${width}px.`);
      await page.goto(`http://127.0.0.1:4176/poster-studio/${vehicle.slug}`, { waitUntil: 'networkidle0', timeout: 120000 });
      await page.waitForFunction(() => {
        const canvas = document.querySelector('canvas');
        return canvas && Number.parseFloat(getComputedStyle(canvas).opacity) > 0.9;
      }, { timeout: 120000 });
      await new Promise((resolve) => setTimeout(resolve, 700));
      await page.screenshot({ path: path.join(output, `${vehicle.slug}-${width}.webp`), type: 'webp', quality: width === 1200 ? 88 : 82 });
      console.log(`Rendered ${vehicle.slug}-${width}.webp`);
    }
  }
} finally {
  if (browser) await browser.close();
  server.kill();
}
