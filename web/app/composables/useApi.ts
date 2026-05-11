import { useAuthStore } from '~/stores/auth'

export function useApi() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  async function $api<T>(percorso: string, opzioni: RequestInit & { body?: unknown } = {}, tentativo = 1): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    const risposta = await fetch(`${config.public.apiBase}${percorso}`, {
      ...opzioni,
      headers: { ...headers, ...(opzioni.headers as Record<string, string> || {}) },
      body: opzioni.body ? JSON.stringify(opzioni.body) : undefined,
    })

    if (risposta.status === 401 && tentativo === 1) {
      const ok = await authStore.refresh()
      if (ok) return $api<T>(percorso, opzioni, 2)
    }

    if (!risposta.ok) {
      const err = await risposta.json().catch(() => ({ errore: 'Errore di rete' }))
      throw new Error(err.errore || 'Errore sconosciuto')
    }

    return risposta.json() as Promise<T>
  }

  return { $api }
}
