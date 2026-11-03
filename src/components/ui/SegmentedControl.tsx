import { useId } from 'react'
import { motion } from 'framer-motion'

interface Option<T extends string> {
  id: T
  label: string
}

interface Props<T extends string> {
  label: string
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
}

export default function SegmentedControl<T extends string>({ label, options, value, onChange }: Props<T>) {
  const id = useId()
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
      {options.map((option) => {
        const active = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`relative min-h-[44px] flex-1 rounded-xl px-3 text-sm font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${active ? 'text-white' : 'text-slate-600 hover:bg-white/70'}`}
          >
            {active && <motion.span layoutId={`seg-${id}`} className="sim-segment-pill absolute inset-0 rounded-xl" transition={{ type: 'spring', stiffness: 420, damping: 34 }} aria-hidden="true" />}
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
