<template>
  <div>
    <!-- Barra ricerca -->
    <q-input
      v-model="store.filtroRicerca"
      placeholder="Cerca per nome o email..."
      outlined
      dense
      dark
      clearable
      class="q-mb-md"
    >
      <template #prepend><q-icon name="search" /></template>
    </q-input>

    <!-- Loading -->
    <div v-if="store.loading" class="flex-center q-py-xl">
      <q-spinner color="primary" size="40px" />
    </div>

    <!-- Vuoto -->
    <q-banner v-else-if="!store.utentiFiltrati.length" class="empty-banner">
      <template #avatar><q-icon name="people_outline" color="grey" /></template>
      {{ store.filtroRicerca ? 'Nessun utente trovato per questa ricerca.' : 'Nessun utente registrato.' }}
    </q-banner>

    <!-- Griglia -->
    <div v-else class="user-grid">
      <UserCard
        v-for="utente in store.utentiFiltrati"
        :key="utente.id"
        :utente="utente"
        @vedi-post="$emit('vediPost', $event)"
        @modifica="$emit('modifica', $event)"
        @elimina="handleElimina"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Utente } from '~/types'
import { useUtentiStore } from '~/stores/utenti'
import { useStatisticheStore } from '~/stores/statistiche'

defineEmits<{
  vediPost: [utente: Utente]
  modifica: [utente: Utente]
}>()

const store = useUtentiStore()
const statsStore = useStatisticheStore()
const { confermaElimina } = useConfirm()

async function handleElimina(id: number) {
  const confermato = await confermaElimina('Eliminare questo utente? Tutti i suoi post e commenti saranno rimossi.')
  if (!confermato) return
  await store.elimina(id)
  await statsStore.aggiorna()
}
</script>

<style scoped>
.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

.empty-banner {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #3a3a52;
  border-radius: 10px;
  color: #94a3b8;
}

@media (max-width: 600px) {
  .user-grid {
    grid-template-columns: 1fr;
  }
}
</style>
