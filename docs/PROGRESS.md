# Atelon progress

Legend: `[x]` verified, `[~]` implemented but awaiting content/external verification, `[ ]` not started. `[YOU]` is owner/manual work; `[CODE]` is implementation work.

## Phase 0 — Development environment

- [x] Node/npm, root lockfile and dependency installation
- [x] Validation, TypeScript, production build and PWA generation
- [x] Local API health and deterministic chat fallback

## Phase 1 — Product foundation and branding

- [x] [CODE] Monorepo, environment templates, full web/API/Android CI, approved logo masters and generated icons
- [ ] [YOU] Domain, real email, account setup, trademark checks and placeholder replacement
- Deferred at owner request until contact and production details are available.

## Phase 2 — Premium adaptive liquid-glass system

- [x] [CODE] Shared light/dark semantic material, color, spacing, radius, motion and typography tokens
- [x] [CODE] Navigation, cards, controls, filters, tables, comparison, notices and support messaging
- [x] [CODE] Dialog, bottom-sheet, loading, error, empty and disabled states in `/design-system`
- [x] [CODE] Keyboard focus, skip navigation and 44px touch targets
- [x] [CODE] Reduced-motion, reduced-transparency and no-backdrop-filter fallbacks
- [x] [CODE] Responsive Ask AI workspace and browser verification in light/dark themes

## Phase 3 — First showcase vehicles

- [x] [CODE] Thirty-candidate pool
- [x] [CODE] Owner-supplied nine-car showcase batch in `data/showcase.csv`; all nine have optimized browser-loadable GLBs
- [ ] [YOU] Manually verify the proposed asset pages and download the originals/evidence
- [x] [CODE] Nine sourced records, original summaries and corrected generation labels
- [x] [CODE] Strict schema/editorial validation and live status

## Phase 4 — Obtain and approve 3D models

- [x] [CODE] License ledger, audit script and `docs/model-download-guide.md`
- [ ] [YOU] Download through the authorized source flow and save license evidence
- [ ] [YOU] Inspect exact generation/variant and uploader provenance
- [x] [CODE] Ledger rows, original/optimized hashes, triangle counts and honest `reference` tier decisions

## Phase 5 — 3D viewer and showroom

- [x] [CODE] Poster-first lazy viewer, bounds fitting, controls, fullscreen, conditional AR, WebGL fallback and low-memory/Data Saver opt-in
- [x] [CODE] Nine optimized GLBs (2.03–4.99 MiB), 18 posters and production Meshopt loading verified
- [ ] [YOU] Test all models on a mid-range Android phone over throttled 4G

## Phase 6 — Web experience

- [x] [CODE] All routes, persistent Garage filters, sourced Compare, Ask AI, ledger-generated Credits, metadata and legal drafts
- [x] [CODE] Nine live records, loading/error/empty/offline states, related vehicles and in-app 404 recovery
- [x] [CODE] Crawlable body prerendering for 19 routes, Open Graph, Vehicle JSON-LD, static HTTP 404 and production browser QA

## Phase 7 — Backend and grounded AI

- [x] [CODE] Fastify API, validation, security headers, bounded providers, rate limits, citations, stable errors and numeric-grounding guard
- [ ] [YOU] Provider accounts, current model selection and server-side credentials
- [x] [CODE] 51-question evaluation suite passes 51/51 against deterministic local fallback

## Phase 8 — PWA and Android

- [x] [CODE] Manifest shortcuts, install/update UI, adaptive branding, service worker cleanup, offline notices and bounded poster/model caching
- [x] [CODE] Capacitor Android project, branded native assets, synchronized build, version automation, deep links, release shrinking, APK hashing and CI debug build
- [ ] [YOU] Physical-device checks, keystore backup and signed APK release

## Phase 9 — Deployment, legal review and launch

- [ ] [YOU] Render/Vercel setup, domain, production secrets and monitoring
- [ ] [YOU] Legal/trademark/design-rights review and final license re-audit
- [ ] [SHARED] One-week soft launch to 20–30 testers and top-five issue fixes

## Phase 10 — Scale

- [ ] Expand to 25, 50 and 100 only after the nine-vehicle pipeline passes every gate.

## Code-owned release gates completed

- [x] Strict validation checks GLB presence, size, optimized SHA-256, posters, specs and provenance fields
- [x] Six API/AI regression tests pass, including invalid input, provider failure and fabricated-number rejection
- [x] Production build, 19-route prerender, service worker generation and release artifact checks pass
- [x] Seven-route headless browser suite passes mobile overflow, reduced motion, keyboard entry and manifest checks
- [x] Architecture, contribution and release/rollback documentation is present

## Atelon v2 — advanced cinematic atlas

### Phase 11 — Liquid Glass v2

- [x] Three reusable material depths, segmented controls, command palette and responsive navigation island
- [x] Dynamic ambient cursor/scroll tokens, route choreography, spring interactions, contrast and reduced-motion fallbacks

### Phase 12 — Adaptive spatial environment

- [x] Lazily loaded global particle field with high/balanced/low device tiers and CSS fallback
- [x] Battery, Data Saver, device-memory and reduced-motion quality selection
- [x] Cinematic showroom camera presets, environments, guided-tour overlay and model hotspots
- [~] True mesh-anchored hotspots and exploded-part animation require vehicle-specific mesh metadata

### Phase 13 — Application v2

- [x] Scroll-directed landing narrative, advanced Garage views/filters/sorting/saved search and recent history
- [x] Two-to-four vehicle comparison, differences mode, visual bars and shareable URLs
- [x] Vehicle provenance sheet, sticky specification dock, local saved Garage and account surface

### Phase 14 — Supabase persistence

- [x] Supabase migration, RLS policies, optional auth client and Fastify persistence adapter
- [x] Collections, comparisons, threads, suggestions, export and deletion APIs with local fallback
- [~] Cloud synchronization awaits Supabase project values and provider-side OAuth configuration

### Phase 15 — Ask AI v2

- [x] SSE event protocol, progressive UI, stop response, citations, matched-vehicle cards and comparison actions
- [x] Evaluation expanded to 159 cases; deterministic grounded fallback passes 159/159
- [~] Native upstream token streaming activates in a future provider adapter revision; current server streams the validated final answer in safe chunks

### Phase 16 — Catalogue operations

- [x] Credential-ready catalogue studio, pipeline metrics and database schema for assets/audit events
- [~] Upload/processing actions remain read-only until object storage and administrator roles are configured

### Phase 17 — Production backend

- [x] Typed environment checks, readiness, JSON metrics, request IDs, graceful shutdown and modular v2 data/store routes
- [x] Cursor catalogue API, user/IP chat limiting and local/cloud persistence modes

### Phase 18 — Performance and release

- [x] Initial JavaScript budget enforced below 250 KiB gzip; current measured entry is approximately 113 KiB gzip
- [x] Eight API tests, 159 AI evaluations, strict model validation and release checks
- [~] Hosted Supabase policy tests, real-device frame telemetry and signed Android regression require configured external environments
