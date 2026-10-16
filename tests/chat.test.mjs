import test from 'node:test';
import assert from 'node:assert/strict';
import { loadVehicles } from '../apps/api/src/data.js';
import { answerQuestion } from '../apps/api/src/chat.js';
import { askChain } from '../apps/api/src/providers.js';

const log = { info() {}, warn() {} };
test('provider chain falls through failures', async () => {
  const result = await askChain([{ name: 'broken', run: async () => { throw new Error('quota'); } }, { name: 'working', run: async () => 'grounded answer' }], [], log);
  assert.equal(result.provider, 'working');
  assert.deepEqual(result.attemptedProviders, ['broken', 'working']);
});

test('ungrounded provider numbers are rejected', async () => {
  const answer = await answerQuestion({ vehicles: loadVehicles(), chain: [{ name: 'unsafe', run: async () => 'It has 99999 horsepower.' }], question: 'Tell me about the Mazda Furai', log, env: { DAILY_CHAT_CAP: '999999' } });
  assert.equal(answer.fallback, true);
  assert.equal(answer.fallbackReason, 'providers-unavailable');
  assert.doesNotMatch(answer.answer, /99999/);
});

test('unknown vehicles never reach a provider', async () => {
  let called = false;
  const answer = await answerQuestion({ vehicles: loadVehicles(), chain: [{ name: 'unused', run: async () => { called = true; return 'x'; } }], question: 'Tell me about a lunar rover', log });
  assert.equal(called, false);
  assert.equal(answer.fallbackReason, 'no-matching-vehicle');
});
