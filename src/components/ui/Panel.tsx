import type { ReactNode } from 'react'

interface Props {
  title?: string
  children: ReactNode
  className?: string
}

export default function Panel({ title, children, className = '' }: Props) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}>
      {title && <h2 className="mb-3 text-base font-black text-slate-900 sm:mb-4 sm:text-lg">{title}</h2>}
      {children}
    </section>
  )
}
