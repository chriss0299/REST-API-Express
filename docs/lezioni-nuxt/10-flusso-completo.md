# Lezione 10 — Flusso completo: dall'utente all'API e ritorno

Questa lezione mette insieme tutto. Seguiamo due scenari reali del progetto passo per passo.

---

## Scenario 1: l'utente apre la pagina `/utenti`

### Passo 1 — il browser fa la richiesta

```
Utente digita: http://localhost:8080/utenti
Browser → GET /utenti → nginx (container web, porta 8080)
```

### Passo 2 — nginx serve l'HTML

nginx.conf:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Cerca `/utenti/index.html` → lo trova (è stato generato da `nuxt generate`) → lo serve.

### Passo 3 — il browser carica l'app

Il browser riceve `utenti/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/_nuxt/entry.css">
  <script type="module" src="/_nuxt/t9tA_05d.js"></script>
</head>
<body>
  <div id="__nuxt"></div>   ← qui Nuxt monterà l'app
</body>
</html>
```

Il browser scarica il JavaScript (`_nuxt/*.js`) e lo esegue.

### Passo 4 — Nuxt si inizializza

```
JavaScript eseguito nel browser:
1. Vue si inizializza
2. Il plugin auth.client.ts gira
   → legge localStorage
   → ripristina authStore se c'è una sessione
3. Il router di Nuxt legge la URL (/utenti)
4. Monta app.vue (layout principale)
5. app.vue renderizza: AppNavbar + drawers + <NuxtPage />
6. <NuxtPage /> carica pages/utenti/index.vue
```

### Passo 5 — la pagina carica i dati

```vue
<!-- pages/utenti/index.vue (semplificato) -->
<script setup>
const store = useUtentiStore()
onMounted(() => store.carica())
</script>
```

`store.carica()` chiama `useApi().getUtenti()`:

```ts
// composables/useApi.ts
const base = useRuntimeConfig().public.apiBase  // 'http://localhost:3000/api'
const risposta = await fetch(`${base}/utenti`)
```

### Passo 6 — la richiesta arriva all'API

```
Browser → GET http://localhost:3000/api/utenti → Express (container api, porta 3000)
```

`server.js` → `routes/utenti.js` → `queries/utenti.js`:

```js
// database/queries/utenti.js
export async function trovaUtenti(filtri = {}) {
  let sql = 'SELECT * FROM utenti'
  // ... gestione filtri
  const [righe] = await pool.query(sql)
  return righe
}
```

### Passo 7 — MySQL risponde

```
Express → MySQL (container mysql, host: 'mysql', porta 3306 interna)
MySQL esegue: SELECT * FROM utenti
Ritorna: array di oggetti
Express risponde: JSON array
```

### Passo 8 — i dati tornano al browser

```
Express → JSON response → Browser
useApi().getUtenti() → risolve con l'array
store.utenti.value = arrayDati       ← Pinia aggiorna lo state
Vue rileva il cambiamento → ri-renderizza il template
UserGrid renderizza UserCard per ogni utente
```

**Totale:** da URL digitata a utenti visualizzati.

---

## Scenario 2: l'utente fa login

### Passo 1 — apre LoginDialog

`LoginDialog.vue` è sempre montata in `app.vue`. L'utente clicca "Accedi" nella navbar → un evento (o uno state) apre il dialog.

### Passo 2 — compila il form e clicca "Login"

```vue
<!-- LoginDialog.vue -->
<script setup>
const email = ref('')
const password = ref('')

async function login() {
  await authStore.login(email.value, password.value)
}
</script>
```

### Passo 3 — lo store chiama l'API

```ts
// stores/auth.ts
async function login(email: string, password: string) {
  const risposta = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  // ...
}
```

### Passo 4 — Express processa il login

