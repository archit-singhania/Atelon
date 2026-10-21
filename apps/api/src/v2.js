import { MAX_INPUT, answerQuestion } from './chat.js';

const collectionBody = { type: 'object', required: ['name'], properties: { name: { type: 'string', minLength: 1, maxLength: 80 }, visibility: { enum: ['private', 'unlisted', 'public'] }, vehicle_slugs: { type: 'array', maxItems: 200, items: { type: 'string', maxLength: 100 } }, notes: { type: 'string', maxLength: 2000 } }, additionalProperties: false };
export async function registerV2(app, { vehicles, chain, store, env }) {
  app.addHook('preHandler', async (request) => { request.user = await store.userFromRequest(request); });
  app.get('/api/v2/me', async (request) => ({ user: request.user ? { id: request.user.id, email: request.user.email ?? null } : null, persistence: store.mode }));
  app.get('/api/v2/catalogue', { schema: { querystring: { type: 'object', properties: { cursor: { type: 'string', pattern: '^\\d+$' }, limit: { type: 'string', pattern: '^([1-9]|[1-4]\\d|50)$' } }, additionalProperties: false } } }, async (request) => { const cursor = Number(request.query.cursor || 0); const limit = Number(request.query.limit || 20); return { results: vehicles.slice(cursor, cursor + limit), nextCursor: cursor + limit < vehicles.length ? cursor + limit : null }; });
  for (const [path, table, body] of [['collections', 'collections', collectionBody], ['comparisons', 'comparisons', { type: 'object', required: ['vehicle_slugs'], properties: { name: { type: 'string', maxLength: 80 }, vehicle_slugs: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'string' } }, unit_preference: { enum: ['source', 'metric'] } }, additionalProperties: false }], ['chat/threads', 'threads', { type: 'object', properties: { title: { type: 'string', maxLength: 120 }, messages: { type: 'array', maxItems: 60 } }, additionalProperties: false }]]) {
    app.get(`/api/v2/${path}`, async (request) => ({ results: await store.list(table, request) }));
    app.post(`/api/v2/${path}`, { schema: { body } }, async (request, reply) => reply.code(201).send(await store.create(table, request, request.body)));
    app.patch(`/api/v2/${path}/:id`, { schema: { body: { ...body, required: [] } } }, async (request, reply) => { const row = await store.update(table, request, request.params.id, request.body); return row || reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Record not found.' }, requestId: request.id }); });
    app.delete(`/api/v2/${path}/:id`, async (request, reply) => (await store.remove(table, request, request.params.id)) ? reply.code(204).send() : reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Record not found.' }, requestId: request.id }));
  }
  app.post('/api/v2/suggestions', { schema: { body: { type: 'object', required: ['vehicle'], properties: { vehicle: { type: 'string', minLength: 2, maxLength: 160 }, reason: { type: 'string', maxLength: 1000 }, source_url: { type: 'string', maxLength: 500 } }, additionalProperties: false } } }, async (request, reply) => reply.code(201).send(await store.suggest(request, request.body)));
  app.get('/api/v2/account/export', async (request) => ({ exportedAt: new Date().toISOString(), data: await store.exportUser(request) }));
  app.delete('/api/v2/account', async (request, reply) => { for (const table of ['collections', 'comparisons', 'threads']) for (const row of await store.list(table, request)) await store.remove(table, request, row.id); return reply.code(204).send(); });
  app.post('/api/v2/chat/stream', { config: { rateLimit: { max: Number(env.CHAT_RATE_PER_HOUR || 20), timeWindow: '1 hour' } }, schema: { body: { type: 'object', required: ['question'], properties: { question: { type: 'string', minLength: 1, maxLength: MAX_INPUT }, threadId: { type: 'string', maxLength: 100 } }, additionalProperties: false } } }, async (request, reply) => {
    const result = await answerQuestion({ vehicles, chain, question: request.body.question.trim(), log: request.log, env });
    reply.hijack(); reply.raw.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    const send = (event, data) => reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    send('status', { state: 'grounding', provider: result.provider });
    result.matchedVehicles.forEach((slug) => send('matched_vehicle', { slug })); result.sources.forEach((url) => send('citation', { url }));
    const chunks = result.answer.match(/.{1,28}(?:\s|$)/g) || [result.answer]; for (const text of chunks) send('answer_delta', { text });
    if (result.fallback) send('fallback', { reason: result.fallbackReason }); send('done', result); reply.raw.end();
  });
}
