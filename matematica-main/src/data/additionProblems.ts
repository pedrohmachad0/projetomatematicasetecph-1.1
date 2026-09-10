export interface AdditionProblem {
  id: number
  a: number
  b: number
  description?: string
}

/**
 * 10 problemas pré-configurados para o simulador de Compensação Aditiva.
 * Cada problema foi escolhido para permitir estratégias de compensação
 * que levem a dezenas exatas.
 */
export const additionProblems: AdditionProblem[] = [
  { id: 1, a: 12, b: 27, description: '12 + 27 — transfira 2 para formar 10 + 29' },
  { id: 2, a: 18, b: 25, description: '18 + 25 — transfira 2 para formar 20 + 23' },
  { id: 3, a: 17, b: 16, description: '17 + 16 — transfira 3 para formar 20 + 13' },
  { id: 4, a: 14, b: 29, description: '14 + 29 — transfira 1 para formar 15 + 28 ou 6 para 20 + 23' },
  { id: 5, a: 26, b: 14, description: '26 + 14 — transfira 4 para formar 30 + 10' },
  { id: 6, a: 19, b: 23, description: '19 + 23 — transfira 1 para formar 20 + 22' },
  { id: 7, a: 35, b: 18, description: '35 + 18 — transfira 5 para formar 30 + 23 ou 2 para 37 + 16' },
  { id: 8, a: 47, b: 22, description: '47 + 22 — transfira 3 para formar 50 + 19' },
  { id: 9, a: 38, b: 15, description: '38 + 15 — transfira 2 para formar 40 + 13' },
  { id: 10, a: 29, b: 16, description: '29 + 16 — transfira 1 para formar 30 + 15' },
]

export function getAdditionProblemById(id: number): AdditionProblem | undefined {
  return additionProblems.find((p) => p.id === id)
}
