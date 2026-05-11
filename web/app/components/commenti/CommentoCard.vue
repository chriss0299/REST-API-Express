<template>
  <q-card class="commento-card sp-card">
    <q-card-section class="commento-body">
      <UserAvatar :nome="commento.nome" :id="commento.postId * 31 + commento.id" :size="36" />
      <div class="commento-content">
        <div class="commento-header">
          <span class="commento-nome">{{ commento.nome }}</span>
          <span class="commento-email">{{ commento.email }}</span>
          <q-btn
            v-if="puoEliminare"
            flat dense round icon="delete" color="negative" size="xs"
            class="q-ml-auto"
            @click="$emit('elimina', commento.id)"
          >
            <q-tooltip>Elimina commento</q-tooltip>
          </q-btn>
        </div>
        <div class="commento-testo">{{ commento.corpo }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { Commento } from '~/types'

const props = defineProps<{ commento: Commento }>()
defineEmits<{ elimina: [id: number] }>()

const { utente, isAdmin, adminViewAttiva, isLoggedIn } = useAuth()

const puoEliminare = computed(() =>
  isLoggedIn.value && (
    utente.value?.email === props.commento.email ||
    (adminViewAttiva.value && isAdmin.value)
  ),
)
</script>

<style scoped>
.commento-card {
  transition: transform 0.1s;
}
.commento-card:hover {
  transform: translateX(2px);
}

.commento-body {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
}

.commento-content {
  flex: 1;
  min-width: 0;
}

.commento-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.commento-nome {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

.commento-email {
  font-size: 11px;
  color: #64748b;
}

.commento-testo {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.6;
}
</style>
