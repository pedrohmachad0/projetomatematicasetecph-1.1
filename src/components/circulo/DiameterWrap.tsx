import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, RotateCcw, Ruler } from 'lucide-react'
import { DIAMETER_ARC_RADIANS, LEFTOVER_DIAMETERS, WHOLE_DIAMETERS, arcPathCCW, circlePoint, formatNumber, rulerGeometry } from '../../logic/circulo'

const CX = 200
const CY = 190
const R = 115
const TURN_MS = 650
const WRAP_MS = 1300
const RULER = '#7c3aed'
const ARC = '#1f2937'
const DOT = '#ec4899'
const LEFT = '#dc2626'

const guesses = [
  { id: '2', label: '2 diâmetros' },
  { id: '3', label: '3 diâmetros' },
  { id: '3+', label: 'Um pouco mais de 3' },
  { id: '4', label: '4 diâmetros' },
] as const

const stepText = [
  'Este é o diâmetro. Vamos usar o comprimento dele como uma régua para medir a volta do círculo.',
  'A régua girou até a borda e se dobrou sobre ela: um diâmetro inteiro cobre o arco 1.',
  'Mais uma régua do mesmo tamanho: arco 2. Já são 2 diâmetros na volta.',
  'Terceira régua: arco 3. A volta ainda não fechou: sobrou um pedacinho.',
  `O pedacinho que sobrou mede só ${formatNumber(LEFTOVER_DIAMETERS, 2)} de um diâmetro.`,
  `Juntando tudo: 3 + ${formatNumber(LEFTOVER_DIAMETERS, 2)} = 3,14… A volta de qualquer círculo mede cerca de 3,14 diâmetros. Esse número é o π.`,
]

/**
 * Experimento "Dobrar o diâmetro": a régua do tamanho do diâmetro gira até
 * ficar tangente e se dobra sobre a circunferência, arco por arco.
 */
