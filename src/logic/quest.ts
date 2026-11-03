import { achievements, powerUps, QUEST_STATS_STORAGE, type PowerUpId } from '../data/quest'
import type { ChapterProgress, ChapterQuestion } from '../data/chapter'
import { generateChapterQuestions } from './chapter'

/** Estado do jogo que não faz parte do progresso das fases. */
export interface QuestStats {
  bestCombo: number
  flawlessWins: number
  fastWins: number
  powerUpsUsed: number
  blitzPlays: number
  blitzBest: number
  /** Moedas ganhas fora das fases (combos e Desafio Relâmpago). */
  bonusCoins: number
  spentCoins: number
  chests: number
  items: Record<PowerUpId, number>
  unlocked: string[]
}

export const emptyStats = (): QuestStats => ({
  bestCombo: 0,
  flawlessWins: 0,
  fastWins: 0,
  powerUpsUsed: 0,
  blitzPlays: 0,
  blitzBest: 0,
  bonusCoins: 0,
  spentCoins: 0,
  chests: 0,
  items: { pocao: 0, lupa: 0, escudo: 0, ampulheta: 0 },
  unlocked: [],
})

const wholeNumber = (value: unknown) => (Number.isInteger(value) && (value as number) >= 0 ? (value as number) : 0)

export function readStats(): QuestStats {
  try {
    const parsed = JSON.parse(localStorage.getItem(QUEST_STATS_STORAGE) || 'null')
    if (!parsed || typeof parsed !== 'object') return emptyStats()
    const base = emptyStats()
    const items = { ...base.items }
    for (const id of Object.keys(items) as PowerUpId[]) items[id] = wholeNumber(parsed.items?.[id])
    return {
      bestCombo: wholeNumber(parsed.bestCombo),
      flawlessWins: wholeNumber(parsed.flawlessWins),
      fastWins: wholeNumber(parsed.fastWins),
      powerUpsUsed: wholeNumber(parsed.powerUpsUsed),
      blitzPlays: wholeNumber(parsed.blitzPlays),
      blitzBest: wholeNumber(parsed.blitzBest),
      bonusCoins: wholeNumber(parsed.bonusCoins),
      spentCoins: wholeNumber(parsed.spentCoins),
      chests: wholeNumber(parsed.chests),
      items,
      unlocked: Array.isArray(parsed.unlocked) ? parsed.unlocked.filter((id: unknown) => achievements.some((a) => a.id === id)) : [],
    }
  } catch {
    return emptyStats()
  }
}

/** Grava as estatísticas; devolve `false` se o navegador não permitir. */
export function writeStats(stats: QuestStats): boolean {
  try {
    localStorage.setItem(QUEST_STATS_STORAGE, JSON.stringify(stats))
    return true
  } catch {
    return false
  }
}

/** A última fase de cada livro é o chefão, com 10 perguntas; as outras têm 8. */
export const questionsInLevel = (level: number, phases = 10) => (level === phases ? 10 : 8)

/** Acertos necessários para vencer: só são permitidos 2 erros (3 corações). */
export const hitsToDefeat = (level: number, phases = 10) => questionsInLevel(level, phases) - 2

/** Dano por acerto, para que o monstro chegue a 0 de vida exatamente no acerto que garante a vitória. */
export const damagePerHit = (level: number, phases = 10) => 100 / hitsToDefeat(level, phases)

/** 3 estrelas: tudo certo; 2: um erro; 1: venceu. */
export function starsFor(level: number, correct: number, phases = 10): 0 | 1 | 2 | 3 {
  const total = questionsInLevel(level, phases)
  if (correct >= total) return 3
  if (correct === total - 1) return 2
  if (correct >= hitsToDefeat(level, phases)) return 1
  return 0
}

export function totalStars(progress: ChapterProgress, phases = 10): number {
  return progress.completed.reduce((sum, level) => sum + starsFor(level, progress.best[level]?.correct ?? 0, phases), 0)
}

/**
 * Pontuação gravada no recorde da fase: o total de perguntas menos os erros
 * (até 2). Assim 0 erro = 3 estrelas, 1 erro = 2 e 2 ou mais = 1.
 */
export function battleScore(level: number, mistakes: number, phases = 10): number {
  return questionsInLevel(level, phases) - Math.min(mistakes, 2)
}

/** Moedas extras por combo: 2 moedas por acerto a partir do 3º seguido. */
export function comboCoins(maxCombo: number): number {
  return Math.max(0, maxCombo - 2) * 2
}

export function availableCoins(earnedFromLevels: number, stats: QuestStats): number {
  return Math.max(0, earnedFromLevels + stats.bonusCoins - stats.spentCoins)
}

