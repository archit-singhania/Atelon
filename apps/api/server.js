import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { loadVehicles, search } from './src/data.js';
import { buildChain } from './src/providers.js';
import { answerQuestion, MAX_INPUT } from './src/chat.js';
import { createStore } from './src/store.js';
import { registerV2 } from './src/v2.js';
import { validateEnv } from './src/env.js';
import { registerPlatform } from './src/platform.js';

export async function buildApp({ env = process.env, logger = true } = {}) {
  validateEnv(env);
  if (env.NODE_ENV === 'production' && (!env.ALLOWED_ORIGIN || /localhost|127\.0\.0\.1/.test(env.ALLOWED_ORIGIN))) throw new Error('Production requires ALLOWED_ORIGIN with the public web origin.');
  const app = Fastify({ bodyLimit: 16 * 1024, ajv: { customOptions: { coerceTypes: false, removeAdditional: false } }, logger: logger ? { serializers: {
    req(request) { return { id: request.id, method: request.method, url: request.url }; },
    res(reply) { return { statusCode: reply.statusCode }; }
  } } : false });
  const vehicles = loadVehicles();
  const chain = buildChain(env);
  const store = createStore(env);
  const origins = (env.ALLOWED_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,https://localhost,capacitor://localhost').split(',').map((value) => value.trim()).filter(Boolean);
  await app.register(cors, { origin: env.NODE_ENV === 'production' ? origins : [...origins, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/] });
  await app.register(rateLimit, { global: false });
  const metrics = { startedAt: Date.now(), requests: 0, failures: 0, totalLatencyMs: 0, aiRequests: 0, aiFallbacks: 0, providerOutcomes: {} };
  app.addHook('onRequest', async (request, reply) => { request.requestStartedAt = performance.now(); metrics.requests += 1; reply.header('X-Request-Id', request.id); });
  app.addHook('onResponse', async (request, reply) => { metrics.totalLatencyMs += performance.now() - request.requestStartedAt; if (reply.statusCode >= 500) metrics.failures += 1; });
  app.addHook('onSend', async (_request, reply, payload) => {
    reply.header('X-Content-Type-Options', 'nosniff').header('X-Frame-Options', 'DENY').header('Referrer-Policy', 'strict-origin-when-cross-origin').header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()').header('Cache-Control', 'no-store');
    return payload;
  });
  app.setErrorHandler((error, request, reply) => {
    const status = error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
    if (status >= 500) request.log.error({ err: error }, 'request failed');
    reply.code(status).send({ error: { code: error.code || (status === 500 ? 'INTERNAL_ERROR' : 'INVALID_REQUEST'), message: status === 500 ? 'The service is temporarily unavailable.' : error.message }, requestId: request.id });
  });
  app.get('/health', async () => ({ status: 'ok', vehicles: vehicles.length, providers: chain.map((provider) => provider.name), aiReady: chain.length > 0 }));
  app.get('/ready', async () => ({ status: 'ready', catalogue: vehicles.length > 0, persistence: store.mode }));
  app.get('/metrics', async () => ({ uptimeSeconds: Math.round((Date.now() - metrics.startedAt) / 1000), requests: metrics.requests, failures: metrics.failures, averageLatencyMs: metrics.requests ? Math.round(metrics.totalLatencyMs / metrics.requests) : 0, catalogueSize: vehicles.length, persistence: store.mode, aiRequests: metrics.aiRequests, aiFallbacks: metrics.aiFallbacks, providerOutcomes: metrics.providerOutcomes }));
  app.get('/api/status', async () => ({ catalogue: { vehicles: vehicles.length }, ai: { ready: chain.length > 0, providers: chain.map((provider) => provider.name), deterministicFallback: true } }));
  app.get('/api/search', { schema: { querystring: { type: 'object', properties: { q: { type: 'string', maxLength: 100 } }, additionalProperties: false } } }, async (request) => ({ results: search(vehicles, String(request.query.q || '').slice(0, 100)) }));
  app.get('/api/compare', { schema: { querystring: { type: 'object', required: ['a', 'b'], properties: { a: { type: 'string', maxLength: 100 }, b: { type: 'string', maxLength: 100 } }, additionalProperties: false } } }, async (request, reply) => {
    const a = vehicles.find((vehicle) => vehicle.slug === request.query.a); const b = vehicles.find((vehicle) => vehicle.slug === request.query.b);
    if (!a || !b) return reply.code(404).send({ error: { code: 'VEHICLE_NOT_FOUND', message: 'Vehicle not found.' }, requestId: request.id });
    return { a, b };
  });
  app.post('/api/chat', { config: { rateLimit: { max: Number(env.CHAT_RATE_PER_HOUR || 20), timeWindow: '1 hour' } }, schema: { body: { type: 'object', required: ['question'], properties: { question: { type: 'string', minLength: 1, maxLength: MAX_INPUT } }, additionalProperties: false } } }, async (request) => { const result=await answerQuestion({ vehicles, chain, question: request.body.question.trim(), log: request.log, env }); metrics.aiRequests+=1;if(result.fallback)metrics.aiFallbacks+=1;metrics.providerOutcomes[result.provider]=(metrics.providerOutcomes[result.provider]||0)+1;return result; });
  await registerV2(app, { vehicles, chain, store, env, metrics });
  await registerPlatform(app, { store, vehicles });
  return app;
}

const directPath = process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(new URL(`file:///${process.argv[1].replace(/\\/g, '/')}`));
if (directPath) { const app = await buildApp(); await app.listen({ port: Number(process.env.PORT || 8787), host: '0.0.0.0' }); const close = async () => { app.log.info('graceful shutdown'); await app.close(); process.exit(0); }; process.once('SIGTERM', close); process.once('SIGINT', close); }
