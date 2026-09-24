import { motion } from 'framer-motion'
import { CircleDot } from 'lucide-react'
import { formatNumber, type PiState } from '../../logic/pi'

interface Props {
  state: PiState
  isUnrolled: boolean
}

export default function PiVisualization({ state, isUnrolled }: Props) {
  const viewWidth = 900
  const barStart = 90
  const barWidth = 720
  const scale = barWidth / state.circumference
  const diameterWidth = state.diameter * scale
  const remainderWidth = state.remainder * scale
  const fullWidth = state.wholeDiameters * diameterWidth

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <CircleDot size={18} className="text-blue-700" />
          <span>{isUnrolled ? 'Circunferência desenrolada' : 'Círculo e seu diâmetro'}</span>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
          C = {formatNumber(state.circumference)} u
        </span>
      </div>

      <svg
        viewBox="0 0 900 500"
        role="img"
        aria-label={`Círculo de diâmetro ${formatNumber(state.diameter)} e circunferência ${formatNumber(state.circumference)}`}
        className="w-full overflow-visible"
      >
        <defs>
          <linearGradient id="piCircleFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#eff6ff" />
          </linearGradient>
        </defs>

        <g opacity={isUnrolled ? 0.22 : 1} style={{ transition: 'opacity 350ms ease' }}>
          <circle cx="450" cy="175" r="112" fill="url(#piCircleFill)" stroke="#2563eb" strokeWidth="5" />
          <line x1="338" y1="175" x2="562" y2="175" stroke="#1e40af" strokeWidth="4" strokeLinecap="round" />
          <circle cx="338" cy="175" r="6" fill="#1e40af" />
          <circle cx="562" cy="175" r="6" fill="#1e40af" />
          <text x="450" y="158" textAnchor="middle" className="fill-slate-700 text-[18px] font-black">D = {formatNumber(state.diameter)} u</text>
          <text x="450" y="215" textAnchor="middle" className="fill-slate-500 text-[14px] font-semibold">raio = {formatNumber(state.radius)} u</text>
        </g>

        <motion.g
          initial={false}
          animate={{ opacity: isUnrolled ? 1 : 0.25, y: isUnrolled ? 0 : 18 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <line x1={barStart} y1="355" x2={barStart + barWidth} y2="355" stroke="#cbd5e1" strokeWidth="20" strokeLinecap="round" />
          {Array.from({ length: state.wholeDiameters }).map((_, index) => {
            const x = barStart + index * diameterWidth
            return (
              <g key={index}>
                <motion.rect
                  x={x}
                  y="340"
                  height="30"
                  rx="8"
                  fill="#2563eb"
                  initial={{ width: 0 }}
                  animate={{ width: diameterWidth }}
                  transition={{ duration: 0.45, delay: index * 0.12 }}
                />
                <text x={x + diameterWidth / 2} y="326" textAnchor="middle" className="fill-blue-800 text-[15px] font-black">
                  {index + 1}D
                </text>
              </g>
            )
          })}
          <motion.rect
            x={barStart + fullWidth}
            y="340"
            height="30"
            rx="8"
            fill="#93c5fd"
            initial={{ width: 0 }}
            animate={{ width: remainderWidth }}
            transition={{ duration: 0.5, delay: 0.38 }}
          />
          <text x={barStart + fullWidth + remainderWidth / 2} y="326" textAnchor="middle" className="fill-blue-700 text-[14px] font-black">
            +{formatNumber(state.remainderRatio, 3)}D
          </text>

          <line x1={barStart} y1="405" x2={barStart + diameterWidth} y2="405" stroke="#64748b" strokeWidth="2" />
          <line x1={barStart} y1="397" x2={barStart} y2="413" stroke="#64748b" strokeWidth="2" />
          <line x1={barStart + diameterWidth} y1="397" x2={barStart + diameterWidth} y2="413" stroke="#64748b" strokeWidth="2" />
          <text x={barStart + diameterWidth / 2} y="437" textAnchor="middle" className="fill-slate-600 text-[14px] font-bold">
            1 diâmetro = {formatNumber(state.diameter)} u
          </text>

          <text x="450" y="478" textAnchor="middle" className="fill-slate-500 text-[13px] font-semibold">
            3 diâmetros completos + o restante
          </text>
        </motion.g>

        {!isUnrolled && (
          <text x="450" y="330" textAnchor="middle" className="fill-slate-500 text-[13px] font-semibold">
            Clique em “Desenrolar” para comparar
          </text>
        )}
      </svg>
    </div>
  )
}
