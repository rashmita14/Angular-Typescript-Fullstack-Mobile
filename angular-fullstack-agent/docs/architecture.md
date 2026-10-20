# Architecture notes

```text
Angular 22 standalone UI (TypeScript + Signals)
          | HTTP/JSON (/api)
          v
Node.js + Express 5 API (Zod validation)
          | Mongoose
          v
MongoDB 8

Mobile options:
- Capacitor: recommended wrapper around the built Angular web assets.
- Cordova: separate wrapper and plugin ecosystem; requires a compatible web bundle under www/.
```

Keep the UI, API, and persistence layers separate. Validate on the API even if the client also validates. Use Signals for component/view state and computed values, not as a replacement for server persistence or all RxJS streams. The Angular dev proxy forwards `/api` to port 3000; mobile builds must use an API URL reachable from the device.
