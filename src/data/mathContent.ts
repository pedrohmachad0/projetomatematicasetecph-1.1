/**
 * Estrutura preparada para expansão futura da plataforma
 * conforme seção 31 das regras do projeto.
 */

export type EducationLevel = 'fundamental-2' | 'medio'
export type Grade = '6º ano' | '7º ano' | '8º ano' | '9º ano' | '1º ano' | '2º ano' | '3º ano'

export interface MathContent {
  id: string
  title: string
  description: string
  educationLevel: EducationLevel
  grade: Grade
  category: string
  simulator?: string
  available: boolean
}

export const mathContents: MathContent[] = [
  {
    id: 'pitagoras',
    title: 'Explorador de Pitágoras',
    description: 'Visualize o Teorema de Pitágoras e a classificação de triângulos pelo ângulo.',
    educationLevel: 'fundamental-2',
    grade: '9º ano',
    category: 'Geometria',
    simulator: 'pitagoras',
    available: true,
  },
  {
    id: 'soma',
    title: 'Cálculo Mental – Soma',
    description: 'Compensação aditiva com material dourado.',
    educationLevel: 'fundamental-2',
    grade: '6º ano',
    category: 'Aritmética e Números',
    simulator: 'soma',
    available: true,
  },
  {
    id: 'subtracao',
    title: 'Cálculo Mental – Subtração',
    description: 'Deslocamento na reta numérica.',
    educationLevel: 'fundamental-2',
    grade: '6º ano',
    category: 'Aritmética e Números',
    simulator: 'subtracao',
    available: true,
  },
]
