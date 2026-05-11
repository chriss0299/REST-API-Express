<template>
  <div>
    <div v-if="store.loading" class="flex-center q-py-xl">
      <q-spinner color="primary" size="40px" />
    </div>

    <q-banner v-else-if="!store.lista.length" class="empty-banner">
      <template #avatar><q-icon name="chat_bubble_outline" color="grey" /></template>
      Nessun commento ancora. Sii il primo!
    </q-banner>

    <div v-else class="commento-list">
      <CommentoCard
        v-for="commento in store.lista"
        :key="commento.id"
        :commento="commento"
        @elimina="handleElimina"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCommentiStore } from '~/stores/commenti'
import { useStatisticheStore } from '~/stores/statistiche'

const store = useCommentiStore()
const statsStore = useStatisticheStore()
const { confermaElimina } = useConfirm()

async function handleElimina(id: number) {
  const confermato = await confermaElimina('Eliminare questo commento?')
  if (!confermato) return
  await store.elimina(id)
  await statsStore.aggiorna()
}
</script>

<style scoped>
.commento-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-banner {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #3a3a52;
  border-radius: 10px;
  color: #94a3b8;
}
</style>
