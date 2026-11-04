/** Análise combinatória: princípio fundamental, permutação, arranjo e combinação. */

export function factorial(n: number): number {
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

export const permutation = (n: number) => factorial(n)
export const arrangement = (n: number, p: number) => (p > n ? 0 : factorial(n) / factorial(n - p))
export const combination = (n: number, p: number) => (p > n ? 0 : factorial(n) / (factorial(p) * factorial(n - p)))

/** Todas as listas ordenadas de p elementos distintos (arranjos). */
export function listArrangements<T>(items: T[], p: number): T[][] {
  if (p === 0) return [[]]
  return items.flatMap((item, i) => listArrangements([...items.slice(0, i), ...items.slice(i + 1)], p - 1).map((rest) => [item, ...rest]))
}

/** Todos os grupos de p elementos em que a ordem não importa (combinações). */
export function listCombinations<T>(items: T[], p: number): T[][] {
  if (p === 0) return [[]]
  if (items.length < p) return []
  const [first, ...rest] = items
  return [...listCombinations(rest, p - 1).map((group) => [first, ...group]), ...listCombinations(rest, p)]
}

/** Princípio fundamental da contagem: multiplica as opções de cada etapa. */
export const countChoices = (options: number[]) => options.reduce((a, b) => a * b, 1)
