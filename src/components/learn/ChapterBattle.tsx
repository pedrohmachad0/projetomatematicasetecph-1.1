import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock3, Flame, Heart, Hourglass, Search, Shield, Swords, X } from 'lucide-react'
import { BOSS_SECONDS, chapterLevels, type ChapterQuestion } from '../../data/chapter'
import { enemies, powerUps, type PowerUpId } from '../../data/quest'
import { answerMatches, formatTime, generateChapterQuestions, hintForQuestion } from '../../logic/chapter'
import { damagePerHit, lensEliminations } from '../../logic/quest'
import { playSound, type SoundEffect } from '../../logic/sound'
import { PixelFire, PixelOgre, PixelTree } from './PixelArt'
import PixelCreature from './PixelCreature'

export type BattleResult = {
  level: number
  correct: number
  answered: number
  seconds: number
  won: boolean
  reason: 'complete' | 'lives' | 'time'
  maxCombo: number
  livesLeft: number
  usedPowerUps: number
}

const powerUpIcons: Record<PowerUpId, typeof Heart> = {
  pocao: Heart,
  lupa: Search,
  escudo: Shield,
  ampulheta: Hourglass,
}

const MAX_LIVES = 3

export default function ChapterBattle({
  level,
  onExit,
  onFinish,
  items,
  onUsePowerUp,
  soundOn = false,
}: {
  level: number
  onExit: () => void
  onFinish: (result: BattleResult) => void
  /** Quantidade de cada item na mochila. Sem esta prop a barra de itens não aparece. */
  items?: Record<PowerUpId, number>
  /** Deve gastar o item e devolver `true` quando ele puder ser usado. */
  onUsePowerUp?: (id: PowerUpId) => boolean
  soundOn?: boolean
}) {
  const [questions] = useState<ChapterQuestion[]>(() => generateChapterQuestions(level))
  const [index, setIndex] = useState(0)
  const [lives, setLives] = useState(MAX_LIVES)
  const [correct, setCorrect] = useState(0)
  const [combo, setCombo] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [blocked, setBlocked] = useState(false)
  const [shield, setShield] = useState(false)
  const [eliminated, setEliminated] = useState<string[]>([])
  const [bonusSeconds, setBonusSeconds] = useState(0)
  const [itemMessage, setItemMessage] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [exitConfirm, setExitConfirm] = useState(false)
  const [started] = useState(() => Date.now())
  const finished = useRef(false)
  const submitted = useRef(false)
  const snapshot = useRef({ correct: 0, answered: 0, maxCombo: 0, livesLeft: MAX_LIVES, usedPowerUps: 0 })
  const input = useRef<HTMLInputElement>(null)
  const firstChoice = useRef<HTMLButtonElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const boss = level === 10
  const enemy = boss ? null : enemies[level - 1]
  const question = questions[index]
  const total = questions.length
  const timeLimit = BOSS_SECONDS + bonusSeconds
  const remaining = Math.max(0, timeLimit - elapsed)
  const hit = damagePerHit(level)
  const hp = Math.max(0, 100 - correct * hit)
  const onFire = combo >= 3
  const finishRef = useRef(onFinish)
  const limitRef = useRef(timeLimit)
  useEffect(() => {
    finishRef.current = onFinish
  }, [onFinish])
  useEffect(() => {
    limitRef.current = timeLimit
  }, [timeLimit])

  function sound(effect: SoundEffect) {
    playSound(effect, soundOn)
  }

  function finish(reason: BattleResult['reason'], won: boolean, seconds = Math.floor((Date.now() - started) / 1000)) {
    if (finished.current) return
    finished.current = true
    sound(won ? 'victory' : 'defeat')
    finishRef.current({ level, ...snapshot.current, seconds, won, reason })
  }

  useEffect(() => {
    const tick = () => {
      if (finished.current) return
      const seconds = Math.floor((Date.now() - started) / 1000)
      setElapsed(seconds)
      if (boss && seconds >= limitRef.current && !finished.current) {
        finished.current = true
        playSound('defeat', soundOn)
        finishRef.current({ level, ...snapshot.current, seconds: limitRef.current, won: false, reason: 'time' })
      }
    }
    const timer = window.setInterval(tick, 200)
    return () => window.clearInterval(timer)
  }, [boss, level, started, soundOn])

  useEffect(() => {
    if (feedback !== null) nextButton.current?.focus()
    else (input.current ?? firstChoice.current)?.focus()
  }, [index, feedback])

  function submit() {
    if (submitted.current || finished.current || !answer.trim()) return
    if (boss && Date.now() - started >= timeLimit * 1000) {
      finish('time', false, timeLimit)
      return
    }
    submitted.current = true
    const good = answerMatches(question, answer)
    const absorbed = !good && shield
    const newLives = lives - (good || absorbed ? 0 : 1)
    const newCorrect = correct + (good ? 1 : 0)
    const newCombo = good ? combo + 1 : 0
    snapshot.current = {
      ...snapshot.current,
      correct: newCorrect,
      answered: index + 1,
      maxCombo: Math.max(snapshot.current.maxCombo, newCombo),
      livesLeft: newLives,
    }
    if (absorbed) setShield(false)
    setBlocked(absorbed)
    setCorrect(newCorrect)
    setLives(newLives)
    setCombo(newCombo)
    setFeedback(good)
    setItemMessage(null)
    sound(good ? (newCombo >= 3 ? 'combo' : 'correct') : 'wrong')
    // Congela o resultado na hora: ler a explicação não pode estourar o tempo.
    if (newLives === 0 || index === total - 1) {
      finished.current = true
      setEndTime(Math.floor((Date.now() - started) / 1000))
    }
  }

  function next() {
    if (feedback === null) return
    if (lives === 0 || index === total - 1) {
      const won = lives > 0
      sound(won ? 'victory' : 'defeat')
      finishRef.current({
        level,
        ...snapshot.current,
        seconds: endTime ?? elapsed,
        won,
        reason: lives === 0 ? 'lives' : 'complete',
      })
      return
    }
    submitted.current = false
    setIndex((n) => n + 1)
    setAnswer('')
    setFeedback(null)
    setBlocked(false)
    setEliminated([])
  }

  function canUse(id: PowerUpId) {
    if (!items || items[id] <= 0 || feedback !== null || endTime !== null) return false
    if (id === 'pocao') return lives < MAX_LIVES
    if (id === 'lupa') return (question.choices?.length ?? 0) >= 3 && eliminated.length === 0
    if (id === 'escudo') return !shield
    return boss
  }

  function use(id: PowerUpId) {
    if (!canUse(id) || !onUsePowerUp?.(id)) return
    snapshot.current = { ...snapshot.current, usedPowerUps: snapshot.current.usedPowerUps + 1 }
    sound('item')
    if (id === 'pocao') {
      setLives((value) => Math.min(MAX_LIVES, value + 1))
      snapshot.current = { ...snapshot.current, livesLeft: Math.min(MAX_LIVES, lives + 1) }
      setItemMessage('Poção usada: +1 coração!')
    } else if (id === 'lupa') {
      const crossed = lensEliminations(question)
      setEliminated(crossed)
      if (crossed.includes(answer)) setAnswer('')
      setItemMessage('A lupa riscou duas respostas erradas.')
    } else if (id === 'escudo') {
      setShield(true)
      setItemMessage('Escudo erguido: o próximo erro não tira coração.')
    } else {
      setBonusSeconds((value) => value + 30)
      setItemMessage('Ampulheta virada: +30 segundos!')
    }
  }

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (exitConfirm || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target
      if (target instanceof Element && target.closest('.rpg-header, .battle-breadcrumb, .rpg-modal-backdrop, .power-bar')) return

      if (question.choices && feedback === null) {
        const digit = /^(?:Digit|Numpad)([1-4])$/.exec(event.code)?.[1] ?? (/^[1-4]$/.test(event.key) ? event.key : null)
        const option = digit ? question.choices[Number(digit) - 1] : undefined
        if (option && !eliminated.includes(option)) {
          event.preventDefault()
          setAnswer(option)
          sound('select')
          return
        }
      }

      if (event.key === 'Enter' || event.key === ' ' || event.code === 'Space') {
        event.preventDefault()
        if (feedback === null) submit()
        else next()
      }
    }
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  })

  const enemyName = boss ? 'GRUM' : enemy!.name
  const mood = hp === 0 && feedback !== false ? 'defeated' : feedback === false && !blocked ? 'laugh' : feedback === true ? 'hurt' : 'idle'
  const caption =
    feedback === true
      ? hp === 0
        ? `${enemyName} foi derrotado! Termine os desafios para ganhar mais estrelas.`
        : `${onFire ? `COMBO x${combo}! ` : ''}Golpe certeiro! −${Number(hit.toFixed(1)).toLocaleString('pt-BR')} HP`
      : feedback === false
        ? blocked
          ? 'O escudo bloqueou o golpe! Nenhum coração perdido.'
          : `${enemyName} contra-atacou! −1 vida`
        : itemMessage ??
          (boss
            ? '10 perguntas. 8 acertos. Uma grande vitória.'
            : `Acerte ${Math.round(100 / hit)} desafios para derrotar ${enemyName}.`)
  const usableItems = items ? powerUps.filter((item) => !item.bossOnly || boss) : []

  return (
    <main className="battle-page" id="conteudo">
      <div className="battle-breadcrumb">
        <button className="text-button" onClick={() => setExitConfirm(true)}>
          <ArrowLeft size={16} /> Voltar à trilha
        </button>
        <span>
          LIVRO I <span>/</span> FASE {String(level).padStart(2, '0')}
        </span>
      </div>
      <div className="battle-heading">
        <div>
          <h1>{chapterLevels[level - 1].title}</h1>
        </div>
        <div className="battle-counters">
          {combo >= 2 && (
            <span key={combo} className={`combo-badge ${onFire ? 'on-fire' : ''}`} aria-label={`Combo de ${combo} acertos seguidos`}>
              <Flame size={16} /> x{combo}
            </span>
          )}
          <span className={`lives ${shield ? 'shielded' : ''}`} aria-label={`${lives} vidas restantes${shield ? ', escudo ativo' : ''}`}>
            {shield && <Shield size={20} className="shield-icon" />}
            {[1, 2, 3].map((n) => (
              <Heart key={n} size={23} fill={n <= lives ? 'currentColor' : 'none'} className={n > lives ? 'lost-heart' : ''} />
            ))}
          </span>
          <span className={`timer ${boss && remaining <= 30 ? 'urgent' : ''}`} role="timer" aria-label={boss ? 'Tempo restante' : 'Tempo decorrido'}>
            <Clock3 size={17} />
            {formatTime(endTime !== null ? (boss ? timeLimit - endTime : endTime) : boss ? remaining : elapsed)}
          </span>
        </div>
      </div>
      <section className={`battle-arena ${boss ? 'boss-arena' : 'creature-arena'} ${feedback === false && !blocked ? 'player-hit' : ''} ${onFire ? 'arena-on-fire' : ''}`} aria-label="Arena de batalha">
        <div className="arena-trees">
          {Array.from({ length: 12 }, (_, i) => (
            <PixelTree key={i} />
          ))}
        </div>
        <div className="enemy-status">
          <div>
            <strong>{enemyName}</strong>
            <span>
              Lv. {level} <Shield size={13} />
            </span>
          </div>
          <small>{boss ? 'O COLECIONADOR DE NÚMEROS' : enemy!.title}</small>
          <div className="hp-row">
            <b>HP</b>
            <div className="hp-track">
              <div style={{ width: `${hp}%` }} className={hp <= 34 ? 'low-hp' : ''} />
            </div>
            <span>{Math.ceil(hp)}/100</span>
          </div>
        </div>
        <div className="enemy-ground" />
        <div className="enemy-sprite">
          {boss ? <PixelOgre mood={mood} /> : <PixelCreature kind={enemy!.kind} color={enemy!.color} mood={mood} name={enemy!.name} />}
          {feedback === true && <span key={`slash-${index}`} className="sword-slash" />}
          {feedback === true && (
            <span key={`dmg-${index}`} className={`enemy-damage ${onFire ? 'critical' : ''}`} aria-hidden="true">
              {onFire ? 'CRÍTICO! ' : ''}−{Math.round(hit)}
            </span>
          )}
          {feedback === false && !blocked && (
            <span key={`speech-${index}`} className="ogre-speech">
              {boss ? 'HA! HA! HA!' : enemy!.taunt}
            </span>
          )}
        </div>
        <PixelFire className="arena-fire" />
        {feedback === false && !blocked && (
          <span key={`hurt-${index}`} className="player-damage" aria-hidden="true">
            −1 ♥
          </span>
        )}
        <div className="arena-caption" aria-live="polite">
          <Swords size={15} />
          {caption}
        </div>
      </section>
      {usableItems.length > 0 && (
        <div className="power-bar" role="group" aria-label="Itens da mochila">
          {usableItems.map((item) => {
            const Icon = powerUpIcons[item.id]
            const count = items![item.id]
            return (
              <button
                key={item.id}
                type="button"
                className="power-button"
                disabled={!canUse(item.id)}
                onClick={() => use(item.id)}
                title={item.description}
                aria-label={`Usar ${item.name} (${count} na mochila). ${item.description}`}
              >
                <Icon size={16} />
                <span>{item.name}</span>
                <b>{count}</b>
              </button>
            )
          })}
        </div>
      )}
      <section className="question-panel">
        <div className="question-top">
          <span>
            DESAFIO {String(index + 1).padStart(2, '0')} <span>/ {total}</span>
          </span>
          <span>
            {correct} {correct === 1 ? 'acerto' : 'acertos'} <Check size={14} />
          </span>
        </div>
        <div className="question-dots" aria-label={`${index + (feedback !== null ? 1 : 0)} de ${total} respondidas`}>
          {questions.map((_, i) => (
            <i key={i} className={i < index ? 'done' : i === index ? 'current' : ''} />
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
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
                    ref={i === 0 ? firstChoice : undefined}
                    type="button"
                    aria-pressed={answer === option}
                    aria-keyshortcuts={String(i + 1)}
                    aria-disabled={crossed || undefined}
                    disabled={feedback !== null || crossed}
                    onClick={() => {
                      setAnswer(option)
                      sound('select')
                    }}
                    className={`answer-option ${answer === option ? 'selected' : ''} ${crossed ? 'crossed-option' : ''} ${feedback !== null && option === question.answer ? 'correct-option' : ''} ${feedback === false && option === answer ? 'wrong-option' : ''}`}
                  >
                    <span>{i + 1}</span>
                    {option}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="number-answer">
              <label htmlFor="number-answer">Sua resposta</label>
              <input
                ref={input}
                id="number-answer"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={answer}
                disabled={feedback !== null}
                onChange={(e) => {
                  if (/^\d{0,5}$/.test(e.target.value)) setAnswer(e.target.value)
                }}
                placeholder="Digite aqui…"
                aria-describedby="question-expression"
              />
            </div>
          )}
          {feedback === null && (
            <button className="rpg-button submit-answer" type="submit" disabled={!answer.trim()} aria-keyshortcuts="Enter Space" title="Enter ou Espaço">
              <Swords size={17} /> {boss ? 'Confirmar ataque' : 'Confirmar resposta'}
              <span>↵ / espaço</span>
            </button>
          )}
        </form>
        {feedback !== null && (
          <div className={`answer-feedback ${feedback ? 'good' : 'bad'}`} role="status">
            <div>
              {feedback ? <Check size={21} /> : <X size={21} />}
              <div>
                <strong>{feedback ? 'Resposta certa!' : 'Não foi desta vez.'}</strong>
                {feedback && onFire && <span className="feedback-combo">Combo x{combo}: +2 moedas se você vencer</span>}
                <p>{question.explanation}</p>
              </div>
            </div>
            <button ref={nextButton} className="rpg-button" onClick={next} aria-keyshortcuts="Enter Space" title="Enter ou Espaço">
              {lives === 0 || index === total - 1 ? 'Ver resultado' : 'Próximo desafio'}
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </section>
      <aside className="lesson-tip" aria-label="Dica da questão">
        <PixelFire />
        <div>
          <strong>Dica da fogueira</strong>
          <p>{hintForQuestion(question)}</p>
        </div>
      </aside>
      {exitConfirm && (
        <div className="rpg-modal-backdrop">
          <section className="rpg-modal" role="dialog" aria-modal="true" aria-labelledby="exit-title">
            <h2 id="exit-title">Voltar ao acampamento?</h2>
            <p>
              Esta tentativa será encerrada. As fases que você já concluiu continuam salvas.
              {boss ? ' O cronômetro continua correndo.' : ''}
            </p>
            <div className="modal-actions">
              <button autoFocus className="rpg-button" onClick={() => setExitConfirm(false)}>
                Continuar jogando
              </button>
              <button className="secondary-button" onClick={onExit}>
                Sair da fase
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
