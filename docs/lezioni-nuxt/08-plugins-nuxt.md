# Lezione 8 — Plugin Nuxt

## Cosa sono i plugin

I plugin sono file che Nuxt esegue **una sola volta** quando l'app si inizializza, prima di renderizzare qualsiasi pagina o componente. Si usano per:

- inizializzare librerie di terze parti
- ripristinare lo stato (es. autenticazione da localStorage)
- iniettare funzioni globali
- fare setup che deve avvenire prima di tutto il resto

---

## Dove si mettono e come si chiamano

I plugin vanno nella cartella `app/plugins/`. Il nome del file determina quando e dove vengono eseguiti:

| Nome file | Esecuzione |
|-----------|-----------|
| `mioplugin.ts` | Sia server (SSR) che client |
| `mioplugin.client.ts` | Solo nel browser |
| `mioplugin.server.ts` | Solo sul server (SSR) |

Nel nostro progetto abbiamo `auth.client.ts` — viene eseguito solo nel browser perché usa `localStorage`, che non esiste sul server.

---

## Struttura di un plugin

```ts
// plugins/auth.client.ts
export default defineNuxtPlugin(() => {
  // Questo codice gira UNA VOLTA all'avvio dell'app

  const authStore = useAuthStore()
  const salvato = localStorage.getItem('auth')

  if (salvato) {
    const dati = JSON.parse(salvato)
    authStore.utente = dati.utente
    authStore.accessToken = dati.accessToken
    authStore.refreshToken = dati.refreshToken
  }
})
```

`defineNuxtPlugin` è la funzione helper di Nuxt per definire plugin. Gestisce automaticamente il contesto corretto (server/client).

---

## Il problema che risolve: il "flash di logout"

Senza il plugin auth, al ricaricamento della pagina succede questo:

1. L'utente è loggato → `authStore.utente = { nome: 'Mario', ... }`
2. L'utente preme F5
3. L'app si ricarica → store azzerato → `authStore.utente = null`
4. La navbar mostra "Login" invece di "Mario"
5. Il plugin `auth.client.ts` viene eseguito
6. Trova i dati in `localStorage`
7. Ripristina lo store → la navbar aggiorna

Senza il plugin l'utente vedrebbe un "flash" in cui sembra sloggato, e poi tornerebbe loggato. Con il plugin, il ripristino avviene prima del rendering iniziale — nessun flash.

---

## Ordine di esecuzione

```
1. Nuxt si inizializza
2. I plugin vengono eseguiti in ordine alfabetico
3. Il componente app.vue viene montato
4. Le pagine vengono renderizzate
```

Questo garantisce che quando `AppNavbar` si renderizza, `authStore.utente` è già valorizzato.

---

## Plugin con `provide` — iniettare globalmente

I plugin possono "iniettare" valori o funzioni nell'app che poi si usano con `useNuxtApp()`:

```ts
// plugins/api.ts
export default defineNuxtPlugin(() => {
  const api = {
    getUtenti: () => fetch('/api/utenti').then(r => r.json()),
    // ...
  }

  return {
    provide: {
      api  // disponibile come $api in tutti i componenti
    }
  }
})
```

```vue
<!-- In qualsiasi componente -->
<script setup>
const { $api } = useNuxtApp()
const utenti = await $api.getUtenti()
</script>
```

Nel nostro progetto non usiamo questo pattern — preferiamo i composables perché sono più tipizzati e testabili.

---

## Plugin vs Composable vs Middleware

| | Plugin | Composable | Middleware |
|--|--------|------------|-----------|
| Quando esegue | Una volta all'avvio | Ogni chiamata | Prima di ogni navigazione |
| Uso tipico | Init librerie, ripristino stato | Logica riutilizzabile | Protezione route (auth guard) |
| Accesso a store | Sì | Sì | Sì |
| Esempio | Ripristina auth da localStorage | `useToast()` | Redirect se non loggato |

---

## Middleware — protezione delle route

Anche se non lo usiamo ancora esplicitamente, è utile capirlo per il progetto.

Un middleware viene eseguito prima di ogni navigazione. Si usa per proteggere le route:

```ts
// middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore()

  if (!authStore.isLoggato) {
    return navigateTo('/login')  // redirect
  }
})
```

Per applicarlo a una pagina:

```vue
<!-- pages/profilo.vue -->
<script setup>
definePageMeta({
  middleware: 'auth'  // esegue middleware/auth.ts prima di caricare la pagina
})
</script>
```

---

## Riepilogo

I plugin Nuxt servono per eseguire codice di inizializzazione **prima** che l'app si renderizzi. Il suffisso `.client.ts` li limita al browser (necessario per `localStorage`, `window`, ecc.).

Nel progetto il plugin `auth.client.ts` fa una cosa sola e fondamentale: rilegge i dati di autenticazione da `localStorage` e li rimette nello store Pinia, così l'utente non deve rifare il login ad ogni ricaricamento della pagina.

**Prossima lezione:** Docker, nginx e il deploy completo.
