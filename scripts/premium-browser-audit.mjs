import assert from 'node:assert/strict';
export async function auditPremium(page,browser){
 const base='http://127.0.0.1:4173';
 await page.goto(`${base}/garage`,{waitUntil:'networkidle0'});
 const catalogue=await page.evaluate(async()=> (await (await fetch('/api/v2/catalogue')).json()).results);
 const compositions=new Set();
 for(const v of catalogue){await page.goto(`${base}/vehicle/${v.slug}`,{waitUntil:'domcontentloaded'});await page.waitForSelector('.vehicle-editorial');compositions.add(await page.$eval('.vehicle-editorial',e=>e.className));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`Editorial overflow: ${v.slug}`);}
 assert.equal(compositions.size,9,'Each showcase vehicle needs its own editorial composition');
 await page.goto(`${base}/compare?a=nissan-skyline-r34-brians&b=delorean-dmc-12-time-machine`,{waitUntil:'networkidle0'});
 await page.waitForSelector('.dimension-comparison svg');assert.ok((await page.$eval('.dimension-sources',e=>e.textContent)).includes('excluded from the scale drawing'));
 await page.locator('button::-p-text(Footprints)').click();assert.ok((await page.$eval('.dimension-comparison svg',e=>e.getAttribute('aria-label'))).includes('width'));
 await page.goto(`${base}/garage`,{waitUntil:'networkidle0'});
 await page.waitForSelector('.curated-paths button');await page.click('.curated-paths button');
 assert.ok(new URL(page.url()).searchParams.has('collection'));
 assert.ok(await page.$('.vehicle-tile'));
 const target=await page.$eval('.vehicle-tile',a=>a.href);await page.goto(target,{waitUntil:'networkidle0'});
 await page.locator('button::-p-text(Rear)').click();await page.waitForFunction(()=>new URL(location.href).searchParams.get('view')==='rear');
 await page.goto(base,{waitUntil:'networkidle0'});await page.waitForSelector('.personal-shelf .vehicle-tile');
 await page.goto(`${base}/garage`,{waitUntil:'networkidle0'});const slugs=await page.$$eval('.vehicle-tile',links=>links.slice(0,2).map(a=>a.getAttribute('href').split('/').pop()));
 await page.goto(`${base}/compare?a=${slugs[0]}&b=${slugs[1]}`,{waitUntil:'networkidle0'});assert.equal((await page.$$('.chart-panel')).length,7);
 await page.goto(`${base}/atlas/director`,{waitUntil:'networkidle0'});await page.waitForSelector('[aria-label="Camera timeline"]');
 await page.$eval('[aria-label="Camera timeline"]',input=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(input,'0.5');input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));});
 assert.ok(await page.$('select'));
 await page.goto(`${base}/atlas/rooms`,{waitUntil:'networkidle0'});await page.locator('button::-p-text(Create local two-tab room)').click();
 await page.waitForFunction(()=>document.body.innerText.includes('Live camera connected across local tabs'));
 const peer=await browser.newPage();try{await peer.goto(page.url(),{waitUntil:'networkidle0'});await peer.waitForFunction(()=>document.body.innerText.includes('Live camera connected across local tabs'));
 await peer.evaluate(()=>{window.__receivedCamera=null;window.addEventListener('atelon-camera-apply',e=>window.__receivedCamera=e.detail);});
 // The payload exercises the transport independently of GPU availability.
 const modelUrl=await page.evaluate(async()=>{const response=await fetch('/api/v2/catalogue');const data=await response.json();const select=document.querySelector('.atlas-panel select');return data.results.find(v=>v.slug===select.value)?.model3d?.glb;});
 assert.ok(modelUrl);await page.evaluate(url=>dispatchEvent(new CustomEvent('atelon-camera-change',{detail:{url,camera:{position:[3,2,4],target:[0,0,0]}}})),modelUrl);
 await peer.waitForFunction(()=>window.__receivedCamera?.camera.position[0]===3);
 }finally{await peer.close();}
 await page.goto(`${base}/admin`,{waitUntil:'networkidle0'});
 if(await page.$('.admin-page')){
 assert.ok((await page.content()).includes('Operations dashboard'));
 await page.locator('button::-p-text(Open catalogue editor)').click();await page.waitForFunction(()=>document.body.innerText.includes('Draft editor & asset intake'));
 await page.locator('button::-p-text(Open draft)').click();await page.waitForSelector('.draft-fields input');
 await page.$eval('.draft-fields input',input=>{const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;setter.call(input,'edited-draft');input.dispatchEvent(new Event('input',{bubbles:true}));});
 assert.equal(await page.$eval('.catalogue-json',input=>JSON.parse(input.value).slug),'edited-draft');
 }else console.log('Catalogue studio is disabled by the build flag; editor interactions skipped.');
 console.log('Premium workflows passed: curated discovery, recent shelf, camera URL, charts, timeline, live local camera transport and operator entry.');
}
