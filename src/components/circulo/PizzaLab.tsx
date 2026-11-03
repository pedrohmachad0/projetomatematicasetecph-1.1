import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Pizza, RotateCcw } from 'lucide-react'
import NumberControl from '../ui/NumberControl'
import { useCompact } from '../ui/useCompact'
import ChallengeCard from '../ui/ChallengeCard'
import Fact from '../ui/Fact'
import { formatNumber } from '../../logic/circulo'

const TOP = '#2563eb'
const BOTTOM = '#f59e0b'
const SLICES = [4, 8, 12, 16, 24, 36]
const DURATION = 1400

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/** Fatia com a ponta em (0, 0), apontando para baixo. */
function slicePath(theta: number, R: number) {
  const a = Math.PI / 2 - theta / 2
  const b = Math.PI / 2 + theta / 2
  return `M 0 0 L ${R * Math.cos(a)} ${R * Math.sin(a)} A ${R} ${R} 0 0 1 ${R * Math.cos(b)} ${R * Math.sin(b)} Z`
}

export default function PizzaLab() {
  const reduceMotion = useReducedMotion()
  const compact = useCompact()
  const W = compact ? 420 : 520
  const H = compact ? 300 : 330
  const R = compact ? 100 : 110
  const CX = W / 2
  const CY = compact ? 140 : 150
  const font = compact ? 17 : 15
  const [n, setN] = useState(8)
  const [radius, setRadius] = useState(3)
  const [t, setT] = useState(0)
  const [target, setTarget] = useState(0)
  const [picked, setPicked] = useState<number[]>([])
  const frame = useRef(0)
  const theta = (2 * Math.PI) / n
  const chord = 2 * R * Math.sin(theta / 2)
  const h = R * Math.cos(theta / 2)
  const rowWidth = (n / 2) * chord + chord / 2
  const x0 = CX - rowWidth / 2 + chord / 2
  const yTop = CY - h / 2 + 10
  const arranged = t > 0.98
  const area = Math.PI * radius * radius
  const fraction = picked.length / n

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function go(to: 0 | 1) {
    cancelAnimationFrame(frame.current)
    setTarget(to)
    if (reduceMotion) {
      setT(to)
      return
    }
    const from = t
    const start = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / DURATION)
      setT(from + (to - from) * ease(k))
      if (k < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  function changeSlices(next: number) {
    cancelAnimationFrame(frame.current)
    setN(next)
    setT(0)
    setTarget(0)
    setPicked([])
  }

  const pieces = Array.from({ length: n }, (_, i) => {
    // No círculo: a fatia i aponta para o ângulo do seu meio.
    const startRot = (i * 360) / n + 180 / n - 90
    // A metade de baixo do círculo (i < n/2) vira as fatias com a ponta para cima.
    const top = i < n / 2
    const k = top ? i : i - n / 2
    const endX = top ? x0 + k * chord : x0 + k * chord + chord / 2
    const endY = top ? yTop : yTop + h
    const endRot = top ? 0 : 180
    // Gira pelo caminho mais curto.
    let delta = endRot - startRot
    while (delta > 180) delta -= 360
    while (delta < -180) delta += 360
    const x = CX + (endX - CX) * t
    const y = CY + (endY - CY) * t
    const rot = startRot + delta * t
    return { i, x, y, rot, top }
  })

  return (
    <div className="mx-auto max-w-4xl">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[620px] touch-manipulation select-none" role="img" aria-label={arranged ? `${n} fatias arrumadas em fila, formando quase um retângulo de base π r e altura r` : `Círculo cortado em ${n} fatias`}>
        {pieces.map((p) => {
          const sel = picked.includes(p.i)
          return (
            <path
              key={p.i}
              d={slicePath(theta, R)}
              transform={`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.rot.toFixed(2)})`}
              fill={p.top ? BOTTOM : TOP}
              fillOpacity={picked.length === 0 || sel ? 0.92 : 0.35}
              stroke="#ffffff"
              strokeWidth={sel ? 3 : 1.5}
              strokeLinejoin="round"
              style={{ cursor: t === 0 ? 'pointer' : 'default' }}
              onClick={() => t === 0 && setPicked((list) => (list.includes(p.i) ? list.filter((x) => x !== p.i) : [...list, p.i]))}
            />
          )
        })}
        {arranged && (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={x0 - chord / 2} x2={x0 - chord / 2 + rowWidth} y1={yTop - 16} y2={yTop - 16} stroke={TOP} strokeWidth={3} />
            <text x={CX} y={yTop - 24} textAnchor="middle" fontSize={font} fontWeight={900} fill={TOP}>
              metade da volta = π · r
            </text>
            <line x1={x0 - chord / 2 - 16} x2={x0 - chord / 2 - 16} y1={yTop} y2={yTop + h} stroke="#7c3aed" strokeWidth={3} />
            <text x={x0 - chord / 2 - 24} y={yTop + h / 2 + 5} textAnchor="end" fontSize={font + 3} fontWeight={900} fill="#7c3aed">
              r
            </text>
            <text x={CX} y={yTop + h + 30} textAnchor="middle" fontSize={font} fontWeight={900} fill={BOTTOM}>
              a outra metade da volta, embaixo
            </text>
          </g>
        )}
      </svg>

      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => go(target === 1 ? 0 : 1)} className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-base font-black text-white shadow-md">
          <Pizza size={18} /> {target === 1 ? 'Montar a pizza de novo' : 'Rearrumar as fatias'}
        </button>
        {picked.length > 0 && t === 0 && (
          <button type="button" onClick={() => setPicked([])} className="inline-flex min-h-[52px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700">
            <RotateCcw size={16} /> Limpar fatias
          </button>
        )}
      </div>

      <p role="status" className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-relaxed text-blue-800">
        {arranged
          ? `As fatias viraram quase um retângulo! A base é metade da volta (π · r) e a altura é o raio (r). Área = π · r · r = π · r². ${n < 16 ? 'Com mais fatias, as bordas ficam ainda mais retas.' : 'Com tantas fatias, já parece um retângulo de verdade.'}`
          : picked.length > 0
            ? `Você escolheu ${picked.length} de ${n} fatias: um setor de ${formatNumber((picked.length * 360) / n, 0)}°, que é ${formatNumber(fraction * 100, 0)}% da pizza. Área do setor = ${formatNumber(fraction * 100, 0)}% de ${formatNumber(area)} = ${formatNumber(fraction * area)} cm².`
            : 'Corte o círculo em fatias e rearrume tudo em fila para descobrir a fórmula da área. Ou toque nas fatias para montar um setor.'}
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-2 text-sm font-bold text-slate-700">Quantas fatias?</p>
          <div className="flex flex-wrap gap-1.5">
            {SLICES.map((s) => (
              <button key={s} type="button" aria-pressed={n === s} onClick={() => changeSlices(s)} className={`min-h-[44px] min-w-[48px] rounded-xl border-2 font-mono text-sm font-black ${n === s ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <NumberControl label="Raio" value={radius} min={1} max={10} step={0.5} onChange={setRadius} format={(v) => `${formatNumber(v, 1)} cm`} />
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-2">
          <Fact label="Área do círculo" value={`${formatNumber(area)} cm²`} detail={`π × ${formatNumber(radius, 1)}²`} highlight />
          <Fact label="Base do “retângulo”" value={`${formatNumber(Math.PI * radius)} cm`} detail="π × r (meia volta)" />
          <Fact label="Altura" value={`${formatNumber(radius, 1)} cm`} detail="o raio" />
          <Fact label="Setor escolhido" value={picked.length ? `${formatNumber(fraction * area)} cm²` : '—'} detail={picked.length ? `${picked.length}/${n} da pizza` : 'toque nas fatias'} />
        </dl>
      </div>
      <ChallengeCard
        simulator="pi-area"
        goals={[
          { id: 'rearrumar', text: 'Rearrume as fatias e descubra a fórmula πr².', met: arranged },
          { id: 'retangulo', text: 'Rearrume com 24 fatias ou mais: vira quase um retângulo.', met: arranged && n >= 24 },
          { id: 'quarto', text: 'Toque nas fatias para montar um setor de 1/4 da pizza.', met: picked.length > 0 && fraction === 0.25 },
          { id: 'metade', text: 'Monte um setor de meia pizza (180°).', met: picked.length > 0 && fraction === 0.5 },
        ]}
      />
    </div>
  )
}
