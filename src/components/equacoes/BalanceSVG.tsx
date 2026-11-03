import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCompact } from '../ui/useCompact'

interface Props {
  a: number
  b: number
  c: number
  /** Esquerda − direita. */
  tilt: number
  revealX: number | null
}

const CX = 320
const CY = 120
const PAN_DROP = 78
const spring = { type: 'spring' as const, stiffness: 110, damping: 14 }
const pop = { type: 'spring' as const, stiffness: 420, damping: 22 }

/** Caixa-mistério: vale x. */
function MysteryBox({ x, y, size, label }: { x: number; y: number; size: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={size} height={size} rx={5} fill="url(#box-body)" stroke="#115e59" strokeWidth={2} />
      <rect y={-4} width={size} height={10} rx={3} fill="#134e4a" />
      <rect x={size / 2 - 4} y={-4} width={8} height={size + 4} fill="#fbbf24" opacity={0.9} />
      <circle cx={size / 2} cy={size / 2 + 2} r={10} fill="#ffffff" />
      <text x={size / 2} y={size / 2 + 7} textAnchor="middle" fontSize={label.length > 2 ? 10 : 14} fontWeight={900} fill="#0f766e">
        {label}
      </text>
    </g>
  )
}

/** Peso de uma unidade: moedinha dourada. */
function Weight({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect y={3} width={size} height={size - 3} rx={3} fill="#b45309" />
      <rect width={size} height={size - 4} rx={3} fill="url(#weight)" />
      <text x={size / 2} y={size / 2 + 2} textAnchor="middle" fontSize={8} fontWeight={900} fill="#78350f">
        1
      </text>
    </g>
  )
}

function PanContents({ boxes, units, revealX, perRow }: { boxes: number; units: number; revealX: number | null; perRow: number }) {
  const unitSize = 15
  const boxSize = 34
  const boxesPerRow = 5
  const boxRows = Math.ceil(boxes / boxesPerRow)
  return (
    <g>
      <AnimatePresence>
        {Array.from({ length: boxes }, (_, i) => {
          const row = Math.floor(i / boxesPerRow)
          const col = i % boxesPerRow
          const inRow = Math.min(boxesPerRow, boxes - row * boxesPerRow)
          const x = -((inRow * (boxSize + 5)) / 2) + col * (boxSize + 5)
          const y = -boxSize - row * (boxSize + 8) - 2
          return (
            <motion.g key={`x-${i}`} initial={{ opacity: 0, y: -60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50, scale: 0.5 }} transition={pop}>
              <MysteryBox x={x} y={y} size={boxSize} label={revealX === null ? 'x' : String(revealX)} />
            </motion.g>
          )
        })}
      </AnimatePresence>
      <AnimatePresence>
        {Array.from({ length: units }, (_, i) => {
          const row = Math.floor(i / perRow)
          const col = i % perRow
          const inRow = Math.min(perRow, units - row * perRow)
          const x = -((inRow * (unitSize + 2)) / 2) + col * (unitSize + 2)
          const y = -unitSize - row * (unitSize + 1) - 2 - boxRows * (boxSize + 8)
          return (
            <motion.g key={`u-${i}`} initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ ...pop, delay: Math.min(i, 12) * 0.012 }}>
              <Weight x={x} y={y} size={unitSize} />
            </motion.g>
          )
        })}
      </AnimatePresence>
      {units === 0 && boxes === 0 && (
        <text y={-10} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: 'var(--svg-muted)' }}>
          vazio
        </text>
      )}
    </g>
  )
}

function Pan({ end, children, label, width }: { end: { x: number; y: number }; children: ReactNode; label: string; width: number }) {
  const w = width / 2
  return (
    <motion.g initial={false} animate={{ x: end.x, y: end.y }} transition={spring}>
      <circle r={6} fill="#a16207" />
      {[-w + 14, 0, w - 14].map((x, i) => (
        <line key={i} x1={0} y1={0} x2={x} y2={PAN_DROP} strokeWidth={2} strokeDasharray="3 3" stroke="#a16207" />
      ))}
      <g transform={`translate(0 ${PAN_DROP})`}>{children}</g>
      <path d={`M ${-w} ${PAN_DROP} Q 0 ${PAN_DROP + 34} ${w} ${PAN_DROP} Z`} fill="url(#pan)" stroke="#a16207" strokeWidth={2} />
      <text y={PAN_DROP + 42} textAnchor="middle" fontSize={12} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
        {label}
      </text>
    </motion.g>
  )
}

