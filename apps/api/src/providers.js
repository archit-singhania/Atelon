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

export async function readCompletionStream(response) {
  if (!response.body) throw new Error('empty stream');
  const reader=response.body.getReader();const decoder=new TextDecoder();let buffer='';let answer='';let bytes=0;let finished=false;
  try { while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>MAX_RESPONSE_BYTES)throw new Error('response too large');buffer=(buffer+decoder.decode(value,{stream:true})).replace(/\r\n/g,'\n');const blocks=buffer.split('\n\n');buffer=blocks.pop()||'';for(const block of blocks){const data=block.split('\n').filter(line=>line.startsWith('data:')).map(line=>line.slice(5).trim()).join('\n');if(!data)continue;if(data==='[DONE]'){finished=true;continue;}const chunk=JSON.parse(data);if(chunk.error)throw new Error('provider stream failed');const choice=chunk.choices?.[0];if(typeof choice?.delta?.content==='string')answer+=choice.delta.content;if(choice?.finish_reason)finished=true;if(answer.length>4000)throw new Error('answer too long');}}if(!finished||!answer.trim())throw new Error('incomplete stream');return answer.trim(); } finally { await reader.cancel().catch(()=>undefined); }
}

async function openAiStyle(url, key, model, messages, { nativeStreaming = false, signal } = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, max_tokens: 400, temperature: 0.2, ...(nativeStreaming ? { stream: true } : {}) }),
    signal: signal ? AbortSignal.any([signal,AbortSignal.timeout(TIMEOUT_MS)]) : AbortSignal.timeout(TIMEOUT_MS)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if(nativeStreaming && res.headers.get('content-type')?.includes('text/event-stream'))return readCompletionStream(res);
  const data = await safeJson(res);
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('empty response');
  return text.trim().slice(0, 4000);
}

async function cloudflare(accountId, token, model, messages, { signal } = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages, max_tokens: 400 }),
    signal: signal ? AbortSignal.any([signal,AbortSignal.timeout(TIMEOUT_MS)]) : AbortSignal.timeout(TIMEOUT_MS)
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
    chain.push({ name: 'huggingface', run: (m, options) => openAiStyle('https://router.huggingface.co/v1/chat/completions', env.HF_TOKEN, env.HF_MODEL, m, { ...options, nativeStreaming: env.AI_NATIVE_STREAMING === 'true' }) });
  if (env.GROQ_API_KEY && env.GROQ_MODEL)
    chain.push({ name: 'groq', run: (m, options) => openAiStyle('https://api.groq.com/openai/v1/chat/completions', env.GROQ_API_KEY, env.GROQ_MODEL, m, { ...options, nativeStreaming: env.AI_NATIVE_STREAMING === 'true' }) });
  if (env.CF_ACCOUNT_ID && env.CF_API_TOKEN && env.CF_MODEL)
    chain.push({ name: 'cloudflare', run: (m, options) => cloudflare(env.CF_ACCOUNT_ID, env.CF_API_TOKEN, env.CF_MODEL, m, options) });
  return chain;
}

export async function askChain(chain, messages, log, options = {}) {
  const attemptedProviders = [];
  for (const p of chain) {
    if(options.signal?.aborted)break;
    attemptedProviders.push(p.name);
    try {
      const text = await p.run(messages, options);
      log.info({ provider: p.name }, 'chat answered');
      return { text, provider: p.name, attemptedProviders };
    } catch (e) {
      log.warn({ provider: p.name, err: e.message }, 'provider failed, trying next');
    }
  }
  return { text: null, provider: null, attemptedProviders };
}
