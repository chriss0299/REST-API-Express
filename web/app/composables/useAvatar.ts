const PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#06b6d4', '#f97316', '#84cc16',
]

export function useAvatar() {
  function coloreAvatar(id: number): string {
    return PALETTE[id % PALETTE.length]
  }

  function inizialiAvatar(nome: string): string {
    return nome
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('')
  }

  return { coloreAvatar, inizialiAvatar }
}
