import { act, fireEvent, render, screen, cleanup, within } from '@testing-library/react'
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

describe('batalha por turnos', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  /** Responde a pergunta aberta, certo ou errado, e confirma. */
  function answerCurrent(correct: boolean) {
    const expression = document.getElementById('question-expression')!.textContent!
    const instruction = document.getElementById('question-instruction')!.textContent!
    const kind: ChapterQuestion['kind'] = instruction.includes('afirmação') ? 'truth' : instruction.includes('falta') ? 'missing' : instruction.includes('Digite') ? 'input' : 'choice'
    const answer = mathAnswer({ expression, kind } as ChapterQuestion)
    const input = screen.queryByRole('textbox')
    if (input) fireEvent.change(input, { target: { value: correct ? answer : '99999' } })
    else {
      const options = Array.from(document.querySelectorAll<HTMLButtonElement>('.answer-option:not(:disabled)'))
      fireEvent.click(options.find((o) => (correct ? o.textContent!.slice(1) === answer : o.textContent!.slice(1) !== answer))!)
    }
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/ }))
  }
  const continueTurn = () => fireEvent.click(screen.getByRole('button', { name: /Continuar|Ver resultado/ }))
  const attack = (move: RegExp = /Golpe rápido/) => {
    fireEvent.click(screen.getByRole('button', { name: /Atacar/ }))
    fireEvent.click(screen.getByRole('button', { name: move }))
  }
  const enemyHp = () => Number(screen.getByRole('meter', { name: /Vida de/ }).getAttribute('aria-valuenow'))
  const playerHp = () => Number(screen.getByRole('meter', { name: 'Sua vida' }).getAttribute('aria-valuenow'))

  it('o menu tem atacar, esquivar, mochila e fugir', () => {
    render(<ChapterBattle level={1} onExit={() => {}} onFinish={() => {}} />)
    for (const name of [/Atacar/, /Esquivar/, /Mochila/, /Fugir/]) expect(screen.getAllByRole('button', { name }).length).toBeGreaterThan(0)
    expect(enemyHp()).toBe(100)
    expect(playerHp()).toBe(100)
  })

  it('golpes certos tiram vida do monstro; o contra-ataque é mais fraco quando você acerta', () => {
    const finish = vi.fn()
    render(<ChapterBattle level={1} role="minion" onExit={() => {}} onFinish={finish} />)
    attack()
    answerCurrent(true)
    expect(screen.getByText('Resposta certa!')).toBeInTheDocument()
    expect(enemyHp()).toBe(66)
    continueTurn()
    expect(playerHp()).toBe(93)
    continueTurn()
    attack()
    answerCurrent(false)
    expect(enemyHp()).toBe(66)
    continueTurn()
    expect(playerHp()).toBe(65)
  })

  it('o monstro da trilha cai com três golpes rápidos e informa os erros', () => {
    const finish = vi.fn()
    render(<ChapterBattle level={1} role="minion" onExit={() => {}} onFinish={finish} />)
    for (let i = 0; i < 3; i++) {
      act(() => vi.advanceTimersByTime(1000))
      attack()
      answerCurrent(true)
      continueTurn()
      if (i < 2) continueTurn()
    }
    expect(screen.getByText(/foi derrotado!/)).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(15000))
    continueTurn()
    expect(finish).toHaveBeenCalledWith(expect.objectContaining({ won: true, correct: 3, answered: 3, mistakes: 0, reason: 'complete', seconds: 3 }))
  })

  it('o guardião começa com armadura: os primeiros acertos só a racham', () => {
    render(<ChapterBattle level={1} onExit={() => {}} onFinish={() => {}} />)
    expect(screen.getByText(/FASE 1\/3/)).toBeInTheDocument()
    expect(screen.getByLabelText('Armadura 2 de 2')).toBeInTheDocument()
    attack()
    answerCurrent(true)
    expect(enemyHp()).toBe(100)
    expect(screen.getByText(/rachou a armadura/)).toBeInTheDocument()
    continueTurn()
    continueTurn()
    attack()
    answerCurrent(true)
    expect(enemyHp()).toBe(100)
    expect(screen.getByText(/armadura de .* quebrou/)).toBeInTheDocument()
    continueTurn()
    continueTurn()
    attack()
    answerCurrent(true)
    // Terceiro acerto seguido: golpe crítico (+25%).
    expect(enemyHp()).toBe(100 - Math.ceil((100 / 6) * 1.25))
  })

  it('o guardião muda de fase: ponto fraco e depois fúria com tempo por pergunta', () => {
    vi.spyOn(Math, 'random').mockImplementation(randomSeed(3))
    render(<ChapterBattle level={1} onExit={() => {}} onFinish={() => {}} />)
    // Quebra a armadura (golpe pesado quebra 2) e tira vida até a fase 2.
    for (let i = 0; i < 4 && enemyHp() > 66; i++) {
      attack(/Golpe pesado/)
      answerCurrent(true)
      continueTurn()
      continueTurn()
    }
    expect(screen.getByText(/FASE 2\/3/)).toBeInTheDocument()
    expect(screen.getByText(/fraco contra:/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Atacar/ }))
    expect(screen.getAllByText(/PONTO FRACO ×1,6|resiste ×0,6/).length).toBe(2)
    fireEvent.click(screen.getByRole('button', { name: /Voltar/ }))
    // Um erro zera o combo; depois um golpe rápido leva o guardião à fúria sem derrotá-lo.
    attack()
    answerCurrent(false)
    continueTurn()
    continueTurn()
    for (let i = 0; i < 4 && enemyHp() > 33; i++) {
      attack()
      answerCurrent(true)
      continueTurn()
      continueTurn()
    }
    expect(enemyHp()).toBeGreaterThan(0)
    expect(screen.getByText(/FASE 3\/3/)).toBeInTheDocument()
    attack()
    expect(screen.getByRole('timer', { name: /Tempo da pergunta/ })).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(21000))
    expect(screen.getByText(/O tempo acabou/)).toBeInTheDocument()
  })

  it('a chama especial só libera com energia cheia e dá dano enorme', () => {
    render(<ChapterBattle level={1} role="minion" onExit={() => {}} onFinish={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Atacar/ }))
    expect(screen.getByRole('button', { name: /Chama especial/ })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /Voltar/ }))
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByRole('button', { name: /Esquivar/ }))
      answerCurrent(true)
      continueTurn()
      continueTurn()
    }
    attack(/Chama especial/)
    answerCurrent(true)
    expect(enemyHp()).toBe(0)
  })

  it('perde quando a vida chega a zero', () => {
    const finish = vi.fn()
    render(<ChapterBattle level={1} onExit={() => {}} onFinish={finish} />)
    for (let turn = 0; turn < 10 && !screen.queryByRole('button', { name: 'Ver resultado' }); turn++) {
      attack()
      answerCurrent(false)
      continueTurn()
      if (!screen.queryByRole('button', { name: 'Ver resultado' })) continueTurn()
    }
    expect(playerHp()).toBe(0)
    continueTurn()
    expect(finish).toHaveBeenCalledWith(expect.objectContaining({ won: false, reason: 'lives', correct: 0, livesLeft: 0 }))
  })

  it('a esquiva certa faz o próximo ataque passar direto e carrega energia', () => {
    render(<ChapterBattle level={1} onExit={() => {}} onFinish={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Esquivar/ }))
    answerCurrent(true)
    continueTurn()
    expect(playerHp()).toBe(100)
    expect(screen.getByText(/você se esquivou/)).toBeInTheDocument()
    expect(screen.getByLabelText('Energia 1 de 3')).toBeInTheDocument()
  })

  it('o monstro avisa antes de um golpe carregado', () => {
    render(<ChapterBattle level={1} onExit={() => {}} onFinish={() => {}} />)
    for (let i = 0; i < 2; i++) {
      attack()
      answerCurrent(true)
      continueTurn()
      if (i < 1) continueTurn()
    }
    expect(screen.getAllByText(/concentrando energia/).length).toBeGreaterThan(0)
    continueTurn()
    attack()
    answerCurrent(true)
    const before = playerHp()
    continueTurn()
    expect(before - playerHp()).toBe(14)
  })

  it('escolhe ações e respostas pelo teclado', () => {
    const random = randomSeed(14)
    vi.spyOn(Math, 'random').mockImplementation(random)
    render(<ChapterBattle level={1} onExit={() => {}} onFinish={() => {}} />)
    fireEvent.keyDown(window, { key: '1', code: 'Digit1' })
    fireEvent.keyDown(window, { key: '1', code: 'Digit1' })
    const expression = document.getElementById('question-expression')!.textContent!
    const answer = mathAnswer({ expression, kind: 'choice' } as ChapterQuestion)
    const options = Array.from(document.querySelectorAll<HTMLButtonElement>('.answer-option'))
    const index = options.findIndex((o) => o.textContent!.slice(1) === answer)
    expect(index).toBeGreaterThanOrEqual(0)
    fireEvent.keyDown(window, { key: String(index + 1), code: `Numpad${index + 1}` })
    expect(options[index].getAttribute('aria-pressed')).toBe('true')
    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' })
    expect(screen.getByText('Resposta certa!')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: ' ', code: 'Space' })
    expect(screen.getByText(/contra-atacou/)).toBeInTheDocument()
  })

  it('o chefe termina quando o tempo real expira', () => {
    const finish = vi.fn()
    render(<ChapterBattle level={10} onExit={() => {}} onFinish={finish} />)
    act(() => vi.advanceTimersByTime(BOSS_SECONDS * 1000))
    expect(finish).toHaveBeenCalledTimes(1)
    expect(finish).toHaveBeenCalledWith(expect.objectContaining({ won: false, reason: 'time', seconds: BOSS_SECONDS }))
  })

  it('sem limite de tempo o chefe não acaba pelo relógio, e as letras grandes funcionam', () => {
    const finish = vi.fn()
    const { container } = render(<ChapterBattle level={10} onExit={() => {}} onFinish={finish} noTimer bigText />)
    act(() => vi.advanceTimersByTime((BOSS_SECONDS + 30) * 1000))
    expect(finish).not.toHaveBeenCalled()
    expect(screen.getByRole('timer', { name: 'Tempo decorrido' })).toBeInTheDocument()
    expect(container.querySelector('.big-text-mode')).not.toBeNull()
  })

  it('fugir pede confirmação', () => {
    const exit = vi.fn()
    render(<ChapterBattle level={1} onExit={exit} onFinish={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /Fugir/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuar lutando' }))
    expect(exit).not.toHaveBeenCalled()
    fireEvent.keyDown(window, { key: '4', code: 'Digit4' })
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Fugir' }))
    expect(exit).toHaveBeenCalled()
  })
})
