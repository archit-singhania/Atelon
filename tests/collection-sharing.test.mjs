import test from 'node:test';
import assert from 'node:assert/strict';
import {buildApp} from '../apps/api/server.js';
test('Shared collection snapshots exclude notes by default, rotate, revoke and enforce ownership',async t=>{
 const app=await buildApp({env:{NODE_ENV:'test',COLLECTION_SHARING_ENABLED:'true'},logger:false});t.after(()=>app.close());
 const call=(method,url,payload,user='alice')=>app.inject({method,url,payload,headers:user?{authorization:`Bearer ${user}`}:{}});
 const c=(await call('POST','/api/v2/collections',{name:'Private title',notes:'private notes',vehicle_slugs:['mahindra-thar-4x4']})).json();
 assert.equal((await call('POST',`/api/v2/collections/${c.id}/share`,{expectedRevision:1},'bob')).statusCode,404);
 const first=(await call('POST',`/api/v2/collections/${c.id}/share`,{expectedRevision:1})).json();
 const read=await call('GET',`/api/v2/shared/collections/${first.token}`,undefined,null);assert.equal(read.statusCode,200);assert.equal(read.json().collection.notes,undefined);assert.equal(read.json().collection.user_id,undefined);
 await call('PATCH',`/api/v2/collections/${c.id}`,{name:'New name'});
 assert.equal((await call('GET',`/api/v2/shared/collections/${first.token}`)).json().collection.name,'Private title');
 assert.equal((await call('POST',`/api/v2/collections/${c.id}/share`,{expectedRevision:1})).statusCode,409);
 const second=(await call('POST',`/api/v2/collections/${c.id}/share`,{expectedRevision:2,includeNotes:true})).json();
 assert.equal((await call('GET',`/api/v2/shared/collections/${first.token}`)).statusCode,404);
 await call('DELETE',`/api/v2/collections/${c.id}/share`,undefined,'bob');assert.equal((await call('GET',`/api/v2/shared/collections/${second.token}`)).json().collection.notes,'private notes');
 await call('DELETE',`/api/v2/collections/${c.id}/share`);assert.equal((await call('GET',`/api/v2/shared/collections/${second.token}`)).statusCode,404);
 const third=(await call('POST',`/api/v2/collections/${c.id}/share`,{expectedRevision:2})).json();await call('DELETE',`/api/v2/collections/${c.id}`);assert.equal((await call('GET',`/api/v2/shared/collections/${third.token}`)).statusCode,404);
});
