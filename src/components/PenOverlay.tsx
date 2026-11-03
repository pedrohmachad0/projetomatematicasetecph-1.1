import { useEffect, useRef } from 'react'

export type PenColor = '#dc2626' | '#2563eb' | '#16a34a' | '#f59e0b'

interface Stroke {
  color: string
  points: Array<[number, number]>
}

interface Props {
  /** Desenhando agora (captura o toque) ou só mostrando o que já foi riscado. */
  active: boolean
  color: PenColor
  /** Muda quando o professor pede para apagar tudo. */
  clearKey: number
}

function paint(el: HTMLCanvasElement | null, strokes: Stroke[]) {
  const ctx = el?.getContext('2d')
  if (!el || !ctx) return
  const dpr = window.devicePixelRatio || 1
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, el.width, el.height)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 5
  for (const s of strokes) {
    ctx.strokeStyle = s.color
    ctx.beginPath()
    s.points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
    ctx.stroke()
  }
}

/** Caneta do professor: risca por cima do simulador, como num quadro. */
export default function PenOverlay({ active, color, clearKey }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const strokes = useRef<Stroke[]>([])
  const current = useRef<Stroke | null>(null)

  const redraw = () => paint(canvas.current, strokes.current)

  useEffect(() => {
    function resize() {
      const el = canvas.current
      if (!el) return
      const dpr = window.devicePixelRatio || 1
      el.width = window.innerWidth * dpr
      el.height = window.innerHeight * dpr
      paint(el, strokes.current)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    strokes.current = []
    paint(canvas.current, strokes.current)
  }, [clearKey])

  return (
    <canvas
      ref={canvas}
      className="fixed inset-0 z-[55] h-screen w-screen"
      style={{ pointerEvents: active ? 'auto' : 'none', touchAction: active ? 'none' : 'auto', cursor: active ? 'crosshair' : 'default' }}
      aria-hidden="true"
      onPointerDown={(event) => {
        if (!active) return
        event.currentTarget.setPointerCapture(event.pointerId)
        current.current = { color, points: [[event.clientX, event.clientY]] }
        strokes.current.push(current.current)
      }}
      onPointerMove={(event) => {
        if (!current.current) return
        current.current.points.push([event.clientX, event.clientY])
        redraw()
      }}
      onPointerUp={() => (current.current = null)}
      onPointerCancel={() => (current.current = null)}
    />
  )
}
