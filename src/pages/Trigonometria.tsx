import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Pause, Play } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import {
  NOTABLE_ANGLES,
  cosine,
  exactCosine,
  exactSine,
  exactTangent,
  formatTrig,
  normalizeAngle,
  quadrant,
  radiansLabel,
  sine,
  tangent,
  toRadians,
} from '../logic/trigonometria'

const SIN_COLOR = '#be123c'
const COS_COLOR = '#1d4ed8'
const TAN_COLOR = '#b45309'
const SIZE = 440
const C = SIZE / 2
const R = 150
const TAN_LIMIT = 1.4

function UnitCircle({ angle, onAngle }: { angle: number; onAngle: (angle: number) => void }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)
  const cos = cosine(angle)
  const sin = sine(angle)
  const tan = tangent(angle)
  const px = C + R * cos
  const py = C - R * sin
  const arcLarge = normalizeAngle(angle) > 180 ? 1 : 0
  const arcR = 34
  const showTan = tan !== null && Math.abs(tan) <= TAN_LIMIT

  function updateFromPointer(event: PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current
    if (!svg) return
    const box = svg.getBoundingClientRect()
    const x = ((event.clientX - box.left) / box.width) * SIZE - C
    const y = C - ((event.clientY - box.top) / box.height) * SIZE
    if (Math.hypot(x, y) < 20) return
    onAngle(normalizeAngle(Math.round((Math.atan2(y, x) * 180) / Math.PI)))
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="mx-auto block h-auto w-full max-w-[520px] touch-none select-none"
      role="img"
      aria-label={`Círculo trigonométrico com ângulo de ${angle} graus: seno ${formatTrig(sin)}, cosseno ${formatTrig(cos)}`}
      onPointerDown={(event) => {
        dragging.current = true
        event.currentTarget.setPointerCapture(event.pointerId)
        updateFromPointer(event)
      }}
      onPointerMove={(event) => dragging.current && updateFromPointer(event)}
      onPointerUp={() => (dragging.current = false)}
    >
      <line x1={20} x2={SIZE - 20} y1={C} y2={C} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
      <line y1={20} y2={SIZE - 20} x1={C} x2={C} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
      <circle cx={C} cy={C} r={R} fill="none" strokeWidth={3} style={{ stroke: 'var(--svg-text)' }} />
      {[1, -1].map((v) => (
        <g key={v} fontSize={12} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
          <text x={C + v * R + (v > 0 ? 6 : -6)} y={C + 16} textAnchor={v > 0 ? 'start' : 'end'}>{v}</text>
          <text x={C + 8} y={C - v * R + (v > 0 ? -6 : 16)}>{v}</text>
        </g>
      ))}
      <text x={C + R * 0.72} y={C - R * 0.72} fontSize={13} fontWeight={900} style={{ fill: 'var(--svg-muted)' }}>I</text>
      <text x={C - R * 0.72} y={C - R * 0.72} textAnchor="end" fontSize={13} fontWeight={900} style={{ fill: 'var(--svg-muted)' }}>II</text>
      <text x={C - R * 0.72} y={C + R * 0.78} textAnchor="end" fontSize={13} fontWeight={900} style={{ fill: 'var(--svg-muted)' }}>III</text>
      <text x={C + R * 0.72} y={C + R * 0.78} fontSize={13} fontWeight={900} style={{ fill: 'var(--svg-muted)' }}>IV</text>

      {/* reta tangente x = 1 */}
      <line x1={C + R} x2={C + R} y1={C - R * TAN_LIMIT} y2={C + R * TAN_LIMIT} strokeWidth={1.5} strokeDasharray="4 5" style={{ stroke: 'var(--svg-axis)' }} />
      {showTan && (
        <>
          <line x1={C} y1={C} x2={C + R} y2={C - R * tan} stroke={TAN_COLOR} strokeWidth={1.5} strokeDasharray="4 4" />
          <line x1={C + R} y1={C} x2={C + R} y2={C - R * tan} stroke={TAN_COLOR} strokeWidth={6} strokeLinecap="round" />
          <text x={C + R + 10} y={C - (R * tan) / 2 + 4} fontSize={13} fontWeight={900} fill={TAN_COLOR}>tg</text>
        </>
      )}

      {angle % 360 !== 0 && (
        <path d={`M ${C + arcR} ${C} A ${arcR} ${arcR} 0 ${arcLarge} 0 ${C + arcR * Math.cos(toRadians(angle))} ${C - arcR * Math.sin(toRadians(angle))}`} fill="none" stroke="#7c3aed" strokeWidth={3} />
      )}
      <line x1={C} y1={C} x2={px} y2={py} strokeWidth={3} style={{ stroke: 'var(--svg-ink)' }} />
      <line x1={C} y1={C} x2={px} y2={C} stroke={COS_COLOR} strokeWidth={6} strokeLinecap="round" />
      <line x1={px} y1={C} x2={px} y2={py} stroke={SIN_COLOR} strokeWidth={6} strokeLinecap="round" />
      <text x={(C + px) / 2} y={C + (sin >= 0 ? 20 : -10)} textAnchor="middle" fontSize={13} fontWeight={900} fill={COS_COLOR}>cos</text>
      <text x={px + (cos >= 0 ? -8 : 8)} y={(C + py) / 2 + 4} textAnchor={cos >= 0 ? 'end' : 'start'} fontSize={13} fontWeight={900} fill={SIN_COLOR}>sen</text>
      <circle cx={px} cy={py} r={11} fill="#7c3aed" stroke="#ffffff" strokeWidth={3} className="cursor-grab" />
      <text x={C + 44} y={C - 10} fontSize={13} fontWeight={900} fill="#7c3aed">{angle}°</text>
    </svg>
  )
}

