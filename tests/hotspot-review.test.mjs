import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAtlasMetadata} from '../scripts/lib/atlas-validation.mjs';
const fixture=()=>({slug:'sample',specs:[{key:'Length',value:4000,source:'https://example.com/spec'}],model3d:{optimizedHash:'abc',hotspots:[{id:'length',label:'Overall length',position:[0,1,0],specKey:'Length',review:{reviewer:'Fixture reviewer',verifiedAt:'2026-10-23',source:'https://example.com/spec',modelHash:'abc',notes:'Envelope anchor, not a hidden engine component.'}}]}});
test('reviewed sourced hotspot passes',()=>assert.deepEqual(validateAtlasMetadata(fixture(),new Set()),[]));
test('unreviewed, stale, unsourced and invalid anchors cannot publish',()=>{for(const mutate of [v=>delete v.model3d.hotspots[0].review,v=>v.model3d.hotspots[0].review.modelHash='old',v=>v.model3d.hotspots[0].review.source='https://example.com/other',v=>v.model3d.hotspots[0].position=[NaN,0,0],v=>v.model3d.hotspots.push(v.model3d.hotspots[0])]){const v=fixture();mutate(v);assert.ok(validateAtlasMetadata(v,new Set()).some(e=>e.includes('hotspots')));}});
