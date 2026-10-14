# Android APK (Capacitor) and PWA

Run from the repo root unless noted. Android Studio must be installed (free).

1. `npm install`
2. `npm run icons` (makes PWA/Android icons from the approved masters in `assets/logo/`)
3. Set `VITE_API_URL` to your Render URL (create `apps/web/.env.production`), then in `apps/web`:
   `npm run build`
4. The Android project already exists. Run `npm run cap:sync -w apps/web` after every production web build.
5. `npm run cap:open`, and in Android Studio: Build > Generate Signed Bundle / APK > APK > create a keystore > release.
6. **Back up the keystore file and passwords in two places.** Losing them means you cannot update the app. Keystores are git-ignored.
7. Test on two real phones (USB debugging). Chat working proves the Render CORS entries are right
   (`ALLOWED_ORIGIN` must include `https://localhost` and `capacitor://localhost`).
8. Upload the APK to GitHub Releases and link it from the site with the "allow installs from this source" steps.

## Verified local debug build

The Android shell was created and `gradlew.bat assembleDebug` completed successfully on 14 October 2026. The ignored test artifact is generated at `apps/web/android/app/build/outputs/apk/debug/app-debug.apk`. This debug APK is for device QA only; it is not the signed public release.

PWA install test: Android Chrome > menu > Install app. iPhone Safari > Share > Add to Home Screen (iPhone gets the PWA only).

Exit check: installs, opens in under 3 seconds, browses offline, chat works on mobile data.
