// Application-handler tests with an in-memory query adapter. These do not certify PostgreSQL RLS.
import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { registerPlatform } from '../apps/api/src/platform.js';
import { registerRooms } from '../apps/api/src/rooms.js';
import { registerContributions } from '../apps/api/src/contributions.js';
const roomId='11111111-1111-4111-8111-111111111111';
const contributionId='22222222-2222-4222-8222-222222222222';
function adapter(){
 const tables={research_state:[],catalogue_documents:[],processing_jobs:[],suggestions:[],research_rooms:[{id:roomId,owner_id:'owner',state:{slug:'car',view:'hero'},version:0,invite_hash:'private'}],room_members:[{room_id:roomId,user_id:'owner'},{room_id:roomId,user_id:'follower'}],room_notes:[],contributions:[{id:contributionId,user_id:'author',status:'submitted',proposal:{key:'Power',value:10},source_url:'https://example.com'}]};
 let rpcCalls=0;
 const cloud={from(table){let filters=[];let change=null;let operation='select';let cap=Infinity;let ascending=true;
   const query={select(){return query;},eq(key,value){filters.push(row=>row[key]===value);return query;},order(key,options={}){ascending=options.ascending!==false;return query;},limit(value){cap=value;return query;},update(value){operation='update';change=value;return query;},insert(value){operation='insert';change=value;return query;},delete(){operation='delete';return query;},upsert(value){operation='insert';change=value;return query;},
    async execute(single=false){let rows=tables[table].filter(row=>filters.every(filter=>filter(row)));if(operation==='update')rows.forEach(row=>Object.assign(row,change));if(operation==='delete')tables[table]=tables[table].filter(row=>!rows.includes(row));if(operation==='insert'){const row={id:crypto.randomUUID(),created_at:new Date().toISOString(),...change};tables[table].push(row);rows=[row];}if(!ascending)rows.reverse();rows=rows.slice(0,cap);return {data:single?rows[0]||null:rows,error:null};},maybeSingle(){return query.execute(true);},single(){return query.execute(true);},then(resolve,reject){return query.execute().then(resolve,reject);}};return query;},async rpc(name,input){rpcCalls++;const row=tables.contributions.find(row=>row.id===input.p_id&&row.status===input.p_expected);if(!row)return {data:null,error:null};Object.assign(row,{status:input.p_status,review_note:input.p_note});return {data:row,error:null};}};
 return {tables,cloud,get rpcCalls(){return rpcCalls;}};
}
async function setup(){
 const app=Fastify({ajv:{customOptions:{coerceTypes:false}}});const db=adapter();
 app.addHook('preHandler',async request=>{request.user=request.headers['x-user']?{id:request.headers['x-user']}:null;});
 const store={cloud:db.cloud,isAdmin:request=>request.user?.id==='reviewer'};const vehicles=[{slug:'car'}];
 await registerPlatform(app,{store,vehicles});await registerRooms(app,{store,vehicles});await registerContributions(app,{store,vehicles,env:{REVIEWER_USER_IDS:'reviewer,author'}});return {app,db};
}
test('room handlers enforce membership, presenter writes, optimistic versions and sanitized responses',async()=>{
 const {app}=await setup();try{
  const get=await app.inject({url:`/api/v4/rooms/${roomId}`,headers:{'x-user':'follower'}});assert.equal(get.statusCode,200);assert.equal(get.json().role,'follower');assert.equal(get.json().invite_hash,undefined);
  assert.equal((await app.inject({url:`/api/v4/rooms/${roomId}`,headers:{'x-user':'outsider'}})).statusCode,404);
  const update={method:'PATCH',url:`/api/v4/rooms/${roomId}`,payload:{state:{slug:'car',view:'side'},expectedVersion:0}};
  assert.equal((await app.inject({...update,headers:{'x-user':'follower'}})).statusCode,403);
  assert.equal((await app.inject({...update,headers:{'x-user':'owner'}})).statusCode,200);
  assert.equal((await app.inject({...update,headers:{'x-user':'owner'}})).statusCode,409);
  assert.equal((await app.inject({method:'POST',url:`/api/v4/rooms/${roomId}/notes`,headers:{'x-user':'follower'},payload:{text:'   '}})).statusCode,400);
  assert.equal((await app.inject({method:'DELETE',url:`/api/v4/rooms/${roomId}`,headers:{'x-user':'follower'}})).statusCode,403);
 }finally{await app.close();}
});
test('review handlers reject non-reviewers and self-review before an atomic decision',async()=>{
 const {app,db}=await setup();try{
  assert.equal((await app.inject({url:'/api/v4/contributions?review=1',headers:{'x-user':'outsider'}})).statusCode,403);
  const review={method:'PATCH',url:`/api/v4/contributions/${contributionId}/review`,payload:{expectedStatus:'submitted',status:'accepted',note:'Source and variant checked.'}};
  assert.equal((await app.inject({...review,headers:{'x-user':'author'}})).statusCode,403);assert.equal(db.rpcCalls,0);
  assert.equal((await app.inject({...review,headers:{'x-user':'reviewer'}})).statusCode,200);assert.equal(db.rpcCalls,1);
  assert.equal((await app.inject({...review,headers:{'x-user':'reviewer'}})).statusCode,409);
  const terminal={...review,payload:{...review.payload,expectedStatus:'accepted',status:'rejected'}};assert.equal((await app.inject({...terminal,headers:{'x-user':'reviewer'}})).statusCode,409);
 }finally{await app.close();}
});

test('successful cloud research and admin hooks complete rather than leaving requests pending',async()=>{
 const {app}=await setup();try{
  assert.equal((await app.inject({url:'/api/v3/research',headers:{'x-user':'owner'}})).statusCode,200);
  const admin=await app.inject({url:'/api/v3/admin/catalogue',headers:{'x-user':'reviewer'}});assert.equal(admin.statusCode,200);assert.deepEqual(admin.json(),{results:[],jobs:[]});
  assert.equal((await app.inject({url:'/api/v3/admin/catalogue',headers:{'x-user':'outsider'}})).statusCode,403);
 }finally{await app.close();}
});
