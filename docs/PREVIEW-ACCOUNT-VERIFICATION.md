# Account preview verification record

Status: **Not run**. This document is a procedure, not verification evidence.

Use an owner-approved isolated preview with migrations 001–010, an approved backup and disposable test identities A, B and C. Never use a production account for deletion tests. Set each API/browser flag independently. Record build commit, migration version, device/browser versions, date, operator and outcome; do not record access tokens or sharing URLs in a public report.

| Gate | Procedure | Recorded result |
|---|---|---|
| Migration and restore | Apply approved migrations in order; restore the backup into another isolated preview and compare schema/counts | Not run |
| Direct database isolation | Using B's authenticated client, attempt reads/writes to A's collections, receipts and share table; verify denial at RLS/API layers | Not run |
| Named collection convergence | A on two devices edits the same revision; exercise keep mine/cloud/both; verify one backup and one resulting revision | Not run |
| Retry receipts | Interrupt a successful sync response; resend its operation ID; verify no extra revision or backup | Not run |
| Offline queues | Queue two collections separately, reload offline, reopen each online; verify neither queue changes the personal Garage or another collection | Not run |
| Session ownership | Expire A's session with pending edits, sign in as B, then back as A; B must never see or send A's queue | Not run |
| Sharing | Share without notes, explicitly share with notes, replace token, revoke, delete collection; old links must fail on reload | Not run |
| Sharing privacy | Check public response fields, no-store headers and sanitized API logs; direct anonymous reads of collection_shares must fail | Not run |
| Deletion prerequisites | With deletion disabled or readiness RPC absent, confirm no identity/application rows change | Not run |
| Identity deletion | Create C's saves, threads, views, suggestions, room, receipts and share; delete C through the confirmation UI; verify Auth identity and owned rows are removed | Not run |
| Editorial references | Repeat with a disposable author/reviewer; shared records remain and identity references become null | Not run |
| Storage failure | Test an identity owning a private Storage object; if Auth refuses deletion, verify app data was not removed first and UI reports unconfirmed status | Not run |
| Interrupted deletion | Drop the response; inspect Auth and owned rows before any retry. UI must never claim success without confirmation | Not run |
| Export | Compare an archive with preview counts, including more than one provider page; confirm omitted secrets and documented exclusions | Not run |
| Physical Android/iPhone | Test keyboard, touch, narrow widths, safe areas, offline reload and reconnect on actual phones; capture issues and device details | Not run |
| Rollback | Disable affected flags, rebuild web if needed and restore previous application artifact; preserve additive migrations and queued operations | Not run |

Local tests exercise these APIs and controls with fixtures but do not certify this table. Public launch stays gated until the relevant hosted rows pass and device defects are resolved. Account deletion keeps shared editorial content/published assets and device-only data; it is not a request to erase all local browser storage.
