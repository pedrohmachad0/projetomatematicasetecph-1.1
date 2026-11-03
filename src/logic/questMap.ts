/**
 * Mapas exploráveis das fases do MathQuest.
 *
 * Cada mapa é gerado de forma determinística a partir do livro e da fase: o mesmo
 * mapa sempre aparece para a mesma fase. Um rio (ou muro) divide o mapa; a única
 * passagem é um portão/ponte que só abre resolvendo um problema. Antes de aceitar
 * um mapa, uma busca em largura confere que todos os personagens podem ser alcançados.
 */

/** Moedas por missão cumprida no mapa (só na primeira vez que a fase é vencida). */
export const MISSION_COINS = { monster: 3, villager: 5, chest: 8 } as const

export const MAP_WIDTH = 13
export const MAP_HEIGHT = 9
const RIVER_X = 8

export type Tile = 'grass' | 'path' | 'obstacle' | 'decor' | 'water' | 'gate'
export type EntityType = 'monster' | 'villager' | 'chest' | 'sign' | 'guardian'

export interface Point {
  x: number
  y: number
}

export interface MapEntity extends Point {
  id: string
  type: EntityType
  /** Índice do monstro/morador na lista do livro. */
  variant: number
}

export interface QuestMap {
  tiles: Tile[][]
  start: Point
  gate: Point
  entities: MapEntity[]
}

/** Gerador pseudoaleatório pequeno e determinístico (mulberry32). */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const key = ({ x, y }: Point) => `${x},${y}`
const neighbors = ({ x, y }: Point): Point[] => [
  { x: x + 1, y },
  { x: x - 1, y },
  { x, y: y + 1 },
  { x, y: y - 1 },
]
const inside = ({ x, y }: Point) => x >= 0 && y >= 0 && x < MAP_WIDTH && y < MAP_HEIGHT

export function isWalkableTile(tile: Tile, gateOpen: boolean): boolean {
  return tile === 'grass' || tile === 'path' || tile === 'decor' || (tile === 'gate' && gateOpen)
}

/** Células alcançáveis a pé, tratando `blocked` (personagens) como paredes. */
export function reachable(map: QuestMap, from: Point, blocked: Set<string>, gateOpen: boolean): Set<string> {
  const seen = new Set([key(from)])
  const queue = [from]
  while (queue.length) {
    const current = queue.shift()!
    for (const next of neighbors(current)) {
      const id = key(next)
      if (!inside(next) || seen.has(id) || blocked.has(id) || !isWalkableTile(map.tiles[next.y][next.x], gateOpen)) continue
      seen.add(id)
      queue.push(next)
    }
  }
  return seen
}

/**
 * Caminho a pé de `from` até `to` (sem incluir `from`). Se `to` não puder ser pisado
 * (personagem, portão fechado), o caminho termina numa casa vizinha a ele.
 */
export function findPath(map: QuestMap, from: Point, to: Point, blocked: Set<string>, gateOpen: boolean): Point[] | null {
  const targetWalkable = isWalkableTile(map.tiles[to.y]?.[to.x] ?? 'obstacle', gateOpen) && !blocked.has(key(to))
  const goals = new Set(targetWalkable ? [key(to)] : neighbors(to).filter(inside).map(key))
  if (goals.has(key(from))) return []
  const previous = new Map<string, string>()
  const seen = new Set([key(from)])
  const queue = [from]
  while (queue.length) {
    const current = queue.shift()!
    for (const next of neighbors(current)) {
      const id = key(next)
      if (!inside(next) || seen.has(id) || blocked.has(id) || !isWalkableTile(map.tiles[next.y][next.x], gateOpen)) continue
      seen.add(id)
      previous.set(id, key(current))
      if (goals.has(id)) {
        const steps: Point[] = []
        let cursor: string | undefined = id
        while (cursor && cursor !== key(from)) {
          const [x, y] = cursor.split(',').map(Number)
          steps.unshift({ x, y })
          cursor = previous.get(cursor)
        }
        return steps
      }
      queue.push(next)
    }
  }
  return null
}

export interface MapOptions {
  monsters: number
  minionKinds: number
  villagers: number
}

