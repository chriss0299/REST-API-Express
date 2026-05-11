# Lezione 3 — Vue 3 Composition API

## Perché la Composition API

Vue ha due modi per scrivere i componenti:

**Options API** (vecchio stile):
```js
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() { this.count++ }
  },
  computed: {
    doubled() { return this.count * 2 }
  }
}
```

**Composition API** (moderno, quello che usiamo):
```vue
<script setup>
const count = ref(0)
const increment = () => count.value++
const doubled = computed(() => count.value * 2)
</script>
```

La Composition API è più leggibile per componenti complessi, permette di estrarre logica riutilizzabile nei composables e funziona meglio con TypeScript.

---

## `<script setup>` — la sintassi che usiamo

`<script setup>` è zucchero sintattico per la Composition API. Tutto quello che dichiari dentro è automaticamente disponibile nel template.

```vue
<script setup lang="ts">
const messaggio = ref('Ciao!')
</script>

<template>
  <!-- messaggio è disponibile direttamente -->
  <p>{{ messaggio }}</p>
</template>
```

Senza `setup` dovresti fare `return { messaggio }` manualmente.

---

## `ref` — variabili reattive

`ref` crea una variabile che Vue "osserva". Quando cambia, il template si aggiorna automaticamente.

```ts
import { ref } from 'vue'

const count = ref(0)

// Per leggere/modificare il valore, usa .value
console.log(count.value)  // 0
count.value++
console.log(count.value)  // 1
```

Nel template, Vue aggiunge `.value` automaticamente:
```vue
<template>
  <p>{{ count }}</p>          <!-- non serve .value nel template -->
  <button @click="count++">  <!-- funziona anche così -->
</template>
```

### Usato nel nostro progetto

```ts
// app/app.vue
const sidebarAperta = ref(true)

// Quando clicchi il bottone hamburger nella navbar:
sidebarAperta.value = !sidebarAperta.value
// → Vue aggiorna il drawer automaticamente
```

---

## `computed` — valori derivati

`computed` crea un valore che dipende da altri valori reattivi. Si ricalcola automaticamente solo quando le dipendenze cambiano.

```ts
const utenti = ref([
  { nome: 'Mario', citta: 'Roma' },
  { nome: 'Luigi', citta: 'Milano' },
])

const filtroCitta = ref('Roma')

const utentiFiltrati = computed(() =>
  utenti.value.filter(u => u.citta === filtroCitta.value)
)
// utentiFiltrati si aggiorna automaticamente quando cambia
// utenti.value OPPURE filtroCitta.value
```

---

## `watch` — reazione ai cambiamenti

`watch` esegue una funzione quando un valore cambia.

```ts
const userId = ref(null)

watch(userId, async (nuovoId) => {
  if (nuovoId) {
    // Carica i post dell'utente quando userId cambia
    await postStore.caricaPerUtente(nuovoId)
  }
})
```

---

## `provide` / `inject` — comunicazione tra componenti

`provide` permette a un componente padre di mettere a disposizione dati/funzioni per tutti i componenti figli, senza passarli come props attraverso ogni livello.

```ts
// Componente padre (app.vue)
const sidebarAperta = ref(true)
provide('toggleSidebar', () => {
  sidebarAperta.value = !sidebarAperta.value
})
```

```ts
// Componente figlio (AppNavbar.vue) — anche se è "lontano" nell'albero
const toggleSidebar = inject('toggleSidebar')

// Usato nel template:
// <q-btn @click="toggleSidebar()" />
```

Senza `provide/inject` dovresti passare la funzione come prop attraverso ogni componente intermedio — il problema chiamato "prop drilling".

---

## Props — dati passati dal padre al figlio

Le props sono il modo standard per passare dati da un componente padre a un figlio:

```vue
<!-- Padre -->
<UserCard :utente="utente" @elimina="handleElimina" />
```

```vue
<!-- UserCard.vue — figlio -->
<script setup lang="ts">
const props = defineProps<{
  utente: Utente
}>()

const emit = defineEmits<{
  elimina: [id: number]
}>()
</script>

<template>
  <div>
    {{ props.utente.nome }}
    <button @click="emit('elimina', props.utente.id)">
      Elimina
    </button>
  </div>
</template>
```

- Il padre passa dati **giù** tramite props (`:utente="..."`)
- Il figlio comunica **su** tramite eventi (`emit('elimina', ...)`)

---

## `onMounted` — codice eseguito dopo il rendering

```ts
import { onMounted } from 'vue'

onMounted(async () => {
  // Viene eseguito quando il componente è inserito nel DOM
  await utentiStore.carica()
})
```

Tipicamente usato per caricare dati dall'API quando una pagina si apre.

---

## `defineProps` con TypeScript

Con `lang="ts"` puoi usare la sintassi generica:

```ts
// Senza tipo separato
const props = defineProps<{
  nome: string
  età?: number   // opzionale
}>()

// Oppure importando un tipo
import type { Utente } from '~/types'
const props = defineProps<{ utente: Utente }>()
```

---

## Riepilogo

| API | Cosa fa | Esempio |
|-----|---------|---------|
| `ref(val)` | Valore reattivo | `const count = ref(0)` |
| `computed(() => ...)` | Valore derivato reattivo | `const tot = computed(() => items.length)` |
| `watch(src, fn)` | Reazione ai cambiamenti | `watch(id, () => carica())` |
| `provide(key, val)` | Rende disponibile un valore ai figli | `provide('toggle', fn)` |
| `inject(key)` | Ottiene un valore dal padre | `const fn = inject('toggle')` |
| `onMounted(fn)` | Esegue codice dopo il mount | `onMounted(() => fetch())` |
| `defineProps<T>()` | Tipizza le props in ingresso | `defineProps<{ id: number }>()` |
| `defineEmits<T>()` | Tipizza gli eventi in uscita | `defineEmits<{ click: [] }>()` |

**Prossima lezione:** routing in Nuxt — come funziona la navigazione tra pagine.
