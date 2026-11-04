/** Razão, proporção e regra de três. */

export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

export function simplifyRatio(a: number, b: number): [number, number] {
  const d = gcd(a, b) || 1
  return [a / d, b / d]
}

/** Regra de três direta: a está para b assim como c está para x → x = b·c / a. */
export function directRule(a: number, b: number, c: number): number {
  return (b * c) / a
}

/** Regra de três inversa: a·b = c·x → x = a·b / c (ex.: trabalhadores × dias). */
export function inverseRule(a: number, b: number, c: number): number {
  return (a * b) / c
}

export function isProportion(a: number, b: number, c: number, d: number): boolean {
  return Math.abs(a * d - b * c) < 1e-9
}

export const round2 = (value: number) => Math.round(value * 100) / 100
