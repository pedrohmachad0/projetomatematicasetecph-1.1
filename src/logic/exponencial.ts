/** Funções exponencial e logarítmica (inversas uma da outra). */

export const expValue = (base: number, x: number) => base ** x
export const logValue = (base: number, x: number) => Math.log(x) / Math.log(base)

export function expBehavior(base: number): 'crescente' | 'decrescente' | 'constante' {
  if (base > 1) return 'crescente'
  if (base < 1) return 'decrescente'
  return 'constante'
}

/** log_base(x) é o expoente y tal que base^y = x. */
export function checkLog(base: number, x: number): { y: number; back: number } {
  const y = logValue(base, x)
  return { y, back: base ** y }
}
