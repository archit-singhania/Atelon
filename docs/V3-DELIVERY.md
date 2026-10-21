# Atelon v3 delivery record

This release implements the browser and server foundations for the approved 15-feature plan. Cloud-dependent functions need migrations 001 and 002, Supabase public/server configuration and administrator UUIDs in `ADMIN_USER_IDS`. No migrations or deployments were executed against an external account.

| Feature | Delivered | Remaining prerequisite or boundary |
| --- | --- | --- |
| 1. Typography | Local Instrument Sans and Manrope variable WOFF2, display/interface/numeric roles | Latin subset; system fallback handles other scripts |
| 2. Themes | Obsidian, Pearl, Titanium, Midnight and system preference; persistent appearance dialog | Physical-device visual review |
| 3. Optical glass | Refined materials, stable specification surfaces, reduced-transparency and effects controls | Web rendering approximates optical glass |
| 4. Motion | Navigation View Transitions, selected vehicle image/showroom shared-element naming, immediate fallback, scroll restoration and reduced-motion behavior | Physical browser/device review of transition continuity |
| 5. Showroom | Actual environment-dependent lighting, intensity/orbit controls, URL presets, reset/restore/share | Architectural environment geometry/reflections are not yet implemented |
| 6. Engineering hotspots | Model-space anchors, keyboard selector, camera focus, mapped paint and exploded-part support | Current models have generic object/material names; reviewed mappings must be added before controls appear |
| 7. Discovery | Inspectable deterministic interpretation for lightweight, powerful, classics and vehicle types; normalized ranking | Arbitrary language/criteria are not supported; missing data stays missing |
| 8. Compare | Metric/imperial/source units, comparable bars, deltas, report export and derived power-to-weight section | Data availability controls derived results |
| 9. Generation explorer | Current generation periods, optional sourced milestones/family links and comparison shortcuts | Broader verified generation history has not been researched |
| 10. Personal research | Named collections, ordering, tags, vehicle notes, bookmarks, saved comparisons, local JSON backup and read-only snapshot sharing | Share links are immutable snapshots, rather than live cloud collections |
| 11. AI workspace | Saved searchable/renameable thread snapshots, branch/open, edit/resend, regenerate, answer bookmarks, bounded vehicle context, cancellation propagation and optional native HF/Groq SSE ingestion | Provider answers are fully validated before browser answer deltas are emitted; live credentials are untested |
| 12. Voice | Capability-detected voice input to editable composer; read aloud and stop controls | Microphone and speech behavior require real-browser permission/device tests |
| 13. Share Studio | Square/portrait/landscape PNG vehicle cards, optional current-frame 3D capture with poster fallback, comparison graphics, creator credit and catalogue URL | Frame capture availability depends on WebGL |
| 14. Offline/continuity | Explicit cached posters/spec snapshots, optional GLBs, dated snapshot display, storage estimate and removal; offline blob viewer | Cross-device research sync requires Supabase; browser cache eviction remains possible |
| 15. Catalogue operations | Verified admin allowlist, JSON draft editing, atomic revisions/audit, restore-to-editor, private signed uploads, processing-state controls, suggestion moderation, API/provider metrics and an optimization/poster worker | Cloud worker deployment and automated publication remain outstanding; strict build publication stays enforced |

## Cloud interfaces

- `GET /api/v3/research` and `PUT /api/v3/research` synchronize a private state document. `expectedUpdatedAt` prevents silently overwriting another device's changes. Merge preserves local duplicates and does not delete local records.
- `GET /api/v3/admin/catalogue`, `PUT /api/v3/admin/catalogue/:slug`, and `GET /api/v3/admin/catalogue/:slug/history` manage draft revisions. `expectedRevision` is checked atomically with revision/audit writes.
- `POST /api/v3/admin/uploads` returns a private signed upload URL and processing job. `PATCH /api/v3/admin/jobs/:id` records operator progress. These endpoints require a verified Supabase identity listed in the server-side allowlist; local bearer strings never grant administrator access.
- `/api/v2/chat/stream` accepts up to four `contextVehicles` slugs. Only stored catalogue identities enter follow-up grounding.

## Operation

Apply both migration files to the intended Supabase project. Configure email/OAuth and the existing Supabase variables. Set `ADMIN_USER_IDS` to verified administrator UUIDs, and `VITE_FEATURE_ADMIN=true` only where the studio should be visible. Sign in through My Garage. Research sync begins with a cloud preview before merge/upload. Never put the service-role key in browser variables.

`AI_NATIVE_STREAMING=true` enables native Hugging Face/Groq SSE ingestion. Incoming frames are bounded and checked for completion before the existing grounding guard runs. The browser receives an immediate grounding status; answer deltas follow validation. Provider protocols were checked against [Hugging Face chat completion](https://huggingface.co/docs/inference-providers/tasks/chat-completion) and [Groq text generation](https://console.groq.com/docs/text-chat). The native parser is covered by split-frame, CRLF, malformed, truncated and oversized-stream tests.

Catalogue edits are draft documents. Saving `qa` records is supported; publishing modified records cannot bypass the existing strict hash/size/poster/source/ledger gates. Export the document to the established build workflow until automatic publication is implemented.

Run `npm run worker:assets` in a trusted environment with server Supabase credentials and `CHROME_PATH` after an administrator marks a GLB job `inspected`. Each invocation atomically claims one waiting job, downloads the private original, optimizes with Meshopt/WebP, enforces the 5 MiB limit, renders 1200/400 WebP posters, uploads private QA outputs and records hashes, triangles and paths. Failures remain visible as failed jobs. The worker never publishes automatically. A dedicated worker host must install Chrome/Chromium; it is not part of the ordinary API request process.

Read-only collection links encode a public snapshot of names and vehicle slugs in the URL; they exclude notes and account information. Anyone holding the link can view that snapshot. Deleting a local collection cannot revoke an already-copied snapshot URL.

## Verification

The repository verification suite includes strict nine-vehicle validation, TypeScript/production build, release artifacts, gzip budgets, API authorization checks, grounded follow-up tests, deterministic discovery and conversion tests. Browser smoke covers nine routes, appearance persistence, collection creation, offline cached facts/posters, imperial rendering, keyboard entry and PWA manifest; visual captures are retained in ignored `.qa-v3/`. The standalone poster worker rendered both sizes successfully from the existing Thar GLB in local headless Chrome.

Cloud RPC/RLS execution, OAuth, real microphones, physical-device frame rates and the optional model mappings have not been verified without their external environments/data.
