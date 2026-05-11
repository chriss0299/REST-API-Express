import { defineStore } from 'pinia'
import type { Commento } from '~/types'
import { useToast } from '~/composables/useToast'

export const useCommentiStore = defineStore('commenti', {
  state: () => ({
    lista: [] as Commento[],
    loading: false,
    filtroPostId: null as number | null,
  }),

  actions: {
    async carica(postId?: number | string) {
      const { $api } = useApi()
      const { toastErrore } = useToast()
      this.filtroPostId = postId ? Number(postId) : null
      this.loading = true
      try {
        const url = this.filtroPostId ? `/commenti?postId=${this.filtroPostId}` : '/commenti'
        this.lista = await $api<Commento[]>(url)
      } catch (e: unknown) {
        toastErrore((e as Error).message || 'Errore nel caricamento commenti')
      } finally {
        this.loading = false
      }
    },

    async crea(dati: Omit<Commento, 'id'>) {
      const { $api } = useApi()
      const { toastSuccesso, toastErrore } = useToast()
      try {
        const nuovo = await $api<Commento>('/commenti', { method: 'POST', body: dati })
        this.lista.unshift(nuovo)
        toastSuccesso('Commento pubblicato')
        return nuovo
      } catch (e: unknown) {
        toastErrore((e as Error).message || 'Errore nella creazione commento')
        throw e
      }
    },

    async elimina(id: number) {
      const { $api } = useApi()
      const { toastSuccesso, toastErrore } = useToast()
      try {
        await $api(`/commenti/${id}`, { method: 'DELETE' })
        this.lista = this.lista.filter(c => c.id !== id)
        toastSuccesso('Commento eliminato')
      } catch (e: unknown) {
        toastErrore((e as Error).message || 'Errore nell\'eliminazione commento')
        throw e
      }
    },
  },
})
