# PRD — SocialPlace Frontend v2

## 1. Panoramica del progetto

### 1.1 Obiettivo della migrazione

Sostituire il frontend vanilla JS di **mini-jsonplaceholder** con una Single Page Application moderna basata su **Nuxt 4 + Quasar UI**, mantenendo la piena compatibilità con il backend Express.js esistente e migliorando la qualità del codice come esempio didattico per gli studenti.

### 1.2 Stack tecnologico

| Livello | Tecnologia | Motivo della scelta |
|---|---|---|
| Framework | Nuxt 4 (compatibilityVersion: 4), SPA mode | Auto-import, routing file-based, ecosistema Vue 3 |
| UI | Quasar v2 (`nuxt-quasar-ui`) | Component library completa, dark mode nativo, Material Design |
| State | Pinia + `@pinia/nuxt` | Standard Vue 3, devtools eccellenti, SSR-ready |
| HTTP | `fetch` nativo con wrapper `useApi` | Zero dipendenze aggiuntive, gestisce auth header + retry 401 |
| Container | Docker multi-stage (node:22-alpine → nginx:alpine) | Build ottimizzata, immagine finale leggera |

### 1.3 Vincoli e assunzioni

- Il backend Express.js su `api/` rimane **immutato**
- Il `docker-compose.yml` non viene modificato nella struttura dei servizi
- Il frontend gira sulla porta **8080** (dev e produzione)
- Le chiamate API provengono dal browser dell'utente → `NUXT_PUBLIC_API_BASE=http://localhost:3000/api`
- CORS backend configurato per `http://localhost:8080`

---

## 2. User Stories e criteri di accettazione

### US-01 — Navigazione tra sezioni
**Come** visitatore  
**Voglio** navigare tra Persone, Feed e Commenti tramite tab in navbar  
**In modo da** esplorare le diverse aree dell'applicazione

**Criteri di accettazione:**
- [ ] I tab mostrano la sezione corretta al click
- [ ] Il tab attivo ha indicatore visivo (viola)
- [ ] L'URL cambia alla navigazione
- [ ] Il refresh della pagina mantiene la sezione corretta

---

### US-02 — Lista Utenti con avatar
**Come** visitatore  
**Voglio** vedere la lista degli utenti come griglia di card con avatar personalizzato  
**In modo da** identificare visivamente le persone

**Criteri di accettazione:**
- [ ] Ogni card mostra avatar (iniziali + colore deterministico per ID), nome, email, città (se presente)
- [ ] La griglia è responsive (3 colonne → 1 su mobile)
- [ ] Uno spinner appare durante il caricamento
- [ ] Se nessun utente, appare un messaggio empty state

---

### US-03 — Ricerca utenti in tempo reale
**Come** visitatore  
**Voglio** filtrare gli utenti digitando nella barra di ricerca  
**In modo da** trovare rapidamente una persona specifica

**Criteri di accettazione:**
- [ ] La ricerca è client-side e si aggiorna a ogni carattere
- [ ] La ricerca è case-insensitive su nome ed email
- [ ] Se nessun risultato, appare "Nessun utente trovato per questa ricerca"
- [ ] Il bottone X pulisce la ricerca

---

### US-04 — Drill-down Utente → Post
**Come** visitatore  
**Voglio** cliccare su un utente per vedere solo i suoi post  
**In modo da** esplorare i contenuti di una persona specifica

**Criteri di accettazione:**
- [ ] Click su "Post" naviga a `/post?userId=X&nomeUtente=Nome`
- [ ] Il titolo mostra "Post di [Nome]"
- [ ] Breadcrumb "Persone → Post di [Nome]" con link funzionante
- [ ] Refresh della pagina carica i post corretti
- [ ] Il form post pre-compila `userId` se presente

---

### US-05 — Drill-down Post → Commenti
**Come** visitatore  
**Voglio** cliccare su un post per vedere i suoi commenti  
**In modo da** leggere la discussione relativa

**Criteri di accettazione:**
- [ ] Click su "Commenti" naviga a `/commenti?postId=X&titolPost=Titolo`
- [ ] Il titolo mostra "Commenti: [Titolo Post]"
- [ ] Breadcrumb "Feed → [Titolo Post]" con link funzionante
- [ ] Refresh della pagina carica i commenti corretti

---

### US-06 — Paginazione Feed (5 post/pagina)
**Come** visitatore  
**Voglio** navigare tra le pagine del feed  
**In modo da** non essere sopraffatto dai contenuti

**Criteri di accettazione:**
- [ ] 5 post per pagina
- [ ] Componente `QPagination` con numero pagina corrente e totale
- [ ] Il numero di pagina è nell'URL (`/post?pagina=2`)
- [ ] Refresh mantiene la pagina corretta
- [ ] Mostra "X post totali"

