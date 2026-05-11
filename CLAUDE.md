# Mini JSONPlaceholder — SocialPlace

Educational monorepo — a simplified Italian social platform for teaching backend/REST API concepts and modern frontend development to students.

## Stack

- **Runtime:** Node.js (ES Modules)
- **Backend:** Express 4 (in `api/`)
- **Frontend:** Nuxt 4 + Quasar UI + Pinia (in `web/`)
- **Database:** MySQL 8 via Docker
- **DB driver:** mysql2/promise (raw SQL, no ORM)
- **Auth:** bcrypt (password hashing) + jsonwebtoken (JWT) — fully wired up
- **Package manager:** npm

## Monorepo structure

```
mini-jsonplaceholder/
├── CLAUDE.md
├── .gitignore
├── docker-compose.yml             # 4 services: mysql, phpmyadmin, api, web
├── docs/
│   ├── guida-setup-mysql.md
│   ├── cheatsheet-sql.md
│   ├── spiegazione-migrazione.md
│   ├── esercizi.md                # Exercises 1–7 (⭐–⭐⭐⭐)
│   └── esercizioparte2.md         # Exercises 8–15 (auth & security)
├── api/                           # Backend — Express REST API
│   ├── .env.example
│   ├── .env                       # gitignored
│   ├── .dockerignore
│   ├── server.js                  # Entry point — helmet, cors, rate-limit, routes, :3000
│   ├── scripts/
│   │   └── genera-hash.js         # bcrypt hash generator for seed passwords
│   ├── data/
│   │   └── database.vecchio.js    # Old in-memory DB (reference for students)
│   ├── database/
│   │   ├── connessione.js         # mysql2 connection pool
│   │   ├── schema.sql             # CREATE TABLE (auto-run by Docker)
│   │   ├── seed.sql               # INSERT seed data (auto-run by Docker)
│   │   └── queries/
│   │       ├── utenti.js
│   │       ├── post.js
│   │       ├── commenti.js
│   │       └── refreshToken.js    # salvaRefreshToken, trovaRefreshToken, eliminaRefreshToken
│   ├── routes/
│   │   ├── utenti.js
│   │   ├── post.js
│   │   ├── commenti.js
│   │   └── auth.js                # /registrazione, /login, /refresh, /logout
│   └── package.json
└── web/                           # Frontend — Nuxt 4 + Quasar UI
    ├── Dockerfile                 # Multi-stage: nuxt generate → nginx:alpine
    ├── nginx.conf                 # SPA routing + absolute_redirect off
    ├── nuxt.config.ts
    ├── package.json
    ├── .dockerignore
    └── app/                       # Nuxt 4 app directory (compatibilityVersion: 4)
        ├── app.vue                # Root: q-layout with left/right drawers + LoginDialog
        ├── error.vue
        ├── pages/
        │   ├── index.vue
        │   ├── utenti/index.vue
        │   ├── post/index.vue
        │   └── commenti/index.vue
        ├── components/            # pathPrefix: false — no subdirectory prefix in template
        │   ├── auth/LoginDialog.vue
        │   ├── layout/AppNavbar.vue, AppSidebar.vue, AppSidebarInfo.vue
        │   ├── ui/UserAvatar.vue, AppBreadcrumb.vue, ConfirmDialog.vue
        │   ├── utenti/UserCard.vue, UserGrid.vue, UserForm.vue
        │   ├── post/PostCard.vue, PostList.vue, PostForm.vue
        │   └── commenti/CommentoCard.vue, CommentoList.vue, CommentoForm.vue
        ├── stores/                # Pinia stores
        │   ├── auth.ts
        │   ├── utenti.ts, post.ts, commenti.ts
        │   └── statistiche.ts
        ├── composables/
        │   ├── useApi.ts          # fetch wrapper for all API calls
        │   ├── useAuth.ts, useToast.ts, useAvatar.ts, useConfirm.ts
        ├── plugins/
        │   └── auth.client.ts     # restores auth state from localStorage on startup
        └── types/
            └── index.ts
```

## Commands

```bash
# Full Docker stack (recommended — builds and starts all 4 services)
docker compose up --build -d   # first run or after code changes
docker compose up -d            # subsequent runs (no rebuild)
docker compose down             # stop all
docker compose down -v          # stop + delete DB data (re-seeds on next start)
docker compose restart api      # restart API only (e.g. to reset rate limiter)

# Development mode (run outside Docker)
cd api && npm install && npm run dev      # API on :3000 (node --watch)
cd web && npm install && npm run dev      # Frontend on :8080 (nuxt dev)

# Web build commands
cd web && npm run generate    # static output → .output/public (used by Docker)
cd web && npm run build       # Nitro server build (NOT used for Docker/nginx)
```

Services: API `:3000` · Frontend `:8080` · phpMyAdmin `:8081`

## API endpoints

All responses and field names are in Italian.

### Utenti (`/api/utenti`)
- Fields: `id`, `nome`, `email`, `citta`
- GET `/` — list all (filter: `?citta=Roma`)
- GET `/:id`
- POST `/` — required: `nome`, `email`; optional: `citta`
- PUT `/:id` — required: `nome`, `email`
- PATCH `/:id` — partial update
- DELETE `/:id` — cascades to post and commenti

