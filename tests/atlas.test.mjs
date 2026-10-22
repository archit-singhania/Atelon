import test from 'node:test';
import assert from 'node:assert/strict';
import { planShowroomActions } from '../apps/api/src/atlas.js';
import { loadVehicles } from '../apps/api/src/data.js';
import { buildApp } from '../apps/api/server.js';

test('atlas API validates requests and protects cloud-only collaboration',async()=>{
  const app=await buildApp({env:{NODE_ENV:'test'},logger:false});
  try {
    const capabilities=(await app.inject('/api/v4/capabilities')).json();
    assert.deepEqual(capabilities,{vision:false,rooms:false,contributions:false});
    const action=await app.inject({method:'POST',url:'/api/v4/actions',payload:{question:'Show it in profile',contextSlugs:['mahindra-thar-4x4']}});
    assert.equal(action.statusCode,200);assert.equal(action.json().actions[0].view,'side');
    assert.equal((await app.inject({method:'POST',url:'/api/v4/actions',payload:{question:'x',arbitraryAction:'delete'}})).statusCode,400);
    for(const url of ['/api/v4/rooms','/api/v4/contributions']) {
      const response=await app.inject({method:'POST',url,payload:url.endsWith('rooms')?{slug:'mahindra-thar-4x4'}:{vehicle_slug:'mahindra-thar-4x4',kind:'annotation',proposal:{note:'test'},source_url:'https://example.com'}});
      assert.ok([401,503].includes(response.statusCode));
    }
    const invalid=await app.inject({method:'POST',url:'/api/v4/identify',payload:{image:'data:image/png;base64,YWJj'}});
    assert.equal(invalid.statusCode,400);
    const unconfigured=await app.inject({method:'POST',url:'/api/v4/identify',payload:{image:'data:image/png;base64,iVBORw0KGgo='}});
    assert.equal(unconfigured.statusCode,503);assert.match(unconfigured.json().error.message,/No image was sent/);
  } finally {await app.close();}
});
test('showroom actions use stored context and allowlisted views',()=>{const vehicles=loadVehicles();const result=planShowroomActions(vehicles,'Show it in profile',['mahindra-thar-4x4']);assert.equal(result.actions[0].view,'side');assert.equal(result.actions[0].slug,'mahindra-thar-4x4');assert.equal(planShowroomActions(vehicles,'Open an invented model',['invalid']).actions.length,0);});
test('unsupported mapped components disclose their limitation',()=>{const result=planShowroomActions(loadVehicles(),'Show its suspension',['mahindra-thar-4x4']);assert.match(result.notice,/no reviewed component/);assert.equal(result.actions[0].type,'showroom');});
