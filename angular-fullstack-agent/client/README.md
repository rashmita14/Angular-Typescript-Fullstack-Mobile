# Angular client

Angular 22 standalone, server-rendered client for Daymark Tasks. Bootstrap 5 CSS is loaded globally, UI state uses Signals, and HTTP requests go through the typed `TaskService`. The task screen supports create, complete/reopen, delete, and all/to-do/done filters.

The **Signals, in three steps** panel below the task list is a small interactive learning example. Its standalone component compares a `BehaviorSubject` plus `map`/`next` pattern with `signal`/`computed`/`update`; the `effect` logs count changes in the browser console.

The same panel explains `OnPush` change detection and zoneless scheduling. The demo component uses `ChangeDetectionStrategy.OnPush`; Angular 22 is zoneless by default. `provideZonelessChangeDetection()` was the explicit opt-in for Angular 20.2 and is optional in Angular 21+.

## HTTP and REST integration

- `openapi.yaml` is the API contract. Regenerate the checked-in types in `src/app/api/generated/` after changing the contract with `npm run api:types`. `TaskService` consumes those generated types while using Angular `HttpClient`.
- Functional interceptors are registered with `withInterceptors` in `src/app/app.config.ts`: a per-request correlation ID, optional in-memory bearer token, transient GET retries (up to two retries for network/5xx errors), and centralized `HttpErrorResponse` mapping. Mutations are never retried automatically.
- The task list uses `switchMap` so a refresh cancels the previous in-flight GET. `TaskService` shares completed GET results with `shareReplay` and invalidates the cache after successful mutations or explicit refresh.
- The Signals panel uses `httpResource` for a typed, signal-based `/api/health` request. `httpResource` is a public Angular 22 API (not experimental in this project); it is deliberately not used for mutations.
- `AuthTokenStore` is the integration point for a future login flow. It stores a token only in memory and attaches nothing until a real authentication flow sets it; this demo has no login or token issuer.
- Interceptor errors become `ApiError` values with safe user-facing messages and a correlation reference. Unhandled application errors go through the global Angular `ErrorHandler` and the dismissible app-level notification.
- GET requests are retried at most twice on network and 5xx failures with a short backoff; POST/PATCH/DELETE are not automatically retried to avoid duplicating writes.

From this directory:

```bash
npm install
npm start
npm run build
npm run serve:ssr
npm test
npm run api:types
```

The Angular dev server runs at `http://localhost:4200` and proxies `/api` to `http://localhost:3000`. `npm run build` creates both browser and server bundles; after building, `npm run serve:ssr` serves the SSR app at `http://localhost:4000` by default. The initial server render avoids browser-only task and health requests; the browser loads them after hydration. Configure `src/environments/environment.ts` with a reachable API base URL before building for a physical mobile device. The Angular application builder emits web assets to `dist/client/browser`; Capacitor is configured to use that directory.
