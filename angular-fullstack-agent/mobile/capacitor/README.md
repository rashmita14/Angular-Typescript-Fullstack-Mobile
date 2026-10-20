# Capacitor integration

The Angular project includes `client/capacitor.config.ts` with `webDir: dist/client/browser`, matching the Angular application builder output. From `client/`:

```bash
npm install
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

Add only the platform(s) with a matching native toolchain. Android requires Android Studio/SDK; iOS requires macOS and Xcode. Native project generation/builds are not part of the web build.

The browser environment defaults to `/api` and the Angular dev server proxies that path to `http://localhost:3000`. Before a device build, set `apiUrl` in `client/src/environments/environment.ts` to a reachable development/staging API URL (not `localhost`, which means the device itself) and rebuild. Use HTTPS in production. Add native plugins only when needed and check platform permissions.
