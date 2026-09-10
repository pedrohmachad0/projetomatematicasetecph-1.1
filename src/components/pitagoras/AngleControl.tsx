import { Minus, Plus } from 'lucide-react'

interface Props {
  angle: number
  min: number
  max: number
  step: number
  onChange: (next: number) => void
}

export default function AngleControl({ angle, min, max, step, onChange }: Props) {
  const canDec = angle > min
  const canInc = angle < max

  function updateAngle(value: string) {
    if (value === '') return
    const next = Number(value)
    if (!Number.isFinite(next)) return
    onChange(Math.min(max, Math.max(min, Math.round(next))))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium text-slate-600">Ângulo θ</span>
        <label className="flex items-center gap-1 text-2xl sm:text-3xl font-black text-slate-800" aria-label="Ângulo em graus">
          <input
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={angle}
            onChange={(event) => updateAngle(event.target.value)}
            className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-2xl font-black text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:w-24 sm:text-3xl"
            aria-label={`Ângulo entre ${min} e ${max} graus`}
          />
          <span aria-hidden="true">°</span>
        </label>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          aria-label="Diminuir ângulo em 10 graus"
          disabled={!canDec}
          onClick={() => canDec && onChange(angle - step)}
          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-3.5 rounded-xl font-bold text-base sm:text-lg bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-slate-800 transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none min-h-[48px] touch-manipulation"
        >
          <Minus size={18} className="sm:w-5 sm:h-5" /> −10°
        </button>
        <button
          aria-label="Aumentar ângulo em 10 graus"
          disabled={!canInc}
          onClick={() => canInc && onChange(angle + step)}
          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-3.5 rounded-xl font-bold text-base sm:text-lg bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none min-h-[48px] touch-manipulation"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" /> +10°
        </button>
      </div>

      <p className="text-[11px] text-slate-500">Digite qualquer valor inteiro entre {min}° e {max}°.</p>

      <div className="flex justify-between text-[11px] sm:text-xs text-slate-400 px-1">
        <span>{min}° mínimo</span>
        <span>{max}° máximo</span>
      </div>

      <div className="w-full h-2 sm:h-2.5 bg-slate-200 rounded-full overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
          style={{ width: `${((angle - min) / (max - min)) * 100}%` }}
        />
      </div>
    </div>
  )
}
