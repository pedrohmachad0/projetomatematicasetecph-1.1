import { act, fireEvent, render, screen, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  answerMatches,
  generateChapterQuestions,
  hintForQuestion,
  readChapterProgress,
  recordVictory,
} from '../logic/chapter'
import { BOSS_SECONDS, CHAPTER_STORAGE, emptyProgress, type ChapterQuestion } from '../data/chapter'
import ChapterBattle from '../components/learn/ChapterBattle'

function randomSeed(seed: number) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}
function evaluate(expression: string): number {
  const tokens = expression.trim().split(' ')
  let total = 0,
    product = Number(tokens[0])
  for (let i = 1; i < tokens.length; i += 2) {
    if (tokens[i] === '×') product *= Number(tokens[i + 1])
    else {
      total += product
      product = (tokens[i] === '−' ? -1 : 1) * Number(tokens[i + 1])
    }
  }
  return total + product
}
function mathAnswer(q: ChapterQuestion) {
  if (q.kind === 'missing') {
    const [left, right] = q.expression.split(' = ')
    const [a, op] = left.split(' ')
    return String(
      op === '+'
        ? Number(right) - Number(a)
        : op === '−'
          ? Number(a) - Number(right)
          : Number(right) / Number(a),
    )
  }
  const [expression, right] = q.expression.split(' = ')
  if (q.kind === 'truth') return evaluate(expression) === Number(right) ? 'Verdadeiro' : 'Falso'
  return String(evaluate(expression))
}

describe('Livro I: questões e recompensas', () => {
  beforeEach(() => localStorage.clear())
  it('gera questões matematicamente corretas em centenas de tentativas', () => {
    for (let level = 1; level <= 10; level++)
      for (let seed = 1; seed <= 35; seed++) {
        const questions = generateChapterQuestions(level, randomSeed(seed))
        expect(questions).toHaveLength(level === 10 ? 10 : 8)
        expect(new Set(questions.map((q) => q.expression)).size).toBe(questions.length)
        for (const q of questions) {
          expect(q.expression).not.toMatch(/[<>]/)
          expect(q.answer).toBe(mathAnswer(q))
          if (q.choices) {
            expect(q.choices).toContain(q.answer)
            expect(new Set(q.choices).size).toBe(q.choices.length)
          }
        }
      }
  })
  it('sorteia novas tentativas e reserva multiplicação às fases finais', () => {
    for (let level = 1; level <= 10; level++) {
      expect(generateChapterQuestions(level, randomSeed(7))).not.toEqual(
        generateChapterQuestions(level, randomSeed(99)),
      )
      if (level < 7)
        expect(generateChapterQuestions(level).some((q) => q.expression.includes('×'))).toBe(false)
    }
  })
  it('aceita inteiros com zero inicial e rejeita respostas vazias ou inválidas', () => {
    const q = { kind: 'input', answer: '4' } as ChapterQuestion
    expect(answerMatches(q, '04')).toBe(true)
    for (const answer of ['', ' ', '4abc', '4.2', '0x4'])
      expect(answerMatches(q, answer)).toBe(false)
  })
  it('oferece uma dica adequada ao tipo de conta sem revelar o resultado', () => {
    const questions = generateChapterQuestions(9, randomSeed(21))
    for (const question of questions) {
      const hint = hintForQuestion(question)
      expect(hint.length).toBeGreaterThan(20)
      expect(hint).not.toContain(`${question.answer}.`)
      if (question.kind === 'truth') expect(hint).toContain('confira')
      if (question.kind === 'missing') expect(hint).toMatch(/falta|total|resultado/)
    }
  })
  it('desbloqueia em sequência e concede a recompensa apenas uma vez', () => {
    const first = recordVictory(emptyProgress(), 1, 8, 32)
    expect(first.earned).toBe(100)
    const repeat = recordVictory(first.progress, 1, 8, 27)
    expect(repeat.earned).toBe(0)
    expect(repeat.progress.xp).toBe(100)
    expect(repeat.progress.best[1].seconds).toBe(27)
    expect(recordVictory(first.progress, 5, 8, 20).progress.completed).toEqual([1])
  })
  it('recupera dados inválidos de armazenamento sem quebrar a jornada', () => {
    localStorage.setItem(CHAPTER_STORAGE, 'invalid')
    expect(readChapterProgress()).toEqual(emptyProgress())
    localStorage.setItem(
      CHAPTER_STORAGE,
      JSON.stringify({ completed: [1, 3, 10], xp: -3, best: { 1: { correct: 'bad' } } }),
    )
    expect(readChapterProgress()).toEqual({ completed: [1], xp: 0, best: {} })
  })
})

