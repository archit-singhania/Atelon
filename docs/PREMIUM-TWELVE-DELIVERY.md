# Twelve-upgrade delivery — 23 October 2026

This records implementation status, not a claim of production certification. Existing vehicle URLs and nine reference models are retained.

| # | Upgrade | Implemented in this delivery | Remaining verification or scope |
|---|---|---|---|
| 1 | Art-directed vehicle pages | Nine vehicle accent palettes, themed showroom atmosphere, editorial collection/chapter headings, readable light-theme accents. | Individual bespoke page layouts and new vehicle photography are not included; the responsive page structure is shared. |
| 2 | Cinematic showroom controls | Front/rear/profile/hero/detail presets, bounds-relative animated camera transitions without remounting the canvas, existing lighting and shareable settings. | Actual front/rear identity depends on each model's authored orientation; device/GPU review still required. |
| 3 | Continuous discovery transitions | Existing shared-element transitions retained; a short native animation fallback now covers browsers without View Transitions. Reduced motion remains respected. | Safari/Firefox/device visual verification. |
| 4 | Expressive Garage | Three curated collection entry points, URL-persisted selection, saved-search restoration, existing grid/list/cinema views. | Editorial expansion as catalogue grows. |
| 5 | Conversational AI | Existing streaming and citations enriched with inline vehicle cards and grounded follow-up actions; cleanup cancels requests on navigation and new chat is disabled while generating. | Live provider credentials, quotas and provider-specific checks. |
| 6 | Visual comparison | Seven normalized measurement panels, source links, original qualifiers, missing/conflicting value states; existing differences mode, vehicle imagery and exports retained. | Scaled silhouette overlays need reviewed dimensions/calibration; current imagery is not asserted to be to scale. |
| 7 | Personal home | Recently viewed/saved vehicles, saved comparison shortcuts and collection entries. | Cross-device state depends on existing explicit account synchronization. |
| 8 | Cinematic film editor | Start/end camera presets per shot, easing, camera scrubbing, live WebGL frame rendering into WebM; captured-view/poster fallbacks are labelled. | Desktop GPU, long/multi-model exports, audio synchronization and phone export quality need device tests. Preset-based keyframes, not arbitrary six-axis curve authoring. |
| 9 | Live collaboration | Throttled drag-camera transport across local tabs; private Supabase broadcasts, presence, membership policies; existing durable notes/preset polling preserved. | Apply migration 005, configure private realtime and test with real presenter/follower accounts. Channel authorization is cached by the service; the app disconnects after failed membership refresh, not an instantaneous server revocation guarantee. |
| 10 | Stronger engineering data | Canonical numeric comparison, conflicts withheld, optional reviewed measurements with units, qualifier, reviewer/date and uncertainty. Shared backend/build validation. | Existing textual records are labelled parsed, not retrospectively certified. Populate reviewed measurements through editorial review. |
| 11 | Content management | Accessible editor entry; structured vehicle/spec forms and draft preview, advanced JSON retained; worker claim leases, heartbeat, retry limits and unique output paths; manual state advancement restricted. | Apply migration 006 and run private storage/worker integration. Publication still exports a snapshot through strict build validation. |
| 12 | Operations dashboard | Admin-protected route latency/error summaries, AI fallback counts and bounded diagnostic categories. No prompt/URL/identity in client diagnostic bodies; DNT respected. | Durable external metrics, alert delivery and production traffic tests. Process-memory counters reset on restart. |

## Local verification

- Strict validation passes for nine records.
- 34 automated tests pass, including numeric conflicts, measurement provenance, camera payload bounds and telemetry authorization.
- TypeScript and production build pass.
- Release artifact checks pass; initial entry JavaScript is approximately 126.3 KiB gzip, below the 250 KiB budget.
- Premium browser workflow audit passes: collections, recent shelf, camera URLs, charts, timeline, local two-tab camera transport, operator entry and editing a structured draft field. The QA build enabled `VITE_FEATURE_ADMIN=true`.
- Existing browser regression passes for 25 routes and all fifteen Atlas tools in both palettes and reduced-transparency mode, including film export, local room notes, offline behavior and recovery checks.
- Isolated software-WebGL audit passes: camera preset changes preserve the renderer and start/end keyframes produce distinct nonempty 3D frames. This is not a physical-device performance test.
- No remote deployment, database migration or physical-device session has been performed in this delivery.

## Enable hosted capabilities

1. Back up the Supabase database and apply migrations 001–004 if they are not already applied. Apply `005_live_rooms.sql`, then `006_processing_leases.sql` in a preview environment first.
2. Configure authenticated Supabase access and administrator user IDs using the existing environment examples. Keep service-role credentials on the server/worker only.
3. Follow [Supabase Realtime authorization](https://supabase.com/docs/guides/realtime/authorization): disable public channel access for the private room deployment and verify room-member read/presenter broadcast policies. Test an outsider account as well as presenter/follower accounts.
4. Test creating, joining, following, leaving and closing a room on two devices. Confirm follower camera broadcast is denied by the database policy and an outsider cannot subscribe.
5. Configure private `vehicle-ingest` storage. Run `npm run worker:assets` for an inspected asset. Confirm optimization, both posters, hashes, QA status and failure/retry handling before scheduling the worker.
6. Review source values before adding optional `measurement` objects. Do not substitute today's date for actual source verification.
7. Build with `VITE_FEATURE_ADMIN=true` to expose `/admin`; the production default hides this route. Sign in as an administrator, load the catalogue editor and refresh operational metrics. Configure durable monitoring separately if historical retention/alerts are needed.
8. Test the showroom and film export on a capable desktop, mid-range Android and iPhone/Safari. Check front/rear orientation, load time, memory, cancellation and multi-shot export.
9. Run final production CORS, account ownership, AI streaming, PWA update and accessibility checks before deployment.

## Reviewed measurement example

Keep the original `key`, `value`, `unit` (if present) and `source`. Add a `measurement` only after review:

```json
{
  "kind": "power",
  "value": 331,
  "unit": "kW",
  "qualifier": "Manufacturer rating; retain variant and RPM context",
  "reviewer": "Actual reviewer name",
  "verifiedAt": "2026-10-23"
}
```

The date/name above are examples, not evidence that any existing record was reviewed on that date. Supported canonical kinds/units: power/kW, torque/Nm, weight/kg, length/mm, width/mm, height/mm, speed/km/h. Optional `uncertainty` is an absolute value in the same canonical unit.
