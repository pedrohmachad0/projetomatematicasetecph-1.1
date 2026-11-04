/** Experimentos aleatórios com probabilidade teórica e frequência observada. */

export type ExperimentId = 'moeda' | 'dado' | 'dois-dados'

export interface Experiment {
  id: ExperimentId
  label: string
  outcomes: string[]
  /** Quantos casos favoráveis cada resultado tem, de um total de `space`. */
  favorable: number[]
  space: number
}

export const experiments: Record<ExperimentId, Experiment> = {
  moeda: { id: 'moeda', label: 'Moeda', outcomes: ['Cara', 'Coroa'], favorable: [1, 1], space: 2 },
  dado: { id: 'dado', label: 'Dado', outcomes: ['1', '2', '3', '4', '5', '6'], favorable: [1, 1, 1, 1, 1, 1], space: 6 },
  'dois-dados': {
    id: 'dois-dados',
    label: 'Soma de dois dados',
    outcomes: ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    favorable: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1],
    space: 36,
  },
}

export function theoretical(experiment: Experiment): number[] {
  return experiment.favorable.map((count) => count / experiment.space)
}

/** Sorteia o índice de um resultado. `random` deve devolver valores em [0, 1). */
export function drawOutcome(id: ExperimentId, random: () => number = Math.random): number {
  const roll = () => Math.floor(random() * 6) + 1
  if (id === 'moeda') return random() < 0.5 ? 0 : 1
  if (id === 'dado') return roll() - 1
  return roll() + roll() - 2
}

export function runTrials(id: ExperimentId, trials: number, counts: number[], random: () => number = Math.random): number[] {
  const next = [...counts]
  for (let i = 0; i < trials; i++) next[drawOutcome(id, random)] += 1
  return next
}

export function relativeFrequencies(counts: number[]): number[] {
  const total = counts.reduce((sum, count) => sum + count, 0)
  return counts.map((count) => (total === 0 ? 0 : count / total))
}

/** Maior distância entre frequência observada e probabilidade teórica. */
export function maxDeviation(experiment: Experiment, counts: number[]): number {
  const expected = theoretical(experiment)
  return Math.max(...relativeFrequencies(counts).map((value, i) => Math.abs(value - expected[i])))
}

export function formatPercent(value: number): string {
  return `${(value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

export interface Roll {
  /** Índice do resultado em `outcomes`. */
  index: number
  /** Faces sorteadas: lado da moeda (0 cara, 1 coroa) ou valor de cada dado. */
  faces: number[]
}

/** Um lançamento com os detalhes de cada moeda ou dado, para desenhar. */
export function rollOnce(id: ExperimentId, random: () => number = Math.random): Roll {
  const roll = () => Math.floor(random() * 6) + 1
  if (id === 'moeda') {
    const side = random() < 0.5 ? 0 : 1
    return { index: side, faces: [side] }
  }
  if (id === 'dado') {
    const face = roll()
    return { index: face - 1, faces: [face] }
  }
  const a = roll()
  const b = roll()
  return { index: a + b - 2, faces: [a, b] }
}

/** Faz vários lançamentos e devolve as contagens e os últimos resultados. */
export function runRolls(id: ExperimentId, trials: number, counts: number[], keep = 12, random: () => number = Math.random): { counts: number[]; last: Roll[] } {
  const next = [...counts]
  const last: Roll[] = []
  for (let i = 0; i < trials; i++) {
    const r = rollOnce(id, random)
    next[r.index] += 1
    if (i >= trials - keep) last.push(r)
  }
  return { counts: next, last }
}
