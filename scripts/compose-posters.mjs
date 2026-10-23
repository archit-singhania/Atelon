import fs from 'node:fs/promises';
import path from 'node:path';
import { renderAssetPosters } from './render-asset-posters.mjs';
const root=path.resolve(import.meta.dirname,'..');
const compositions=JSON.parse(await fs.readFile(path.join(root,'data/poster-compositions.json'),'utf8'));
const catalogue=JSON.parse(await fs.readFile(path.join(root,'apps/web/src/data/vehicles.json'),'utf8'));
const rendered=[];
for(const vehicle of catalogue){if(!vehicle.model3d)continue;console.log(`Composing ${vehicle.slug}`);const files=await renderAssetPosters(path.join(root,'apps/web/public',vehicle.model3d.glb),path.join(root,'assets/processed/poster-review',vehicle.slug),compositions[vehicle.slug]);for(let i=0;i<files.length;i++){if((await fs.stat(files[i])).size>250*1024)throw new Error(`${vehicle.slug} poster exceeds 250 KiB`);rendered.push({source:files[i],target:path.join(root,'apps/web/public/posters',`${vehicle.slug}-${i===0?1200:400}.webp`)});}}
if(process.argv.includes('--publish')){for(const item of rendered)await fs.copyFile(item.source,item.target);console.log(`Published ${rendered.length} posters.`);}else console.log('Candidates ready in assets/processed/poster-review; inspect before running with --publish.');
