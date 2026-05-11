<template>
  <q-card class="user-card sp-card">
    <q-card-section class="user-card-body">
      <UserAvatar :nome="utente.nome" :id="utente.id" :size="48" />
      <div class="user-info">
        <div class="user-name">{{ utente.nome }}</div>
        <div class="user-email">{{ utente.email }}</div>
        <div v-if="utente.citta" class="user-city">
          <q-icon name="location_on" size="12px" />{{ utente.citta }}
        </div>
        <span v-if="adminViewAttiva" :class="utente.ruolo === 'admin' ? 'badge-admin' : 'badge-utente'">
          {{ utente.ruolo ?? 'utente' }}
        </span>
      </div>
    </q-card-section>

    <q-card-actions class="user-card-actions">
      <q-btn
        flat
        dense
        label="Post"
        icon="article"
        color="primary"
        size="sm"
        @click="$emit('vediPost', utente)"
      />
      <q-space />
      <template v-if="puoModificare">
        <q-btn flat dense round icon="edit" color="grey" size="sm" @click="$emit('modifica', utente)">
          <q-tooltip>Modifica</q-tooltip>
        </q-btn>
      </template>
      <template v-if="puoEliminare">
        <q-btn flat dense round icon="delete" color="negative" size="sm" @click="$emit('elimina', utente.id)">
          <q-tooltip>Elimina</q-tooltip>
        </q-btn>
      </template>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { Utente } from '~/types'

const props = defineProps<{ utente: Utente }>()
defineEmits<{
  vediPost: [utente: Utente]
  modifica: [utente: Utente]
  elimina: [id: number]
}>()

const { utente: utenteLoggato, isAdmin, adminViewAttiva } = useAuth()

const puoModificare = computed(() =>
  adminViewAttiva.value || utenteLoggato.value?.id === props.utente.id,
)
const puoEliminare = computed(() =>
  adminViewAttiva.value && isAdmin.value,
)
</script>

<style scoped>
.user-card {
  transition: transform 0.15s, box-shadow 0.15s;
}
.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4) !important;
}

.user-card-body {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 14px 8px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.user-city {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
}

.user-card-actions {
  padding: 4px 10px 10px;
}
</style>
