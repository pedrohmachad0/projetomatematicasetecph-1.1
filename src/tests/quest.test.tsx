import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { emptyProgress, type ChapterQuestion } from '../data/chapter'
import { enemies, powerUps, QUEST_STATS_STORAGE } from '../data/quest'
import { recordVictory } from '../logic/chapter'
import {
  applyBattleStats,
  applyBlitzStats,
  availableCoins,
  blitzQuestion,
  buyPowerUp,
  comboCoins,
  consumePowerUp,
  damagePerHit,
  emptyStats,
  evaluateAchievements,
  hitsToDefeat,
  lensEliminations,
  readStats,
  starsFor,
  totalStars,
  unlockAchievements,
} from '../logic/quest'
import ChapterBattle from '../components/learn/ChapterBattle'
import BlitzChallenge from '../components/learn/BlitzChallenge'

function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

describe('MathQuest: regras do jogo', () => {
  beforeEach(() => localStorage.clear())

  it('cada fase comum tem um monstro e o HP zera exatamente no acerto que garante a vitória', () => {
    expect(enemies).toHaveLength(9)
    expect(hitsToDefeat(1)).toBe(6)
    expect(hitsToDefeat(10)).toBe(8)
    expect(damagePerHit(10)).toBe(12.5)
    expect(100 - hitsToDefeat(3) * damagePerHit(3)).toBeCloseTo(0, 10)
  })

  it('dá estrelas pelo desempenho', () => {
    expect(starsFor(1, 8)).toBe(3)
    expect(starsFor(1, 7)).toBe(2)
    expect(starsFor(1, 6)).toBe(1)
    expect(starsFor(10, 9)).toBe(2)
    expect(starsFor(10, 7)).toBe(0)
    const progress = recordVictory(recordVictory(emptyProgress(), 1, 8, 20).progress, 2, 6, 30).progress
    expect(totalStars(progress)).toBe(4)
  })

  it('combos rendem moedas só em vitórias', () => {
    expect(comboCoins(2)).toBe(0)
    expect(comboCoins(5)).toBe(6)
    const win = applyBattleStats(emptyStats(), { won: true, level: 2, maxCombo: 5, livesLeft: 3, seconds: 40, usedPowerUps: 0 })
    expect(win.bonus).toBe(6)
    expect(win.stats).toMatchObject({ bestCombo: 5, flawlessWins: 1, fastWins: 1, bonusCoins: 6 })
    const loss = applyBattleStats(emptyStats(), { won: false, level: 2, maxCombo: 4, livesLeft: 0, seconds: 40, usedPowerUps: 0 })
    expect(loss.bonus).toBe(0)
    expect(loss.stats.bestCombo).toBe(4)
  })

  it('compra itens apenas com moedas suficientes e gasta da mochila', () => {
    const potion = powerUps.find((item) => item.id === 'pocao')!
    expect(buyPowerUp(emptyStats(), 'pocao', potion.price - 1)).toBeNull()
    const bought = buyPowerUp(emptyStats(), 'pocao', 100)!
    expect(bought.items.pocao).toBe(1)
    expect(availableCoins(100, bought)).toBe(100 - potion.price)
    const used = consumePowerUp(bought, 'pocao')!
    expect(used.items.pocao).toBe(0)
    expect(used.powerUpsUsed).toBe(1)
    expect(consumePowerUp(used, 'pocao')).toBeNull()
  })

  it('a lupa nunca risca a resposta certa', () => {
    const question = { kind: 'choice', answer: '7', choices: ['5', '7', '9', '12'] } as ChapterQuestion
    for (let seed = 1; seed < 40; seed++) {
      const crossed = lensEliminations(question, seeded(seed))
      expect(crossed).toHaveLength(2)
      expect(crossed).not.toContain('7')
    }
    expect(lensEliminations({ ...question, choices: ['Verdadeiro', 'Falso'] })).toEqual([])
  })

  it('desbloqueia conquistas uma única vez', () => {
    const progress = recordVictory(emptyProgress(), 1, 8, 20).progress
    const first = unlockAchievements(progress, { ...emptyStats(), bestCombo: 5 })
    expect(first.fresh).toEqual(expect.arrayContaining(['primeiro-passo', 'combo-5']))
    expect(unlockAchievements(progress, first.stats).fresh).toEqual([])
    expect(evaluateAchievements(progress, emptyStats())).not.toContain('grum')
  })

  it('o Desafio Relâmpago guarda recorde e paga moedas', () => {
    const first = applyBlitzStats(emptyStats(), 11)
    expect(first).toMatchObject({ coins: 5, record: true })
    const second = applyBlitzStats(first.stats, 7)
    expect(second.record).toBe(false)
    expect(second.stats).toMatchObject({ blitzBest: 11, blitzPlays: 2, bonusCoins: 8 })
  })

  it('as perguntas do relâmpago respeitam as fases liberadas', () => {
    for (let seed = 1; seed < 60; seed++) {
      const question = blitzQuestion(30, 2, seeded(seed))
      expect(['choice', 'input']).toContain(question.kind)
      expect(question.expression).not.toContain('×')
    }
  })

  it('ignora dados corrompidos no armazenamento', () => {
    localStorage.setItem(QUEST_STATS_STORAGE, JSON.stringify({ bestCombo: -2, items: { pocao: 'x', lupa: 2 }, unlocked: ['grum', 'falsa'] }))
    const stats = readStats()
    expect(stats.bestCombo).toBe(0)
    expect(stats.items).toMatchObject({ pocao: 0, lupa: 2 })
    expect(stats.unlocked).toEqual(['grum'])
    localStorage.setItem(QUEST_STATS_STORAGE, '{')
    expect(readStats()).toEqual(emptyStats())
  })
})

