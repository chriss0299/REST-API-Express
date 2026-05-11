import { defineStore } from 'pinia'
import { useToast } from '~/composables/useToast'

export const useStatisticheStore = defineStore('statistiche', {
  state: () => ({
    conteggioUtenti: 0,
    conteggioPost: 0,
    conteggioCommenti: 0,
    loading: false,
  }),

  actions: {
    async aggiorna() {
      const config = useRuntimeConfig()
      this.loading = true
      try {
        const [utenti, post, commenti] = await Promise.all([
          fetch(`${config.public.apiBase}/utenti`).then(r => r.json()),
          fetch(`${config.public.apiBase}/post`).then(r => r.json()),
          fetch(`${config.public.apiBase}/commenti`).then(r => r.json()),
        ])
        this.conteggioUtenti = Array.isArray(utenti) ? utenti.length : 0
        this.conteggioPost = Array.isArray(post) ? post.length : (post?.meta?.totale ?? 0)
        this.conteggioCommenti = Array.isArray(commenti) ? commenti.length : 0
      } catch {
        // Mantiene i valori precedenti in caso di errore
      } finally {
        this.loading = false
      }
    },
  },
})
