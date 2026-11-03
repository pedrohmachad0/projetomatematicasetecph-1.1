import type { ReactNode } from 'react'
import { educationLevelLabels, getContent, type SimulatorId } from '../data/mathContent'
import { getCategoryColor, simulatorIcons } from '../data/simulatorVisuals'

interface Props {
  id: SimulatorId
  /** Texto que substitui a descrição do catálogo, quando a página precisa de mais detalhe. */
  children?: ReactNode
}

/** Cabeçalho padrão: nome, etapa, ano e área vêm do catálogo para nunca divergirem do Hub. */
export default function SimulatorHeader({ id, children }: Props) {
  const content = getContent(id)
  const Icon = simulatorIcons[id]
  const color = getCategoryColor(content.category)

  return (
    <header className="mb-5 flex items-start gap-3 sm:mb-7 sm:gap-4">
      <span
        className="mt-1 hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm sm:flex md:h-14 md:w-14"
        style={{ background: color }}
        aria-hidden="true"
      >
        <Icon size={26} />
      </span>
      <div className="min-w-0">
        <p className="accent-text text-[11px] font-black uppercase tracking-widest sm:text-xs" style={{ ['--accent' as string]: color }}>
          {educationLevelLabels[content.educationLevel]} · {content.grade} · {content.category}
        </p>
        <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl">
          {content.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base md:text-lg">
          {children ?? content.description}
        </p>
      </div>
    </header>
  )
}
