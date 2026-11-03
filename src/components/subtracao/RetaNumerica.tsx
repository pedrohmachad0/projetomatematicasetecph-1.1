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
  const H = 120 * k
  const pad = 24 * k
  const yLine = 60 * k
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

        {/* segmento distância */}
        <motion.line
          key={`seg-${minuendo}-${subtraendo}`}
          x1={scale(left)}
          x2={scale(right)}
          y1={yLine}
          y2={yLine}
          stroke={isDezena ? '#f59e0b' : '#2563eb'}
          strokeWidth={10 * k}
          strokeLinecap="round"
          opacity={0.9}
          initial={{ scaleX: 0.8, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.9 }}
          transition={{ duration: 0.4 }}
        />
        <text
          x={(scale(left) + scale(right)) / 2}
          y={yLine - 18 * k}
          textAnchor="middle"
          fontSize={12 * k}
          fontWeight={800}
          fill={isDezena ? '#b45309' : '#1d4ed8'}
        >
          dist. = {Math.abs(minuendo - subtraendo)}
        </text>

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

        {/* posições originais discretas */}
        <g opacity={0.35}>
          <circle cx={scale(origMinuendo)} cy={yLine + 36 * k} r={5 * k} fill="none" style={{ stroke: 'var(--svg-muted)' }} strokeWidth={1.5} strokeDasharray="3 3" />
          <text x={scale(origMinuendo)} y={yLine + 50 * k} textAnchor="middle" fontSize={9 * k} style={{ fill: 'var(--svg-muted)' }} fontWeight={600}>
            orig {origMinuendo}
          </text>
          <circle cx={scale(origSubtraendo)} cy={yLine + 36 * k} r={5 * k} fill="none" style={{ stroke: 'var(--svg-muted)' }} strokeWidth={1.5} strokeDasharray="3 3" />
          <text x={scale(origSubtraendo)} y={yLine + 50 * k} textAnchor="middle" fontSize={9 * k} style={{ fill: 'var(--svg-muted)' }} fontWeight={600}>
            orig {origSubtraendo}
          </text>
        </g>

        {/* subtraendo */}
        <g>
          <motion.g
            key={`sub-${subtraendo}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          >
            <circle
              cx={scale(subtraendo)}
              cy={yLine}
              r={12 * k}
              style={{ fill: isDezena ? '#fef3c7' : 'var(--svg-surface)' }}
              stroke={isDezena ? '#f59e0b' : '#7c3aed'}
              strokeWidth={3 * k}
            />
            <text
              x={scale(subtraendo)}
              y={yLine - 28 * k}
              textAnchor="middle"
              fontSize={10 * k}
              fontWeight={800}
              fill={isDezena ? '#b45309' : '#7c3aed'}
            >
              {subtraendo}
            </text>
            <text x={scale(subtraendo)} y={yLine + 4 * k} textAnchor="middle" fontSize={9 * k} fontWeight={900} fill={isDezena ? '#b45309' : '#7c3aed'}>
              S
            </text>
          </motion.g>
        </g>

        {/* minuendo */}
        <g>
          <motion.g
            key={`min-${minuendo}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <circle
              cx={scale(minuendo)}
              cy={yLine}
              r={12 * k}
              style={{ fill: 'var(--svg-surface)' }}
              stroke="#2563eb"
              strokeWidth={3 * k}
            />
            <text x={scale(minuendo)} y={yLine - 28 * k} textAnchor="middle" fontSize={10 * k} fontWeight={800} fill="#2563eb">
              {minuendo}
            </text>
            <text x={scale(minuendo)} y={yLine + 4 * k} textAnchor="middle" fontSize={9 * k} fontWeight={900} fill="#2563eb">
              M
            </text>
          </motion.g>
        </g>
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
          <span className="inline-flex items-center gap-1 hidden sm:inline-flex">
            <span className="w-3 h-3 rounded-full border border-slate-400 border-dashed" /> origem
          </span>
        </span>
        <span className="hidden sm:inline">maior →</span>
      </div>
    </div>
  )
}
