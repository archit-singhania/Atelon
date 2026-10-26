# Functional audit — 26 October 2026

This is a local verification report, not a claim that every device, external provider or deployment configuration has been certified.

## Corrections made

- Ask AI now validates restored messages instead of trusting arbitrary parsed browser storage. Invalid objects, partial replies, duplicate IDs and malformed citation arrays no longer break restoration.
- Restored citation links reject executable protocols and embedded credentials; vehicle identifiers are restricted to slugs. History is bounded to 40 messages.
- Conversation library rejects malformed saved entries. Branch restoration goes through the same normalization.
- Keyboard submission obeys the offline guard, and clearing a chat tolerates unavailable storage.
- Browser test server reports a missing build instead of crashing on an undefined file path.
- Added regression cases for corrupt chat state and expanded the camera audit to every catalogue model.
- Audit exposed an empty-film edge case under delayed rendering. Export now starts its duration at the first drawn frame, rejects empty/interrupted recordings and checks minimum output size. Browser verification also decodes the resulting 1280×720 WebM instead of only checking for a download link.

## Locally verified

| Check | Result / coverage |
|---|---|
| Strict catalogue validation | Nine records pass |
| Automated tests | 38 pass: API contracts, ownership checks using fixtures, streaming/fallback, metadata gates, exports, numeric grounding, telemetry authorization and saved-chat recovery |
| AI evaluation | 159/159 cases pass against the local deterministic fallback; not a live-provider accuracy certification |
| Production build | TypeScript, Vite, PWA generation and prerendering pass |
| Release/performance checks | Pass; initial JavaScript 129.7 KiB gzip |
| Visual regression | All 36 existing baselines pass: four themes × three viewport sizes × three representative views; references were not regenerated for this audit |

The final browser suite passes: 25 routes, all fifteen Atlas tools, keyboard entry, themes, reduced transparency, local collections, two-tab transport, film export, offline fact/poster storage and failure recovery. The corrected export produces a decodable 1280×720 WebM. All nine catalogue models pass software-WebGL loading and distinct nonblank camera-frame checks; camera continuity and reference silhouettes also pass. Passing an unavailable-state test is not equivalent to enabling the missing service or content.

## Not certified by these local checks

- Supabase magic-link/Google delivery, cross-device collection synchronization, real database RLS, private realtime authorization, migrations and storage/worker integration. Local ownership fixtures do not replace multi-account hosted tests.
- Live AI and vision provider credentials, quotas, availability and real vision accuracy.
- Admin UI in the default production build (feature flag disables it); hosted moderation and publishing workflows.
- Android APK signing/installation, iPhone/Safari and Firefox, microphone permissions, native sharing, actual AR placement, thermal/frame-rate or memory behavior on physical hardware.
- Reviewed engineering anchors, calibrated cabin assets, missing measurements and attributed sound recordings. These features must keep their honest unavailable states until appropriate content is supplied/reviewed.
- Production DNS, contact/suggestion destinations, email delivery, CORS on the actual deployment, external monitoring, legal approval and asset-license clearance.
- A full independent accessibility/security audit or exhaustive testing of every possible input. Keyboard/mobile and automated contract checks provide bounded evidence, not universal guarantees.

No deployment, production migration or external account mutation was performed.
