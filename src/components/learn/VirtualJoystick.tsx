import { useRef, useState, type PointerEvent } from 'react'
import { directionFrom, type Direction } from '../../logic/movement'

interface Props {
  onDirection: (direction: Direction | null) => void
}

const RADIUS = 40

/**
 * Joystick de toque: aparece onde o dedo encosta, o pino acompanha o arrasto
 * dentro do círculo e a direção é enviada enquanto o dedo estiver na tela.
 */
export default function VirtualJoystick({ onDirection }: Props) {
  const zone = useRef<HTMLDivElement>(null)
  const pointer = useRef<number | null>(null)
  const origin = useRef({ x: 0, y: 0 })
  const last = useRef<Direction | null>(null)
  const [stick, setStick] = useState<{ x: number; y: number; dx: number; dy: number } | null>(null)
  const [used, setUsed] = useState(false)

  function local(event: PointerEvent<HTMLDivElement>) {
    const rect = zone.current!.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  function emit(direction: Direction | null) {
    if (direction === last.current) return
    last.current = direction
    onDirection(direction)
  }

  function end() {
    pointer.current = null
    setStick(null)
    emit(null)
  }

  return (
    <div
      ref={zone}
      className="joystick-zone"
      aria-hidden="true"
      onPointerDown={(event) => {
        if (pointer.current !== null) return
        event.preventDefault()
        pointer.current = event.pointerId
        event.currentTarget.setPointerCapture?.(event.pointerId)
        origin.current = local(event)
        setUsed(true)
        setStick({ ...origin.current, dx: 0, dy: 0 })
      }}
      onPointerMove={(event) => {
        if (event.pointerId !== pointer.current) return
        const point = local(event)
        let dx = point.x - origin.current.x
        let dy = point.y - origin.current.y
        const length = Math.hypot(dx, dy)
        if (length > RADIUS) {
          dx = (dx / length) * RADIUS
          dy = (dy / length) * RADIUS
        }
        setStick({ ...origin.current, dx, dy })
        emit(directionFrom(dx, dy))
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      {stick ? (
        <span className="joystick-base" style={{ left: stick.x, top: stick.y }}>
          <span className="joystick-knob" style={{ transform: `translate(${stick.dx}px, ${stick.dy}px)` }} />
        </span>
      ) : (
        !used && <span className="joystick-hint">arraste para andar</span>
      )}
    </div>
  )
}
