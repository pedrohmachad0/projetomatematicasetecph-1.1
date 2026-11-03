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
