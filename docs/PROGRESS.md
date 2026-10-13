# Atelon progress

Legend: [x] verified, [~] implemented but externally/manual blocked, [ ] not started. [YOU] = manual, [CODE] = implementation.
Local baseline verified 13 Oct 2026 with Node 24.20.0 and npm 11.19.0: install, validation, icon generation, TypeScript, production build, PWA generation, API health and deterministic chat fallback all pass.

## Phase 0 - Environment and build
- [x] Repaired the Windows Node/npm installation and moved the corrupt user npm package to a recoverable backup
- [x] Root dependency install and lockfile
- [x] `npm run validate`, `npm run icons`, and `npm run build`
- [x] Local `/health` and no-provider chat fallback
- [x] Browser QA for dark/light theme and the component gallery

## Phase 1 - Accounts, tokens, repo
- [x] [CODE] Monorepo, lockfile, .gitignore, .env.example, license policy, adaptive style guide, CI, branding checklist
- [ ] [YOU] Accounts: GitHub, Vercel, Render, Hugging Face, Groq, Cloudflare, Figma, UptimeRobot (2FA on)
- [ ] [YOU] Tokens HF_TOKEN (prod + dev), GROQ_API_KEY, CF_ACCOUNT_ID, CF_API_TOKEN in local .env only
- [ ] [YOU] Install Node LTS, Blender, `npm i -g @gltf-transform/cli gltfpack`
- [ ] [YOU] Branding checks, Figma landing sketch, finalise style guide

## Phase 2 - Data model and list of 100
- [x] [CODE] Schema, sample record, validate.mjs, build-data.mjs, new-vehicle.mjs, candidates.csv + guide
- [x] [CODE] Initial 30-candidate licensing-first pool
- [ ] [YOU] Audit the 30 candidates and expand to 150 after the 10-vehicle showcase

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
- [x] [CODE] Adaptive light/dark liquid-glass tokens, theme persistence, accessible controls, reduced-motion/transparency fallbacks, mobile navigation, and `/design-system` QA page
- [x] [CODE] All screens, scroll rotation, carousel, spec race, chat demo, AR, SEO metadata, sitemap/robots, metadata pages, and Vercel routing
- [x] [CODE] Viewer loads near the viewport, uses local procedural studio lighting, handles load failures, and caps DPR; no lighting CDN dependency
- [~] Full content prerendering and a verified self-hosted CC0 HDRI remain optional content/SEO work
- [ ] [YOU] Deploy to Vercel (root apps/web, VITE_API_URL), Lighthouse and device tests

## Phase 8 - AI chain
- [x] [CODE] HF -> Groq -> Cloudflare -> no-AI fallback, grounded prompt, structured provider/match/fallback metadata, daily cap, eval harness
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
