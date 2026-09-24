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
const piCircleCy = 285
const piCircleR = 130
const piDiameterLength = piCircleR * 2
const diameterArcDegrees = 360 / Math.PI
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
            {mode === 'circunferencia' ? 'Medindo a circunferência' : 'Laboratório do círculo'}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {mode === 'circunferencia' ? 'Uma régua com o tamanho do diâmetro percorre a borda e deixa o caminho marcado.' : 'A geometria responde às suas escolhas.'}
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
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <div>
              <p className="text-sm font-black text-slate-800">Por que π = 3,14...?</p>
              <p className="text-xs font-medium text-slate-500">Um diâmetro é usado como uma régua para medir a borda do círculo.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">1D = {formatNumber(state.diameter)} u</span>
          </div>

          <svg
            key={animationKey}
            viewBox="0 0 760 500"
            role="img"
            aria-label="Experimento que usa o comprimento do diâmetro como uma régua ao redor da circunferência"
            className="mx-auto block w-full max-w-3xl"
          >
            <rect x="28" y="18" width="704" height="420" rx="22" fill="#eff6ff" />

            <text x="380" y="48" textAnchor="middle" className="fill-slate-900 text-[20px] font-black">
              Pegue o diâmetro e forme um arco
            </text>

            <circle cx={piCircleCx} cy={piCircleCy} r={piCircleR} fill="#ffffff" stroke="#111827" strokeWidth="4" />

            <line
              x1={piCircleCx - piCircleR}
              y1={piCircleCy}
              x2={piCircleCx + piCircleR}
              y2={piCircleCy}
              stroke="#111827"
              strokeWidth="3"
            />
            <text x={piCircleCx} y={piCircleCy + 5} textAnchor="middle" className="fill-slate-900 text-[15px] font-black tracking-widest">
              DIÂMETRO
            </text>

            <circle cx={piCircleCx + piCircleR} cy={piCircleCy} r="7" fill="#f43f5e" />

            <path
              d={piArcPath(0, diameterArcDegrees * 3)}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {[0, 1, 2].map((index) => {
              const startDegrees = piArcEnds[index]
              const endDegrees = piArcEnds[index + 1]
              const midDegrees = (startDegrees + endDegrees) / 2
              const label = circlePoint(midDegrees, piCircleR + 24)
              return (
                <motion.g
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + index * 2.25, duration: 0.3 }}
                >
                  <path
                    d={piArcPath(startDegrees, endDegrees)}
                    fill="none"
                    stroke="#111827"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <text x={label.x} y={label.y + 5} textAnchor="middle" className="fill-slate-900 text-[18px] font-black">
                    {index + 1}
                  </text>
                </motion.g>
              )
            })}

            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 7.75, duration: 0.35 }}
            >
              <path
                d={piArcPath(piArcEnds[3], 360)}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx={circlePoint(piArcEnds[3]).x} cy={circlePoint(piArcEnds[3]).y} r="7" fill="#f43f5e" />
            </motion.g>

            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.25 }}
            >
              <line
                x1={piCircleCx + piCircleR}
                y1={piCircleCy}
                x2={piCircleCx + piCircleR}
                y2={piCircleCy + piDiameterLength}
                stroke="#111827"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <circle cx={piCircleCx + piCircleR} cy={piCircleCy} r="7" fill="#f43f5e" />
            </motion.g>

            <motion.g
              initial={{ rotate: 0 }}
              animate={{ rotate: -diameterArcDegrees * 3 }}
              transition={{ delay: 0.55, duration: 7.2, ease: "linear" }}
              style={{ transformOrigin: piCircleCx + "px " + piCircleCy + "px" }}
            >
              <line
                x1={piCircleCx + piCircleR}
                y1={piCircleCy}
                x2={piCircleCx + piCircleR}
                y2={piCircleCy + piDiameterLength}
                stroke="#111827"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <circle cx={piCircleCx + piCircleR} cy={piCircleCy} r="7" fill="#f43f5e" />
            </motion.g>

            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 7.85, duration: 0.3 }}
            >
              <path
                d={`M ${circlePoint(piArcEnds[3]).x - 2} ${circlePoint(piArcEnds[3]).y + 4} L 225 395`}
                fill="none"
                stroke="#dc2626"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 225 395 L 237 382 M 225 395 L 242 393"
                fill="none"
                stroke="#dc2626"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <text x="115" y="405" className="fill-red-600 text-[28px] font-black">
                0,14
              </text>
            </motion.g>

            <motion.g
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 8.25, duration: 0.4 }}
            >
              <rect x="285" y="385" width="190" height="48" rx="8" fill="#b91c1c" />
              <text x="380" y="417" textAnchor="middle" className="fill-yellow-300 text-[25px] font-black">
                3,14...
              </text>
            </motion.g>

            <text x="380" y="466" textAnchor="middle" className="fill-slate-600 text-[13px] font-semibold">
              3 diâmetros completos + 0,14 de diâmetro = π
            </text>
          </svg>

          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500">
              A linha preta tem exatamente o mesmo comprimento do diâmetro.
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setAnimationKey((value) => value + 1)}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw size={14} /> Repetir
              </button>
              <button
                type="button"
                onClick={() => onModeChange('medidas')}
                className="inline-flex min-h-[40px] items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )
    </div>
  )
}
