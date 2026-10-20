# Daymark — Angular full-stack and mobile demo

A working task manager demo built with Angular 22.2.3, standalone components, TypeScript, Signals, Express 5.3.0, MongoDB, and optional Capacitor 8.5.3/Cordova shells.

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

## Checks

Run the checks from the matching package directory:

```bash
cd client
npm run build
npm test -- --watch=false

cd ../server
npm run typecheck
npm test
npm run build
```

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

The separate Cordova project is under `mobile/cordova/`; its starter `www/` directory is intentionally not a copy of the Angular output. Install Cordova CLI, add a desired Cordova platform, build Angular, copy the contents of `client/dist/client/browser/` to Cordova's `www/`, and preserve/restore `www/js/api-config.js`. Replace its `https://api.example.invalid/api` placeholder and update `config.xml` plus CSP `connect-src`/`access` for the chosen API origin. Cordova plugins and native platform requirements must be managed separately from Capacitor.

No native platform build is claimed unless run locally with the matching SDKs.

## Implementation check results

- `cd client && npm run build` — passed; output verified at `dist/client/browser/`.
- `cd client && npm test -- --watch=false` — passed, 2 tests.
- `cd server && npm run typecheck` — passed.
- `cd server && npm test` — passed, 9 tests.
- `cd server && npm run build` — passed.
- API smoke test against local MongoDB on port `27017` using an isolated temporary database — health, create, update/complete, delete, and invalid-create `400` response passed; the smoke database was dropped afterward.
- `cd client && npx cap --version` and `npx cap config --json` — Capacitor `8.5.3`; resolved `webDir` is `dist/client/browser`.
- `cd client && npm audit --omit=dev` — 0 vulnerabilities. Full `npm audit` reports 3 moderate development-tool advisories through Capacitor CLI's `xcode`/`uuid` dependency chain; npm reported no available fix.
- `docker compose up -d mongo` — default host port was occupied by a local MongoDB process; `MONGO_PORT=27018 docker compose up -d mongo` — passed, MongoDB ping succeeded, and the temporary container was stopped afterward. The API CRUD smoke test used the existing local service and a separate temporary database.

No Capacitor or Cordova native platform was generated or built; Android Studio/SDK and Xcode builds were not run.
