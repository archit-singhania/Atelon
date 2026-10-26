import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeMessages} from '../apps/web/src/lib/chatState.ts';
test('chat restoration tolerates invalid JSON shapes and partial replies',()=>{
 for(const value of [null,{},'bad',42])assert.deepEqual(normalizeMessages(value),[]);
 const messages=normalizeMessages([null,{role:'assistant',text:'Saved',reply:{}},{role:'user',text:'Question',id:2},{role:'system',text:'invalid'}]);
 assert.equal(messages.length,2);assert.deepEqual(messages[0].reply.sources,[]);assert.notEqual(messages[0].id,messages[1].id);
});
test('restored chats bound history and reject executable citation links',()=>{
 const value={role:'assistant',text:'text',reply:{sources:['javascript:alert(1)','https://example.com/spec','https://user:pass@example.com'],matchedVehicles:['valid-car','../../bad']}};
 const rows=normalizeMessages(Array(60).fill(value));assert.equal(rows.length,40);assert.equal(new Set(rows.map(r=>r.id)).size,40);assert.deepEqual(rows[0].reply.sources,['https://example.com/spec']);assert.deepEqual(rows[0].reply.matchedVehicles,['valid-car']);
});
