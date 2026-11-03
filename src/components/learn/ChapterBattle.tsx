import { useEffect, useRef, useState } from 'react'
import NumberPad from './NumberPad'
import { ArrowLeft, ArrowRight, Backpack, Check, Clock3, Flame, Footprints, Heart, Hourglass, Search, Shield, Swords, Wind, X, Zap } from 'lucide-react'
import { BOSS_SECONDS, chapterLevels, type ChapterQuestion } from '../../data/chapter'
import { enemies, powerUps, type Enemy, type PowerUpId } from '../../data/quest'
import { answerMatches, formatTime, generateChapterQuestions, hintForQuestion } from '../../logic/chapter'
import { enemyDamage, lensEliminations, MAX_ENERGY, MOVES, moveDamage, type MoveId } from '../../logic/battle'
import { playSound, type SoundEffect } from '../../logic/sound'
import { PixelFire, PixelOgre, PixelTree } from './PixelArt'
import PixelCreature from './PixelCreature'
import { HeroBattleSprite } from './MapSprites'

export type BattleResult = {
  level: number
  /** Respostas certas na batalha. */
  correct: number
  /** Perguntas respondidas (ataques e esquivas). */
  answered: number
  mistakes: number
  seconds: number
  won: boolean
  reason: 'complete' | 'lives' | 'time'
  maxCombo: number
  /** 3 = terminou com a vida cheia; 0 = derrotado. */
  livesLeft: number
  usedPowerUps: number
}

/** Batalha de qualquer livro. Sem ela, a batalha é a da fase `level` do Livro I. */
export interface BattleConfig {
  title: string
  bookLabel: string
  boss: boolean
  /** `null` mostra o Grum. */
  enemy: Enemy | null
  questions: ChapterQuestion[]
  /** Gera mais perguntas quando as primeiras acabam. */
  more?: () => ChapterQuestion[]
}

const powerUpIcons: Record<PowerUpId, typeof Heart> = { pocao: Heart, lupa: Search, escudo: Shield, ampulheta: Hourglass }
const MAX_HP = 100
const POTION_HEAL = 40

type Stage = 'menu' | 'moves' | 'bag' | 'question' | 'result' | 'enemy' | 'over'
type Action = { type: 'attack'; move: MoveId } | { type: 'dodge' }
type Effect = { id: number; target: 'enemy' | 'player' | 'miss' | 'dodge' | 'heal'; text: string }

/** Segundos desde o início da batalha. */
const secondsSince = (start: number) => Math.floor((Date.now() - start) / 1000)

const hpClass = (hp: number) => (hp > 50 ? 'hp-high' : hp > 20 ? 'hp-mid' : 'hp-low')

