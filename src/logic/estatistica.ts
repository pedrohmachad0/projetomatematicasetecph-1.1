/** Medidas de tendência central e dispersão simples de um conjunto de dados. */

export function sortValues(values: number[]): number[] {
  return [...values].sort((a, b) => a - b)
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = sortValues(values)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
}

/** Todas as modas. Lista vazia quando nenhum valor se repete (conjunto amodal). */
export function modes(values: number[]): number[] {
  const counts = new Map<number, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  const highest = Math.max(0, ...counts.values())
  if (highest <= 1) return []
  return [...counts.entries()]
    .filter(([, count]) => count === highest)
    .map(([value]) => value)
    .sort((a, b) => a - b)
}

export function range(values: number[]): number {
  if (values.length === 0) return 0
  return Math.max(...values) - Math.min(...values)
}

export function frequencies(values: number[], min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => values.filter((value) => value === min + i).length)
}

export function describeModes(found: number[]): string {
  if (found.length === 0) return 'Amodal: nenhum valor se repete mais que os outros.'
  if (found.length === 1) return `Unimodal: o valor ${found[0]} é o mais frequente.`
  return `${found.length === 2 ? 'Bimodal' : 'Multimodal'}: ${found.join(', ')} empatam como mais frequentes.`
}