describe('batalha: vidas, tempo e contagem', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })
  function answerCurrent(correct: boolean) {
    const expression = document.getElementById('question-expression')!.textContent!
    const instruction = document.getElementById('question-instruction')!.textContent!
    const kind: ChapterQuestion['kind'] = instruction.includes('afirmação')
        ? 'truth'
        : instruction.includes('falta')
          ? 'missing'
          : instruction.includes('Digite')
            ? 'input'
            : 'choice'
    const answer = mathAnswer({ expression, kind } as ChapterQuestion)
    const input = screen.queryByRole('textbox')
    if (input) fireEvent.change(input, { target: { value: correct ? answer : '99999' } })
    else {
      const options = Array.from(document.querySelectorAll<HTMLButtonElement>('.answer-option'))
      const option = options.find((o) =>
        correct ? o.textContent!.slice(1) === answer : o.textContent!.slice(1) !== answer,
      )!
      fireEvent.click(option)
    }
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/ }))
  }
  it('encerra após três erros sem contar respostas duas vezes', () => {
    const finish = vi.fn()
    render(<ChapterBattle level={1} onExit={() => {}} onFinish={finish} />)
    for (let i = 0; i < 3; i++) {
      answerCurrent(false)
      if (i < 2) fireEvent.click(screen.getByRole('button', { name: 'Próximo desafio' }))
    }
    expect(screen.getByLabelText('0 vidas restantes')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ver resultado' }))
    expect(finish).toHaveBeenCalledWith(
      expect.objectContaining({ won: false, correct: 0, answered: 3, reason: 'lives' }),
    )
  })
  it('conclui oito perguntas e congela o tempo na última resposta', () => {
    const finish = vi.fn()
    render(<ChapterBattle level={1} onExit={() => {}} onFinish={finish} />)
    for (let i = 0; i < 8; i++) {
      act(() => vi.advanceTimersByTime(1000))
      answerCurrent(true)
      if (i < 7) fireEvent.click(screen.getByRole('button', { name: 'Próximo desafio' }))
    }
    act(() => vi.advanceTimersByTime(15000))
    fireEvent.click(screen.getByRole('button', { name: 'Ver resultado' }))
    expect(finish).toHaveBeenCalledWith(
      expect.objectContaining({ won: true, correct: 8, answered: 8, seconds: 8 }),
    )
  })
  it('responde alternativas e verdadeiro/falso pelo teclado, com Enter e Espaço', () => {
    const random = randomSeed(14)
    vi.spyOn(Math, 'random').mockImplementation(random)
    const finish = vi.fn()
    render(<ChapterBattle level={1} onExit={() => {}} onFinish={finish} />)
    let sawTruth = false
    for (let i = 0; i < 8; i++) {
      const expression = document.getElementById('question-expression')!.textContent!
      const instruction = document.getElementById('question-instruction')!.textContent!
      const kind: ChapterQuestion['kind'] = instruction.includes('afirmação')
        ? 'truth'
        : instruction.includes('falta')
          ? 'missing'
          : instruction.includes('Digite')
            ? 'input'
            : 'choice'
      const answer = mathAnswer({ expression, kind } as ChapterQuestion)
      const input = screen.queryByRole('textbox')
      if (input) fireEvent.change(input, { target: { value: answer } })
      else {
        const options = Array.from(document.querySelectorAll<HTMLButtonElement>('.answer-option'))
        const selected = options.findIndex((option) => option.textContent!.slice(1) === answer)
        expect(selected).toBeGreaterThanOrEqual(0)
        const digit = String(selected + 1)
        fireEvent.keyDown(window, {
          key: digit,
          code: kind === 'truth' || i % 2 ? `Numpad${digit}` : `Digit${digit}`,
        })
        expect(options[selected].getAttribute('aria-pressed')).toBe('true')
        if (kind === 'truth') sawTruth = true
      }
      fireEvent.keyDown(window, i % 2 ? { key: ' ', code: 'Space' } : { key: 'Enter', code: 'Enter' })
      expect(screen.getByText('Resposta certa!')).toBeInTheDocument()
      fireEvent.keyDown(window, i % 2 ? { key: 'Enter', code: 'Enter' } : { key: ' ', code: 'Space' })
    }
    expect(sawTruth).toBe(true)
    expect(finish).toHaveBeenCalledWith(expect.objectContaining({ won: true, correct: 8 }))
  })
  it('o boss termina quando o tempo real expira', () => {
    const finish = vi.fn()
    render(<ChapterBattle level={10} onExit={() => {}} onFinish={finish} />)
    act(() => vi.advanceTimersByTime(BOSS_SECONDS * 1000))
    expect(finish).toHaveBeenCalledTimes(1)
    expect(finish).toHaveBeenCalledWith(
      expect.objectContaining({ won: false, reason: 'time', seconds: BOSS_SECONDS }),
    )
  })
  it('vence o chefe com oito acertos, dois erros e dez respostas antes do prazo', () => {
    const finish = vi.fn()
    render(<ChapterBattle level={10} onExit={() => {}} onFinish={finish} />)
    for (let i = 0; i < 10; i++) {
      act(() => vi.advanceTimersByTime(1000))
      answerCurrent(i >= 2)
      if (i < 9) fireEvent.click(screen.getByRole('button', { name: 'Próximo desafio' }))
    }
    act(() => vi.advanceTimersByTime(BOSS_SECONDS * 1000))
    expect(finish).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Ver resultado' }))
    expect(finish).toHaveBeenCalledWith(
      expect.objectContaining({ won: true, correct: 8, answered: 10, seconds: 10 }),
    )
  })
})
