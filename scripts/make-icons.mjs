// Generates web, PWA and mobile brand assets from the approved 4K masters.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const darkSrc = path.join(root, 'assets', 'logo', 'atelon-logo-dark-4k.png');
const lightSrc = path.join(root, 'assets', 'logo', 'atelon-logo-light-4k.png');
const out = path.join(root, 'apps', 'web', 'public', 'icons');
const brandOut = path.join(root, 'apps', 'web', 'public', 'brand');
if (!fs.existsSync(darkSrc) || !fs.existsSync(lightSrc)) { console.error('Approved Atelon 4K logo masters are missing from assets/logo.'); process.exit(1); }
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(brandOut, { recursive: true });

const mark = { left: 1600, top: 300, width: 640, height: 640 };
const wordmark = { left: 1080, top: 1000, width: 1750, height: 360 };
for (const size of [192, 512]) {
  await sharp(darkSrc).extract(mark).resize(size, size).png().toFile(path.join(out, `icon-${size}.png`));
  console.log(`icon-${size}.png`);
}
await sharp(lightSrc).extract(mark).resize(180, 180).png().toFile(path.join(out, 'apple-touch-icon.png'));
await sharp(darkSrc).extract(mark).resize(64, 64).png().toFile(path.join(out, 'favicon-64.png'));
await sharp(darkSrc).extract(mark).resize(512, 512).png().toFile(path.join(root, 'apps', 'web', 'public', 'logo.png'));
for (const theme of ['light', 'dark']) {
  fs.copyFileSync(path.join(root, 'assets', 'logo', `atelon-logo-${theme}.svg`), path.join(brandOut, `atelon-logo-${theme}.svg`));
  await sharp(path.join(root, 'assets', 'logo', `atelon-logo-${theme}-transparent-4k.png`)).resize({ width: 1600 }).webp({ quality: 88 }).toFile(path.join(brandOut, `atelon-logo-${theme}.webp`));
  await sharp(path.join(root, 'assets', 'logo', `atelon-logo-${theme}-transparent-4k.png`)).extract(wordmark).resize({ width: 360 }).webp({ quality: 92 }).toFile(path.join(brandOut, `atelon-wordmark-${theme}.webp`));
}
console.log('apple-touch-icon.png, favicon-64.png, logo.png and themed lockups');

const androidRes = path.join(root, 'apps', 'web', 'android', 'app', 'src', 'main', 'res');
if (fs.existsSync(androidRes)) {
  const densities = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  for (const [density, size] of Object.entries(densities)) {
    const dir = path.join(androidRes, `mipmap-${density}`);
    fs.mkdirSync(dir, { recursive: true });
    const icon = await sharp(darkSrc).extract(mark).resize(size, size).png().toBuffer();
    for (const name of ['ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png']) fs.writeFileSync(path.join(dir, name), icon);
  }
  const splashFiles = fs.readdirSync(androidRes, { recursive: true }).filter((name) => String(name).endsWith('splash.png'));
  for (const relative of splashFiles) {
    const destination = path.join(androidRes, String(relative));
    const metadata = await sharp(destination).metadata();
    const width = metadata.width || 480, height = metadata.height || 800;
    const logo = await sharp(path.join(root, 'assets', 'logo', 'atelon-logo-dark-transparent-4k.png')).resize({ width: Math.round(width * .62) }).png().toBuffer();
    await sharp({ create: { width, height, channels: 4, background: '#07090d' } }).composite([{ input: logo, gravity: 'center' }]).png().toFile(destination + '.tmp.png');
    fs.renameSync(destination + '.tmp.png', destination);
  }
  console.log('Android launcher icons and splash screens');
}