---

### US-07 — Login tramite dialog modale
**Come** visitatore  
**Voglio** vedere il popup di login all'apertura della pagina o cliccando "Accedi"  
**In modo da** autenticarmi facilmente senza cercare dove farlo

**Criteri di accettazione:**
- [ ] Dialog appare dopo 800ms se non loggato
- [ ] Click su "Accedi" in navbar apre il dialog
- [ ] Dialog ha 2 tab: Accedi e Registrati
- [ ] Login riuscito: dialog si chiude, toast "Benvenuto [Nome]!"
- [ ] Errore credenziali: toast rosso con messaggio
- [ ] Token salvato in localStorage, persiste al refresh

---

### US-07b — Dialog login contestuale
**Come** visitatore non loggato  
**Voglio** vedere il popup di login se provo a commentare o postare  
**In modo da** capire subito cosa devo fare per interagire

**Criteri di accettazione:**
- [ ] Submit del form post/commento senza login apre il dialog
- [ ] Il dialog mostra il motivo contestuale ("Devi accedere per pubblicare un commento")

---

### US-08 — Registrazione nuovo account
**Come** visitatore  
**Voglio** creare un account dalla tab "Registrati" del dialog  
**In modo da** poter interagire con la piattaforma

**Criteri di accettazione:**
- [ ] Form con nome, email, password (min 8 char), città (opzionale)
- [ ] Usa `POST /api/auth/registrazione`
- [ ] Dopo registrazione: login automatico + toast "Account creato!"

---

### US-09 — Logout
**Come** utente loggato  
**Voglio** effettuare il logout cliccando l'icona in navbar  
**In modo da** proteggere il mio account

**Criteri di accettazione:**
- [ ] Click logout → `POST /api/auth/logout` con refreshToken
- [ ] Token rimossi da localStorage
- [ ] UI aggiornata a stato non autenticato
- [ ] Toast "Logout effettuato"

---

### US-10 — CRUD Utenti (Admin View)
**Come** amministratore con Admin View attiva  
**Voglio** creare, modificare ed eliminare utenti tramite form  
**In modo da** gestire le anagrafiche della piattaforma

**Criteri di accettazione:**
- [ ] Form visibile solo con Admin View attiva
- [ ] Validazione: CF regex, email, sesso obbligatori
- [ ] Creazione: `POST /api/utenti` → appare in lista, statistiche aggiornate
- [ ] Modifica: form pre-compilato, `PUT /api/utenti/:id`
- [ ] Elimina: dialog di conferma, `DELETE /api/utenti/:id` (CASCADE)
- [ ] Campo Ruolo (utente/admin) visibile solo con Admin View

---

### US-11 — Pubblicare post e commenti
**Come** utente loggato  
**Voglio** pubblicare un post o un commento tramite form  
**In modo da** contribuire alla piattaforma

**Criteri di accettazione:**
- [ ] Form post: titolo + corpo (visibile se loggato)
- [ ] Form commento: nome/email pre-compilati dall'utente loggato
- [ ] In drill-down da utente: userId pre-compilato nel form post
- [ ] In drill-down da post: postId passato al form commento
- [ ] Dopo pubblicazione: aggiorna lista + statistiche

---

### US-12 — Eliminare propri contenuti (owner/admin)
**Come** autore di un post o commento  
**Voglio** eliminare i miei contenuti  
**In modo da** avere controllo su ciò che pubblico

**Criteri di accettazione:**
- [ ] Bottone Elimina visibile solo se `utente.id === post.userId` o admin con Admin View
- [ ] Dialog di conferma prima dell'eliminazione
- [ ] Eliminazione aggiorna lista e statistiche
- [ ] Toast di conferma

---

### US-13 — Statistiche in tempo reale
**Come** visitatore  
**Voglio** vedere il contatore di utenti, post e commenti nella sidebar  
**In modo da** avere una panoramica dell'attività

**Criteri di accettazione:**
- [ ] 3 contatori visibili nella sidebar sinistra
- [ ] Si aggiornano automaticamente dopo ogni operazione CRUD
- [ ] In caso di errore mantengono l'ultimo valore noto

---

### US-14 — Admin View Toggle
**Come** amministratore  
**Voglio** attivare/disattivare la modalità admin tramite switch in navbar  
**In modo da** passare in modalità gestione solo quando necessario

