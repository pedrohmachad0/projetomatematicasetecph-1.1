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

const rollStart = 115
const rollY = 335
const rollRadius = 78
const rollDiameter = rollRadius * 2
const rollDistance = Math.PI * rollDiameter
const rollEnd = rollStart + rollDistance
const rollRotation = (rollDistance / rollDiameter) * 360

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
          <svg key={animationKey} viewBox="0 0 900 520" role="img" aria-label="Animação do círculo rolando para revelar a relação entre circunferência e diâmetro" className="w-full overflow-visible">
            <defs>
              <filter id="rollShadow" x="-30%" y="-50%" width="160%" height="200%">
                <feDropShadow dx="0" dy="5" stdDeviation="5" floodOpacity="0.16" />
              </filter>
              <linearGradient id="rollFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#dbeafe" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>

            <text x="450" y="48" textAnchor="middle" className="fill-slate-800 text-[21px] font-black">A circunferência tem π diâmetros</text>
            <text x="450" y="73" textAnchor="middle" className="fill-slate-500 text-[13px] font-semibold">Observe o círculo rolar: cada volta completa percorre exatamente 1 diâmetro.</text>

            <line x1={rollStart} y1={rollY+rollRadius+20} x2={rollEnd+30} y2={rollY+rollRadius+20} stroke="#e2e8f0" strokeWidth="3" />
            <motion.line
              x1={rollStart}
              y1={rollY+rollRadius+20}
              x2={rollStart}
              y2={rollY+rollRadius+20}
              animate={{ x2: rollEnd }}
              transition={{ duration: 4.6, ease: 'easeInOut' }}
              stroke="#2563eb"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {[0,1,2].map((i) => {
              const x = rollStart + rollDiameter * i
              return (
                <g key={i}>
                  <motion.line x1={x} y1={rollY+rollRadius+2} x2={x} y2={rollY+rollRadius+42} stroke="#1e40af" strokeWidth="2" />
                  <text x={x + rollDiameter/2} y={rollY+rollRadius-8} textAnchor="middle" className="fill-blue-800 text-[16px] font-black">{i+1}D</text>
                </g>
              )
            })}
            <motion.line x1={rollStart + rollDiameter*3} y1={rollY+rollRadius+2} x2={rollStart + rollDiameter*3} y2={rollY+rollRadius+42} stroke="#1e40af" strokeWidth="2" />
            <text x={rollStart + rollDiameter*3 + (rollDistance-rollDiameter*3)/2} y={rollY+rollRadius-8} textAnchor="middle" className="fill-violet-700 text-[14px] font-black">+0,14159D</text>

            <motion.g
              initial={{ x: 0 }}
              animate={{ x: rollDistance }}
              transition={{ duration: 4.6, ease: 'easeInOut' }}
            >
              <motion.g
                initial={{ rotate: 0 }}
                animate={{ rotate: -rollRotation }}
                transition={{ duration: 4.6, ease: 'easeInOut' }}
                style={{ transformOrigin: rollStart + 'px ' + rollY + 'px' }}
              >
                <circle cx={rollStart} cy={rollY} r={rollRadius} fill="url(#rollFill)" stroke="#2563eb" strokeWidth="5" filter="url(#rollShadow)" />
                <circle cx={rollStart} cy={rollY} r={rollRadius-7} fill="none" stroke="#bfdbfe" strokeWidth="2" strokeDasharray="4 8" />
                <line x1={rollStart} y1={rollY} x2={rollStart+rollRadius} y2={rollY} stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
                <circle cx={rollStart} cy={rollY} r="6" fill="#1d4ed8" />
                <circle cx={rollStart+rollRadius} cy={rollY} r="5" fill="#fff" stroke="#7c3aed" strokeWidth="3" />
              </motion.g>
            </motion.g>

            <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 4.75, duration: 0.5 }}>
              <rect x="175" y="455" width="550" height="45" rx="14" fill="#f8fafc" stroke="#dbeafe" />
              <text x="450" y="483" textAnchor="middle" className="fill-slate-700 text-[17px] font-black">C ÷ D = 3,14159... = π</text>
            </motion.g>

            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5.15, duration: 0.5 }}>
              <text x="450" y="115" textAnchor="middle" className="fill-blue-800 text-[15px] font-black">3 diâmetros completos + 0,14159...</text>
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
