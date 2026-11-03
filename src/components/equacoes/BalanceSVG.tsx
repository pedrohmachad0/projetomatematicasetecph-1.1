import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface Props {
  a: number
  b: number
  c: number
  /** Esquerda − direita. */
  tilt: number
  revealX: number | null
}

const CX = 320
const CY = 140
const HALF = 205
const PAN_DROP = 70
const PAN_WIDTH = 200
const spring = { type: 'spring' as const, stiffness: 120, damping: 16 }

function PanContents({ boxes, units, revealX, color }: { boxes: number; units: number; revealX: number | null; color: string }) {
  const unitSize = 14
  const perRow = 12
  const unitRows = Math.ceil(units / perRow)
  const boxSize = 34
  const boxesPerRow = 5
  const boxRows = Math.ceil(boxes / boxesPerRow)
  return (
    <g>
      {Array.from({ length: boxes }, (_, i) => {
        const row = Math.floor(i / boxesPerRow)
        const col = i % boxesPerRow
        const inRow = Math.min(boxesPerRow, boxes - row * boxesPerRow)
        const x = -((inRow * (boxSize + 4)) / 2) + col * (boxSize + 4)
        const y = -boxSize - row * (boxSize + 4) - 2
        return (
          <g key={`x-${i}`}>
            <rect x={x} y={y} width={boxSize} height={boxSize} rx={6} fill="#0f766e" stroke="#115e59" strokeWidth={2} />
            <text x={x + boxSize / 2} y={y + boxSize / 2 + 5} textAnchor="middle" fontSize={15} fontWeight={900} fill="#ffffff">
              {revealX ?? 'x'}
            </text>
          </g>
        )
      })}
      {Array.from({ length: units }, (_, i) => {
        const row = Math.floor(i / perRow)
        const col = i % perRow
        const inRow = Math.min(perRow, units - row * perRow)
        const x = -((inRow * (unitSize + 2)) / 2) + col * (unitSize + 2)
        const y = -unitSize - row * (unitSize + 2) - 2 - boxRows * (boxSize + 4)
        return <rect key={`u-${i}`} x={x} y={y} width={unitSize} height={unitSize} rx={3} fill={color} stroke="#ffffff" strokeWidth={1} />
      })}
      {unitRows === 0 && boxes === 0 && (
        <text y={-8} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: 'var(--svg-muted)' }}>
          vazio
        </text>
      )}
    </g>
  )
}

function Pan({ end, children, label }: { end: { x: number; y: number }; children: ReactNode; label: string }) {
  return (
    <motion.g initial={false} animate={{ x: end.x, y: end.y }} transition={spring}>
      <line x1={0} y1={0} x2={-PAN_WIDTH / 2 + 10} y2={PAN_DROP} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
      <line x1={0} y1={0} x2={PAN_WIDTH / 2 - 10} y2={PAN_DROP} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
      <g transform={`translate(0 ${PAN_DROP})`}>{children}</g>
      <path d={`M ${-PAN_WIDTH / 2} ${PAN_DROP} L ${PAN_WIDTH / 2} ${PAN_DROP} L ${PAN_WIDTH / 2 - 18} ${PAN_DROP + 14} L ${-PAN_WIDTH / 2 + 18} ${PAN_DROP + 14} Z`} style={{ fill: 'var(--svg-text)' }} />
      <text y={PAN_DROP + 34} textAnchor="middle" fontSize={12} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
        {label}
      </text>
    </motion.g>
  )
}

export default function BalanceSVG({ a, b, c, tilt, revealX }: Props) {
  const degrees = -Math.max(-10, Math.min(10, tilt * 2.5))
  const radians = (degrees * Math.PI) / 180
  const left = { x: CX - HALF * Math.cos(radians), y: CY - HALF * Math.sin(radians) }
  const right = { x: CX + HALF * Math.cos(radians), y: CY + HALF * Math.sin(radians) }

  return (
    <svg viewBox="0 0 640 330" className="block h-auto w-full" role="img" aria-label={`Balança: esquerda com ${a} caixas x e ${b} unidades, direita com ${c} unidades. ${tilt === 0 ? 'Equilibrada.' : tilt > 0 ? 'Lado esquerdo mais pesado.' : 'Lado direito mais pesado.'}`}>
      <path d={`M ${CX - 60} 322 L ${CX + 60} 322 L ${CX + 14} ${CY} L ${CX - 14} ${CY} Z`} style={{ fill: 'var(--svg-stroke)' }} />
      <motion.line initial={false} animate={{ x1: left.x, y1: left.y, x2: right.x, y2: right.y }} transition={spring} strokeWidth={10} strokeLinecap="round" style={{ stroke: 'var(--svg-text)' }} />
      <circle cx={CX} cy={CY} r={9} style={{ fill: 'var(--svg-ink)' }} />
      <Pan end={left} label="lado esquerdo">
        <PanContents boxes={a} units={b} revealX={revealX} color="#f59e0b" />
      </Pan>
      <Pan end={right} label="lado direito">
        <PanContents boxes={0} units={c} revealX={null} color="#f59e0b" />
      </Pan>
    </svg>
  )
}
