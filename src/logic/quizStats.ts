import { type QuizTopic } from '../data/quiz'

export interface QuizTopicStats {
  attempts: number
  answeredQuestions: number
  correctAnswers: number
  bestScore: number
}

export type QuizStats = Record<QuizTopic, QuizTopicStats>

export const QUIZ_STATS_STORAGE_KEY = 'pemfm-quiz-stats'

const emptyTopicStats = (): QuizTopicStats => ({
  attempts: 0,
  answeredQuestions: 0,
  correctAnswers: 0,
  bestScore: 0,
})

export function getQuizStats(): QuizStats {
  const emptyStats: QuizStats = {
    soma: emptyTopicStats(),
    subtracao: emptyTopicStats(),
    pitagoras: emptyTopicStats(),
  }

  try {
    const storedValue = localStorage.getItem(QUIZ_STATS_STORAGE_KEY)
    const stored: unknown = storedValue ? JSON.parse(storedValue) : null
    if (!stored || typeof stored !== 'object') return emptyStats

    return {
      soma: normalizeTopicStats(stored, 'soma'),
      subtracao: normalizeTopicStats(stored, 'subtracao'),
      pitagoras: normalizeTopicStats(stored, 'pitagoras'),
    }
  } catch {
    return emptyStats
  }
}

function normalizeTopicStats(value: object, topic: QuizTopic): QuizTopicStats {
  const candidate = (value as Partial<QuizStats>)[topic]
  if (!candidate || typeof candidate !== 'object') return emptyTopicStats()

  return {
    attempts: typeof candidate.attempts === 'number' ? candidate.attempts : 0,
    answeredQuestions: typeof candidate.answeredQuestions === 'number' ? candidate.answeredQuestions : 0,
    correctAnswers: typeof candidate.correctAnswers === 'number' ? candidate.correctAnswers : 0,
    bestScore: typeof candidate.bestScore === 'number' ? candidate.bestScore : 0,
  }
}

export function recordQuizResult(topic: QuizTopic, correctAnswers: number, score: number): QuizStats {
  const stats = getQuizStats()
  const current = stats[topic]
  stats[topic] = {
    attempts: current.attempts + 1,
    answeredQuestions: current.answeredQuestions + 5,
    correctAnswers: current.correctAnswers + correctAnswers,
    bestScore: Math.max(current.bestScore, score),
  }
  localStorage.setItem(QUIZ_STATS_STORAGE_KEY, JSON.stringify(stats))
  return stats
}
