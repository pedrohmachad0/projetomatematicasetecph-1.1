import { useEffect, useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'

export default function Layout() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <div className={`app-shell min-h-screen flex flex-col overflow-x-hidden selection:bg-blue-200 ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-blue-50 via-white to-blue-100'}`}>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 bg-white text-blue-800 px-3 py-1.5 rounded-lg border shadow text-sm font-medium"
      >
        Pular para conteúdo
      </a>

      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3.5 flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center bg-white/15 border border-white/10 shrink-0" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-6 sm:h-6">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <NavLink to="/" className="text-white font-black text-[15px] sm:text-[17px] md:text-lg leading-tight hover:text-blue-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded inline-block">
              Plataforma de Simuladores
            </NavLink>
            <p className="text-blue-200 text-[11px] sm:text-xs tracking-wide truncate">Matemáticos Interativos · PEMFM</p>
          </div>
          <nav aria-label="Navegação principal" className="order-3 flex w-full gap-1 pt-1 sm:order-2 sm:w-auto sm:pt-0">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `inline-flex min-h-[40px] flex-1 items-center justify-center rounded-lg px-3 text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex-none ${isActive ? 'bg-white text-blue-800 shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              Simuladores
            </NavLink>
            <NavLink
              to="/aprender"
              className={({ isActive }) => `inline-flex min-h-[40px] flex-1 items-center justify-center rounded-lg px-3 text-xs font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex-none ${isActive ? 'bg-white text-blue-800 shadow-sm' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              Aprender
            </NavLink>
          </nav>
          <button
            type="button"
            onClick={() => setIsDark((current) => !current)}
            aria-pressed={isDark}
            aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
            className="order-2 inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-2.5 py-2 text-xs font-bold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:order-3 sm:px-3"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{isDark ? 'Tema claro' : 'Tema escuro'}</span>
          </button>
        </div>
      </header>

      <main id="conteudo" className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-blue-100 py-3 sm:py-4 px-3">
        <p className="text-center text-xs sm:text-sm text-blue-400 leading-tight">Plataforma de Simuladores Matemáticos Interativos · PEMFM</p>
      </footer>
    </div>
  )
}
