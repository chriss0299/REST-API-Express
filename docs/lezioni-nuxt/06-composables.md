# Lezione 6 — Composables

## Cosa sono i composables

Un **composable** è una funzione che usa la Composition API di Vue per incapsulare logica riutilizzabile. Il nome inizia sempre con `use` per convenzione.

Pensali come i custom hook di React, o come "pezzi di logica" che puoi portarti in qualsiasi componente senza copiare codice.

---

## Problema che risolvono

Senza composables:

```vue
<!-- utenti/index.vue -->
<script setup>
const notifica = (msg) => {
  // 30 righe di codice per mostrare una notifica Quasar
}
</script>

<!-- post/index.vue -->
<script setup>
const notifica = (msg) => {
  // le stesse 30 righe copiate
}
</script>
```

Con un composable:

```ts
// composables/useToast.ts
export function useToast() {
  const notifica = (msg) => { /* logica qui */ }
  return { notifica }
}
```

```vue
<!-- in qualsiasi componente -->
<script setup>
const { notifica } = useToast()
</script>
```

---

## `useApi` — il composable più importante del progetto

```ts
// composables/useApi.ts
export function useApi() {
  const config = useRuntimeConfig()
  const base = config.public.apiBase  // 'http://localhost:3000/api'

  async function get<T>(path: string): Promise<T> {
    const risposta = await fetch(`${base}${path}`)
    if (!risposta.ok) throw new Error(`Errore ${risposta.status}`)
    return risposta.json()
  }

  async function post<T>(path: string, corpo: unknown): Promise<T> {
    const risposta = await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    })
    if (!risposta.ok) throw new Error(`Errore ${risposta.status}`)
    return risposta.json()
  }

  // Funzioni specifiche per ogni risorsa
  const getUtenti = () => get<Utente[]>('/utenti')
  const getUtente = (id: number) => get<Utente>(`/utenti/${id}`)
  const creaUtente = (dati: Partial<Utente>) => post<Utente>('/utenti', dati)
  const eliminaUtente = (id: number) => /* DELETE /utenti/:id */

  return { getUtenti, getUtente, creaUtente, eliminaUtente, /* ... */ }
}
```

### Perché `useRuntimeConfig()` invece di una costante

```ts
// SBAGLIATO — URL hardcoded, non funziona in Docker
const BASE = 'http://localhost:3000/api'

// CORRETTO — usa la variabile configurata in nuxt.config.ts
//            che può essere sovrascritta da env var al build time
const config = useRuntimeConfig()
const base = config.public.apiBase
```

In Docker, il Dockerfile passa:
```dockerfile
ARG NUXT_PUBLIC_API_BASE=http://localhost:3000/api
```
Questo sovrascrive `apiBase` nel bundle finale.

---

## `useAuth` — logica di autenticazione

```ts
// composables/useAuth.ts
export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  async function login(email: string, password: string) {
    await authStore.login(email, password)
    router.push('/')
  }

  async function logout() {
    await authStore.logout()
    router.push('/')
  }

  // Wrapper per fare richieste autenticate
  async function fetchAutenticato(url: string, opzioni = {}) {
    const risposta = await fetch(url, {
      ...opzioni,
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    // Se il token è scaduto (401), prova a rinnovarlo
    if (risposta.status === 401) {
      await authStore.refresh()
      // Riprova con il nuovo token
      return fetch(url, { /* ... */ })
    }

    return risposta
  }

  return { login, logout, fetchAutenticato }
}
```

---

## `useToast` — notifiche

```ts
// composables/useToast.ts
export function useToast() {
  const $q = useQuasar()

  function successo(messaggio: string) {
    $q.notify({
      type: 'positive',
      message: messaggio,
      position: 'top-right',
    })
  }

  function errore(messaggio: string) {
    $q.notify({
      type: 'negative',
      message: messaggio,
      position: 'top-right',
    })
  }

  return { successo, errore }
}
```

Uso nel componente:
```ts
const { successo, errore } = useToast()

try {
  await store.creaUtente(datiForm)
  successo('Utente creato!')
} catch {
  errore('Errore nella creazione')
}
```

---

## `useConfirm` — dialog di conferma

```ts
// composables/useConfirm.ts
export function useConfirm() {
  const $q = useQuasar()

  function conferma(messaggio: string): Promise<boolean> {
    return new Promise((resolve) => {
      $q.dialog({
        title: 'Conferma',
        message: messaggio,
        cancel: true,
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false))
    })
  }

  return { conferma }
}
```

Uso:
```ts
const { conferma } = useConfirm()

async function eliminaUtente(id: number) {
  const confermato = await conferma('Vuoi eliminare questo utente?')
  if (confermato) {
    await store.elimina(id)
  }
}
```

---

## Regole dei composables

1. **Inizia sempre con `use`** — è la convenzione di Vue
2. **Usali solo dentro `<script setup>` o altri composables** — non in funzioni normali o callback
3. **Non usano JSX o template** — solo logica
4. **Ogni chiamata è una nuova istanza** — diversi da Pinia che è singleton

```ts
// Corretto — dentro setup
const { notifica } = useToast()

// SBAGLIATO — dentro una callback asincrona
setTimeout(() => {
  const { notifica } = useToast()  // errore!
}, 1000)
```

---

## Composable vs Store vs Utility function

| | Composable | Store (Pinia) | Utility function |
|--|------------|---------------|-----------------|
| Stato reattivo | Sì | Sì | No |
| Condiviso tra componenti | No (istanza per chiamata) | Sì (singleton) | No |
| Usa Composition API | Sì | Sì | No |
| Esempio | `useToast()` | `useAuthStore()` | `formattaData()` |

---

## Riepilogo

I composables sono il modo di Vue per riutilizzare logica con stato. In Nuxt vengono auto-importati dalla cartella `composables/`. Usa uno store Pinia quando lo stato deve essere condiviso tra componenti, un composable quando vuoi incapsulare logica riutilizzabile in modo indipendente.

**Prossima lezione:** Quasar UI — i componenti e i plugin che usiamo.
