# DayTracking

Full-stack app: **React + Tailwind** (client) and **Node + Express + PostgreSQL** (server).

Users log in, create a group, and add people. Each person logs their end-of-day notes,
filed automatically by date, with filtering by date / person / text.

## Architecture

- **Client** ([client/](client/)) — React + Tailwind. All data access goes through one seam,
  [client/src/lib/store.js](client/src/lib/store.js), which calls the API with `fetch`. The auth
  token (JWT) is the only thing kept in the browser (localStorage key `dt:token`).
- **Server** ([server/](server/)) — Express + `pg` talking to Postgres (Neon). Real auth:
  bcrypt-hashed passwords + JWTs signed with `JWT_SECRET`. Routes live in
  [server/src/routes/](server/src/routes/) (`auth`, `groups`, `notes`, `dev`).

### Data model

`users`, `groups`, `group_members`, `notes` — see [server/src/schema.sql](server/src/schema.sql).
Notes carry a `note_date` (the day they're filed under) separate from `created_at`.

## Getting started

### Server

```bash
cd server
cp .env.example .env        # fill in DATABASE_URL and JWT_SECRET
npm run migrate             # create tables (idempotent)
npm run seed                # optional: load demo data
npm run dev                 # http://localhost:5000
```

`.env` keys:
- `DATABASE_URL` — Postgres connection string (Neon's pooled string, `sslmode=require`).
- `JWT_SECRET` — random string for signing login tokens (`openssl rand -hex 32`).
- `ALLOW_DEV_SEED` — `true` enables `POST /api/dev/seed` (the in-app "Load demo data" button).

### Client

```bash
cd client
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`.

## Demo data

Click **Load demo data** on the login screen (or run `npm run seed` in `server/`). It creates 3
groups — **Engineering Team** (10 people), **Design Squad**, **Marketing** — each with its own
notes over the last few days. Every demo user shares the password `demo` (e.g. `alice`, `bob`,
`grace`, `olivia`). ⚠️ Seeding **wipes all existing data** first.

## Health check

`GET /api/health` reports `{ status, db }` — the client can ping it to confirm the DB is connected.
