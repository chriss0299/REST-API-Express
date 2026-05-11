<template>
  <q-page class="sp-page">
    <AppBreadcrumb :voci="breadcrumb" />

    <div class="page-header">
      <div>
        <h1 class="page-title">{{ titolopagina }}</h1>
        <p v-if="store.meta" class="page-subtitle">
          {{ store.meta.totale }} post totali
        </p>
      </div>
    </div>

    <PostForm v-if="isLoggedIn" :precompil-userid="filtroUserId ?? undefined" />

    <PostList @vedi-commenti="vediCommenti" />
  </q-page>
</template>

<script setup lang="ts">
import type { Post } from '~/types'
import { usePostStore } from '~/stores/post'

const route = useRoute()
const store = usePostStore()
const { isLoggedIn } = useAuth()

const filtroUserId = computed(() => route.query.userId ? Number(route.query.userId) : null)
const filtroNomeUtente = computed(() => route.query.nomeUtente as string | undefined)

const titolopagina = computed(() =>
  filtroNomeUtente.value ? `Post di ${filtroNomeUtente.value}` : 'Feed',
)

useHead({ title: computed(() => titolopagina.value) })

const breadcrumb = computed(() => {
  const b = [{ label: 'Feed', icon: 'article', to: '/post' }]
  if (filtroUserId.value && filtroNomeUtente.value) {
    b.unshift({ label: 'Persone', icon: 'people', to: '/utenti' })
    b.push({ label: `Post di ${filtroNomeUtente.value}` })
  }
  return b
})

onMounted(() => carica())
watch(() => route.query, () => carica())

function carica() {
  store.carica(route.query.userId, route.query.pagina)
}

function vediCommenti(post: Post) {
  navigateTo(`/commenti?postId=${post.id}&titolPost=${encodeURIComponent(post.titolo)}`)
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

.page-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 2px 0 0;
}
</style>
