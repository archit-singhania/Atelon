// Provider chain: Hugging Face -> Groq -> Cloudflare Workers AI -> (caller falls back to no-AI answer).
// Endpoint paths verified against official provider documentation on 13 Oct 2026.
const TIMEOUT_MS = 8000;
const MAX_RESPONSE_BYTES = 64 * 1024;

async function safeJson(res) {
  const declared = Number(res.headers.get('content-length') || 0);
  if (declared > MAX_RESPONSE_BYTES) throw new Error('response too large');
  const raw = await res.text();
  if (Buffer.byteLength(raw) > MAX_RESPONSE_BYTES) throw new Error('response too large');
  return JSON.parse(raw);
}

async function openAiStyle(url, key, model, messages) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, max_tokens: 400, temperature: 0.2 }),
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await safeJson(res);
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('empty response');
  return text.trim().slice(0, 4000);
}

async function cloudflare(accountId, token, model, messages) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages, max_tokens: 400 }),
    signal: AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await safeJson(res);
  const text = data?.result?.response;
  if (!text) throw new Error('empty response');
  return text.trim().slice(0, 4000);
}

export function buildChain(env = process.env) {
  const chain = [];
  if (env.HF_TOKEN && env.HF_MODEL)
    chain.push({ name: 'huggingface', run: (m) => openAiStyle('https://router.huggingface.co/v1/chat/completions', env.HF_TOKEN, env.HF_MODEL, m) });
  if (env.GROQ_API_KEY && env.GROQ_MODEL)
    chain.push({ name: 'groq', run: (m) => openAiStyle('https://api.groq.com/openai/v1/chat/completions', env.GROQ_API_KEY, env.GROQ_MODEL, m) });
  if (env.CF_ACCOUNT_ID && env.CF_API_TOKEN && env.CF_MODEL)
    chain.push({ name: 'cloudflare', run: (m) => cloudflare(env.CF_ACCOUNT_ID, env.CF_API_TOKEN, env.CF_MODEL, m) });
  return chain;
}

export async function askChain(chain, messages, log) {
  const attemptedProviders = [];
  for (const p of chain) {
    attemptedProviders.push(p.name);
    try {
      const text = await p.run(messages);
      log.info({ provider: p.name }, 'chat answered');
      return { text, provider: p.name, attemptedProviders };
    } catch (e) {
      log.warn({ provider: p.name, err: e.message }, 'provider failed, trying next');
    }
  }
  return { text: null, provider: null, attemptedProviders };
}
