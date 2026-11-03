import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  x: number
  y: number
  law: string
  /** Muda a cada vez que um x entra na máquina (reinicia a animação). */
  run: number
  format: (value: number) => string
}

function Gear({ cx, cy, r, color, spinning, reverse = false }: { cx: number; cy: number; r: number; color: string; spinning: boolean; reverse?: boolean }) {
  const teeth = 10
  const d = Array.from({ length: teeth }, (_, i) => {
    const a = (i / teeth) * Math.PI * 2
    const b = a + Math.PI / teeth
    return `L ${cx + (r + 6) * Math.cos(a)} ${cy + (r + 6) * Math.sin(a)} L ${cx + (r + 6) * Math.cos(b)} ${cy + (r + 6) * Math.sin(b)} L ${cx + r * Math.cos(b + 0.1)} ${cy + r * Math.sin(b + 0.1)}`
  }).join(' ')
  return (
    <motion.g animate={spinning ? { rotate: reverse ? -360 : 360 } : { rotate: 0 }} transition={spinning ? { duration: 1.2, ease: 'easeInOut' } : { duration: 0 }} style={{ originX: `${cx}px`, originY: `${cy}px`, transformBox: 'view-box' }}>
      <path d={`M ${cx + r} ${cy} ${d} Z`} fill={color} />
      <circle cx={cx} cy={cy} r={r * 0.4} fill="#ffffff" opacity={0.85} />
    </motion.g>
  )
}

/** Máquina de função: o x entra por cima, a lei é aplicada e o f(x) sai embaixo. */
export default function FunctionMachine({ x, y, law, run, format }: Props) {
  const reduceMotion = useReducedMotion()
  const spinning = run > 0 && !reduceMotion
  return (
    <svg viewBox="0 0 420 190" className="mx-auto block h-auto w-full max-w-[460px]" role="img" aria-label={`Máquina de função: entra x = ${format(x)}, sai f(x) = ${format(y)}`}>
      <defs>
        <linearGradient id="machine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="1" stopColor="#9d174d" />
        </linearGradient>
      </defs>
      {/* funil de entrada */}
      <path d="M 40 22 L 110 22 L 92 62 L 58 62 Z" fill="#fce7f3" stroke="#be185d" strokeWidth={3} />
      <text x={75} y={16} textAnchor="middle" fontSize={12} fontWeight={900} fill="#be185d">
        entra x
      </text>
      {/* corpo */}
      <rect x={30} y={62} width={360} height={84} rx={18} fill="url(#machine)" stroke="#831843" strokeWidth={3} />
      <rect x={130} y={80} width={200} height={48} rx={10} fill="#ffffff" opacity={0.95} />
      <text x={230} y={111} textAnchor="middle" fontSize={17} fontWeight={900} fontFamily="ui-monospace, monospace" fill="#9d174d">
        {law}
      </text>
      <Gear key={`g1-${run}`} cx={80} cy={104} r={20} color="#fde68a" spinning={spinning} />
      <Gear key={`g2-${run}`} cx={360} cy={92} r={13} color="#fbcfe8" spinning={spinning} reverse />
      <circle cx={360} cy={126} r={5} fill={spinning ? '#4ade80' : '#fda4af'} />
      {/* saída */}
      <path d="M 300 146 L 340 146 L 334 166 L 306 166 Z" fill="#fce7f3" stroke="#be185d" strokeWidth={3} />

      {/* bolinha de entrada */}
      <motion.g key={`in-${run}`} initial={run > 0 && !reduceMotion ? { x: 0, y: -10, opacity: 1 } : false} animate={run > 0 && !reduceMotion ? { x: [0, 0, 0], y: [-10, 40, 40], opacity: [1, 1, 0] } : { opacity: 1 }} transition={{ duration: 0.7, times: [0, 0.6, 1] }}>
        <circle cx={75} cy={40} r={17} fill="#2563eb" stroke="#ffffff" strokeWidth={3} />
        <text x={75} y={45} textAnchor="middle" fontSize={format(x).length > 3 ? 10 : 13} fontWeight={900} fill="#ffffff">
          {format(x)}
        </text>
      </motion.g>
      {/* bolinha de saída */}
      <motion.g key={`out-${run}`} initial={run > 0 && !reduceMotion ? { opacity: 0, y: -30 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: run > 0 && !reduceMotion ? 1.1 : 0, type: 'spring', stiffness: 260, damping: 14 }}>
        <rect x={278} y={164} width={84} height={24} rx={12} fill="#0f766e" />
        <text x={320} y={181} textAnchor="middle" fontSize={13} fontWeight={900} fill="#ffffff">
          f = {format(y)}
        </text>
      </motion.g>
    </svg>
  )
}