describe('MathQuest: itens e relâmpago na tela', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })


  it('mostra o monstro da fase e usa itens da mochila', () => {
    const use = vi.fn(() => true)
    render(<ChapterBattle level={1} onExit={() => {}} onFinish={() => {}} items={{ pocao: 1, lupa: 1, escudo: 1, ampulheta: 1 }} onUsePowerUp={use} />)
    expect(screen.getByText('GOSMINHA')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Mochila/ }))
    expect(screen.queryByRole('button', { name: /Usar Ampulheta/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Usar Poção/ })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /Usar Escudo/ }))
    expect(use).toHaveBeenCalledWith('escudo')
    expect(screen.getByLabelText('Escudo ativo')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Mochila/ }))
    fireEvent.click(screen.getByRole('button', { name: /Usar Lupa/ }))
    fireEvent.click(screen.getByRole('button', { name: /Atacar/ }))
    fireEvent.click(screen.getByRole('button', { name: /Golpe rápido/ }))
    expect(document.querySelectorAll('.answer-option.crossed-option')).toHaveLength(2)
  })

  it('o relâmpago termina em 60 segundos e devolve a pontuação', () => {
    const finish = vi.fn()
    render(<BlitzChallenge unlocked={1} best={0} soundOn={false} onExit={() => {}} onFinish={finish} />)
    expect(screen.getByRole('timer')).toHaveTextContent('01:00')
    act(() => vi.advanceTimersByTime(60_000))
    expect(finish).toHaveBeenCalledWith({ score: 0, answered: 0, maxCombo: 0 })
  })
})

