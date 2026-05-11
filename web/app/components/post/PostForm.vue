<template>
  <q-card class="sp-card q-mb-lg">
    <q-card-section>
      <div class="form-title">Nuovo Post</div>
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-form @submit.prevent="invia" class="post-form">
        <q-input
          v-model="form.titolo"
          label="Titolo*"
          outlined dense dark
          :rules="[v => !!v || 'Obbligatorio']"
        />
        <q-input
          v-model="form.corpo"
          label="Contenuto*"
          type="textarea"
          outlined dark
          rows="4"
          :rules="[v => !!v || 'Obbligatorio']"
        />
        <div class="form-actions">
          <q-btn type="submit" label="Pubblica" color="primary" unelevated icon="send" :loading="loading" />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { usePostStore } from '~/stores/post'
import { useStatisticheStore } from '~/stores/statistiche'
import { useAuthStore } from '~/stores/auth'

const store = usePostStore()
const statsStore = useStatisticheStore()
const authStore = useAuthStore()
const { isLoggedIn } = useAuth()
const loading = ref(false)

const props = defineProps<{ precompilUserid?: number }>()

const form = reactive({ titolo: '', corpo: '' })

async function invia() {
  if (!isLoggedIn.value) {
    authStore.apriLoginDialog('Devi accedere per pubblicare un post')
    return
  }
  loading.value = true
  try {
    await store.crea({
      titolo: form.titolo,
      corpo: form.corpo,
      userId: props.precompilUserid ?? authStore.utente!.id,
    })
    await statsStore.aggiorna()
    form.titolo = ''
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

.post-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
