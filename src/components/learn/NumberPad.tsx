import { useEffect, useState, type Ref } from 'react'
import { Delete } from 'lucide-react'

interface Props {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  inputRef?: Ref<HTMLInputElement>
  describedBy?: string
  maxLength?: number
}

const QUERY = '(pointer: coarse)'
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'apagar', '0', 'limpar'] as const

/** Celular e tablet: o jogo usa o próprio teclado, e o teclado do sistema nunca abre. */
function useTouchScreen() {
  const [touch, setTouch] = useState(() => typeof window !== 'undefined' && Boolean(window.matchMedia?.(QUERY).matches))
  useEffect(() => {
    const query = window.matchMedia?.(QUERY)
    if (!query) return
    const update = () => setTouch(query.matches)
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])
  return touch
}

/**
 * Campo de resposta numérica. No computador aceita o teclado normalmente;
 * em telas de toque mostra um teclado numérico dentro do jogo, para o
 * teclado do celular não cobrir a pergunta nem fazer a tela pular.
 */
export default function NumberPad({ id, label = 'Sua resposta', value, onChange, disabled = false, placeholder = 'Digite aqui…', inputRef, describedBy, maxLength = 5 }: Props) {
  const touch = useTouchScreen()

  function press(key: (typeof KEYS)[number]) {
    if (disabled) return
    if (key === 'apagar') onChange(value.slice(0, -1))
    else if (key === 'limpar') onChange('')
    else if (value.length < maxLength) onChange(value === '0' ? key : value + key)
    navigator.vibrate?.(8)
  }

  return (
    <div className={`number-answer ${touch ? 'with-pad' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        // Em tela de toque o campo não recebe foco automático: nada de teclado do sistema.
        ref={touch ? undefined : inputRef}
        id={id}
        type="text"
        inputMode={touch ? 'none' : 'numeric'}
        readOnly={touch}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          if (new RegExp(`^\\d{0,${maxLength}}$`).test(event.target.value)) onChange(event.target.value)
        }}
        placeholder={touch ? 'Toque nos números' : placeholder}
        aria-describedby={describedBy}
      />
      {touch && (
        <div className="number-pad" role="group" aria-label="Teclado numérico">
          {KEYS.map((key) => (
            <button
              key={key}
              data-key={key}
              type="button"
              disabled={disabled || (key === 'apagar' || key === 'limpar' ? value === '' : false)}
              onClick={() => press(key)}
              className={`number-pad-key ${key === 'apagar' || key === 'limpar' ? 'number-pad-action' : ''}`}
              aria-label={key === 'apagar' ? 'Apagar o último número' : key === 'limpar' ? 'Limpar a resposta' : key}
            >
              {key === 'apagar' ? <Delete size={22} /> : key === 'limpar' ? 'C' : key}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
