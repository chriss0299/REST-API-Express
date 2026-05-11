# Lezioni Nuxt — SocialPlace

10 lezioni che spiegano tutto quello che è stato usato nel progetto, in ordine dal concetto più generale al più specifico.

## Indice

| # | Lezione | Argomenti |
|---|---------|-----------|
| 1 | [Introduzione a Nuxt](./01-introduzione-nuxt.md) | SSR vs SSG vs SPA, `ssr: false`, `nuxt generate` vs `nuxt build`, `nuxt.config.ts`, directory `app/` |
| 2 | [Struttura del progetto](./02-struttura-progetto.md) | `pages/`, `components/`, `composables/`, `stores/`, `plugins/`, `pathPrefix`, `<NuxtPage />` |
| 3 | [Vue 3 Composition API](./03-vue3-composition-api.md) | `<script setup>`, `ref`, `computed`, `watch`, `provide/inject`, props, `onMounted` |
| 4 | [Routing in Nuxt](./04-routing-nuxt.md) | Routing basato su file, route dinamiche, `<NuxtLink>`, `useRouter`, `useRoute`, SPA con nginx |
| 5 | [Pinia — stato globale](./05-pinia-state.md) | `defineStore`, state, getters, actions, `storeToRefs`, persistenza con localStorage |
| 6 | [Composables](./06-composables.md) | `useApi`, `useAuth`, `useToast`, `useConfirm`, `useRuntimeConfig`, pattern e regole |
| 7 | [Quasar UI](./07-quasar-ui.md) | Layout, `q-drawer`, breakpoint, componenti, plugin `Notify` e `Dialog`, `useQuasar()` |
| 8 | [Plugin Nuxt](./08-plugins-nuxt.md) | `defineNuxtPlugin`, `.client.ts`, ripristino auth, ordine di esecuzione, middleware |
| 9 | [Docker e nginx](./09-docker-nginx.md) | Multi-stage Dockerfile, `nuxt generate`, nginx SPA routing, `absolute_redirect off`, docker-compose env vars |
| 10 | [Flusso completo](./10-flusso-completo.md) | Dall'URL al DB e ritorno, scenario login, schema visivo, responsabilità di ogni parte |

## Percorso consigliato

**Prima volta:** leggi le lezioni in ordine, 1 → 10.

**Hai un dubbio specifico?**
- "Perché `<UserCard>` non si vede?" → Lezione 2 (pathPrefix)
- "Come funziona `ref`?" → Lezione 3
- "Come navigo tra pagine?" → Lezione 4
- "Come condivido dati tra componenti?" → Lezione 5
- "Come faccio una chiamata API?" → Lezione 6
- "Come uso i componenti Quasar?" → Lezione 7
- "Perché nginx mostra la pagina default?" → Lezione 9
- "Come funziona tutto insieme?" → Lezione 10

## Problemi risolti durante il progetto

Questi sono i bug reali che abbiamo incontrato e risolto — trovi la spiegazione nelle lezioni:

| Errore | Causa | Lezione |
|--------|-------|---------|
| nginx mostra "Welcome to nginx!" | Usato `nuxt build` invece di `nuxt generate` | 1, 9 |
| Redirect a `http://localhost/` (senza porta) | `absolute_redirect` mancante in nginx | 4, 9 |
| Componenti non renderizzati, solo testo | `pathPrefix: true` (default Nuxt 4) | 2 |
| Login risponde 500 | `JWT_SECRET` mancante in docker-compose | 9 |
| Login risponde 429 | Rate limiter scattato (5 tentativi/15min) | 9 |