**Criteri di accettazione:**
- [ ] Switch `QToggle` visibile solo agli admin
- [ ] Default: OFF dopo login
- [ ] Attivazione: mostra form crea utente, bottoni elimina su risorse altrui, badge ruolo, banner sidebar
- [ ] Disattivazione: ripristina UI utente normale
- [ ] Stato persiste al refresh pagina (localStorage)

---

## 3. Architettura frontend

### 3.1 Struttura cartelle (`web/`)

```
web/
├── app/                    ← srcDir Nuxt 4
│   ├── assets/css/main.css
│   ├── components/
│   │   ├── auth/LoginDialog.vue
│   │   ├── layout/{AppNavbar,AppSidebar,AppSidebarInfo}.vue
│   │   ├── ui/{UserAvatar,AppBreadcrumb,ConfirmDialog}.vue
│   │   ├── utenti/{UserCard,UserGrid,UserForm}.vue
│   │   ├── post/{PostCard,PostList,PostForm}.vue
│   │   └── commenti/{CommentoCard,CommentoList,CommentoForm}.vue
│   ├── composables/{useApi,useAuth,useToast,useAvatar,useConfirm}.ts
│   ├── pages/{index,utenti/index,post/index,commenti/index}.vue
│   ├── stores/{auth,utenti,post,commenti,statistiche}.ts
│   ├── plugins/auth.client.ts
│   ├── types/index.ts
│   ├── app.vue
│   └── error.vue
├── nuxt.config.ts
├── Dockerfile
└── nginx.conf
```

### 3.2 Routing e drill-down

Drill-down via query params (non route annidate):

| URL | Contenuto |
|---|---|
| `/utenti` | Tutti gli utenti |
| `/post` | Feed completo |
| `/post?userId=3&nomeUtente=Mario` | Post dell'utente 3 |
| `/post?userId=3&pagina=2` | Pagina 2 dei post dell'utente 3 |
| `/commenti?postId=12&titolPost=Titolo` | Commenti del post 12 |

### 3.3 State management

| Store | Responsabilità |
|---|---|
| `auth` | Token JWT, utente loggato, dialog login, Admin View |
| `utenti` | Lista utenti, CRUD, filtro ricerca client-side |
| `post` | Lista post, paginazione, filtro userId |
| `commenti` | Lista commenti, filtro postId |
| `statistiche` | Conteggi globali, aggiornati dopo ogni CRUD |

### 3.4 Layer HTTP (`useApi`)

```
$api(path, options) →
  1. Legge accessToken da store auth
  2. Aggiunge Authorization: Bearer <token>
  3. fetch(apiBase + path, ...)
  4. Se 401 (primo tentativo): authStore.refresh() → riprova
  5. Se refresh fallisce: logout forzato + apri dialog login
  6. Se errore: throw Error(messaggio)
```

### 3.5 Flusso autenticazione

```
Apertura app
  └─ auth.client.ts: idrata da localStorage
      ├─ isLoggedIn → normale
      └─ !isLoggedIn → setTimeout 800ms → apriLoginDialog()

Azione protetta senza login
  └─ form check isLoggedIn
      └─ apriLoginDialog(motivo)

Login riuscito
  └─ accessToken + refreshToken salvati
  └─ dialog si chiude
  └─ toast "Benvenuto!"

401 durante richiesta
  └─ authStore.refresh()
      ├─ OK → riprova richiesta
      └─ FAIL → logout forzato → apriLoginDialog()
```

---

## 4. Integrazione API

### 4.1 Endpoint → Store → Componente

| Endpoint | Store | Componente |
|---|---|---|
| `GET /utenti` | `utenti.carica()` | `UserGrid` |
| `POST /utenti` | `utenti.crea()` | `UserForm` |
| `PUT /utenti/:id` | `utenti.aggiorna()` | `UserForm` |
| `DELETE /utenti/:id` | `utenti.elimina()` | `UserGrid` (via conferma) |
| `GET /post` | `post.carica()` | `PostList` |
| `POST /post` | `post.crea()` | `PostForm` |
| `DELETE /post/:id` | `post.elimina()` | `PostList` (via conferma) |
| `GET /commenti` | `commenti.carica()` | `CommentoList` |
| `POST /commenti` | `commenti.crea()` | `CommentoForm` |
| `DELETE /commenti/:id` | `commenti.elimina()` | `CommentoList` (via conferma) |
| `POST /auth/login` | `auth.login()` | `LoginDialog` |
| `POST /auth/registrazione` | `auth.registra()` | `LoginDialog` |
| `POST /auth/refresh` | `auth.refresh()` | `useApi` (automatico) |
| `POST /auth/logout` | `auth.logout()` | `AppNavbar` |

### 4.2 Gestione errori

