import { useEffect, useState } from 'react'
import { motion, animate, useMotionValue, useTransform } from 'framer-motion'
import { CircleDot, RotateCcw } from 'lucide-react'
import { formatNumber, getArcLength, getChordLength, getSectorArea, type CircleMode, type CircleState } from '../../logic/circulo'

interface Props {
  state: CircleState
  mode: CircleMode
  angle: number
  onModeChange: (mode: CircleMode) => void
}

const cx = 330
const cy = 215
const r = 155

const point = (deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

const sectorPath = (deg: number) => {
  const s = point(0)
  const e = point(deg)
  return 'M ' + cx + ' ' + cy + ' L ' + s.x + ' ' + s.y + ' A ' + r + ' ' + r + ' 0 ' + (deg > 180 ? 1 : 0) + ' 1 ' + e.x + ' ' + e.y + ' Z'
}

const arcPath = (startDeg: number, endDeg: number) => {
  const s = point(startDeg)
  const e = point(endDeg)
  return 'M ' + s.x + ' ' + s.y + ' A ' + r + ' ' + r + ' 0 ' + (endDeg - startDeg > 180 ? 1 : 0) + ' 1 ' + e.x + ' ' + e.y
}

const piCircleCx = 450
const piCircleCy = 270
const piCircleR = 150
const piDiameter = piCircleR * 2
const piSegmentDegrees = 360 / Math.PI
const piArcEnds = [0, piSegmentDegrees, piSegmentDegrees * 2, piSegmentDegrees * 3]

const circlePoint = (degrees: number, radius = piCircleR) => {
  const radians = (degrees * Math.PI) / 180
  return { x: piCircleCx + radius * Math.cos(radians), y: piCircleCy - radius * Math.sin(radians) }
}

const piFullCirclePath = 'M ' + (piCircleCx + piCircleR) + ' ' + piCircleCy +
  ' A ' + piCircleR + ' ' + piCircleR + ' 0 1 0 ' + (piCircleCx - piCircleR) + ' ' + piCircleCy +
  ' A ' + piCircleR + ' ' + piCircleR + ' 0 1 0 ' + (piCircleCx + piCircleR) + ' ' + piCircleCy

const piArcPath = (startDegrees: number, endDegrees: number) => {
  const startPoint = circlePoint(startDegrees)
  const endPoint = circlePoint(endDegrees)
  const largeArc = endDegrees - startDegrees > 180 ? 1 : 0
  return 'M ' + startPoint.x + ' ' + startPoint.y + ' A ' + piCircleR + ' ' + piCircleR + ' 0 ' + largeArc + ' 0 ' + endPoint.x + ' ' + endPoint.y
}

const getRulerGeometry = (degrees: number) => {
  const clamped = Math.min(359.8, Math.max(0, degrees))
  const current = circlePoint(clamped)
  const radians = (clamped * Math.PI) / 180
  const tangentX = -Math.sin(radians)
  const tangentY = -Math.cos(radians)

  // A régua "encosta" primeiro na borda e cresce até atingir exatamente
  // o comprimento do diâmetro. Depois disso, ela apenas desliza pela tangente.
  const rulerProgress = Math.max(0, Math.min(1, (clamped - 4) / 14))
  const rulerLength = piDiameter * rulerProgress

  return {
    x1: current.x,
    y1: current.y,
    x2: current.x + tangentX * rulerLength,
    y2: current.y + tangentY * rulerLength,
  }
}

const getRulerDetailPath = (degrees: number) => {
  const clamped = Math.min(359.8, Math.max(0, degrees))
  if (clamped < 4) return ''

  const current = circlePoint(clamped)
  const radians = (clamped * Math.PI) / 180
  const tangentX = -Math.sin(radians)
  const tangentY = -Math.cos(radians)
  const normalX = Math.cos(radians)
  const normalY = -Math.sin(radians)
  const rulerProgress = Math.max(0, Math.min(1, (clamped - 4) / 14))
  const rulerLength = piDiameter * rulerProgress
  const parts: string[] = []

  const addTick = (distance: number, size: number) => {
    const centerX = current.x + tangentX * distance
    const centerY = current.y + tangentY * distance
    parts.push(
      'M ' + (centerX - normalX * size) + ' ' + (centerY - normalY * size) +
      ' L ' + (centerX + normalX * size) + ' ' + (centerY + normalY * size)
    )
  }

  addTick(0, 8)
  addTick(rulerLength, 8)

  if (rulerLength > 20) {
    addTick(rulerLength * 0.25, 5)
    addTick(rulerLength * 0.5, 6)
    addTick(rulerLength * 0.75, 5)
  }

  return parts.join(' ')
}

export default function CircleVisualization({ state, mode, angle, onModeChange }: Props) {
  const [animationKey, setAnimationKey] = useState(0)
  const end = point(angle)
  const start = point(0)
  const chord = getChordLength(state.radius, angle)
  const arc = getArcLength(state.radius, angle)
  const sector = getSectorArea(state.radius, angle)

  const sweep = useMotionValue(0)
  const rulerX1 = useTransform(sweep, (value) => getRulerGeometry(value).x1)
  const rulerY1 = useTransform(sweep, (value) => getRulerGeometry(value).y1)
  const rulerX2 = useTransform(sweep, (value) => getRulerGeometry(value).x2)
  const rulerY2 = useTransform(sweep, (value) => getRulerGeometry(value).y2)
  const rulerDetailPath = useTransform(sweep, (value) => getRulerDetailPath(value))
  const rulerOpacity = useTransform(sweep, (value) => {
    if (value < 4) return 0
    if (value < 10) return (value - 4) / 6
    if (value > 354) return Math.max(0, (360 - value) / 6)
    return 1
  })
  const measuredArcLength = useTransform(sweep, (value) => Math.min(1, value / 360))
  const currentX = useTransform(sweep, (value) => circlePoint(value).x)
  const currentY = useTransform(sweep, (value) => circlePoint(value).y)
  const remainderProgress = useTransform(sweep, (value) => Math.max(0, Math.min(1, (value - piArcEnds[3]) / (360 - piArcEnds[3]))))

  useEffect(() => {
    if (mode !== 'circunferencia') return
    sweep.set(0)
    const controls = animate(sweep, 360, {
      duration: 13,
      ease: 'linear',
    })
    return () => controls.stop()
  }, [animationKey, mode, sweep])

  useEffect(() => {
    if (mode === 'circunferencia') setAnimationKey((value) => value + 1)
  }, [mode])

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <CircleDot size={18} className="text-blue-700" />
            {mode === 'circunferencia' ? 'Desenrolando a circunferência' : 'Laboratório do círculo'}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {mode === 'circunferencia' ? 'O diâmetro é usado como uma régua para marcar a própria circunferência.' : 'A geometria responde às suas escolhas.'}
          </p>
        </div>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">r = {formatNumber(state.radius)} u</span>
      </div>

      {mode !== 'circunferencia' ? (
        <svg viewBox="0 0 900 540" role="img" aria-label="Visualização interativa do círculo" className="w-full">
          <defs>
            <linearGradient id="circleFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
          </defs>
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <circle cx={cx} cy={cy} r={r} fill="url(#circleFill)" stroke="#2563eb" strokeWidth="5" />
            <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke="#dbeafe" strokeWidth="2" strokeDasharray="3 8" />
            {mode === 'medidas' && (
              <>
                <line x1={cx} y1={cy} x2={cx+r} y2={cy} stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r="7" fill="#1d4ed8" />
                <text x={cx+r/2} y={cy-14} textAnchor="middle" className="fill-blue-800 text-[16px] font-black">r = {formatNumber(state.radius)} u</text>
                <line x1={cx-r} y1={cy+50} x2={cx+r} y2={cy+50} stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
                <text x={cx} y={cy+78} textAnchor="middle" className="fill-violet-800 text-[15px] font-black">D = {formatNumber(state.diameter)} u</text>
              </>
            )}
            {mode === 'angulos' && (
              <>
                <path d={sectorPath(angle)} fill="#bfdbfe" fillOpacity="0.72" stroke="#2563eb" strokeWidth="2" />
                <line x1={cx} y1={cy} x2={start.x} y2={start.y} stroke="#1d4ed8" strokeWidth="4" />
                <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#1d4ed8" strokeWidth="4" />
                <text x={cx+18} y={cy-18} className="fill-blue-900 text-[19px] font-black">{angle}°</text>
                <text x={cx} y={cy+r+30} textAnchor="middle" className="fill-slate-600 text-[13px] font-semibold">arco = {formatNumber(arc)} u · corda = {formatNumber(chord)} u</text>
              </>
            )}
            {mode === 'area' && (
              <>
                <path d={sectorPath(angle)} fill="#60a5fa" fillOpacity="0.42" stroke="#2563eb" strokeWidth="2" />
                <text x={cx} y={cy+5} textAnchor="middle" className="fill-blue-900 text-[20px] font-black">{angle}°</text>
                <text x={cx} y={cy+r+30} textAnchor="middle" className="fill-slate-600 text-[13px] font-semibold">setor = {formatNumber(sector)} u²</text>
              </>
            )}
            {mode === 'elementos' && (
              <>
                <line x1={cx} y1={cy} x2={cx+r} y2={cy} stroke="#1d4ed8" strokeWidth="4" />
                <line x1={cx-r} y1={cy} x2={cx+r} y2={cy} stroke="#7c3aed" strokeWidth="4" />
                <path d={arcPath(300,60)} fill="none" stroke="#0f766e" strokeWidth="8" strokeLinecap="round" />
                <line x1={cx-92} y1={cy+88} x2={cx+92} y2={cy+88} stroke="#ea580c" strokeWidth="5" strokeLinecap="round" />
                <circle cx={cx} cy={cy} r="7" fill="#1d4ed8" />
                <text x={cx+r/2} y={cy-13} textAnchor="middle" className="fill-blue-800 text-[15px] font-black">raio</text>
                <text x={cx} y={cy+28} textAnchor="middle" className="fill-violet-800 text-[15px] font-black">diâmetro</text>
                <text x={cx} y={cy-r-25} textAnchor="middle" className="fill-teal-700 text-[15px] font-black">arco</text>
                <text x={cx} y={cy+116} textAnchor="middle" className="fill-orange-700 text-[15px] font-black">corda</text>
                <text x={cx+14} y={cy-12} className="fill-slate-600 text-[13px] font-bold">centro</text>
              </>
            )}
          </motion.g>
          <text x="450" y="510" textAnchor="middle" className="fill-slate-500 text-[13px] font-semibold">
            {mode === 'elementos' ? 'Cada elemento tem uma função diferente na geometria do círculo.' : mode === 'area' ? 'A área do setor depende diretamente do ângulo central.' : mode === 'angulos' ? 'Mova o ângulo e observe arco e corda mudarem juntos.' : 'Altere o raio e observe todas as medidas acompanharem a mudança.'}
          </text>
        </svg>
      ) : (
        <div className="relative">
          <svg key={animationKey} viewBox="0 0 900 520" role="img" aria-label="Experimento mostrando a circunferência sendo medida com comprimentos iguais ao diâmetro" className="w-full">
            <text x="450" y="38" textAnchor="middle" className="fill-slate-800 text-[24px] font-black">Por que π = 3,14...?</text>
            <text x="450" y="64" textAnchor="middle" className="fill-slate-500 text-[14px] font-semibold">Pegamos o comprimento do diâmetro e o usamos como uma régua para formar a circunferência.</text>

            <rect x="175" y="78" width="550" height="365" rx="18" fill="#eff6ff" />

            <circle cx={piCircleCx} cy={piCircleCy} r={piCircleR} fill="#ffffff" stroke="#9ca3af" strokeWidth="2" />

            <motion.path
              d={piFullCirclePath}
              fill="none"
              stroke="#111827"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              pathLength={measuredArcLength}
            />

            <line x1={piCircleCx-piCircleR} y1={piCircleCy} x2={piCircleCx+piCircleR} y2={piCircleCy} stroke="#111827" strokeWidth="4" />
            <text x={piCircleCx} y={piCircleCy-18} textAnchor="middle" className="fill-slate-800 text-[16px] font-black">DIÂMETRO</text>

            {piArcEnds.map((degrees, index) => {
              const marker = circlePoint(degrees)
              const markerDelay = index === 0 ? 0 : (degrees / 360) * 13 - 0.12

              return (
                <motion.circle
                  key={degrees}
                  cx={marker.x}
                  cy={marker.y}
                  r="7"
                  fill="#f43f5e"
                  initial={{ opacity: index === 0 ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: Math.max(0, markerDelay) }}
                />
              )
            })}

            <motion.line
              x1={rulerX1}
              y1={rulerY1}
              x2={rulerX2}
              y2={rulerY2}
              stroke="#111827"
              strokeWidth="8"
              strokeLinecap="round"
              style={{ opacity: rulerOpacity }}
            />

            <motion.path
              d={rulerDetailPath}
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ opacity: rulerOpacity }}
            />

            <motion.circle
              cx={currentX}
              cy={currentY}
              r="8"
              fill="#ffffff"
              stroke="#f43f5e"
              strokeWidth="4"
              style={{ opacity: rulerOpacity }}
            />

            {piArcEnds.slice(0, 3).map((startDegrees, index) => {
              const endDegrees = piArcEnds[index + 1]
              const mid = circlePoint((startDegrees + endDegrees) / 2, piCircleR + 28)
              const labelDelay = (endDegrees / 360) * 13 - 0.05

              return (
                <motion.text
                  key={startDegrees}
                  x={mid.x}
                  y={mid.y}
                  textAnchor="middle"
                  className="fill-slate-900 text-[22px] font-black"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: Math.max(0, labelDelay) }}
                >
                  {index + 1}
                </motion.text>
              )
            })}

            <motion.path
              d={piArcPath(piArcEnds[3], 360)}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              pathLength={remainderProgress}
            />

            <motion.text
              x={circlePoint((piArcEnds[3] + 360) / 2, piCircleR + 28).x}
              y={circlePoint((piArcEnds[3] + 360) / 2, piCircleR + 28).y}
              textAnchor="middle"
              className="fill-rose-600 text-[15px] font-black"
              style={{ opacity: remainderProgress }}
            >
              0,14
            </motion.text>

            <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 12.7, duration: 0.45 }}>
              <rect x="335" y="455" width="230" height="54" rx="9" fill="#b91c1c" />
              <text x="450" y="491" textAnchor="middle" className="fill-yellow-300 text-[27px] font-black">3,14...</text>
            </motion.g>
          </svg>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <button type="button" onClick={() => setAnimationKey((value) => value + 1)} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <RotateCcw size={15} /> Repetir experimento
            </button>
            <button type="button" onClick={() => onModeChange('medidas')} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              Voltar ao laboratório
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
