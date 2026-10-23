import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
const root=path.resolve(import.meta.dirname,'..'), dist=path.join(root,'apps/web/dist');
const baseline=path.join(root,'tests/visual/baselines'), actual=path.join(root,'.qa-v3/visual');
const update=process.argv.includes('--update');
const server=http.createServer(async(req,res)=>{try{let file=path.resolve(dist,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(dist+path.sep))throw Error();try{if(!(await fs.stat(file)).isFile())throw Error();}catch{file=path.join(dist,'index.html');}res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(await fs.readFile(file));}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(4185,'127.0.0.1',resolve));let browser;
const cases=[];const failures=[];
try{
 const executablePath=(await Promise.all([process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean).map(async p=>{try{await fs.access(p);return p;}catch{return null;}}))).find(Boolean);
 browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox','--disable-gpu','--disable-lcd-text']});
 await fs.mkdir(baseline,{recursive:true});await fs.mkdir(actual,{recursive:true});
 for(const theme of ['pearl','obsidian','titanium','midnight'])for(const [size,width,height]of [['phone',390,844],['tablet',820,1180],['desktop',1440,1000]])for(const [name,route,anchor]of [['garage','/garage',null],['vehicle','/vehicle/porsche-911-930-turbo-1975',null],['story','/vehicle/plymouth-hemi-cuda-1971','#story']]){
  const page=await browser.newPage();await page.setViewport({width,height,deviceScaleFactor:1});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.evaluateOnNewDocument(theme=>{localStorage.setItem('atelon-appearance-v3',JSON.stringify({version:3,theme,glass:'full',motion:'reduced'}));const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.includes('webgl')?null:original.call(this,type,...args);};},theme);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4185'+route,{waitUntil:'networkidle0'});await page.evaluate(()=>document.fonts.ready);
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}'});
  if(anchor)await page.$eval(anchor,el=>el.scrollIntoView({block:'start'}));
  await page.evaluate(async()=>{await Promise.all(Array.from(document.images).filter(img=>img.getBoundingClientRect().top<innerHeight&&img.getBoundingClientRect().bottom>0).map(img=>Promise.race([img.decode().catch(()=>{}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Visible image did not load')),10000))])));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
  assert.deepEqual(errors,[],`${theme}/${size}/${name} runtime errors`);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${theme}/${size}/${name} horizontal overflow`);
  if(anchor){await page.waitForFunction(()=>Number(document.querySelector('[aria-label="Vehicle story reading progress"]')?.getAttribute('aria-valuenow'))>=0);assert.equal(await page.$eval('.chapter-nav',el=>getComputedStyle(el).position),'sticky');await page.$eval('#related-vehicles',el=>el.scrollIntoView({block:'end'}));await page.waitForFunction(()=>Number(document.querySelector('[aria-label="Vehicle story reading progress"]')?.getAttribute('aria-valuenow'))>=95);await page.$eval(anchor,el=>el.scrollIntoView({block:'start'}));await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
  // Allow the compositor to finish high-resolution rasterization after anchor scrolling.
  await page.evaluate(()=>document.fonts.ready);await new Promise(resolve=>setTimeout(resolve,500));
  const file=`${theme}-${size}-${name}.png`,target=path.join(actual,file);await page.screenshot({path:target});
  if(update)await fs.copyFile(target,path.join(baseline,file));else{try{const a=await sharp(target).ensureAlpha().raw().toBuffer({resolveWithObject:true}),b=await sharp(path.join(baseline,file)).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual(a.info,b.info);let changed=0;for(let i=0;i<a.data.length;i+=4)if(Math.max(...[0,1,2].map(c=>Math.abs(a.data[i+c]-b.data[i+c])))>16)changed++;if(changed/(width*height)>.002)failures.push(`${file}: ${(changed/(width*height)*100).toFixed(3)}% pixels changed`);}catch(error){failures.push(`${file}: ${error.message}`);}}
  cases.push({file,theme,width,height,route,anchor});await page.close();console.log(file);
 }
 if(update)await fs.writeFile(path.join(baseline,'manifest.json'),JSON.stringify({browser:await browser.version(),mode:'poster-only, reduced motion, DPR 1',cases},null,2)+'\n');
 assert.deepEqual(failures,[],'Visual regression failures');console.log(`${cases.length} screenshot cases ${update?'recorded':'passed'}.`);
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