export default function BalanceSVG({ a, b, c, tilt, revealX }: Props) {
  // No celular a balança fica mais estreita, para os pesos aparecerem maiores.
  const compact = useCompact()
  const HALF = compact ? 152 : 205
  const PAN_WIDTH = compact ? 168 : 200
  const perRow = compact ? 9 : 11
  const degrees = -Math.max(-10, Math.min(10, tilt * 2.5))
  const radians = (degrees * Math.PI) / 180
  const left = { x: CX - HALF * Math.cos(radians), y: CY - HALF * Math.sin(radians) }
  const right = { x: CX + HALF * Math.cos(radians), y: CY + HALF * Math.sin(radians) }
  const balanced = tilt === 0
  const needle = balanced ? '#059669' : '#dc2626'

  return (
    <svg viewBox={compact ? '64 0 512 340' : '0 0 640 340'} className="block h-auto w-full" role="img" aria-label={`Balança: esquerda com ${a} caixas x e ${b} unidades, direita com ${c} unidades. ${balanced ? 'Equilibrada.' : tilt > 0 ? 'Lado esquerdo mais pesado.' : 'Lado direito mais pesado.'}`}>
      <defs>
        <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#d97706" />
          <stop offset="1" stopColor="#92400e" />
        </linearGradient>
        <linearGradient id="column" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#92400e" />
          <stop offset="0.45" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id="pan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fcd34d" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="box-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="weight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef3c7" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Pé e coluna */}
      <ellipse cx={CX} cy={326} rx={96} ry={10} fill="#000000" opacity={0.12} />
      <path d={`M ${CX - 80} 322 Q ${CX} 296 ${CX + 80} 322 Z`} fill="url(#brass)" />
      <rect x={CX - 11} y={CY + 6} width={22} height={300 - CY} rx={6} fill="url(#column)" />
      {/* Mostrador com o ponteiro */}
      <path d={`M ${CX - 46} ${CY + 70} A 52 52 0 0 1 ${CX + 46} ${CY + 70}`} fill="none" strokeWidth={10} strokeLinecap="round" style={{ stroke: 'var(--svg-grid)' }} />
      <path d={`M ${CX - 8} ${CY + 20} A 52 52 0 0 1 ${CX + 8} ${CY + 20}`} fill="none" stroke="#059669" strokeWidth={10} strokeLinecap="round" />
      <motion.line initial={false} animate={{ rotate: -degrees * 3 }} transition={spring} x1={CX} y1={CY} x2={CX} y2={CY + 50} stroke={needle} strokeWidth={4} strokeLinecap="round" style={{ originX: `${CX}px`, originY: `${CY}px`, transformBox: 'view-box' }} />

      <motion.g initial={false} animate={{ rotate: degrees }} transition={spring} style={{ originX: `${CX}px`, originY: `${CY}px`, transformBox: 'view-box' }}>
        <rect x={CX - HALF - 6} y={CY - 7} width={2 * HALF + 12} height={14} rx={7} fill="url(#brass)" stroke="#92400e" strokeWidth={1.5} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={CX - HALF + 30 + i * ((2 * HALF - 60) / 8)} x2={CX - HALF + 30 + i * ((2 * HALF - 60) / 8)} y1={CY - 3} y2={CY + 3} stroke="#78350f" strokeWidth={2} />
        ))}
      </motion.g>
      <circle cx={CX} cy={CY} r={13} fill="url(#brass)" stroke="#78350f" strokeWidth={2} />
      <circle cx={CX} cy={CY} r={4} fill="#78350f" />
      <motion.g key={balanced ? 'eq' : 'neq'} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={pop} style={{ originX: `${CX}px`, originY: '40px', transformBox: 'view-box' }}>
        <circle cx={CX} cy={40} r={22} fill={needle} />
        <text x={CX} y={50} textAnchor="middle" fontSize={28} fontWeight={900} fill="#ffffff">
          {balanced ? '=' : '≠'}
        </text>
      </motion.g>

      <Pan end={left} label="lado esquerdo" width={PAN_WIDTH}>
        <PanContents boxes={a} units={b} revealX={revealX} perRow={perRow} />
      </Pan>
      <Pan end={right} label="lado direito" width={PAN_WIDTH}>
        <PanContents boxes={0} units={c} revealX={null} perRow={perRow} />
      </Pan>
    </svg>
  )
}
