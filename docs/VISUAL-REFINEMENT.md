# Visual refinement delivery

## Implemented

- Nine individually composed, locally rendered showroom posters in 1200px and 400px WebP variants. Camera settings live in `data/poster-compositions.json`; generation rejects files over 250 KiB.
- Local softbox reflection lighting and feathered ground in the interactive showroom. No remote environment dependency; reduced-quality rendering remains supported.
- Sticky Story / Engineering / Create / Explore navigation and scroll-driven reading progress. Anchors retain space below the floating navigation.
- Hotspot publication checks require a finite position, dated reviewer, matching specification/source, explanatory notes and current optimized-model hash. Unreviewed and stale anchors are filtered out of the viewer. Active reviewed hotspots show their evidence.
- Reproducible screenshot matrix: four themes, three viewports and three representative views (36 cases). Uses poster-only rendering, reduced motion, loaded fonts and DPR 1. `npm run visual:update` deliberately replaces reference images; `npm run visual:check` compares them with a 0.2% changed-pixel ceiling and channel tolerance 16. Use the same Chromium version/platform for meaningful comparisons.

## Remaining, not labelled complete

- No engineering-part hotspots have been certified for the nine reference models. Opaque mesh names and exterior-only models do not establish engine, transmission or suspension locations. A reviewer must confirm each anchor against the actual geometry and source before it becomes publishable. The review gate is implemented; reviewed content is not fabricated.
- Screenshot coverage is representative, not every route or every possible screen size. Physical Android/iOS, Safari and GPU/thermal checks remain separate from Chromium software-WebGL verification.
- The black Porsche source model has visible baked material/geometry artifacts. Better lighting and framing expose these; they do not repair the original mesh.

## Local checks

Run `npm run build`, `npm test`, `npm run validate:strict`, `node scripts/camera-browser-audit.mjs`, and `npm run visual:check`. Screenshot outputs are in `.qa-v3/visual`; references are in `tests/visual/baselines`.

Verified locally: production build, 36 automated tests, strict validation of nine records, 25-route browser suite, all fifteen Atlas tools, software-WebGL camera/silhouette checks, release artifacts and performance budgets. Initial JavaScript is 129.3 KiB gzip; the largest replacement poster is 37,386 bytes. AR previews now load only on request and handle unavailable WebGL without eagerly importing a second renderer.

Visual captures use CPU rasterization and a post-scroll settling period to avoid compositor differences. These baselines do not assert photorealism or certify real-device performance.

The completed 36-case screenshot comparison passed against the saved references without increasing its difference tolerance.
