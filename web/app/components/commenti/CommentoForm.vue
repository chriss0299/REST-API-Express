<template>
  <q-card class="sp-card q-mb-lg">
    <q-card-section>
      <div class="form-title">Lascia un commento</div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-form @submit.prevent="invia" class="commento-form">
        <div class="form-row">
          <q-input v-model="form.nome" label="Nome*" outlined dense dark
            :rules="[v => !!v || 'Obbligatorio']" />
          <q-input v-model="form.email" type="email" label="Email*" outlined dense dark
            :rules="[v => !!v || 'Obbligatorio']" />
        </div>
        <q-input
          v-model="form.corpo"
          label="Commento*"
          type="textarea"
          outlined dark
          rows="3"
          :rules="[v => !!v || 'Obbligatorio']"
        />
        <div class="form-actions">
          <q-btn type="submit" label="Commenta" color="primary" unelevated icon="send" :loading="loading" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useCommentiStore } from '~/stores/commenti'
import { useStatisticheStore } from '~/stores/statistiche'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{ postId: number }>()
const store = useCommentiStore()
const statsStore = useStatisticheStore()
const authStore = useAuthStore()
const { isLoggedIn, utente } = useAuth()
const loading = ref(false)

const form = reactive({ nome: '', email: '', corpo: '' })

watch(utente, (u) => {
  if (u) {
    form.nome = form.nome || u.nome
    form.email = form.email || u.email
  }
}, { immediate: true })

async function invia() {
  if (!isLoggedIn.value) {
    authStore.apriLoginDialog('Devi accedere per pubblicare un commento')
    return
  }
  loading.value = true
  try {
    await store.crea({
      postId: props.postId,
      nome: form.nome,
      email: form.email,
      corpo: form.corpo,
    })
    await statsStore.aggiorna()
    form.corpo = ''
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

.commento-form {
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
}

@media (max-width: 600px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
