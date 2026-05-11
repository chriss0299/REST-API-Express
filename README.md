# SocialPlace — Mini JSONPlaceholder

A simplified, educational social platform inspired by [JSONPlaceholder](https://jsonplaceholder.typicode.com/), built to teach REST API design, MySQL, authentication, and modern frontend development. The project is written in Italian (field names, error messages, documentation).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js (ES Modules) |
| Backend | Express 4 |
| Frontend | Nuxt 4 + Quasar UI + Pinia |
| Database | MySQL 8 (via Docker) |
| DB Driver | mysql2/promise — raw SQL, no ORM |
| Auth | bcrypt + jsonwebtoken (fully wired) |
| Serving | nginx (static SPA via `nuxt generate`) |
| Package Manager | npm |

## Folder Structure

```
mini-jsonplaceholder/
├── docker-compose.yml          # 4 services: mysql, phpmyadmin, api, web
├── docs/
│   ├── guida-setup-mysql.md    # Step-by-step Docker/DB setup guide
│   ├── cheatsheet-sql.md       # SQL reference for the project
│   ├── spiegazione-migrazione.md  # Array-to-MySQL migration explained
│   ├── esercizi.md             # 7 progressive exercises (⭐ to ⭐⭐⭐)
│   └── esercizioparte2.md      # 8 auth & security exercises (bcrypt, JWT, roles)
├── api/                        # Express REST API
│   ├── server.js               # Entry — helmet, CORS, rate-limit, routes, :3000
│   ├── .env.example            # DB/JWT credentials template
│   ├── database/
│   │   ├── connessione.js      # mysql2 connection pool
│   │   ├── schema.sql          # CREATE TABLE (auto-run by Docker)
│   │   ├── seed.sql            # Seed data (auto-run by Docker)
│   │   └── queries/            # Async SQL functions per entity
│   └── routes/
│       ├── utenti.js           # /api/utenti — CRUD
│       ├── post.js             # /api/post — CRUD
│       ├── commenti.js         # /api/commenti — CRUD
│       └── auth.js             # /api/auth — login, registrazione, refresh, logout
└── web/                        # Nuxt 4 + Quasar UI frontend
    ├── Dockerfile              # nuxt generate → nginx:alpine
    ├── nginx.conf              # SPA routing
    ├── nuxt.config.ts
    └── app/
        ├── app.vue             # Root layout (drawers, LoginDialog)
        ├── pages/              # File-based routing
        ├── components/         # Quasar + custom components
        ├── stores/             # Pinia state (auth, utenti, post, commenti)
        ├── composables/        # useApi, useAuth, useToast, ...
        └── plugins/            # auth.client.ts — restores session on load
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) with Docker Compose

### Start everything with Docker

```bash
# From the project root — builds and starts all 4 services
docker compose up --build -d
```

On first run, Docker automatically runs `schema.sql` and `seed.sql`.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| REST API | http://localhost:3000 |
| phpMyAdmin | http://localhost:8081 |

### Test login

```
Email:    mario@email.com
Password: password123
```

### Reset data

```bash
docker compose down -v && docker compose up -d
```

### Development mode (outside Docker)

```bash
# Terminal 1 — API
cd api
cp .env.example .env   # fill in DB credentials and JWT_SECRET
npm install
npm run dev            # :3000, auto-restarts on changes

# Terminal 2 — Frontend
cd web
npm install
npm run dev            # :8080, hot-reload
```

## API Endpoints

All field names and responses are in Italian.

### Users — `/api/utenti`

**Fields:** `id`, `nome`, `email`, `citta`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/utenti` | List all. Filter: `?citta=Roma` |
| GET | `/api/utenti/:id` | Get one |
| POST | `/api/utenti` | Create — required: `nome`, `email`; optional: `citta` |
| PUT | `/api/utenti/:id` | Full update — required: `nome`, `email` |
| PATCH | `/api/utenti/:id` | Partial update |
| DELETE | `/api/utenti/:id` | Delete (cascades to posts and comments) |

### Posts — `/api/post`

**Fields:** `id`, `userId`, `titolo`, `corpo`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/post` | List all. Filter: `?userId=1` |
| GET | `/api/post/:id` | Get one |
| POST | `/api/post` | Create — required: `userId`, `titolo`, `corpo` |
| PUT | `/api/post/:id` | Full update |
| PATCH | `/api/post/:id` | Partial update |
| DELETE | `/api/post/:id` | Delete (cascades to comments) |

### Comments — `/api/commenti`

**Fields:** `id`, `postId`, `nome`, `email`, `corpo`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/commenti` | List all. Filter: `?postId=4` |
| GET | `/api/commenti/:id` | Get one |
| POST | `/api/commenti` | Create — required: `postId`, `nome`, `email`, `corpo` |
| PUT | `/api/commenti/:id` | Full update |
| PATCH | `/api/commenti/:id` | Partial update |
| DELETE | `/api/commenti/:id` | Delete |

### Auth — `/api/auth`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/registrazione` | Register — required: `nome`, `email`, `password` (≥8 chars) |
| POST | `/api/auth/login` | Login — returns `accessToken` + `refreshToken` · **rate limit: 5/15 min** |
| POST | `/api/auth/refresh` | Get new access token — body: `{ refreshToken }` |
| POST | `/api/auth/logout` | Invalidate refresh token — body: `{ refreshToken }` |

### Response conventions

```jsonc
// Validation or not-found error
{ "errore": "descrizione del problema" }

// Successful DELETE
{ "messaggio": "risorsa eliminata", "risorsa": { /* deleted object */ } }

// Login success
{ "accessToken": "...", "refreshToken": "...", "utente": { "id", "nome", "email", "ruolo" } }
```

| Scenario | HTTP Status |
|----------|-------------|
| Created | `201` |
| Validation error | `400` |
| Not found | `404` |
| Unauthorized | `401` |
| Conflict (email exists) | `409` |
| Too many login attempts | `429` |
| Database error | `500` |

## Architecture

### Backend

```
routes/*.js              → validate input, call query functions, return JSON
  └─ database/queries/   → parameterized SQL (? placeholders, no SQL injection)
       └─ connessione.js → mysql2 pool (.env credentials)
```

- All queries use `?` placeholders
- Handlers are `async/await` with `try/catch`
- Foreign keys use `ON DELETE CASCADE`
- Login is rate-limited (express-rate-limit): 5 attempts per 15 minutes
- Passwords hashed with bcrypt (cost factor 10)
- JWTs signed with `JWT_SECRET` env var; refresh tokens stored in `refresh_token` table (7-day expiry)

### Frontend (Nuxt 4)

```
app/plugins/auth.client.ts   → restore session from localStorage on startup
app/stores/auth.ts           → Pinia store: utente, accessToken, refreshToken
app/composables/useApi.ts    → fetch wrapper hitting runtimeConfig.public.apiBase
app/pages/                   → file-based routes: /, /utenti, /post, /commenti
app/components/              → Quasar + custom UI components (pathPrefix: false)
```

- Static SPA built with `nuxt generate`, served by nginx
- `ssr: false` — fully client-side
- Dark theme with Quasar brand colors (purple/indigo palette)
