import { defineStore } from 'pinia'
import type { AuthUser } from '~/types'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    refreshToken: null as string | null,
    utente: null as AuthUser | null,
    loginDialogAperto: false,
    loginDialogMotivo: '' as string,
    adminViewAttiva: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken && !!state.utente,
    isAdmin: (state) => state.utente?.ruolo === 'admin',
  },

  actions: {
    idrata() {
      this.accessToken = localStorage.getItem('token')
      this.refreshToken = localStorage.getItem('refreshToken')
      const utenteStr = localStorage.getItem('utente')
      this.utente = utenteStr ? JSON.parse(utenteStr) : null
      this.adminViewAttiva = localStorage.getItem('adminView') === 'true'
    },

    _salvaInStorage() {
      if (this.accessToken) localStorage.setItem('token', this.accessToken)
      else localStorage.removeItem('token')
      if (this.refreshToken) localStorage.setItem('refreshToken', this.refreshToken)
      else localStorage.removeItem('refreshToken')
      if (this.utente) localStorage.setItem('utente', JSON.stringify(this.utente))
      else localStorage.removeItem('utente')
    },

    async login(email: string, password: string) {
      const config = useRuntimeConfig()
      const risposta = await $fetch<{
        accessToken: string
        refreshToken: string
        utente: AuthUser
      }>(`${config.public.apiBase}/auth/login`, {
        method: 'POST',
        body: { email, password },
      })
      this.accessToken = risposta.accessToken
      this.refreshToken = risposta.refreshToken
      this.utente = risposta.utente
      this._salvaInStorage()
      this.chiudiLoginDialog()
    },

    async registra(nome: string, email: string, password: string, citta?: string) {
      const config = useRuntimeConfig()
      const risposta = await $fetch<{
        token: string
        utente: AuthUser
      }>(`${config.public.apiBase}/auth/registrazione`, {
        method: 'POST',
        body: { nome, email, password, citta },
      })
      // Login automatico dopo registrazione
      await this.login(email, password)
    },

    async logout() {
      const config = useRuntimeConfig()
      if (this.refreshToken) {
        try {
          await $fetch(`${config.public.apiBase}/auth/logout`, {
            method: 'POST',
            body: { refreshToken: this.refreshToken },
          })
        } catch {}
      }
      this.accessToken = null
      this.refreshToken = null
      this.utente = null
      this.adminViewAttiva = false
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('utente')
      localStorage.removeItem('adminView')
    },

    async refresh(): Promise<boolean> {
      if (!this.refreshToken) {
        await this.logout()
        this.apriLoginDialog()
        return false
      }
      const config = useRuntimeConfig()
      try {
        const risposta = await $fetch<{ accessToken: string }>(
          `${config.public.apiBase}/auth/refresh`,
          { method: 'POST', body: { refreshToken: this.refreshToken } },
        )
        this.accessToken = risposta.accessToken
        localStorage.setItem('token', this.accessToken)
        return true
      } catch {
        await this.logout()
        this.apriLoginDialog()
        return false
      }
    },

    apriLoginDialog(motivo = '') {
      this.loginDialogMotivo = motivo
      this.loginDialogAperto = true
    },

    chiudiLoginDialog() {
      this.loginDialogAperto = false
      this.loginDialogMotivo = ''
    },

    toggleAdminView() {
      this.adminViewAttiva = !this.adminViewAttiva
      localStorage.setItem('adminView', String(this.adminViewAttiva))
    },
  },
})
