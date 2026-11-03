import { useId } from 'react'

interface Props {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  format?: (value: number) => string
}

/** Controle numérico grande: botões − / + e controle deslizante, sempre dentro dos limites. */
export default function NumberControl({ label, value, min, max, step, onChange, format = String }: Props) {
  const id = useId()
  const decimals = (String(step).split('.')[1] ?? '').length
  const clamp = (next: number) => Math.min(max, Math.max(min, Number(next.toFixed(decimals))))

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-slate-700">
          {label}
        </label>
        <span className="min-w-[3rem] sim-value rounded-lg px-2 py-0.5 text-center font-mono text-base font-black" aria-live="polite">
          {format(value)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          aria-label={`Diminuir ${label}`}
          className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 bg-slate-50 font-mono text-lg font-black text-slate-700 transition hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(clamp(Number(event.target.value)))}
          className="sim-range h-2 w-full cursor-pointer"
          style={{ ['--fill' as string]: `${((value - min) / (max - min || 1)) * 100}%` }}
        />
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          aria-label={`Aumentar ${label}`}
          className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 bg-slate-50 font-mono text-lg font-black text-slate-700 transition hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  )
}
