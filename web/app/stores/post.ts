import { defineStore } from 'pinia'
import type { Post, PaginaMeta, RispostaPost } from '~/types'
import { useToast } from '~/composables/useToast'

const LIMITE = 5

export const usePostStore = defineStore('post', {
  state: () => ({
    lista: [] as Post[],
    loading: false,
    paginaAttuale: 1,
    meta: null as PaginaMeta | null,
    filtroUserId: null as number | null,
  }),

  actions: {
    async carica(userId?: number | string, pagina?: number | string) {
      const { $api } = useApi()
      const { toastErrore } = useToast()
      this.filtroUserId = userId ? Number(userId) : null
      this.paginaAttuale = pagina ? Number(pagina) : 1
      this.loading = true
      try {
        const params = new URLSearchParams()
        if (this.filtroUserId) params.set('userId', String(this.filtroUserId))
        params.set('pagina', String(this.paginaAttuale))
        params.set('limite', String(LIMITE))
        const risposta = await $api<RispostaPost | Post[]>(`/post?${params}`)
        if (Array.isArray(risposta)) {
          this.lista = risposta
          this.meta = null
        } else {
          this.lista = risposta.dati
          this.meta = risposta.meta
        }
      } catch (e: unknown) {
        toastErrore((e as Error).message || 'Errore nel caricamento post')
      } finally {
        this.loading = false
      }
    },

    async crea(dati: Omit<Post, 'id'>) {
      const { $api } = useApi()
      const { toastSuccesso, toastErrore } = useToast()
      try {
        const nuovo = await $api<Post>('/post', { method: 'POST', body: dati })
        this.lista.unshift(nuovo)
        toastSuccesso('Post pubblicato')
        return nuovo
      } catch (e: unknown) {
        toastErrore((e as Error).message || 'Errore nella creazione post')
        throw e
      }
    },

    async elimina(id: number) {
      const { $api } = useApi()
      const { toastSuccesso, toastErrore } = useToast()
      try {
        await $api(`/post/${id}`, { method: 'DELETE' })
        this.lista = this.lista.filter(p => p.id !== id)
        toastSuccesso('Post eliminato')
      } catch (e: unknown) {
        toastErrore((e as Error).message || 'Errore nell\'eliminazione post')
        throw e
      }
    },
  },
})
