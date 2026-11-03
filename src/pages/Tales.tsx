import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import Fact from '../components/ui/Fact'
import { talesMissing, talesSegments } from '../logic/tales'

const W = 440
const H = 380
const UNIT = 20
const A = '#1d4ed8'
const B = '#c2410c'
const br = (v: number, d = 1) => v.toLocaleString('pt-BR', { maximumFractionDigits: d, minimumFractionDigits: d })

export default function Tales() {
  const [ys, setYs] = useState<[number, number, number]>([70, 170, 320])
  const [s1, setS1] = useState(-0.1)
  const [s2, setS2] = useState(0.4)
  const [pa, setPa] = useState(3)
  const [pb, setPb] = useState(6)
  const [pc, setPc] = useState(4)
  const [revealed, setRevealed] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef<number | null>(null)
  const seg = talesSegments(ys, s1, s2)
  const [a, b, c, d] = [seg.a / UNIT, seg.b / UNIT, seg.c / UNIT, seg.d / UNIT]
  const x1 = (y: number) => 110 + s1 * y
  const x2 = (y: number) => 240 + s2 * y
  const answer = talesMissing(pa, pb, pc)

  function move(event: ReactPointerEvent) {
    const i = dragging.current
    if (i === null) return
    const ctm = svgRef.current?.getScreenCTM()
    if (!ctm) return
    const y = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse()).y
    setYs((current) => {
      const next = [...current] as [number, number, number]
      const lo = i === 0 ? 30 : current[i - 1] + 40
      const hi = i === 2 ? H - 30 : current[i + 1] - 40
      next[i] = Math.round(Math.max(lo, Math.min(hi, y)))
      return next
    })
  }

  const segments = [
    { p: [x1(ys[0]), ys[0], x1(ys[1]), ys[1]], color: A, label: 'a', value: a, side: -1 },
    { p: [x1(ys[1]), ys[1], x1(ys[2]), ys[2]], color: B, label: 'b', value: b, side: -1 },
    { p: [x2(ys[0]), ys[0], x2(ys[1]), ys[1]], color: A, label: 'c', value: c, side: 1 },
    { p: [x2(ys[1]), ys[1], x2(ys[2]), ys[2]], color: B, label: 'd', value: d, side: 1 },
  ]

  return (
    <PresentationMode title="Teorema de Tales">
      <SimulatorHeader id="tales">
        Retas paralelas cortadas por duas transversais formam segmentos proporcionais. Arraste as paralelas (as bolinhas) e incline as transversais: a razão a/b continua igual a c/d.
      </SimulatorHeader>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel stage>
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[520px] select-none" role="img" aria-label={`Três paralelas cortadas por duas transversais. a = ${br(a)}, b = ${br(b)}, c = ${br(c)}, d = ${br(d)}`} onPointerMove={move} onPointerUp={() => (dragging.current = null)} onPointerLeave={() => (dragging.current = null)}>
            <rect width={W} height={H} rx={12} style={{ fill: 'var(--svg-surface)' }} />
            {ys.map((y, i) => (
              <g key={i}>
                <line x1={14} x2={W - 14} y1={y} y2={y} strokeWidth={2.5} style={{ stroke: 'var(--svg-axis)' }} />
                <text x={W - 18} y={y - 6} textAnchor="end" fontSize={13} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
                  r{i + 1}
                </text>
              </g>
            ))}
            <line x1={x1(0)} y1={0} x2={x1(H)} y2={H} strokeWidth={2} style={{ stroke: 'var(--svg-ink)' }} />
            <line x1={x2(0)} y1={0} x2={x2(H)} y2={H} strokeWidth={2} style={{ stroke: 'var(--svg-ink)' }} />
            {segments.map((s) => {
              const [ax, ay, bx, by] = s.p
              return (
                <g key={s.label}>
                  <line x1={ax} y1={ay} x2={bx} y2={by} stroke={s.color} strokeWidth={7} strokeLinecap="round" />
                  <text x={(ax + bx) / 2 + s.side * 22} y={(ay + by) / 2 + 6} textAnchor="middle" fontSize={18} fontWeight={900} fill={s.color} style={{ paintOrder: 'stroke', stroke: 'var(--svg-surface)', strokeWidth: 4 }}>
                    {s.label}
                  </text>
                </g>
              )
            })}
            {ys.map((y, i) => (
              <circle
                key={`h${i}`}
                cx={24}
                cy={y}
                r={14}
                fill="#ffffff"
                stroke="#047857"
                strokeWidth={4}
                style={{ cursor: 'ns-resize', touchAction: 'none' }}
                role="presentation"
                onPointerDown={(event) => {
                  ;(event.target as Element).setPointerCapture?.(event.pointerId)
                  dragging.current = i
                }}
              />
            ))}
          </svg>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center font-mono sm:grid-cols-4" aria-live="polite">
            <p className="rounded-xl bg-slate-50 p-2 text-sm font-black text-slate-800 sm:col-span-2">
              a ÷ b = {br(a)} ÷ {br(b)} = <span className="text-blue-700">{br(a / b, 2)}</span>
            </p>
            <p className="rounded-xl bg-slate-50 p-2 text-sm font-black text-slate-800 sm:col-span-2">
              c ÷ d = {br(c)} ÷ {br(d)} = <span className="text-blue-700">{br(c / d, 2)}</span>
            </p>
          </div>
          <p className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">As duas razões são iguais em qualquer posição. Os segmentos mudam de tamanho, mas a proporção entre eles é a mesma nas duas transversais.</p>
        </Panel>
        <div className="space-y-4">
          <Panel title="Incline as transversais">
            <div className="space-y-4">
              <NumberControl label="Transversal da esquerda" value={s1} min={-0.2} max={0.3} step={0.1} onChange={setS1} format={(v) => br(v)} />
              <NumberControl label="Transversal da direita" value={s2} min={-0.1} max={0.5} step={0.1} onChange={setS2} format={(v) => br(v)} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2">
              <Fact label="a" value={`${br(a)} cm`} />
              <Fact label="b" value={`${br(b)} cm`} />
              <Fact label="c" value={`${br(c)} cm`} />
              <Fact label="d" value={`${br(d)} cm`} />
            </dl>
          </Panel>
        </div>
      </div>

      <Panel className="mt-4 sm:mt-6" title="Calcule o segmento que falta">
        <div className="grid items-start gap-4 md:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <NumberControl label="a" value={pa} min={1} max={10} step={1} onChange={(v) => { setPa(v); setRevealed(false) }} />
            <NumberControl label="b" value={pb} min={1} max={12} step={1} onChange={(v) => { setPb(v); setRevealed(false) }} />
            <NumberControl label="c" value={pc} min={1} max={10} step={1} onChange={(v) => { setPc(v); setRevealed(false) }} />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-lg font-black text-slate-800">
            <p>
              {pa}/{pb} = {pc}/x
            </p>
            <p className="mt-1 text-base">{pa} · x = {pb} · {pc}</p>
            <p className="mt-1 text-base">x = {pb * pc} ÷ {pa}</p>
            <button type="button" onClick={() => setRevealed(true)} className={`mt-3 min-h-[48px] w-full rounded-xl text-base font-black ${revealed ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'bg-blue-700 text-white shadow hover:bg-blue-800'}`}>
              {revealed ? `x = ${br(answer, Number.isInteger(answer) ? 0 : 2)}` : 'Mostrar x'}
            </button>
          </div>
        </div>
      </Panel>

      <ChallengeCard
        simulator="tales"
        goals={[
          { id: 'iguais', text: 'Deixe as paralelas igualmente espaçadas e veja a = b e c = d.', met: Math.abs(a - b) < 0.15 },
          { id: 'dobro', text: 'Faça b ficar o dobro de a.', met: Math.abs(b / a - 2) < 0.05 },
          { id: 'paralelas', text: 'Deixe as duas transversais paralelas entre si.', met: Math.abs(s1 - s2) < 0.01 },
          { id: 'calcular', text: 'Resolva um problema em que x não é um número inteiro.', met: revealed && !Number.isInteger(answer) },
        ]}
      />
      <TipBox>
        <strong>Onde aparece Tales?</strong> Na sombra de prédios, em rampas e nas escadas: sempre que linhas paralelas (como os degraus) cortam duas retas, os pedaços ficam proporcionais. Dá para medir a altura de uma árvore só com a sombra!
      </TipBox>
    </PresentationMode>
  )
}
