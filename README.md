# Atelon

Every machine. In 3D. An AI vehicle atlas for cars and motorcycles.

## Quick start
Verified locally on Node 24.20.0 and npm 11.19.0 (13 October 2026). Use an active Node LTS release.

```
npm install
npm run validate        # check data/vehicles and data/ledger.csv
cp .env.example .env    # fill in secrets (never commit)
npm run dev:api         # http://localhost:8787/health
npm run dev:web         # http://localhost:5173
npm run eval:make       # regenerate the grounded evaluation set
npm run eval:chat       # 159 in-process cases; optional API_URL for a hosted API
npm run verify          # strict data, API tests, production build, release artifact checks
npm run test:browser    # nine routes, themes, collections, offline packs, conversions and keyboard QA
npm run performance:check # enforce entry CSS/JS budgets
```

V3 features, configuration, delivery status and verification limits: [V3 delivery record](docs/V3-DELIVERY.md). The optional `npm run worker:assets` command processes one inspected private upload with server Supabase credentials and an installed Chromium browser.

## Layout
- `apps/web` Vite + React + Three.js (site, PWA, Capacitor shell)
- `apps/web/android` synchronized Capacitor Android project
- `apps/api` Fastify server for Render (AI proxy, search)
- `data/vehicles` one JSON file per vehicle; `data/ledger.csv` license records
- `assets/raw` original downloads (git-ignored); `scripts/` validate, build-data, optimise
- `docs/` license policy, style guide, PROGRESS.md

## Deploy
- Vercel: root directory `apps/web`, preset Vite, env `VITE_API_URL`.
- Render: root directory `apps/api`, build `npm install`, start `node server.js`, health `/health`.
  (The plan said `npm ci`, but there is no lockfile inside `apps/api` with a workspaces repo, so `npm install` is safer.)

Architecture: `docs/architecture.md`. Release/rollback: `docs/release-runbook.md`. Status: `docs/PROGRESS.md`.

The internal liquid-glass component gallery is available at `/design-system` in local and preview builds.

## Atelon v2 optional services

Without cloud environment values, accounts use local saved vehicles and the API uses an isolated local persistence adapter. To enable synchronization, apply `supabase/migrations/001_atelon_v2.sql`, set server-only `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, and set browser-safe `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Never expose the service-role key to Vite.

Feature flags are `VITE_FEATURE_SPATIAL`, `VITE_FEATURE_ACCOUNTS`, `VITE_FEATURE_STREAMING_AI` and `VITE_FEATURE_ADMIN`. The administrator surface is development-only unless explicitly enabled.