```js
// routes/auth.js
router.post('/login', async (req, res) => {
  // 1. Trova l'utente nel DB per email
  const utente = await trovaUtentePerEmail(email)

  // 2. Confronta la password con il hash bcrypt
  const valida = await bcrypt.compare(password, utente.password)
  //   password = "password123"
  //   utente.password = "$2b$10$/eqE..." (hash nel DB)
  //   bcrypt.compare ritorna true/false

  // 3. Genera l'access token JWT (scade in 15m)
  const accessToken = jwt.sign(
    { id: utente.id, email: utente.email, ruolo: utente.ruolo },
    process.env.JWT_SECRET,   ← DEVE essere definito in docker-compose!
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  // 4. Genera un refresh token (UUID casuale, scade in 7 giorni)
  const refreshToken = crypto.randomUUID()
  await salvaRefreshToken(utente.id, refreshToken, scadenza)

  // 5. Risponde
  res.json({ accessToken, refreshToken, utente: { id, nome, email, ruolo } })
})
```

### Passo 5 — lo store salva i dati

```ts
const dati = await risposta.json()

// Salva in Pinia (memoria)
authStore.utente = dati.utente
authStore.accessToken = dati.accessToken
authStore.refreshToken = dati.refreshToken

// Salva in localStorage (persiste dopo F5)
localStorage.setItem('auth', JSON.stringify(dati))
```

### Passo 6 — Vue aggiorna l'interfaccia

`authStore.utente` è reattivo → tutti i componenti che lo leggono si aggiornano automaticamente:

- `AppNavbar` → mostra il nome utente invece di "Accedi"
- `LoginDialog` → si chiude (controlla `authStore.isLoggato`)
- Bottoni "Elimina" → diventano visibili (se protetti da `v-if="authStore.isLoggato"`)

---

## Schema visivo del flusso

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  pages/utenti/index.vue                                     │
│     └── useUtentiStore().carica()                           │
│          └── useApi().getUtenti()                           │
│               └── fetch('http://localhost:3000/api/utenti') │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  CONTAINER: api (:3000)                     │
│                                                             │
│  Express → routes/utenti.js → queries/utenti.js             │
│     └── pool.query('SELECT * FROM utenti')                  │
└─────────────────────────┬───────────────────────────────────┘
                          │ TCP (interno Docker)
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                CONTAINER: mysql (:3306)                     │
│                                                             │
│  SELECT * FROM utenti → [{ id:1, nome:'Mario', ... }, ...]  │
└─────────────────────────────────────────────────────────────┘
```

---

## Cosa succede al ricaricamento della pagina (F5)

```
1. Browser ricarica
2. nginx serve index.html
3. JavaScript si ricarica
4. ⭐ auth.client.ts viene eseguito
   → legge localStorage
   → authStore.utente = { nome: 'Mario', ... }
5. app.vue monta
6. AppNavbar mostra già "Mario" (stato ripristinato prima del render)
7. La pagina carica i dati normalmente
```

Senza il plugin `auth.client.ts` al punto 4, l'utente vedrebbe la navbar con "Accedi" per un istante prima che Vue aggiornasse lo stato.

---

## Riepilogo: le responsabilità di ogni parte

| Parte | Responsabilità |
|-------|---------------|
| `nginx` | Serve i file statici, gestisce il routing SPA, proxy |
| `nuxt generate` | Produce i file statici da servire |
| `app.vue` | Layout principale, sempre presente |
| `pages/` | Una pagina per route, carica dati con store |
| `components/` | UI riutilizzabile, riceve dati via props |
| `stores/` | Stato globale, chiamate API, logica di business |
| `composables/` | Logica riutilizzabile (toast, confirm, fetch wrapper) |
| `plugins/` | Init una-tantum (ripristino auth da localStorage) |
| `Express/routes` | Valida input, chiama query, risponde JSON |
| `queries/` | SQL parametrizzato, no SQL injection |
| `MySQL` | Persistenza dei dati |

---

Questa è la lezione finale. Rileggila dopo aver esplorato il codice del progetto e tutto dovrebbe avere senso. Buono studio!
