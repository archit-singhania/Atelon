# Android APK (Capacitor) and PWA

Run from the repo root unless noted. Android Studio must be installed (free).

1. `npm install`
2. `npm run icons` (makes PWA/Android icons from the approved masters in `assets/logo/`)
3. Set `VITE_API_URL` to your Render URL (create `apps/web/.env.production`), then in `apps/web`:
   `npm run build`
4. `cd apps/web` then `npx cap add android` (first time only), then `npm run cap:sync`
5. `npm run cap:open`, and in Android Studio: Build > Generate Signed Bundle / APK > APK > create a keystore > release.
6. **Back up the keystore file and passwords in two places.** Losing them means you cannot update the app. Keystores are git-ignored.
7. Test on two real phones (USB debugging). Chat working proves the Render CORS entries are right
   (`ALLOWED_ORIGIN` must include `https://localhost` and `capacitor://localhost`).
8. Upload the APK to GitHub Releases and link it from the site with the "allow installs from this source" steps.

PWA install test: Android Chrome > menu > Install app. iPhone Safari > Share > Add to Home Screen (iPhone gets the PWA only).

Exit check: installs, opens in under 3 seconds, browses offline, chat works on mobile data.
