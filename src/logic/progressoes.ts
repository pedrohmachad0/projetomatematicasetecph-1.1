/** Progressões aritmética (PA) e geométrica (PG). */

export type ProgressionKind = 'pa' | 'pg'

export function paTerm(a1: number, r: number, n: number): number {
  return a1 + (n - 1) * r
}

export function pgTerm(a1: number, q: number, n: number): number {
  return a1 * q ** (n - 1)
}

export function paSum(a1: number, r: number, n: number): number {
  return ((a1 + paTerm(a1, r, n)) * n) / 2
}

export function pgSum(a1: number, q: number, n: number): number {
  if (q === 1) return a1 * n
  return (a1 * (q ** n - 1)) / (q - 1)
}

export function terms(kind: ProgressionKind, a1: number, step: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => (kind === 'pa' ? paTerm(a1, step, i + 1) : pgTerm(a1, step, i + 1)))
}

export function sum(kind: ProgressionKind, a1: number, step: number, n: number): number {
  return kind === 'pa' ? paSum(a1, step, n) : pgSum(a1, step, n)
}

export function classify(kind: ProgressionKind, a1: number, step: number): string {
  if (kind === 'pa') {
    if (step > 0) return 'crescente'
    if (step < 0) return 'decrescente'
    return 'constante'
  }
  if (a1 === 0 || step === 1) return 'constante'
  if (step === 0) return 'estacionária (zera a partir do 2º termo)'
  if (step < 0) return 'oscilante (os sinais se alternam)'
  if ((step > 1 && a1 > 0) || (step < 1 && a1 < 0)) return 'crescente'
  return 'decrescente'
}

export function formatTerm(value: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })
}