export function buyPowerUp(stats: QuestStats, id: PowerUpId, earnedFromLevels: number): QuestStats | null {
  const item = powerUps.find((p) => p.id === id)
  if (!item || availableCoins(earnedFromLevels, stats) < item.price) return null
  return { ...stats, spentCoins: stats.spentCoins + item.price, items: { ...stats.items, [id]: stats.items[id] + 1 } }
}

export function consumePowerUp(stats: QuestStats, id: PowerUpId): QuestStats | null {
  if (stats.items[id] <= 0) return null
  return { ...stats, powerUpsUsed: stats.powerUpsUsed + 1, items: { ...stats.items, [id]: stats.items[id] - 1 } }
}

/** Duas alternativas erradas para a lupa riscar (sempre mantém a correta). */
export function lensEliminations(question: ChapterQuestion, random = Math.random): string[] {
  if (!question.choices || question.choices.length < 3) return []
  const wrong = question.choices.filter((choice) => choice !== question.answer)
  const shuffled = [...wrong].sort(() => random() - 0.5)
  return shuffled.slice(0, Math.min(2, wrong.length - 1))
}

/**
 * IDs das conquistas que passam a valer agora. `progress` é o do Livro I;
 * `booksDone` conta quantos livros tiveram o chefão vencido.
 */
export function evaluateAchievements(progress: ChapterProgress, stats: QuestStats, booksDone = 0): string[] {
  const done = new Set(progress.completed)
  const allStars = done.size === 10 && progress.completed.every((level) => starsFor(level, progress.best[level]?.correct ?? 0) === 3)
  const rules: Record<string, boolean> = {
    'primeiro-passo': done.has(1),
    'sem-arranhoes': stats.flawlessWins > 0,
    'combo-5': stats.bestCombo >= 5,
    'combo-8': stats.bestCombo >= 8,
    relampago: stats.fastWins > 0,
    estrategista: stats.powerUpsUsed > 0,
    metade: done.size >= 5,
    grum: done.has(10),
    treino: stats.blitzPlays > 0,
    maratona: stats.blitzBest >= 15,
    estrelas: allStars,
    explorador: stats.chests > 0,
    'segundo-livro': booksDone >= 2,
    biblioteca: booksDone >= 5,
  }
  return achievements.filter((a) => rules[a.id]).map((a) => a.id)
}

/** Acrescenta as conquistas novas e informa quais acabaram de ser desbloqueadas. */
export function unlockAchievements(progress: ChapterProgress, stats: QuestStats, booksDone = 0) {
  const now = evaluateAchievements(progress, stats, booksDone)
  const fresh = now.filter((id) => !stats.unlocked.includes(id))
  return { stats: fresh.length ? { ...stats, unlocked: [...stats.unlocked, ...fresh] } : stats, fresh }
}

export interface BattleStatsInput {
  won: boolean
  level: number
  maxCombo: number
  livesLeft: number
  seconds: number
  usedPowerUps: number
}

/** Atualiza recordes e moedas de bônus ao final de uma batalha. */
export function applyBattleStats(stats: QuestStats, battle: BattleStatsInput) {
  const bonus = battle.won ? comboCoins(battle.maxCombo) : 0
  return {
    bonus,
    stats: {
      ...stats,
      bestCombo: Math.max(stats.bestCombo, battle.maxCombo),
      flawlessWins: stats.flawlessWins + (battle.won && battle.livesLeft === 3 ? 1 : 0),
      fastWins: stats.fastWins + (battle.won && battle.level < 10 && battle.seconds < 60 ? 1 : 0),
      bonusCoins: stats.bonusCoins + bonus,
    },
  }
}

/** Moedas do Desafio Relâmpago: 1 a cada 2 pontos. */
export const blitzCoins = (score: number) => Math.floor(score / 2)

export function applyBlitzStats(stats: QuestStats, score: number) {
  const coins = blitzCoins(score)
  return {
    coins,
    record: score > stats.blitzBest,
    stats: { ...stats, blitzPlays: stats.blitzPlays + 1, blitzBest: Math.max(stats.blitzBest, score), bonusCoins: stats.bonusCoins + coins },
  }
}

/**
 * Perguntas do Desafio Relâmpago: misturam as fases já liberadas, ficando
 * mais difíceis conforme a pontuação sobe.
 */
export function blitzQuestion(score: number, unlocked: number, random = Math.random): ChapterQuestion {
  const maxLevel = Math.max(1, Math.min(9, unlocked))
  const level = Math.min(maxLevel, 1 + Math.floor(score / 3) + Math.floor(random() * 2))
  const pool = generateChapterQuestions(level, random).filter((q) => q.kind === 'choice' || q.kind === 'input')
  return pool[Math.floor(random() * pool.length)] ?? generateChapterQuestions(1, random)[0]
}
