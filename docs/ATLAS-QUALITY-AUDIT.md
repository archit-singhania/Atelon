# Atelon quality audit and next delivery plan

This pass reviews all fifteen tools, the shared interface and their API handlers. The target is observable correctness and recoverability, not an unsupported claim of perfection. No hosted migrations, deployment, or live provider calls are performed by this audit.

## Shared frontend improvements

- Searchable tool hub with category filters, URL-persisted queries, capability labels and explicit empty states.
- Atlas entry in the mobile navigation; current-tool semantics, visible keyboard focus, readable source tables and touch-sized form controls.
- Original glass panels retain light/dark semantic colors, reduced transparency and reduced-motion alternatives; card motion is interaction-only.
- Workspace error boundary provides retry without erasing saved research. Invalid tool names show the not-found view rather than silently opening the tool index.
- Storage failures surface a warning. Untrusted imported/local records are normalized before use in the affected workflows.
- Comparison values retain their original recorded text alongside normalized numbers, including qualifiers and variant context.

## Fifteen-tool findings and corrections

| Tool | Reviewed failure/quality risk | Improvement made | Still needs external/content verification |
|---|---|---|---|
| 1. Showroom concierge | Partial spec names, stale actions after failure, empty/repeated requests | Recorded-key token matching, guarded submission, cleared stale actions and timeout | Broader natural-language evaluation; deterministic matching is not unrestricted AI |
| 2. Engineering lab | Playback phase jumps, misleading regenerative direction, reduced-motion use | Resume from chosen phase, direction follows power/regeneration, manual controls and explicit educational scope | Subject-expert review of schematics; no vehicle-specific physics claim |
| 3. Scale bay | Scene failure could replace useful source information | Recoverable scene boundary, WebGL fallback, hidden-tab suspension and context-loss restart | Calibrated models and physical measurements; only one complete dimension record |
| 4. Knowledge graph | SVG-only interaction and inaccessible selection | Space/Enter interaction, labelled native-button alternative, explicit recorded vs reviewed relationships | Source-backed platform/engine/designer relations |
| 5. Evidence intelligence | Wrong-shaped storage, no history choice, hashing failure | Validated snapshots/watches, selectable baseline, export/delete and secure-context error handling | No external-page monitoring; snapshots are unsigned local research |
| 6. Research rooms | Successful auth hooks could hang; overlapping polls/writes; stale or lost notes; invitations in server-visible query | Async guards, sequential polling, serialized writes, note validation/union, storage-event fallback, leave action, private fragment invitations and join limits | Actual Supabase policies, cross-device concurrency and real-time transport |
| 7. Interiors | Invalid or duplicated seat metadata; scene errors | Null-safe metadata validation, unique seats/controls, distinct camera targets, dated review checks and scene recovery | Real cabin geometry and reviewed camera/control positions |
| 8. Garage-fit studio | Missing height check, small-space diagram overflow, no shareable scenario | Height envelope, bounded drawing, shareable URL and dated JSON assessment | Door/mirror envelopes, survey accuracy and true-scale device AR |
| 9. Photo identification | Mismatched MIME, unbounded upstream read, stale results after removal | MIME/signature matching, streaming response-size limit, allowlisted finite results, cancellation, timeout and stale-response isolation | Live provider accuracy/retention, ambiguous photos and generation errors |
| 10. Discovery map | Chart-only browsing and missing scale labels | Keyboard/native-button alternatives, year/power labels and exact recorded values | More structured engine/drive/spec data; no inferred handling claims |
| 11. Story director | Corrupt/empty storyboards, duplicate shot IDs, invalid duration, hidden-tab stall, oversized narration | Safe normalization, bounded shots/media, cancellation during capture, image-load timeout, visibility interruption and resource cleanup | Browser codec/narration interoperability, real-device long exports and live camera-path filmmaking |
| 12. Generation stories | Single-record timeline appeared interactive; poster wipe could imply scale | Single-record control disabled, labelled keyboard-accessible record selection, retained scale/body-style disclosure | A complete researched chronology and compatible meshes for real morphing |
| 13. Sound archive | Arbitrary files and delayed decoding failures | Audio type/size gate, decode-error feedback and retained cleanup/attribution states | Authentic recordings and spatial playback on real devices |
| 14. Dossiers | Unsafe saved evidence links could enter exported HTML | HTTP(S)-only credential-free bookmark sources; text stays escaped and private content remains opt-in | Print pagination on Safari/Firefox and large multi-record reports |
| 15. Contributor review | Incomplete drafts, arbitrary proposal shapes, self-review and reversible final decisions | Complete persisted drafts, structure templates, typed server validation, self-review denial, terminal transitions and migration-backed audit checks | Apply/test migrations 003/004, real reviewer accounts and moderation operations |

