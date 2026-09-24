/**
 * Catálogo central dos conteúdos da plataforma.
 * Novos simuladores devem ser registrados aqui para aparecerem no Hub.
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
  {
    id: 'fracoes',
    title: 'Explorador de Frações',
    description: 'Visualize partes de um inteiro, equivalência, simplificação e porcentagem.',
    educationLevel: 'fundamental-2',
    grade: '6º ano',
    category: 'Frações e Números Racionais',
    simulator: 'fracoes',
    available: true,
  },
  {
    id: 'porcentagem',
    title: 'Explorador de Porcentagem',
    description: 'Entenda porcentagens, descontos e acréscimos com visualização em 100 partes.',
    educationLevel: 'fundamental-2',
    grade: '7º ano',
    category: 'Razão, Proporção e Porcentagem',
    simulator: 'porcentagem',
    available: true,
  },
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
    id: 'pi',
    title: 'Explorador de π',
    description: 'Desenrole a circunferência e descubra a relação constante entre C e D.',
    educationLevel: 'fundamental-2',
    grade: '9º ano',
    category: 'Geometria',
    simulator: 'pi',
    available: true,
  },
]
