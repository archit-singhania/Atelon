import test from 'node:test';
import assert from 'node:assert/strict';
import { engineeringFact } from '../apps/web/src/lib/facts.ts';
import { validCamera } from '../apps/web/src/lib/camera.ts';
import { buildApp } from '../apps/api/server.js';
import { measurementIssue } from '../shared/measurement.js';
test('reviewed measurements require canonical units, valid dates and meaningful provenance',()=>{
 const m={kind:'power',value:331,unit:'kW',qualifier:'Manufacturer rating',reviewer:'Editor',verifiedAt:'2026-10-22'};
 assert.equal(measurementIssue(m),null);assert.ok(measurementIssue({...m,unit:'hp'}));assert.ok(measurementIssue({...m,verifiedAt:'2026-02-30'}));assert.ok(measurementIssue({...m,uncertainty:-1}));
 assert.equal(engineeringFact([{key:'Output',value:'331 kW',source:'https://example.com',measurement:m}],'power').value,331);
});
test('normalized evidence keeps original qualifiers and refuses conflicting numeric records',()=>{
 const spec={key:'Peak power (manufacturer)',value:'450 PS at 6500 rpm',source:'https://example.com/spec'};
 const fact=engineeringFact([spec],'power');assert.equal(fact.unit,'kW');assert.equal(fact.value,330.97);assert.equal(fact.records[0].value,spec.value);
 assert.equal(engineeringFact([spec,{...spec,value:'500 PS'}],'power').value,null);
 assert.equal(engineeringFact([{...spec,value:'Not known'}],'power'),null);
});
test('shared cameras reject invalid or oversized transforms',()=>{
 assert.equal(validCamera({position:[1,2,3],target:[0,0,0]}),true);
 for(const value of [null,{}, {position:[NaN,0,0],target:[0,0,0]},{position:[1e12,0,0],target:[0,0,0]},{position:[0,0],target:[0,0,0]}])assert.equal(validCamera(value),false);
});
test('operational diagnostics reject personal payloads and protect administrator reports',async()=>{
 const app=await buildApp({env:{NODE_ENV:'test'},logger:false});
 try{assert.equal((await app.inject({method:'POST',url:'/api/telemetry',payload:{kind:'model_failure'}})).statusCode,204);
 assert.equal((await app.inject({method:'POST',url:'/api/telemetry',payload:{kind:'ui_error',prompt:'private'}})).statusCode,400);
 assert.equal((await app.inject({url:'/api/v3/admin/operations'})).statusCode,403);
 }finally{await app.close();}
});
