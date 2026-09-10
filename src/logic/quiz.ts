import { type QuizAnswer, type QuizAnswerMode, type QuizQuestion, type QuizTopic } from '../data/quiz'

type RandomSource = () => number

function randomInteger(min: number, max: number, random: RandomSource): number {
  return Math.floor(random() * (max - min + 1)) + min
}

export function shuffleItems<T>(items: T[], random: RandomSource = Math.random): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[swapIndex]
    shuffled[swapIndex] = current
  }
  return shuffled
}

function answerModeFor(index: number): QuizAnswerMode {
  return index % 2 === 0 ? 'choice' : 'input'
}

function numberOptions(answer: number, random: RandomSource): number[] {
  const candidates = new Set<number>([answer])
  const distance = Math.max(1, Math.round(Math.abs(answer) * 0.1))
  const offsets = shuffleItems([-2 * distance, -distance, distance, 2 * distance, -1, 1], random)
  for (const offset of offsets) {
    if (candidates.size === 3) break
    const candidate = answer + offset
    if (candidate >= 0) candidates.add(candidate)
  }
  return shuffleItems([...candidates], random)
}

function withOptions(question: Omit<QuizQuestion, 'options'>, random: RandomSource): QuizQuestion {
  if (question.answerMode === 'input' || typeof question.answer !== 'number') return question
  return { ...question, options: numberOptions(question.answer, random) }
}

function additionQuestion(maxResult: number, index: number, random: RandomSource): QuizQuestion {
  const a = randomInteger(1, Math.max(2, maxResult - 2), random)
  const b = randomInteger(1, Math.max(1, maxResult - a), random)
  const result = a + b
  const inverse = index % 3 === 2
  return withOptions({
    id: `soma-${index}-${a}-${b}`,
    prompt: inverse ? `${a} + X = ${result}. Quanto vale X?` : `${a} + ${b} = ?`,
    answer: inverse ? b : result,
    answerMode: answerModeFor(index),
    explanation: inverse ? `${result} − ${a} = ${b}, então X vale ${b}.` : `${a} + ${b} = ${result}.`,
  }, random)
}

function subtractionQuestion(maxValue: number, index: number, random: RandomSource): QuizQuestion {
  const minuend = randomInteger(Math.min(5, maxValue), maxValue, random)
  const subtrahend = randomInteger(1, Math.max(1, minuend), random)
  const result = minuend - subtrahend
  const inverse = index % 3 === 2
  return withOptions({
    id: `sub-${index}-${minuend}-${subtrahend}`,
    prompt: inverse ? `${minuend} − X = ${result}. Quanto vale X?` : `${minuend} − ${subtrahend} = ?`,
    answer: inverse ? subtrahend : result,
    answerMode: answerModeFor(index),
    explanation: inverse ? `A diferença entre ${minuend} e ${result} é ${subtrahend}.` : `${minuend} − ${subtrahend} = ${result}.`,
  }, random)
}

function multiplicationQuestion(index: number, random: RandomSource): QuizQuestion {
  const a = randomInteger(2, 10, random)
  const b = randomInteger(2, 10, random)
  const result = a * b
  const inverse = index % 3 === 2
  return withOptions({
    id: `mult-${index}-${a}-${b}`,
    prompt: inverse ? `${a} × X = ${result}. Quanto vale X?` : `${a} × ${b} = ?`,
    answer: inverse ? b : result,
    answerMode: answerModeFor(index),
    explanation: inverse ? `${result} ÷ ${a} = ${b}, então X vale ${b}.` : `${a} grupos de ${b} formam ${result}.`,
  }, random)
}

