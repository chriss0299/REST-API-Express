# Lezione 2 — Struttura del progetto Nuxt 4

## Le cartelle speciali

Nuxt riconosce alcune cartelle per nome e le tratta in modo speciale. Non devi importare nulla manualmente — Nuxt lo fa da solo.

```
app/
├── app.vue          ← componente radice (layout principale)
├── error.vue        ← pagina di errore (404, 500...)
├── pages/           ← routing automatico
├── components/      ← componenti auto-importati
├── composables/     ← funzioni riutilizzabili auto-importate
├── stores/          ← Pinia stores (configurati in nuxt.config.ts)
├── plugins/         ← codice eseguito all'avvio dell'app
├── middleware/      ← codice eseguito prima di ogni navigazione
├── layouts/         ← layout alternativi (non usiamo questa cartella)
├── assets/          ← CSS, immagini non pubbliche
└── types/           ← tipi TypeScript
```

---

## `pages/` — routing basato sui file

Nuxt legge i file nella cartella `pages/` e crea le route automaticamente.

| File | URL |
|------|-----|
| `pages/index.vue` | `/` |
| `pages/utenti/index.vue` | `/utenti` |
| `pages/post/index.vue` | `/post` |
| `pages/utenti/[id].vue` | `/utenti/5` (parametro dinamico) |

Non devi configurare nessun router. Nuxt genera la configurazione di vue-router dai file.

```vue
<!-- pages/utenti/index.vue -->
<template>
  <div>Pagina utenti</div>
</template>
```

Questo è sufficiente per avere la pagina su `/utenti`.

---

## `components/` — auto-import

Tutti i file `.vue` nella cartella `components/` vengono importati automaticamente. Non scrivere mai `import UserCard from '~/components/utenti/UserCard.vue'` — Nuxt lo fa per te.

### Il problema del `pathPrefix`

Per default, Nuxt 4 aggiunge il nome della sottocartella come prefisso:

```
components/
└── utenti/
    └── UserCard.vue
```

Con il comportamento default, devi usare:
```vue
<UtentiUserCard />   ← prefisso = nome cartella
```

Noi abbiamo disabilitato questo comportamento in `nuxt.config.ts`:

```ts
components: [
  { path: '~/components', pathPrefix: false },
],
```

Ora puoi scrivere semplicemente:
```vue
<UserCard />   ← senza prefisso
```

Questo era il motivo per cui nel progetto si vedeva solo "Persone" e "5 utenti registrati" ma nessun componente — i componenti venivano cercati con il nome sbagliato e falliva silenziosamente.

---

## `composables/` — funzioni riutilizzabili

I file in `composables/` vengono importati automaticamente. Puoi usare `useApi()` in qualsiasi componente senza import.

```ts
// composables/useApi.ts — disponibile ovunque
export function useApi() {
  // ...
}

// In un componente — nessun import necessario
const api = useApi()
```

---

## `stores/` — Pinia

Con `@pinia/nuxt`, le store definite in `app/stores/` vengono auto-importate se configuri:

```ts
// nuxt.config.ts
pinia: {
  storesDirs: ['./app/stores/**'],
},
```

Poi nel componente:
```ts
const authStore = useAuthStore()  // nessun import necessario
```

---

## `plugins/` — codice eseguito all'avvio

I plugin vengono eseguiti **una sola volta** quando l'app si inizializza.

Il suffisso `.client.ts` indica che il plugin gira solo nel browser (non durante SSR):

```
plugins/
└── auth.client.ts   ← eseguito solo nel browser, all'avvio
```

Nel nostro caso, `auth.client.ts` ripristina la sessione utente da `localStorage` quando l'utente ricarica la pagina.

---

## `app.vue` — il componente radice

`app.vue` è il componente che contiene **tutta l'app**. È qui che si trova il layout principale.

```vue
<template>
  <q-layout view="lHh Lpr lFf">
    <AppNavbar />

    <!-- Sidebar sinistra -->
    <q-drawer v-model="sidebarAperta" ...>
      <AppSidebar />
    </q-drawer>

    <!-- Qui vengono renderizzate le pagine -->
    <q-page-container>
      <NuxtPage />   ← equivalente di <router-view> in Vue puro
    </q-page-container>

    <!-- Sidebar destra -->
    <q-drawer side="right" ...>
      <AppSidebarInfo />
    </q-drawer>

    <!-- Dialog di login sempre montata -->
    <LoginDialog />
  </q-layout>
</template>
```

`<NuxtPage />` è il componente speciale di Nuxt che renderizza la pagina corrente in base alla URL.

---

## `types/index.ts` — tipi TypeScript

Qui definiamo le interfacce per i dati che arrivano dall'API:

```ts
export interface Utente {
  id: number
  nome: string
  email: string
  citta?: string
}

export interface Post {
  id: number
  userId: number
  titolo: string
  corpo: string
}
```

Questi tipi vengono usati in stores e composables per avere autocomplete e controllo degli errori.

---

## Schema completo del flusso

```
Browser naviga a /utenti
       ↓
Nuxt router → carica pages/utenti/index.vue
       ↓
La pagina usa useUtentiStore() → legge/modifica stato globale
       ↓
Lo store usa useApi() → fa fetch a http://localhost:3000/api/utenti
       ↓
I dati tornano → lo store li salva → la pagina li renderizza
```

**Prossima lezione:** Vue 3 Composition API — `<script setup>`, `ref`, `computed`, `provide/inject`.
