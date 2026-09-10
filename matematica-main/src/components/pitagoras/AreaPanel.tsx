import type { Classification, ComparisonSymbol } from '../../logic/pitagoras'
import { getCorClassificacao } from '../../logic/pitagoras'

interface Props {
  sideA: number
  sideB: number
  sideC: number
  areaA: number
  areaB: number
  areaC: number
  sumAB: number
  comparison: ComparisonSymbol
  classification: Classification
}

export default function AreaPanel({
  areaA,
  areaB,
  areaC,
  sumAB,
  comparison,
  classification,
}: Props) {
  const color = getCorClassificacao(classification)
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl p-2 sm:p-3 text-center bg-slate-50 border border-slate-200">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wide">A²</div>
          <div className="text-lg sm:text-xl font-black text-slate-700">{areaA}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-400">lado A</div>
        </div>
        <div className="rounded-xl p-2 sm:p-3 text-center bg-slate-50 border border-slate-200">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 tracking-wide">B²</div>
          <div className="text-lg sm:text-xl font-black text-slate-700">{areaB}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-400">lado B</div>
        </div>
        <div
          className="rounded-xl p-2 sm:p-3 text-center border-2"
          style={{ background: `${color}12`, borderColor: `${color}55` }}
        >
          <div className="text-[11px] sm:text-xs font-semibold tracking-wide" style={{ color }}>
            C²
          </div>
          <div className="text-lg sm:text-xl font-black" style={{ color }}>
            {areaC}
          </div>
          <div className="text-[10px] sm:text-[11px] opacity-70" style={{ color }}>
            lado C
          </div>
        </div>
      </div>

      <div
        className="rounded-xl p-3 sm:p-4 text-center font-mono font-bold text-base sm:text-lg border-2"
        style={{ background: `${color}10`, borderColor: color, color: '#1e293b' }}
        aria-live="polite"
      >
        <span className="text-slate-500 text-sm sm:text-base">
          {areaA} + {areaB}
        </span>{' '}
        <span className="text-xl sm:text-2xl mx-1" style={{ color }}>
          {comparison}
        </span>{' '}
        <span style={{ color }} className="text-sm sm:text-base">{areaC}</span>
        <div className="font-sans font-semibold text-[11px] sm:text-xs mt-1 tracking-wide" style={{ color }}>
          A² + B² {comparison} C² {comparison === '=' ? '· Teorema de Pitágoras' : ''}
        </div>
        <div className="font-sans font-normal text-xs sm:text-sm mt-1 text-slate-600">
          {sumAB} {comparison} {areaC}
        </div>
      </div>
    </div>
  )
}
