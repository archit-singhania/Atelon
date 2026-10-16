# Release and rollback runbook

1. Set `SITE_URL` and `VITE_API_URL` to public HTTPS URLs; configure the API's exact `ALLOWED_ORIGIN`.
2. Run `npm ci`, `npm run verify`, and `npm run test:browser`.
3. Deploy the API, confirm `/health`, then deploy the immutable web artifact from `apps/web/dist`.
4. Check landing, Garage, one vehicle, Compare, Ask, Credits, manifest, offline reload and a real GLB on mobile.
5. For Android, run `npm run android:version`, `npm run cap:sync -w apps/web`, build a signed release in Android Studio, and run `npm run android:hash -- <apk>`.

Rollback web or API to the prior provider deployment. Do not mutate old assets in place; model and poster caching assumes immutable URLs. If a content error is discovered, remove the record from `live`, rebuild, deploy, and invalidate only HTML/service-worker caches.
