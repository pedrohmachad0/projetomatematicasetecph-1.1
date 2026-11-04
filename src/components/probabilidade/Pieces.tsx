import { useEffect } from 'react'
import { motion, useAnimate, useReducedMotion } from 'framer-motion'
import { Crown } from 'lucide-react'

/** Moeda com duas faces que gira em 3D a cada lançamento (`spin` muda). */
export function Coin({ side, spin, size = 120 }: { side: number; spin: number; size?: number }) {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!scope.current) return
    const target = spin * 1800 + side * 180
    if (reduceMotion || spin === 0) {
      animate(scope.current, { rotateY: target }, { duration: 0 })
      return
    }
    animate(scope.current, { rotateY: target, y: [0, -size * 0.55, 0], scale: [1, 1.15, 1] }, { duration: 1, ease: 'easeOut' })
  }, [spin, side, animate, scope, reduceMotion, size])

  const face = (back: boolean) => ({
    width: size,
    height: size,
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
    transform: back ? 'rotateY(180deg)' : undefined,
  })

  return (
    <div style={{ perspective: 600, width: size, height: size }}>
      <div ref={scope} className="relative" style={{ width: size, height: size, transformStyle: 'preserve-3d' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full border-[6px] border-amber-500 shadow-[inset_0_-6px_0_rgba(0,0,0,0.15),0_8px_20px_-8px_rgba(0,0,0,0.45)]" style={{ ...face(false), background: 'radial-gradient(circle at 35% 30%, #fde68a, #f59e0b 60%, #b45309)' }}>
          <svg viewBox="0 0 60 60" width={size * 0.5} height={size * 0.5} aria-hidden="true">
            <circle cx={30} cy={30} r={22} fill="#fcd34d" stroke="#92400e" strokeWidth={3} />
            <circle cx={22} cy={26} r={3} fill="#92400e" />
            <circle cx={38} cy={26} r={3} fill="#92400e" />
            <path d="M 20 36 Q 30 45 40 36" fill="none" stroke="#92400e" strokeWidth={3} strokeLinecap="round" />
          </svg>
          <span className="text-xs font-black uppercase tracking-widest text-amber-900">Cara</span>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full border-[6px] border-slate-400 shadow-[inset_0_-6px_0_rgba(0,0,0,0.15)]" style={{ ...face(true), background: 'radial-gradient(circle at 35% 30%, #f8fafc, #cbd5e1 60%, #64748b)' }}>
          <Crown size={size * 0.38} className="text-slate-700" strokeWidth={2.5} aria-hidden="true" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-700">Coroa</span>
        </div>
      </div>
    </div>
  )
}

const PIPS: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]],
}

/** Face de um dado desenhada em SVG. */
export function DieFace({ value, size = 96, color = '#be123c' }: { value: number; size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={`die-${color.slice(1)}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <rect x={4} y={8} width={92} height={88} rx={20} fill="#94a3b8" />
      <rect x={4} y={4} width={92} height={88} rx={20} fill={`url(#die-${color.slice(1)})`} stroke="#cbd5e1" strokeWidth={2} />
      {PIPS[value]?.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y - 2} r={9} fill={value === 1 ? color : '#1e293b'} />
      ))}
    </svg>
  )
}

/** Dado que pula e gira enquanto `rolling` é verdadeiro. */
export function Die({ value, rolling, size = 96, delay = 0 }: { value: number; rolling: boolean; size?: number; delay?: number }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      animate={rolling && !reduceMotion ? { rotate: [0, 120, 240, 360], y: [0, -size * 0.6, 0, -size * 0.25, 0] } : { rotate: 0, y: 0 }}
      transition={rolling ? { duration: 0.8, delay, ease: 'easeOut' } : { type: 'spring', stiffness: 300, damping: 14 }}
      style={{ width: size, height: size }}
    >
      <DieFace value={value} size={size} />
    </motion.div>
  )
}
