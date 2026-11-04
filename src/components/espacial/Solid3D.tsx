import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { Solid, SolidSize } from '../../logic/espacial'
import { solidMesh, type Mesh } from '../../logic/mesh3d'

interface Props {
  solid: Solid
  size: SolidSize
  color: string
  ghost?: Mesh | null
  spin: boolean
  label: string
}

const LIGHT = normalize([-0.4, 0.7, 0.6])

function normalize(v: number[]) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

function shadeColor(hex: string, k: number) {
  const n = Number.parseInt(hex.slice(1), 16)
  const ch = (s: number) => Math.round(((n >> s) & 255) * (0.45 + 0.55 * k))
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`
}

/** Desenha um sólido em 3D (projeção ortográfica) que gira ao arrastar. */
export default function Solid3D({ solid, size, color, ghost, spin, label }: Props) {
  const [yaw, setYaw] = useState(0.6)
  const [pitch, setPitch] = useState(0.45)
  const drag = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!spin) return
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      setYaw((value) => value + (now - last) * 0.0006)
      last = now
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [spin])

  const mesh = solidMesh(solid, size)
  const extent = Math.max(...[...mesh.vertices, ...(ghost?.vertices ?? [])].map((v) => Math.hypot(v[0], v[1], v[2])))
  const k = 125 / (extent || 1)
  const cy = Math.cos(yaw)
  const sy = Math.sin(yaw)
  const cp = Math.cos(pitch)
  const sp = Math.sin(pitch)
  const rotate = (v: number[]) => {
    const x = v[0] * cy + v[2] * sy
    const z0 = -v[0] * sy + v[2] * cy
    const y = v[1] * cp - z0 * sp
    const z = v[1] * sp + z0 * cp
    return [x, y, z]
  }
  const project = (v: number[]) => [160 + v[0] * k, 160 - v[1] * k]

  const rotated = mesh.vertices.map(rotate)
  const center = [0, 1, 2].map((axis) => rotated.reduce((sum, p) => sum + p[axis], 0) / rotated.length)
  // Sólidos convexos: desenha só as faces voltadas para quem olha (normal apontando para fora e para a frente).
  const faces = mesh.faces
    .map((face) => {
      const pts = face.map((i) => rotated[i])
      const mid = [0, 1, 2].map((axis) => pts.reduce((sum, p) => sum + p[axis], 0) / pts.length)
      const [a, b, c] = pts
      const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
      const w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
      let n = normalize([u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]])
      if (n[0] * (mid[0] - center[0]) + n[1] * (mid[1] - center[1]) + n[2] * (mid[2] - center[2]) < 0) n = n.map((v) => -v)
      const light = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2])
      return { pts, depth: mid[2], light, front: n[2] > -1e-6 }
    })
    .filter((face) => face.front)
    .sort((p, q) => p.depth - q.depth)

  const ghostEdges = ghost
    ? ghost.edges.map(([i, j]) => {
        const a = project(rotate(ghost.vertices[i]))
        const b = project(rotate(ghost.vertices[j]))
        return [a, b]
      })
    : []

  function onDown(event: ReactPointerEvent) {
    ;(event.currentTarget as Element).setPointerCapture?.(event.pointerId)
    drag.current = { x: event.clientX, y: event.clientY }
  }

  function onMove(event: ReactPointerEvent) {
    if (!drag.current) return
    const dx = event.clientX - drag.current.x
    const dy = event.clientY - drag.current.y
    drag.current = { x: event.clientX, y: event.clientY }
    setYaw((v) => v + dx * 0.01)
    setPitch((v) => Math.max(-1.3, Math.min(1.3, v + dy * 0.01)))
  }

  return (
    <svg viewBox="0 0 320 320" className="mx-auto block h-auto w-full max-w-[420px] cursor-grab select-none" style={{ touchAction: 'none' }} role="img" aria-label={label} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => (drag.current = null)} onPointerCancel={() => (drag.current = null)}>
      <ellipse cx={160} cy={300} rx={110} ry={10} style={{ fill: 'var(--svg-grid)' }} />
      {faces.map((f, i) => (
        <polygon key={i} points={f.pts.map((p) => project(p).map((c) => c.toFixed(1)).join(',')).join(' ')} fill={shadeColor(color, f.light)} fillOpacity={ghost ? 0.85 : 0.95} stroke={mesh.smooth ? shadeColor(color, f.light) : '#ffffff'} strokeWidth={mesh.smooth ? 0.6 : 1.5} strokeLinejoin="round" />
      ))}
      {ghostEdges.map(([a, b], i) => (
        <line key={`g${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} strokeWidth={2} strokeDasharray="5 4" style={{ stroke: 'var(--svg-ink)' }} />
      ))}
    </svg>
  )
}
