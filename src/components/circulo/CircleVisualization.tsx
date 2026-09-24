import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
const diameterArcDegrees = (2 * 180) / Math.PI
const piArcEnds = [0, diameterArcDegrees, diameterArcDegrees * 2, diameterArcDegrees * 3]
const circlePoint = (degrees: number, radius = piCircleR) => {
  const radians = (degrees * Math.PI) / 180
  return { x: piCircleCx + radius * Math.cos(radians), y: piCircleCy - radius * Math.sin(radians) }
}
const piArcPath = (startDegrees: number, endDegrees: number) => {
  const startPoint = circlePoint(startDegrees)
  const endPoint = circlePoint(endDegrees)
  const largeArc = endDegrees - startDegrees > 180 ? 1 : 0
  return 'M ' + startPoint.x + ' ' + startPoint.y + ' A ' + piCircleR + ' ' + piCircleR + ' 0 ' + largeArc + ' 0 ' + endPoint.x + ' ' + endPoint.y
}

export default function CircleVisualization({ state, mode, angle, onModeChange }: Props) {
  const [animationKey, setAnimationKey] = useState(0)
  const end = point(angle)
  const start = point(0)
  const chord = getChordLength(state.radius, angle)
  const arc = getArcLength(state.radius, angle)
  const sector = getSectorArea(state.radius, angle)

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
            {mode === 'circunferencia' ? 'O círculo rola e revela quanto mede sua própria borda.' : 'A geometria responde às suas escolhas.'}
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
            <text x="450" y="64" textAnchor="middle" className="fill-slate-500 text-[14px] font-semibold">O comprimento do diâmetro é usado para formar arcos na circunferência.</text>

            <rect x="175" y="78" width="550" height="365" rx="18" fill="#eff6ff" />

            <line x1={piCircleCx-piCircleR} y1={piCircleCy} x2={piCircleCx+piCircleR} y2={piCircleCy} stroke="#111827" strokeWidth="4" />
            <text x={piCircleCx} y={piCircleCy-18} textAnchor="middle" className="fill-slate-800 text-[16px] font-black">DIÂMETRO</text>
            <circle cx={piCircleCx} cy={piCircleCy} r={piCircleR} fill="#ffffff" stroke="#9ca3af" strokeWidth="2" />

            <circle cx={piCircleCx + piCircleR} cy={piCircleCy} r="7" fill="#f43f5e" />

            {[0, 1, 2].map((index) => {
              const startDegrees = piArcEnds[index]
              const endDegrees = piArcEnds[index + 1]
              const startPoint = circlePoint(startDegrees)
              const endPoint = circlePoint(endDegrees)
              const midPoint = circlePoint((startDegrees + endDegrees) / 2, piCircleR + 30)

              return (
                <g key={index}>
                  <motion.path
                    d={piArcPath(startDegrees, endDegrees)}
                    fill="none"
                    stroke="#111827"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.5, delay: 1.2 + index * 3.0, ease: "easeInOut" }}
                  />

                  <motion.g
                    initial={{ opacity: 0, rotate: -startDegrees }}
                    animate={{ opacity: [0, 1, 1, 0], rotate: [-startDegrees, -endDegrees, -endDegrees, -endDegrees] }}
                    transition={{ duration: 2.5, delay: 1.2 + index * 3.0, times: [0, 0.12, 0.88, 1], ease: "easeInOut" }}
                    style={{ transformOrigin: piCircleCx + "px " + piCircleCy + "px" }}
                  >
                    <line
                      x1={piCircleCx + piCircleR}
                      y1={piCircleCy}
                      x2={piCircleCx + piCircleR}
                      y2={piCircleCy - piCircleR * 2}
                      stroke="#111827"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </motion.g>

                  <motion.circle
                    cx={endPoint.x}
                    cy={endPoint.y}
                    r="7"
                    fill="#f43f5e"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.35 + index * 3.0, duration: 0.25 }}
                  />

                  <motion.text
                    x={midPoint.x}
                    y={midPoint.y}
                    textAnchor="middle"
                    className="fill-slate-900 text-[22px] font-black"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3.45 + index * 3.0, duration: 0.35 }}
                  >
                    {index + 1}
                  </motion.text>

                  {index === 0 && (
                    <motion.circle
                      cx={startPoint.x}
                      cy={startPoint.y}
                      r="7"
                      fill="#f43f5e"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2, duration: 0.2 }}
                    />
                  )}
                </g>
              )
            })}

            <motion.path
              d={piArcPath(piArcEnds[3], piArcEnds[3] + (360 - piArcEnds[3]))}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="6"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 10.5, ease: "easeInOut" }}
            />

            <motion.circle
              cx={circlePoint(360).x}
              cy={circlePoint(360).y}
              r="7"
              fill="#f43f5e"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 11.25, duration: 0.25 }}
            />

            <motion.text
              x={circlePoint((piArcEnds[3] + 360) / 2, piCircleR + 28).x}
              y={circlePoint((piArcEnds[3] + 360) / 2, piCircleR + 28).y}
              textAnchor="middle"
              className="fill-rose-600 text-[15px] font-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 11.3, duration: 0.4 }}
            >
              0,14
            </motion.text>

            <motion.g
              initial={{ opacity: 0, rotate: -piArcEnds[3] }}
              animate={{ opacity: [0, 1, 0], rotate: [-piArcEnds[3], -360, -360] }}
              transition={{ duration: 0.8, delay: 10.5, times: [0, 0.85, 1], ease: "easeInOut" }}
              style={{ transformOrigin: piCircleCx + "px " + piCircleCy + "px" }}
            >
              <line
                x1={piCircleCx + piCircleR}
                y1={piCircleCy}
                x2={piCircleCx + piCircleR}
                y2={piCircleCy - piCircleR * 2}
                stroke="#111827"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </motion.g>

            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 11.9, duration: 0.5 }}>
              <text x="450" y="420" textAnchor="middle" className="fill-red-600 text-[30px] font-black">0,14</text>
              <text x="450" y="442" textAnchor="middle" className="fill-slate-700 text-[13px] font-semibold">é o pequeno trecho que sobra depois de 3 diâmetros.</text>
            </motion.g>

            <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 12.5, duration: 0.55 }}>
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
