<template>
  <div>
    <div v-if="store.loading" class="flex-center q-py-xl">
      <q-spinner color="primary" size="40px" />
    </div>

    <q-banner v-else-if="!store.lista.length" class="empty-banner">
      <template #avatar><q-icon name="article" color="grey" /></template>
      Nessun post trovato.
    </q-banner>

    <div v-else class="post-list">
      <PostCard
        v-for="post in store.lista"
        :key="post.id"
        :post="post"
        @vedi-commenti="$emit('vediCommenti', $event)"
        @elimina="handleElimina"
      />
    </div>

    <!-- Paginazione -->
    <div v-if="store.meta && store.meta.pagine > 1" class="paginazione">
      <q-pagination
        v-model="paginaModel"
        :max="store.meta.pagine"
        color="primary"
        active-design="unelevated"
        direction-links
        @update:model-value="cambiaPagina"
      />
      <span class="pagina-info">
        Pagina {{ store.meta.pagina }} di {{ store.meta.pagine }}
        · {{ store.meta.totale }} post totali
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '~/types'
import { usePostStore } from '~/stores/post'
import { useStatisticheStore } from '~/stores/statistiche'

const emit = defineEmits<{ vediCommenti: [post: Post] }>()

const store = usePostStore()
const statsStore = useStatisticheStore()
const { confermaElimina } = useConfirm()
const route = useRoute()
const router = useRouter()

const paginaModel = computed({
  get: () => store.paginaAttuale,
  set: (v) => { store.paginaAttuale = v },
})

async function handleElimina(id: number) {
  const confermato = await confermaElimina('Eliminare questo post? Tutti i commenti associati saranno rimossi.')
  if (!confermato) return
  await store.elimina(id)
  await statsStore.aggiorna()
}

function cambiaPagina(pagina: number) {
  const query = { ...route.query, pagina: String(pagina) }
  router.push({ query })
}
</script>

<style scoped>
.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-banner {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid #3a3a52;
  border-radius: 10px;
  color: #94a3b8;
}

.paginazione {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}

.pagina-info {
  font-size: 12px;
  color: #64748b;
}
</style>
