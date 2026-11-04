import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Play } from 'lucide-react'
import type { Matrix } from '../../logic/matrizes'

const S = 300
const fmt = (v: number) => String(Math.round(v * 100) / 100).replace('-', '−').replace('.', ',')

/**
 * Significado geométrico do determinante 2×2: a matriz leva o quadrado
 * de lado 1 num paralelogramo de área |det|.
 */
export default function DetArea({ m }: { m: Matrix }) {
  const reduceMotion = useReducedMotion()
  const [t, setT] = useState(1)
  const frame = useRef(0)
  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // A grade se ajusta para o paralelogramo inteiro caber.
  const reach = Math.max(1, ...[m[0][0], m[1][0], m[0][1], m[1][1], m[0][0] + m[0][1], m[1][0] + m[1][1]].map(Math.abs))
  const RANGE = Math.min(20, Math.max(4, Math.ceil(reach) + 1))
  const u = S / (2 * RANGE)
  const X = (x: number) => S / 2 + x * u
  const Y = (y: number) => S / 2 - y * u
  const v1 = { x: 1 + (m[0][0] - 1) * t, y: m[1][0] * t }
  const v2 = { x: m[0][1] * t, y: 1 + (m[1][1] - 1) * t }
  const det = m[0][0] * m[1][1] - m[0][1] * m[1][0]
  const current = v1.x * v2.y - v2.x * v1.y
  const color = det < 0 ? '#dc2626' : det === 0 ? '#64748b' : '#a21caf'
  const pts = [
    [0, 0],
    [v1.x, v1.y],
    [v1.x + v2.x, v1.y + v2.y],
    [v2.x, v2.y],
  ]

  function play() {
    cancelAnimationFrame(frame.current)
    if (reduceMotion) {
      setT(1)
      return
    }
    const start = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 1400)
      setT(k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2)
      if (k < 1) frame.current = requestAnimationFrame(tick)
    }
    setT(0)
    frame.current = requestAnimationFrame(tick)
  }

  return (
    <div className="grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto block h-auto w-full max-w-[320px]" role="img" aria-label={`O quadrado de área 1 vira um paralelogramo de área ${fmt(Math.abs(det))}`}>
        <defs>
          <clipPath id="det-clip">
            <rect width={S} height={S} rx={10} />
          </clipPath>
        </defs>
        <rect width={S} height={S} rx={10} style={{ fill: 'var(--svg-surface)' }} />
        <g clipPath="url(#det-clip)">
          {Array.from({ length: 2 * RANGE + 1 }, (_, i) => i - RANGE).map((v) => (
            <g key={v}>
              <line x1={X(v)} x2={X(v)} y1={0} y2={S} strokeWidth={1} style={{ stroke: 'var(--svg-grid)' }} />
              <line y1={Y(v)} y2={Y(v)} x1={0} x2={S} strokeWidth={1} style={{ stroke: 'var(--svg-grid)' }} />
            </g>
          ))}
          <line x1={X(0)} x2={X(0)} y1={0} y2={S} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
          <line y1={Y(0)} y2={Y(0)} x1={0} x2={S} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
          <rect x={X(0)} y={Y(1)} width={u} height={u} fill="#f59e0b" fillOpacity={0.35} stroke="#d97706" strokeDasharray="4 3" strokeWidth={2} />
          <polygon points={pts.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={3} strokeLinejoin="round" />
          <line x1={X(0)} y1={Y(0)} x2={X(v1.x)} y2={Y(v1.y)} stroke="#1d4ed8" strokeWidth={4} strokeLinecap="round" />
          <line x1={X(0)} y1={Y(0)} x2={X(v2.x)} y2={Y(v2.y)} stroke="#ea580c" strokeWidth={4} strokeLinecap="round" />
          <circle cx={X(v1.x)} cy={Y(v1.y)} r={5} fill="#1d4ed8" />
          <circle cx={X(v2.x)} cy={Y(v2.y)} r={5} fill="#ea580c" />
        </g>
      </svg>
      <div className="space-y-2">
        <p className="text-sm font-semibold leading-relaxed text-slate-700">
          A 1ª coluna <span className="font-black text-blue-700">({fmt(m[0][0])}, {fmt(m[1][0])})</span> e a 2ª coluna <span className="font-black text-orange-700">({fmt(m[0][1])}, {fmt(m[1][1])})</span> são os lados de um paralelogramo. O quadradinho amarelo (área 1) vira esse paralelogramo.
        </p>
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-lg font-black" style={{ color }}>
          área = |det| = {fmt(Math.abs(t === 1 ? det : current))}
        </p>
        <p className="text-xs font-semibold text-slate-600">
          {det === 0 ? 'Determinante zero: o paralelogramo achata e vira uma linha (área 0). Por isso essa matriz não tem inversa.' : det < 0 ? 'Determinante negativo: a figura “vira do avesso” (as colunas trocam de lado), mas a área é o valor sem o sinal.' : 'O determinante diz quantas vezes a área foi multiplicada.'}
        </p>
        <button type="button" onClick={play} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-black text-white shadow">
          <Play size={16} /> Transformar o quadradinho
        </button>
      </div>
    </div>
  )
}
