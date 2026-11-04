/** Sistemas de duas equações do 1º grau: a·x + b·y = c. */

export interface LinearEq {
  a: number
  b: number
  c: number
}

export type SystemKind = 'unica' | 'impossivel' | 'indeterminado'

export function solveSystem(e1: LinearEq, e2: LinearEq): { kind: SystemKind; x?: number; y?: number } {
  const det = e1.a * e2.b - e2.a * e1.b
  if (Math.abs(det) < 1e-12) {
    const proportional = Math.abs(e1.a * e2.c - e2.a * e1.c) < 1e-12 && Math.abs(e1.b * e2.c - e2.b * e1.c) < 1e-12
    return { kind: proportional ? 'indeterminado' : 'impossivel' }
  }
  return { kind: 'unica', x: (e1.c * e2.b - e2.c * e1.b) / det, y: (e1.a * e2.c - e2.a * e1.c) / det }
}

/** y em função de x para desenhar a reta (quando b ≠ 0). */
export const lineY = (eq: LinearEq, x: number) => (eq.c - eq.a * x) / eq.b

export function formatEq(eq: LinearEq): string {
  const term = (coef: number, v: string, first: boolean) => {
    if (coef === 0) return ''
    const abs = Math.abs(coef)
    const num = abs === 1 ? '' : String(abs)
    const sign = coef < 0 ? (first ? '−' : ' − ') : first ? '' : ' + '
    return `${sign}${num}${v}`
  }
  const left = term(eq.a, 'x', true) + term(eq.b, 'y', eq.a === 0)
  return `${left || '0'} = ${eq.c < 0 ? '−' + Math.abs(eq.c) : eq.c}`
}
