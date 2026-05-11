<template>
  <q-dialog v-model="aperto" persistent>
    <q-card class="confirm-card">
      <q-card-section class="row items-center gap-sm">
        <q-icon name="warning" color="negative" size="28px" />
        <div>
          <div class="confirm-title">{{ titolo }}</div>
          <div class="confirm-msg">{{ messaggio }}</div>
        </div>
      </q-card-section>
      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn flat label="Annulla" color="grey" @click="$emit('risposta', false)" />
        <q-btn unelevated label="Elimina" color="negative" @click="$emit('risposta', true)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
defineProps<{
  aperto: boolean
  titolo?: string
  messaggio?: string
}>()

withDefaults(defineProps<{ titolo?: string; messaggio?: string }>(), {
  titolo: 'Conferma eliminazione',
  messaggio: 'Sei sicuro? Questa azione non può essere annullata.',
})

defineEmits<{ risposta: [valore: boolean] }>()
</script>

<style scoped>
.confirm-card {
  min-width: 320px;
  background: #2a2a3e;
  border: 1px solid #3a3a52;
  border-radius: 12px;
}

.confirm-title {
  font-weight: 600;
  color: #f1f5f9;
  font-size: 15px;
}

.confirm-msg {
  color: #94a3b8;
  font-size: 13px;
  margin-top: 2px;
}
</style>
