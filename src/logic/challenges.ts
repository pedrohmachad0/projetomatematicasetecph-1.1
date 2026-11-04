/** Metas dos cartões de desafio dos simuladores, guardadas no navegador. */

export const CHALLENGES_STORAGE = 'simuladores-desafios-v1'

export function readCompleted(simulator: string): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CHALLENGES_STORAGE) || '{}')
    const list = parsed?.[simulator]
    return Array.isArray(list) ? list.filter((id: unknown) => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function markCompleted(simulator: string, ids: string[]): string[] {
  const current = readCompleted(simulator)
  const next = [...new Set([...current, ...ids])]
  if (next.length === current.length) return current
  try {
    const parsed = JSON.parse(localStorage.getItem(CHALLENGES_STORAGE) || '{}')
    localStorage.setItem(CHALLENGES_STORAGE, JSON.stringify({ ...(parsed && typeof parsed === 'object' ? parsed : {}), [simulator]: next }))
  } catch {
    // Sem armazenamento, as metas valem só enquanto a página estiver aberta.
  }
  return next
}

export function clearCompleted(simulator: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(CHALLENGES_STORAGE) || '{}')
    if (parsed && typeof parsed === 'object') {
      delete parsed[simulator]
      localStorage.setItem(CHALLENGES_STORAGE, JSON.stringify(parsed))
    }
  } catch {
    // Ignora navegadores sem armazenamento.
  }
}
