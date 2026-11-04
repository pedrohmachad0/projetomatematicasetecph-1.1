import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import NumberControl from '../ui/NumberControl'
import ChallengeCard from '../ui/ChallengeCard'
import Fact from '../ui/Fact'
import { formatNumber, getArcLength, getChordLength } from '../../logic/circulo'

const CX = 200
const CY = 200
const R = 135
const ARC = '#0d9488'
const CHORD = '#ea580c'
const at = (deg: number, r = R) => ({ x: CX + r * Math.cos((deg * Math.PI) / 180), y: CY - r * Math.sin((deg * Math.PI) / 180) })

function insight(angle: number) {
  if (angle === 0) return 'Arraste a bolinha laranja para abrir o ângulo.'
  if (angle === 360) return 'Volta completa: o arco é a circunferência inteira (2πr) e a corda some, porque as duas pontas se encontram.'
  if (angle === 180) return 'Meia volta: a corda virou o diâmetro, a maior corda possível. O arco é metade da circunferência: π × r.'
  if (angle <= 30) return 'Com um ângulo pequeno, arco e corda quase empatam: um pedacinho de curva parece reto.'
  if (angle > 180) return 'Passou de meia volta: o arco continua crescendo, mas a corda volta a encurtar.'
  return 'O arco (caminho curvo) é sempre maior que a corda (caminho reto): a linha reta é o caminho mais curto entre dois pontos.'
}

