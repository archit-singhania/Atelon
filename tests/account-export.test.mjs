import test from 'node:test';
import assert from 'node:assert/strict';
import {exportCloudAccount} from '../apps/api/src/account-export.js';
import {buildApp} from '../apps/api/server.js';

test('Account exports paginate every owned table and never select invitation secrets',async()=>{
 const seen=[];const cloud={from(table){const query={table};return{select(fields){query.fields=fields;return this;},eq(column,id){query.column=column;query.id=id;return this;},order(column){query.order=column;return this;},async range(start){seen.push({...query,start});return{data:start===0?[{id:'first'}]:start===1?[{id:'second'}]:[],error:null};}};}};
 const data=await exportCloudAccount(cloud,{id:'owner'});
 assert.equal(data.profiles.length,2);assert.equal(data.recent_views.length,2);assert.equal(data.collections.length,2);
 assert.ok(seen.every(q=>q.id==='owner'&&!q.fields.includes('*')&&!q.fields.includes('invite_hash')&&!q.fields.includes('share_token')));
 assert.deepEqual(seen.filter(q=>q.table==='threads').map(q=>q.start),[0,1,2],'Server page caps must not silently truncate exports');
 assert.equal(seen.find(q=>q.table==='research_rooms').column,'owner_id');
 assert.equal(seen.find(q=>q.table==='profiles').column,'id');
});
test('Account export rejects missing identity and database failures instead of returning partial data',async()=>{
 await assert.rejects(exportCloudAccount({},null),{statusCode:401});
 const chain={select(){return this;},eq(){return this;},order(){return this;},range:async()=>({error:{message:'private database detail'}})};
 await assert.rejects(exportCloudAccount({from:()=>chain},{id:'owner'}),error=>error.statusCode===503&&!error.message.includes('private database detail'));
});
test('Local export includes only the requesting owner suggestions',async t=>{
 const app=await buildApp({env:{NODE_ENV:'test'},logger:false});t.after(()=>app.close());
 for(const user of ['alice','bob'])await app.inject({method:'POST',url:'/api/v2/suggestions',headers:{authorization:`Bearer ${user}`},payload:{vehicle:`${user} vehicle`}});
 const result=await app.inject({url:'/api/v2/account/export',headers:{authorization:'Bearer alice'}});
 assert.equal(result.statusCode,200);assert.deepEqual(result.json().data.suggestions.map(row=>row.vehicle),['alice vehicle']);
});