/** Onda do seno e do cosseno de 0° a 360°, com o ponto do ângulo atual. */
function Wave({ angle, trail }: { angle: number; trail: number | null }) {
  const W = 640
  const H = 200
  const L = 34
  const X = (deg: number) => L + (deg / 360) * (W - L - 12)
  const Y = (v: number) => H / 2 - v * 70
  const path = (fn: (rad: number) => number, upTo = 360) =>
    Array.from({ length: Math.floor(upTo / 3) + 1 }, (_, i) => Math.min(upTo, i * 3))
      .map((deg, i) => `${i ? 'L' : 'M'} ${X(deg).toFixed(1)} ${Y(fn(toRadians(deg))).toFixed(1)}`)
      .join(' ')
  const a = normalizeAngle(angle)
  const upTo = trail ?? 360
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Gráfico do seno e do cosseno de 0 a 360 graus; ângulo atual ${a} graus`}>
      {[90, 180, 270, 360].map((deg) => (
        <g key={deg}>
          <line x1={X(deg)} x2={X(deg)} y1={20} y2={H - 20} strokeWidth={1} style={{ stroke: 'var(--svg-grid)' }} />
          <text x={X(deg)} y={H - 4} textAnchor="middle" fontSize={11} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
            {deg}°
          </text>
        </g>
      ))}
      <line x1={L} x2={W - 8} y1={Y(0)} y2={Y(0)} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
      {[1, -1].map((v) => (
        <text key={v} x={L - 8} y={Y(v) + 4} textAnchor="end" fontSize={11} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
          {v}
        </text>
      ))}
      <path d={path(Math.cos)} fill="none" stroke={COS_COLOR} strokeWidth={2} strokeOpacity={0.25} />
      <path d={path(Math.sin)} fill="none" stroke={SIN_COLOR} strokeWidth={2} strokeOpacity={0.25} />
      <path d={path(Math.cos, upTo)} fill="none" stroke={COS_COLOR} strokeWidth={3.5} />
      <path d={path(Math.sin, upTo)} fill="none" stroke={SIN_COLOR} strokeWidth={3.5} />
      <line x1={X(a)} x2={X(a)} y1={18} y2={H - 18} stroke="#7c3aed" strokeWidth={2} strokeDasharray="5 4" />
      <circle cx={X(a)} cy={Y(cosine(a))} r={7} fill={COS_COLOR} stroke="#ffffff" strokeWidth={2} />
      <circle cx={X(a)} cy={Y(sine(a))} r={7} fill={SIN_COLOR} stroke="#ffffff" strokeWidth={2} />
      <text x={W - 12} y={16} textAnchor="end" fontSize={12} fontWeight={900} fill={SIN_COLOR}>
        seno
      </text>
      <text x={W - 60} y={16} textAnchor="end" fontSize={12} fontWeight={900} fill={COS_COLOR}>
        cosseno
      </text>
    </svg>
  )
}

function Value({ label, color, value, exact, note }: { label: string; color: string; value: string; exact: string | null; note: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <dt className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-600">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} /> {label}
      </dt>
      <dd className="font-mono text-2xl font-black text-slate-900">
        {exact && exact !== value ? `${exact} ≈ ${value}` : value}
      </dd>
      <dd className="text-xs text-slate-600">{note}</dd>
    </div>
  )
}

export default function Trigonometria() {
  const [angle, setAngleRaw] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [trail, setTrail] = useState<number | null>(null)
  const frame = useRef(0)
  const setAngle = (value: number) => {
    setPlaying(false)
    setTrail(null)
    setAngleRaw(value)
  }

  // "Girar": o ponto dá uma volta inteira e a onda vai sendo desenhada junto.
  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    let deg = 0
    const tick = (now: number) => {
      deg = Math.min(360, deg + (now - last) * 0.06)
      last = now
      const shown = Math.round(deg)
      setAngleRaw(shown % 360)
      setTrail(shown)
      if (deg < 360) frame.current = requestAnimationFrame(tick)
      else setPlaying(false)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [playing])
  const sin = sine(angle)
  const cos = cosine(angle)
  const tan = tangent(angle)
  const q = quadrant(angle)
  const sign = (value: number | null) => (value === null ? '∄' : value > 0 ? '+' : value < 0 ? '−' : '0')

  return (
    <PresentationMode title="Círculo Trigonométrico">
      <SimulatorHeader id="trigonometria">
        Arraste o ponto roxo pelo círculo de raio 1. O cosseno é a sombra do ponto no eixo x, o seno é a altura no eixo y e a tangente é medida na reta x = 1.
      </SimulatorHeader>

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_380px]">
        <Panel stage>
          <UnitCircle angle={angle} onAngle={setAngle} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => (playing ? setPlaying(false) : (setTrail(0), setPlaying(true)))} className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-black text-white shadow">
              {playing ? <Pause size={16} /> : <Play size={16} />} {playing ? 'Pausar' : 'Girar e desenhar a onda'}
            </button>
            <p className="flex-1 text-xs font-semibold text-slate-600">A altura do ponto (seno) e a posição dele no eixo x (cosseno) viram as ondas abaixo.</p>
          </div>
          <Wave angle={angle} trail={trail} />
          <div className="mt-3 flex flex-wrap justify-center gap-1.5" role="group" aria-label="Ângulos notáveis">
            {NOTABLE_ANGLES.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={angle === value}
                onClick={() => setAngle(value)}
                className={`min-h-[36px] rounded-lg px-2.5 font-mono text-xs font-black transition ${angle === value ? 'bg-violet-600 text-white' : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-300'}`}
              >
                {value}°
              </button>
            ))}
          </div>
        </Panel>

        <div className="space-y-4 sm:space-y-5">
          <Panel title="Ângulo">
            <NumberControl label="ângulo θ (graus)" value={angle} min={0} max={359} step={1} onChange={setAngle} format={(value) => `${value}°`} />
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 p-2">
                <div className="text-[11px] font-black uppercase text-slate-500">Radianos</div>
                <div className="font-mono text-lg font-black text-slate-900">{radiansLabel(angle)}</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-2">
                <div className="text-[11px] font-black uppercase text-slate-500">Quadrante</div>
                <div className="text-lg font-black text-slate-900">{q === 0 ? 'sobre um eixo' : `${q}º`}</div>
              </div>
            </div>
          </Panel>

          <Panel title="Valores">
            <dl className="space-y-2">
              <Value label="Seno" color={SIN_COLOR} value={formatTrig(sin)} exact={exactSine(angle)} note={`altura do ponto · sinal ${sign(sin)}`} />
              <Value label="Cosseno" color={COS_COLOR} value={formatTrig(cos)} exact={exactCosine(angle)} note={`posição horizontal do ponto · sinal ${sign(cos)}`} />
              <Value label="Tangente" color={TAN_COLOR} value={formatTrig(tan)} exact={exactTangent(angle)} note={tan === null ? 'cos θ = 0: a divisão sen ÷ cos não existe' : `sen ÷ cos${Math.abs(tan) > TAN_LIMIT ? ' · fora da área do desenho' : ''} · sinal ${sign(tan)}`} />
            </dl>
            <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 font-mono text-sm font-bold text-blue-800">
              sen² + cos² = {formatTrig(sin * sin)} + {formatTrig(cos * cos)} = {formatTrig(Math.round((sin * sin + cos * cos) * 1e6) / 1e6)}
            </p>
          </Panel>
        </div>
      </div>

      <ChallengeCard
        simulator="trigonometria"
        goals={[
          { id: 'onda', text: 'Gire o ponto uma volta inteira e desenhe a onda do seno.', met: trail === 360 },
          { id: 'seno-meio', text: 'Ache o ângulo do 2º quadrante com seno igual a 1/2.', met: !playing && angle === 150 },
          { id: 'cos-menos-um', text: 'Ache o ângulo com cosseno igual a −1.', met: !playing && cos === -1 },
          { id: 'tg-nao-existe', text: 'Ache um ângulo em que a tangente não existe.', met: !playing && tan === null },
        ]}
      />
      <TipBox>
        <strong>Relação fundamental:</strong> como o raio vale 1, o cosseno, o seno e o raio formam um triângulo retângulo. Pelo Teorema de Pitágoras, sen²θ + cos²θ = 1 para qualquer ângulo.
      </TipBox>
    </PresentationMode>
  )
}
