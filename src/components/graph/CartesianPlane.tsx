import type { ReactNode } from 'react'
import { PLANE_PADDING as PADDING, PLANE_SIZE, type PlaneScale } from '../../logic/plane'

interface Props {
  scale: PlaneScale
  label: string
  children: ReactNode
}

export default function CartesianPlane({ scale, label, children }: Props) {
  const ticks = Array.from({ length: scale.max - scale.min + 1 }, (_, i) => scale.min + i)
  return (
    <svg viewBox={`0 0 ${PLANE_SIZE} ${PLANE_SIZE}`} className="mx-auto block h-auto w-full max-w-[560px]" role="img" aria-label={label}>
      <defs>
        <clipPath id="plane-area">
          <rect x={PADDING} y={PADDING} width={PLANE_SIZE - PADDING * 2} height={PLANE_SIZE - PADDING * 2} />
        </clipPath>
      </defs>
      <rect x={PADDING} y={PADDING} width={PLANE_SIZE - PADDING * 2} height={PLANE_SIZE - PADDING * 2} rx={6} style={{ fill: 'var(--svg-surface)', stroke: 'var(--svg-grid)' }} />
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={scale.toX(tick)} x2={scale.toX(tick)} y1={PADDING} y2={PLANE_SIZE - PADDING} strokeWidth={1} style={{ stroke: 'var(--svg-grid)' }} />
          <line y1={scale.toY(tick)} y2={scale.toY(tick)} x1={PADDING} x2={PLANE_SIZE - PADDING} strokeWidth={1} style={{ stroke: 'var(--svg-grid)' }} />
        </g>
      ))}
      <line x1={scale.toX(0)} x2={scale.toX(0)} y1={PADDING} y2={PLANE_SIZE - PADDING} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
      <line y1={scale.toY(0)} y2={scale.toY(0)} x1={PADDING} x2={PLANE_SIZE - PADDING} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
      {ticks
        .filter((tick) => tick !== 0 && tick % 2 === 0)
        .map((tick) => (
          <g key={`label-${tick}`} fontSize={10} fontWeight={700} style={{ fill: 'var(--svg-muted)' }}>
            <text x={scale.toX(tick)} y={scale.toY(0) + 14} textAnchor="middle">
              {tick}
            </text>
            <text x={scale.toX(0) - 6} y={scale.toY(tick) + 3} textAnchor="end">
              {tick}
            </text>
          </g>
        ))}
      <text x={PLANE_SIZE - PADDING - 4} y={scale.toY(0) - 6} textAnchor="end" fontSize={12} fontWeight={900} style={{ fill: 'var(--svg-text)' }}>
        x
      </text>
      <text x={scale.toX(0) + 6} y={PADDING + 12} fontSize={12} fontWeight={900} style={{ fill: 'var(--svg-text)' }}>
        y
      </text>
      <g clipPath="url(#plane-area)">{children}</g>
    </svg>
  )
}
