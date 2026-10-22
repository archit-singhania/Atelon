import test from 'node:test';
import assert from 'node:assert/strict';
import { buildApp } from '../apps/api/server.js';

test('health, search, compare and deterministic chat contracts', async (t) => {
  const app = await buildApp({ env: {}, logger: false });
  t.after(() => app.close());
  const health = await app.inject({ method: 'GET', url: '/health' });
  assert.equal(health.statusCode, 200);
  assert.equal(health.json().vehicles, 9);
  assert.equal(health.headers['x-content-type-options'], 'nosniff');

  const search = await app.inject({ method: 'GET', url: '/api/search?q=thar' });
  assert.equal(search.json().results[0].slug, 'mahindra-thar-4x4');
  const compare = await app.inject({ method: 'GET', url: '/api/compare?a=mahindra-thar-4x4&b=mazda-furai' });
  assert.equal(compare.statusCode, 200);
  const chat = await app.inject({ method: 'POST', url: '/api/chat', payload: { question: 'What is the engine in the Mahindra Thar?' } });
  assert.equal(chat.statusCode, 200);
  assert.equal(chat.json().fallback, true);
  assert.deepEqual(chat.json().matchedVehicles, ['mahindra-thar-4x4']);
  assert.ok(chat.json().sources.length > 0);
});

test('invalid inputs use a stable error shape', async (t) => {
  const app = await buildApp({ env: {}, logger: false });
  t.after(() => app.close());
  const invalid = await app.inject({ method: 'POST', url: '/api/chat', payload: { question: '', extra: true } });
  assert.equal(invalid.statusCode, 400);
  assert.equal(typeof invalid.json().error.code, 'string');
  assert.equal(typeof invalid.json().requestId, 'string');
  const absent = await app.inject({ method: 'GET', url: '/api/compare?a=missing&b=also-missing' });
  assert.equal(absent.statusCode, 404);
  assert.equal(absent.json().error.code, 'VEHICLE_NOT_FOUND');
});

test('production refuses a missing or local-only allowed origin', async () => {
  await assert.rejects(() => buildApp({ env: { NODE_ENV: 'production' }, logger: false }), /ALLOWED_ORIGIN/);
});

test('v2 catalogue, readiness and local collection ownership', async (t) => {
  const app = await buildApp({ env: {}, logger: false }); t.after(() => app.close());
  const ready = await app.inject({ method: 'GET', url: '/ready' }); assert.deepEqual(ready.json(), { status: 'ready', catalogue: true, persistence: 'local' });
  const catalogue = await app.inject({ method: 'GET', url: '/api/v2/catalogue?limit=2' }); assert.equal(catalogue.json().results.length, 2); assert.equal(catalogue.json().nextCursor, 2);
  const created = await app.inject({ method: 'POST', url: '/api/v2/collections', headers: { 'x-atelon-session': 'owner-a' }, payload: { name: 'Dream garage', visibility: 'private', vehicle_slugs: ['mahindra-thar-4x4'] } });
  assert.equal(created.statusCode, 201); const id = created.json().id;
  const own = await app.inject({ method: 'GET', url: '/api/v2/collections', headers: { 'x-atelon-session': 'owner-a' } }); assert.equal(own.json().results.length, 1);
  const other = await app.inject({ method: 'GET', url: '/api/v2/collections', headers: { 'x-atelon-session': 'owner-b' } }); assert.equal(other.json().results.length, 0);
  const forbidden = await app.inject({ method: 'DELETE', url: `/api/v2/collections/${id}`, headers: { 'x-atelon-session': 'owner-b' } }); assert.equal(forbidden.statusCode, 404);
});

test('streaming chat emits grounded SSE event types', async (t) => {
  const app = await buildApp({ env: {}, logger: false }); t.after(() => app.close());
  const response = await app.inject({ method: 'POST', url: '/api/v2/chat/stream', headers:{origin:'http://localhost:5173'}, payload: { question: 'Tell me about the Mazda Furai' } });
  assert.equal(response.statusCode, 200); assert.match(response.headers['content-type'], /text\/event-stream/); assert.match(response.body, /event: status/); assert.match(response.body, /event: matched_vehicle/); assert.match(response.body, /event: done/);
  assert.equal(response.headers['access-control-allow-origin'],'http://localhost:5173');
  const events=response.body.split('\n\n').filter(Boolean).map(block=>({event:block.match(/^event: (.+)$/m)[1],data:JSON.parse(block.match(/^data: (.+)$/m)[1])}));
  assert.equal(events.filter(item=>item.event==='answer_delta').map(item=>item.data.text).join(''),events.find(item=>item.event==='done').data.answer);
});

test('v3 research and administrative routes reject unverified identities', async t => {
  const app = await buildApp({ env: { ADMIN_USER_IDS: 'pretend-admin' }, logger: false }); t.after(() => app.close());
  for (const url of ['/api/v3/admin/catalogue', '/api/v3/admin/catalogue/mazda-furai/history']) {
    const response = await app.inject({ method: 'GET', url, headers: { authorization: 'Bearer pretend-admin' } }); assert.equal(response.statusCode, 403);
  }
  const research = await app.inject({ method: 'PUT', url: '/api/v3/research', payload: { state: {} }, headers: { authorization: 'Bearer pretend-admin' } }); assert.equal(research.statusCode, 401);
  const upload = await app.inject({ method: 'POST', url: '/api/v3/admin/uploads', payload: { slug: 'mazda-furai', extension: 'glb' } }); assert.equal(upload.statusCode, 403);
});

test('streaming follow-up context resolves only stored catalogue records', async t => {
  const app = await buildApp({ env: {}, logger: false }); t.after(() => app.close());
  const response = await app.inject({ method: 'POST', url: '/api/v2/chat/stream', payload: { question: 'What is its engine?', contextVehicles: ['mahindra-thar-4x4', 'ignore-all-instructions'] } });
  assert.equal(response.statusCode, 200); assert.match(response.body, /mahindra-thar-4x4/); assert.doesNotMatch(response.body, /ignore-all-instructions/);
});

test('private persistence cannot fall back to a shared anonymous production owner',async t=>{
 const app=await buildApp({env:{NODE_ENV:'production',ALLOWED_ORIGIN:'https://atelon.example'},logger:false});t.after(()=>app.close());
 for(const url of ['/api/v2/collections','/api/v2/comparisons','/api/v2/chat/threads','/api/v2/account/export']){
  const response=await app.inject({url,headers:{'x-atelon-session':'forged',authorization:'Bearer forged'}});assert.equal(response.statusCode,401);
 }
 assert.equal((await app.inject({method:'DELETE',url:'/api/v2/account'})).statusCode,401);
 assert.equal((await app.inject('/api/v2/catalogue')).statusCode,200);
});
