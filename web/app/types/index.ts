export interface Utente {
  id: number
  nome: string
  email: string
  citta?: string
  codiceFiscale?: string
  sesso?: 'M' | 'F' | 'Altro'
  dataNascita?: string
  telefono?: string
  ruolo?: 'utente' | 'admin'
}

export interface Post {
  id: number
  userId: number
  titolo: string
  corpo: string
}

export interface Commento {
  id: number
  postId: number
  nome: string
  email: string
  corpo: string
}

export interface AuthUser {
  id: number
  nome: string
  email: string
  ruolo: 'utente' | 'admin'
}

export interface PaginaMeta {
  pagina: number
  pagine: number
  totale: number
  limite: number
}

export interface RispostaPost {
  dati: Post[]
  meta: PaginaMeta
}
