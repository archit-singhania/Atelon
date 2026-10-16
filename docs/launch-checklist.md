# Nine-vehicle showcase launch checklist

## Automated gates

- [x] `npm run verify` passes: strict data/assets, API/AI tests, TypeScript, production build and release artifacts
- [x] `npm run test:browser` passes representative routes at mobile size, keyboard entry, reduced motion and PWA manifest checks
- [x] Nine live records have sourced specs, posters, optimized GLBs under 5 MiB and matching SHA-256 values
- [x] Crawlable HTML, structured vehicle data, static 404, security headers and bounded PWA caches are configured
- [x] Android versioning, minification, resource shrinking, deep-link scheme, debug CI build and APK hash tooling are configured

## Production and physical-world gates

- [ ] Replace site/contact placeholders and set public `SITE_URL`, `VITE_API_URL` and exact `ALLOWED_ORIGIN`
- [ ] Configure provider credentials and rerun `npm run eval:chat` against the deployed API
- [ ] Complete any chosen rights/provenance review and final content review
- [ ] Test Chrome, Safari and Firefox; install the PWA on Android and iPhone
- [ ] Test all nine models on a mid-range Android device over throttled 4G
- [ ] Generate and back up an Android signing keystore, then build/test a signed APK on two phones
- [ ] Deploy API first, verify `/health`, deploy web, then run the smoke and rollback checks in `docs/release-runbook.md`
- [ ] Soft-launch to 20–30 testers for one week and fix the highest-impact findings

Scale to 25, 50 and 100 vehicles only after this showcase clears every production and device gate.
