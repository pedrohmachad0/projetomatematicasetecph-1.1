import {
  chapterLevels,
  CHAPTER_STORAGE,
  emptyProgress,
  type ChapterProgress,
  type ChapterQuestion,
} from '../data/chapter'

function shuffle<T>(items: T[], random: () => number) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function generateChapterQuestions(level: number, random = Math.random): ChapterQuestion[] {
  const pool: { expression: string; answer: number; a: number; b: number; op: string }[] = []
  const max = [10, 20, 10, 20, 30, 50, 10, 10, 50, 60][level - 1]
  if (!max) throw new Error('Fase inexistente')
  for (let a = 1; a <= max; a++)
    for (let b = 1; b <= max; b++) {
      if ((level <= 2 || level === 5 || level === 6 || level >= 9) && a + b <= max)
        pool.push({ expression: `${a} + ${b}`, answer: a + b, a, b, op: '+' })
      if ((level === 3 || level === 4 || level === 5 || level === 6 || level >= 9) && a >= b)
        pool.push({ expression: `${a} − ${b}`, answer: a - b, a, b, op: '−' })
      if (
        level >= 7 &&
        a <= (level === 7 ? 3 : level === 8 ? 5 : level === 9 ? 5 : 6) &&
        a >= (level === 7 ? 2 : level === 8 ? 4 : 2) &&
        b <= 10
      )
        pool.push({ expression: `${a} × ${b}`, answer: a * b, a, b, op: '×' })
    }
  let selected = shuffle(pool, random).slice(0, level === 10 ? 10 : 8)
  // Guarantee that the review includes multiplication and the boss includes combined operations.
  if (level >= 9) {
    selected = [
      ...shuffle(
        pool.filter((q) => q.op === '×'),
        random,
      ).slice(0, 3),
      ...shuffle(
        pool.filter((q) => q.op !== '×'),
        random,
      ).slice(0, level === 10 ? 7 : 5),
    ]
    selected = shuffle(selected, random)
  }
  const kinds = shuffle<ChapterQuestion['kind']>(
    level === 10
      ? ['choice', 'input', 'missing', 'truth', 'choice', 'input', 'choice', 'input', 'choice', 'choice']
      : ['choice', 'input', 'missing', 'truth', 'choice', 'input', 'choice', 'input'],
    random,
  )
  return selected.map((item, i) => {
    let { expression, answer } = item
    let kind = kinds[i]
    if (level === 10 && i >= 6) {
      const c = 2 + Math.floor(random() * 7)
      expression = `${item.a} ${item.op} ${item.b} + 2 × ${c}`
      answer += 2 * c
      kind = i % 2 ? 'input' : 'choice'
    }
    const explanation = `${expression} = ${answer}.${level === 10 && i >= 6 ? ' Resolva primeiro as multiplicações, depois as somas e subtrações.' : item.op === '×' ? ` São ${item.a} grupos de ${item.b}.` : item.op === '+' ? ' Somar é juntar as quantidades.' : ' Subtrair é encontrar quanto resta.'}`
    const base = {
      id: `${level}-${i}-${expression}`,
      kind,
      instruction: 'Escolha a resposta correta',
      expression: `${expression} = ?`,
      answer: String(answer),
      explanation,
    }
    if (kind === 'input') return { ...base, instruction: 'Digite o resultado' }
    if (kind === 'missing')
      return {
        ...base,
        instruction: 'Encontre o número que falta',
        expression: `${item.a} ${item.op} □ = ${item.answer}`,
        answer: String(item.b),
        explanation: `${item.a} ${item.op} ${item.b} = ${item.answer}. O número que falta é ${item.b}.`,
      }
    if (kind === 'truth') {
      const correct = random() >= 0.5
      return {
        ...base,
        instruction: 'Esta afirmação é verdadeira ou falsa?',
        expression: `${expression} = ${correct ? answer : answer + 1 + Math.floor(random() * 3)}`,
        answer: correct ? 'Verdadeiro' : 'Falso',
        choices: ['Verdadeiro', 'Falso'],
      }
    }
    const options = new Set([answer, Math.max(0, answer - 1), answer + 2, answer + 5])
    if (options.size < 4) options.add(answer + 3)
    return { ...base, choices: shuffle([...options].map(String), random) }
  })
}

export function hintForQuestion(question: ChapterQuestion): string {
  if (question.kind === 'truth')
    return 'Resolva a conta à esquerda e confira se o resultado mostrado está certo.'
  if (question.kind === 'missing') {
    if (question.expression.includes(' × '))
      return 'Pense em grupos iguais: qual número em cada grupo forma esse total?'
    if (question.expression.includes(' − '))
      return 'Para descobrir quanto foi retirado, subtraia o resultado do número inicial.'
    return 'Para achar a parcela que falta, subtraia do total o número que você já conhece.'
  }
  if (question.expression.includes(' × ') && /[+−]/.test(question.expression))
    return 'Resolva a multiplicação primeiro; depois faça a soma ou a subtração.'
  if (question.expression.includes(' × '))
    return 'Multiplicar é somar grupos iguais. Conte os grupos para achar o total.'
  if (question.expression.includes(' − '))
    return 'Comece pelo primeiro número e volte a quantidade indicada.'
  const addends = /^(\d+) \+ (\d+)/.exec(question.expression)
  if (addends && Math.max(Number(addends[1]), Number(addends[2])) >= 20)
    return 'Separe dezenas e unidades, some cada parte e junte os resultados.'
  if (addends && Number(addends[1]) + Number(addends[2]) > 10)
    return 'Complete uma dezena primeiro; depois some o que restar.'
  return 'Comece pelo maior número e conte para a frente a outra parcela.'
}

export function answerMatches(question: ChapterQuestion, input: string) {
  if (!input.trim()) return false
  if (question.kind === 'input' || question.kind === 'missing')
    return /^\d+$/.test(input.trim()) && Number(input) === Number(question.answer)
  return question.answer === input
}

export function readChapterProgress(): ChapterProgress {
  try {
    const parsed = JSON.parse(localStorage.getItem(CHAPTER_STORAGE) || 'null')
    if (!parsed || !Array.isArray(parsed.completed)) return emptyProgress()
    const completed: number[] = []
    for (let n = 1; n <= 10 && parsed.completed.includes(n); n++) completed.push(n)
    const best: ChapterProgress['best'] = {}
    for (const n of completed) {
      const record = parsed.best?.[n]
      if (
        record &&
        Number.isInteger(record.correct) &&
        record.correct >= 0 &&
        record.correct <= (n === 10 ? 10 : 8) &&
        Number.isFinite(record.seconds) &&
        record.seconds >= 0
      )
        best[n] = record
    }
    return {
      completed,
      best,
      xp: Number.isFinite(parsed.xp) && parsed.xp >= 0 ? Math.floor(parsed.xp) : 0,
    }
  } catch {
    return emptyProgress()
  }
}

export function recordVictory(
  progress: ChapterProgress,
  level: number,
  correct: number,
  seconds: number,
) {
  if (!chapterLevels[level - 1] || level > progress.completed.length + 1)
    return { progress, earned: 0 }
  const earned = progress.completed.includes(level) ? 0 : level === 10 ? 300 : 100
  const old = progress.best[level]
  return {
    earned,
    progress: {
      completed: [...new Set([...progress.completed, level])].sort((a, b) => a - b),
      xp: progress.xp + earned,
      best: {
        ...progress.best,
        [level]:
          !old || correct > old.correct || (correct === old.correct && seconds < old.seconds)
            ? { correct, seconds }
            : old,
      },
    },
  }
}

export function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`
}
