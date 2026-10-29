import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareCollectionImport,importedCollectionId} from '../apps/web/src/lib/collectionImport.ts';
const known=new Set(['car-a','car-b']);
test('Research import preserves notes including removed memberships without altering its source',()=>{
 const input={id:'local-1',name:'Research',slugs:['car-a','car-a'],notes:{'car-a':'First\nSecond','car-b':'Keep removed vehicle note'}};const before=JSON.stringify(input);
 const out=prepareCollectionImport(input,known);assert.deepEqual(out.document.vehicle_slugs,['car-a']);assert.deepEqual(JSON.parse(out.document.notes).vehicleNotes,input.notes);assert.equal(JSON.stringify(input),before);
});
test('Research import rejects malformed, unavailable and oversized data without truncation',()=>{
 const base={id:'1',name:'Research',slugs:['car-a'],notes:{}};
 for(const value of [null,[],{...base,slugs:['missing']},{...base,notes:{'car-a':'x'.repeat(2000)}},{...base,notes:[]},{...base,notes:{missing:'note'}}])assert.throws(()=>prepareCollectionImport(value,known));
});
test('Import identity is stable for retries and isolated by account',async()=>{
 assert.equal(await importedCollectionId('alice','source'),await importedCollectionId('alice','source'));assert.notEqual(await importedCollectionId('alice','source'),await importedCollectionId('bob','source'));
});
