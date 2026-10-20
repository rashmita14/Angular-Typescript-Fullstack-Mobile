# Task API

Express 5, TypeScript, Mongoose, and Zod REST API. MongoDB is accessed only by this server.

```bash
cp .env.example .env
npm install
npm run dev
```

The API listens on port `3000` by default. Set `MONGODB_URI`, `PORT`, and comma-separated allowed browser origins in `CLIENT_ORIGIN`. Do not commit `.env` or production credentials.

| Method | Route | Behavior |
| --- | --- | --- |
| GET | `/api/health` | API/database readiness |
| GET | `/api/tasks` | List tasks, newest first |
| POST | `/api/tasks` | Create `{ "title": "..." }` |
| PATCH | `/api/tasks/:id` | Update `title` and/or `completed` |
| DELETE | `/api/tasks/:id` | Delete a task |

Task titles are trimmed and limited to 160 characters. Invalid bodies and ObjectIds return `400`, missing tasks return `404`, and API errors use centralized JSON handling.

Checks: `npm run typecheck`, `npm test`, and `npm run build`.
