import { useEffect, useState } from 'react'

const QUERY = '(max-width: 640px)'

/** Verdadeiro em telas estreitas (celular), para desenhar SVGs com letras maiores. */
export function useCompact(): boolean {
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && Boolean(window.matchMedia?.(QUERY).matches))
  useEffect(() => {
    const query = window.matchMedia?.(QUERY)
    if (!query) return
    const update = () => setCompact(query.matches)
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])
  return compact
}
