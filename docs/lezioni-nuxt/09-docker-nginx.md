# Lezione 9 — Docker, nginx e il deploy

## Panoramica dell'architettura Docker

Il `docker-compose.yml` avvia 4 container che comunicano tra loro in una rete privata:

```
Browser
  │
  ├── :8080 → [web] nginx     → serve la SPA Nuxt
  │              │
  │              └── (le chiamate API del browser vanno a :3000)
  │
  ├── :3000 → [api] Express   → REST API con Node.js
  │              │
  │              └── si connette a mysql:3306 (interno)
  │
  ├── :8081 → [phpmyadmin]    → interfaccia grafica MySQL
  │
  └── :3307 → [mysql]         → database (porta 3307 per non conflitti)
```

**Importante:** i container comunicano tra loro usando il **nome del servizio** come hostname, non `localhost`. Quindi l'API si connette al database con `host: mysql`, non `host: localhost`.

---

## Il Dockerfile del frontend (multi-stage build)

```dockerfile
# Stage 1: build SPA Nuxt
FROM node:22-alpine AS builder
WORKDIR /app

# Variabile per la URL dell'API (passata al build time)
ARG NUXT_PUBLIC_API_BASE=http://localhost:3000/api
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE

# Installa dipendenze
COPY package*.json ./
RUN npm ci

# Copia il codice sorgente e genera la SPA
COPY . .
RUN npm run generate    ← IMPORTANTE: generate, non build!

# Stage 2: serve con nginx (immagine molto più leggera)
FROM nginx:alpine AS runner
COPY --from=builder /app/.output/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Perché multi-stage?

Il stage 1 (`builder`) ha Node.js, npm, e tutto il codice sorgente. Pesa ~500MB. Il stage 2 (`runner`) ha solo nginx e i file statici generati. Pesa ~25MB.

Il Docker finale usa solo lo stage 2 — l'immagine finale è 20× più leggera e non contiene codice sorgente né Node.js.

### `npm ci` vs `npm install`

`npm ci` è come `npm install` ma:
- legge il `package-lock.json` e installa le versioni esatte
- non modifica mai il lockfile
- è più veloce nei CI/CD e Dockerfile perché non fa risoluzione delle versioni

---

## `nuxt generate` vs `nuxt build` (ripasso critico)

Questo è stato il primo grande problema del deployment.

```
nuxt build → .output/server/  → server Node.js (Nitro)
                                 richiede Node.js per girare
                                 NON produce index.html

nuxt generate → .output/public/ → file statici
                                   index.html + JS + CSS
                                   nginx può servirli direttamente
```

Con `ssr: false` e `nuxt build`, l'output è:
```
.output/public/_nuxt/   ← solo JS/CSS
                        ← NESSUN index.html
```

Nginx cercava `index.html`, non lo trovava, e mostrava la sua pagina default "Welcome to nginx!".

Con `nuxt generate`:
```
.output/public/
├── index.html          ← c'è!
├── utenti/index.html
├── post/index.html
└── _nuxt/...
```

---

## nginx.conf — configurazione del server web

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # FONDAMENTALE per le SPA dietro proxy
    absolute_redirect off;

    # Compressione gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript ...;

    # SPA routing — tutte le route tornano a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache aggressiva per gli asset statici
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### `try_files $uri $uri/ /index.html`

Questa è la chiave delle SPA con nginx. Funziona così:

1. Prova a trovare il file esatto (`/utenti/5` → cerca `utenti/5`)
2. Prova come cartella (`/utenti/` → cerca `utenti/index.html`)
3. Se non trova nulla, serve sempre `/index.html`

Così l'app Nuxt nel browser gestisce il routing, e nginx non restituisce 404 per route dinamiche come `/utenti/42`.

### `absolute_redirect off` — il problema del proxy

Questo è stato il secondo grande problema del deployment.

**Scenario:**
- nginx gira nel container sulla porta 80
- Docker espone la porta 80 del container come 8080 sull'host
- l'utente naviga a `http://localhost:8080/utenti`

Senza `absolute_redirect off`:
```
GET /utenti (senza slash finale)
  → nginx vuole fare redirect a /utenti/
  → genera: 301 Location: http://localhost/utenti/
  ← il browser riceve: redirect a http://localhost/utenti/
  ← errore! porta 80 (chiusa) invece di 8080
```

Con `absolute_redirect off`:
```
GET /utenti
  → nginx genera: 301 Location: /utenti/   (path relativo)
  ← il browser interpreta come: http://localhost:8080/utenti/
  ← funziona!
```

---

## docker-compose.yml — le variabili d'ambiente

```yaml
api:
  environment:
    DB_HOST: mysql          # nome del servizio, NON localhost
    DB_PORT: 3306
    DB_USER: studente
    DB_PASSWORD: password123
    DB_NAME: mini_jsonplaceholder
    CORS_ORIGIN: http://localhost:8080
    JWT_SECRET: supersecretkey_cambiami_in_produzione
    JWT_EXPIRES_IN: 15m
```

**Il problema dei JWT:** `JWT_SECRET` e `JWT_EXPIRES_IN` mancavano nella configurazione iniziale. Quando `routes/auth.js` chiamava:

```js
jwt.sign({ id, email, ruolo }, process.env.JWT_SECRET, ...)
```

`process.env.JWT_SECRET` era `undefined` → `jwt.sign` lanciava un'eccezione → Express catturava il `try/catch` → rispondeva con 500.

La soluzione era semplicemente aggiungere le variabili al `docker-compose.yml`.

---

## `.dockerignore` — cosa non copiare

```
# api/.dockerignore
node_modules    ← non copiare, npm ci li installa nel container
.env            ← NON copiare credenziali! vengono da docker-compose env
*.log

# web/.dockerignore
node_modules
.output         ← non serve, viene generato nel container
*.log
```

Senza `.dockerignore`, `COPY . .` copierebbe tutti i `node_modules` (~200MB) nell'immagine, rallentando enormemente il build.

---

## Comandi Docker utili

```bash
# Avvia tutto (build se necessario)
docker compose up --build -d

# Vedi i log in tempo reale
docker compose logs -f api
docker compose logs -f web

# Riavvia solo l'API (resetta il rate limiter del login)
docker compose restart api

# Ricostruisce solo il frontend (dopo modifiche al codice)
docker compose up --build web

# Ferma tutto e cancella i volumi (reset database)
docker compose down -v

# Entra nel container dell'API per debug
docker exec -it mini-jsonplaceholder-api sh
```

---

## Riepilogo dei problemi risolti

| Problema | Causa | Soluzione |
|----------|-------|-----------|
| Pagina "Welcome to nginx!" | `nuxt build` invece di `nuxt generate` | Usato `npm run generate` nel Dockerfile |
| Redirect a `http://localhost/` (porta 80) | nginx genera redirect assoluti | `absolute_redirect off` in nginx.conf |
| Componenti non renderizzati | `pathPrefix: true` (default Nuxt 4) | `pathPrefix: false` in nuxt.config.ts |
| Login 500 | `JWT_SECRET` mancante in docker-compose | Aggiunto alle env vars dell'API |
| Login 429 | Rate limiter scattato | `docker compose restart api` |

**Prossima lezione:** flusso completo di una richiesta, dall'utente all'API e ritorno.
