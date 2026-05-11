<template>
  <q-page class="sp-page">
    <AppBreadcrumb :voci="breadcrumb" />

    <div class="page-header">
      <h1 class="page-title">{{ titoloPagina }}</h1>
    </div>

    <CommentoForm v-if="isLoggedIn && filtroPostId" :post-id="filtroPostId" />

    <CommentoList />
  </q-page>
</template>

<script setup lang="ts">
import { useCommentiStore } from '~/stores/commenti'

const route = useRoute()
const store = useCommentiStore()
const { isLoggedIn } = useAuth()

const filtroPostId = computed(() => route.query.postId ? Number(route.query.postId) : null)
const titoloPost = computed(() => route.query.titolPost as string | undefined)

const titoloPagina = computed(() =>
  titoloPost.value ? `Commenti: ${titoloPost.value}` : 'Commenti',
)

useHead({ title: computed(() => titoloPagina.value) })

const breadcrumb = computed(() => {
  const b = [{ label: 'Commenti', icon: 'chat_bubble_outline', to: '/commenti' }]
  if (filtroPostId.value) {
    b.unshift({ label: 'Feed', icon: 'article', to: '/post' })
    if (titoloPost.value) {
      b.push({ label: titoloPost.value })
    }
  }
  return b
})

onMounted(() => carica())
watch(() => route.query, () => carica())

function carica() {
  store.carica(route.query.postId)
}
</script>

<style scoped>
.sp-page {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
}
</style>
