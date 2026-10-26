# Cordova wrapper sample

This is a separate Cordova web-wrapper example, not a Capacitor project. The current `www/` files are a small `deviceready` sample, not a duplicated Angular build.

This wrapper has its own `package.json` and local Cordova CLI 13 dependency; it is separate from Capacitor. From this folder:

```bash
npm install
npm run platform:add:android
npm run requirements
```

Build Angular from `../../client`, then copy the contents of `dist/client/browser/` to this wrapper's `www/` (preserve or restore `js/api-config.js`). Do not copy Capacitor native projects or generated `platforms/` files.

Before using API requests, replace `https://api.example.invalid/api` in `www/js/api-config.js` with a reachable HTTPS API base URL. Update `config.xml` and the Content Security Policy `connect-src`/`access` entries to allow the actual API origin. Cordova plugins must be selected and verified separately.

Run `npm run run:android` only after Android SDK requirements pass. Use `npm run platform:add:ios` and `npm run run:ios` on macOS with Xcode. No native platform is pre-generated or claimed tested here.