export default function ArcLab() {
  const [angle, setAngle] = useState(60)
  const [radius, setRadius] = useState(4)
  const svg = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)
  const A = at(0)
  const B = at(angle)
  const arc = getArcLength(radius, angle)
  const chord = getChordLength(radius, angle)
  const large = angle > 180 ? 1 : 0
  const mid = at(angle / 2, R + 26)
  const labelAngle = at(angle / 2, 46)
  // Rótulo da corda: um pouco para o lado oposto ao arco, para não cobrir o centro.
  const away = at(angle / 2 + 180, 20)
  const chordLabel = { x: (A.x + B.x) / 2 + (away.x - CX), y: (A.y + B.y) / 2 + (away.y - CY) }

  function move(event: ReactPointerEvent) {
    if (!dragging.current) return
    const ctm = svg.current?.getScreenCTM()
    if (!ctm) return
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse())
    let deg = (Math.atan2(CY - p.y, p.x - CX) * 180) / Math.PI
    if (deg < 0) deg += 360
    // Perto do fim da volta, prende em 360°.
    const snapped = Math.round(deg / 5) * 5
    setAngle(angle > 300 && snapped < 30 ? 360 : snapped === 0 && angle > 180 ? 360 : snapped)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <svg ref={svg} viewBox="0 0 400 400" className="mx-auto block h-auto w-full max-w-[420px] select-none" role="img" aria-label={`Arco de ${angle} graus: arco ${formatNumber(arc)} e corda ${formatNumber(chord)}`} onPointerMove={move} onPointerUp={() => (dragging.current = false)} onPointerCancel={() => (dragging.current = false)}>
          <circle cx={CX} cy={CY} r={R} fill="#ffffff" fillOpacity={0.9} strokeWidth={3} style={{ stroke: '#cbd5e1' }} />
          {angle > 0 && angle < 360 && <path d={`M ${CX} ${CY} L ${A.x} ${A.y} A ${R} ${R} 0 ${large} 0 ${B.x} ${B.y} Z`} fill={ARC} fillOpacity={0.1} />}
          {angle > 0 && angle < 360 && <path d={`M ${A.x} ${A.y} A ${R} ${R} 0 ${large} 0 ${B.x} ${B.y}`} fill="none" stroke={ARC} strokeWidth={9} strokeLinecap="round" />}
          {angle === 360 && <circle cx={CX} cy={CY} r={R} fill="none" stroke={ARC} strokeWidth={9} />}
          {angle > 0 && angle < 360 && <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={CHORD} strokeWidth={5} strokeDasharray="10 7" strokeLinecap="round" />}
          <line x1={CX} y1={CY} x2={A.x} y2={A.y} stroke="#94a3b8" strokeWidth={2.5} />
          <line x1={CX} y1={CY} x2={B.x} y2={B.y} stroke="#94a3b8" strokeWidth={2.5} />
          {angle > 0 && angle < 360 && (
            <text x={labelAngle.x} y={labelAngle.y + 5} textAnchor="middle" fontSize={15} fontWeight={900} fill="#334155">
              {angle}°
            </text>
          )}
          {angle > 0 && (
            <g>
              <rect x={mid.x - 40} y={mid.y - 14} width={80} height={24} rx={12} fill={ARC} />
              <text x={mid.x} y={mid.y + 3} textAnchor="middle" fontSize={13} fontWeight={900} fill="#ffffff">
                arco {formatNumber(arc, 1)}
              </text>
            </g>
          )}
          {angle > 20 && angle < 340 && (
            <g>
              <rect x={chordLabel.x - 40} y={chordLabel.y - 12} width={80} height={24} rx={12} fill={CHORD} />
              <text x={chordLabel.x} y={chordLabel.y + 5} textAnchor="middle" fontSize={13} fontWeight={900} fill="#ffffff">
                corda {formatNumber(chord, 1)}
              </text>
            </g>
          )}
          <circle cx={CX} cy={CY} r={5} fill="#334155" />
          <circle cx={A.x} cy={A.y} r={9} fill={ARC} stroke="#ffffff" strokeWidth={3} />
          <circle
            cx={B.x}
            cy={B.y}
            r={17}
            fill="#ffffff"
            stroke={CHORD}
            strokeWidth={5}
            style={{ cursor: 'grab', touchAction: 'none' }}
            role="presentation"
            onPointerDown={(event) => {
              ;(event.target as Element).setPointerCapture?.(event.pointerId)
              dragging.current = true
            }}
          />
        </svg>
        <div className="space-y-3">
          <p role="status" className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-semibold leading-relaxed text-teal-800">
            {insight(angle)}
          </p>
          <dl className="grid grid-cols-2 gap-2">
            <Fact label="Arco (curvo)" value={`${formatNumber(arc)} cm`} detail={`${angle}/360 × 2 × π × ${formatNumber(radius, 1)}`} highlight />
            <Fact label="Corda (reta)" value={`${formatNumber(chord)} cm`} detail={angle === 180 ? 'é o diâmetro!' : 'ligando as duas pontas'} />
            <Fact label="Fração da volta" value={`${formatNumber((angle / 360) * 100, 0)}%`} detail={`${angle}° de 360°`} />
            <Fact label="Arco − corda" value={`${formatNumber(arc - chord)} cm`} detail="quanto a curva é mais longa" />
          </dl>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <NumberControl label="Ângulo" value={angle} min={0} max={360} step={5} onChange={setAngle} format={(v) => `${v}°`} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[30, 60, 90, 180, 270, 360].map((v) => (
                <button key={v} type="button" onClick={() => setAngle(v)} className="min-h-[36px] rounded-lg border border-slate-200 bg-white px-2.5 font-mono text-xs font-black text-slate-700 hover:bg-slate-50">
                  {v}°
                </button>
              ))}
            </div>
            <div className="mt-3">
              <NumberControl label="Raio" value={radius} min={1} max={10} step={0.5} onChange={setRadius} format={(v) => `${formatNumber(v, 1)} cm`} />
            </div>
          </div>
        </div>
      </div>
      <ChallengeCard
        simulator="pi-arcos"
        goals={[
          { id: 'diametro', text: 'Faça a corda virar o diâmetro.', met: angle === 180 },
          { id: 'quarto', text: 'Mostre um arco de 1/4 da volta.', met: angle === 90 },
          { id: 'volta', text: 'Arraste até a volta completa e veja a corda sumir.', met: angle === 360 },
          { id: 'pi', text: 'Com raio 1, faça o arco medir π (≈ 3,14).', met: radius === 1 && angle === 180 },
        ]}
      />
    </div>
  )
}
