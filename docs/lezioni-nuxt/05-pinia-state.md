# Lezione 5 — Pinia: gestione dello stato globale

## Perché serve uno state manager

Immagina questo scenario: l'utente fa login nel componente `LoginDialog`. Il suo nome deve apparire nella `AppNavbar`. I post devono mostrare il pulsante "elimina" solo se l'utente è loggato.

Senza uno state manager:
- `LoginDialog` deve passare l'utente a `app.vue` via emit
- `app.vue` deve passarlo come prop a `AppNavbar` e a ogni pagina
- ogni pagina deve passarlo a ogni componente figlio
- ...

Con Pinia:
```ts
// LoginDialog fa il login e salva nello store
authStore.utente = utente

// AppNavbar legge dallo store direttamente
const authStore = useAuthStore()
authStore.utente.nome  // "Mario"
```

Lo stato è globale e condiviso. Nessun passaggio di props.

---

## Struttura di uno store Pinia

```ts
// stores/utenti.ts
import { defineStore } from 'pinia'

export const useUtentiStore = defineStore('utenti', () => {
  // --- STATE ---
  // Dati che vogliamo tenere in memoria
  const utenti = ref<Utente[]>([])
  const caricamento = ref(false)
  const errore = ref<string | null>(null)

  // --- GETTERS ---
  // Valori derivati dallo state (come computed)
  const totale = computed(() => utenti.value.length)

  // --- ACTIONS ---
  // Funzioni che modificano lo state
  async function carica() {
    caricamento.value = true
    errore.value = null
    try {
      const api = useApi()
      utenti.value = await api.getUtenti()
    } catch (e) {
      errore.value = 'Errore nel caricamento'
    } finally {
      caricamento.value = false
    }
  }

  async function elimina(id: number) {
    await useApi().deleteUtente(id)
    utenti.value = utenti.value.filter(u => u.id !== id)
  }

  // Esporta tutto ciò che i componenti devono usare
  return { utenti, caricamento, errore, totale, carica, elimina }
})
```

Nota: usiamo la sintassi **setup function** (con `ref`, `computed`) invece della vecchia sintassi `options` — è più vicina alla Composition API di Vue.

---

## Usare lo store in un componente

```vue
<!-- pages/utenti/index.vue -->
<script setup lang="ts">
const store = useUtentiStore()  // nessun import — Nuxt auto-importa

onMounted(() => {
  store.carica()
})
</script>

<template>
  <div v-if="store.caricamento">Caricamento...</div>
  <div v-else-if="store.errore">{{ store.errore }}</div>
  <div v-else>
    <p>{{ store.totale }} utenti</p>
    <UserCard
      v-for="utente in store.utenti"
      :key="utente.id"
      :utente="utente"
      @elimina="store.elimina($event)"
    />
  </div>
</template>
```

---

## Lo store auth nel progetto

```ts
// stores/auth.ts (semplificato)
export const useAuthStore = defineStore('auth', () => {
  const utente = ref<Utente | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)

  const isLoggato = computed(() => utente.value !== null)

  async function login(email: string, password: string) {
    const risposta = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const dati = await risposta.json()

    // Salva nello store
    utente.value = dati.utente
    accessToken.value = dati.accessToken
    refreshToken.value = dati.refreshToken

    // Salva anche in localStorage per persistere tra i refresh
    localStorage.setItem('auth', JSON.stringify(dati))
  }

  function logout() {
    utente.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('auth')
  }

  return { utente, accessToken, refreshToken, isLoggato, login, logout }
})
```

---

## Persistenza con localStorage

Uno store Pinia vive solo finché la pagina è aperta. Se l'utente ricarica (`F5`), tutto lo state si azzera — compreso il login.

Per evitarlo, usiamo `localStorage`:

```ts
// plugins/auth.client.ts
export default defineNuxtPlugin(() => {
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

Questo plugin gira **una sola volta** all'avvio dell'app. Se trova i dati salvati, li ripristina nello store — l'utente rimane loggato.

---

## `storeToRefs` — reattività dalle store

Quando destrutturi uno store, i valori perdono la reattività:

```ts
// SBAGLIATO — utenti non è più reattivo
const { utenti } = useUtentiStore()
```

```ts
// CORRETTO — storeToRefs mantiene la reattività
const store = useUtentiStore()
const { utenti, caricamento } = storeToRefs(store)

// Le actions non hanno bisogno di storeToRefs
const { carica, elimina } = store
```

---

## Differenza tra store e composable

| | Store (Pinia) | Composable |
|--|---------------|------------|
| Stato condiviso | Sì — unica istanza | No — ogni chiamata crea una nuova istanza |
| Persiste durante navigazione | Sì | No (dipende) |
| DevTools | Sì | No |
| Uso tipico | Dati globali (utente, lista utenti) | Logica riutilizzabile (toast, confirm) |

---

## Riepilogo

```
defineStore('nome', () => {
  const dati = ref([])           // state
  const totale = computed(...)   // getter
  async function carica() {}     // action
  return { dati, totale, carica }
})
```

- Lo store è una **singola istanza globale** — tutti i componenti vedono lo stesso stato
- `useNomeStore()` è auto-importata da Nuxt
- Per persistere tra refresh: salva/leggi da `localStorage`
- Per destrutturare mantenendo la reattività: usa `storeToRefs`

**Prossima lezione:** composables — come estrarre e riutilizzare la logica.
