import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  authStore.idrata()

  // Apre il dialog di login dopo 800ms se non autenticato
  if (!authStore.isLoggedIn) {
    setTimeout(() => {
      authStore.apriLoginDialog()
    }, 800)
  }
})
