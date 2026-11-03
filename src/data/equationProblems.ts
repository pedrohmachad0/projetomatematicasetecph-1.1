import type { Balance } from '../logic/equacoes'

export interface EquationProblem extends Balance {
  id: number
}

/** Equações a·x + b = c com solução inteira positiva. */
export const equationProblems: EquationProblem[] = [
  { id: 1, a: 1, b: 5, c: 12 },
  { id: 2, a: 2, b: 3, c: 11 },
  { id: 3, a: 3, b: 1, c: 10 },
  { id: 4, a: 2, b: 7, c: 15 },
  { id: 5, a: 4, b: 2, c: 18 },
  { id: 6, a: 3, b: 4, c: 19 },
  { id: 7, a: 5, b: 5, c: 30 },
  { id: 8, a: 2, b: 9, c: 21 },
]
