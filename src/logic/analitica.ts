/** Geometria analítica: distância, ponto médio e reta por dois pontos. */

export interface P {
  x: number
  y: number
}

export const distance = (a: P, b: P) => Math.hypot(b.x - a.x, b.y - a.y)
export const midpoint = (a: P, b: P): P => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

/** Coeficiente angular m = Δy/Δx; `null` para reta vertical. */
export function slope(a: P, b: P): number | null {
  return b.x === a.x ? null : (b.y - a.y) / (b.x - a.x)
}

/** Equação reduzida y = mx + n, ou x = k para reta vertical. */
export function lineEquation(a: P, b: P): string {
  const m = slope(a, b)
  const f = (v: number) => (Number.isInteger(v) ? String(v) : v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })).replace('-', '−')
  if (m === null) return `x = ${f(a.x)}`
  const n = a.y - m * a.x
  const mPart = m === 0 ? '' : m === 1 ? 'x' : m === -1 ? '−x' : `${f(m)}x`
  if (!mPart) return `y = ${f(n)}`
  return `y = ${mPart}${n === 0 ? '' : n > 0 ? ` + ${f(n)}` : ` − ${f(-n)}`}`
}
