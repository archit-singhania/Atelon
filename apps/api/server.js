import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { loadVehicles, search } from './src/data.js';
import { buildChain } from './src/providers.js';
import { answerQuestion, MAX_INPUT } from './src/chat.js';

const app = Fastify({ logger: true });
const vehicles = loadVehicles(); // in memory, no database
const chain = buildChain();

const origins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173,https://localhost,capacitor://localhost')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

await app.register(cors, { origin: origins });
await app.register(rateLimit, { global: false });

app.get('/health', async () => ({ status: 'ok', vehicles: vehicles.length, providers: chain.map((p) => p.name) }));

app.get('/api/search', async (req) => {
  const q = String(req.query.q || '').slice(0, 100);
  return { results: search(vehicles, q) };
});

app.get('/api/compare', async (req, reply) => {
  const a = vehicles.find((v) => v.slug === req.query.a);
  const b = vehicles.find((v) => v.slug === req.query.b);
  if (!a || !b) return reply.code(404).send({ error: 'vehicle not found' });
  return { a, b };
});

app.post(
  '/api/chat',
  { config: { rateLimit: { max: Number(process.env.CHAT_RATE_PER_HOUR || 20), timeWindow: '1 hour' } } },
  async (req, reply) => {
    const question = String(req.body?.question || '').trim();
    if (!question) return reply.code(400).send({ error: 'question required' });
    if (question.length > MAX_INPUT) return reply.code(400).send({ error: `max ${MAX_INPUT} characters` });
    return answerQuestion({ vehicles, chain, question, log: req.log });
  }
);

const port = Number(process.env.PORT || 8787);
await app.listen({ port, host: '0.0.0.0' });
