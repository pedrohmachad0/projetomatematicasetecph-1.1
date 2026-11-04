import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { motion } from 'framer-motion'
import { Footprints, Scissors, Square } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import Fact from '../components/ui/Fact'
import { measure, vertices, type Shape, type ShapeSize } from '../logic/areas'

const shapes: Array<{ id: Shape; label: string }> = [
  { id: 'quadrado', label: 'Quadrado' },
  { id: 'retangulo', label: 'Retângulo' },
  { id: 'paralelogramo', label: 'Paralelogramo' },
  { id: 'triangulo', label: 'Triângulo' },
  { id: 'trapezio', label: 'Trapézio' },
]

const CELL = 34
const ROWS = 8
const FILL = '#047857'
const EXTRA = '#f59e0b'
const br = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

const trick: Partial<Record<Shape, { label: string; text: string }>> = {
  paralelogramo: { label: 'Recortar e mover', text: 'Recortando o triângulo da esquerda e encaixando à direita, o paralelogramo vira um retângulo com a mesma base e a mesma altura.' },
  triangulo: { label: 'Duplicar o triângulo', text: 'Dois triângulos iguais formam um paralelogramo de área base × altura. Um triângulo é a metade disso.' },
  trapezio: { label: 'Duplicar o trapézio', text: 'Dois trapézios iguais, um deles virado, formam um paralelogramo de base (B + b). O trapézio é a metade.' },
  retangulo: { label: 'Contar quadradinhos', text: 'Cada fileira tem “base” quadradinhos e existem “altura” fileiras: por isso a área é base × altura.' },
  quadrado: { label: 'Contar quadradinhos', text: 'No quadrado a base e a altura são iguais: a área é lado × lado = lado².' },
}

