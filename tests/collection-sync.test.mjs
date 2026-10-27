import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {buildApp} from '../apps/api/server.js';
test('Named collection sync isolates owners and IDs, detects conflicts and preserves both versions once',async t=>{
 const app=await buildApp({env:{NODE_ENV:'test',COLLECTION_SYNC_ENABLED:'true'},logger:false});t.after(()=>app.close());
 const id=randomUUID(),other=randomUUID();const doc={name:'Weekend',notes:'first',vehicle_slugs:['mahindra-thar-4x4','mahindra-thar-4x4']};
 const send=(target,body,user='alice')=>app.inject({method:'PUT',url:`/api/v2/collections/${target}/sync`,headers:{authorization:`Bearer ${user}`},payload:body});
 const body={operationId:randomUUID(),expectedRevision:0,document:doc};const first=await send(id,body);assert.equal(first.statusCode,200);assert.deepEqual(first.json().record.vehicle_slugs,['mahindra-thar-4x4']);
 assert.deepEqual((await send(id,body)).json(),first.json());assert.equal((await send(other,body)).statusCode,409);
 assert.equal((await send(id,{...body,operationId:randomUUID()},'bob')).statusCode,409);
 const conflicting=await send(id,{...body,operationId:randomUUID()});assert.equal(conflicting.json().kind,'conflict');
 const update={operationId:randomUUID(),expectedRevision:1,document:{...doc,notes:'mine'},preserveConflict:true};
 await send(id,update);await send(id,update);
 const rows=(await app.inject({url:'/api/v2/collections',headers:{authorization:'Bearer alice'}})).json().results;assert.equal(rows.length,2);assert.equal(rows.find(r=>r.id!==id).notes,'first');
 const outsider=await app.inject({url:`/api/v2/collections/${id}/sync`,headers:{authorization:'Bearer bob'}});assert.equal(outsider.json().record,null);
});
