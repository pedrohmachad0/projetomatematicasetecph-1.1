import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  minuendo: number
  subtraendo: number
  origMinuendo: number
  origSubtraendo: number
  isDezena: boolean
}

export default function RetaNumerica({ minuendo, subtraendo, origMinuendo, origSubtraendo, isDezena }: Props) {
  const margem = 6
  const minVal = Math.min(minuendo, subtraendo, origMinuendo, origSubtraendo) - margem
  const maxVal = Math.max(minuendo, subtraendo, origMinuendo, origSubtraendo) + margem
  const min = Math.max(0, Math.floor(minVal))
  const max = Math.ceil(maxVal)
  const span = Math.max(1, max - min)

  // No celular a reta fica mais curta e os números, maiores, para caber sem rolar.
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(max-width: 640px)').matches)
  useEffect(() => {
    const query = window.matchMedia?.('(max-width: 640px)')
    if (!query) return
    const update = () => setCompact(query.matches)
    query.addEventListener?.('change', update)
    return () => query.removeEventListener?.('change', update)
  }, [])
  const k = compact ? 1.75 : 1
  const W = compact ? 460 : 800
  const H = 150 * k
  const pad = 24 * k
  const yLine = 78 * k
  const scale = (x: number) => pad + ((x - min) / span) * (W - pad * 2)

  const left = Math.min(minuendo, subtraendo)
  const right = Math.max(minuendo, subtraendo)

  const ticks: number[] = []
  for (let v = min; v <= max; v++) ticks.push(v)

  return (
    <div className="w-full pb-1 -mb-1 touch-manipulation">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block h-auto" role="img" aria-label={`Reta numérica de ${min} a ${max}, minuendo ${minuendo}, subtraendo ${subtraendo}`}>
        {/* linha base */}
        <line x1={pad} x2={W - pad} y1={yLine} y2={yLine} stroke="#cbd5e1" strokeWidth={3} strokeLinecap="round" />

        {/* trena: a distância entre os dois números */}
        <defs>
          <pattern id="tape-ticks" width={(W - pad * 2) / span} height={10} patternUnits="userSpaceOnUse" x={pad}>
            <rect width={1.5} height={6 * k} fill="#92400e" opacity={0.55} />
          </pattern>
        </defs>
        <motion.rect initial={false} animate={{ x: scale(left), width: Math.max(0, scale(right) - scale(left)) }} transition={{ type: 'spring', stiffness: 180, damping: 22 }} y={yLine - 9 * k} height={18 * k} rx={4 * k} fill={isDezena ? '#fbbf24' : '#fde047'} stroke="#ca8a04" strokeWidth={1.5} />
        <motion.rect initial={false} animate={{ x: scale(left), width: Math.max(0, scale(right) - scale(left)) }} transition={{ type: 'spring', stiffness: 180, damping: 22 }} y={yLine - 9 * k} height={18 * k} fill="url(#tape-ticks)" />
        <motion.g initial={false} animate={{ x: (scale(left) + scale(right)) / 2 }} transition={{ type: 'spring', stiffness: 180, damping: 22 }}>
          <rect x={-46 * k} y={yLine + 38 * k} width={92 * k} height={22 * k} rx={11 * k} fill={isDezena ? '#b45309' : '#1d4ed8'} />
          <text y={yLine + 53 * k} textAnchor="middle" fontSize={12 * k} fontWeight={900} fill="#ffffff">
            diferença {Math.abs(minuendo - subtraendo)}
          </text>
        </motion.g>

        {/* ticks */}
        {ticks.map((v) => {
          const isMajor = v % 5 === 0
          const isTen = v % 10 === 0
          return (
            <g key={v}>
              <line
                x1={scale(v)}
                x2={scale(v)}
                y1={yLine - (isMajor ? 14 : 7) * k}
                y2={yLine + (isMajor ? 14 : 7) * k}
                style={{ stroke: isTen ? 'var(--svg-ink)' : 'var(--svg-axis)' }}
                strokeWidth={isTen ? 2 : 1.2}
              />
              {isMajor && (
                <text
                  x={scale(v)}
                  y={yLine + 28 * k}
                  textAnchor="middle"
                  fontSize={(isTen ? 11 : 10) * k}
                  fontWeight={isTen ? 800 : 600}
                  style={{ fill: isTen ? 'var(--svg-ink)' : 'var(--svg-text)' }}
                >
                  {v}
                </text>
              )}
              {isTen && <circle cx={scale(v)} cy={yLine} r={2.5 * k} style={{ fill: 'var(--svg-ink)' }} opacity={0.15} />}
            </g>
          )
        })}

        {[
          { v: subtraendo, letter: 'S', color: isDezena ? '#b45309' : '#7c3aed', fill: isDezena ? '#fef3c7' : '#ede9fe' },
          { v: minuendo, letter: 'M', color: '#2563eb', fill: '#dbeafe' },
        ].map((pin) => (
          <motion.g key={pin.letter} initial={false} animate={{ x: scale(pin.v) }} transition={{ type: 'spring', stiffness: 220, damping: 20 }}>
            <line x1={0} x2={0} y1={yLine + 4} y2={yLine - 22 * k} stroke={pin.color} strokeWidth={3 * k} strokeLinecap="round" />
            <circle cx={0} cy={yLine + 2} r={4 * k} fill={pin.color} />
            <circle cx={0} cy={yLine - 38 * k} r={17 * k} fill={pin.fill} stroke={pin.color} strokeWidth={3 * k} />
            <text y={yLine - 33 * k} textAnchor="middle" fontSize={15 * k} fontWeight={900} fill={pin.color}>
              {pin.v}
            </text>
            <text y={yLine - 62 * k} textAnchor="middle" fontSize={10 * k} fontWeight={900} fill={pin.color}>
              {pin.letter === 'M' ? 'minuendo' : 'subtraendo'}
            </text>
          </motion.g>
        ))}
      </svg>

      <div className="flex flex-wrap justify-between sm:justify-between gap-1 sm:gap-2 text-[10px] sm:text-[11px] text-slate-500 px-1 -mt-1">
        <span className="hidden sm:inline">← menor</span>
        <span className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center flex-1 sm:flex-none">
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-blue-600 bg-white" /> minuendo
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2" style={{ borderColor: isDezena ? '#f59e0b' : '#7c3aed', background: isDezena ? '#fef3c7' : 'white' }} /> subtraendo
          </span>
        </span>
        <span className="hidden sm:inline">maior →</span>
      </div>
    </div>
  )
}
