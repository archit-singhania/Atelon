# Advanced Atlas delivery ledger

Open `/atlas` for the fifteen tools. Existing vehicle URLs and nine reference-tier records are retained. Implemented capability does not mean missing assets or hosted integrations have been verified.

| # | Tool | Implemented capability | Remaining activation / limitation |
|---|---|---|---|
| 1 | Showroom concierge | Validated requests produce known camera, specification, hotspot and comparison actions | Deterministic intent matching, not unrestricted AI control; component views need reviewed mappings |
| 2 | Engineering lab | Four-stroke, differential, suspension and EV schematics with interactive controls | Educational illustrations, not vehicle-specific physics |
| 3 | Scale comparison bay | One metre-grid scene, sourced envelopes, optional calibrated geometry | Only Nissan currently has full dimensions; no reviewed model calibrations |
| 4 | Knowledge graph | Keyboard-selectable manufacturer/family connections and sourced engineering relationship support | Engineering relationships need editorial research |
| 5 | Evidence intelligence | Dated SHA-256 catalogue snapshots, field diffs and watched baselines | Checks on opening; no external website crawler or background alerts |
| 6 | Research rooms | Local two-tab synchronization; cloud invites, membership, presenter state, notes, version conflicts and closure | Cloud migration/configuration and two-account verification; presets rather than continuous camera orbit, cloud polling |
| 7 | Interior explorer | Reviewed seat-camera viewer and sourced controls | No reviewed cabin geometry/seating metadata supplied |
| 8 | Garage-fit studio | Space measurements including height, sourced envelopes, rotation, clearance calculation, shared setup URLs and dated JSON export | Planning aid only; true-scale AR needs metre-normalized reviewed GLBs and device tests |
| 9 | Photo identification | Local preview, explicit upload, server-only vision credentials, catalogue-only results | Vision provider configuration and real-image evaluation; confidence is uncalibrated |
| 10 | Discovery map | Year/power map, normalized quantities, evidence-derived traits and explained related records | Catalogue facts only; no invented handling or purchase advice |
| 11 | Story director | Eight-shot timeline, camera/scene preview, sourced captions, JSON storyboard, optional local narration and WebM capture | Browser support and live showroom activation; labelled poster fallback, no continuous camera-path film |
| 12 | Generation stories | Record scrubber, poster wipe, sourced before/after comparison | Two Porsche records currently; not a complete chronology or geometry morph |
| 13 | Sound archive | Attributed playback, spatial panning, volume and private local audio preview | No authentic approved recordings supplied |
| 14 | Research dossiers | Source-indexed print/PDF, polished HTML, dated JSON and optional private bookmarks | PDF uses browser print, not a server renderer |
| 15 | Contributor review | Complete local drafts/export, authenticated submissions, privileged queue, independent reviewers and terminal audited decisions | Migration and reviewer identities; acceptance does not automatically publish content |

## Cloud activation

1. Back up the database; test migrations 001, 002, `003_advanced_atlas.sql` and `004_atlas_review_hardening.sql` in a non-production Supabase project. No remote migration was applied by this work.
2. Configure Supabase authentication/redirects and existing frontend/server environment values. Never expose the service-role key to the browser.
3. Add trusted account UUIDs to backend `ADMIN_USER_IDS` / `REVIEWER_USER_IDS`.
4. Test owner/invited/nonmember room access, follower write denial, version conflicts, and closure revocation using real accounts.
5. Test own-only contributions, reviewer denial, concurrent review conflicts, atomic audit records and RLS in the hosted database before launch.
6. Research backup includes evidence, watches, storyboard and proposal drafts; photos, audio and invitations are excluded. Export/delete APIs include owned rooms, memberships, notes and contributions. Audit retention is separate. Existing account deletion clears application data, not the Supabase Auth identity.

## Vision activation

Configure a trusted HTTPS OpenAI-compatible chat-completions `VISION_API_URL`, server-only `VISION_API_KEY`, and `VISION_MODEL`. Check provider privacy, retention and charges before enabling it. Images are sent only after explicit action and are not persisted by this application; provider retention is separate. Evaluate ambiguous/non-vehicle images, generation errors, outages and malformed output. No real provider call has been verified here.

## Reviewed asset metadata

- `model3d.calibration`: positive `metersPerUnit`, finite three-number `rotation`, `reviewer`, `verifiedAt`, authoritative `source`. Current true-scale AR requires `metersPerUnit: 1`.
- `model3d.interior`: dated reviewer, nonempty `seats` with ID/label/position/target; optional controls with ID/label/description/source.
- `relationships`: known target slug, supported kind, label and source.
- `recordings`: ID/title, local audio URL, source, credit, supported kind and optional recording date. Retain permission evidence with provenance.
- Run strict validation and actual-device review. Do not fabricate metadata to unlock gated capabilities.

## Verification and remaining release work

Run `npm run verify` for strict catalogue/metadata validation, tests, TypeScript, production build, release artifacts and bundle budget. Run `npm run test:browser` for 25 routes and interaction checks; screenshots are stored in ignored `.qa-v3/`.

Before production readiness: hosted RLS/migration tests, configured vision evaluations, authentic interior/audio content, model calibration, Android/iPhone AR tests, assistive-technology audit, real-device performance, and cross-browser recording/export verification. No external deployment was performed.

See [ATLAS-QUALITY-AUDIT.md](ATLAS-QUALITY-AUDIT.md) for the subsequent fifteen-tool hardening audit and prioritized next delivery plan.

### Verified locally — 22 October 2026

- `npm run verify`: passed; nine strict catalogue records, 30 tests, TypeScript, production build, release artifacts and bundle budget.
- Initial JavaScript: approximately 122.3 KiB gzip, below the 250 KiB target; 3D and feature modules remain separate chunks.
- `npm run test:browser`: passed across 25 routes at mobile size, plus appearance/keyboard/PWA/offline checks, showroom action generation, evidence hashing, two-tab note delivery and a nonempty WebM export.
- Desktop pearl and mobile engineering-lab screenshots visually inspected; mobile segmented-control overflow corrected and retested.
- These checks do not certify hosted Supabase policies, live provider accuracy, real-device AR, authentic content or universal browser support.
