import { describe, expect, it } from 'vitest'
import { learningLevels, QUESTIONS_PER_LEVEL } from '../data/learningPath'
import { QUIZ_QUESTION_COUNT, type QuizTopic } from '../data/quiz'
import { getLevelQuestions, isCorrectAnswer, shuffleQuestions } from '../logic/learning'
import { calculateQuizPoints, generateSimulatorQuiz } from '../logic/quiz'

function seededRandom(seed: number): () => number {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

describe('geração dos quizzes', () => {
  it('gera cinco questões únicas para cada nível da jornada', () => {
    for (const [index, level] of learningLevels.entries()) {
      const questions = getLevelQuestions(level, QUESTIONS_PER_LEVEL, seededRandom(index + 1))
      expect(questions).toHaveLength(QUESTIONS_PER_LEVEL)
      expect(new Set(questions.map((question) => question.prompt)).size).toBe(QUESTIONS_PER_LEVEL)
    }
  })

  it('gera tentativas diferentes ao iniciar novamente', () => {
    const firstAttempt = getLevelQuestions(learningLevels[2], QUESTIONS_PER_LEVEL, seededRandom(10))
    const secondAttempt = getLevelQuestions(learningLevels[2], QUESTIONS_PER_LEVEL, seededRandom(20))
    expect(secondAttempt.map((question) => question.prompt)).not.toEqual(firstAttempt.map((question) => question.prompt))
  })

  it('cria cinco questões válidas para todos os simuladores', () => {
    const topics: QuizTopic[] = ['soma', 'subtracao', 'pitagoras']
    topics.forEach((topic, index) => {
      const questions = generateSimulatorQuiz(topic, QUIZ_QUESTION_COUNT, seededRandom(index + 30))
      expect(questions).toHaveLength(QUIZ_QUESTION_COUNT)
      questions.forEach((question) => {
        expect(isCorrectAnswer(question, question.answer)).toBe(true)
        if (question.answerMode === 'choice') expect(question.options).toContain(question.answer)
      })
    })
  })

  it('aceita respostas numéricas digitadas e normaliza texto', () => {
    const numericQuestion = generateSimulatorQuiz('soma', 1, seededRandom(40))[0]
    expect(isCorrectAnswer(numericQuestion, String(numericQuestion.answer))).toBe(true)

    const textQuestion = generateSimulatorQuiz('pitagoras', 1, seededRandom(50))[0]
    expect(typeof textQuestion.answer).toBe('string')
    expect(isCorrectAnswer(textQuestion, String(textQuestion.answer).toLocaleLowerCase('pt-BR'))).toBe(true)
  })

  it('embaralha sem alterar a lista original', () => {
    const original = generateSimulatorQuiz('soma', 5, seededRandom(60))
    const snapshot = [...original]
    shuffleQuestions(original, seededRandom(61))
    expect(original).toEqual(snapshot)
  })
})

describe('pontuação por acerto e tempo', () => {
  it('não pontua respostas erradas', () => {
    expect(calculateQuizPoints(0, false)).toBe(0)
  })

  it('concede entre 100 e 200 pontos por resposta correta', () => {
    expect(calculateQuizPoints(0, true)).toBe(200)
    expect(calculateQuizPoints(10_000, true)).toBe(150)
    expect(calculateQuizPoints(20_000, true)).toBe(100)
    expect(calculateQuizPoints(60_000, true)).toBe(100)
  })
})
