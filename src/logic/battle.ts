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

/**
 * Golpes rápidos necessários para vencer: 6 nas fases comuns e 8 no chefão,
 * a mesma conta do jogo original (perguntas − 2 erros permitidos).
 */
export const quickHitsToWin = (boss: boolean) => (boss ? 8 : 6)

/** Dano no inimigo (0 a 100). A partir do 3º acerto seguido o golpe é crítico (+25%). */
export function moveDamage(_level: number, boss: boolean, move: MoveId, combo: number): number {
  const base = 100 / quickHitsToWin(boss)
  const critical = combo >= 3 ? 1.25 : 1
  return Math.ceil(base * MOVES[move].power * critical)
}

export const ENEMY_POWER = { normal: 28, boss: 24 } as const

/**
 * Dano do contra-ataque. Acertar a pergunta do turno reduz o golpe a 1/4;
 * um golpe carregado (avisado no turno anterior) causa o dobro.
 */
export function enemyDamage(boss: boolean, playerWasRight: boolean, charged: boolean): number {
  const base = boss ? ENEMY_POWER.boss : ENEMY_POWER.normal
  return Math.round(base * (playerWasRight ? 0.25 : 1) * (charged ? 2 : 1))
}