function pythagorasQuestion(index: number, random: RandomSource): QuizQuestion {
  const type = index % 4
  if (type === 0) {
    const angle = [30, 60, 90, 100, 120][randomInteger(0, 4, random)]
    const answer = angle < 90 ? 'Acutângulo' : angle === 90 ? 'Retângulo' : 'Obtusângulo'
    return { id: `pit-class-${index}-${angle}`, prompt: `Um triângulo tem um ângulo de ${angle}°. Como ele é classificado?`, answer, answerMode: 'choice', options: shuffleItems(['Acutângulo', 'Retângulo', 'Obtusângulo'], random), explanation: `Como ${angle}° ${angle < 90 ? 'é menor que' : angle === 90 ? 'é igual a' : 'é maior que'} 90°, o triângulo é ${answer.toLowerCase()}.` }
  }
  if (type === 1) {
    const angle = [60, 90, 110][randomInteger(0, 2, random)]
    const answer = angle < 90 ? '>' : angle === 90 ? '=' : '<'
    return { id: `pit-area-${index}-${angle}`, prompt: `Com ângulo de ${angle}°, qual relação é verdadeira? A² + B² __ C²`, answer, answerMode: 'choice', options: shuffleItems(['>', '=', '<'], random), explanation: `Para ${angle}°, a relação correta é A² + B² ${answer} C².` }
  }
  const triples = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [9, 12, 15]]
  const [a, b, c] = triples[randomInteger(0, triples.length - 1, random)]
  if (type === 2) {
    return withOptions({ id: `pit-side-${index}-${a}-${b}`, prompt: `Em um triângulo retângulo, os catetos medem ${a} e ${b}. Quanto mede a hipotenusa?`, answer: c, answerMode: answerModeFor(index), explanation: `${a}² + ${b}² = ${c}², então a hipotenusa mede ${c}.` }, random)
  }
  const sum = a ** 2 + b ** 2
  return withOptions({ id: `pit-square-${index}-${a}-${b}`, prompt: `Quanto vale ${a}² + ${b}²?`, answer: sum, answerMode: answerModeFor(index), explanation: `${a}² + ${b}² = ${a ** 2} + ${b ** 2} = ${sum}.` }, random)
}

function uniqueQuestions(factory: (index: number) => QuizQuestion, quantity: number): QuizQuestion[] {
  const questions: QuizQuestion[] = []
  const prompts = new Set<string>()
  let attempts = 0
  while (questions.length < quantity && attempts < quantity * 20) {
    const question = factory(attempts)
    attempts += 1
    if (prompts.has(question.prompt)) continue
    prompts.add(question.prompt)
    questions.push(question)
  }
  return questions
}

export function generateLearningQuestions(levelId: string, quantity: number, random: RandomSource = Math.random): QuizQuestion[] {
  return uniqueQuestions((index) => {
    if (levelId === 'fundamentos') return index % 2 === 0 ? additionQuestion(10, index, random) : subtractionQuestion(10, index, random)
    if (levelId === 'rota-da-dezena') return index % 2 === 0 ? additionQuestion(30, index, random) : subtractionQuestion(30, index, random)
    if (levelId === 'calculo-mental') return index % 2 === 0 ? additionQuestion(100, index, random) : subtractionQuestion(100, index, random)
    if (levelId === 'multiplicacao') return multiplicationQuestion(index, random)
    const mixedType = index % 3
    return mixedType === 0 ? additionQuestion(120, index, random) : mixedType === 1 ? subtractionQuestion(120, index, random) : multiplicationQuestion(index, random)
  }, quantity)
}

export function generateSimulatorQuiz(topic: QuizTopic, quantity: number, random: RandomSource = Math.random): QuizQuestion[] {
  return uniqueQuestions((index) => topic === 'soma' ? additionQuestion(120, index, random) : topic === 'subtracao' ? subtractionQuestion(120, index, random) : pythagorasQuestion(index, random), quantity)
}

export function isCorrectAnswer(question: QuizQuestion, submittedAnswer: QuizAnswer): boolean {
  if (typeof question.answer === 'number') {
    const numericAnswer = typeof submittedAnswer === 'number' ? submittedAnswer : Number(String(submittedAnswer).trim())
    return Number.isFinite(numericAnswer) && numericAnswer === question.answer
  }
  const normalize = (value: QuizAnswer) => String(value).trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return normalize(submittedAnswer) === normalize(question.answer)
}

export function calculateQuizPoints(elapsedMs: number, isCorrect: boolean): number {
  if (!isCorrect) return 0
  const speedBonus = Math.max(0, 100 - Math.floor(Math.max(0, elapsedMs) / 200))
  return 100 + speedBonus
}