- Errori di validazione (400): toast rosso con messaggio del backend (`errore`)
- Non autenticato (401): retry con refresh token → se fallisce, logout + dialog login
- Forbidden (403): toast rosso "Non autorizzato"
- Not found (404): toast rosso
- Server error (500): toast rosso "Errore del server"

### 4.3 Variabili d'ambiente

```env
NUXT_PUBLIC_API_BASE=http://localhost:3000/api   # default in sviluppo
```

In Docker build: `ARG NUXT_PUBLIC_API_BASE` iniettato a build-time.

---

## 5. Design System

### 5.1 Palette colori (dark mode)

| Token | Valore | Uso |
|---|---|---|
| `primary` | `#6366f1` | Accenti, bottoni, tab attivi |
| `bg-page` | `#1e1e2e` | Sfondo pagina |
| `bg-navbar` | `#121218` | Navbar e header |
| `bg-card` | `#2a2a3e` | Card, sidebar |
| `border` | `#3a3a52` | Bordi, separatori |
| `text-primary` | `#f1f5f9` | Testo principale |
| `text-secondary` | `#94a3b8` | Label, metadati |
| `positive` | `#10b981` | Success |
| `negative` | `#ef4444` | Errori, delete |

### 5.2 Breakpoint responsive

| Breakpoint | Layout |
|---|---|
| `> 1024px` | 3 colonne: sidebar sx + contenuto + sidebar dx |
| `600–1024px` | Contenuto + sidebar sx collassabile |
| `< 600px` | Solo contenuto, hamburger menu per sidebar |

---

## 6. Deployment

### 6.1 Build locale

```bash
cd web
npm run dev      # sviluppo su localhost:8080
npm run build    # build SPA → .output/public/
```

### 6.2 Docker

```bash
# Dalla root del progetto
docker compose up --build    # tutti i servizi (MySQL, phpMyAdmin, API, Web)
```

Il Dockerfile usa multi-stage build:
1. `node:22-alpine` installa e compila
2. `nginx:alpine` serve `.output/public/` sulla porta 80

### 6.3 Variabili Docker

```yaml
# docker-compose.yml — servizio web
build:
  context: ./web
  args:
    NUXT_PUBLIC_API_BASE: http://localhost:3000/api
```

---

## 7. Checklist di test manuale

### Setup
- [ ] `docker compose up -d` — tutti i servizi partono
- [ ] `http://localhost:8080` — app Nuxt carica con dark theme

### Autenticazione
- [ ] Dialog login appare dopo 800ms da non loggato
- [ ] Login con credenziali valide → dialog si chiude, sidebar mostra nome utente
- [ ] Login con credenziali errate → toast rosso
- [ ] Registrazione nuovo account → login automatico
- [ ] Logout → token rimosso, dialog riappare al reload
- [ ] Refresh pagina da loggato → rimane loggato
- [ ] Token scaduto → auto-refresh trasparente

### Navigazione
- [ ] Tab Persone/Feed/Commenti funzionanti
- [ ] URL aggiornato alla navigazione
- [ ] Transizione pagina visibile (fade)
- [ ] Loading bar visibile durante navigazione

### Sezione Utenti
- [ ] Lista carica con avatar colorati
- [ ] Ricerca live per nome/email
- [ ] Click "Post" → drill-down a `/post?userId=X`

### Admin View
- [ ] Switch visibile solo da admin
- [ ] Attivando: form crea utente appare, badge ruolo visibili, banner sidebar
- [ ] Disattivando: UI torna normale

### CRUD Utenti (Admin View)
- [ ] Crea utente con CF valido → appare in lista, statistiche +1
- [ ] Modifica utente → form pre-compilato, PUT inviato
- [ ] Elimina utente → conferma, CASCADE su post/commenti

### Sezione Post
- [ ] Feed carica con paginazione
- [ ] Paginazione aggiorna URL (`?pagina=2`)
- [ ] Drill-down da utente → post filtrati, breadcrumb corretto
- [ ] Form post visibile se loggato, click senza login → dialog
- [ ] Elimina post (proprio o admin) → conferma, cascade commenti

### Sezione Commenti
- [ ] Commenti filtrati per post in drill-down
- [ ] Form commento: nome/email pre-compilati da utente loggato
- [ ] Click commenta senza login → dialog con motivo contestuale
- [ ] Elimina commento (proprio o admin) → conferma

### Mobile
- [ ] `< 600px`: hamburger menu funzionante, sidebar come drawer
- [ ] Form a colonna singola su mobile

### Docker prod
- [ ] `docker compose up --build` — build senza errori
- [ ] `http://localhost:8080` — app funzionante da container
- [ ] Refresh su route `/post?userId=3` — non 404 (nginx `try_files`)
