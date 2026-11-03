import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
import { educationLevelLabels, getContent, type SimulatorId } from '../data/mathContent'
import { getCategoryColor, simulatorIcons } from '../data/simulatorVisuals'
import TeacherGuidePanel from './TeacherGuidePanel'

interface Props {
  id: SimulatorId
  /** Texto que substitui a descrição do catálogo, quando a página precisa de mais detalhe. */
  children?: ReactNode
}

const symbols = ['π', '√', '÷', '×', 'x²', '∑', '△', '%', '∞', '=']

/**
 * Cabeçalho de cada simulador: faixa colorida com a cor da área, a missão
 * e os três passos de uso. Nome, etapa, ano e área vêm do catálogo.
 */
export default function SimulatorHeader({ id, children }: Props) {
  const content = getContent(id)
  const Icon = simulatorIcons[id]
  const color = getCategoryColor(content.category)

  return (
    <>
    <motion.header
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sim-hero relative mb-4 overflow-hidden rounded-3xl p-4 text-white shadow-lg sm:mb-7 sm:p-6 md:p-8"
      style={{ ['--accent' as string]: color }}
    >
      <div className="sim-hero-symbols" aria-hidden="true">
        {symbols.map((symbol, i) => (
          <span key={symbol} style={{ left: `${(i * 37 + 8) % 96}%`, top: `${(i * 53 + 10) % 85}%`, animationDelay: `${i * -1.7}s`, fontSize: `${1.2 + (i % 4) * 0.55}rem` }}>
            {symbol}
          </span>
        ))}
      </div>
      <div className="relative flex items-start gap-3 sm:gap-5">
        <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-inner ring-1 ring-white/30 sm:flex md:h-16 md:w-16" aria-hidden="true">
          <Icon size={30} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest text-white/80 sm:text-xs">
            {educationLevelLabels[content.educationLevel]} · {content.grade} · {content.category}
          </p>
          <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">{content.title}</h1>
          <p className="sim-hero-desc mt-1.5 line-clamp-3 max-w-3xl text-sm leading-relaxed text-white/90 sm:mt-2 sm:line-clamp-none sm:text-base md:text-lg">{children ?? content.description}</p>
        </div>
      </div>

      <div className="relative mt-3 rounded-2xl bg-black/15 p-3 ring-1 ring-white/20 backdrop-blur-sm sm:mt-5 sm:p-4">
        <p className="flex items-start gap-2 text-[13px] font-bold leading-snug text-white sm:text-base">
          <Target size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            <span className="mr-1 font-black uppercase tracking-wide text-amber-200">Missão:</span>
            {content.goal}
          </span>
        </p>
        <ol className="sim-hero-steps -mx-1 mt-2.5 flex snap-x gap-2 overflow-x-auto px-1 pb-0.5 sm:mx-0 sm:mt-3 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0" aria-label="Como usar">
          {content.steps.map((step, i) => (
            <li key={step} className="flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-xl bg-white/15 px-2.5 py-2 text-xs font-bold text-white sm:shrink sm:whitespace-normal sm:text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black" style={{ color, background: '#ffffff' }}>
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </motion.header>
    <TeacherGuidePanel id={id} />
    </>
  )
}
