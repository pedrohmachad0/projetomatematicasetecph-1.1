import type { ReactNode } from 'react'

interface Props {
  title?: string
  children: ReactNode
  className?: string
  /** Palco: o painel principal do desenho, com a cor do simulador. */
  stage?: boolean
}

export default function Panel({ title, children, className = '', stage = false }: Props) {
  return (
    <section className={`${stage ? 'sim-stage' : 'bg-white'} rounded-2xl border border-slate-200 p-4 shadow-sm sm:p-6 ${className}`}>
      {title && (
        <h2 className="mb-3 flex items-center gap-2 text-base font-black text-slate-900 sm:mb-4 sm:text-lg">
          <span className="sim-title-dot" aria-hidden="true" />
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}
