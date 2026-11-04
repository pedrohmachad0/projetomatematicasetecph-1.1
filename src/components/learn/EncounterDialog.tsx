import { useEffect, useRef, useState } from 'react'
import NumberPad from './NumberPad'
import { ArrowRight, Check, Heart, Swords, X } from 'lucide-react'
import type { ChapterQuestion } from '../../data/chapter'
import type { Enemy } from '../../data/quest'
import { answerMatches } from '../../logic/chapter'
import { topicQuestion, type TopicId } from '../../logic/questTopics'
import { playSound } from '../../logic/sound'
import PixelCreature from './PixelCreature'
import { ChestSprite, GateSprite, VillagerSprite } from './MapSprites'
import type { BookTheme } from '../../data/questBooks'

export type EncounterKind = 'monster' | 'villager' | 'chest' | 'gate'

interface Props {
  kind: EncounterKind
  title: string
  subtitle: string
  intro: string
  topics: TopicId[]
  /** Acertos necessários (vida do monstro). */
  hits: number
  enemy?: Enemy
  villager?: number
  theme: BookTheme
  soundOn: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * Desafio rápido dentro do mapa. Errar não tira coração: mostra a explicação e
 * troca a pergunta, para que ninguém fique preso no mapa.
 */
export default function EncounterDialog({ kind, title, subtitle, intro, topics, hits, enemy, villager = 0, theme, soundOn, onClose, onSuccess }: Props) {
  const story = kind !== 'monster'
  const [question, setQuestion] = useState<ChapterQuestion>(() => topicQuestion(topics, Math.random, story))
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [remaining, setRemaining] = useState(hits)
  const [mistakes, setMistakes] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const firstChoice = useRef<HTMLButtonElement>(null)
  const nextButton = useRef<HTMLButtonElement>(null)
  const won = remaining === 0

  useEffect(() => {
    if (feedback !== null) nextButton.current?.focus()
    else (input.current ?? firstChoice.current)?.focus()
  }, [question, feedback])

  function submit() {
    if (feedback !== null || !answer.trim()) return
    const good = answerMatches(question, answer)
    setFeedback(good)
    if (good) setRemaining((value) => value - 1)
    else setMistakes((value) => value + 1)
    playSound(good ? (remaining === 1 ? 'victory' : 'correct') : 'wrong', soundOn)
  }

  function next() {
    if (won) {
      onSuccess()
      return
    }
    setQuestion(topicQuestion(topics, Math.random, story))
    setAnswer('')
    setFeedback(null)
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return
      if (question.choices && feedback === null) {
        const digit = /^(?:Digit|Numpad)([1-4])$/.exec(event.code)?.[1] ?? (/^[1-4]$/.test(event.key) ? event.key : null)
        const option = digit ? question.choices[Number(digit) - 1] : undefined
        if (option) {
          event.preventDefault()
          setAnswer(option)
          return
        }
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        if (feedback === null) submit()
        else next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const successText =
    kind === 'monster' ? `${title} fugiu da trilha!` : kind === 'villager' ? 'Problema resolvido! O morador agradece.' : kind === 'chest' ? 'O cadeado abriu! Moedas para a sua bolsa.' : 'Caminho liberado!'

  return (
    <div className="rpg-modal-backdrop encounter-backdrop">
      <section className={`rpg-modal encounter encounter-${kind}`} role="dialog" aria-modal="true" aria-labelledby="encounter-title">
        <button className="modal-close" aria-label="Sair do desafio" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="encounter-head">
          <div className="encounter-portrait" aria-hidden="true">
            {kind === 'monster' && enemy ? (
              <PixelCreature kind={enemy.kind} color={enemy.color} name={enemy.name} mood={won ? 'defeated' : feedback === true ? 'hurt' : feedback === false ? 'laugh' : 'idle'} />
            ) : kind === 'villager' ? (
              <VillagerSprite variant={villager} />
            ) : kind === 'chest' ? (
              <ChestSprite open={won} />
            ) : (
              <GateSprite open={won} theme={theme} />
            )}
          </div>
          <div>
            <p className="eyebrow">{subtitle}</p>
            <h2 id="encounter-title">{title}</h2>
            <p className="encounter-intro">{intro}</p>
            {hits > 1 && (
              <p className="encounter-hp" aria-label={`Faltam ${remaining} acertos`}>
                {Array.from({ length: hits }, (_, i) => (
                  <Heart key={i} size={16} fill={i < remaining ? 'currentColor' : 'none'} />
                ))}
                <span>faltam {remaining} acerto{remaining === 1 ? '' : 's'}</span>
              </p>
            )}
          </div>
        </div>

        <form
          className="encounter-question"
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <p className="question-instruction" id="encounter-instruction">
            {question.instruction}
          </p>
          <p className="question-expression encounter-expression" id="encounter-expression">
            {question.expression}
          </p>
          {question.choices ? (
            <div className="answer-options" role="group" aria-labelledby="encounter-instruction encounter-expression">
              {question.choices.map((option, i) => (
                <button
                  key={option}
                  ref={i === 0 ? firstChoice : undefined}
                  type="button"
                  aria-pressed={answer === option}
                  disabled={feedback !== null}
                  onClick={() => setAnswer(option)}
                  className={`answer-option ${answer === option ? 'selected' : ''} ${feedback !== null && option === question.answer ? 'correct-option' : ''} ${feedback === false && option === answer ? 'wrong-option' : ''}`}
                >
                  <span>{i + 1}</span>
                  {option}
                </button>
              ))}
            </div>
          ) : (
            <NumberPad id="encounter-answer" inputRef={input} value={answer} onChange={setAnswer} disabled={feedback !== null} />
          )}
          {feedback === null && (
            <button className="rpg-button submit-answer" type="submit" disabled={!answer.trim()}>
              {kind === 'monster' ? <Swords size={17} /> : <Check size={17} />} {kind === 'monster' ? 'Atacar' : 'Responder'}
            </button>
          )}
        </form>

        {feedback !== null && (
          <div className={`answer-feedback ${feedback ? 'good' : 'bad'}`} role="status">
            <div>
              {feedback ? <Check size={21} /> : <X size={21} />}
              <div>
                <strong>{won ? successText : feedback ? 'Acertou!' : 'Não foi desta vez.'}</strong>
                <p>{question.explanation}</p>
                {!feedback && <p className="encounter-tip">Dica: {question.hint}</p>}
              </div>
            </div>
            <button ref={nextButton} className="rpg-button" onClick={next}>
              {won ? 'Voltar ao mapa' : feedback ? 'Próximo golpe' : 'Tentar outra'}
              <ArrowRight size={17} />
            </button>
          </div>
        )}
        {mistakes > 0 && !won && <p className="encounter-note">Errar aqui não tira coração: leia a explicação e tente uma nova pergunta.</p>}
      </section>
    </div>
  )
}
