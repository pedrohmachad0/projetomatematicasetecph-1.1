export interface SubtractionProblem {
  id: number
  minuendo: number
  subtraendo: number
  description?: string
}

/**
 * 10 problemas pré-configurados para o simulador de Deslocamento na Reta.
 * Cada problema permite deslocar ambos os termos para levar o subtraendo
 * a uma dezena exata, facilitando o cálculo mental.
 */
export const subtractionProblems: SubtractionProblem[] = [
  { id: 1, minuendo: 27, subtraendo: 12, description: '27 − 12 — desloque −2 para 25 − 10' },
  { id: 2, minuendo: 34, subtraendo: 18, description: '34 − 18 — desloque +2 para 36 − 20' },
  { id: 3, minuendo: 45, subtraendo: 19, description: '45 − 19 — desloque +1 para 46 − 20' },
  { id: 4, minuendo: 52, subtraendo: 27, description: '52 − 27 — desloque +3 para 55 − 30' },
  { id: 5, minuendo: 71, subtraendo: 38, description: '71 − 38 — desloque +2 para 73 − 40' },
  { id: 6, minuendo: 63, subtraendo: 24, description: '63 − 24 — desloque −4 para 59 − 20' },
  { id: 7, minuendo: 82, subtraendo: 17, description: '82 − 17 — desloque +3 para 85 − 20' },
  { id: 8, minuendo: 45, subtraendo: 28, description: '45 − 28 — desloque +2 para 47 − 30' },
  { id: 9, minuendo: 61, subtraendo: 33, description: '61 − 33 — desloque −3 para 58 − 30' },
  { id: 10, minuendo: 74, subtraendo: 19, description: '74 − 19 — desloque +1 para 75 − 20' },
]

export function getSubtractionProblemById(id: number): SubtractionProblem | undefined {
  return subtractionProblems.find((p) => p.id === id)
}