describe('MathQuest: guardiões dos outros livros', () => {
  afterEach(cleanup)
  it('a batalha do chefão do Livro II usa perguntas de frações e o guardião do livro', async () => {
    const { questBooks, guardianQuestions } = await import('../data/questBooks')
    const { topicBattle } = await import('../logic/questTopics')
    const book = questBooks[1]
    const phase = book.phases[5]
    render(
      <ChapterBattle
        level={6}
        onExit={() => {}}
        onFinish={() => {}}
        config={{ title: phase.title, bookLabel: 'LIVRO II', boss: true, enemy: phase.guardian, questions: topicBattle(phase.topics, guardianQuestions(book, 6)) }}
      />,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Baronesa Metade' })).toBeInTheDocument()
    expect(screen.getByText('BARONESA')).toBeInTheDocument()
    expect(screen.getByText(/LIVRO II/)).toBeInTheDocument()
    expect(screen.getByRole('timer', { name: 'Tempo restante' })).toHaveTextContent('03:00')
  })
})

describe('MathQuest: equilíbrio da batalha por turnos', () => {
  it('golpes, crítico e especial', async () => {
    const { moveDamage, enemyDamage, quickHitsToWin } = await import('../logic/battle')
    expect(moveDamage(1, false, 'rapido', 0)).toBe(17)
    expect(moveDamage(1, false, 'rapido', 3)).toBe(21)
    expect(moveDamage(10, true, 'rapido', 0)).toBe(13)
    expect(moveDamage(1, false, 'pesado', 0)).toBeGreaterThan(moveDamage(1, false, 'rapido', 0))
    expect(Math.ceil(100 / moveDamage(1, false, 'rapido', 0))).toBe(quickHitsToWin(false))
    expect(enemyDamage(false, true, false)).toBe(7)
    expect(enemyDamage(false, false, false)).toBe(28)
    expect(enemyDamage(false, false, true)).toBe(56)
  })

  it('jogando sem errar você sobrevive; com muitos erros, não', async () => {
    const { enemyDamage } = await import('../logic/battle')
    const perfect = Array.from({ length: 6 }, (_, turn) => enemyDamage(false, true, turn % 3 === 2)).reduce((a, b) => a + b, 0)
    expect(100 - perfect).toBeGreaterThan(0)
    const careless = 4 * enemyDamage(false, false, false)
    expect(100 - careless).toBeLessThanOrEqual(0)
  })

  it('a pontuação do recorde dá estrelas pelos erros', async () => {
    const { battleScore, starsFor } = await import('../logic/quest')
    expect(starsFor(1, battleScore(1, 0))).toBe(3)
    expect(starsFor(1, battleScore(1, 1))).toBe(2)
    expect(starsFor(1, battleScore(1, 5))).toBe(1)
    expect(starsFor(6, battleScore(6, 0, 6), 6)).toBe(3)
  })
})

describe('sistemas do guardião', () => {
  it('monstros da trilha caem com 3 golpes e o guardião tem três fases', async () => {
    const b = await import('../logic/battle')
    expect(b.quickHitsToWin(false, true)).toBe(3)
    expect(Math.ceil(100 / b.moveDamage(1, false, 'rapido', 0, true))).toBe(3)
    expect([b.guardianPhase(100), b.guardianPhase(66), b.guardianPhase(40), b.guardianPhase(33), b.guardianPhase(5)]).toEqual([1, 2, 2, 3, 3])
  })
  it('armadura, ponto fraco e fúria', async () => {
    const b = await import('../logic/battle')
    expect(b.armorBreak('rapido')).toBe(1)
    expect(b.armorBreak('pesado')).toBe(2)
    expect(b.armorBreak('chama')).toBe(b.GUARDIAN_ARMOR)
    expect(b.weaknessMultiplier('pesado', 'pesado')).toBe(b.WEAK_BONUS)
    expect(b.weaknessMultiplier('rapido', 'pesado')).toBe(b.RESISTED)
    expect(b.weaknessMultiplier('chama', 'pesado')).toBe(1)
    expect(['rapido', 'pesado']).toContain(b.pickWeakness(() => 0.9))
    expect(b.chargeEvery(3)).toBe(2)
    expect(b.chargeEvery(1)).toBe(3)
    expect(b.enemyDamage(false, false, false, true)).toBeGreaterThan(b.enemyDamage(false, false, false))
  })
})