export default function DiameterWrap() {
  const reduceMotion = useReducedMotion()
  const [stage, setStage] = useState(0)
  const [guess, setGuess] = useState<(typeof guesses)[number]['id'] | null>(null)
  const [anim, setAnim] = useState<{ arc: number; turn: number; wrap: number } | null>(null)
  const frame = useRef<number | undefined>(undefined)
  const arcsDone = Math.min(stage, WHOLE_DIAMETERS)
  const busy = anim !== null

  useEffect(() => () => cancelAnimationFrame(frame.current ?? 0), [])

  function foldNext() {
    if (busy || stage >= WHOLE_DIAMETERS) return
    const arc = stage
    if (reduceMotion) {
      setStage(stage + 1)
      return
    }
    const started = performance.now()
    const tick = (now: number) => {
      const elapsed = now - started
      const turn = Math.min(1, elapsed / TURN_MS)
      const wrap = Math.max(0, Math.min(1, (elapsed - TURN_MS) / WRAP_MS))
      // Suaviza o dobrar (começa e termina devagar).
      const eased = wrap < 0.5 ? 2 * wrap * wrap : 1 - (-2 * wrap + 2) ** 2 / 2
      setAnim({ arc, turn, wrap: eased })
      if (wrap < 1) frame.current = requestAnimationFrame(tick)
      else {
        setAnim(null)
        setStage(arc + 1)
      }
    }
    frame.current = requestAnimationFrame(tick)
  }

  function next() {
    if (stage < WHOLE_DIAMETERS) foldNext()
    else if (stage < 5) setStage(stage + 1)
  }

  function reset() {
    cancelAnimationFrame(frame.current ?? 0)
    setAnim(null)
    setStage(0)
    setGuess(null)
  }

  const ruler = anim ? rulerGeometry(CX, CY, R, anim.arc * DIAMETER_ARC_RADIANS, anim.turn, anim.wrap) : stage === 0 ? rulerGeometry(CX, CY, R, 0, 0, 0) : null
  const boundaries = Array.from({ length: arcsDone + 1 }, (_, i) => i * DIAMETER_ARC_RADIANS)
  const leftoverStart = WHOLE_DIAMETERS * DIAMETER_ARC_RADIANS
  const buttonLabel = busy ? 'Dobrando…' : stage < WHOLE_DIAMETERS ? `Dobrar o diâmetro (${stage + 1}/3)` : stage === 3 ? 'Medir o que sobrou' : stage === 4 ? 'Juntar tudo' : null
  const guessFeedback =
    guess === null ? null : guess === '3+' ? 'Seu palpite estava certo: um pouco mais de 3!' : guess === '3' ? 'Quase! Cabem 3 inteiros e ainda sobra um pedacinho.' : `Seu palpite foi ${guesses.find((g) => g.id === guess)!.label.toLowerCase()}: veja que cabem 3 inteiros e um pedacinho.`

  return (
    <div className="diameter-wrap">
      <div className="mx-auto grid max-w-4xl items-center gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <svg viewBox="-80 -60 560 500" className="mx-auto block h-auto w-full max-w-[520px] touch-manipulation" role="img" aria-label={`Diâmetro dobrado ${arcsDone} vezes sobre a circunferência. ${stepText[stage]}`}>
          <circle cx={CX} cy={CY} r={R} fill="#ffffff" stroke="#cbd5e1" strokeWidth={3} />
          <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke={ARC} strokeWidth={5} strokeLinecap="round" />
          <text x={CX} y={CY - 14} textAnchor="middle" fontSize={22} fontWeight={900} fill={ARC} letterSpacing={1}>
            DIÂMETRO
          </text>
          {Array.from({ length: arcsDone }, (_, i) => {
            const mid = circlePoint(CX, CY, R + 28, i * DIAMETER_ARC_RADIANS + DIAMETER_ARC_RADIANS / 2)
            return (
              <g key={i}>
                <path d={arcPathCCW(CX, CY, R, i * DIAMETER_ARC_RADIANS, (i + 1) * DIAMETER_ARC_RADIANS)} fill="none" stroke={ARC} strokeWidth={7} strokeLinecap="round" />
                <text x={mid.x} y={mid.y + 9} textAnchor="middle" fontSize={28} fontWeight={900} fill={ARC} fontFamily="Georgia, serif">
                  {i + 1}
                </text>
              </g>
            )
          })}
          {stage >= 4 && (
            <g>
              <path d={arcPathCCW(CX, CY, R, leftoverStart, 2 * Math.PI)} fill="none" stroke={LEFT} strokeWidth={9} strokeLinecap="round" className="leftover-arc" />
              {(() => {
                const at = circlePoint(CX, CY, R + 44, leftoverStart + (2 * Math.PI - leftoverStart) / 2)
                return (
                  <text x={at.x + 18} y={at.y + 8} textAnchor="middle" fontSize={30} fontWeight={900} fill={LEFT} fontFamily="Georgia, serif">
                    {formatNumber(LEFTOVER_DIAMETERS, 2)}
                  </text>
                )
              })()}
            </g>
          )}
          {ruler && (
            <g>
              {ruler.arcEnd > ruler.arcStart && <path d={arcPathCCW(CX, CY, R, ruler.arcStart, ruler.arcEnd)} fill="none" stroke={RULER} strokeWidth={8} strokeLinecap="round" />}
              <line x1={ruler.touch.x} y1={ruler.touch.y} x2={ruler.tip.x} y2={ruler.tip.y} stroke={RULER} strokeWidth={8} strokeLinecap="round" opacity={stage === 0 && !anim ? 0.85 : 1} />
            </g>
          )}
          {boundaries.map((a, i) => {
            const p = circlePoint(CX, CY, R, a)
            return <circle key={i} cx={p.x} cy={p.y} r={8} fill={DOT} stroke="#ffffff" strokeWidth={3} />
          })}
          {stage >= 4 && (() => {
            const p = circlePoint(CX, CY, R, 2 * Math.PI - 0.0001)
            return <circle cx={p.x} cy={p.y} r={8} fill={DOT} stroke="#ffffff" strokeWidth={3} />
          })()}
        </svg>

        <div className="space-y-3">
          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-widest text-blue-700">
              Etapa {stage + 1} de 6
            </p>
            <p className="mt-1 text-base font-semibold leading-relaxed text-slate-800" aria-live="polite">
              {stepText[stage]}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-lg font-black" aria-label="Soma das partes">
              {Array.from({ length: arcsDone }, (_, i) => (
                <span key={i} className="rounded-lg bg-slate-900 px-2.5 py-0.5 text-white">
                  1
                </span>
              ))}
              {stage >= 4 && <span className="rounded-lg bg-red-600 px-2.5 py-0.5 text-white">{formatNumber(LEFTOVER_DIAMETERS, 2)}</span>}
              {stage >= 5 && <span className="rounded-lg bg-amber-400 px-2.5 py-0.5 text-slate-900">= 3,14… = π</span>}
              {stage === 0 && <span className="text-sm font-semibold text-slate-500">quantos diâmetros cabem na volta?</span>}
            </div>
          </div>

          {stage === 0 && (
            <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
              <p className="text-sm font-bold text-slate-700">Antes de começar, dê seu palpite:</p>
              <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Palpite">
                {guesses.map((item) => (
                  <button key={item.id} type="button" aria-pressed={guess === item.id} onClick={() => setGuess(item.id)} className={`min-h-[44px] rounded-xl border-2 px-2 text-sm font-bold transition ${guess === item.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {stage === 5 && guessFeedback && (
            <p className="flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              <Check size={18} className="mt-0.5 shrink-0" /> {guessFeedback}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {buttonLabel && (
              <button type="button" onClick={next} disabled={busy} className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-base font-black text-white shadow-md transition hover:bg-blue-800 active:scale-95 disabled:opacity-60">
                <Ruler size={18} /> {buttonLabel} <ArrowRight size={18} />
              </button>
            )}
            <button type="button" onClick={reset} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <RotateCcw size={16} /> Recomeçar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