export default function Areas() {
  const [shape, setShape] = useState<Shape>('retangulo')
  const [size, setSize] = useState<ShapeSize>({ base: 6, height: 4, top: 3, offset: 2 })
  const [showTrick, setShowTrick] = useState(false)
  const [touched, setTouched] = useState(false)
  const [trace, setTrace] = useState(0)
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<((u: number, v: number) => void) | null>(null)
  const s = shape === 'quadrado' ? { ...size, height: size.base } : size
  const m = measure(shape, s)
  const pts = vertices(shape, s)
  const extent = Math.max(...pts.map((p) => p[0]), shape === 'triangulo' ? s.base + s.offset : 0, shape === 'trapezio' ? 2 * s.base - (s.base - s.top) / 2 : 0)
  const cols = Math.max(10, Math.ceil(extent) + 1)
  const M = 34
  const W = cols * CELL + 2 * M
  const H = ROWS * CELL + 2 * M
  const X = (u: number) => M + u * CELL
  const Y = (v: number) => M + (ROWS - v) * CELL
  const poly = (list: Array<[number, number]>) => list.map(([u, v]) => `${X(u)},${Y(v)}`).join(' ')

  function set(patch: Partial<ShapeSize>) {
    setSize((current) => {
      const next = { ...current, ...patch }
      next.base = Math.max(1, Math.min(8, Math.round(next.base)))
      next.height = Math.max(1, Math.min(ROWS - 1, Math.round(next.height)))
      next.top = Math.max(1, Math.min(next.base - 1 || 1, Math.round(next.top)))
      next.offset = Math.max(0, Math.min(shape === 'triangulo' ? next.base : 3, Math.round(next.offset)))
      return next
    })
  }

  function changeShape(next: Shape) {
    setShape(next)
    setShowTrick(false)
    setSize((current) => ({ ...current, offset: next === 'paralelogramo' ? Math.max(1, Math.min(3, current.offset)) : Math.min(current.offset, current.base), top: Math.min(current.top, current.base - 1 || 1) }))
  }

  function toUnits(event: ReactPointerEvent) {
    const svg = svgRef.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return null
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse())
    return { u: (point.x - M) / CELL, v: ROWS - (point.y - M) / CELL }
  }

  function onMove(event: ReactPointerEvent) {
    if (!drag.current) return
    const p = toUnits(event)
    if (p) drag.current(p.u, p.v)
  }

  const handles: Array<{ u: number; v: number; label: string; onDrag: (u: number, v: number) => void }> =
    shape === 'triangulo'
      ? [
          { u: s.base, v: 0, label: 'base', onDrag: (u) => set({ base: u }) },
          { u: s.offset, v: s.height, label: 'vértice de cima', onDrag: (u, v) => set({ offset: u, height: v }) },
        ]
      : shape === 'quadrado'
        ? [{ u: s.base, v: s.base, label: 'lado', onDrag: (u, v) => set({ base: Math.max(u, v) }) }]
        : shape === 'trapezio'
          ? [
              { u: s.base, v: 0, label: 'base maior', onDrag: (u) => set({ base: u }) },
              { u: s.base - (s.base - s.top) / 2, v: s.height, label: 'base menor e altura', onDrag: (u, v) => set({ top: 2 * u - s.base, height: v }) },
            ]
          : [
              { u: s.base, v: 0, label: 'base', onDrag: (u) => set({ base: u }) },
              { u: pts[2][0], v: s.height, label: 'altura', onDrag: (_u, v) => set({ height: v }) },
            ]

  // Desenho do truque de cada figura.
  let trickLayer = null
  if (showTrick) {
    if (shape === 'paralelogramo') {
      const o = s.offset
      trickLayer = (
        <g>
          <polygon points={poly([[o, 0], [s.base, 0], [s.base + o, s.height], [o, s.height]])} fill={FILL} fillOpacity={0.35} stroke={FILL} strokeWidth={3} />
          <motion.g initial={{ x: 0 }} animate={{ x: s.base * CELL }} transition={{ duration: 0.9, ease: 'easeInOut' }}>
            <polygon points={poly([[0, 0], [o, 0], [o, s.height]])} fill={EXTRA} fillOpacity={0.6} stroke={EXTRA} strokeWidth={3} />
          </motion.g>
          <polygon points={poly([[0, 0], [o, 0], [o, s.height]])} fill="none" strokeDasharray="6 5" strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
        </g>
      )
    } else if (shape === 'triangulo') {
      trickLayer = <polygon points={poly([[s.base, 0], [s.base + s.offset, s.height], [s.offset, s.height]])} fill={EXTRA} fillOpacity={0.45} stroke={EXTRA} strokeWidth={3} strokeDasharray="7 5" />
    } else if (shape === 'trapezio') {
      const l = (s.base - s.top) / 2
      trickLayer = <polygon points={poly([[s.base, 0], [s.base + s.top, 0], [2 * s.base - l, s.height], [s.base - l, s.height]])} fill={EXTRA} fillOpacity={0.45} stroke={EXTRA} strokeWidth={3} strokeDasharray="7 5" />
    } else {
      const h = s.height
      trickLayer = (
        <g>
          {Array.from({ length: s.base * h }, (_, i) => {
            const u = i % s.base
            const v = Math.floor(i / s.base)
            return (
              <g key={i}>
                <rect x={X(u) + 3} y={Y(v + 1) + 3} width={CELL - 6} height={CELL - 6} rx={5} fill={FILL} fillOpacity={0.55} />
                <text x={X(u) + CELL / 2} y={Y(v + 1) + CELL / 2 + 5} textAnchor="middle" fontSize={13} fontWeight={900} fill="#ffffff">
                  {i + 1}
                </text>
              </g>
            )
          })}
        </g>
      )
    }
  }

  // Rótulo de cada lado, empurrado um pouco para fora da figura.
  const cu = pts.reduce((sum, p) => sum + p[0], 0) / pts.length
  const cv = pts.reduce((sum, p) => sum + p[1], 0) / pts.length
  const sideLabels = pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length]
    const len = Math.hypot(q[0] - p[0], q[1] - p[1])
    const mu = (p[0] + q[0]) / 2
    const mv = (p[1] + q[1]) / 2
    const du = mu - cu
    const dv = mv - cv
    const d = Math.hypot(du, dv) || 1
    return { x: X(mu + (du / d) * 0.45), y: Y(mv + (dv / d) * 0.45) + 5, len, i }
  })

  return (
    <PresentationMode title="Perímetro e Área">
      <SimulatorHeader id="areas">
        Área é quantos quadradinhos cabem dentro da figura; perímetro é o tamanho do contorno. Arraste as bolinhas na malha ou use os controles e descubra de onde vem cada fórmula.
      </SimulatorHeader>
      <div className="mb-4 sm:mb-6">
        <SegmentedControl label="Figura" options={shapes} value={shape} onChange={changeShape} />
      </div>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel stage>
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[640px] select-none" role="img" aria-label={`${shapes.find((x) => x.id === shape)!.label} com área ${br(m.area)} e perímetro ${br(m.perimeter)}`} onPointerMove={onMove} onPointerUp={() => (drag.current = null)} onPointerLeave={() => (drag.current = null)}>
            <rect x={M} y={M} width={cols * CELL} height={ROWS * CELL} rx={6} style={{ fill: 'var(--svg-surface)' }} />
            {Array.from({ length: cols + 1 }, (_, i) => (
              <line key={`c${i}`} x1={X(i)} x2={X(i)} y1={Y(0)} y2={Y(ROWS)} strokeWidth={1} style={{ stroke: 'var(--svg-grid)' }} />
            ))}
            {Array.from({ length: ROWS + 1 }, (_, i) => (
              <line key={`r${i}`} x1={X(0)} x2={X(cols)} y1={Y(i)} y2={Y(i)} strokeWidth={1} style={{ stroke: 'var(--svg-grid)' }} />
            ))}
            {!(showTrick && shape === 'paralelogramo') && <polygon points={poly(pts)} fill={FILL} fillOpacity={showTrick && (shape === 'retangulo' || shape === 'quadrado') ? 0.08 : 0.3} stroke={FILL} strokeWidth={3.5} strokeLinejoin="round" />}
            {trickLayer}
            {(shape === 'triangulo' || shape === 'paralelogramo' || shape === 'trapezio') && (
              <g>
                <line x1={X(shape === 'triangulo' ? s.offset : pts[3][0])} x2={X(shape === 'triangulo' ? s.offset : pts[3][0])} y1={Y(0)} y2={Y(s.height)} stroke="#7c3aed" strokeWidth={2.5} strokeDasharray="6 4" />
                <text x={X(shape === 'triangulo' ? s.offset : pts[3][0]) + 6} y={Y(s.height / 2)} fontSize={14} fontWeight={900} fill="#7c3aed">
                  h = {s.height}
                </text>
              </g>
            )}
            {sideLabels.map((l) => (
              <text key={l.i} x={l.x} y={l.y} textAnchor="middle" fontSize={16} fontWeight={900} style={{ fill: 'var(--svg-ink)', paintOrder: 'stroke', stroke: 'var(--svg-surface)', strokeWidth: 4 }}>
                {br(Math.round(l.len * 100) / 100)}
              </text>
            ))}
            {trace > 0 && (
              <motion.polygon key={trace} points={poly(pts)} fill="none" stroke="#f97316" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.2, ease: 'linear' }} />
            )}
            {!touched &&
              handles.map((h) => (
                <motion.circle key={`pulse-${h.label}`} cx={X(h.u)} cy={Y(h.v)} r={13} fill="none" stroke="#1d4ed8" strokeWidth={3} initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: [1, 2], opacity: [0.6, 0] }} transition={{ duration: 1.4, repeat: Infinity }} style={{ pointerEvents: 'none', transformBox: 'fill-box', originX: '50%', originY: '50%' }} />
              ))}
            {handles.map((h) => (
              <circle
                key={h.label}
                cx={X(h.u)}
                cy={Y(h.v)}
                r={13}
                fill="#ffffff"
                stroke="#1d4ed8"
                strokeWidth={4}
                style={{ cursor: 'grab', touchAction: 'none' }}
                role="presentation"
                onPointerDown={(event) => {
                  ;(event.target as Element).setPointerCapture?.(event.pointerId)
                  drag.current = h.onDrag
                  setTouched(true)
                }}
              />
            ))}
          </svg>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" aria-pressed={showTrick} onClick={() => setShowTrick((v) => !v)} className={`inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black shadow transition active:scale-95 ${showTrick ? 'bg-amber-400 text-slate-900' : 'bg-blue-700 text-white hover:bg-blue-800'}`}>
              {shape === 'paralelogramo' ? <Scissors size={16} /> : <Square size={16} />} {showTrick ? 'Voltar à figura' : trick[shape]!.label}
            </button>
            <button type="button" onClick={() => setTrace((v) => v + 1)} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-orange-300 bg-orange-50 px-4 text-sm font-black text-orange-800 transition active:scale-95">
              <Footprints size={16} /> Andar pelo contorno
            </button>
          </div>
          {trace > 0 && <p className="mt-2 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm font-semibold text-orange-800">O caminho laranja é o perímetro: {br(m.perimeter)} u, a soma de todos os lados. A área (o que fica dentro) é outra medida: {br(m.area)} u².</p>}
          {showTrick && <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">{trick[shape]!.text}</p>}
        </Panel>
        <div className="space-y-4">
          <Panel title="Medidas">
            <dl className="grid grid-cols-2 gap-2">
              <Fact label="Área" value={`${br(m.area)} u²`} detail={m.calc} highlight />
              <Fact label="Perímetro" value={`${br(m.perimeter)} u`} detail="soma dos lados" />
            </dl>
            <p className="mt-3 font-mono text-sm font-black text-slate-700">{m.formula}</p>
          </Panel>
          <Panel title="Controles">
            <div className="space-y-4">
              <NumberControl label={shape === 'quadrado' ? 'Lado' : shape === 'trapezio' ? 'Base maior (B)' : 'Base'} value={s.base} min={shape === 'trapezio' ? 2 : 1} max={8} step={1} onChange={(v) => set({ base: v })} />
              {shape !== 'quadrado' && <NumberControl label="Altura" value={s.height} min={1} max={ROWS - 1} step={1} onChange={(v) => set({ height: v })} />}
              {shape === 'trapezio' && <NumberControl label="Base menor (b)" value={s.top} min={1} max={Math.max(1, s.base - 1)} step={1} onChange={(v) => set({ top: v })} />}
              {(shape === 'paralelogramo' || shape === 'triangulo') && <NumberControl label="Inclinação" value={s.offset} min={shape === 'paralelogramo' ? 1 : 0} max={shape === 'triangulo' ? s.base : 3} step={1} onChange={(v) => set({ offset: v })} />}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">Mude a inclinação: a área não muda, porque a base e a altura continuam iguais. O perímetro muda!</p>
          </Panel>
        </div>
      </div>
      <ChallengeCard
        simulator="areas"
        goals={[
          { id: 'doze', text: 'Faça um retângulo de área 12 que não seja 3 × 4.', met: shape === 'retangulo' && m.area === 12 && s.base !== 3 && s.base !== 4 },
          { id: 'igual', text: 'Monte um quadrado cuja área e perímetro tenham o mesmo número.', met: shape === 'quadrado' && m.area === m.perimeter },
          { id: 'recortar', text: 'Recorte o paralelogramo e transforme em retângulo.', met: shape === 'paralelogramo' && showTrick },
          { id: 'triangulo', text: 'Monte um triângulo de área 10.', met: shape === 'triangulo' && m.area === 10 },
        ]}
      />
      <TipBox>
        <strong>Área × perímetro:</strong> são medidas diferentes. Um retângulo 1 × 9 e um 3 × 3 têm área 9, mas perímetros 20 e 12. A área mede a superfície (u²); o perímetro, o contorno (u).
      </TipBox>
    </PresentationMode>
  )
}