/** Batalha por turnos: escolha uma ação, responda a conta e veja o contra-ataque. */
export default function ChapterBattle({
  level,
  onExit,
  onFinish,
  items,
  onUsePowerUp,
  soundOn = false,
  noTimer = false,
  bigText = false,
  config,
  heroName = 'Você',
}: {
  level: number
  heroName?: string
  config?: BattleConfig
  onExit: () => void
  onFinish: (result: BattleResult) => void
  /** Quantidade de cada item na mochila. Sem esta prop a mochila fica vazia. */
  items?: Record<PowerUpId, number>
  /** Deve gastar o item e devolver `true` quando ele puder ser usado. */
  onUsePowerUp?: (id: PowerUpId) => boolean
  soundOn?: boolean
  /** Sem cronômetro no chefão. */
  noTimer?: boolean
  /** Letras maiores na pergunta e nas respostas. */
  bigText?: boolean
}) {
  const boss = config ? config.boss : level === 10
  const enemy = config ? config.enemy : boss ? null : enemies[level - 1]
  const enemyName = enemy ? enemy.name : 'GRUM'
  const pool = useRef<ChapterQuestion[] | null>(null)
  const [stage, setStage] = useState<Stage>('menu')
  const [action, setAction] = useState<Action | null>(null)
  const [question, setQuestion] = useState<ChapterQuestion | null>(null)
  const [answer, setAnswer] = useState('')
  const [lastGood, setLastGood] = useState<boolean | null>(null)
  const [playerHp, setPlayerHp] = useState(MAX_HP)
  const [enemyHp, setEnemyHp] = useState(MAX_HP)
  const [energy, setEnergy] = useState(0)
  const [combo, setCombo] = useState(0)
  const [charging, setCharging] = useState(false)
  const [shield, setShield] = useState(false)
  const [lens, setLens] = useState(false)
  const [eliminated, setEliminated] = useState<string[]>([])
  const [bonusSeconds, setBonusSeconds] = useState(0)
  const [message, setMessage] = useState(`${enemyName} apareceu na sua frente! O que você vai fazer?`)
  const [detail, setDetail] = useState<string | null>(null)
  const [effect, setEffect] = useState<Effect | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [exitConfirm, setExitConfirm] = useState(false)
  const [started] = useState(() => Date.now())
  const stats = useRef({ correct: 0, answered: 0, mistakes: 0, maxCombo: 0, usedPowerUps: 0, turns: 0 })
  const finished = useRef(false)
  const nextButton = useRef<HTMLButtonElement>(null)
  const firstButton = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const effectId = useRef(0)
  const timeLimit = BOSS_SECONDS + bonusSeconds
  // Com "sem limite de tempo", o chefão não tem cronômetro.
  const timed = boss && !noTimer
  const remaining = Math.max(0, timeLimit - elapsed)
  const title = config?.title ?? chapterLevels[level - 1].title

  function sound(name: SoundEffect) {
    playSound(name, soundOn)
  }

  function report(won: boolean, reason: BattleResult['reason'], seconds: number, hp: number) {
    const { correct, answered, mistakes, maxCombo, usedPowerUps } = stats.current
    onFinish({ level, correct, answered, mistakes, seconds, won, reason, maxCombo, usedPowerUps, livesLeft: hp <= 0 ? 0 : hp >= MAX_HP ? 3 : hp > 50 ? 2 : 1 })
  }

  // O relógio lê sempre a versão mais nova de `report` e do limite de tempo.
  const latest = useRef({ report, timeLimit })
  useEffect(() => {
    latest.current = { report, timeLimit }
  })

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (finished.current) return
      const seconds = secondsSince(started)
      setElapsed(seconds)
      if (timed && seconds >= latest.current.timeLimit) {
        finished.current = true
        playSound('defeat', soundOn)
        latest.current.report(false, 'time', latest.current.timeLimit, 0)
      }
    }, 200)
    return () => window.clearInterval(timer)
  }, [timed, started, soundOn])

  useEffect(() => {
    if (stage === 'question') (input.current ?? firstButton.current)?.focus()
    else if (stage === 'result' || stage === 'enemy' || stage === 'over') nextButton.current?.focus()
    else firstButton.current?.focus()
  }, [stage, question])

  function flash(target: Effect['target'], text: string) {
    effectId.current += 1
    setEffect({ id: effectId.current, target, text })
  }

  /** Tira a próxima pergunta, preferindo o formato do golpe (escolha ou digitação). */
  function draw(prefer: 'choice' | 'input' | 'any'): ChapterQuestion {
    if (!pool.current || pool.current.length === 0) {
      pool.current = [...(pool.current === null && config ? config.questions : (config?.more?.() ?? (config ? config.questions : generateChapterQuestions(level))))]
    }
    const tests: Array<(q: ChapterQuestion) => boolean> =
      prefer === 'choice' ? [(q) => (q.choices?.length ?? 0) >= 3, (q) => Boolean(q.choices)] : prefer === 'input' ? [(q) => !q.choices] : [() => true]
    let index = -1
    for (const test of tests) {
      index = pool.current.findIndex(test)
      if (index >= 0) break
    }
    index = Math.max(0, index)
    return pool.current.splice(index, 1)[0]
  }

  function choose(next: Action) {
    if (finished.current) return
    const move = next.type === 'attack' ? MOVES[next.move] : null
    if (move?.id === 'chama' && energy < MAX_ENERGY) return
    const q = draw(next.type === 'dodge' ? 'choice' : move!.prefer)
    const useLens = lens && (q.choices?.length ?? 0) >= 3
    setAction(next)
    setQuestion(q)
    setAnswer('')
    setEliminated(useLens ? lensEliminations(q) : [])
    if (useLens) setLens(false)
    setStage('question')
    setDetail(null)
    setMessage(next.type === 'dodge' ? 'Prepare a esquiva: acerte para escapar do próximo ataque!' : `${move!.name}! Acerte a conta para o golpe funcionar.`)
    sound('select')
  }

  function submit() {
    if (stage !== 'question' || !question || !action || !answer.trim() || finished.current) return
    if (timed && secondsSince(started) >= timeLimit) {
      finished.current = true
      report(false, 'time', timeLimit, playerHp)
      return
    }
    const good = answerMatches(question, answer)
    const nextCombo = good ? combo + 1 : 0
    stats.current.answered += 1
    if (good) stats.current.correct += 1
    else stats.current.mistakes += 1
    stats.current.maxCombo = Math.max(stats.current.maxCombo, nextCombo)
    setCombo(nextCombo)
    setLastGood(good)
    setDetail(question.explanation)

    if (action.type === 'attack') {
      const move = MOVES[action.move]
      if (move.id === 'chama') setEnergy(0)
      if (good) {
        const damage = moveDamage(level, boss, move.id, nextCombo)
        const hp = Math.max(0, enemyHp - damage)
        setEnemyHp(hp)
        if (move.id !== 'chama') setEnergy((value) => Math.min(MAX_ENERGY, value + 1))
        flash('enemy', `−${damage}`)
        sound(nextCombo >= 3 || move.id === 'chama' ? 'combo' : 'correct')
        setMessage(`${move.name} acertou${nextCombo >= 3 ? ' com um golpe CRÍTICO' : ''}! ${enemyName} perdeu ${damage} de vida.`)
        if (hp === 0) {
          finished.current = true
          setEndTime(secondsSince(started))
        }
      } else {
        flash('miss', 'ERROU')
        sound('wrong')
        setMessage(`O golpe errou! ${enemyName} aproveitou a abertura.`)
      }
    } else {
      flash(good ? 'dodge' : 'miss', good ? 'PRONTO!' : 'ERROU')
      sound(good ? 'correct' : 'wrong')
      if (good) setEnergy((value) => Math.min(MAX_ENERGY, value + 1))
      setMessage(good ? 'Esquiva pronta! O próximo ataque vai passar direto.' : 'A esquiva falhou! Você ficou desprotegido.')
    }
    setStage('result')
  }

  function enemyTurn(dodged: boolean, playerWasRight: boolean) {
    stats.current.turns += 1
    const wasCharging = charging
    let damage = 0
    if (dodged) {
      flash('dodge', 'ESQUIVOU')
      setMessage(`${enemyName} atacou, mas você se esquivou!`)
      sound('select')
    } else if (shield) {
      setShield(false)
      flash('dodge', 'BLOQUEOU')
      setMessage(`${enemyName} atacou, mas o escudo bloqueou o golpe!`)
      sound('item')
    } else {
      damage = enemyDamage(boss, playerWasRight, wasCharging)
      flash('player', `−${damage}`)
      sound('wrong')
      setMessage(`${enemyName} ${wasCharging ? 'soltou o GOLPE CARREGADO' : 'contra-atacou'}! Você perdeu ${damage} de vida.${playerWasRight && !wasCharging ? ' Seu acerto diminuiu o dano.' : ''}`)
    }
    const hp = Math.max(0, playerHp - damage)
    setPlayerHp(hp)
    // A cada três turnos o monstro avisa que vai carregar um golpe forte.
    const willCharge = !wasCharging && stats.current.turns % 3 === 2
    setCharging(willCharge)
    setDetail(willCharge ? `${enemyName} está concentrando energia! O próximo ataque vai ser forte: que tal esquivar?` : null)
    if (hp === 0) {
      finished.current = true
      setEndTime(secondsSince(started))
      setStage('over')
      setMessage(`Você foi derrotado por ${enemyName}…`)
      sound('defeat')
      return
    }
    setStage('enemy')
  }

  function advance() {
    if (stage === 'result') {
      if (enemyHp === 0) {
        setStage('over')
        setMessage(`${enemyName} foi derrotado!`)
        setDetail(null)
        sound('victory')
        return
      }
      enemyTurn(action?.type === 'dodge' && lastGood === true, lastGood === true)
      return
    }
    if (stage === 'enemy') {
      setStage('menu')
      setMessage('O que você vai fazer?')
      setDetail(charging ? `${enemyName} está concentrando energia!` : null)
      return
    }
    if (stage === 'over') {
      const won = enemyHp === 0
      report(won, won ? 'complete' : 'lives', endTime ?? elapsed, playerHp)
    }
  }

  function canUse(id: PowerUpId) {
    if (!items || items[id] <= 0 || endTime !== null) return false
    if (id === 'pocao') return playerHp < MAX_HP
    if (id === 'lupa') return !lens
    if (id === 'escudo') return !shield
    return boss
  }

  function applyItem(id: PowerUpId) {
    if (!canUse(id) || !onUsePowerUp?.(id)) return
    stats.current.usedPowerUps += 1
    sound('item')
    if (id === 'pocao') {
      setPlayerHp((hp) => Math.min(MAX_HP, hp + POTION_HEAL))
      flash('heal', `+${POTION_HEAL}`)
      setMessage(`Você bebeu a poção e recuperou ${POTION_HEAL} de vida. ${enemyName} aproveita para atacar!`)
      setLastGood(false)
      setAction(null)
      setDetail(null)
      setStage('result')
      return
    }
    if (id === 'lupa') {
      setLens(true)
      setMessage('A lupa está pronta: na próxima pergunta de escolha, duas respostas erradas serão riscadas.')
    } else if (id === 'escudo') {
      setShield(true)
      setMessage('Escudo erguido! O próximo ataque do inimigo será bloqueado.')
    } else {
      setBonusSeconds((value) => value + 30)
      setMessage('Ampulheta virada: +30 segundos!')
    }
    setStage('menu')
  }

  const menuActions = [() => setStage('moves'), () => choose({ type: 'dodge' }), () => setStage('bag'), () => setExitConfirm(true)]
  const moveOrder: MoveId[] = ['rapido', 'pesado', 'chama']

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (exitConfirm || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target
      if (target instanceof Element && target.closest('.rpg-header, .battle-breadcrumb, .rpg-modal-backdrop')) return
      const digit = /^(?:Digit|Numpad)([1-4])$/.exec(event.code)?.[1] ?? (/^[1-4]$/.test(event.key) ? event.key : null)
      if (event.key === 'Escape' && (stage === 'moves' || stage === 'bag')) {
        event.preventDefault()
        setStage('menu')
        return
      }
      if (stage === 'question' && question?.choices && digit) {
        const option = question.choices[Number(digit) - 1]
        if (option && !eliminated.includes(option)) {
          event.preventDefault()
          setAnswer(option)
          sound('select')
        }
        return
      }
      if (stage === 'menu' && digit) {
        event.preventDefault()
        menuActions[Number(digit) - 1]()
        return
      }
      if (stage === 'moves' && digit) {
        event.preventDefault()
        const id = moveOrder[Number(digit) - 1]
        if (id) choose({ type: 'attack', move: id })
        else setStage('menu')
        return
      }
      if (event.key === 'Enter' || event.key === ' ' || event.code === 'Space') {
        if (stage === 'question') {
          event.preventDefault()
          submit()
        } else if (stage === 'result' || stage === 'enemy' || stage === 'over') {
          event.preventDefault()
          advance()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const enemyHit = stage === 'result' && effect?.target === 'enemy'
  const enemyAttacking = (stage === 'enemy' || (stage === 'over' && playerHp === 0)) && effect?.target === 'player'
  const enemyMood = enemyHp === 0 ? 'defeated' : enemyHit ? 'hurt' : enemyAttacking ? 'laugh' : 'idle'
  const heroState = enemyHit ? 'attack' : enemyAttacking ? 'hurt' : (stage === 'enemy' || stage === 'result') && effect?.target === 'dodge' ? 'dodge' : 'idle'
  const showHeroNumber = (stage === 'enemy' || stage === 'over' || stage === 'result') && (effect?.target === 'player' || effect?.target === 'dodge' || effect?.target === 'heal')

  return (
    <main className={`battle-page turn-battle ${bigText ? 'big-text-mode' : ''}`} id="conteudo">
      <div className="battle-breadcrumb">
        <span>
          <Swords size={14} /> BATALHA
        </span>
        <span>
          {config?.bookLabel ?? 'LIVRO I'} <span>/</span> FASE {String(level).padStart(2, '0')}
        </span>
      </div>
      <div className="battle-heading">
        <h1>{title}</h1>
        <span className={`timer ${timed && remaining <= 30 ? 'urgent' : ''}`} role="timer" aria-label={timed ? 'Tempo restante' : 'Tempo decorrido'}>
          <Clock3 size={17} />
          {formatTime(endTime !== null ? (timed ? timeLimit - endTime : endTime) : timed ? remaining : elapsed)}
        </span>
      </div>

      <section className={`battle-scene ${boss ? 'scene-boss' : ''} ${charging ? 'scene-charging' : ''}`} aria-label="Cena da batalha">
        <div className="scene-trees" aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <PixelTree key={i} />
          ))}
        </div>
        <div className="status-card enemy-card">
          <div className="status-name">
            <strong>{enemyName}</strong>
            <span>Nv. {level}</span>
          </div>
          <small>{enemy ? enemy.title : 'O COLECIONADOR DE NÚMEROS'}</small>
          <div className="status-hp">
            <b>PV</b>
            <div className="hp-bar" role="meter" aria-label={`Vida de ${enemyName}`} aria-valuemin={0} aria-valuemax={MAX_HP} aria-valuenow={enemyHp}>
              <i className={hpClass(enemyHp)} style={{ width: `${enemyHp}%` }} />
            </div>
          </div>
          {charging && (
            <span className="status-warning">
              <Zap size={12} /> carregando golpe forte
            </span>
          )}
        </div>
        <div className={`enemy-spot ${enemyHit ? 'is-hit' : ''} ${enemyAttacking ? 'is-attacking' : ''}`} key={`enemy-${effect?.id ?? 0}`}>
          <div className="enemy-platform" aria-hidden="true" />
          <div className="enemy-figure">{enemy ? <PixelCreature kind={enemy.kind} color={enemy.color} mood={enemyMood} name={enemy.name} /> : <PixelOgre mood={enemyMood} />}</div>
          {enemyHit && (
            <>
              <span className={`impact ${action?.type === 'attack' && action.move === 'chama' ? 'impact-fire' : ''}`} aria-hidden="true" />
              <span className="damage-number" aria-hidden="true">
                {effect!.text}
              </span>
            </>
          )}
          {stage === 'result' && effect?.target === 'miss' && (
            <span className="damage-number miss" aria-hidden="true">
              {effect.text}
            </span>
          )}
        </div>
        <div className={`hero-spot hero-${heroState}`} key={`hero-${effect?.id ?? 0}`}>
          <div className="hero-platform" aria-hidden="true" />
          <HeroBattleSprite state={heroState} />
          {showHeroNumber && (
            <span className={`damage-number ${effect!.target === 'heal' ? 'heal' : effect!.target === 'dodge' ? 'dodge' : 'hurt'}`} aria-hidden="true">
              {effect!.text}
            </span>
          )}
        </div>
        <div className="status-card hero-card">
          <div className="status-name">
            <strong>{heroName.toUpperCase()}</strong>
            <span>
              {shield && <Shield size={13} aria-label="Escudo ativo" />}
              {combo >= 2 && <span className="combo-chip">COMBO x{combo}</span>}
            </span>
          </div>
          <div className="status-hp">
            <b>PV</b>
            <div className="hp-bar" role="meter" aria-label="Sua vida" aria-valuemin={0} aria-valuemax={MAX_HP} aria-valuenow={playerHp}>
              <i className={hpClass(playerHp)} style={{ width: `${playerHp}%` }} />
            </div>
          </div>
          <div className="status-row">
            <span>
              {playerHp}/{MAX_HP}
            </span>
            <span className="energy" aria-label={`Energia ${energy} de ${MAX_ENERGY}`}>
              <Flame size={12} />
              {Array.from({ length: MAX_ENERGY }, (_, i) => (
                <i key={i} className={i < energy ? 'full' : ''} />
              ))}
            </span>
          </div>
        </div>
        <PixelFire className="scene-fire" />
      </section>

      <section className="battle-console">
        <div className="message-box" role="status" aria-live="polite">
          <p>{message}</p>
          {detail && <small>{detail}</small>}
          {stage === 'question' && question && <small className="console-hint">Dica: {hintForQuestion(question)}</small>}
        </div>

        <div className="console-actions">
          {stage === 'menu' && (
            <div className="command-menu" role="group" aria-label="Escolha uma ação">
              <button ref={firstButton} className="command command-attack" onClick={menuActions[0]}>
                <Swords size={18} /> <span>Atacar</span>
                <kbd>1</kbd>
              </button>
              <button className="command command-dodge" onClick={menuActions[1]}>
                <Wind size={18} /> <span>Esquivar</span>
                <kbd>2</kbd>
              </button>
              <button className="command command-bag" onClick={menuActions[2]}>
                <Backpack size={18} /> <span>Mochila</span>
                <kbd>3</kbd>
              </button>
              <button className="command command-run" onClick={menuActions[3]}>
                <Footprints size={18} /> <span>Fugir</span>
                <kbd>4</kbd>
              </button>
            </div>
          )}

          {stage === 'moves' && (
            <div className="command-menu moves-menu" role="group" aria-label="Escolha um golpe">
              {moveOrder.map((id, i) => {
                const move = MOVES[id]
                const locked = id === 'chama' && energy < MAX_ENERGY
                return (
                  <button key={id} ref={i === 0 ? firstButton : undefined} className={`command move move-${id}`} disabled={locked} onClick={() => choose({ type: 'attack', move: id })} aria-label={`${move.name}: ${move.description}`}>
                    <span className="move-name">
                      {id === 'chama' ? <Flame size={16} /> : <Swords size={16} />} {move.name}
                    </span>
                    <small>{locked ? `Energia ${energy}/${MAX_ENERGY}: acerte para carregar` : move.description}</small>
                    <kbd>{i + 1}</kbd>
                  </button>
                )
              })}
              <button className="command command-back" onClick={() => setStage('menu')}>
                <ArrowLeft size={16} /> <span>Voltar</span>
                <kbd>4</kbd>
              </button>
            </div>
          )}

          {stage === 'bag' && (
            <div className="command-menu bag-menu" role="group" aria-label="Itens da mochila">
              {powerUps
                .filter((item) => !item.bossOnly || boss)
                .map((item, i) => {
                  const Icon = powerUpIcons[item.id]
                  const count = items?.[item.id] ?? 0
                  return (
                    <button key={item.id} ref={i === 0 ? firstButton : undefined} className="command bag-item" disabled={!canUse(item.id)} onClick={() => applyItem(item.id)} aria-label={`Usar ${item.name} (${count} na mochila). ${item.description}`}>
                      <span className="move-name">
                        <Icon size={16} /> {item.name} <b>×{count}</b>
                      </span>
                      <small>{item.id === 'pocao' ? `+${POTION_HEAL} PV · gasta o turno` : item.description}</small>
                    </button>
                  )
                })}
              <button className="command command-back" onClick={() => setStage('menu')}>
                <ArrowLeft size={16} /> <span>Voltar</span>
              </button>
            </div>
          )}

          {stage === 'question' && question && (
            <form
              className="battle-question"
              onSubmit={(event) => {
                event.preventDefault()
                submit()
              }}
            >
              <p className="question-instruction" id="question-instruction">
                {question.instruction}
              </p>
              <h2 className="question-expression" id="question-expression">
                {question.expression}
              </h2>
              {question.choices ? (
                <div className={`answer-options ${question.choices.length === 3 ? 'three-options' : ''}`} role="group" aria-labelledby="question-instruction question-expression">
                  {question.choices.map((option, i) => {
                    const crossed = eliminated.includes(option)
                    return (
                      <button
                        key={option}
                        ref={i === 0 ? firstButton : undefined}
                        type="button"
                        aria-pressed={answer === option}
                        aria-keyshortcuts={String(i + 1)}
                        disabled={crossed}
                        onClick={() => {
                          setAnswer(option)
                          sound('select')
                        }}
                        className={`answer-option ${answer === option ? 'selected' : ''} ${crossed ? 'crossed-option' : ''}`}
                      >
                        <span>{i + 1}</span>
                        {option}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <NumberPad id="number-answer" inputRef={input} value={answer} onChange={setAnswer} describedBy="question-expression" />
              )}
              <button className="rpg-button submit-answer" type="submit" disabled={!answer.trim()} aria-keyshortcuts="Enter Space">
                {action?.type === 'dodge' ? <Wind size={17} /> : <Swords size={17} />} Confirmar
                <span>↵</span>
              </button>
            </form>
          )}

          {(stage === 'result' || stage === 'enemy' || stage === 'over') && (
            <div className={`turn-feedback ${stage === 'result' && action ? (lastGood ? 'good' : 'bad') : ''}`}>
              {stage === 'result' && action && (
                <strong>
                  {lastGood ? <Check size={18} /> : <X size={18} />} {lastGood ? 'Resposta certa!' : 'Não foi desta vez.'}
                </strong>
              )}
              <button ref={nextButton} className="rpg-button" onClick={advance} aria-keyshortcuts="Enter Space">
                {stage === 'over' ? 'Ver resultado' : 'Continuar'} <ArrowRight size={17} />
              </button>
            </div>
          )}
        </div>
      </section>

      {exitConfirm && (
        <div className="rpg-modal-backdrop">
          <section className="rpg-modal" role="dialog" aria-modal="true" aria-labelledby="exit-title">
            <h2 id="exit-title">Fugir da batalha?</h2>
            <p>
              Esta tentativa será encerrada. As fases que você já concluiu continuam salvas.
              {timed ? ' O cronômetro continua correndo.' : ''}
            </p>
            <div className="modal-actions">
              <button autoFocus className="rpg-button" onClick={() => setExitConfirm(false)}>
                Continuar lutando
              </button>
              <button className="secondary-button" onClick={onExit}>
                Fugir
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
