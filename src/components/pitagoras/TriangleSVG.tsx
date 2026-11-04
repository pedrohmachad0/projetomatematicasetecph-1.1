import { motion } from 'framer-motion'
import type { Classification } from '../../logic/pitagoras'
import { getCorClassificacao } from '../../logic/pitagoras'
import { buildAngleMarker, buildExternalSquare, type Point } from '../../logic/triangleGeometry'

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

interface Props {
  angle: number
  sideA: number
  sideB: number
  sideC: number
  classification: Classification
  showAllAngles: boolean
  /** Progresso (0 a 1) da água passando de A² e B² para C². */
  pour?: number
}

export default function TriangleSVG({ angle, sideA, sideB, sideC, classification, showAllAngles, pour = 0 }: Props) {
  const color = getCorClassificacao(classification)
  const VISUAL_SIDE = 110

  const cx = 220
  const cy = 210

  const O: Point = { x: cx, y: cy }
  const A: Point = { x: O.x + VISUAL_SIDE, y: O.y }
  const rad = toRad(angle)
  const B: Point = {
    x: O.x + VISUAL_SIDE * Math.cos(rad),
    y: O.y - VISUAL_SIDE * Math.sin(rad),
  }

  const sqA = buildExternalSquare(O, A, B)
  const sqB = buildExternalSquare(O, B, A)
  const sqC = buildExternalSquare(A, B, O)

  const poly = (pts: Point[]) => pts.map((p) => `${p.x},${p.y}`).join(' ')
  const lerp = (p: Point, q: Point, t: number): Point => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t })
  // Água: preenche o quadrado a partir do lado colado no triângulo.
  const water = (sq: Point[], f: number) => (f <= 0 ? '' : poly([sq[0], sq[1], lerp(sq[1], sq[2], Math.min(1, f)), lerp(sq[0], sq[3], Math.min(1, f))]))
  const ratio = (sideA * sideA + sideB * sideB) / (sideC * sideC)
  const smallLevel = pour > 0 ? 1 - pour : 0
  const bigLevel = pour * ratio

  const apexMarker = buildAngleMarker(O, A, B, 28, 42)
  const baseEdgeLength = Math.hypot(A.x - B.x, A.y - B.y)
  const baseArcRadius = Math.min(22, Math.max(6, baseEdgeLength * 0.3))
  const baseLabelDistance = baseArcRadius + 14
  const baseMarkerA = buildAngleMarker(A, O, B, baseArcRadius, baseLabelDistance)
  const baseMarkerB = buildAngleMarker(B, O, A, baseArcRadius, baseLabelDistance)
  const baseAngle = (180 - angle) / 2
  const formattedBaseAngle = Number.isInteger(baseAngle) ? baseAngle.toString() : baseAngle.toFixed(1)

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        viewBox="0 0 440 380"
        width="100%"
        className="w-full max-w-[520px] h-auto max-h-[280px] sm:max-h-[360px] overflow-visible block"
        role="img"
        aria-label={`Triângulo com ângulo ${angle} graus, lados iguais ${sideA} e terceiro lado ${sideC}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <motion.polygon
          key={`sqA-${angle}`}
          points={poly(sqA)}
          style={{ fill: 'var(--svg-fill)', stroke: 'var(--svg-stroke)' }}
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
        />
        <motion.polygon
          key={`sqB-${angle}`}
          points={poly(sqB)}
          style={{ fill: 'var(--svg-fill)', stroke: 'var(--svg-stroke)' }}
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        />
        <motion.polygon
          key={`sqC-${angle}`}
          points={poly(sqC)}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          fill={`${color}22`}
          stroke={color}
          strokeWidth={3}
        />

        {pour > 0 && (
          <g>
            <polygon points={water(sqA, smallLevel)} fill="#38bdf8" fillOpacity={0.75} />
            <polygon points={water(sqB, smallLevel)} fill="#38bdf8" fillOpacity={0.75} />
            <polygon points={water(sqC, bigLevel)} fill="#0ea5e9" fillOpacity={0.6} />
            {bigLevel > 1.01 && <text x={(sqC[2].x + sqC[3].x) / 2} y={(sqC[2].y + sqC[3].y) / 2 - 10} textAnchor="middle" fontSize={13} fontWeight={900} fill="#0369a1">transbordou!</text>}
          </g>
        )}

        <motion.polygon
          key={`tri-${angle}`}
          points={`${O.x},${O.y} ${A.x},${A.y} ${B.x},${B.y}`}
          fill={`${color}18`}
          stroke={color}
          strokeWidth={3}
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />

        <path
          d={apexMarker.path}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <text
          x={apexMarker.label.x}
          y={apexMarker.label.y + 4}
          textAnchor="middle"
          fontSize={13}
          fontWeight={800}
          fill={color}
        >
          {angle}°
        </text>

        <text x={(O.x + A.x) / 2} y={O.y + 18} textAnchor="middle" fontSize={12} fontWeight={700} style={{ fill: 'var(--svg-text)' }}>
          {sideA}
        </text>
        <text
          x={(O.x + B.x) / 2 - 8}
          y={(O.y + B.y) / 2 - 8}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          style={{ fill: 'var(--svg-text)' }}
          transform={`rotate(${-angle / 2} ${(O.x + B.x) / 2} ${(O.y + B.y) / 2})`}
        >
          {sideB}
        </text>
        <text x={(A.x + B.x) / 2 + 6} y={(A.y + B.y) / 2 - 6} textAnchor="middle" fontSize={12} fontWeight={800} fill={color}>
          {sideC}
        </text>

        {showAllAngles && (
          <>
            <path d={baseMarkerA.path} fill="none" style={{ stroke: 'var(--svg-text)' }} strokeWidth={2} strokeLinecap="round" />
            <path d={baseMarkerB.path} fill="none" style={{ stroke: 'var(--svg-text)' }} strokeWidth={2} strokeLinecap="round" />
            <text x={baseMarkerA.label.x} y={baseMarkerA.label.y + 4} textAnchor="middle" fontSize={12} fontWeight={800} style={{ fill: 'var(--svg-text)' }}>
              {formattedBaseAngle}°
            </text>
            <text x={baseMarkerB.label.x} y={baseMarkerB.label.y + 4} textAnchor="middle" fontSize={12} fontWeight={800} style={{ fill: 'var(--svg-text)' }}>
              {formattedBaseAngle}°
            </text>
          </>
        )}

        <text x={(sqA[0].x + sqA[2].x) / 2} y={(sqA[0].y + sqA[2].y) / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
          {sideA * sideA}
        </text>
        <text x={(sqB[0].x + sqB[2].x) / 2} y={(sqB[0].y + sqB[2].y) / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
          {sideB * sideB}
        </text>
        <text x={(sqC[0].x + sqC[2].x) / 2} y={(sqC[0].y + sqC[2].y) / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={900} fill={color}>
          {(sideC * sideC).toFixed(0)}
        </text>
      </svg>

      {showAllAngles && (
        <p className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-center font-mono text-xs font-bold text-blue-800 sm:text-sm">
          {angle}° + {formattedBaseAngle}° + {formattedBaseAngle}° = 180°
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-2 sm:mt-1 text-[10px] sm:text-[11px] text-slate-500 px-2 text-center">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-slate-200 border border-slate-300 shrink-0" /> Quadrados fixos (A², B²)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm border-2 shrink-0" style={{ background: `${color}22`, borderColor: color }} /> Quadrado dinâmico (C²)
        </span>
      </div>
    </div>
  )
}
