import type { Classification } from '../../logic/pitagoras'
import { getCorClassificacao, getTextoClassificacao } from '../../logic/pitagoras'

interface Props {
  classification: Classification
}

export default function ClassificationMessage({ classification }: Props) {
  const color = getCorClassificacao(classification)
  const texto = getTextoClassificacao(classification)

  return (
    <div
      className="rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 border-2"
      style={{ background: `${color}14`, borderColor: `${color}40`, color }}
      role="status"
      aria-live="polite"
    >
      <span
        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shrink-0 border-2 border-white shadow"
        style={{ background: color }}
        aria-hidden="true"
      />
      <span className="font-black tracking-wide text-xs sm:text-sm md:text-base leading-tight">{texto}</span>
    </div>
  )
}
