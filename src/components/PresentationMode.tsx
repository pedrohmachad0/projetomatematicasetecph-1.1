import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eraser, EyeOff, Maximize2, Minimize2, Pen, Target, ZoomIn, ZoomOut } from 'lucide-react'
import { mathContents } from '../data/mathContent'
import { getCategoryColor } from '../data/simulatorVisuals'
import PenOverlay, { type PenColor } from './PenOverlay'

interface Props {
  children: ReactNode
  title: string
}

const ZOOMS = [1, 1.15, 1.3, 1.5]
const PEN_COLORS: PenColor[] = ['#dc2626', '#2563eb', '#16a34a', '#f59e0b']

/**
 * Moldura comum dos simuladores: barra com o link de volta ao catálogo e o
 * modo apresentação para projetor/TV, com tela cheia, zoom, caneta e a
 * opção de esconder os desafios.
 */
export default function PresentationMode({ children, title }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pen, setPen] = useState(false)
  const [penColor, setPenColor] = useState<PenColor>(PEN_COLORS[0])
  const [clearKey, setClearKey] = useState(0)
  const [hideChallenges, setHideChallenges] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setPen(false)
      }
    }
    // Se o professor sair da tela cheia pelo navegador, sai também do modo apresentação.
    function onFullscreen() {
      if (!document.fullscreenElement) {
        setIsOpen(false)
        setPen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('fullscreenchange', onFullscreen)
    }
  }, [])

  function toggle() {
    const next = !isOpen
    setIsOpen(next)
    setPen(false)
    try {
      if (next && !document.fullscreenElement) void document.documentElement.requestFullscreen?.()?.catch(() => undefined)
      if (!next && document.fullscreenElement) void document.exitFullscreen?.()?.catch(() => undefined)
    } catch {
      // Sem tela cheia (iPhone, por exemplo), o modo apresentação funciona igual.
    }
  }

  const zoomIndex = ZOOMS.indexOf(zoom)
  const tool = 'inline-flex min-h-[40px] min-w-[40px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40'

  // A cor da área do simulador colore botões, controles e o palco da página.
  const content = mathContents.find((item) => item.title === title)
  const accent = content ? getCategoryColor(content.category) : '#1d4ed8'

  return (
    <div
      className={`${isOpen ? 'sim-root presentation-surface fixed inset-0 z-50 min-h-screen overflow-y-auto bg-slate-50 p-3 sm:p-6 md:p-8' : 'sim-root relative'} ${isOpen && hideChallenges ? 'hide-challenges' : ''}`}
      style={{ ['--accent' as string]: accent }}
    >
      <div className="mx-auto max-w-6xl">
        <div className={`mb-3 flex min-h-[44px] flex-wrap items-center justify-between gap-2 sm:mb-4 ${isOpen ? 'sticky top-0 z-[60] rounded-2xl bg-slate-50/95 px-2 py-1.5 shadow-sm backdrop-blur' : ''}`}>
          {isOpen ? (
            <span className="truncate text-sm font-black text-slate-700">{title}</span>
          ) : (
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg text-sm font-bold text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <ArrowLeft size={16} className="shrink-0" /> Simuladores
            </Link>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            {isOpen && (
              <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Ferramentas de apresentação">
                <button type="button" className={tool} onClick={() => setZoom(ZOOMS[Math.max(0, zoomIndex - 1)])} disabled={zoomIndex <= 0} aria-label="Diminuir o zoom">
                  <ZoomOut size={17} />
                </button>
                <span className="min-w-[3rem] text-center font-mono text-xs font-black text-slate-600">{Math.round(zoom * 100)}%</span>
                <button type="button" className={tool} onClick={() => setZoom(ZOOMS[Math.min(ZOOMS.length - 1, zoomIndex + 1)])} disabled={zoomIndex >= ZOOMS.length - 1} aria-label="Aumentar o zoom">
                  <ZoomIn size={17} />
                </button>
                <button type="button" className={`${tool} ${pen ? '!border-transparent !bg-slate-900 !text-white' : ''}`} onClick={() => setPen((v) => !v)} aria-pressed={pen}>
                  <Pen size={16} /> Caneta
                </button>
                {pen &&
                  PEN_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setPenColor(c)} aria-label={`Cor da caneta ${c}`} aria-pressed={penColor === c} className={`h-8 w-8 rounded-full border-4 ${penColor === c ? 'border-slate-900' : 'border-white'} shadow`} style={{ background: c }} />
                  ))}
                <button type="button" className={tool} onClick={() => setClearKey((v) => v + 1)} aria-label="Apagar os riscos da caneta">
                  <Eraser size={16} />
                </button>
                <button type="button" className={`${tool} ${hideChallenges ? '!border-amber-300 !bg-amber-50 !text-amber-900' : ''}`} onClick={() => setHideChallenges((v) => !v)} aria-pressed={hideChallenges}>
                  {hideChallenges ? <EyeOff size={16} /> : <Target size={16} />} {hideChallenges ? 'Desafios ocultos' : 'Esconder desafios'}
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={toggle}
              aria-pressed={isOpen}
              aria-label={isOpen ? `Sair do modo de apresentação: ${title}` : `Ampliar ${title} para apresentação`}
              className="inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {isOpen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
              <span>{isOpen ? 'Sair da apresentação' : 'Modo apresentação'}</span>
            </button>
          </div>
        </div>
        <div style={isOpen && zoom !== 1 ? { zoom } : undefined}>{children}</div>
      </div>
      {isOpen && <PenOverlay active={pen} color={penColor} clearKey={clearKey} />}
    </div>
  )
}
