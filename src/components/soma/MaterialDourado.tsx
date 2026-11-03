import { motion, AnimatePresence } from 'framer-motion'
import { getBarrasECubos } from '../../logic/adicao'
import { shade } from '../../logic/color'

interface Props {
  valor: number
  label: string
  destacado: boolean
  cor: string
}

const S = 13 // lado de um cubinho
const D = 6 // profundidade da face lateral (efeito 3D)

/** Cubinho de unidade em perspectiva. */
export function UnitCube({ cor, size = S }: { cor: string; size?: number }) {
  const d = size * 0.46
  return (
    <svg width={size + d + 2} height={size + d + 2} viewBox={`-1 -1 ${size + d + 2} ${size + d + 2}`} aria-hidden="true">
      <polygon points={`0,${d} ${d},0 ${size + d},0 ${size},${d}`} fill={shade(cor, -0.35)} />
      <polygon points={`${size},${d} ${size + d},0 ${size + d},${size} ${size},${size + d}`} fill={shade(cor, 0.25)} />
      <rect x={0} y={d} width={size} height={size} fill={cor} />
      <rect x={1.5} y={d + 1.5} width={size - 3} height={size - 3} fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={1} />
    </svg>
  )
}

/** Barra de dezena: 10 cubinhos grudados, em pé. */
function TenRod({ cor }: { cor: string }) {
  const h = S * 10
  return (
    <svg width={S + D + 2} height={h + D + 2} viewBox={`-1 -1 ${S + D + 2} ${h + D + 2}`} aria-hidden="true">
      <polygon points={`0,${D} ${D},0 ${S + D},0 ${S},${D}`} fill={shade(cor, -0.35)} />
      <polygon points={`${S},${D} ${S + D},0 ${S + D},${h} ${S},${h + D}`} fill={shade(cor, 0.25)} />
      <rect x={0} y={D} width={S} height={h} fill={cor} />
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={0} x2={S} y1={D + (i + 1) * S} y2={D + (i + 1) * S} stroke="#ffffff" strokeOpacity={0.55} strokeWidth={1} />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`s${i}`} x1={S} x2={S + D} y1={D + (i + 1) * S} y2={(i + 1) * S} stroke="#000000" strokeOpacity={0.15} strokeWidth={1} />
      ))}
    </svg>
  )
}

export default function MaterialDourado({ valor, label, destacado, cor }: Props) {
  const { dezenas, unidades } = getBarrasECubos(valor)

  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all sm:gap-3 sm:p-4 ${destacado ? 'shadow-lg' : 'shadow-sm'}`}
      style={{
        background: destacado ? `color-mix(in srgb, ${cor} 8%, var(--surface-card))` : 'var(--surface-card)',
        borderColor: destacado ? cor : 'var(--svg-stroke)',
      }}
      aria-label={`${label}: ${valor} — ${dezenas} dezenas e ${unidades} unidades`}
    >
      <div className="flex items-baseline gap-1.5 sm:gap-2">
        <span className="text-[11px] font-bold tracking-widest text-slate-500 sm:text-xs">{label}</span>
        <motion.span key={valor} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className={`text-3xl font-black sm:text-4xl ${destacado ? '' : 'text-slate-800'}`} style={destacado ? { color: cor } : undefined}>
          {valor}
        </motion.span>
      </div>

      <AnimatePresence>
        {destacado && (
          <motion.div initial={{ scale: 0, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} className="rounded-full px-3 py-1 text-center text-[11px] font-black leading-tight text-white sm:text-xs" style={{ background: cor }}>
            ★ DEZENA EXATA
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-[160px] w-full flex-wrap items-end justify-center gap-x-4 gap-y-3">
        {dezenas > 0 && (
          <div className="flex flex-wrap items-end justify-center gap-1">
            <AnimatePresence>
              {Array.from({ length: dezenas }, (_, i) => (
                <motion.div
                  key={`bar-${i}`}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  exit={{ scaleY: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  style={{ originY: 1 }}
                >
                  <TenRod cor={cor} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-5">
          <AnimatePresence>
            {Array.from({ length: unidades }, (_, i) => (
              <motion.div
                key={`cube-${i}`}
                initial={{ scale: 0, y: -24, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 16 }}
              >
                <UnitCube cor={cor} size={16} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {valor === 0 && <span className="text-xs text-slate-400">zero</span>}
      </div>

      <div className="flex gap-2 text-[11px] font-bold sm:text-xs">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
          {dezenas} dezena{dezenas !== 1 ? 's' : ''}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
          {unidades} unidade{unidades !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
