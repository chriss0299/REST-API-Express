# Lezione 4 — Routing in Nuxt

## Come funziona il routing

In Vue puro devi configurare vue-router manualmente. In Nuxt il router viene generato automaticamente dalla struttura della cartella `pages/`.

```
pages/
├── index.vue          → /
├── utenti/
│   └── index.vue      → /utenti
├── post/
│   └── index.vue      → /post
└── commenti/
    └── index.vue      → /commenti
```

Non esiste nessun file `router.js` — Nuxt lo crea da solo.

---

## Route dinamiche — parametri nell'URL

Per una URL con un ID variabile come `/utenti/5`, crei il file con le parentesi quadre:

```
pages/
└── utenti/
    ├── index.vue      → /utenti
    └── [id].vue       → /utenti/5, /utenti/42, ...
```

Nel componente accedi al parametro con `useRoute()`:

```ts
// pages/utenti/[id].vue
const route = useRoute()
console.log(route.params.id)  // "5" (sempre stringa)
```

---

## `<NuxtPage />` — dove vengono renderizzate le pagine

In `app.vue` usiamo `<NuxtPage />` per indicare dove Nuxt deve iniettare la pagina corrente:

```vue
<!-- app.vue -->
<template>
  <q-layout>
    <AppNavbar />
    <q-page-container>
      <NuxtPage />   ← la pagina corrente va qui
    </q-page-container>
  </q-layout>
</template>
```

È l'equivalente di `<router-view>` in Vue puro. Abbiamo proprio questo errore all'inizio: avevamo scritto `<router-view>` invece di `<NuxtPage />` e le pagine non si caricavano.

---

## `<NuxtLink>` — link tra pagine

Per i link usa `<NuxtLink>` invece di `<a href>`. `<NuxtLink>` usa il router client-side e non ricarica la pagina:

```vue
<!-- Link semplice -->
<NuxtLink to="/utenti">Vai agli utenti</NuxtLink>

<!-- Link con parametro dinamico -->
<NuxtLink :to="`/utenti/${utente.id}`">
  {{ utente.nome }}
</NuxtLink>

<!-- Link equivalente con oggetto -->
<NuxtLink :to="{ path: '/utenti', query: { citta: 'Roma' } }">
  Utenti di Roma
</NuxtLink>
```

---

## `useRouter()` — navigazione programmatica

Quando vuoi navigare da codice JavaScript (non da un link nel template):

```ts
const router = useRouter()

async function salvaEVaiIndietro() {
  await api.creaUtente(formData)
  router.push('/utenti')          // naviga a /utenti
  router.back()                   // torna alla pagina precedente
  router.replace('/utenti')       // naviga senza aggiungere alla history
}
```

---

## `useRoute()` — informazioni sulla route corrente

```ts
const route = useRoute()

console.log(route.path)        // "/utenti/5"
console.log(route.params.id)   // "5"
console.log(route.query.citta) // "Roma" (da ?citta=Roma)
console.log(route.name)        // "utenti-id"
```

---

## Query string — filtri e parametri opzionali

Per passare filtri opzionali usi la query string (`?chiave=valore`):

```vue
<!-- In un template -->
<NuxtLink :to="{ path: '/post', query: { userId: 3 } }">
  Post di Mario
</NuxtLink>
<!-- Genera: /post?userId=3 -->
```

```ts
// In pages/post/index.vue
const route = useRoute()
const userId = computed(() => route.query.userId)

// Carica solo i post di quell'utente
watch(userId, async (id) => {
  if (id) await postStore.caricaPerUtente(Number(id))
  else await postStore.caricaTutti()
}, { immediate: true })
```

---

## Transizioni tra pagine

In `nuxt.config.ts` abbiamo configurato una transizione CSS:

```ts
app: {
  pageTransition: { name: 'page', mode: 'out-in' },
}
```

Questo applica le classi CSS `page-enter-active`, `page-leave-active` ecc. durante la navigazione. Le animazioni vanno definite in `assets/css/main.css`.

---

## Come il browser gestisce la SPA con nginx

Con `ssr: false` e `nuxt generate`, tutte le route producono un `index.html` vuoto:

```
.output/public/
├── index.html        ← /
├── utenti/
│   └── index.html    ← /utenti
└── post/
    └── index.html    ← /post
```

Ma c'è un problema: se l'utente naviga direttamente a `/utenti/5` (una route dinamica non pre-generata), nginx cerca il file `utenti/5/index.html` che non esiste.

Per questo nginx.conf ha questa regola:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Tradotto: "prova a trovare il file, poi prova la cartella, altrimenti servi sempre index.html". L'app Nuxt nel browser gestirà il routing da sola.

---

## Il problema del redirect di nginx (risolto)

Quando nginx riceveva una richiesta per `/utenti` (senza slash finale), restituiva un redirect a `/utenti/`. Il redirect conteneva la porta interna del container (80) invece della porta esposta (8080):

```
GET http://localhost:8080/utenti
  → 301 Redirect a http://localhost/utenti/   ← porta sbagliata!
```

La soluzione è stata aggiungere a nginx.conf:
```nginx
absolute_redirect off;
```

Questo fa usare a nginx path relativi nei redirect invece di URL assolute con la porta.

---

## Riepilogo

| Concetto | Come si usa |
|----------|-------------|
| Route statica | File in `pages/nome/index.vue` |
| Route dinamica | File `pages/nome/[param].vue` |
| Renderizza pagina | `<NuxtPage />` in app.vue |
| Link tra pagine | `<NuxtLink to="/path">` |
| Navigazione da codice | `useRouter().push('/path')` |
| Leggi URL corrente | `useRoute().params`, `.query`, `.path` |

**Prossima lezione:** Pinia — gestione dello stato globale.
