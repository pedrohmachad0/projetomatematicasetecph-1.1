import { useEffect, useState, type ReactNode } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'

interface Props {
  children: ReactNode
  title: string
}

export default function PresentationMode({ children, title }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div
      className={
        isOpen
          ? 'fixed inset-0 z-50 min-h-screen overflow-y-auto bg-slate-50 p-3 sm:p-6 md:p-8 presentation-surface'
          : 'relative'
      }
    >
      <div className={isOpen ? 'mx-auto max-w-7xl' : undefined}>
        <div className="mb-2 flex justify-end sm:mb-3">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            aria-pressed={isOpen}
            aria-label={isOpen ? `Sair do modo de apresentação: ${title}` : `Ampliar ${title} para apresentação`}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {isOpen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            <span>{isOpen ? 'Sair da apresentação' : 'Modo apresentação'}</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