### Post (`/api/post`)
- Fields: `id`, `userId`, `titolo`, `corpo`
- GET `/` — list all (filter: `?userId=1`)
- GET `/:id`
- POST `/` — required: `userId`, `titolo`, `corpo`
- PUT `/:id` — required: `userId`, `titolo`, `corpo`
- PATCH `/:id` — partial update
- DELETE `/:id` — cascades to commenti

### Commenti (`/api/commenti`)
- Fields: `id`, `postId`, `nome`, `email`, `corpo`
- GET `/` — list all (filter: `?postId=4`)
- GET `/:id`
- POST `/` — required: `postId`, `nome`, `email`, `corpo`
- PUT `/:id` — required: `postId`, `nome`, `email`, `corpo`
- PATCH `/:id` — partial update
- DELETE `/:id`

### Auth (`/api/auth`)
- POST `/registrazione` — required: `nome`, `email`, `password` (min 8 chars); optional: `citta` → returns `{ token, utente }`
- POST `/login` — required: `email`, `password` → returns `{ accessToken, refreshToken, utente }` — **rate limited: 5 attempts / 15 min**
- POST `/refresh` — required: `{ refreshToken }` → returns `{ accessToken }`
- POST `/logout` — required: `{ refreshToken }` → deletes refresh token

Seed test user: `mario@email.com` / `password123`

## Backend architecture

- **`server.js`** — helmet, cors (from `CORS_ORIGIN` env), express.json, rate-limiter on `/api/auth/login`, routes
- **`database/connessione.js`** — mysql2 pool from `.env` variables
- **`database/queries/*.js`** — async functions with parameterized `?` queries
- **`routes/auth.js`** — bcrypt.compare for login, jwt.sign with `JWT_SECRET` + `JWT_EXPIRES_IN` env vars, crypto.randomUUID for refresh tokens (7-day expiry)
- **`database/schema.sql`** + **`seed.sql`** — auto-executed by Docker via `/docker-entrypoint-initdb.d/`

## Frontend architecture (Nuxt 4)

- **`nuxt.config.ts`** — `compatibilityVersion: 4`, `ssr: false`, `pathPrefix: false` for components
- **`app/app.vue`** — `<q-layout>` with left sidebar (drawer), right info panel, `<NuxtPage />` in page-container, `<LoginDialog />` always mounted
- **`app/pages/`** — file-based routing via Nuxt; each page imports stores
- **`app/stores/`** — Pinia stores; `auth.ts` holds `{ utente, accessToken, refreshToken }`
- **`app/composables/useApi.ts`** — fetch wrapper using `useRuntimeConfig().public.apiBase`
- **`app/plugins/auth.client.ts`** — runs on client startup, restores auth from localStorage
- **Build for Docker:** `nuxt generate` → `.output/public/` (static SPA), served by nginx

## Docker / deployment notes

- `nuxt generate` (NOT `nuxt build`) produces the static `index.html` that nginx serves
- `nginx.conf` has `absolute_redirect off` — prevents nginx from dropping the proxy port in redirects
- `components: [{ path: '~/components', pathPrefix: false }]` in nuxt.config.ts — components in subdirectories are imported without the directory name prefix (e.g. `<UserCard>` not `<UtentiUserCard>`)
- `JWT_SECRET` and `JWT_EXPIRES_IN` must be in docker-compose.yml under the `api` service environment — without them jwt.sign throws and login returns 500
- Rate limiter resets on container restart: `docker compose restart api`

## Conventions

- Error responses: `{ "errore": "..." }`
- Successful DELETE: `{ "messaggio": "... eliminato", "<risorsa>": { ... } }`
- POST → `201`; validation error → `400`; not found → `404`; DB error → `500`
- IDs auto-generated by MySQL (AUTO_INCREMENT)
- MySQL column names match JSON field names — no aliasing
- Foreign keys: `post.userId → utenti.id`, `commenti.postId → post.id` (ON DELETE CASCADE)
- `refresh_token` table in schema.sql: `id`, `utenteId`, `token`, `scadenza`

## Documentation (docs/)

- `guida-setup-mysql.md` — Docker setup, DB verification, env configuration, troubleshooting
- `cheatsheet-sql.md` — SQL commands used in the project, parameterized queries
- `spiegazione-migrazione.md` — Array vs MySQL comparison, async/await, connection pools
- `esercizi.md` — 7 exercises: schema extension, CF validation, edit form, search, stats, timestamps, pagination
- `esercizioparte2.md` — 8 auth & security exercises (Es. 8–15): bcrypt, JWT, middleware, roles, frontend login, refresh tokens, hardening

## Key notes

- `api/data/database.vecchio.js` — old in-memory approach, kept for student comparison
- Data persists in MySQL Docker volume; to reset: `docker compose down -v && docker compose up -d`
- Project language (comments, field names, errors) is Italian
- CORS origin is set from `CORS_ORIGIN` env var (docker-compose sets it to `http://localhost:8080`)
