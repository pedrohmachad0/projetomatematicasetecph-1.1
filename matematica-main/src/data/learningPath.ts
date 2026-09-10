import { type QuizQuestion } from './quiz'

export type { QuizQuestion } from './quiz'

export interface LearningLevel {
  id: string
  order: number
  title: string
  subtitle: string
  objective: string
  color: string
  icon: string
}

export const QUESTIONS_PER_LEVEL = 5
export const MINIMUM_CORRECT_TO_COMPLETE = 3

export const learningLevels: LearningLevel[] = [
  {
    id: 'fundamentos',
    order: 1,
    title: 'Fundamentos',
    subtitle: 'Números até 10',
    objective: 'Somar, subtrair e descobrir o número que falta.',
    color: '#2563eb',
    icon: '🌱',
  },
  {
    id: 'rota-da-dezena',
    order: 2,
    title: 'Rota da Dezena',
    subtitle: 'Números até 20',
    objective: 'Calcular além da dezena e resolver operações inversas.',
    color: '#0891b2',
    icon: '🧭',
  },
  {
    id: 'calculo-mental',
    order: 3,
    title: 'Cálculo Mental',
    subtitle: 'Números até 50',
    objective: 'Usar estratégias rápidas em somas e subtrações maiores.',
    color: '#7c3aed',
    icon: '🧠',
  },
  {
    id: 'multiplicacao',
    order: 4,
    title: 'Poder da Multiplicação',
    subtitle: 'Tabuadas e incógnitas',
    objective: 'Multiplicar, dividir e completar sentenças matemáticas.',
    color: '#ea580c',
    icon: '⚡',
  },
  {
    id: 'desafio-final',
    order: 5,
    title: 'Desafio Final',
    subtitle: 'Operações combinadas',
    objective: 'Misturar todas as habilidades em problemas mais difíceis.',
    color: '#db2777',
    icon: '🏰',
  },
]

export type LearningQuestion = QuizQuestion
