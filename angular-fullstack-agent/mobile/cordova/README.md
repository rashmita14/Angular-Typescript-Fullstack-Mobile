# Cordova wrapper sample

This is a separate Cordova web-wrapper example, not a Capacitor project. The current `www/` files are a small `deviceready` sample, not a duplicated Angular build.

From this folder, install Cordova CLI if needed, then add a platform and copy the built web files into `www/`:

```bash
npm install --global cordova
cordova platform add android
cordova requirements
```

Build Angular from `../../client`, then copy the contents of `dist/client/browser/` to this wrapper's `www/` (preserve or restore `js/api-config.js`). Do not copy Capacitor native projects or generated `platforms/` files.

Before using API requests, replace `https://api.example.invalid/api` in `www/js/api-config.js` with a reachable HTTPS API base URL. Update `config.xml` and the Content Security Policy `connect-src`/`access` entries to allow the actual API origin. Cordova plugins must be selected and verified separately.

Run `cordova run android` only after Android SDK requirements pass. iOS requires macOS and Xcode. No native platform is pre-generated or claimed tested here.
