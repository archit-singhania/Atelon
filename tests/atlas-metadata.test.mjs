import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAtlasMetadata} from '../scripts/lib/atlas-validation.mjs';
test('optional Atlas asset gates reject unreviewed scale and cabins',()=>{
 assert.deepEqual(validateAtlasMetadata({},new Set()),[]);
 assert.equal(validateAtlasMetadata({model3d:{calibration:{metersPerUnit:-1},interior:{seats:[]}}},new Set()).length,2);
 const calibration={metersPerUnit:1,rotation:[0,0,0],source:'https://example.com',reviewer:'Reviewer',verifiedAt:'2026-10-22'};
 assert.deepEqual(validateAtlasMetadata({model3d:{calibration}},new Set()),[]);
});
test('relationships and sound metadata cannot activate with unknown targets or uncredited URLs',()=>{
 assert.equal(validateAtlasMetadata({relationships:[{targetSlug:'invented'}],recordings:[{url:'https://example.com/a.mp3'}]},new Set()).length,2);
});
