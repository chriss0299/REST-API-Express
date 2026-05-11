import { useAuthStore } from '~/stores/auth'

export function useAuth() {
  const store = useAuthStore()
  return {
    utente: computed(() => store.utente),
    isLoggedIn: computed(() => store.isLoggedIn),
    isAdmin: computed(() => store.isAdmin),
    adminViewAttiva: computed(() => store.adminViewAttiva),
    apriLoginDialog: (motivo?: string) => store.apriLoginDialog(motivo),
    logout: () => store.logout(),
    toggleAdminView: () => store.toggleAdminView(),
  }
}