## Backend findings beyond the tools

- Fixed the same successful-authentication hook hang in the older cloud research and admin handlers. Positive-path tests now cover successful authorized requests, not only rejection paths.
- Private v2 persistence/export/deletion no longer falls back to a shared anonymous owner in production. Public catalogue browsing remains available; development sessions are explicitly scoped.
- Public suggestion creation is rate-limited and anonymous cloud suggestions use a null owner rather than an invalid anonymous UUID.
- Added room/review ownership and version-conflict tests using an in-memory query adapter. These test application authorization, not PostgreSQL RLS.
- Migration 004 adds room-note/review indexes, a nonblank note constraint, terminal review transitions and independent-review enforcement. It is not automatically applied.
- Optional asset metadata rejects null entries, duplicate IDs, impossible dates, unsafe recording paths and unsupported relationship targets without crashing validation.

## Recommended next work, in priority order

| Priority | Workstream | Concrete deliverable and completion gate |
|---|---|---|
| P0 | Hosted security qualification | Apply migrations in staging; two/three-account tests, RLS deny cases, concurrent writes, backup and restore drill. Requires a configured project. |
| P0 | Content qualification | Full dimensions, reviewed metre calibration, authentic audio and interior seats for actual showcase vehicles. Do not manufacture metadata to unlock screens. |
| P1 | Canonical engineering facts | Normalize quantities, generation/variant/market, dates and source disagreements in one typed fact model; compare/AI/maps consume the same facts. |
| P1 | Real-time collaboration | Authorized room subscriptions, participant presence, full camera vectors, reconnect cursors and durable conflict-safe notes. Keep polling as a fallback. |
| P1 | Automated visual/accessibility gates | Component tests, screenshot baselines per theme/viewport, full accessibility scanning and manual screen-reader passes. Basic label/keyboard checks alone are insufficient. |
| P1 | 3D reliability governance | Automated context-loss tests, repeated model-switch memory measurements, real-device frame/thermal budgets and explicit renderer fallback telemetry. |
| P2 | Grounded assistant orchestration | Structured fact tools, clarification for ambiguous models, multi-turn action previews and evaluated citations; no arbitrary write or navigation commands. |
| P2 | Cinematic director v2 | Actual camera keyframes/interpolation, per-shot transitions, progress estimates, resumable rendering and cross-browser audio export. Current export is a sourced presentation film. |
| P2 | Catalogue operations | Durable asset job queue, retries/idempotency, reviewer assignments, staging preview and reproducible published snapshots. Current scripts should not become an unbounded synchronous API. |
| P2 | Research journeys | Contextual onboarding, guided tours, interoperable deep links, explicit local/cloud sync conflicts and reusable research templates. |
| P2 | Production operations | Redacted error reporting, real-user performance measures with consent, service objectives, migration rollback and alert ownership. Requires hosting/monitoring configuration. |
| P2 | Crawlability and routing | Hosting-level correct HTTP 404s for unknown dynamic paths, canonical URLs and full rendered public content. A client-side not-found heading alone is not HTTP 404 verification. |

## Local verification results — 22 October 2026

- `npm run verify`: passed, including strict validation of nine records, 30 automated tests, TypeScript, production build, release artifacts and bundle budgets. Initial entry JavaScript measured approximately 122.3 KiB gzip.
- `npm run eval:chat` with an empty `API_URL`: deterministic local fallback passed 159/159 cases. This is not a live-provider accuracy score.
- `npm run test:browser`: passed for the 25-route smoke suite and the deeper fifteen-tool audit, including both palettes, reduced transparency, labelled controls, keyboard selection, malformed backups, storage quota failures, photo cancellation, safe dossier links, complete contribution draft persistence, evidence history, shared local notes and WebM export/cancellation.
- Targeted software-WebGL real-model and comparison-bay context-loss/restart scenarios passed during a separate run. That slower run was interrupted before its repeated deep audit finished; it is not recorded as an overall software-WebGL suite pass or a physical-device performance result.
- Updated desktop pearl and mobile laboratory screenshots were inspected under `.qa-v3/`. No remote migrations or deployment were performed.

## Honest release boundary

Local builds and browser tests cannot certify hosted database permissions, provider correctness, every assistive technology, physical-device AR, authentic content or universal browser support. The remaining items above are release gates and further engineering work, not silently completed features.
