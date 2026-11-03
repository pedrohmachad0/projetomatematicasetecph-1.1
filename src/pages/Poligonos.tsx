import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Footprints, Triangle } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import Fact from '../components/ui/Fact'
import { useStepper } from '../components/ui/useStepper'
import { angleType, diagonals, exteriorAngle, interiorAngle, interiorSum, polygonName, regularVertices } from '../logic/poligonos'

type Mode = 'poligonos' | 'angulos'
const modes: Array<{ id: Mode; label: string }> = [
  { id: 'poligonos', label: 'Polígonos' },
  { id: 'angulos', label: 'Ângulos' },
]

const COLORS = ['#1d4ed8', '#047857', '#c2410c', '#7c3aed', '#be185d', '#0e7490', '#b45309', '#4f46e5', '#be123c', '#0f766e']
const br = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

function arc(cx: number, cy: number, r: number, from: number, to: number) {
  // Ângulos em radianos no sistema do SVG (y para baixo), indo de `from` a `to` no sentido horário.
  const sweep = ((to - from) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
  const x1 = cx + r * Math.cos(from)
  const y1 = cy + r * Math.sin(from)
  const x2 = cx + r * Math.cos(from + sweep)
  const y2 = cy + r * Math.sin(from + sweep)
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`
}

function PolygonMode() {
  const reduceMotion = useReducedMotion() ?? false
  const [n, setN] = useState(5)
  const [split, setSplit] = useState(false)
  const [showDiagonals, setShowDiagonals] = useState(false)
  const walk = useStepper(`walk:${n}`, n, 650)
  const pts = regularVertices(n, 200, 200, 140)
  const P = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`
  const turned = walk.shown * exteriorAngle(n)

  return (
    <>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel>
          <p className="text-center text-2xl font-black text-slate-900 sm:text-3xl" aria-live="polite">
            {polygonName(n)} <span className="text-base font-bold text-slate-500">({n} lados)</span>
          </p>
          <svg viewBox="0 0 400 400" className="mx-auto block h-auto w-full max-w-[440px]" role="img" aria-label={`${polygonName(n)} regular. Soma dos ângulos internos: ${interiorSum(n)} graus`}>
            {split &&
              Array.from({ length: n - 2 }, (_, i) => (
                <polygon key={i} points={[pts[0], pts[i + 1], pts[i + 2]].map(P).join(' ')} fill={COLORS[i % COLORS.length]} fillOpacity={0.3} stroke={COLORS[i % COLORS.length]} strokeWidth={2} />
              ))}
            <polygon points={pts.map(P).join(' ')} fill={split ? 'none' : '#047857'} fillOpacity={0.15} stroke="#047857" strokeWidth={4} strokeLinejoin="round" />
            {showDiagonals &&
              pts.flatMap((p, i) =>
                pts.slice(i + 2).map((q, j) => (i === 0 && j + i + 2 === n - 1 ? null : <line key={`${i}-${j}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#7c3aed" strokeOpacity={0.6} strokeWidth={1.5} />)),
              )}
            {!split &&
              pts.map((p, i) => {
                const prev = pts[(i - 1 + n) % n]
                const next = pts[(i + 1) % n]
                const a1 = Math.atan2(next[1] - p[1], next[0] - p[0])
                const a2 = Math.atan2(prev[1] - p[1], prev[0] - p[0])
                return <path key={i} d={arc(p[0], p[1], 22, a1, a2)} fill="#f59e0b" fillOpacity={0.55} />
              })}
            {walk.shown > 0 &&
              Array.from({ length: walk.shown }, (_, i) => {
                const a = pts[i]
                const b = pts[(i + 1) % n]
                return <line key={`w${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#dc2626" strokeWidth={6} strokeLinecap="round" />
              })}
            {walk.shown > 0 && walk.shown <= n && (() => {
              const i = walk.shown % n
              const at = pts[i]
              const from = pts[(i - 1 + n) % n]
              const dir = Math.atan2(at[1] - from[1], at[0] - from[0])
              const ext = (2 * Math.PI) / n
              return (
                <g>
                  <line x1={at[0]} y1={at[1]} x2={at[0] + 60 * Math.cos(dir)} y2={at[1] + 60 * Math.sin(dir)} stroke="#dc2626" strokeWidth={2} strokeDasharray="5 4" />
                  <path d={arc(at[0], at[1], 34, dir, dir + ext)} fill="#dc2626" fillOpacity={0.3} />
                  <circle cx={at[0]} cy={at[1]} r={9} fill="#dc2626" stroke="#ffffff" strokeWidth={3} />
                </g>
              )
            })()}
            {pts.map((p, i) => (
              <circle key={`v${i}`} cx={p[0]} cy={p[1]} r={5} fill="#047857" />
            ))}
          </svg>
          {split && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Saindo de um vértice cabem {n - 2} triângulos. Cada um soma 180°, então a soma dos ângulos internos é ({n} − 2) × 180° = {interiorSum(n)}°.</p>}
          {walk.shown > 0 && (
            <p role="status" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">
              Andando pelo contorno, em cada canto você vira {br(exteriorAngle(n))}° (o ângulo externo). Já virou {br(turned)}°{walk.done ? ': uma volta completa! A soma dos ângulos externos é sempre 360°.' : '.'}
            </p>
          )}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button type="button" aria-pressed={split} onClick={() => setSplit((v) => !v)} className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-3 text-sm font-black transition active:scale-95 ${split ? 'bg-emerald-600 text-white' : 'border border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
              <Triangle size={16} /> Dividir em triângulos
            </button>
            <button type="button" aria-pressed={showDiagonals} onClick={() => setShowDiagonals((v) => !v)} className={`min-h-[48px] rounded-xl px-3 text-sm font-black transition active:scale-95 ${showDiagonals ? 'bg-violet-600 text-white' : 'border border-violet-200 bg-violet-50 text-violet-800'}`}>
              Mostrar diagonais
            </button>
            <button type="button" onClick={() => walk.play(reduceMotion)} disabled={walk.running} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-blue-700 px-3 text-sm font-black text-white shadow transition hover:bg-blue-800 active:scale-95 disabled:opacity-60">
              <Footprints size={16} /> {walk.running ? 'Andando…' : 'Andar em volta'}
            </button>
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel title="Número de lados">
            <NumberControl label="Lados" value={n} min={3} max={12} step={1} onChange={setN} />
          </Panel>
          <Panel title="Medidas">
            <dl className="grid grid-cols-2 gap-2">
              <Fact label="Soma dos internos" value={`${interiorSum(n)}°`} detail={`(${n} − 2) × 180°`} highlight />
              <Fact label="Cada ângulo interno" value={`${br(interiorAngle(n))}°`} detail={`${interiorSum(n)}° ÷ ${n}`} />
              <Fact label="Ângulo externo" value={`${br(exteriorAngle(n))}°`} detail={`360° ÷ ${n}`} />
              <Fact label="Diagonais" value={String(diagonals(n))} detail={`${n} × (${n} − 3) ÷ 2`} />
            </dl>
          </Panel>
        </div>
      </div>
      <ChallengeCard
        simulator="poligonos"
        goals={[
          { id: 'hexagono', text: 'Descubra quanto mede cada ângulo interno do hexágono.', met: n === 6 },
          { id: 'mil', text: 'Encontre um polígono cuja soma dos ângulos internos passe de 1.000°.', met: interiorSum(n) > 1000 },
          { id: 'volta', text: 'Dê uma volta completa pelo contorno e confira os 360°.', met: walk.done },
          { id: 'diagonais', text: 'Encontre o polígono com exatamente 20 diagonais.', met: diagonals(n) === 20 },
        ]}
      />
    </>
  )
}

const typeText: Record<ReturnType<typeof angleType>, string> = {
  nulo: 'nulo (0°)',
  agudo: 'agudo (menor que 90°)',
  reto: 'reto (exatamente 90°)',
  obtuso: 'obtuso (entre 90° e 180°)',
  raso: 'raso (meia volta, 180°)',
  reflexo: 'reflexo (mais que 180°)',
  completo: 'de uma volta (360°)',
}

function AngleMode() {
  const [deg, setDeg] = useState(60)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)
  const cx = 200
  const cy = 200
  const r = 150
  const rad = (-deg * Math.PI) / 180
  const tip = { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  const type = angleType(deg)

  function move(event: ReactPointerEvent) {
    if (!dragging.current) return
    const ctm = svgRef.current?.getScreenCTM()
    if (!ctm) return
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse())
    let a = Math.round((-Math.atan2(p.y - cy, p.x - cx) * 180) / Math.PI)
    if (a < 0) a += 360
    setDeg(a)
  }

  return (
    <>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel>
          <p className="text-center font-mono text-4xl font-black text-slate-900 sm:text-5xl" aria-live="polite">
            {deg}°
          </p>
          <p className="text-center text-base font-bold text-blue-700">Ângulo {typeText[type]}</p>
          <svg ref={svgRef} viewBox="0 0 400 400" className="mx-auto block h-auto w-full max-w-[420px] select-none" role="img" aria-label={`Ângulo de ${deg} graus`} onPointerMove={move} onPointerUp={() => (dragging.current = false)} onPointerLeave={() => (dragging.current = false)}>
            <circle cx={cx} cy={cy} r={r} fill="none" strokeDasharray="4 6" strokeWidth={1.5} style={{ stroke: 'var(--svg-axis)' }} />
            {Array.from({ length: 36 }, (_, i) => {
              const a = (-i * 10 * Math.PI) / 180
              const long = i % 9 === 0
              return <line key={i} x1={cx + (r - (long ? 14 : 7)) * Math.cos(a)} y1={cy + (r - (long ? 14 : 7)) * Math.sin(a)} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} strokeWidth={long ? 3 : 1.5} style={{ stroke: 'var(--svg-axis)' }} />
            })}
            {[0, 90, 180, 270].map((v) => {
              const a = (-v * Math.PI) / 180
              return (
                <text key={v} x={cx + (r + 22) * Math.cos(a)} y={cy + (r + 22) * Math.sin(a) + 5} textAnchor="middle" fontSize={14} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
                  {v}°
                </text>
              )
            })}
            {deg > 0 && deg < 360 && <path d={arc(cx, cy, 60, rad, 0)} fill="#2563eb" fillOpacity={0.25} />}
            {deg === 360 && <circle cx={cx} cy={cy} r={60} fill="#2563eb" fillOpacity={0.25} />}
            {deg === 90 && <rect x={cx} y={cy - 24} width={24} height={24} fill="none" stroke="#2563eb" strokeWidth={3} />}
            <line x1={cx} y1={cy} x2={cx + r} y2={cy} strokeWidth={5} strokeLinecap="round" style={{ stroke: 'var(--svg-ink)' }} />
            <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#2563eb" strokeWidth={5} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={6} style={{ fill: 'var(--svg-ink)' }} />
            <circle
              cx={tip.x}
              cy={tip.y}
              r={16}
              fill="#ffffff"
              stroke="#2563eb"
              strokeWidth={4}
              style={{ cursor: 'grab', touchAction: 'none' }}
              role="presentation"
              onPointerDown={(event) => {
                ;(event.target as Element).setPointerCapture?.(event.pointerId)
                dragging.current = true
              }}
            />
          </svg>
          <p className="text-center text-xs font-semibold text-slate-500">Arraste a bolinha azul para abrir ou fechar o ângulo.</p>
        </Panel>
        <div className="space-y-4">
          <Panel title="Abertura">
            <NumberControl label="Graus" value={deg} min={0} max={360} step={1} onChange={setDeg} format={(v) => `${v}°`} />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[30, 45, 90, 120, 180, 270].map((v) => (
                <button key={v} type="button" onClick={() => setDeg(v)} className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm font-black text-slate-700 hover:bg-slate-50">
                  {v}°
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="Ângulos parceiros">
            <dl className="grid grid-cols-2 gap-2">
              <Fact label="Complemento" value={deg <= 90 ? `${90 - deg}°` : '—'} detail="quanto falta para 90°" />
              <Fact label="Suplemento" value={deg <= 180 ? `${180 - deg}°` : '—'} detail="quanto falta para 180°" />
              <Fact label="Replemento" value={`${360 - deg}°`} detail="quanto falta para 360°" />
              <Fact label="Tipo" value={type} />
            </dl>
          </Panel>
        </div>
      </div>
      <ChallengeCard
        simulator="angulos"
        goals={[
          { id: 'reto', text: 'Monte um ângulo reto.', met: deg === 90 },
          { id: 'complementares', text: 'Monte um ângulo cujo complemento seja 30°.', met: deg === 60 },
          { id: 'obtuso', text: 'Monte um ângulo obtuso com suplemento de 45°.', met: deg === 135 },
          { id: 'reflexo', text: 'Abra mais que meia volta: um ângulo reflexo.', met: type === 'reflexo' },
        ]}
      />
    </>
  )
}

export default function Poligonos() {
  const [mode, setMode] = useState<Mode>('poligonos')
  return (
    <PresentationMode title="Ângulos e Polígonos">
      <SimulatorHeader id="poligonos">
        Mude o número de lados e divida o polígono em triângulos para descobrir a soma dos ângulos internos. No modo ângulos, gire uma semirreta e classifique o ângulo.
      </SimulatorHeader>
      <div className="mb-4 sm:mb-6">
        <SegmentedControl label="Escolha o assunto" options={modes} value={mode} onChange={setMode} />
      </div>
      {mode === 'poligonos' ? <PolygonMode /> : <AngleMode />}
      <TipBox>
        <strong>Por que (n − 2) × 180°?</strong> Todo triângulo soma 180°. Ligando um vértice aos outros, um polígono de n lados fica dividido em n − 2 triângulos, e os ângulos deles formam exatamente os ângulos do polígono.
      </TipBox>
    </PresentationMode>
  )
}
