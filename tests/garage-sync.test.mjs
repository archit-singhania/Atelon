import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {buildApp} from '../apps/api/server.js';
import Fastify from 'fastify';
import {registerGarageSync} from '../apps/api/src/garage-sync.js';
const slug='mahindra-thar-4x4';
test('Production Garage sync stays gated until explicitly enabled',async t=>{
 for(const enabled of [undefined,'false','true']){
  const app=Fastify();t.after(()=>app.close());let reads=0;
  app.addHook('preHandler',async request=>{request.user={id:'verified-user'};});
  await registerGarageSync(app,{store:{cloud:{},list:async()=>{reads++;return[];}},vehicles:[],env:{NODE_ENV:'production',GARAGE_SYNC_ENABLED:enabled}});
  const response=await app.inject({url:'/api/v2/garage'});
  assert.equal(response.statusCode,enabled==='true'?200:503);
  assert.equal(reads,enabled==='true'?1:0,'Disabled rollout must not touch migration-dependent storage');
 }
});
test('Disabling Garage sync preserves legacy collection access',async t=>{
 const app=await buildApp({env:{NODE_ENV:'test',GARAGE_SYNC_ENABLED:'false'},logger:false});t.after(()=>app.close());const headers={authorization:'Bearer owner'};
 assert.equal((await app.inject({url:'/api/v2/garage',headers})).statusCode,503);
 assert.equal((await app.inject({method:'POST',url:'/api/v2/collections',headers,payload:{name:'Still available'}})).statusCode,201);
 assert.equal((await app.inject({url:'/api/v2/collections',headers})).json().results.length,1);
});
test('Garage sync is private, revision-aware and retry-idempotent',async t=>{
 const app=await buildApp({env:{NODE_ENV:'test'},logger:false});t.after(()=>app.close());
 const request=(method,url,user,payload)=>app.inject({method,url,headers:user?{authorization:`Bearer ${user}`}:{},payload});
 assert.equal((await request('GET','/api/v2/garage')).statusCode,401);
 const body={operationId:randomUUID(),expectedRevision:0,document:{name:'My Garage',notes:'Original',vehicle_slugs:[slug,slug]}};
 const first=await request('PUT','/api/v2/garage/sync','alice',body);assert.equal(first.statusCode,200);assert.deepEqual(first.json().record.vehicle_slugs,[slug]);assert.equal(first.json().record.visibility,'private');
 const retry=await request('PUT','/api/v2/garage/sync','alice',body);assert.deepEqual(retry.json(),first.json());
 assert.equal((await request('GET','/api/v2/garage','bob')).json().record,null);
 const changed=await request('PUT','/api/v2/garage/sync','alice',{...body,document:{...body.document,notes:'Different'}});assert.equal(changed.statusCode,409);assert.equal(changed.json().kind,'key-reuse');
 const conflict=await request('PUT','/api/v2/garage/sync','alice',{...body,operationId:randomUUID()});assert.equal(conflict.statusCode,409);assert.equal(conflict.json().record.revision,1);
 const updates=await Promise.all(['first','second'].map(notes=>request('PUT','/api/v2/garage/sync','alice',{...body,operationId:randomUUID(),expectedRevision:1,document:{...body.document,notes}})));
 assert.deepEqual(updates.map(r=>r.statusCode).sort(),[200,409]);
 assert.equal((await request('GET','/api/v2/collections','alice')).json().results.length,1);
});
test('Garage rejects unknown vehicles and malformed operations',async t=>{
 const app=await buildApp({env:{NODE_ENV:'test'},logger:false});t.after(()=>app.close());
 for(const document of [{name:'  ',notes:'',vehicle_slugs:[]},{name:'Garage',notes:'',vehicle_slugs:['missing-car']}])assert.equal((await app.inject({method:'PUT',url:'/api/v2/garage/sync',headers:{authorization:'Bearer alice'},payload:{operationId:randomUUID(),expectedRevision:0,document}})).statusCode,400);
});
test('Save both keeps one private cloud backup even after a network retry',async t=>{
 const app=await buildApp({env:{NODE_ENV:'test'},logger:false});t.after(()=>app.close());const headers={authorization:'Bearer owner'};
 const document={name:'Cloud',notes:'Keep this version',vehicle_slugs:[slug]};
 await app.inject({method:'PUT',url:'/api/v2/garage/sync',headers,payload:{operationId:randomUUID(),expectedRevision:0,document}});
 const payload={operationId:randomUUID(),expectedRevision:1,preserveConflict:true,document:{...document,name:'Mine',notes:'My changes'}};
 for(let i=0;i<2;i++)assert.equal((await app.inject({method:'PUT',url:'/api/v2/garage/sync',headers,payload})).statusCode,200);
 const rows=(await app.inject({method:'GET',url:'/api/v2/collections',headers})).json().results;
 assert.equal(rows.length,2);assert.equal(rows.find(r=>!r.system_key).notes,'Keep this version');assert.ok(rows.every(r=>r.visibility==='private'));
});
test('Legacy collection edits invalidate stale Garage revisions',async t=>{
 const app=await buildApp({env:{NODE_ENV:'test'},logger:false});t.after(()=>app.close());const headers={authorization:'Bearer owner'};
 const payload={operationId:randomUUID(),expectedRevision:0,document:{name:'Garage',notes:'',vehicle_slugs:[slug]}};
 const record=(await app.inject({method:'PUT',url:'/api/v2/garage/sync',headers,payload})).json().record;
 assert.equal((await app.inject({method:'PATCH',url:`/api/v2/collections/${record.id}`,headers,payload:{notes:'Edited elsewhere'}})).statusCode,200);
 const result=await app.inject({method:'PUT',url:'/api/v2/garage/sync',headers,payload:{...payload,operationId:randomUUID(),expectedRevision:1}});
 assert.equal(result.statusCode,409);assert.equal(result.json().record.notes,'Edited elsewhere');
});
