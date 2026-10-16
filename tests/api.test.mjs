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
