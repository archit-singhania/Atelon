import test from 'node:test';
import assert from 'node:assert/strict';
import {readQueueValue} from '../apps/web/src/lib/garageQueue.ts';
test('Garage queue ignores other accounts and malformed saved values',()=>{
 const blank=readQueueValue(null,'alice');assert.equal(blank.sequence,0);
 assert.deepEqual(readQueueValue({version:1,owner:'bob',pending:{}},'alice'),blank);
 const corrupt=readQueueValue({version:1,owner:'alice',base:{},pending:{},sequence:-2},'alice');assert.deepEqual(corrupt,blank);
});