function attempt(random: () => number, options: MapOptions): QuestMap | null {
  const tiles: Tile[][] = Array.from({ length: MAP_HEIGHT }, (_, y) =>
    Array.from({ length: MAP_WIDTH }, (_, x) => (x === 0 || y === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1 ? 'obstacle' : 'grass')),
  )
  const start = { x: 1, y: 1 + Math.floor(random() * (MAP_HEIGHT - 2)) }
  const gate = { x: RIVER_X, y: 2 + Math.floor(random() * (MAP_HEIGHT - 4)) }
  for (let y = 1; y < MAP_HEIGHT - 1; y++) tiles[y][RIVER_X] = 'water'
  tiles[gate.y][gate.x] = 'gate'

  for (let y = 1; y < MAP_HEIGHT - 1; y++)
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
      if (x === RIVER_X || Math.abs(x - start.x) + Math.abs(y - start.y) <= 1) continue
      if (Math.abs(x - gate.x) <= 1 && y === gate.y) continue
      const roll = random()
      if (roll < (x < RIVER_X ? 0.17 : 0.1)) tiles[y][x] = 'obstacle'
      else if (roll < 0.27) tiles[y][x] = 'decor'
    }

  const free = (region: 'left' | 'right') => {
    const cells: Point[] = []
    for (let y = 1; y < MAP_HEIGHT - 1; y++)
      for (let x = 1; x < MAP_WIDTH - 1; x++) {
        if (region === 'left' ? x >= RIVER_X - 1 : x <= RIVER_X + 1) continue
        if (tiles[y][x] === 'grass' && Math.abs(x - start.x) + Math.abs(y - start.y) > 2) cells.push({ x, y })
      }
    return cells
  }
  const take = (cells: Point[]) => cells.splice(Math.floor(random() * cells.length), 1)[0]

  const left = free('left')
  const right = free('right')
  const entities: MapEntity[] = []
  const place = (cells: Point[], type: EntityType, variant: number, id: string) => {
    const cell = take(cells)
    if (cell) entities.push({ ...cell, type, variant, id })
    return Boolean(cell)
  }
  const leftMonsters = Math.max(1, options.monsters - 1)
  for (let i = 0; i < leftMonsters; i++) if (!place(left, 'monster', i % options.minionKinds, `monstro-${i + 1}`)) return null
  for (let i = 0; i < options.villagers; i++) if (!place(left, 'villager', i, `morador-${i + 1}`)) return null
  if (!place(left, 'chest', 0, 'bau')) return null
  if (!place(left, 'sign', 0, 'placa')) return null
  for (let i = leftMonsters; i < options.monsters; i++) if (!place(right, 'monster', i % options.minionKinds, `monstro-${i + 1}`)) return null

  const guardianCells = right.filter((cell) => cell.x === MAP_WIDTH - 2)
  const guardian = guardianCells[Math.floor(random() * guardianCells.length)]
  if (!guardian) return null
  entities.push({ ...guardian, type: 'guardian', variant: 0, id: 'guardiao' })

  const map: QuestMap = { tiles, start, gate, entities }
  const blocked = new Set(entities.map(key))
  // Antes de abrir o portão: tudo da margem esquerda e o próprio portão precisam estar ao alcance.
  const closed = reachable(map, start, blocked, false)
  const touches = (point: Point, area: Set<string>) => neighbors(point).some((cell) => area.has(key(cell)))
  if (!touches(gate, closed)) return null
  if (!entities.filter((entity) => entity.x < RIVER_X).every((entity) => touches(entity, closed))) return null
  // Com o portão aberto, todo o resto (inclusive o guardião) precisa estar ao alcance.
  const open = reachable(map, start, blocked, true)
  if (!entities.every((entity) => touches(entity, open))) return null

  // Marca uma trilha de terra até o portão e até o guardião, só para orientar o jogador.
  for (const target of [gate, guardian]) {
    for (const step of findPath(map, start, target, blocked, true) ?? []) if (tiles[step.y][step.x] === 'grass' || tiles[step.y][step.x] === 'decor') tiles[step.y][step.x] = 'path'
  }
  return map
}

export function generateQuestMap(seed: number, options: MapOptions): QuestMap {
  for (let tryIndex = 0; tryIndex < 500; tryIndex++) {
    const map = attempt(seededRandom(seed * 7919 + tryIndex), options)
    if (map) return map
  }
  throw new Error(`Não foi possível gerar o mapa ${seed}`)
}

export const mapSeed = (bookIndex: number, phase: number) => (bookIndex + 1) * 100 + phase

/** Missões que precisam ser cumpridas antes de enfrentar o guardião. */
export function requiredMissions(map: QuestMap): string[] {
  return [...map.entities.filter((entity) => entity.type === 'monster' || entity.type === 'villager').map((entity) => entity.id), 'portao']
}

/* ---------- Progresso da exploração (salvo no navegador) ---------- */

export const EXPLORE_STORAGE = 'matematica-rpg-explore-v1'

export interface ExploreState {
  done: string[]
  position: Point
}

export function readExplore(id: string, start: Point): ExploreState {
  try {
    const parsed = JSON.parse(localStorage.getItem(EXPLORE_STORAGE) || '{}')?.[id]
    const done = Array.isArray(parsed?.done) ? parsed.done.filter((item: unknown) => typeof item === 'string') : []
    const position = parsed?.position
    if (position && Number.isInteger(position.x) && Number.isInteger(position.y) && inside(position)) return { done, position }
    return { done, position: start }
  } catch {
    return { done: [], position: start }
  }
}

export function writeExplore(id: string, state: ExploreState | null) {
  try {
    const all = JSON.parse(localStorage.getItem(EXPLORE_STORAGE) || '{}')
    const next = all && typeof all === 'object' ? all : {}
    if (state) next[id] = state
    else delete next[id]
    localStorage.setItem(EXPLORE_STORAGE, JSON.stringify(next))
  } catch {
    // Sem armazenamento, a exploração vale só enquanto a página estiver aberta.
  }
}
