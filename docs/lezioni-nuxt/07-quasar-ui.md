# Lezione 7 — Quasar UI

## Cos'è Quasar

Quasar è una libreria di componenti UI per Vue 3. Fornisce centinaia di componenti pronti all'uso (bottoni, form, drawer, card, tabelle, dialog...) seguendo il design Material Design di Google.

Nel progetto usiamo `nuxt-quasar-ui` che integra Quasar direttamente con Nuxt.

---

## Configurazione in nuxt.config.ts

```ts
quasar: {
  plugins: ['Notify', 'Dialog'],   // plugin JS da abilitare
  extras: {
    fontIcons: ['material-icons'], // icone Material (array, non stringa!)
  },
  config: {
    dark: true,                    // tema scuro
    brand: {
      primary: '#6366f1',          // indigo
      secondary: '#8b5cf6',        // viola
      accent: '#6366f1',
      dark: '#1e1e2e',
      positive: '#10b981',         // verde
      negative: '#ef4444',         // rosso
      info: '#60a5fa',             // azzurro
      warning: '#f59e0b',          // arancio
    },
  },
},
```

**Errore comune:** `fontIcons` deve essere un array. Se scrivi `fontIcons: 'material-icons'` (stringa), Nuxt la itera carattere per carattere e cerca `m.css`, `a.css`, `t.css`... → errore di build.

---

## Layout — `q-layout`

Il layout di Quasar usa una sintassi speciale per descrivere la posizione degli elementi:

```vue
<q-layout view="lHh Lpr lFf">
```

`view` descrive la griglia 3×3 dell'app:
```
| header  |
| sidebar | content | right-sidebar |
| footer  |
```

La stringa `"lHh Lpr lFf"` si legge così:
- `l` = left sidebar (fissa)
- `H` = header (fisso)
- `h` = header (scorre con il contenuto)
- `L` = left sidebar (sovrascrive l'header)
- `p` = page container
- `r` = right sidebar (scorre)
- `l` = left sidebar (footer)
- `F` = footer fisso
- `f` = footer scorrevole

Per i dettagli vai sulla documentazione Quasar. La configurazione `"lHh Lpr lFf"` è quella più comune per una app con sidebar e navbar.

---

## `q-drawer` — sidebar laterale

```vue
<q-drawer
  v-model="sidebarAperta"   ← true/false controlla se è aperta
  :width="260"              ← larghezza in pixel
  :breakpoint="1024"        ← sotto questa larghezza diventa overlay
  bordered                  ← mostra il bordo
  side="left"               ← default: left. Per destra: side="right"
>
  <AppSidebar />
</q-drawer>
```

Per la sidebar destra info (visibile solo su desktop):
```vue
<q-drawer
  v-if="!$q.screen.lt.lg"   ← nasconde sotto 1024px
  side="right"
  :width="200"
  :model-value="true"        ← sempre aperta
  :overlay="false"           ← non copre il contenuto
>
  <AppSidebarInfo />
</q-drawer>
```

`$q.screen.lt.lg` è un helper Quasar per i breakpoint: `lt` = "less than", `lg` = large (1024px).

---

## Breakpoint Quasar

| Nome | Larghezza |
|------|-----------|
| `xs` | < 600px |
| `sm` | 600–1024px |
| `md` | 1024–1440px |
| `lg` | 1440–1920px |
| `xl` | > 1920px |

```ts
// In un componente con <script setup>
const $q = useQuasar()

$q.screen.lt.md   // true se schermo < 1024px
$q.screen.gt.sm   // true se schermo > 1024px
$q.screen.width   // larghezza in pixel
```

---

## Componenti più usati

### Bottone
```vue
<q-btn
  label="Salva"
  color="primary"
  icon="save"
  @click="salva"
  :loading="caricamento"
  flat   ← senza sfondo
  round  ← circolare
/>
```

### Card
```vue
<q-card flat bordered class="mia-card">
  <q-card-section>
    Titolo della card
  </q-card-section>
  <q-card-actions align="right">
    <q-btn flat label="Annulla" />
    <q-btn color="primary" label="Conferma" />
  </q-card-actions>
</q-card>
```

### Input
```vue
<q-input
  v-model="nome"
  label="Nome utente"
  :rules="[val => !!val || 'Campo obbligatorio']"
  outlined
  dense
/>
```

### Icone (Material Icons)
```vue
<q-icon name="person" />
<q-icon name="delete" color="negative" />
<q-icon name="add_circle" size="24px" />
```

Lista completa: https://fonts.google.com/icons

---

## Plugin Notify — notifiche toast

Il plugin `Notify` mostra messaggi temporanei nell'angolo dello schermo.

```ts
const $q = useQuasar()

$q.notify({
  message: 'Utente salvato!',
  type: 'positive',        // positive, negative, warning, info
  position: 'top-right',  // top, bottom, left, right, center...
  timeout: 3000,           // millisecondi prima di sparire
  actions: [
    { label: 'Chiudi', color: 'white', handler: () => {} }
  ]
})
```

Nel progetto abbiamo wrappato questo nel composable `useToast()` per non ripetere la configurazione ogni volta.

---

## Plugin Dialog — dialog di conferma

```ts
const $q = useQuasar()

$q.dialog({
  title: 'Conferma eliminazione',
  message: 'Sei sicuro? L\'operazione non è reversibile.',
  cancel: { label: 'Annulla', flat: true },
  ok: { label: 'Elimina', color: 'negative' },
  persistent: true,  // non si chiude cliccando fuori
})
  .onOk(() => { /* utente ha confermato */ })
  .onCancel(() => { /* utente ha annullato */ })
```

---

## `useQuasar()` — accesso ai plugin e helper

```ts
const $q = useQuasar()

$q.notify(...)        // mostra una notifica
$q.dialog(...)        // apre una dialog
$q.dark.isActive      // true se dark mode attiva
$q.screen.lt.md       // breakpoint helper
$q.platform.is.mobile // true su mobile
```

In `app.vue` usiamo:
```ts
const $q = useQuasar()
// poi nel template:
// v-if="!$q.screen.lt.lg"
```

---

## Classi CSS di Quasar

Quasar include classi utility che puoi usare direttamente:

```vue
<div class="q-pa-md">     padding: 16px (md = 16px)
<div class="q-mb-lg">     margin-bottom: 24px
<div class="q-mt-sm">     margin-top: 8px
<div class="text-h4">     titolo H4
<div class="text-primary"> colore primary (indigo)
<div class="bg-dark">     sfondo dark
<div class="row q-gutter-md">  flexbox row con gap 16px
<div class="col-4">            3 colonne su 12
```

---

## Riepilogo

| Componente | Uso |
|------------|-----|
| `q-layout` | Struttura principale dell'app |
| `q-drawer` | Sidebar laterale |
| `q-page-container` | Contiene le pagine |
| `q-btn` | Bottone |
| `q-card` | Card con sezioni |
| `q-input` | Campo di input con validazione |
| `q-icon` | Icona Material |
| `Notify` plugin | Toast/notifiche |
| `Dialog` plugin | Dialog di conferma |
| `useQuasar()` | Accesso ai plugin e helper |

**Prossima lezione:** plugins Nuxt — codice eseguito all'avvio dell'app.
