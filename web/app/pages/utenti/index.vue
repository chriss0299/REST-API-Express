<template>
  <q-page class="sp-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Persone</h1>
        <p class="page-subtitle">{{ store.lista.length }} utenti registrati</p>
      </div>
    </div>

    <!-- Form crea/modifica (solo admin in admin view) -->
    <UserForm
      v-if="adminViewAttiva"
      :utente-in-modifica="utenteInModifica"
      @fatto="onFormDone"
      @annulla="utenteInModifica = null"
    />

    <!-- Griglia utenti -->
    <UserGrid
      @vedi-post="vediPost"
      @modifica="avviaModifica"
    />
  </q-page>
</template>

<script setup lang="ts">
import type { Utente } from '~/types'
import { useUtentiStore } from '~/stores/utenti'

useHead({ title: 'Persone' })

const store = useUtentiStore()
const { adminViewAttiva } = useAuth()
const utenteInModifica = ref<Utente | null>(null)

onMounted(() => store.carica())

function avviaModifica(utente: Utente) {
  utenteInModifica.value = utente
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function onFormDone() {
  utenteInModifica.value = null
  store.carica()
}

function vediPost(utente: Utente) {
  navigateTo(`/post?userId=${utente.id}`)
}
</script>

<style scoped>
.sp-page {
  padding: 24px;
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}

.page-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 2px 0 0;
}
</style>
