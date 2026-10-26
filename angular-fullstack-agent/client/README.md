# Angular client

Angular 22 standalone, server-rendered client for Daymark Tasks. Bootstrap 5 CSS is loaded globally, UI state uses Signals, and HTTP requests go through the typed `TaskService`. The task screen supports create, complete/reopen, delete, and all/to-do/done filters.

The **Signals, in three steps** panel below the task list is a small interactive learning example. Its standalone component compares a `BehaviorSubject` plus `map`/`next` pattern with `signal`/`computed`/`update`; the `effect` logs count changes in the browser console.

From this directory:

```bash
npm install
npm start
npm run build
npm run serve:ssr
npm test
```

The Angular dev server runs at `http://localhost:4200` and proxies `/api` to `http://localhost:3000`. `npm run build` creates both browser and server bundles; after building, `npm run serve:ssr` serves the SSR app at `http://localhost:4000` by default. The initial server render avoids calling the browser-only task API; the browser loads tasks after hydration. Configure `src/environments/environment.ts` with a reachable API base URL before building for a physical mobile device. The Angular application builder emits web assets to `dist/client/browser`; Capacitor is configured to use that directory.
