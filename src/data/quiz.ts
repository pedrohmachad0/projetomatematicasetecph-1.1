export type QuizAnswerMode = 'choice' | 'input'
export type QuizAnswer = number | string
export type QuizTopic = 'soma' | 'subtracao' | 'pitagoras'

export interface QuizQuestion {
  id: string
  prompt: string
  answer: QuizAnswer
  answerMode: QuizAnswerMode
  options?: QuizAnswer[]
  explanation: string
}

export interface QuizTopicConfig {
  title: string
  description: string
  color: string
  icon: string
  simulatorPath: string
}

export const QUIZ_QUESTION_COUNT = 5

export const quizTopics: Record<QuizTopic, QuizTopicConfig> = {
  soma: { title: 'Quiz de Soma', description: 'Somas, compensação e parcelas desconhecidas.', color: '#2563eb', icon: '➕', simulatorPath: '/soma' },
  subtracao: { title: 'Quiz de Subtração', description: 'Diferenças, deslocamentos e termos desconhecidos.', color: '#7c3aed', icon: '➖', simulatorPath: '/subtracao' },
  pitagoras: { title: 'Quiz de Pitágoras', description: 'Lados, áreas, ângulos e classificação de triângulos.', color: '#0891b2', icon: '📐', simulatorPath: '/pitagoras' },
}
