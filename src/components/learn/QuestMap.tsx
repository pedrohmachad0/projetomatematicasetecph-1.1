import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Check, Circle, Coins, Hand, Map as MapIcon, MapPin, Swords } from 'lucide-react'
import { getContent } from '../../data/mathContent'
import type { QuestBook, QuestPhase } from '../../data/questBooks'
import { terrainPalettes } from '../../data/terrainPalettes'
import { MAP_HEIGHT, MAP_WIDTH, MISSION_COINS, findPath, generateQuestMap, mapSeed, readExplore, requiredMissions, writeExplore, type MapEntity, type Point } from '../../logic/questMap'
import { cameraOffset, directionDelta, keyToDirection, type Direction } from '../../logic/movement'
import { playSound } from '../../logic/sound'
import EncounterDialog, { type EncounterKind } from './EncounterDialog'
import { ChestSprite, GateSprite, HeroSprite, ObstacleSprite, SignSprite, VillagerSprite } from './MapSprites'
import MapTerrain from './MapTerrain'
import PixelCreature from './PixelCreature'
import { PixelOgre } from './PixelArt'
import VirtualJoystick from './VirtualJoystick'

interface Props {
  book: QuestBook
  bookIndex: number
  phaseNumber: number
  phase: QuestPhase
  soundOn: boolean
  /** Fase já vencida antes: as moedas da exploração não são pagas de novo. */
  replay: boolean
  onExit: () => void
  onGuardian: () => void
  onCoins: (coins: number) => void
}

type Dialog = { kind: EncounterKind; entity: MapEntity | null } | { kind: 'sign'; entity: MapEntity }

const STEP_MS = 150
/** Casas visíveis na câmera: mais largo no computador, mais alto no celular em pé. */
const viewTiles = (width: number) => (width > 0 && width < 600 ? { x: 9, y: 11 } : { x: 13, y: 9 })

const sameCell = (a: Point, b: Point) => a.x === b.x && a.y === b.y
const cellKey = ({ x, y }: Point) => `${x},${y}`
const titleCase = (name: string) => `${name.charAt(0)}${name.slice(1).toLowerCase()}`

