/**
 * Balança de equações do 1º grau: a·x + b = c.
 * Lado esquerdo: `a` caixas de valor x e `b` pesos unitários.
 * Lado direito: `c` pesos unitários. O valor real de x é fixo durante o exercício,
 * então a balança só fica equilibrada quando a·x + b = c.
 */

export interface Balance {
  a: number
  b: number
  c: number
}

export type Scope = 'ambos' | 'esquerdo' | 'direito'
export type Operation = { kind: 'somar' | 'subtrair' | 'dividir'; value: number }

export const MAX_UNITS = 40

export function leftValue(state: Balance, x: number): number {
  return state.a * x + state.b
}

export function isBalanced(state: Balance, x: number): boolean {
  return leftValue(state, x) === state.c
}

export function solutionOf(problem: Balance): number {
  return (problem.c - problem.b) / problem.a
}

/** Diferença esquerda − direita: positiva quando a esquerda pesa mais. */
export function tilt(state: Balance, x: number): number {
  return leftValue(state, x) - state.c
}

export function isSolved(state: Balance, x: number): boolean {
  return state.a === 1 && state.b === 0 && state.c === x
}

/** Retorna o novo estado, ou `null` se a operação não puder ser feita com peças inteiras. */
export function applyOperation(state: Balance, op: Operation, scope: Scope): Balance | null {
  const left = scope !== 'direito'
  const right = scope !== 'esquerdo'
  const { value } = op
  if (!Number.isInteger(value) || value <= 0) return null

  if (op.kind === 'dividir') {
    if (value === 1) return null
    if (left && (state.a % value !== 0 || state.b % value !== 0)) return null
    if (right && state.c % value !== 0) return null
    return {
      a: left ? state.a / value : state.a,
      b: left ? state.b / value : state.b,
      c: right ? state.c / value : state.c,
    }
  }

  const delta = op.kind === 'somar' ? value : -value
  const next = { a: state.a, b: left ? state.b + delta : state.b, c: right ? state.c + delta : state.c }
  if (next.b < 0 || next.c < 0 || next.b > MAX_UNITS || next.c > MAX_UNITS) return null
  return next
}

export function formatSide(a: number, b: number): string {
  const xPart = a === 0 ? '' : a === 1 ? 'x' : `${a}x`
  if (!xPart) return String(b)
  return b === 0 ? xPart : `${xPart} + ${b}`
}

export function formatEquation(state: Balance, x: number): string {
  return `${formatSide(state.a, state.b)} ${isBalanced(state, x) ? '=' : '≠'} ${state.c}`
}
