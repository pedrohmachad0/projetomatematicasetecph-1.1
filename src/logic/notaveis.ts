/** Produtos notáveis e valor numérico de expressões algébricas. */

export type Notable = 'soma' | 'diferenca' | 'produto'

export interface NotableResult {
  left: number
  right: number
  terms: { a2: number; ab2: number; b2: number }
  formula: string
}

export function notable(kind: Notable, a: number, b: number): NotableResult {
  if (kind === 'soma') return { left: (a + b) ** 2, right: a * a + 2 * a * b + b * b, terms: { a2: a * a, ab2: 2 * a * b, b2: b * b }, formula: '(a + b)² = a² + 2ab + b²' }
  if (kind === 'diferenca') return { left: (a - b) ** 2, right: a * a - 2 * a * b + b * b, terms: { a2: a * a, ab2: 2 * a * b, b2: b * b }, formula: '(a − b)² = a² − 2ab + b²' }
  return { left: (a + b) * (a - b), right: a * a - b * b, terms: { a2: a * a, ab2: 0, b2: b * b }, formula: '(a + b)(a − b) = a² − b²' }
}
