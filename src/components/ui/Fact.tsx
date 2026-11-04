import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  label: string
  value: string
  detail?: string
  highlight?: boolean
}

/** Uma medida em destaque: o valor "pula" quando muda, para chamar o olhar. */
export default function Fact({ label, value, detail, highlight = false }: Props) {
  const reduceMotion = useReducedMotion()
  return (
    <div className={`rounded-xl border p-3 ${highlight ? 'sim-fact-highlight' : 'border-slate-200 bg-slate-50'}`}>
      <dt className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</dt>
      <motion.dd key={value} initial={reduceMotion ? false : { scale: 1.12, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }} className="origin-left break-words font-mono text-lg font-black text-slate-900 sm:text-xl">
        {value}
      </motion.dd>
      {detail && <dd className="text-xs leading-snug text-slate-600">{detail}</dd>}
    </div>
  )
}
