import { type LearningLevel } from '../data/learningPath'
import { type QuizQuestion } from '../data/quiz'
import { generateLearningQuestions, isCorrectAnswer, shuffleItems } from './quiz'

export function shuffleQuestions(questions: QuizQuestion[], random: () => number = Math.random): QuizQuestion[] {
  return shuffleItems(questions, random)
}

export function getLevelQuestions(
  level: LearningLevel,
  quantity: number,
  random: () => number = Math.random,
): QuizQuestion[] {
  return generateLearningQuestions(level.id, quantity, random)
}

export { isCorrectAnswer }
