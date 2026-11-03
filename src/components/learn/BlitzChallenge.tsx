import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, Clock3, Flame, X, Zap } from 'lucide-react'
import type { ChapterQuestion } from '../../data/chapter'
import { BLITZ_SECONDS } from '../../data/quest'
import { answerMatches, formatTime } from '../../logic/chapter'
import { blitzQuestion } from '../../logic/quest'
import { playSound } from '../../logic/sound'

export type BlitzResult = { score: number; answered: number; maxCombo: number }

interface Props {
  unlocked: number
  best: number
  soundOn: boolean
  onExit: () => void
  onFinish: (result: BlitzResult) => void
}

/** Contra o relógio: o máximo de contas certas em 60 segundos, sem perder vidas. */
export default function BlitzChallenge({ unlocked, best, soundOn, onExit, onFinish }: Props) {
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [combo, setCombo] = useState(0)
  const [question, setQuestion] = useState<ChapterQuestion>(() => blitzQuestion(0, unlocked))
  const [answer, setAnswer] = useState('')
  const [flash, setFlash] = useState<{ good: boolean; answer: string } | null>(null)
  const [remaining, setRemaining] = useState(BLITZ_SECONDS)
  const [started] = useState(() => Date.now())
  const result = useRef<BlitzResult>({ score: 0, answered: 0, maxCombo: 0 })
  const done = useRef(false)
  const input = useRef<HTMLInputElement>(null)
  const firstChoice = useRef<HTMLButtonElement>(null)
  const finishRef = useRef(onFinish)
  useEffect(() => {
    finishRef.current = onFinish
  }, [onFinish])

  useEffect(() => {
    const timer = window.setInterval(() => {
      const left = Math.max(0, BLITZ_SECONDS - Math.floor((Date.now() - started) / 1000))
      setRemaining(left)
      if (left === 0 && !done.current) {
        done.current = true
        playSound('victory', soundOn)
        finishRef.current(result.current)
      }
    }, 200)
    return () => window.clearInterval(timer)
  }, [started, soundOn])

  useEffect(() => {
    if (!flash) (input.current ?? firstChoice.current)?.focus()
  }, [question, flash])

  function respond(value: string) {
    if (done.current || flash || !value.trim()) return
    const good = answerMatches(question, value)
    const nextScore = score + (good ? 1 : 0)
    const nextCombo = good ? combo + 1 : 0
    result.current = { score: nextScore, answered: answered + 1, maxCombo: Math.max(result.current.maxCombo, nextCombo) }
    setScore(nextScore)
    setAnswered((n) => n + 1)
    setCombo(nextCombo)
    setFlash({ good, answer: question.answer })
    playSound(good ? (nextCombo >= 3 ? 'combo' : 'correct') : 'wrong', soundOn)
    window.setTimeout(
      () => {
        if (done.current) return
        setQuestion(blitzQuestion(nextScore, unlocked))
        setAnswer('')
        setFlash(null)
      },
      good ? 450 : 1100,
    )
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || flash) return
      if (question.choices) {
        const digit = /^(?:Digit|Numpad)([1-4])$/.exec(event.code)?.[1] ?? (/^[1-4]$/.test(event.key) ? event.key : null)
        const option = digit ? question.choices[Number(digit) - 1] : undefined
        if (option) {
          event.preventDefault()
          respond(option)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const urgent = remaining <= 10

  return (
    <main className="battle-page blitz-page" id="conteudo">
      <div className="battle-breadcrumb">
        <button className="text-button" onClick={onExit}>
          <ArrowLeft size={16} /> Voltar à trilha
        </button>
        <span>
          DESAFIO RELÂMPAGO <span>/</span> RECORDE {best}
        </span>
      </div>
      <div className="battle-heading">
        <div>
          <h1>
            <Zap size={22} /> Desafio Relâmpago
          </h1>
        </div>
        <div className="battle-counters">
          {combo >= 2 && (
            <span key={combo} className={`combo-badge ${combo >= 3 ? 'on-fire' : ''}`} aria-label={`Combo de ${combo}`}>
              <Flame size={16} /> x{combo}
            </span>
          )}
          <span className="blitz-score" aria-live="polite">
            {score} {score === 1 ? 'ponto' : 'pontos'}
          </span>
          <span className={`timer ${urgent ? 'urgent' : ''}`} role="timer" aria-label="Tempo restante">
            <Clock3 size={17} />
            {formatTime(remaining)}
          </span>
        </div>
      </div>
      <div className="blitz-time" aria-hidden="true">
        <i style={{ width: `${(remaining / BLITZ_SECONDS) * 100}%` }} className={urgent ? 'urgent' : ''} />
      </div>
      <section className={`question-panel ${flash ? (flash.good ? 'blitz-good' : 'blitz-bad') : ''}`}>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            respond(answer)
          }}
        >
          <p className="question-instruction" id="question-instruction">
            {question.instruction}
          </p>
          <h2 className="question-expression" id="question-expression">
            {question.expression}
          </h2>
          {question.choices ? (
            <div className="answer-options" role="group" aria-labelledby="question-instruction question-expression">
              {question.choices.map((option, i) => (
                <button
                  key={option}
                  ref={i === 0 ? firstChoice : undefined}
                  type="button"
                  disabled={flash !== null}
                  onClick={() => respond(option)}
                  className={`answer-option ${flash && option === flash.answer ? 'correct-option' : ''}`}
                  aria-keyshortcuts={String(i + 1)}
                >
                  <span>{i + 1}</span>
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <div className="number-answer">
              <label htmlFor="blitz-answer">Sua resposta</label>
              <input
                ref={input}
                id="blitz-answer"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={answer}
                disabled={flash !== null}
                onChange={(event) => {
                  if (/^\d{0,5}$/.test(event.target.value)) setAnswer(event.target.value)
                }}
                placeholder="Digite e aperte Enter"
              />
            </div>
          )}
          {!question.choices && (
            <button className="rpg-button submit-answer" type="submit" disabled={!answer.trim() || flash !== null}>
              <Check size={17} /> Confirmar
              <span>↵</span>
            </button>
          )}
        </form>
        <div className="blitz-flash" role="status">
          {flash &&
            (flash.good ? (
              <>
                <Check size={18} /> Certo! +1
              </>
            ) : (
              <>
                <X size={18} /> A resposta era {flash.answer}
              </>
            ))}
        </div>
      </section>
      <aside className="lesson-tip">
        <Zap size={28} />
        <div>
          <strong>Como funciona</strong>
          <p>Responda o máximo que conseguir em 1 minuto. Errar não tira vida, mas zera o combo. A cada 2 pontos você ganha 1 moeda.</p>
        </div>
      </aside>
    </main>
  )
}
