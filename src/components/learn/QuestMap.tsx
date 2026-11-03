import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen, Check, Circle, Coins, MapPin, Swords } from 'lucide-react'
import { getContent } from '../../data/mathContent'
import type { QuestBook, QuestPhase } from '../../data/questBooks'
import { MISSION_COINS, findPath, generateQuestMap, mapSeed, readExplore, requiredMissions, writeExplore, type MapEntity, type Point } from '../../logic/questMap'
import { playSound } from '../../logic/sound'
import EncounterDialog, { type EncounterKind } from './EncounterDialog'
import { ChestSprite, GateSprite, HeroSprite, ObstacleSprite, SignSprite, VillagerSprite } from './MapSprites'
import PixelCreature from './PixelCreature'
import { PixelOgre } from './PixelArt'

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

type Facing = 'left' | 'right' | 'up' | 'down'
type Dialog = { kind: EncounterKind; entity: MapEntity | null } | { kind: 'sign'; entity: MapEntity }

const directions: Record<string, [number, number, Facing]> = {
  ArrowUp: [0, -1, 'up'],
  ArrowDown: [0, 1, 'down'],
  ArrowLeft: [-1, 0, 'left'],
  ArrowRight: [1, 0, 'right'],
  w: [0, -1, 'up'],
  s: [0, 1, 'down'],
  a: [-1, 0, 'left'],
  d: [1, 0, 'right'],
}

const sameCell = (a: Point, b: Point) => a.x === b.x && a.y === b.y
const cellKey = ({ x, y }: Point) => `${x},${y}`

