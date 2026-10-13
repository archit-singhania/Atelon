# Atelon progress

Legend: [x] done in code, [ ] to do. [YOU] = manual, [CODE] = generated.
Nothing has been run yet (no npm install / build / validate). Testing is deliberately postponed.

## Phase 1 - Accounts, tokens, repo
- [x] [CODE] Monorepo, .gitignore, .env.example, license policy, style guide draft, CI, branding checklist (docs/branding.md)
- [ ] [YOU] Accounts: GitHub, Vercel, Render, Hugging Face, Groq, Cloudflare, Figma, UptimeRobot (2FA on)
- [ ] [YOU] Tokens HF_TOKEN (prod + dev), GROQ_API_KEY, CF_ACCOUNT_ID, CF_API_TOKEN in local .env only
- [ ] [YOU] Install Node LTS, Blender, `npm i -g @gltf-transform/cli gltfpack`
- [ ] [YOU] Branding checks, Figma landing sketch, finalise style guide

## Phase 2 - Data model and list of 100
- [x] [CODE] Schema, sample record, validate.mjs, build-data.mjs, new-vehicle.mjs, candidates.csv + guide
- [ ] [YOU] Candidate list (150); decide spec fields

## Phase 3 - Specs collection
- [ ] [YOU] 100 records (two-source rule, own-words summaries, status "live"); pass `npm run validate:strict`

## Phase 4 - 3D asset audit
- [x] [CODE] Ledger columns, audit-licenses.mjs
- [ ] [YOU] Manual audit per model, tier decision, attribution lines

## Phase 5 - 3D optimisation
- [x] [CODE] scripts/optimise.mjs, poster-first loading in the viewer
- [ ] [YOU] Blender cleanup, GLB export, posters (WebP 1200 + 400 px), real phone test

## Phase 6 - Backend on Render
- [x] [CODE] Fastify API, CORS, rate limit, render.yaml
- [ ] [YOU] Run locally, deploy to Render, set env vars, UptimeRobot monitor

## Phase 7 - Web app on Vercel
- [x] [CODE] All screens, scroll-driven rotation, featured carousel with tilt cards, spec race, chat demo, AR (<model-viewer>), per-page titles/descriptions, sitemap + robots, per-vehicle static metadata pages (scripts/prerender-meta.mjs: title, canonical, Open Graph, JSON-LD), vercel.json
- [ ] Not done: full content prerendering (crawlers get metadata, not the rendered page body), self-hosted HDRI (viewer uses drei's "city" preset from a CDN; swap in a Poly Haven HDRI once downloaded)
- [ ] [YOU] Deploy to Vercel (root apps/web, VITE_API_URL), Lighthouse and device tests

## Phase 8 - AI chain
- [x] [CODE] HF -> Groq -> Cloudflare -> no-AI fallback, grounded prompt, daily cap, eval harness (data/eval-questions.json, npm run eval:chat)
- [ ] [YOU] Verify endpoints, pick models, write ~50 verified test questions

## Phase 9 - Mobile
- [x] [CODE] PWA manifest, Capacitor config + scripts, icon generator, docs/android.md
- [ ] [YOU] `npm run icons`, Android Studio, signed APK, keystore backup, GitHub Release

## Phase 10 - QA, legal, launch
- [x] [CODE] Privacy, Terms, About, Credits pages (drafts), launch checklist
- [ ] [YOU] Real takedown email and domain in site.ts, lawyer/IP review, license re-audit, soft launch, public launch

## Phase 11 - Growth
- [x] [CODE] Suggestion page + GitHub issue template (no accounts)
- [ ] [YOU] Add 20-50 vehicles a month; ask creators for permission
