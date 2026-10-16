import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const file = path.resolve(process.argv[2] || 'apps/web/android/app/build/outputs/apk/release/atelon-release.apk');
if (!fs.existsSync(file)) { console.error(`APK not found: ${file}`); process.exit(1); }
console.log(`${createHash('sha256').update(fs.readFileSync(file)).digest('hex')}  ${path.basename(file)}`);
