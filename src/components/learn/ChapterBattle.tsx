import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Clock3, Heart, Shield, Swords, X } from 'lucide-react'
import { BOSS_SECONDS, chapterLevels, type ChapterQuestion } from '../../data/chapter'
import { answerMatches, formatTime, generateChapterQuestions, hintForQuestion } from '../../logic/chapter'
import { PixelFire, PixelOgre, PixelTree } from './PixelArt'

export type BattleResult = {
  level: number
  correct: number
  answered: number
  seconds: number
  won: boolean
  reason: 'complete' | 'lives' | 'time'
}

export default function ChapterBattle({
  level,
  onExit,
  onFinish,
}: {
  level: number
  onExit: () => void
  onFinish: (result: BattleResult) => void
}) {
  const [questions] = useState<ChapterQuestion[]>(() => generateChapterQuestions(level))
  const [index, setIndex] = useState(0)
  const [lives, setLives] = useState(3)
  const [correct, setCorrect] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [exitConfirm, setExitConfirm] = useState(false)
  const [started] = useState(() => Date.now())
  const finished = useRef(false)
  const submitted = useRef(false)
  const snapshot = useRef({ correct: 0, answered: 0 })
  const input = useRef<HTMLInputElement>(null)
  const firstChoice = useRef<HTMLButtonElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const boss = level === 10
  const question = questions[index]
  const total = questions.length
  const remaining = Math.max(0, BOSS_SECONDS - elapsed)
  const hp = Math.max(0, 100 - correct * 12.5)
  const finishRef = useRef(onFinish)
  useEffect(() => {
    finishRef.current = onFinish
  }, [onFinish])

  function finish(reason: BattleResult['reason'], won: boolean) {
    if (finished.current) return
    finished.current = true
    finishRef.current({
      level,
      ...snapshot.current,
      seconds: Math.floor((Date.now() - started) / 1000),
      won,
      reason,
    })
  }

  useEffect(() => {
    const tick = () => {
      if (finished.current) return
      const seconds = Math.floor((Date.now() - started) / 1000)
      setElapsed(seconds)
      if (boss && seconds >= BOSS_SECONDS && !finished.current) {
        finished.current = true
        finishRef.current({
          level,
          ...snapshot.current,
          seconds: BOSS_SECONDS,
          won: false,
          reason: 'time',
        })
      }
    }
    const timer = window.setInterval(tick, 200)
    return () => window.clearInterval(timer)
  }, [boss, level, started])

  useEffect(() => {
    if (feedback !== null) nextButton.current?.focus()
    else (input.current ?? firstChoice.current)?.focus()
  }, [index, feedback])

  function submit() {
    if (submitted.current || finished.current || !answer.trim()) return
    if (boss && Date.now() - started >= BOSS_SECONDS * 1000) {
      finish('time', false)
      return
    }
    submitted.current = true
    const good = answerMatches(question, answer)
    const newLives = lives - (good ? 0 : 1)
    const newCorrect = correct + (good ? 1 : 0)
    snapshot.current = { correct: newCorrect, answered: index + 1 }
    setCorrect(newCorrect)
    setLives(newLives)
    setFeedback(good)
    // Freeze the final result immediately; showing the explanation cannot cause a timeout.
    if (newLives === 0 || index === total - 1) {
      finished.current = true
      const seconds = Math.floor((Date.now() - started) / 1000)
      setEndTime(seconds)
    }
  }

  function next() {
    if (feedback === null) return
    if (lives === 0 || index === total - 1) {
      finishRef.current({
        level,
        ...snapshot.current,
        seconds: endTime ?? elapsed,
        won: lives > 0,
        reason: lives === 0 ? 'lives' : 'complete',
      })
      return
    }
    submitted.current = false
    setIndex((n) => n + 1)
    setAnswer('')
    setFeedback(null)
  }

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (exitConfirm || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target
      if (
        target instanceof Element &&
        target.closest('.rpg-header, .battle-breadcrumb, .rpg-modal-backdrop')
      ) return

      if (question.choices && feedback === null) {
        const digit = /^(?:Digit|Numpad)([1-4])$/.exec(event.code)?.[1] ??
          (/^[1-4]$/.test(event.key) ? event.key : null)
        if (digit && question.choices[Number(digit) - 1]) {
          event.preventDefault()
          setAnswer(question.choices[Number(digit) - 1])
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
          <span className="lives" aria-label={`${lives} vidas restantes`}>
            {[1, 2, 3].map((n) => (
              <Heart
                key={n}
                size={23}
                fill={n <= lives ? 'currentColor' : 'none'}
                className={n > lives ? 'lost-heart' : ''}
              />
            ))}
          </span>
          <span
            className={`timer ${boss && remaining <= 30 ? 'urgent' : ''}`}
            role="timer"
            aria-label={boss ? 'Tempo restante' : 'Tempo decorrido'}
          >
            <Clock3 size={17} />
            {formatTime(
              endTime !== null
                ? boss
                  ? BOSS_SECONDS - endTime
                  : endTime
                : boss
                  ? remaining
                  : elapsed,
            )}
          </span>
        </div>
      </div>
      {boss ? (
        <section
          className={`battle-arena ${feedback === false ? 'player-hit' : ''}`}
          aria-label="Arena de batalha"
        >
          <div className="arena-trees">
            {Array.from({ length: 12 }, (_, i) => (
              <PixelTree key={i} />
            ))}
          </div>
          <div className="enemy-status">
            <div>
              <strong>GRUM</strong>
              <span>
                Lv. 10 <Shield size={13} />
              </span>
            </div>
            <small>O COLECIONADOR DE NÚMEROS</small>
            <div className="hp-row">
              <b>HP</b>
              <div className="hp-track">
                <div style={{ width: `${hp}%` }} />
              </div>
              <span>{Math.ceil(hp)}/100</span>
            </div>
          </div>
          <div className="enemy-ground" />
          <div className="enemy-sprite">
            <PixelOgre mood={feedback === false ? 'laugh' : feedback === true ? 'hurt' : 'idle'} />
            {feedback === true && <span key={index} className="sword-slash" />}
            {feedback === false && (
              <span key={index} className="ogre-speech">
                HA! HA! HA!
              </span>
            )}
          </div>
          <PixelFire className="arena-fire" />
          {feedback === false && (
            <span key={index} className="player-damage" aria-hidden="true">
              −1 ♥
            </span>
          )}
          <div className="arena-caption">
            <Swords size={15} />
            {feedback === true
              ? hp === 0
                ? 'Defesa quebrada! Termine os desafios.'
                : 'Golpe certeiro! −12,5 HP'
              : feedback === false
                ? 'Grum contra-atacou! −1 vida'
                : '10 perguntas. 8 acertos. Uma grande vitória.'}
          </div>
        </section>
      ) : null}
      <section className="question-panel">
        <div className="question-top">
          <span>
            DESAFIO {String(index + 1).padStart(2, '0')} <span>/ {total}</span>
          </span>
          <span>
            {correct} {correct === 1 ? 'acerto' : 'acertos'} <Check size={14} />
          </span>
        </div>
        <div
          className="question-dots"
          aria-label={`${index + (feedback !== null ? 1 : 0)} de ${total} respondidas`}
        >
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
            <div
              className={`answer-options ${question.choices.length === 3 ? 'three-options' : ''}`}
              role="group"
              aria-labelledby="question-instruction question-expression"
            >
              {question.choices.map((option, i) => (
                <button
                  key={option}
                  ref={i === 0 ? firstChoice : undefined}
                  type="button"
                  aria-pressed={answer === option}
                  aria-keyshortcuts={String(i + 1)}
                  disabled={feedback !== null}
                  onClick={() => setAnswer(option)}
                  className={`answer-option ${answer === option ? 'selected' : ''} ${feedback !== null && option === question.answer ? 'correct-option' : ''}`}
                >
                  <span>{i + 1}</span>
                  {option}
                </button>
              ))}
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
              {boss ? <Swords size={17} /> : <Check size={17} />}{' '}
              {boss ? 'Confirmar ataque' : 'Confirmar resposta'}
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
                <p>{question.explanation}</p>
              </div>
            </div>
            <button
              ref={nextButton}
              className="rpg-button"
              onClick={next}
              aria-keyshortcuts="Enter Space"
              title="Enter ou Espaço"
            >
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
          <section
            className="rpg-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-title"
          >
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
