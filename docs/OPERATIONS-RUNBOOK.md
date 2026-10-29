# Atelon operations and release runbook

## Before enabling Garage sync

Migration 007 is additive and is not applied automatically. Obtain owner approval for a preview database migration, export a backup with the provider's supported tooling and record its restore location securely. Never put credentials or database exports into Git.

Verify the preview schema matches migrations 001–006, then apply 007. Check that `sync_personal_garage` is executable by `service_role` only, receipts have RLS enabled without client policies, and collections retain owner-scoped policies. Test with two real user accounts and a separate anonymous session. Local fixture authentication does not prove these policies.

Keep `GARAGE_SYNC_ENABLED=false` on the API and `VITE_FEATURE_GARAGE_SYNC=false` in the web build until ready. Production API sync is disabled unless explicitly set to `true`; the web control also requires explicit opt-in. Enable both only in the approved preview after applying 007. The browser flag requires rebuilding. Ordinary collection endpoints remain available without the new migration. Turning sync off preserves pending IndexedDB operations for a later retry.

Use a non-production account to test first import, an offline update, concurrent updates, repeated identical operation IDs, reuse with a changed body and save-both backups. Confirm exactly one personal collection and exactly one backup per accepted operation. Preserve any user data during retries.

Also expire the test session with a queued operation, sign back in as the same account and retry. Simulate a successful write whose response is lost: retry must reuse the operation ID and return the recorded result without a second revision or backup.

## Release verification

1. Run `npm run verify:platform` against an unchanged checkout/build. Do not build in parallel with browser tests.
2. On the matching visual-baseline platform, run `npm run verify:platform -- --webgl --visual` for the additional rendering and screenshot gates.
3. Inspect `.qa-v3/platform-verification.json`. A missing, interrupted or failed check is not a pass. Do not publish this internal file as a promise of hosted certification.
4. Complete a separate admin-flag-on preview run, real Supabase ownership tests and manual accessibility/device checks. The default pipeline does not cover those gates.
5. Obtain deployment approval, deploy to preview, test real allowed origins/session expiry, then approve the production rollout.

## Failure response

- **Sync API errors:** preserve the client's IndexedDB queue. Do not repeatedly clear storage, create new operation IDs for an uncertain request, or re-import the Garage. Inspect request IDs and sanitized logs; restore service and retry the same operation.
- **Revision conflict:** present keep mine / keep cloud / save both. A save-both backup is a private collection. Do not resolve conflicts by changing database revisions manually.
- **Stale local tab:** reload that tab; the newer durable queue is retained. Export any unsaved form text before reload.
- **Provider outage:** use the existing deterministic fallback. Never substitute fabricated catalogue values.
- **Bad application release:** roll back the application to the last verified artifact. Preserve additive columns, receipts and user records. Do not run a destructive down-migration as the first response.
- **Suspected data loss:** stop writes to the affected feature, preserve logs/backups, restore a copy into preview and compare before touching production.

## Restore rehearsal — still required

Restore an approved backup into an isolated preview project. Confirm schema version, catalogue counts, user-data ownership, collection revisions and receipt behavior. Use controlled test identities; do not email real users or invoke external providers during the rehearsal. Record recovery duration, missing data and the approver. No restore rehearsal has been performed by adding this document.

## Monitoring boundaries

Existing API counters are process-local. Inspect readiness, 5xx rates, latency, sync conflicts and worker failures. Treat repeated 5xx responses or failed readiness as actionable; conflicts alone can be expected concurrent edits. Do not log access tokens, notes, full prompts or sync document bodies. Durable alerts and exact production thresholds require preview traffic measurements and owner-approved monitoring configuration.

## Account export boundaries

### Additional account rollout gates

Apply migrations 008–010 only after approval and preview backup. Keep `ACCOUNT_DELETION_ENABLED`, `COLLECTION_SHARING_ENABLED`, `COLLECTION_SYNC_ENABLED` and corresponding `VITE_FEATURE_ACCOUNT_DELETION`, `VITE_FEATURE_COLLECTION_SHARING`, `VITE_FEATURE_COLLECTION_SYNC` flags false until their preview tests pass.

Migration 008 changes deletion behavior. Test Auth deletion with an ordinary user, an editorial author, a reviewer and a storage-owning user. Owned rows cascade; editorial records keep content but clear identity references. Published assets and device-only data remain. A failed or interrupted Auth request must not be described as successful; inspect the identity and owned records before retrying. The new `/api/v2/account/identity` endpoint requires the exact confirmation phrase and the capability RPC. The legacy `/api/v2/account` endpoint remains a data-only endpoint for compatibility.

For migration 009, verify that anonymous clients cannot read the share table directly, only the API's snapshot projection. Test no-notes default, explicit note inclusion, token replacement, revoked/deleted links and outsider writes. Do not log share tokens. Fragment-based web links keep the token out of page-request URLs; the API request serializer redacts it too. Downloaded copies cannot be recalled.

For migration 010, test two devices editing one collection, independent collections, duplicate operation IDs, interrupted replies, legacy PATCH revision increments and owner isolation. Reopen the collection to resume pending operations. Do not automatically import the separate local Research collection format or discard its per-vehicle notes.

The Account workspace now offers an explicit local Research import preview. Confirmation saves a full local source backup and queues one collection. Notes are encoded as labelled JSON in the existing 2,000-character Notes field; oversized imports are refused without truncation. Repeating an import opens the stable account-specific queue without overwriting cloud edits. If the source changes after preview, review again. The original Research store is never removed. This is a snapshot import, not bidirectional synchronization with the Research editor.

The Account page downloads an owner-scoped JSON archive using the existing export endpoint. Cloud reads paginate rather than relying on the provider's default row limit. An error stops the archive; a size exceeding 20 MiB or 50,000 rows in one table requires operator-assisted export. The archive includes personal profile/history, collections, comparisons, threads, research and submissions. Invitation hashes and comparison sharing tokens are excluded.

This is not a transactional database backup: pause edits across devices during collection. Device-only saves and pending queues, uploaded asset binaries, and shared administrative/editorial records are outside this archive. Verify export completeness against actual preview records before release. Only the new, explicitly gated identity-deletion endpoint removes the authentication identity; the legacy account DELETE endpoint remains data-only.
