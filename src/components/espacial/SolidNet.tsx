import { motion } from 'framer-motion'
import type { Solid, SolidSize } from '../../logic/espacial'
import { shade } from '../../logic/color'

interface Face {
  kind: 'rect' | 'circle' | 'poly' | 'sector'
  /** rect: x, y, w, h · circle: cx, cy, r · poly: pontos · sector: cx, cy, r, a0, a1 */
  v: number[]
  label: string
}

const br = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

function facesOf(solid: Solid, { a, b, h, r }: SolidSize): { faces: Face[]; w: number; hgt: number } | null {
  if (solid === 'cubo') {
    const cells = [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]]
    return { faces: cells.map(([cx, cy]) => ({ kind: 'rect', v: [cx * a, cy * a, a, a], label: br(a * a) })), w: 4 * a, hgt: 3 * a }
  }
  if (solid === 'paralelepipedo') {
    const faces: Face[] = [
      { kind: 'rect', v: [0, b, b, h], label: br(b * h) },
      { kind: 'rect', v: [b, b, a, h], label: br(a * h) },
      { kind: 'rect', v: [a + b, b, b, h], label: br(b * h) },
      { kind: 'rect', v: [a + 2 * b, b, a, h], label: br(a * h) },
      { kind: 'rect', v: [b, 0, a, b], label: br(a * b) },
      { kind: 'rect', v: [b, b + h, a, b], label: br(a * b) },
    ]
    return { faces, w: 2 * a + 2 * b, hgt: h + 2 * b }
  }
  if (solid === 'cilindro') {
    const L = 2 * Math.PI * r
    return {
      faces: [
        { kind: 'rect', v: [0, 2 * r, L, h], label: `${br(L * h)} (lateral)` },
        { kind: 'circle', v: [L / 2, r, r], label: br(Math.PI * r * r) },
        { kind: 'circle', v: [L / 2, 3 * r + h, r], label: br(Math.PI * r * r) },
      ],
      w: L,
      hgt: 4 * r + h,
    }
  }
  if (solid === 'cone') {
    const g = Math.hypot(r, h)
    const theta = (2 * Math.PI * r) / g
    const a0 = Math.PI / 2 - theta / 2
    const width = theta >= Math.PI ? 2 * g : 2 * g * Math.sin(theta / 2)
    return {
      faces: [
        { kind: 'sector', v: [width / 2, 0, g, a0, a0 + theta], label: `${br(Math.PI * r * g)} (lateral)` },
        { kind: 'circle', v: [width / 2, g + r, r], label: br(Math.PI * r * r) },
      ],
      w: width,
      hgt: g + 2 * r,
    }
  }
  if (solid === 'piramide') {
    const ha = Math.hypot(h, a / 2)
    const o = ha
    const tri = (pts: number[]): Face => ({ kind: 'poly', v: pts, label: br((a * ha) / 2) })
    return {
      faces: [
        { kind: 'rect', v: [o, o, a, a], label: br(a * a) },
        tri([o, o, o + a, o, o + a / 2, 0]),
        tri([o, o + a, o + a, o + a, o + a / 2, 2 * o + a]),
        tri([o, o, o, o + a, 0, o + a / 2]),
        tri([o + a, o, o + a, o + a, 2 * o + a, o + a / 2]),
      ],
      w: 2 * o + a,
      hgt: 2 * o + a,
    }
  }
  return null
}

/** Planificação do sólido: as faces "abertas" no plano, com a área de cada uma. */
export default function SolidNet({ solid, size, color }: { solid: Solid; size: SolidSize; color: string }) {
  const net = facesOf(solid, size)
  if (!net) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 p-6 text-center">
        <svg viewBox="0 0 120 120" width={120} aria-hidden="true">
          <circle cx={60} cy={60} r={46} fill={color} opacity={0.85} />
          <path d="M 18 60 Q 60 82 102 60" fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.7} />
          <path d="M 60 14 Q 38 60 60 106" fill="none" stroke="#ffffff" strokeWidth={3} opacity={0.7} />
        </svg>
        <p className="max-w-sm text-sm font-semibold text-slate-700">A esfera não pode ser planificada sem rasgar ou esticar. É por isso que todo mapa-múndi distorce o tamanho dos países!</p>
      </div>
    )
  }
  const W = 360
  const H = 300
  const k = Math.min((W - 20) / net.w, (H - 20) / net.hgt)
  const ox = (W - net.w * k) / 2
  const oy = (H - net.hgt * k) / 2
  const X = (v: number) => ox + v * k
  const Y = (v: number) => oy + v * k

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[420px]" role="img" aria-label={`Planificação: ${net.faces.length} faces`}>
      {net.faces.map((f, i) => {
        const fill = i % 2 ? shade(color, -0.25) : color
        let el = null
        let cx = 0
        let cy = 0
        if (f.kind === 'rect') {
          const [x, y, w, h] = f.v
          el = <rect x={X(x)} y={Y(y)} width={w * k} height={h * k} fill={fill} stroke="#ffffff" strokeWidth={2} />
          cx = X(x + w / 2)
          cy = Y(y + h / 2)
        } else if (f.kind === 'circle') {
          const [x, y, r] = f.v
          el = <circle cx={X(x)} cy={Y(y)} r={r * k} fill={fill} stroke="#ffffff" strokeWidth={2} />
          cx = X(x)
          cy = Y(y)
        } else if (f.kind === 'poly') {
          const pts = []
          for (let j = 0; j < f.v.length; j += 2) pts.push(`${X(f.v[j])},${Y(f.v[j + 1])}`)
          el = <polygon points={pts.join(' ')} fill={fill} stroke="#ffffff" strokeWidth={2} strokeLinejoin="round" />
          cx = X((f.v[0] + f.v[2] + f.v[4]) / 3)
          cy = Y((f.v[1] + f.v[3] + f.v[5]) / 3)
        } else {
          const [x, y, g, a0, a1] = f.v
          const p0 = { x: X(x + g * Math.cos(a0)), y: Y(y + g * Math.sin(a0)) }
          const p1 = { x: X(x + g * Math.cos(a1)), y: Y(y + g * Math.sin(a1)) }
          el = <path d={`M ${X(x)} ${Y(y)} L ${p0.x} ${p0.y} A ${g * k} ${g * k} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p1.x} ${p1.y} Z`} fill={fill} stroke="#ffffff" strokeWidth={2} />
          cx = X(x)
          cy = Y(y + g * 0.6)
        }
        return (
          <motion.g key={`${solid}-${i}`} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.12, type: 'spring', stiffness: 220, damping: 18 }} style={{ originX: `${cx}px`, originY: `${cy}px`, transformBox: 'view-box' }}>
            {el}
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fontWeight={900} fill="#ffffff" style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.25)', strokeWidth: 3 }}>
              {f.label}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}
