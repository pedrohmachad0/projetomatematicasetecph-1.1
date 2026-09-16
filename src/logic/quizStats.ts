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

function safeNonNegativeInteger(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0
}

export function getQuizStats(): QuizStats {
  const emptyStats: QuizStats = {
    soma: emptyTopicStats(),
    subtracao: emptyTopicStats(),
    pitagoras: emptyTopicStats(),
    fracoes: emptyTopicStats(),
    porcentagem: emptyTopicStats(),
  }

  try {
    const storedValue = localStorage.getItem(QUIZ_STATS_STORAGE_KEY)
    const stored: unknown = storedValue ? JSON.parse(storedValue) : null
    if (!stored || typeof stored !== 'object') return emptyStats

    return {
      soma: normalizeTopicStats(stored, 'soma'),
      subtracao: normalizeTopicStats(stored, 'subtracao'),
      pitagoras: normalizeTopicStats(stored, 'pitagoras'),
      fracoes: normalizeTopicStats(stored, 'fracoes'),
      porcentagem: normalizeTopicStats(stored, 'porcentagem'),
    }
  } catch {
    return emptyStats
  }
}

function normalizeTopicStats(value: object, topic: QuizTopic): QuizTopicStats {
  const candidate = (value as Partial<QuizStats>)[topic]
  if (!candidate || typeof candidate !== 'object') return emptyTopicStats()

  return {
    attempts: safeNonNegativeInteger(candidate.attempts),
    answeredQuestions: safeNonNegativeInteger(candidate.answeredQuestions),
    correctAnswers: safeNonNegativeInteger(candidate.correctAnswers),
    bestScore: safeNonNegativeInteger(candidate.bestScore),
  }
}

export function recordQuizResult(topic: QuizTopic, correctAnswers: number, score: number, questionCount: number): QuizStats {
  const stats = getQuizStats()
  const current = stats[topic]

  stats[topic] = {
    attempts: current.attempts + 1,
    answeredQuestions: current.answeredQuestions + safeNonNegativeInteger(questionCount),
    correctAnswers: current.correctAnswers + safeNonNegativeInteger(correctAnswers),
    bestScore: Math.max(current.bestScore, safeNonNegativeInteger(score)),
  }

  try {
    localStorage.setItem(QUIZ_STATS_STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // Quiz completion must not crash when storage is blocked or full.
  }

  return stats
}
