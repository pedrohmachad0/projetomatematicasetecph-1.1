import type { ReactNode } from 'react'
import { Lightbulb } from 'lucide-react'

export default function TipBox({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
      <Lightbulb className="mt-0.5 shrink-0 text-amber-600" size={20} aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
