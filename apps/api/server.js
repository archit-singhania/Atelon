import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { loadVehicles, search } from './src/data.js';
import { buildChain } from './src/providers.js';
import { answerQuestion, MAX_INPUT } from './src/chat.js';

const app = Fastify({
  ajv: { customOptions: { coerceTypes: false, removeAdditional: false } },
  logger: {
    serializers: {
      req(request) { return { method: request.method, url: request.url }; },
      res(reply) { return { statusCode: reply.statusCode }; }
    }
  }
});
const vehicles = loadVehicles(); // in memory, no database
const chain = buildChain();

const origins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,https://localhost,capacitor://localhost')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOrigins = process.env.NODE_ENV === 'production' ? origins : [...origins, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/];
await app.register(cors, { origin: corsOrigins });
await app.register(rateLimit, { global: false });

app.get('/health', async () => ({ status: 'ok', vehicles: vehicles.length, providers: chain.map((p) => p.name), aiReady: chain.length > 0 }));

app.get('/api/status', async () => ({ catalogue: { vehicles: vehicles.length, updatedAt: new Date().toISOString() }, ai: { ready: chain.length > 0, providers: chain.map((p) => p.name), deterministicFallback: true } }));

app.get('/api/search', { schema: { querystring: { type: 'object', properties: { q: { type: 'string', maxLength: 100 } }, additionalProperties: false } } }, async (req) => {
  const q = String(req.query.q || '').slice(0, 100);
  return { results: search(vehicles, q) };
});

app.get('/api/compare', { schema: { querystring: { type: 'object', required: ['a', 'b'], properties: { a: { type: 'string', maxLength: 100 }, b: { type: 'string', maxLength: 100 } }, additionalProperties: false } } }, async (req, reply) => {
  const a = vehicles.find((v) => v.slug === req.query.a);
  const b = vehicles.find((v) => v.slug === req.query.b);
  if (!a || !b) return reply.code(404).send({ error: 'vehicle not found' });
  return { a, b };
});

app.post(
  '/api/chat',
  {
    config: { rateLimit: { max: Number(process.env.CHAT_RATE_PER_HOUR || 20), timeWindow: '1 hour' } },
    schema: { body: { type: 'object', required: ['question'], properties: { question: { type: 'string', minLength: 1, maxLength: MAX_INPUT } }, additionalProperties: false } }
  },
  async (req, reply) => {
    const question = String(req.body?.question || '').trim();
    if (!question) return reply.code(400).send({ error: 'question required' });
    if (question.length > MAX_INPUT) return reply.code(400).send({ error: `max ${MAX_INPUT} characters` });
    return answerQuestion({ vehicles, chain, question, log: req.log });
  }
);

const port = Number(process.env.PORT || 8787);
await app.listen({ port, host: '0.0.0.0' });
