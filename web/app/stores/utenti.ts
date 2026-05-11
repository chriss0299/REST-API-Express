import { defineStore } from 'pinia'
import type { Utente } from '~/types'
import { useToast } from '~/composables/useToast'

export const useUtentiStore = defineStore('utenti', {
  state: () => ({
    lista: [] as Utente[],
    loading: false,
    filtroRicerca: '',
  }),

  getters: {
    utentiFiltrati: (state): Utente[] => {
      if (!state.filtroRicerca) return state.lista
      const q = state.filtroRicerca.toLowerCase()
      return state.lista.filter(u =>
        u.nome.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
      )
    },
  },

  actions: {
    async carica() {
      const { $api } = useApi()
      const { toastErrore } = useToast()
      this.loading = true
      try {
        this.lista = await $api<Utente[]>('/utenti')
      } catch (e: unknown) {
        toastErrore((e as Error).message || 'Errore nel caricamento utenti')
      } finally {
        this.loading = false
      }
    },

    async crea(dati: Omit<Utente, 'id'> & { password: string }) {
      const { $api } = useApi()
      const { toastSuccesso, toastErrore } = useToast()
      try {
        const nuovo = await $api<Utente>('/utenti', { method: 'POST', body: dati })
        this.lista.push(nuovo)
        toastSuccesso('Utente creato')
        return nuovo
      } catch (e: unknown) {
        toastErrore((e as Error).message || 'Errore nella creazione utente')
        throw e
      }
    },

    async aggiorna(id: number, dati: Partial<Utente>) {
      const { $api } = useApi()
      const { toastSuccesso, toastErrore } = useToast()
      try {
        const aggiornato = await $api<Utente>(`/utenti/${id}`, { method: 'PUT', body: dati })
        const idx = this.lista.findIndex(u => u.id === id)
        if (idx !== -1) this.lista[idx] = aggiornato
        toastSuccesso('Utente aggiornato')
        return aggiornato
      } catch (e: unknown) {
        toastErrore((e as Error).message || 'Errore nell\'aggiornamento utente')
        throw e
      }
    },

    async elimina(id: number) {
      const { $api } = useApi()
      const { toastSuccesso, toastErrore } = useToast()
      try {
        await $api(`/utenti/${id}`, { method: 'DELETE' })
        this.lista = this.lista.filter(u => u.id !== id)
        toastSuccesso('Utente eliminato')
      } catch (e: unknown) {
        toastErrore((e as Error).message || 'Errore nell\'eliminazione utente')
        throw e
      }
    },
  },
})
