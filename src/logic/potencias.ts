/** Potenciação e radiciação. */

export function power(base: number, exponent: number): number {
  return base ** exponent
}

/** Expansão de aⁿ como multiplicações repetidas: "3 × 3 × 3". */
export function expandPower(base: number, exponent: number): string {
  if (exponent === 0) return '1'
  return Array.from({ length: exponent }, () => String(base)).join(' × ')
}

export function isPerfectSquare(n: number): boolean {
  const r = Math.round(Math.sqrt(n))
  return r * r === n
}

/** Raiz quadrada exata, ou os dois inteiros entre os quais ela fica. */
export function squareRootInfo(n: number): { exact: boolean; root: number; lower: number; upper: number } {
  const root = Math.sqrt(n)
  const lower = Math.floor(root)
  return { exact: isPerfectSquare(n), root, lower, upper: lower * lower === n ? lower : lower + 1 }
}

export function cubeRoot(n: number): number {
  return Math.round(Math.cbrt(n) * 1e9) / 1e9
}
