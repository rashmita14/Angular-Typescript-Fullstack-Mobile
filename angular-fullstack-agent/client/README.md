# Angular client

Angular 22 standalone client for Daymark Tasks. UI state uses Signals, and HTTP requests go through the typed `TaskService`. The task screen supports create, complete/reopen, delete, and all/to-do/done filters.

From this directory:

```bash
npm install
npm start
npm run build
npm test
```

The dev server runs at `http://localhost:4200` and proxies `/api` to `http://localhost:3000`. Configure `src/environments/environment.ts` with a reachable API base URL before building for a physical mobile device. The Angular application builder emits web assets to `dist/client/browser`; Capacitor is configured to use that directory.
