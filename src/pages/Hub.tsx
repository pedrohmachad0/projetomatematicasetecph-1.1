import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Triangle, Plus, Minus, Sparkles, MonitorSmartphone, Filter } from 'lucide-react'
import { mathContents } from '../data/mathContent'

const simulatorVisuals = {
  pitagoras: {
    icon: Triangle,
    color: '#1e40af',
    badge: 'GEOMETRIA · ÂNGULO LIVRE',
  },
  soma: {
    icon: Plus,
    color: '#2563eb',
    badge: 'ARITMÉTICA · COMPENSAÇÃO',
  },
  subtracao: {
    icon: Minus,
    color: '#7c3aed',
    badge: 'RETA NUMÉRICA · DESLOCAMENTO',
  },
} as const

type EducationFilter = 'todos' | 'fundamental-2' | 'medio'

export default function Hub() {
  const [educationFilter, setEducationFilter] = useState<EducationFilter>('todos')
  const [categoryFilter, setCategoryFilter] = useState('todas')

  const categories = useMemo(
    () => ['todas', ...new Set(mathContents.map((content) => content.category))],
    [],
  )

  const availableContents = useMemo(
    () =>
      mathContents.filter(
        (content) =>
          content.available &&
          content.simulator &&
          (educationFilter === 'todos' || content.educationLevel === educationFilter) &&
          (categoryFilter === 'todas' || content.category === categoryFilter),
      ),
    [educationFilter, categoryFilter],
  )

  return (
    <div className="overflow-x-hidden">
      <section className="mb-6 px-2 text-center sm:mb-10 sm:px-0">
        <div className="mb-4 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-blue-200 bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-800 sm:mb-6 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
          <Sparkles size={14} className="shrink-0 sm:h-4 sm:w-4" />
          <span className="text-center leading-tight">Plataforma Educacional PEMFM — Fundamental & Médio</span>
        </div>
        <h1 className="px-1 text-[1.85rem] font-black leading-[1.1] tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl sm:leading-tight">
          Simuladores <span className="text-blue-600">Matemáticos</span>
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>Interativos
        </h1>
        <p className="mx-auto max-w-3xl px-2 text-[15px] leading-relaxed text-slate-600 sm:px-4 sm:text-lg md:text-xl">
          Explore conceitos com interação, visualização em tempo real e feedback imediato. Projetado para sala de aula,
          projetor e TV — controles grandes, contraste alto e animações com propósito.
        </p>
        <div className="mt-3 inline-flex max-w-[95vw] items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 sm:mt-4 sm:max-w-none sm:px-3 sm:text-xs">
          <MonitorSmartphone size={12} className="shrink-0 sm:h-3.5 sm:w-3.5" />
          <span className="truncate">Responsivo · Desktop · Tablet · Projetor · TV</span>
        </div>
      </section>

      <section aria-labelledby="filters-title" className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Filter size={18} className="text-blue-600" />
          <h2 id="filters-title" className="text-sm font-black text-slate-900 sm:text-base">Explorar conteúdos</h2>
          <span className="ml-auto text-xs font-bold text-slate-500">{availableContents.length} disponível(is)</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-bold text-slate-600">
            Etapa de ensino
            <select
              value={educationFilter}
              onChange={(event) => setEducationFilter(event.target.value as EducationFilter)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="todos">Todas as etapas</option>
              <option value="fundamental-2">Fundamental II</option>
              <option value="medio">Ensino Médio</option>
            </select>
          </label>

          <label className="text-xs font-bold text-slate-600">
            Categoria
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'todas' ? 'Todas as categorias' : category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section aria-label="Simuladores disponíveis" className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
        {availableContents.map((content, index) => {
          const visual = content.simulator ? simulatorVisuals[content.simulator as keyof typeof simulatorVisuals] : null
          if (!visual) return null
          const Icon = visual.icon

          return (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="h-full"
            >
              <Link
                to={`/${content.simulator}`}
                id={`card-${content.id}`}
                aria-label={`Abrir ${content.title}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 touch-manipulation"
              >
                <div
                  className="relative flex h-28 shrink-0 flex-col items-center justify-center text-white sm:h-32"
                  style={{ background: `linear-gradient(135deg, ${visual.color} 0%, #3b82f6 100%)` }}
                >
                  <div className="rounded-xl border border-white/20 bg-white/15 p-2.5 sm:rounded-2xl sm:p-3">
                    <Icon size={28} className="sm:h-9 sm:w-9" />
                  </div>
                  <span className="mt-1.5 rounded-full border border-white/20 bg-white/20 px-2 py-0.5 text-center text-[10px] font-bold tracking-widest sm:mt-2 sm:px-2.5 sm:py-1 sm:text-[11px]">
                    {visual.badge}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4 sm:p-5 lg:p-6">
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">{content.grade}</span>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">{content.category}</span>
                  </div>
                  <h2 className="mb-1.5 text-[17px] font-black leading-tight text-slate-900 sm:text-[19px]">{content.title}</h2>
                  <p className="mb-3 flex-1 text-[13px] leading-relaxed text-slate-600 sm:mb-4 sm:text-[14px]">{content.description}</p>
                  <span className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-bold transition-all group-hover:gap-2.5 group-active:gap-1" style={{ color: visual.color }}>
                    Abrir simulador <span aria-hidden="true">→</span>
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </section>

      {availableContents.length === 0 && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <h2 className="text-lg font-black text-slate-900">Nenhum conteúdo encontrado</h2>
          <p className="mt-1 text-sm text-slate-600">Tente trocar os filtros para encontrar outro conteúdo.</p>
        </section>
      )}

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:mt-10 sm:p-6 md:p-7">
        <h2 className="mb-3 text-xs font-black tracking-widest text-slate-500 sm:mb-4 sm:text-sm">ESTRUTURA PREPARADA PARA EXPANSÃO</h2>
        <div className="grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-2 sm:gap-6">
          <div>
            <div className="text-sm font-bold text-slate-800">Fundamental II</div>
            <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
              {['6º ano', '7º ano', '8º ano', '9º ano'].map((grade) => (
                <span key={grade} className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold sm:px-2.5">{grade}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">Ensino Médio</div>
            <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
              {['1º ano', '2º ano', '3º ano'].map((grade) => (
                <span key={grade} className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 sm:px-2.5">{grade}</span>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
          O Hub agora lê os conteúdos disponíveis diretamente de <code className="break-all rounded bg-slate-100 px-1 py-0.5 text-slate-700">src/data/mathContent.ts</code>.
          Assim, novos simuladores podem entrar no catálogo sem duplicar informações na página.
        </p>
      </section>
    </div>
  )
}
