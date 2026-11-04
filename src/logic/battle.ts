/**
 * Regras da batalha por turnos do MathQuest. Tudo aqui é puro e testável:
 * a interface só chama estas funções e mostra o resultado.
 */
export { lensEliminations } from './quest'

export type MoveId = 'rapido' | 'pesado' | 'chama'

export interface Move {
  id: MoveId
  name: string
  description: string
  /** Multiplicador de dano. */
  power: number
  /** Formato de pergunta preferido. */
  prefer: 'choice' | 'input' | 'any'
}

export const MAX_ENERGY = 3

export const MOVES: Record<MoveId, Move> = {
  rapido: { id: 'rapido', name: 'Golpe rápido', description: 'Pergunta de escolha · dano normal', power: 1, prefer: 'choice' },
  pesado: { id: 'pesado', name: 'Golpe pesado', description: 'Digite a resposta · dano alto', power: 1.7, prefer: 'input' },
  chama: { id: 'chama', name: 'Chama especial', description: `Gasta ${MAX_ENERGY} de energia · dano enorme`, power: 3, prefer: 'any' },
}

/** Quem está do outro lado: monstro da trilha, guardião da fase ou chefão do livro. */
export type BattleRole = 'minion' | 'guardian' | 'boss'

/**
 * Golpes rápidos necessários para vencer: 3 num monstro da trilha, 6 no
 * guardião e 8 no chefão.
 */
export const quickHitsToWin = (boss: boolean, minion = false) => (minion ? 3 : boss ? 8 : 6)

/** Dano no inimigo (0 a 100). A partir do 3º acerto seguido o golpe é crítico (+25%). */
export function moveDamage(_level: number, boss: boolean, move: MoveId, combo: number, minion = false): number {
  const base = 100 / quickHitsToWin(boss, minion)
  const critical = combo >= 3 ? 1.25 : 1
  return Math.ceil(base * MOVES[move].power * critical)
}

/* ===== Sistemas do guardião =====
 * O guardião (e o chefão) luta em três fases, de acordo com a vida que resta:
 * 1. Armadura: os primeiros acertos só racham a armadura, sem tirar vida.
 * 2. Ponto fraco: a cada turno ele fica fraco contra um golpe e resiste ao outro.
 * 3. Fúria: cada pergunta tem tempo, ele carrega golpes mais vezes e bate mais forte.
 */
export type GuardianPhase = 1 | 2 | 3

export const GUARDIAN_ARMOR = 2
export const FURY_SECONDS = 20
export const WEAK_BONUS = 1.6
export const RESISTED = 0.6

export function guardianPhase(hp: number): GuardianPhase {
  return hp > 66 ? 1 : hp > 33 ? 2 : 3
}

/** Quanto de armadura cada golpe quebra. A chama especial derrete a armadura inteira. */
export function armorBreak(move: MoveId): number {
  return move === 'chama' ? GUARDIAN_ARMOR : move === 'pesado' ? 2 : 1
}

/** Multiplicador do ponto fraco: o golpe certo dói muito mais; a chama ignora a regra. */
export function weaknessMultiplier(move: MoveId, weak: MoveId | null): number {
  if (!weak || move === 'chama') return 1
  return move === weak ? WEAK_BONUS : RESISTED
}

/** Sorteia o ponto fraco do turno entre o golpe rápido e o pesado. */
export function pickWeakness(random: () => number = Math.random, previous: MoveId | null = null): MoveId {
  const next: MoveId = random() < 0.5 ? 'rapido' : 'pesado'
  // Evita repetir muitas vezes seguidas: metade das vezes troca à força.
  return previous && next === previous && random() < 0.5 ? (previous === 'rapido' ? 'pesado' : 'rapido') : next
}

/** De quantos em quantos turnos o inimigo carrega um golpe forte. */
export const chargeEvery = (phase: GuardianPhase | 0) => (phase === 3 ? 2 : 3)

export const ENEMY_POWER = { normal: 28, boss: 24 } as const

/**
 * Dano do contra-ataque. Acertar a pergunta do turno reduz o golpe a 1/4;
 * um golpe carregado (avisado no turno anterior) causa o dobro.
 */
export function enemyDamage(boss: boolean, playerWasRight: boolean, charged: boolean, fury = false): number {
  const base = boss ? ENEMY_POWER.boss : ENEMY_POWER.normal
  return Math.round(base * (playerWasRight ? 0.25 : 1) * (charged ? 2 : 1) * (fury ? 1.25 : 1))
}
