import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, RotateCcw } from 'lucide-react'

const MAX_HOURS = 7
const GOLDEN = Math.PI * (3 - Math.sqrt(5))
const spot = (i: number, total: number) => {
  // Com muitas bactérias, elas ficam mais juntinhas para caber na placa.
  const r = Math.min(12, 98 / Math.sqrt(total)) * Math.sqrt(i + 0.5)
  const a = i * GOLDEN
  return { x: 160 + r * Math.cos(a), y: 120 + r * Math.sin(a) }
}

/** Colônia em que cada bactéria se divide em duas a cada hora: 2ʰ bactérias. */
export default function Bacteria() {
  const [hours, setHours] = useState(0)
  const count = 2 ** hours
  const previous = hours > 0 ? 2 ** (hours - 1) : 1

  return (
    <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <svg viewBox="0 0 320 240" className="mx-auto block h-auto w-full max-w-[420px] rounded-2xl" style={{ background: 'radial-gradient(circle at 50% 50%, #ecfccb, #d9f99d 55%, #a3e635)' }} role="img" aria-label={`Placa com ${count} bactérias depois de ${hours} horas`}>
        <circle cx={160} cy={120} r={112} fill="none" stroke="#65a30d" strokeWidth={3} strokeDasharray="2 6" opacity={0.6} />
        {Array.from({ length: count }, (_, i) => {
          const to = spot(i, count)
          // Cada bactéria nova nasce da "mãe" e se afasta dela.
          const from = i >= previous ? spot(i - previous, count) : to
          const angle = (i * 47) % 180
          return (
            <motion.g key={`${hours}-${i}`} initial={{ x: from.x, y: from.y, scale: i >= previous ? 0.4 : 1 }} animate={{ x: to.x, y: to.y, scale: 1 }} transition={{ type: 'spring', stiffness: 140, damping: 14 }}>
              <g transform={`rotate(${angle}) scale(${count > 64 ? 0.75 : 1})`}>
                <ellipse rx={7} ry={4.5} fill="#16a34a" stroke="#14532d" strokeWidth={1.2} />
                <circle cx={2} cy={-1} r={1.6} fill="#bbf7d0" />
                <path d="M -7 0 q -4 2 -6 -1" fill="none" stroke="#14532d" strokeWidth={1} />
              </g>
            </motion.g>
          )
        })}
      </svg>
      <div className="space-y-3">
        <p className="text-sm font-semibold leading-relaxed text-slate-700">Cada bactéria se divide em duas a cada hora. Começando com 1, quantas existem depois de algumas horas?</p>
        <div className="rounded-2xl border border-lime-200 bg-lime-50 p-3 text-center" aria-live="polite">
          <p className="text-xs font-black uppercase tracking-widest text-lime-800">depois de {hours} hora{hours === 1 ? '' : 's'}</p>
          <p className="font-mono text-3xl font-black text-lime-900">
            2<sup>{hours}</sup> = {count}
          </p>
          <p className="mt-1 font-mono text-xs font-bold text-lime-800">{hours === 0 ? 'começamos com 1' : Array.from({ length: hours }, () => '2').join(' × ')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setHours((h) => Math.min(MAX_HOURS, h + 1))} disabled={hours >= MAX_HOURS} className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-black text-white shadow disabled:opacity-50">
            <Clock size={16} /> Passar 1 hora
          </button>
          <button type="button" onClick={() => setHours(0)} className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
            <RotateCcw size={15} /> Recomeçar
          </button>
        </div>
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold leading-relaxed text-slate-600">
          A pergunta ao contrário é um logaritmo: “em quantas horas teremos {count}?” → log₂ {count} = {hours}.
        </p>
      </div>
    </div>
  )
}