export default function QuestMap({ book, bookIndex, phaseNumber, phase, soundOn, replay, onExit, onGuardian, onCoins }: Props) {
  const boss = phaseNumber === book.phases.length
  const map = useMemo(() => generateQuestMap(mapSeed(bookIndex, phaseNumber), { monsters: boss ? 3 : 2, minionKinds: book.minions.length, villagers: 1 }), [bookIndex, phaseNumber, boss, book.minions.length])
  const saveId = `${book.id}-${phaseNumber}`
  const [explore, setExplore] = useState(() => readExplore(saveId, map.start))
  const [facing, setFacing] = useState<Facing>('right')
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [message, setMessage] = useState('Explore o mapa, cumpra as missões e encontre o guardião da fase.')
  const [walking, setWalking] = useState<Point[]>([])
  const pendingTarget = useRef<MapEntity | 'gate' | null>(null)
  const { done, position } = explore
  const gateOpen = done.includes('portao')
  const required = requiredMissions(map)
  const ready = required.every((id) => done.includes(id))
  const active = map.entities.filter((entity) => !(entity.type === 'monster' && done.includes(entity.id)))
  const blocked = new Set(active.map(cellKey))
  const simulator = phase.simulator ? getContent(phase.simulator) : null

  useEffect(() => {
    writeExplore(saveId, explore)
  }, [saveId, explore])

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
      if (done.includes(target.id)) setMessage(`${book.villagers[target.variant % book.villagers.length]}: “Obrigado pela ajuda, aventureiro!”`)
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
        const missing = [
          active.some((entity) => entity.type === 'monster') && 'derrote os monstros',
          !done.includes(map.entities.find((entity) => entity.type === 'villager')!.id) && 'ajude o morador',
          !gateOpen && `conserte: ${book.gate.name}`,
        ].filter(Boolean)
        setMessage(`${phase.guardian ? phase.guardian.name : 'GRUM'}: “Ainda não! Antes, ${missing.join(', ')}.”`)
      }
    }
  }

  function step(dx: number, dy: number, face: Facing) {
    setFacing(face)
    const next = { x: position.x + dx, y: position.y + dy }
    const tile = map.tiles[next.y]?.[next.x]
    const entity = entityAt(next)
    if (entity) return interact(entity)
    if (tile === 'gate' && !gateOpen) return interact('gate')
    if (tile === 'grass' || tile === 'path' || tile === 'decor' || (tile === 'gate' && gateOpen)) {
      setExplore((current) => ({ ...current, position: next }))
      playSound('select', soundOn)
    }
  }

  // Caminhada automática ao clicar numa casa do mapa.
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
      setExplore((current) => ({ ...current, position: next }))
      setWalking(rest)
    }, 110)
    return () => window.clearTimeout(timer)
  })

  function goTo(target: Point) {
    if (dialog) return
    const entity = entityAt(target)
    const isGate = map.tiles[target.y][target.x] === 'gate' && !gateOpen
    const path = findPath(map, position, target, blocked, gateOpen)
    if (!path) {
      setMessage(gateOpen ? 'Não dá para chegar lá.' : `O caminho está bloqueado. Conserte: ${book.gate.name}.`)
      return
    }
    pendingTarget.current = entity ?? (isGate ? 'gate' : null)
    setWalking(path)
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (dialog || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select')) return
      const direction = directions[event.key] ?? directions[event.key.toLowerCase()]
      if (direction) {
        event.preventDefault()
        setWalking([])
        step(direction[0], direction[1], direction[2])
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        const [dx, dy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[facing]
        const front = { x: position.x + dx, y: position.y + dy }
        const entity = entityAt(front)
        if (entity || map.tiles[front.y]?.[front.x] === 'gate') {
          event.preventDefault()
          interact(entity ?? 'gate')
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const villager = map.entities.find((entity) => entity.type === 'villager')!
  const villagerName = book.villagers[villager.variant % book.villagers.length]
  const monsters = map.entities.filter((entity) => entity.type === 'monster')
  const defeated = monsters.filter((entity) => done.includes(entity.id)).length
  const missions = [
    { id: 'monstros', text: `Derrote os monstros da trilha (${defeated}/${monsters.length})`, done: defeated === monsters.length },
    { id: villager.id, text: `Ajude ${villagerName} com um problema`, done: done.includes(villager.id) },
    { id: 'portao', text: `Conserte: ${book.gate.name}`, done: gateOpen },
    { id: 'bau', text: 'Abra o baú do tesouro (opcional)', done: done.includes('bau') },
    { id: 'placa', text: 'Leia a placa do sábio (opcional)', done: done.includes('placa') },
    { id: 'guardiao', text: `Vença o guardião: ${phase.guardian ? phase.guardian.name : 'GRUM'}`, done: false },
  ]

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
          <div className="explore-board" role="grid" aria-label={`Mapa. Você está na coluna ${position.x + 1}, linha ${position.y + 1}.`}>
            {map.tiles.map((row, y) =>
              row.map((tile, x) => {
                const entity = map.entities.find((item) => item.x === x && item.y === y)
                const hidden = entity?.type === 'monster' && done.includes(entity.id)
                const isHero = position.x === x && position.y === y
                const label = entity && !hidden ? entity.type : tile
                return (
                  <button
                    key={`${x}-${y}`}
                    type="button"
                    tabIndex={-1}
                    className={`tile tile-${tile}`}
                    onClick={() => goTo({ x, y })}
                    aria-label={`${label} (${x + 1}, ${y + 1})`}
                  >
                    {tile === 'obstacle' && <ObstacleSprite theme={book.theme} variant={x + y} />}
                    {tile === 'gate' && <GateSprite open={gateOpen} theme={book.theme} />}
                    {entity && !hidden && (
                      <span className={`map-entity entity-${entity.type} ${entity.type === 'villager' && !done.includes(entity.id) ? 'has-quest' : ''} ${entity.type === 'guardian' && ready ? 'is-ready' : ''}`}>
                        {entity.type === 'monster' && (() => {
                          const minion = book.minions[entity.variant % book.minions.length]
                          return <PixelCreature kind={minion.kind} color={minion.color} name={minion.name} />
                        })()}
                        {entity.type === 'villager' && <VillagerSprite variant={entity.variant} />}
                        {entity.type === 'chest' && <ChestSprite open={done.includes('bau')} />}
                        {entity.type === 'sign' && <SignSprite />}
                        {entity.type === 'guardian' && (phase.guardian ? <PixelCreature kind={phase.guardian.kind} color={phase.guardian.color} name={phase.guardian.name} /> : <PixelOgre />)}
                      </span>
                    )}
                    {isHero && (
                      <span className="map-hero">
                        <HeroSprite facing={facing} />
                      </span>
                    )}
                  </button>
                )
              }),
            )}
          </div>
          <p className="explore-message" role="status" aria-live="polite">
            {message}
          </p>
          <div className="dpad" role="group" aria-label="Mover o aventureiro">
            <button type="button" aria-label="Mover para cima" onClick={() => step(0, -1, 'up')}>
              <ArrowUp size={20} />
            </button>
            <button type="button" aria-label="Mover para a esquerda" onClick={() => step(-1, 0, 'left')}>
              <ArrowLeft size={20} />
            </button>
            <button type="button" aria-label="Mover para baixo" onClick={() => step(0, 1, 'down')}>
              <ArrowDown size={20} />
            </button>
            <button type="button" aria-label="Mover para a direita" onClick={() => step(1, 0, 'right')}>
              <ArrowRight size={20} />
            </button>
          </div>
          <p className="explore-help">Ande com as setas, WASD ou clicando no mapa. Encoste num personagem para falar ou lutar.</p>
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
                <p>{simulator.title}: {simulator.subject}.</p>
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
