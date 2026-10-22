import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeShots,safeHttpUrl,mergeNotes,validRoomState,validRoomNote } from '../apps/web/src/lib/atlasState.ts';
import { parseVisionCandidates,readBoundedText } from '../apps/api/src/vision.js';
import { proposalIssue,validReviewTransition } from '../apps/api/src/contribution-policy.js';
import { validateAtlasMetadata } from '../scripts/lib/atlas-validation.mjs';
import { loadVehicles } from '../apps/api/src/data.js';
import { planShowroomActions } from '../apps/api/src/atlas.js';
const vehicles=loadVehicles();const slug=vehicles[0].slug;const slugs=new Set(vehicles.map(vehicle=>vehicle.slug));
const fallback=[{id:'opening',slug,view:'hero',scene:'studio',seconds:3,specKey:'Power'}];

test('storyboards survive wrong shapes, duplicate IDs, unknown vehicles and invalid durations',()=>{
 for(const value of [null,{},false,'text',[],[null,{slug:'invented'}]])assert.deepEqual(normalizeShots(value,slugs,fallback),fallback);
 const value=normalizeShots([{slug,id:'a',seconds:Infinity,view:'bad',scene:'bad'},{slug,id:'a',seconds:500}],slugs,fallback);
 assert.equal(value[0].seconds,3);assert.equal(value[0].view,'hero');assert.equal(value[0].scene,'studio');assert.equal(value[1].seconds,8);assert.notEqual(value[0].id,value[1].id);
});
test('export evidence URLs reject scripts, credentials and malformed input',()=>{
 for(const value of ['javascript:alert(1)','data:text/html,abc','//example.com','https://secret:password@example.com',{},null])assert.equal(safeHttpUrl(value),null);
 assert.equal(safeHttpUrl('https://example.com/brochure'),'https://example.com/brochure');
});
test('room data is validated and concurrent note sets merge deterministically',()=>{
 const note={id:'one',text:'Evidence',created_at:'2026-10-22T12:00:00Z'};
 assert.ok(validRoomNote(note));assert.equal(validRoomNote({...note,text:{}}),false);
 assert.equal(validRoomState({slug:'unknown',view:'hero'},slugs),false);assert.ok(validRoomState({slug,view:'side'},slugs));
 assert.equal(mergeNotes([note],[note,{...note,id:'two'}]).length,2);
});
test('vision output is allowlisted, deduplicated and bounded',async()=>{
 const candidates=[null,{slug:'invented'},{slug,confidence:2,features:['visible shape',42]},{slug,confidence:.5}];
 const raw=JSON.stringify({choices:[{message:{content:JSON.stringify({candidates})}}]});
 assert.deepEqual(parseVisionCandidates(raw,vehicles),[{slug,confidence:1,features:['visible shape']}]);
 assert.throws(()=>parseVisionCandidates('{}',vehicles));
 assert.equal(await readBoundedText(new Response('small'),8),'small');
 let cancelled=false;const response=new Response(new ReadableStream({pull(controller){controller.enqueue(new Uint8Array(100));},cancel(){cancelled=true;}}));
 await assert.rejects(readBoundedText(response,10),/budget/);assert.equal(cancelled,true);
});
test('review transitions protect final decisions and proposals require typed evidence',()=>{
 assert.equal(validReviewTransition('accepted','rejected'),false);assert.equal(validReviewTransition('reviewing','reviewing'),false);assert.ok(validReviewTransition('submitted','accepted'));
 assert.ok(proposalIssue('specification',{key:'Power',value:{}},vehicles));assert.ok(proposalIssue('annotation',{note:'   '},vehicles));assert.ok(proposalIssue('relationship',{targetSlug:slug,kind:'invented',label:'x'},vehicles));
 assert.equal(proposalIssue('specification',{key:'Power',value:0,unit:'kW'},vehicles),null);
});
test('metadata validation rejects null entries, duplicate seats, invalid dates and audio path traversal without crashing',()=>{
 for(const value of [{model3d:{calibration:null}},{model3d:{interior:null}},{model3d:{interior:{seats:[null]}}},{relationships:[null]},{recordings:[null]}])assert.ok(validateAtlasMetadata(value,slugs).length);
 const recording={id:'a',title:'Idle',credit:'Creator',source:'https://example.com',kind:'idle',url:'/../../outside.wav'};
 assert.ok(validateAtlasMetadata({recordings:[recording]},slugs).length);
 const calibration={metersPerUnit:1,rotation:[0,0,0],reviewer:'Reviewer',verifiedAt:'2026-02-30',source:'https://example.com'};assert.ok(validateAtlasMetadata({model3d:{calibration}},slugs).length);
});
test('concierge resolves short specification names to recorded keys',()=>{
 const vehicle=vehicles.find(vehicle=>vehicle.specs.some(spec=>/power/i.test(spec.key)));
 const result=planShowroomActions(vehicles,'Inspect the power',[vehicle.slug]);
 assert.equal(result.actions[0].type,'specification');assert.ok(result.actions[0].source);
});
