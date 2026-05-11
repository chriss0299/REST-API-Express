# Lezione 1 — Cos'è Nuxt e come funziona

## Cosa è Nuxt

Nuxt è un **framework** costruito sopra Vue 3. Vue da solo ti permette di creare componenti e gestire la UI. Nuxt aggiunge tutto il resto:

- routing automatico basato sui file
- auto-import di componenti, composables e stores
- gestione del build (Vite sotto il cofano)
- supporto a SSR, SSG, SPA

Puoi pensare a Vue come al motore e a Nuxt come all'auto completa.

---

## Le tre modalità di Nuxt

| Modalità | Config | Descrizione |
|----------|--------|-------------|
| **SSR** (Server-Side Rendering) | default | Il server genera l'HTML ad ogni richiesta. Ottimo per SEO. |
| **SSG** (Static Site Generation) | `nuxt generate` | L'HTML viene generato una volta sola al momento del build. |
| **SPA** (Single Page Application) | `ssr: false` | Tutto gira nel browser. Nessun server necessario. |

Nel nostro progetto usiamo **SPA** (`ssr: false` in nuxt.config.ts), quindi Nuxt genera un `index.html` vuoto e tutto il rendering avviene nel browser tramite JavaScript.

---

## `nuxt build` vs `nuxt generate`

Questo è stato uno dei problemi chiave del nostro deployment su Docker.

### `nuxt build`
```bash
npm run build
```
Genera un **server Nitro** in `.output/server/`. Richiede Node.js per girare. **Non produce `index.html`** nella cartella pubblica — quindi nginx non sa cosa servire.

### `nuxt generate`
```bash
npm run generate
```
Genera una **SPA statica** in `.output/public/`. Produce `index.html` + tutti i file JS/CSS. **Questo è quello che usiamo** perché nginx può servire file statici senza bisogno di Node.js in produzione.

```
.output/
└── public/
    ├── index.html          ← nginx serve questo
    ├── utenti/
    │   └── index.html
    ├── post/
    │   └── index.html
    └── _nuxt/
        ├── entry.BIXFrk8v.css
        └── t9tA_05d.js
```

---

## `nuxt.config.ts` — il file di configurazione

```ts
export default defineNuxtConfig({
  // Usa la directory app/ invece della root (Nuxt 4)
  future: {
    compatibilityVersion: 4,
  },

  // Modalità SPA — tutto gira nel browser
  ssr: false,

  // Moduli aggiuntivi installati
  modules: ['nuxt-quasar-ui', '@pinia/nuxt'],

  // Variabili accessibili nel browser
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3000/api',
    },
  },
})
```

### `runtimeConfig.public`
Queste variabili vengono "cotte" dentro il bundle JavaScript al momento del build. Nel browser puoi accederle così:

```ts
const config = useRuntimeConfig()
console.log(config.public.apiBase) // 'http://localhost:3000/api'
```

Nel Dockerfile passiamo `NUXT_PUBLIC_API_BASE` come build argument, così la URL dell'API viene configurata correttamente per Docker:

```dockerfile
ARG NUXT_PUBLIC_API_BASE=http://localhost:3000/api
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE
```

---

## Nuxt 4 e la directory `app/`

Con `compatibilityVersion: 4`, Nuxt sposta tutto il codice dell'applicazione nella cartella `app/`. Prima (Nuxt 3) era tutto nella root.

```
web/
├── nuxt.config.ts     ← configurazione (rimane fuori)
├── package.json
└── app/               ← tutto il codice sta qui
    ├── app.vue
    ├── pages/
    ├── components/
    ├── stores/
    └── composables/
```

Questo serve a separare meglio la configurazione del progetto dal codice dell'app.

---

## Riepilogo

| Concetto | Cosa fa |
|----------|---------|
| `ssr: false` | Genera una SPA (no server Node in produzione) |
| `nuxt generate` | Build statico → `.output/public/` per nginx |
| `nuxt build` | Build con server Nitro (non usato nel nostro Docker) |
| `runtimeConfig.public` | Variabili disponibili nel browser |
| `app/` directory | Dove vive il codice con Nuxt 4 |

**Prossima lezione:** la struttura delle cartelle e cosa va dove.
