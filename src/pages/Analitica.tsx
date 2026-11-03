import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import Fact from '../components/ui/Fact'
import CartesianPlane from '../components/graph/CartesianPlane'
import { createScale } from '../logic/plane'
import { distance, lineEquation, midpoint, slope, type P } from '../logic/analitica'

const scale = createScale(-10, 10)
const CA = '#1d4ed8'
const CB = '#c2410c'
const CM = '#7c3aed'
const br = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }).replace('-', '−')

export default function Analitica() {
  const [A, setA] = useState<P>({ x: -4, y: -2 })
  const [B, setB] = useState<P>({ x: 4, y: 4 })
  const [showTriangle, setShowTriangle] = useState(true)
  const [showLine, setShowLine] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const dragging = useRef<'A' | 'B' | null>(null)
  const d = distance(A, B)
  const M = midpoint(A, B)
  const m = slope(A, B)
  const dx = B.x - A.x
  const dy = B.y - A.y

  function toPlane(event: ReactPointerEvent) {
    const svg = wrap.current?.querySelector('svg')
    const ctm = svg?.getScreenCTM()
    if (!ctm) return null
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse())
    const span = scale.max - scale.min
    const inner = scale.toX(scale.max) - scale.toX(scale.min)
    const x = Math.round(scale.min + ((p.x - scale.toX(scale.min)) / inner) * span)
    const y = Math.round(scale.max - ((p.y - scale.toY(scale.max)) / inner) * span)
    return { x: Math.max(-10, Math.min(10, x)), y: Math.max(-10, Math.min(10, y)) }
  }

  function down(event: ReactPointerEvent) {
    const p = toPlane(event)
    if (!p) return
    const da = Math.hypot(p.x - A.x, p.y - A.y)
    const db = Math.hypot(p.x - B.x, p.y - B.y)
    dragging.current = da <= db ? 'A' : 'B'
    ;(event.currentTarget as Element).setPointerCapture?.(event.pointerId)
    move(event)
  }

  function move(event: ReactPointerEvent) {
    if (!dragging.current) return
    const p = toPlane(event)
    if (!p) return
    if (dragging.current === 'A') setA(p)
    else setB(p)
  }

  // Reta inteira passando por A e B, prolongada até as bordas.
  const far = 30
  const lineEnds = dx === 0 && dy === 0 ? null : [{ x: A.x - dx * far, y: A.y - dy * far }, { x: A.x + dx * far, y: A.y + dy * far }]

  return (
    <PresentationMode title="Geometria Analítica">
      <SimulatorHeader id="analitica">
        Arraste os pontos A e B no plano. A distância vem do Teorema de Pitágoras, o ponto médio é a média das coordenadas e a reta que passa pelos dois tem uma equação.
      </SimulatorHeader>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_380px]">
        <Panel stage>
          <div ref={wrap} onPointerDown={down} onPointerMove={move} onPointerUp={() => (dragging.current = null)} onPointerCancel={() => (dragging.current = null)} className="cursor-pointer select-none" style={{ touchAction: 'none' }}>
            <CartesianPlane scale={scale} label={`Pontos A(${A.x}, ${A.y}) e B(${B.x}, ${B.y}), distância ${br(d)}`}>
              {showLine && lineEnds && <line x1={scale.toX(lineEnds[0].x)} y1={scale.toY(lineEnds[0].y)} x2={scale.toX(lineEnds[1].x)} y2={scale.toY(lineEnds[1].y)} stroke={CM} strokeWidth={2.5} strokeDasharray="8 6" />}
              {showTriangle && dx !== 0 && dy !== 0 && (
                <g>
                  <polygon points={`${scale.toX(A.x)},${scale.toY(A.y)} ${scale.toX(B.x)},${scale.toY(A.y)} ${scale.toX(B.x)},${scale.toY(B.y)}`} fill="#f59e0b" fillOpacity={0.15} />
                  <line x1={scale.toX(A.x)} y1={scale.toY(A.y)} x2={scale.toX(B.x)} y2={scale.toY(A.y)} stroke="#b45309" strokeWidth={3} />
                  <line x1={scale.toX(B.x)} y1={scale.toY(A.y)} x2={scale.toX(B.x)} y2={scale.toY(B.y)} stroke="#b45309" strokeWidth={3} />
                  <text x={(scale.toX(A.x) + scale.toX(B.x)) / 2} y={scale.toY(A.y) + (dy > 0 ? 18 : -8)} textAnchor="middle" fontSize={13} fontWeight={900} fill="#b45309" style={{ paintOrder: 'stroke', stroke: 'var(--svg-surface)', strokeWidth: 4 }}>
                    Δx = {br(dx)}
                  </text>
                  <text x={scale.toX(B.x) + (dx > 0 ? 8 : -8)} y={(scale.toY(A.y) + scale.toY(B.y)) / 2} textAnchor={dx > 0 ? 'start' : 'end'} fontSize={13} fontWeight={900} fill="#b45309" style={{ paintOrder: 'stroke', stroke: 'var(--svg-surface)', strokeWidth: 4 }}>
                    Δy = {br(dy)}
                  </text>
                </g>
              )}
              <line x1={scale.toX(A.x)} y1={scale.toY(A.y)} x2={scale.toX(B.x)} y2={scale.toY(B.y)} strokeWidth={4} strokeLinecap="round" style={{ stroke: 'var(--svg-ink)' }} />
              <rect x={scale.toX(M.x) - 6} y={scale.toY(M.y) - 6} width={12} height={12} fill={CM} stroke="#ffffff" strokeWidth={2} transform={`rotate(45 ${scale.toX(M.x)} ${scale.toY(M.y)})`} />
              {[
                { p: A, c: CA, n: 'A' },
                { p: B, c: CB, n: 'B' },
              ].map(({ p, c, n }) => (
                <g key={n}>
                  <circle cx={scale.toX(p.x)} cy={scale.toY(p.y)} r={11} fill={c} stroke="#ffffff" strokeWidth={3} />
                  <text x={scale.toX(p.x)} y={scale.toY(p.y) - 16} textAnchor="middle" fontSize={14} fontWeight={900} fill={c} style={{ paintOrder: 'stroke', stroke: 'var(--svg-surface)', strokeWidth: 4 }}>
                    {n}({br(p.x)}, {br(p.y)})
                  </text>
                </g>
              ))}
            </CartesianPlane>
          </div>
          <p className="text-center text-xs font-semibold text-slate-500">Toque perto de um ponto e arraste. Os pontos ficam sempre em coordenadas inteiras.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <label className="flex min-h-[44px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={showTriangle} onChange={(event) => setShowTriangle(event.target.checked)} /> Triângulo de Pitágoras
            </label>
            <label className="flex min-h-[44px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={showLine} onChange={(event) => setShowLine(event.target.checked)} /> Reta que passa por A e B
            </label>
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel title="Resultados">
            <dl className="grid gap-2">
              <Fact label="Distância AB" value={`d = ${br(d)}`} detail={`√(Δx² + Δy²) = √(${br(dx)}² + ${br(dy)}²) = √${dx * dx + dy * dy}`} highlight />
              <Fact label="Ponto médio M" value={`(${br(M.x)}, ${br(M.y)})`} detail={`((${br(A.x)} + ${br(B.x)}) ÷ 2, (${br(A.y)} + ${br(B.y)}) ÷ 2)`} />
              <Fact label="Coeficiente angular" value={m === null ? 'não existe' : `m = ${br(m)}`} detail={m === null ? 'reta vertical: Δx = 0' : `Δy ÷ Δx = ${br(dy)} ÷ ${br(dx)}`} />
              <Fact label="Equação da reta" value={dx === 0 && dy === 0 ? '—' : lineEquation(A, B)} />
            </dl>
          </Panel>
          <Panel title="Coordenadas exatas">
            <div className="space-y-3">
              <NumberControl label="A: x" value={A.x} min={-10} max={10} step={1} onChange={(x) => setA({ ...A, x })} />
              <NumberControl label="A: y" value={A.y} min={-10} max={10} step={1} onChange={(y) => setA({ ...A, y })} />
              <NumberControl label="B: x" value={B.x} min={-10} max={10} step={1} onChange={(x) => setB({ ...B, x })} />
              <NumberControl label="B: y" value={B.y} min={-10} max={10} step={1} onChange={(y) => setB({ ...B, y })} />
            </div>
          </Panel>
        </div>
      </div>
      <ChallengeCard
        simulator="analitica"
        goals={[
          { id: 'cinco', text: 'Coloque os pontos a distância 5 sem estarem na mesma linha ou coluna.', met: d === 5 && dx !== 0 && dy !== 0 },
          { id: 'origem', text: 'Faça o ponto médio cair na origem (0, 0).', met: M.x === 0 && M.y === 0 && d > 0 },
          { id: 'vertical', text: 'Monte uma reta vertical (sem coeficiente angular).', met: m === null && d > 0 },
          { id: 'descendo', text: 'Monte uma reta que desce, com m = −1.', met: m === -1 },
        ]}
      />
      <TipBox>
        <strong>A distância é Pitágoras disfarçado:</strong> Δx e Δy são os catetos do triângulo laranja e a distância AB é a hipotenusa. Por isso d² = Δx² + Δy².
      </TipBox>
    </PresentationMode>
  )
}
