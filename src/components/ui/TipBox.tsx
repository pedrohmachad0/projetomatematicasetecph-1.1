import type { ReactNode } from 'react'
import { Lightbulb } from 'lucide-react'

/** "Você sabia?": a ideia principal do simulador, em linguagem do dia a dia. */
export default function TipBox({ children }: { children: ReactNode }) {
  return (
    <aside className="sim-tip relative mt-5 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 sm:p-5 sm:text-base">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-900 shadow-sm" aria-hidden="true">
          <Lightbulb size={22} />
        </span>
        <div>
          <p className="mb-0.5 text-[11px] font-black uppercase tracking-widest text-amber-700">Você sabia?</p>
          <div>{children}</div>
        </div>
      </div>
    </aside>
  )
}
