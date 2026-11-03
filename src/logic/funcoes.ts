/** Funções afim f(x) = ax + b e quadrática f(x) = ax² + bx + c. */

export type FunctionKind = 'afim' | 'quadratica'

export interface Coefficients {
  a: number
  b: number
  c: number
}

export function evaluate(kind: FunctionKind, { a, b, c }: Coefficients, x: number): number {
  return kind === 'afim' ? a * x + b : a * x * x + b * x + c
}

export function affineRoot(a: number, b: number): number | null {
  return a === 0 ? null : -b / a
}

export function affineBehavior(a: number): 'crescente' | 'decrescente' | 'constante' {
  if (a > 0) return 'crescente'
  if (a < 0) return 'decrescente'
  return 'constante'
}

export function discriminant({ a, b, c }: Coefficients): number {
  return b * b - 4 * a * c
}

/** Raízes reais em ordem crescente (0, 1 ou 2). Requer a ≠ 0. */
export function quadraticRoots(coefficients: Coefficients): number[] {
  const { a, b } = coefficients
  if (a === 0) return []
  const delta = discriminant(coefficients)
  if (delta < 0) return []
  if (delta === 0) return [-b / (2 * a)]
  const sqrt = Math.sqrt(delta)
  return [(-b - sqrt) / (2 * a), (-b + sqrt) / (2 * a)].sort((x, y) => x - y)
}

export function vertex(coefficients: Coefficients): { x: number; y: number } {
  const { a, b } = coefficients
  const x = -b / (2 * a)
  return { x, y: -discriminant(coefficients) / (4 * a) }
}

export function formatCoefficient(value: number): string {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

/** Monta a lei da função omitindo termos nulos, ex.: f(x) = 2x² − 3x + 1. */
export function formatLaw(kind: FunctionKind, { a, b, c }: Coefficients): string {
  const terms: Array<[number, string]> = kind === 'afim' ? [[a, 'x'], [b, '']] : [[a, 'x²'], [b, 'x'], [c, '']]
  let text = ''
  for (const [value, variable] of terms) {
    if (value === 0) continue
    const abs = Math.abs(value)
    const number = variable && abs === 1 ? '' : formatCoefficient(abs)
    if (!text) text = `${value < 0 ? '−' : ''}${number}${variable}`
    else text += ` ${value < 0 ? '−' : '+'} ${number}${variable}`
  }
  return `f(x) = ${text || '0'}`
}
