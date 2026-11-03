import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  speaker: string
  portrait?: ReactNode
  lines: string[]
  /** Milissegundos por letra; 0 mostra o texto inteiro. */
  speed: number
  onDone: () => void
  doneLabel?: string
}

/**
 * Caixa de diálogo de RPG: o texto aparece letra por letra. Enter, Espaço ou
 * um toque completam a frase; de novo, passam para a próxima.
 */
export default function DialogueBox({ speaker, portrait, lines, speed, onDone, doneLabel = 'Continuar' }: Props) {
  const [line, setLine] = useState(0)
  const [shown, setShown] = useState(speed === 0 ? lines[0].length : 0)
  const button = useRef<HTMLButtonElement>(null)
  const text = lines[line]
  const complete = shown >= text.length
  const last = line === lines.length - 1

  useEffect(() => {
    button.current?.focus()
  }, [])

  useEffect(() => {
    if (complete) return
    const timer = window.setTimeout(() => setShown((value) => value + 1), speed)
    return () => window.clearTimeout(timer)
  }, [shown, complete, speed])

  function advance() {
    if (!complete) {
      setShown(text.length)
      return
    }
    if (last) {
      onDone()
      return
    }
    setLine((value) => value + 1)
    setShown(speed === 0 ? lines[line + 1].length : 0)
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Enter' || event.key === ' ' || event.key.toLowerCase() === 'e') {
        event.preventDefault()
        event.stopPropagation()
        advance()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  return (
    <div className="dialogue-layer" onClick={advance}>
      <section className="dialogue-box" role="dialog" aria-label={`Conversa com ${speaker}`}>
        {portrait && (
          <div className="dialogue-portrait" aria-hidden="true">
            {portrait}
          </div>
        )}
        <div className="dialogue-body">
          <strong className="dialogue-speaker">{speaker}</strong>
          <p aria-live="polite">
            <span>{text.slice(0, shown)}</span>
            <span className="dialogue-rest" aria-hidden="true">
              {text.slice(shown)}
            </span>
          </p>
          <button
            ref={button}
            type="button"
            className="dialogue-next"
            onClick={(event) => {
              event.stopPropagation()
              advance()
            }}
          >
            {complete ? (last ? doneLabel : 'Próximo') : 'Pular'} <ChevronDown size={14} />
          </button>
        </div>
      </section>
    </div>
  )
}
