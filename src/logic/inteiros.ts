/** Números inteiros: soma e subtração como deslocamentos na reta. */

export interface Move {
  start: number
  delta: number
  end: number
}

/** a + b: começa em a e anda b casas (para a direita se b > 0, para a esquerda se b < 0). */
export function addIntegers(a: number, b: number): Move {
  return { start: a, delta: b, end: a + b }
}

/** a − b é o mesmo que a + (−b): subtrair é somar o oposto. */
export function subtractIntegers(a: number, b: number): Move {
  return { start: a, delta: -b, end: a - b }
}

export const opposite = (n: number) => (n === 0 ? 0 : -n)
export const absolute = (n: number) => Math.abs(n)

export function compareIntegers(a: number, b: number): '<' | '=' | '>' {
  return a < b ? '<' : a > b ? '>' : '='
}

/** Escreve com sinal e parênteses quando negativo: 5, (−3). */
export function signed(n: number, wrap = true): string {
  if (n >= 0) return String(n)
  return wrap ? `(−${Math.abs(n)})` : `−${Math.abs(n)}`
}
