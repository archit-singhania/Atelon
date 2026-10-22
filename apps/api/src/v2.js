import { MAX_INPUT, answerQuestion } from './chat.js';

const collectionBody = { type: 'object', required: ['name'], properties: { name: { type: 'string', minLength: 1, maxLength: 80 }, visibility: { enum: ['private', 'unlisted', 'public'] }, vehicle_slugs: { type: 'array', maxItems: 200, items: { type: 'string', maxLength: 100 } }, notes: { type: 'string', maxLength: 2000 } }, additionalProperties: false };
export async function registerV2(app, { vehicles, chain, store, env, metrics }) {
  app.addHook('preHandler', async (request) => { request.user = await store.userFromRequest(request); });
  app.get('/api/v2/me', async (request) => ({ user: request.user ? { id: request.user.id, email: request.user.email ?? null } : null, persistence: store.mode }));
  app.get('/api/v2/catalogue', { schema: { querystring: { type: 'object', properties: { cursor: { type: 'string', pattern: '^\\d+$' }, limit: { type: 'string', pattern: '^([1-9]|[1-4]\\d|50)$' } }, additionalProperties: false } } }, async (request) => { const cursor = Number(request.query.cursor || 0); const limit = Number(request.query.limit || 20); return { results: vehicles.slice(cursor, cursor + limit), nextCursor: cursor + limit < vehicles.length ? cursor + limit : null }; });
  const privateData=async request=>{const developmentSession=env.NODE_ENV!=='production'&&store.mode==='local'&&typeof request.headers['x-atelon-session']==='string'&&request.headers['x-atelon-session'].length>0&&request.headers['x-atelon-session'].length<=128;if(!request.user&&!developmentSession)throw Object.assign(new Error('Sign in to access private application data.'),{statusCode:401});if(env.NODE_ENV==='production'&&store.mode!=='supabase')throw Object.assign(new Error('Cloud persistence is not configured.'),{statusCode:503});};
  for (const [path, table, body] of [['collections', 'collections', collectionBody], ['comparisons', 'comparisons', { type: 'object', required: ['vehicle_slugs'], properties: { name: { type: 'string', maxLength: 80 }, vehicle_slugs: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'string' } }, unit_preference: { enum: ['source', 'metric', 'imperial'] } }, additionalProperties: false }], ['chat/threads', 'threads', { type: 'object', properties: { title: { type: 'string', maxLength: 120 }, messages: { type: 'array', maxItems: 60 } }, additionalProperties: false }]]) {
    app.get(`/api/v2/${path}`, {preHandler:privateData}, async (request) => ({ results: await store.list(table, request) }));
    app.post(`/api/v2/${path}`, { preHandler:privateData, schema: { body } }, async (request, reply) => reply.code(201).send(await store.create(table, request, request.body)));
    app.patch(`/api/v2/${path}/:id`, { preHandler:privateData, schema: { body: { ...body, required: [] } } }, async (request, reply) => { const row = await store.update(table, request, request.params.id, request.body); return row || reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Record not found.' }, requestId: request.id }); });
    app.delete(`/api/v2/${path}/:id`, {preHandler:privateData}, async (request, reply) => (await store.remove(table, request, request.params.id)) ? reply.code(204).send() : reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Record not found.' }, requestId: request.id }));
  }
  app.post('/api/v2/suggestions', { config:{rateLimit:{max:20,timeWindow:'1 hour'}}, schema: { body: { type: 'object', required: ['vehicle'], properties: { vehicle: { type: 'string', minLength: 2, maxLength: 160 }, reason: { type: 'string', maxLength: 1000 }, source_url: { type: 'string', maxLength: 500 } }, additionalProperties: false } } }, async (request, reply) => reply.code(201).send(await store.suggest(request, request.body)));
  app.get('/api/v2/account/export', {preHandler:privateData}, async (request) => ({ exportedAt: new Date().toISOString(), data: await store.exportUser(request) }));
  app.delete('/api/v2/account', {preHandler:privateData}, async (request, reply) => { for (const table of ['collections', 'comparisons', 'threads']) for (const row of await store.list(table, request)) await store.remove(table, request, row.id); if(store.cloud && request.user){const {error}=await store.cloud.from('research_state').delete().eq('user_id',request.user.id);if(error)throw error;for(const [table,column] of [['room_notes','user_id'],['room_members','user_id'],['research_rooms','owner_id'],['contributions','user_id'],['suggestions','user_id']]){const {error:issue}=await store.cloud.from(table).delete().eq(column,request.user.id);if(issue)throw issue;}} return reply.code(204).send(); });
  app.post('/api/v2/chat/stream', { config: { rateLimit: { max: Number(env.CHAT_RATE_PER_HOUR || 20), timeWindow: '1 hour' } }, schema: { body: { type: 'object', required: ['question'], properties: { question: { type: 'string', minLength: 1, maxLength: MAX_INPUT }, contextVehicles: { type: 'array', maxItems: 4, items: { type: 'string', maxLength: 100 } }, threadId: { type: 'string', maxLength: 100 } }, additionalProperties: false } } }, async (request, reply) => {
    const context = (request.body.contextVehicles || []).map(slug => vehicles.find(vehicle => vehicle.slug === slug)).filter(Boolean);
    const question = request.body.question.trim();
    const groundedQuestion = /\b(it|its|these|those|them|that vehicle)\b/i.test(question) && context.length ? `${question}\nContext vehicles: ${context.map(vehicle => `${vehicle.make} ${vehicle.model}`).join('; ')}` : question;
    const controller=new AbortController();const disconnect=()=>controller.abort();reply.raw.once('close',disconnect);
    reply.hijack(); reply.raw.writeHead(200, { ...reply.getHeaders(), 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no', 'X-Content-Type-Options':'nosniff' });
    const send = (event, data) => { if(!reply.raw.destroyed)reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); };
    send('status', { state: 'grounding', provider: 'verified catalogue' });reply.raw.flushHeaders?.();
    try {
      const result = await answerQuestion({ vehicles, chain, question: groundedQuestion, log: request.log, env, signal:controller.signal });
      if(metrics){metrics.aiRequests+=1;if(result.fallback)metrics.aiFallbacks+=1;metrics.providerOutcomes[result.provider]=(metrics.providerOutcomes[result.provider]||0)+1;}
      if(controller.signal.aborted)return;
      send('status',{state:'answering',provider:result.provider});
      result.matchedVehicles.forEach((slug) => send('matched_vehicle', { slug })); result.sources.forEach((url) => send('citation', { url }));
      const chunks = result.answer.match(/[\s\S]{1,48}/g) || []; for (const text of chunks) send('answer_delta', { text });
      if (result.fallback) send('fallback', { reason: result.fallbackReason }); send('done', result);
    } catch(error) { request.log.warn({message:error.message},'stream failed');send('error',{message:'The help desk could not finish this response. Please retry.'}); }
    finally { reply.raw.removeListener('close',disconnect);if(!reply.raw.destroyed)reply.raw.end(); }
  });
}
