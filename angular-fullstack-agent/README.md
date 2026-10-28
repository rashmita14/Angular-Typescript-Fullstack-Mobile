# Daymark — Angular full-stack and mobile demo

A working task manager demo built with Angular 22.2.3 SSR, standalone components, TypeScript, Signals, Bootstrap 5, Express 5.3.0, MongoDB, Capacitor 8.5.3, and a separate Cordova wrapper.

## Prerequisites

- Node.js 24 LTS and npm
- Docker Desktop / Docker Engine for local MongoDB
- Android Studio + Android SDK for Android native builds
- macOS + Xcode for iOS native builds

## Start locally

Run the database from this directory:

```bash
docker compose up -d mongo
```

In terminal 1, start the API:

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

In terminal 2, start the Angular UI:

```bash
cd client
npm install
npm start
```

Open `http://localhost:4200`. Angular's dev server proxies `/api` to the API on `http://localhost:3000`. The API connects to `mongodb://127.0.0.1:27017/angular_demo`. Keep `.env` local; change `MONGODB_URI`, `PORT`, or `CLIENT_ORIGIN` there as needed.

If host port `27017` is already occupied, start Compose with `MONGO_PORT=27018 docker compose up -d mongo` and set the server's `MONGODB_URI` to `mongodb://127.0.0.1:27018/angular_demo`.

## API

All task data is stored in MongoDB by the server; the browser never connects to the database.

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Readiness, including MongoDB connection state |
| GET | `/api/tasks` | List tasks newest first |
| POST | `/api/tasks` | Create a task: `{ "title": "Plan the week" }` |
| PATCH | `/api/tasks/:id` | Update `title` and/or `completed` |
| DELETE | `/api/tasks/:id` | Delete a task |

Request bodies and task IDs are validated server-side. Task titles are trimmed and limited to 160 characters. `CLIENT_ORIGIN` accepts a comma-separated allowlist; the default `.env.example` permits the local Angular dev server.

## Architecture

- `client/` — Angular 22 standalone UI, Signals-based task state, typed `HttpClient` service, responsive accessible task CRUD.
- `server/` — Express + TypeScript routes/controllers, Zod validation, centralized errors, Mongoose Task model.
- `docker-compose.yml` — loopback-bound MongoDB 8 service with persistent local volume.
- `mobile/capacitor/` — Capacitor setup notes; config is in `client/capacitor.config.ts`.
- `mobile/cordova/` — separate Cordova starter with `deviceready` and a reserved API URL placeholder.

The client imports Bootstrap 5 CSS globally. Its Angular SSR server renders each request on Node; task loading is deferred to the browser so server-side rendering does not call the browser-relative `/api` URL. `angular.json` allows the local SSR hosts `localhost` and `127.0.0.1`; update `security.allowedHosts` for your deployment hostnames.

The client HTTP layer uses an OpenAPI contract to generate API types, functional interceptors for optional auth/correlation/retry/error mapping, `switchMap` to cancel superseded task reads, `shareReplay` for GET caching, and `httpResource` for a typed health check. See [client/README.md](./client/README.md#http-and-rest-integration) for details.

## Checks

Run the checks from the matching package directory:

```bash
cd client
npm run api:types
npm run build
npm test -- --watch=false

cd ../server
npm run typecheck
npm test
npm run build
```

The build produces browser files in `client/dist/client/browser` and the SSR server at `client/dist/client/server/server.mjs`. `npm run serve:ssr` serves the built SSR app on port 4000 by default. `npm start` runs the Angular development server with SSR enabled.

To verify SSR locally after building, run `npm run serve:ssr` from `client/`, then request `http://localhost:4000/` in a browser or with `curl`. Stop the server with Ctrl+C.

See the current implementation's recorded check results below.

## Mobile builds

### Capacitor

The Angular build output is `client/dist/client/browser`, and `client/capacitor.config.ts` uses that exact `webDir`.

```bash
cd client
npm install
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

Add only platforms with the native toolchain installed. For a physical device, change `client/src/environments/environment.ts` from `/api` to a reachable API URL before building; `localhost` on a device points to the device itself. Use HTTPS outside local development.

### Cordova

The separate Cordova project is under `mobile/cordova/`; its starter `www/` directory is intentionally not a copy of the Angular output. Run `npm install` there to use its local Cordova CLI, then `npm run platform:add:android` or `npm run platform:add:ios`. Build Angular, copy the contents of `client/dist/client/browser/` to Cordova's `www/`, and preserve/restore `www/js/api-config.js`. Replace its `https://api.example.invalid/api` placeholder and update `config.xml` plus CSP `connect-src`/`access` for the chosen API origin. Cordova plugins and native platform requirements must be managed separately from Capacitor.

Capacitor native packages are `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, and `@capacitor/ios`. No native platform build is claimed unless run locally with the matching SDKs.

### Bootstrap

Bootstrap 5 is installed in `client/` and its CSS is loaded before the app's custom stylesheet from `angular.json`. Use Bootstrap classes/utilities in Angular templates as needed; no jQuery dependency is used.

## Implementation check results

- `cd client && npm run build` — passed; output verified at `dist/client/browser/`.
- `cd client && npm test -- --watch=false` — passed, 2 tests (initial client checks).
- `cd server && npm run typecheck` — passed.
- `cd server && npm test` — passed, 9 tests.
- `cd server && npm run build` — passed.
- API smoke test against local MongoDB on port `27017` using an isolated temporary database — health, create, update/complete, delete, and invalid-create `400` response passed; the smoke database was dropped afterward.
- `cd client && npx cap --version` and `npx cap config --json` — Capacitor `8.5.3`; resolved `webDir` is `dist/client/browser`.
- `cd client && npm run build` — passed; generated browser and SSR server bundles.
- `cd client && npm test -- --watch=false` — passed, 3 tests (SSR and Signals lesson checks).
- HTTP integration checks — `npm run api:types` passed; `npm test -- --watch=false` passed all 10 tests, covering correlation/auth headers, error mapping, bounded GET retry, mutation non-retry, refresh cancellation, request unsubscription, and GET cache invalidation.
- SSR smoke test — started the built SSR server at port 4301 and confirmed the task page renders while the health `httpResource` remains deferred to browser hydration.
- `cd client && npx cap --version` — Capacitor CLI 8.5.3; browser web directory resolves to `dist/client/browser`.
- `cd mobile/cordova && npm run cordova -- --version` — local Cordova CLI 13.0.0; `platform ls` confirms CLI setup, with no native platforms generated.
- `npm audit --omit=dev` in both `client/` and `mobile/cordova/` — 0 vulnerabilities. Full client audit currently reports 1 low, 4 moderate, and 1 high advisory in development/build dependencies (`@angular/build`, Vite, Capacitor CLI, and OpenAPI generator dependency chain); production dependencies are clean.
- `docker compose up -d mongo` — default host port was occupied by a local MongoDB process; `MONGO_PORT=27018 docker compose up -d mongo` — passed, MongoDB ping succeeded, and the temporary container was stopped afterward. The API CRUD smoke test used the existing local service and a separate temporary database.

No Capacitor or Cordova native platform was generated or built; Android Studio/SDK and Xcode builds were not run.
