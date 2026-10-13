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
```

## Layout
- `apps/web` Vite + React + Three.js (site, PWA, Capacitor shell)
- `apps/api` Fastify server for Render (AI proxy, search)
- `data/vehicles` one JSON file per vehicle; `data/ledger.csv` license records
- `assets/raw` original downloads (git-ignored); `scripts/` validate, build-data, optimise
- `docs/` license policy, style guide, PROGRESS.md

## Deploy
- Vercel: root directory `apps/web`, preset Vite, env `VITE_API_URL`.
- Render: root directory `apps/api`, build `npm install`, start `node server.js`, health `/health`.
  (The plan said `npm ci`, but there is no lockfile inside `apps/api` with a workspaces repo, so `npm install` is safer.)

Status and checklist: `docs/PROGRESS.md`. License rules: `docs/license-policy.md`.

The internal liquid-glass component gallery is available at `/design-system` in local and preview builds.
