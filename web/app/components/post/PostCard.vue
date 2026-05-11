<template>
  <q-card class="post-card sp-card">
    <q-card-section class="post-header">
      <UserAvatar :nome="`Utente ${post.userId}`" :id="post.userId" :size="36" />
      <div class="post-meta">
        <span class="post-author">Utente #{{ post.userId }}</span>
        <span class="post-id">Post #{{ post.id }}</span>
      </div>
      <q-space />
      <q-btn
        v-if="puoEliminare"
        flat dense round icon="delete" color="negative" size="sm"
        @click="$emit('elimina', post.id)"
      >
        <q-tooltip>Elimina post</q-tooltip>
      </q-btn>
    </q-card-section>

    <q-card-section class="post-body">
      <div class="post-titolo">{{ post.titolo }}</div>
      <div class="post-corpo">{{ post.corpo }}</div>
    </q-card-section>

    <q-card-actions class="post-footer">
      <q-btn
        flat dense icon="chat_bubble_outline" label="Commenti" color="primary" size="sm"
        @click="$emit('vediCommenti', post)"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { Post } from '~/types'

const props = defineProps<{ post: Post }>()
defineEmits<{
  vediCommenti: [post: Post]
  elimina: [id: number]
}>()

const { utente, isAdmin, adminViewAttiva } = useAuth()

const puoEliminare = computed(() =>
  utente.value?.id === props.post.userId || (adminViewAttiva.value && isAdmin.value),
)
</script>

<style scoped>
.post-card {
  transition: transform 0.15s;
}
.post-card:hover {
  transform: translateY(-1px);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px 8px;
}

.post-meta {
  display: flex;
  flex-direction: column;
}

.post-author {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
}

.post-id {
  font-size: 11px;
  color: #64748b;
}

.post-body {
  padding: 0 14px 8px;
}

.post-titolo {
  font-size: 15px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 6px;
  line-height: 1.4;
}

.post-corpo {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.6;
}

.post-footer {
  padding: 4px 10px 10px;
  border-top: 1px solid #3a3a52;
}
</style>