export default function QuestMap({ book, bookIndex, phaseNumber, phase, soundOn, replay, onExit, onGuardian, onCoins }: Props) {
  const boss = phaseNumber === book.phases.length
  const map = useMemo(() => generateQuestMap(mapSeed(bookIndex, phaseNumber), { monsters: boss ? 4 : 3, minionKinds: book.minions.length, villagers: 1 }), [bookIndex, phaseNumber, boss, book.minions.length])
  const saveId = `${book.id}-${phaseNumber}`
  const [explore, setExplore] = useState(() => readExplore(saveId, map.start))
  const [facing, setFacing] = useState<Direction>('right')
  const [frame, setFrame] = useState(0)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [message, setMessage] = useState('Explore o mapa, cumpra as missões e encontre o guardião da fase.')
  const [walking, setWalking] = useState<Point[]>([])
  const [showMinimap, setShowMinimap] = useState(true)
  const [viewportWidth, setViewportWidth] = useState(0)
  const viewport = useRef<HTMLDivElement>(null)
  const pendingTarget = useRef<MapEntity | 'gate' | null>(null)
  const held = useRef<Direction[]>([])
  const stick = useRef<Direction | null>(null)
  const idleTimer = useRef<number | undefined>(undefined)
  const { done, position } = explore
  const gateOpen = done.includes('portao')
  const required = requiredMissions(map)
  const ready = required.every((id) => done.includes(id))
  const active = map.entities.filter((entity) => !(entity.type === 'monster' && done.includes(entity.id)))
  const blocked = new Set(active.map(cellKey))
  const simulator = phase.simulator ? getContent(phase.simulator) : null
  const view = viewTiles(viewportWidth)
  const tile = Math.max(30, Math.min(56, Math.floor((viewportWidth || 30 * view.x) / view.x)))
  const viewWidth = viewportWidth || tile * view.x
  const viewHeight = tile * view.y
  const camX = cameraOffset(position.x, tile, MAP_WIDTH, viewWidth)
  const camY = cameraOffset(position.y, tile, MAP_HEIGHT, viewHeight, tile * 1.1)

  useEffect(() => {
    writeExplore(saveId, explore)
  }, [saveId, explore])

  // Mede a área do mapa para escolher o tamanho das casas e centralizar a câmera.
  useEffect(() => {
    const element = viewport.current
    if (!element) return
    const measure = () => setViewportWidth(element.clientWidth)
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => () => window.clearTimeout(idleTimer.current), [])

  function complete(id: string, coins: number) {
    setExplore((current) => (current.done.includes(id) ? current : { ...current, done: [...current.done, id] }))
    if (coins && !replay) {
      onCoins(coins)
      playSound('coin', soundOn)
    }
  }

  function entityAt(point: Point) {
    return active.find((entity) => sameCell(entity, point))
  }

  function interact(target: MapEntity | 'gate') {
    if (target === 'gate') {
      if (!gateOpen) setDialog({ kind: 'gate', entity: null })
      return
    }
    if (target.type === 'monster') setDialog({ kind: 'monster', entity: target })
    else if (target.type === 'villager') {
      if (done.includes(target.id)) setMessage(`${villagerName}: “Obrigado pela ajuda, aventureiro!”`)
      else setDialog({ kind: 'villager', entity: target })
    } else if (target.type === 'chest') {
      if (done.includes('bau')) setMessage('O baú já está vazio.')
      else setDialog({ kind: 'chest', entity: target })
    } else if (target.type === 'sign') {
      setDialog({ kind: 'sign', entity: target })
      complete('placa', 0)
    } else if (target.type === 'guardian') {
      if (ready) onGuardian()
      else {
        const missing = [active.some((entity) => entity.type === 'monster') && 'derrote os monstros', !done.includes(villager.id) && 'ajude o morador', !gateOpen && `conserte: ${book.gate.name}`].filter(Boolean)
        setMessage(`${phase.guardian ? phase.guardian.name : 'GRUM'}: “Ainda não! Antes, ${missing.join(', ')}.”`)
      }
    }
  }

  /** Anda uma casa (com animação de passo) ou interage com o que estiver na frente. */
  function step(direction: Direction) {
    const [dx, dy] = directionDelta[direction]
    setFacing(direction)
    const next = { x: position.x + dx, y: position.y + dy }
    const tileType = map.tiles[next.y]?.[next.x]
    const entity = entityAt(next)
    if (entity) return interact(entity)
    if (tileType === 'gate' && !gateOpen) return interact('gate')
    if (tileType === 'grass' || tileType === 'path' || tileType === 'decor' || (tileType === 'gate' && gateOpen)) moveTo(next)
  }

  function moveTo(next: Point) {
    setExplore((current) => ({ ...current, position: next }))
    setFrame((value) => (value === 1 ? 2 : 1))
    window.clearTimeout(idleTimer.current)
    idleTimer.current = window.setTimeout(() => setFrame(0), STEP_MS + 80)
  }

  function interactFront() {
    const [dx, dy] = directionDelta[facing]
    const front = { x: position.x + dx, y: position.y + dy }
    const entity = entityAt(front)
    if (entity || map.tiles[front.y]?.[front.x] === 'gate') interact(entity ?? 'gate')
    else setMessage('Não há ninguém na sua frente. Vire-se para um personagem e toque em Interagir.')
  }

  // Movimento contínuo enquanto uma tecla ou o joystick estiverem pressionados.
  const latest = useRef({ step, dialog, walking: walking.length })
  useEffect(() => {
    latest.current = { step, dialog, walking: walking.length }
  })
  useEffect(() => {
    const timer = window.setInterval(() => {
      const { step: move, dialog: open, walking: busy } = latest.current
      const direction = stick.current ?? held.current[held.current.length - 1]
      if (direction && !open && !busy) move(direction)
    }, STEP_MS)
    return () => window.clearInterval(timer)
  }, [])

  // Caminhada automática ao clicar ou tocar num lugar do mapa.
  useEffect(() => {
    if (!walking.length) {
      if (pendingTarget.current) {
        const target = pendingTarget.current
        pendingTarget.current = null
        interact(target)
      }
      return
    }
    const timer = window.setTimeout(() => {
      const [next, ...rest] = walking
      setFacing(next.x > position.x ? 'right' : next.x < position.x ? 'left' : next.y < position.y ? 'up' : 'down')
      moveTo(next)
      setWalking(rest)
    }, 110)
    return () => window.clearTimeout(timer)
  })

  function goTo(target: Point) {
    if (dialog) return
    const entity = entityAt(target)
    const isGate = map.tiles[target.y]?.[target.x] === 'gate' && !gateOpen
    const path = findPath(map, position, target, blocked, gateOpen)
    if (!path) {
      setMessage(gateOpen ? 'Não dá para chegar lá.' : `O caminho está bloqueado. Conserte: ${book.gate.name}.`)
      return
    }
    pendingTarget.current = entity ?? (isGate ? 'gate' : null)
    setWalking(path)
  }

  function clickGround(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button')) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left + camX) / tile)
    const y = Math.floor((event.clientY - rect.top + camY) / tile)
    if (x >= 0 && y >= 0 && x < MAP_WIDTH && y < MAP_HEIGHT) goTo({ x, y })
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (dialog || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select')) return
      const direction = keyToDirection(event.key)
      if (direction) {
        event.preventDefault()
        setWalking([])
        if (event.repeat) return
        held.current = [...held.current.filter((item) => item !== direction), direction]
        step(direction)
        return
      }
      if (event.key === 'Enter' || event.key === ' ' || event.key.toLowerCase() === 'e') {
        if (event.target instanceof HTMLElement && event.target.closest('button, a')) return
        event.preventDefault()
        interactFront()
      }
    }
    function onKeyUp(event: KeyboardEvent) {
      const direction = keyToDirection(event.key)
      if (direction) held.current = held.current.filter((item) => item !== direction)
    }
    const release = () => {
      held.current = []
      stick.current = null
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', release)
    }
  })

  const villager = map.entities.find((entity) => entity.type === 'villager')!
  const villagerName = book.villagers[villager.variant % book.villagers.length]
  const monsters = map.entities.filter((entity) => entity.type === 'monster')
  const defeated = monsters.filter((entity) => done.includes(entity.id)).length
  const guardianName = phase.guardian ? titleCase(phase.guardian.name) : 'Grum'
  const missions = [
    { id: 'monstros', text: `Derrote os monstros da trilha (${defeated}/${monsters.length})`, done: defeated === monsters.length },
    { id: villager.id, text: `Ajude ${villagerName} com um problema`, done: done.includes(villager.id) },
    { id: 'portao', text: `Conserte: ${book.gate.name}`, done: gateOpen },
    { id: 'bau', text: 'Abra o baú do tesouro (opcional)', done: done.includes('bau') },
    { id: 'placa', text: 'Leia a placa do sábio (opcional)', done: done.includes('placa') },
    { id: 'guardiao', text: `Vença o guardião: ${phase.guardian ? phase.guardian.name : 'GRUM'}`, done: false },
  ]
  const nextMission = missions.find((mission) => !mission.done && !mission.text.includes('opcional')) ?? missions[missions.length - 1]
  const requiredDone = missions.filter((mission) => mission.done && !mission.text.includes('opcional')).length
  const palette = terrainPalettes[book.theme]

  function entityLabel(entity: MapEntity) {
    if (entity.type === 'monster') return `Lutar com ${book.minions[entity.variant % book.minions.length].name}`
    if (entity.type === 'villager') return `Falar com ${villagerName}`
    if (entity.type === 'chest') return done.includes('bau') ? 'Baú aberto' : 'Abrir o baú'
    if (entity.type === 'sign') return 'Ler a placa do sábio'
    return `Guardião ${guardianName}`
  }

  function closeDialog(success: boolean) {
    const current = dialog
    setDialog(null)
    if (!success || !current) return
    if (current.kind === 'monster' && current.entity) {
      complete(current.entity.id, MISSION_COINS.monster)
      setMessage(`Monstro derrotado! ${replay ? '' : `+${MISSION_COINS.monster} moedas.`}`)
    } else if (current.kind === 'villager' && current.entity) {
      complete(current.entity.id, MISSION_COINS.villager)
      setMessage(`${villagerName}: “Muito obrigado!” ${replay ? '' : `+${MISSION_COINS.villager} moedas.`}`)
    } else if (current.kind === 'chest') {
      complete('bau', MISSION_COINS.chest)
      setMessage(`Tesouro! ${replay ? 'O baú estava vazio desta vez.' : `+${MISSION_COINS.chest} moedas.`}`)
    } else if (current.kind === 'gate') {
      complete('portao', 0)
      setMessage(`${book.gate.fixed}! O caminho até o guardião está livre.`)
    }
  }

  const place = (point: Point, extra = 0) => ({ left: point.x * tile, top: point.y * tile, width: tile, height: tile, zIndex: point.y * 10 + extra })

  return (
    <main className={`explore-page theme-${book.theme}`} id="conteudo">
      <div className="battle-breadcrumb">
        <button className="text-button" onClick={onExit}>
          <ArrowLeft size={16} /> Voltar à trilha
        </button>
        <span>
          LIVRO {book.roman} <span>/</span> FASE {String(phaseNumber).padStart(2, '0')}
        </span>
      </div>
      <div className="explore-heading">
        <h1>{phase.title}</h1>
        <p>{phase.topic}</p>
      </div>
      <div className="explore-columns">
        <section className="explore-board-wrap" aria-label="Mapa da fase">
          <div
            ref={viewport}
            className="map-viewport"
            style={{ height: viewHeight, background: palette.grass[1] }}
            role="region"
            aria-label={`Mapa. Você está na coluna ${position.x + 1}, linha ${position.y + 1}.`}
            onClick={clickGround}
          >
            <div className="map-world" style={{ width: MAP_WIDTH * tile, height: MAP_HEIGHT * tile, transform: `translate3d(${-camX}px, ${-camY}px, 0)` }}>
              <MapTerrain map={map} theme={book.theme} />
              {map.tiles.flatMap((row, y) =>
                row.map((type, x) =>
                  type === 'obstacle' ? (
                    <span key={`o-${x}-${y}`} className="map-object obstacle" style={place({ x, y })}>
                      <ObstacleSprite theme={book.theme} variant={x + y} />
                    </span>
                  ) : null,
                ),
              )}
              <button type="button" className={`map-object map-gate ${gateOpen ? 'is-open' : ''}`} style={place(map.gate, 1)} onClick={() => goTo(map.gate)} aria-label={gateOpen ? book.gate.fixed : book.gate.broken} tabIndex={-1}>
                <GateSprite open={gateOpen} theme={book.theme} />
              </button>
              {active.map((entity) => {
                const minion = entity.type === 'monster' ? book.minions[entity.variant % book.minions.length] : null
                return (
                  <button key={entity.id} type="button" className={`map-object map-entity entity-${entity.type}`} style={place(entity, 5)} onClick={() => goTo(entity)} aria-label={entityLabel(entity)} tabIndex={-1}>
                    {minion && <PixelCreature kind={minion.kind} color={minion.color} name={minion.name} />}
                    {entity.type === 'villager' && <VillagerSprite variant={entity.variant} />}
                    {entity.type === 'chest' && <ChestSprite open={done.includes('bau')} />}
                    {entity.type === 'sign' && <SignSprite />}
                    {entity.type === 'guardian' && (phase.guardian ? <PixelCreature kind={phase.guardian.kind} color={phase.guardian.color} name={phase.guardian.name} /> : <PixelOgre />)}
                  </button>
                )
              })}
              {active
                .filter((entity) => (entity.type === 'villager' || entity.type === 'guardian') && !(position.x === entity.x && position.y === entity.y - 1))
                .map((entity) => {
                  const quest = (entity.type === 'villager' && !done.includes(entity.id)) || (entity.type === 'guardian' && ready)
                  return (
                    <span key={`tag-${entity.id}`} className={`name-tag ${quest ? 'has-quest' : ''}`} style={{ left: entity.x * tile + tile / 2, top: entity.y * tile - 4 }} aria-hidden="true">
                      {quest && <b>!</b>}
                      {entity.type === 'villager' ? villagerName : guardianName}
                    </span>
                  )
                })}
              <span className={`map-hero ${frame ? 'is-walking' : ''}`} style={{ ...place({ x: 0, y: 0 }, 6), zIndex: position.y * 10 + 6, transform: `translate3d(${position.x * tile}px, ${position.y * tile}px, 0)` }}>
                <span className="hero-shadow" />
                <HeroSprite facing={facing} frame={frame} />
              </span>
            </div>

            <div className="map-hud">
              <div className="hud-quest">
                <MapPin size={14} />
                <div>
                  <small>
                    MISSÕES {requiredDone}/{missions.length - 3}
                  </small>
                  <strong>{nextMission.text}</strong>
                </div>
              </div>
              <button
                type="button"
                className="hud-button"
                onClick={(event) => {
                  event.stopPropagation()
                  setShowMinimap((value) => !value)
                }}
                aria-pressed={showMinimap}
                aria-label={showMinimap ? 'Esconder minimapa' : 'Mostrar minimapa'}
              >
                <MapIcon size={16} />
              </button>
            </div>
            {showMinimap && (
              <svg className="minimap" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} shapeRendering="crispEdges" aria-hidden="true">
                {map.tiles.flatMap((row, y) =>
                  row.map((type, x) => (
                    <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={type === 'water' ? palette.water[1] : type === 'gate' ? (gateOpen ? palette.path[1] : '#c0392b') : type === 'obstacle' ? palette.grass[0] : type === 'path' ? palette.path[1] : palette.grass[2]} />
                  )),
                )}
                {active.map((entity) => (
                  <rect key={entity.id} x={entity.x} y={entity.y} width={1} height={1} fill={entity.type === 'monster' ? '#e74c3c' : entity.type === 'guardian' ? '#8e44ad' : entity.type === 'villager' ? '#f1c40f' : '#ffffff'} />
                ))}
                <rect className="minimap-hero" x={position.x} y={position.y} width={1} height={1} fill="#1f2433" stroke="#fff" strokeWidth={0.3} />
              </svg>
            )}
            <VirtualJoystick
              onDirection={(direction) => {
                stick.current = direction
                if (direction) {
                  setWalking([])
                  step(direction)
                }
              }}
            />
            <button
              type="button"
              className="map-action"
              onClick={(event) => {
                event.stopPropagation()
                interactFront()
              }}
            >
              <Hand size={20} />
              <span>Interagir</span>
            </button>
          </div>
          <p className="explore-message" role="status" aria-live="polite">
            {message}
          </p>
          <p className="explore-help">Ande com as setas ou WASD (segure para continuar andando), toque no mapa ou use o joystick no celular. Encoste num personagem ou aperte E para interagir.</p>
        </section>

        <aside className="explore-sidebar">
          <section className="mission-log" aria-labelledby="missions-title">
            <h2 id="missions-title">
              <MapPin size={17} /> Missões
            </h2>
            <ul>
              {missions.map((mission) => (
                <li key={mission.id} className={mission.done ? 'done' : ''}>
                  {mission.done ? <Check size={16} /> : <Circle size={16} />}
                  <span>{mission.text}</span>
                </li>
              ))}
            </ul>
            <button className="rpg-button" disabled={!ready} onClick={onGuardian}>
              <Swords size={17} /> {ready ? 'Enfrentar o guardião' : 'Guardião bloqueado'}
            </button>
            {!replay && (
              <p className="mission-coins">
                <Coins size={14} /> Monstro +{MISSION_COINS.monster} · Morador +{MISSION_COINS.villager} · Baú +{MISSION_COINS.chest}
              </p>
            )}
          </section>
          {simulator && (
            <section className="explore-simulator">
              <BookOpen size={18} />
              <div>
                <strong>Treine antes no simulador</strong>
                <p>
                  {simulator.title}: {simulator.subject}.
                </p>
                <Link to={`/${simulator.simulator}`}>Abrir simulador</Link>
              </div>
            </section>
          )}
        </aside>
      </div>

      {dialog && dialog.kind === 'sign' && (
        <div className="rpg-modal-backdrop" onClick={(event) => event.target === event.currentTarget && setDialog(null)}>
          <section className="rpg-modal encounter" role="dialog" aria-modal="true" aria-labelledby="sign-title">
            <div className="encounter-head">
              <div className="encounter-portrait" aria-hidden="true">
                <SignSprite />
              </div>
              <div>
                <p className="eyebrow">PLACA DO SÁBIO</p>
                <h2 id="sign-title">{phase.topic}</h2>
                <p className="encounter-intro">{phase.hint}</p>
              </div>
            </div>
            {simulator && (
              <p className="encounter-intro">
                Quer ver isso funcionando? Use o simulador <strong>{simulator.title}</strong>: seu progresso no mapa fica salvo.
              </p>
            )}
            <div className="modal-actions">
              <button autoFocus className="rpg-button" onClick={() => setDialog(null)}>
                Voltar ao mapa
              </button>
              {simulator && (
                <Link className="secondary-button" to={`/${simulator.simulator}`}>
                  Abrir simulador
                </Link>
              )}
            </div>
          </section>
        </div>
      )}
      {dialog && dialog.kind !== 'sign' && (
        <EncounterDialog
          kind={dialog.kind}
          theme={book.theme}
          soundOn={soundOn}
          topics={phase.topics}
          hits={dialog.kind === 'monster' ? (boss ? 3 : 2) : 1}
          enemy={dialog.kind === 'monster' && dialog.entity ? book.minions[dialog.entity.variant % book.minions.length] : undefined}
          villager={dialog.entity?.variant}
          title={
            dialog.kind === 'monster' && dialog.entity
              ? book.minions[dialog.entity.variant % book.minions.length].name
              : dialog.kind === 'villager'
                ? villagerName
                : dialog.kind === 'chest'
                  ? 'Baú com cadeado'
                  : book.gate.broken
          }
          subtitle={dialog.kind === 'monster' ? 'MONSTRO NA TRILHA' : dialog.kind === 'villager' ? 'PROBLEMA DO LOCAL' : dialog.kind === 'chest' ? 'TESOURO' : 'CAMINHO BLOQUEADO'}
          intro={
            dialog.kind === 'monster'
              ? 'Acerte as contas para espantar o monstro. Cada acerto é um golpe!'
              : dialog.kind === 'villager'
                ? 'Preciso de ajuda com uma conta. Você resolve para mim?'
                : dialog.kind === 'chest'
                  ? 'O segredo do cadeado é a resposta deste desafio.'
                  : `Para liberar ${book.gate.article} ${book.gate.name}, resolva o cálculo gravado ${book.gate.article === 'a' ? 'nela' : 'nele'}.`
          }
          onClose={() => closeDialog(false)}
          onSuccess={() => closeDialog(true)}
        />
      )}
    </main>
  )
}
