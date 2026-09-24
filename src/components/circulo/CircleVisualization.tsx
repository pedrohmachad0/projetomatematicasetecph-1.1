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
  return { x: piCircleCx + radius * Math.cos(radians), y: piCircleCy + radius * Math.sin(radians) }
}
const piArcPath = (startDegrees: number, endDegrees: number) => {
  const startPoint = circlePoint(startDegrees)
  const endPoint = circlePoint(endDegrees)
  const largeArc = endDegrees - startDegrees > 180 ? 1 : 0
  return 'M ' + startPoint.x + ' ' + startPoint.y + ' A ' + piCircleR + ' ' + piCircleR + ' 0 ' + largeArc + ' 1 ' + endPoint.x + ' ' + endPoint.y
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
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-blue-800">Experimento de π</p>
              <p className="mt-0.5 text-xs font-medium text-slate-600">O diâmetro vira uma régua: ele toca a borda e deixa cada trecho marcado.</p>
            </div>
            <span className="rounded-full border border-blue-200 bg-white px-2.5 py-1 text-xs font-black text-blue-800">1 D = {formatNumber(state.diameter)} u</span>
          </div>

          <svg
            key={animationKey}
            viewBox="0 0 900 620"
            role="img"
            aria-label="Experimento mostrando o diâmetro sendo usado como régua ao redor da circunferência"
            className="w-full overflow-visible"
          >
            <text x="450" y="34" textAnchor="middle" className="fill-slate-900 text-[24px] font-black">
              Por que π = 3,14159...?
            </text>
            <text x="450" y="58" textAnchor="middle" className="fill-slate-500 text-[13px] font-semibold">
              O mesmo comprimento do diâmetro cabe três vezes na borda — e sobra um pequeno trecho.
            </text>

            <rect x="100" y="80" width="700" height="445" rx="24" fill="#eff6ff" />
            <rect x="122" y="102" width="656" height="401" rx="18" fill="#ffffff" opacity="0.9" />

            <circle cx={piCircleCx} cy={piCircleCy} r={piCircleR} fill="#ffffff" stroke="#111827" strokeWidth="4" />
            <circle cx={piCircleCx} cy={piCircleCy} r={piCircleR + 14} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 8" />

            <line
              x1={piCircleCx - piCircleR}
              y1={piCircleCy}
              x2={piCircleCx + piCircleR}
              y2={piCircleCy}
              stroke="#111827"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx={piCircleCx - piCircleR} cy={piCircleCy} r="5" fill="#2563eb" />
            <circle cx={piCircleCx + piCircleR} cy={piCircleCy} r="5" fill="#2563eb" />
            <rect x={piCircleCx - 67} y={piCircleCy + 11} width="134" height="25" rx="12.5" fill="#f8fafc" stroke="#cbd5e1" />
            <text x={piCircleCx} y={piCircleCy + 28} textAnchor="middle" className="fill-slate-800 text-[12px] font-black">
              DIÂMETRO = 2r
            </text>

            <path
              d={piArcPath(0, diameterArcDegrees * 3)}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d={piArcPath(diameterArcDegrees * 3, 360)}
              fill="none"
              stroke="#ffe4e6"
              strokeWidth="9"
              strokeLinecap="round"
            />

            {[0, 1, 2].map((index) => {
              const startDegrees = piArcEnds[index]
              const endDegrees = piArcEnds[index + 1]
              const labelPoint = circlePoint((startDegrees + endDegrees) / 2, piCircleR + 27)
              return (
                <motion.g
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.95 + index * 2.6, duration: 0.35 }}
                >
                  <path
                    d={piArcPath(startDegrees, endDegrees)}
                    fill="none"
                    stroke="#111827"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                  <circle cx={labelPoint.x} cy={labelPoint.y} r="17" fill="#111827" />
                  <text x={labelPoint.x} y={labelPoint.y + 6} textAnchor="middle" className="fill-white text-[14px] font-black">
                    {index + 1}D
                  </text>
                </motion.g>
              )
            })}

            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 8.75, duration: 0.35 }}
            >
              <path
                d={piArcPath(piArcEnds[3], 360)}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle cx={circlePoint(piArcEnds[3]).x} cy={circlePoint(piArcEnds[3]).y} r="8" fill="#f43f5e" />
            </motion.g>

            <motion.g
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: diameterArcDegrees * 3 }}
              transition={{
                opacity: { delay: 0.25, duration: 0.25 },
                rotate: { delay: 0.8, duration: 7.9, ease: "linear" },
              }}
              style={{ transformOrigin: piCircleCx + "px " + piCircleCy + "px" }}
            >
              <line
                x1={piCircleCx + piCircleR}
                y1={piCircleCy}
                x2={piCircleCx + piCircleR}
                y2={piCircleCy + piDiameterLength}
                stroke="#111827"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <circle cx={piCircleCx + piCircleR} cy={piCircleCy} r="8" fill="#f43f5e" />
              <circle cx={piCircleCx + piCircleR} cy={piCircleCy + piDiameterLength} r="6" fill="#111827" />
            </motion.g>

            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 8.85, duration: 0.3 }}
            >
              <path
                d={`M ${circlePoint(piArcEnds[3]).x + 8} ${circlePoint(piArcEnds[3]).y + 2} L 615 430`}
                fill="none"
                stroke="#dc2626"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M 615 430 L 604 417 M 615 430 L 599 428"
                fill="none"
                stroke="#dc2626"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <rect x="615" y="407" width="150" height="48" rx="12" fill="#fff1f2" stroke="#fecdd3" />
              <text x="690" y="428" textAnchor="middle" className="fill-red-600 text-[19px] font-black">
                +0,14159D
              </text>
              <text x="690" y="445" textAnchor="middle" className="fill-slate-600 text-[10px] font-bold">
                trecho que sobrou
              </text>
            </motion.g>

            <motion.g
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 9.35, duration: 0.45 }}
            >
              <rect x="315" y="535" width="270" height="56" rx="12" fill="#b91c1c" />
              <text x="450" y="571" textAnchor="middle" className="fill-yellow-300 text-[29px] font-black">
                3,14159...
              </text>
            </motion.g>

            <motion.text
              x="450"
              y="612"
              textAnchor="middle"
              className="fill-slate-600 text-[13px] font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 9.55, duration: 0.35 }}
            >
              3 diâmetros completos + 0,14159 diâmetro = π
            </motion.text>
          </svg>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
              cada trecho preto = 1 diâmetro
              <span className="ml-2 h-2.5 w-2.5 rounded-full bg-rose-500" />
              sobra
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAnimationKey((value) => value + 1)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw size={15} /> Repetir experimento
              </button>
              <button
                type="button"
                onClick={() => onModeChange('medidas')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Voltar ao laboratório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
