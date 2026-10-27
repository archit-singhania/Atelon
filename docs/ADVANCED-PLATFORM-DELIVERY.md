# Advanced platform delivery tracker

This tracks the new 15-workstream plan separately from the previously audited application. No production migration or deployment has been performed.

## Milestone A — in progress

Implemented:
- Additive `GET /api/v2/garage` and `PUT /api/v2/garage/sync` endpoints.
- One private personal Garage per account, revision conflicts, retry receipts and atomic cloud save-both backups.
- Forward migration `007_garage_sync.sql`; not applied to a database.
- Explicit anonymous-import confirmation, pending operation persistence in IndexedDB, reconnect/reopen retry, offline status, last sync and three conflict decisions.
- Account-isolated local queues and stale-tab sequence checks. No background synchronization claim: retry runs while the account page is mounted or reopened.
- A sequential `npm run verify:platform` pipeline. Optional `-- --webgl --visual` adds heavier checks. Do not rebuild concurrently with browser tests. Report: `.qa-v3/platform-verification.json`.
- An operations runbook covering queue recovery, application rollback, preview migration checks and a restore-rehearsal procedure. Writing the procedure does not certify a completed rehearsal.
- Independent API/web rollout flags, disabled by default in production. Legacy collection creation does not depend on migration 007.
- Browser recovery checks for expired sessions and lost successful responses; retries preserve the operation ID and do not advance revisions twice.
- Expanded cloud account export with paginated owner-scoped profile, history, Garage, comparison, conversation, research and submission records. Account UI downloads JSON and explains that device-only data, uploaded binaries and shared editorial records are outside this archive. Errors do not produce partial archives. Reads are not a transactional snapshot.
- Gated full-identity deletion endpoint and explicit confirmation UI; migration 008 changes ownership cascades and removes blocking identity references from shared editorial records. Supabase Auth performs deletion; no application rows are removed first. Not hosted-verified.
- Revocable read-only cloud collection snapshots with hashed tokens, explicit note inclusion, replacement/revocation controls and a shared-view route. Migration 009 remains unapplied. Already downloaded copies cannot be revoked.
- Named collection sync reuses the durable queue, revision conflicts and save-both behavior. Migration 010 remains unapplied. Each open collection resumes its own queue; this is not an always-running background sync service. Existing local Research collections are not automatically imported.

Remaining before Milestone A is complete:
- Hosted migration/RLS/multi-account tests and restore rehearsal.
- Hosted verification of named sync, revocable sharing and full-identity deletion, including storage-ownership failures and retry after an interrupted deletion response. Existing URL-encoded local snapshots remain non-revocable.
- Rich per-vehicle note import from local Research collections into the simpler cloud collection record; background sync beyond an open collection.
- Export of uploaded assets and administrative authorship records, plus a hosted export audit.
- Preview feature-flag testing and automated accessibility scans.

## Other workstreams

### Local verification — 27 October 2026

`npm.cmd run verify:platform` completed successfully after the deletion, named sync and sharing changes:

- 51 automated tests and strict validation of nine vehicle records.
- TypeScript, production build, release artifact and performance-budget checks.
- 159 deterministic fallback AI cases; this is not a live-provider accuracy score.
- Real-component Garage/export browser checks, including session expiry, lost successful replies, persistence, conflict decisions and account isolation. Named collection offline reload/reconnect, sharing/revocation controls and deletion confirmation/disabled-state behavior also pass. Successful Auth deletion is covered with a stubbed provider only.
- 25 browser routes and all 15 existing Atlas tools, including both audited palettes and reduced transparency.

The full 36-image visual baseline and nine-model WebGL audit were not rerun for this change. Hosted Supabase, real device, admin-flag-on and independent accessibility checks remain pending. Report: `.qa-v3/platform-verification.json`.

Use `docs/PREVIEW-ACCOUNT-VERIFICATION.md` to record hosted and physical-device outcomes. All of its results currently remain **Not run**. Migrations 007–010 have not been applied by this implementation.

| Workstream | New-plan status |
|---|---|
| Research AI and expanded evaluation | Pending; existing grounded assistant retained |
| Reviewed engineering exploration | Review gate exists; placement editor/content pending |
| Interiors | Suitable reviewed pilot content pending |
| Reviewed dimensions/garage fit | Further review and calibration pending |
| Comparison workspace | Advanced persistence/scoring/snapshots pending |
| Showrooms | Further per-vehicle reviewed calibration pending |
| Cinematic editor | Extended timeline/keyframe/audio scope pending |
| Hosted research rooms | Expiry/revocation/handover and hosted verification pending |
| Source intelligence | Source registry and review queue pending |
| Catalogue operations | Immutable publication/rollback workflow pending |
| Offline packs | Transactional updates and optional models pending |
| Personalization | Explicit interest ranking/privacy controls pending |
| Premium UI | New-plan polish and expanded screenshot coverage pending |
| Production reliability | Sequential local pipeline added; hosted/device/security/accessibility gates pending |

## Verify and roll out Garage sync

1. Run unit tests and the real-component Garage browser harness; the harness uses a local test identity, never production auth bypasses.
2. Review migration 007, back up the preview database and apply it only with owner approval.
3. Verify concurrent revisions, identical retries, changed-payload key reuse, private backups and outsider denial against actual Supabase.
4. Confirm old collection clients advance revisions too, and test sign-out/account switching with a pending queue.
5. Enable only after preview tests pass. Roll back the application first if needed; preserve the additive database columns and queued data.

Do not label the full advanced platform released based on local tests alone.
