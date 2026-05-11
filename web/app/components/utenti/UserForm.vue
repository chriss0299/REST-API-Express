<template>
  <q-card class="sp-card q-mb-lg">
    <q-card-section>
      <div class="form-title">
        {{ utenteInModifica ? 'Modifica Utente' : 'Nuovo Utente' }}
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-form @submit.prevent="invia" class="user-form">
        <div class="form-row">
          <q-input v-model="form.nome" label="Nome*" outlined dense dark
            :rules="[v => !!v || 'Obbligatorio']" />
          <q-input v-model="form.email" type="email" label="Email*" outlined dense dark
            :rules="[v => !!v || 'Obbligatorio']" />
        </div>

        <div class="form-row">
          <q-input v-model="form.citta" label="Città" outlined dense dark />
          <q-input v-model="form.telefono" label="Telefono" outlined dense dark />
        </div>

        <div class="form-row">
          <q-input
            v-model="form.codiceFiscale"
            label="Codice Fiscale*"
            outlined dense dark
            :rules="[v => !!v || 'Obbligatorio', v => /^[A-Za-z]{6}[0-9]{2}[A-Za-z][0-9]{2}[A-Za-z][0-9]{3}[A-Za-z]$/.test(v) || 'Formato non valido']"
          />
          <q-select
            v-model="form.sesso"
            :options="opzioniSesso"
            label="Sesso*"
            outlined dense dark emit-value map-options
            :rules="[v => !!v || 'Obbligatorio']"
          />
        </div>

        <div class="form-row">
          <q-input v-model="form.dataNascita" type="date" label="Data di nascita" outlined dense dark />
          <q-select
            v-if="adminViewAttiva"
            v-model="form.ruolo"
            :options="opzioniRuolo"
            label="Ruolo"
            outlined dense dark emit-value map-options
          />
        </div>

        <q-input
          v-if="!utenteInModifica"
          v-model="form.password"
          type="password"
          label="Password*"
          outlined dense dark
          :rules="[v => !!v || 'Obbligatorio', v => v.length >= 8 || 'Minimo 8 caratteri']"
        />

        <div class="form-actions">
          <q-btn
            v-if="utenteInModifica"
            flat
            label="Annulla"
            @click="$emit('annulla')"
          />
          <q-btn
            type="submit"
            :label="utenteInModifica ? 'Salva modifiche' : 'Crea utente'"
            color="primary"
            unelevated
            :loading="loading"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { Utente } from '~/types'
import { useUtentiStore } from '~/stores/utenti'
import { useStatisticheStore } from '~/stores/statistiche'

const props = defineProps<{ utenteInModifica?: Utente | null }>()
const emit = defineEmits<{ annulla: []; fatto: [] }>()

const store = useUtentiStore()
const statsStore = useStatisticheStore()
const { adminViewAttiva } = useAuth()
const loading = ref(false)

const opzioniSesso = [
  { label: 'Maschio', value: 'M' },
  { label: 'Femmina', value: 'F' },
  { label: 'Altro', value: 'Altro' },
]
const opzioniRuolo = [
  { label: 'Utente', value: 'utente' },
  { label: 'Admin', value: 'admin' },
]

const form = reactive({
  nome: '',
  email: '',
  citta: '',
  telefono: '',
  codiceFiscale: '',
  sesso: '' as 'M' | 'F' | 'Altro' | '',
  dataNascita: '',
  password: '',
  ruolo: 'utente' as 'utente' | 'admin',
})

watch(() => props.utenteInModifica, (u) => {
  if (u) {
    form.nome = u.nome
    form.email = u.email
    form.citta = u.citta ?? ''
    form.telefono = u.telefono ?? ''
    form.codiceFiscale = u.codiceFiscale ?? ''
    form.sesso = u.sesso ?? ''
    form.dataNascita = u.dataNascita ?? ''
    form.ruolo = u.ruolo ?? 'utente'
    form.password = ''
  }
}, { immediate: true })

async function invia() {
  loading.value = true
  try {
    if (props.utenteInModifica) {
      await store.aggiorna(props.utenteInModifica.id, { ...form })
    } else {
      await store.crea({ ...form } as Omit<Utente, 'id'> & { password: string })
    }
    await statsStore.aggiorna()
    emit('fatto')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-title {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
