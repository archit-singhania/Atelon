# AI provider verification

Verified 13 October 2026. Model IDs remain environment variables because availability and quotas change independently of the application.

| Provider | Endpoint used by Atelon | Official reference |
|---|---|---|
| Hugging Face Inference Providers | `https://router.huggingface.co/v1/chat/completions` | https://huggingface.co/docs/inference-providers/en/index |
| Groq | `https://api.groq.com/openai/v1/chat/completions` | https://console.groq.com/docs/api-reference |
| Cloudflare Workers AI | `https://api.cloudflare.com/client/v4/accounts/{account}/ai/run/{model}` | https://developers.cloudflare.com/workers-ai/get-started/rest-api/ |

Before production, choose a currently available small instruction model in each account dashboard and set `HF_MODEL`, `GROQ_MODEL`, and `CF_MODEL`. Test quota exhaustion and invalid-token fallback without committing credentials.
