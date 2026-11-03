import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Filter, X } from 'lucide-react'
import { educationLevelLabels, mathContents, type EducationLevel, type Grade } from '../data/mathContent'
import { getCategoryColor, simulatorIcons } from '../data/simulatorVisuals'

type EducationFilter = 'todos' | EducationLevel
type GradeFilter = 'todos' | Grade

const gradesByLevel: Record<EducationLevel, Grade[]> = {
  'fundamental-2': ['6º ano', '7º ano', '8º ano', '9º ano'],
  medio: ['1º ano', '2º ano', '3º ano'],
}

const selectClass =
  'mt-1.5 min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100'

export default function Hub() {
  const [educationFilter, setEducationFilter] = useState<EducationFilter>('todos')
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('todos')
  const [categoryFilter, setCategoryFilter] = useState('todas')

  const available = useMemo(() => mathContents.filter((content) => content.available && content.simulator), [])
  const categories = useMemo(() => [...new Set(available.map((content) => content.category))], [available])
  const visibleContents = available.filter(
    (content) =>
      (educationFilter === 'todos' || content.educationLevel === educationFilter) &&
      (gradeFilter === 'todos' || content.grade === gradeFilter) &&
      (categoryFilter === 'todas' || content.category === categoryFilter),
  )
  const hasFilter = educationFilter !== 'todos' || gradeFilter !== 'todos' || categoryFilter !== 'todas'

  function chooseGrade(level: EducationLevel, grade: Grade) {
    const isActive = gradeFilter === grade && educationFilter === level
    setEducationFilter(isActive ? 'todos' : level)
    setGradeFilter(isActive ? 'todos' : grade)
  }

  function clearFilters() {
    setEducationFilter('todos')
    setGradeFilter('todos')
    setCategoryFilter('todas')
  }

  return (
    <div className="overflow-x-hidden">
      <section className="mb-6 px-1 text-center sm:mb-9">
        <h1 className="text-[1.85rem] font-black leading-[1.1] tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl">
          Matemática para <span className="text-blue-600">explorar</span>
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-[15px] leading-relaxed text-slate-600 sm:mt-4 sm:text-lg md:text-xl">
          Escolha um simulador, mexa nos controles e veja o conceito acontecer, com cálculos em tempo real e feedback imediato. Feito para sala de aula, projetor e TV.
        </p>
      </section>

      <section aria-labelledby="filters-title" className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Filter size={18} className="text-blue-600" aria-hidden="true" />
          <h2 id="filters-title" className="text-sm font-black text-slate-900 sm:text-base">Explorar conteúdos</h2>
          <span className="ml-auto text-xs font-bold text-slate-500" aria-live="polite">
            {visibleContents.length} {visibleContents.length === 1 ? 'simulador' : 'simuladores'}
          </span>
          {hasFilter && (
            <button type="button" onClick={clearFilters} className="inline-flex min-h-[32px] items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
              <X size={13} /> Limpar
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-bold text-slate-600">
            Etapa de ensino
            <select
              value={educationFilter}
              onChange={(event) => {
                setEducationFilter(event.target.value as EducationFilter)
                setGradeFilter('todos')
              }}
              className={selectClass}
            >
              <option value="todos">Todas as etapas</option>
              <option value="fundamental-2">{educationLevelLabels['fundamental-2']}</option>
              <option value="medio">{educationLevelLabels.medio}</option>
            </select>
          </label>
          <label className="text-xs font-bold text-slate-600">
            Área da Matemática
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={selectClass}>
              <option value="todas">Todas as áreas</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(Object.keys(gradesByLevel) as EducationLevel[]).map((level) => (
            <div key={level}>
              <div className="text-xs font-bold text-slate-600">{educationLevelLabels[level]}</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {gradesByLevel[level].map((grade) => {
                  const count = available.filter((content) => content.educationLevel === level && content.grade === grade).length
                  const active = gradeFilter === grade && educationFilter === level
                  return (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => chooseGrade(level, grade)}
                      disabled={count === 0}
                      aria-pressed={active}
                      className={`min-h-[36px] rounded-full border px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 ${
                        active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {grade} <span className={active ? 'text-blue-100' : 'text-slate-400'}>· {count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Simuladores disponíveis" className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {visibleContents.map((content, index) => {
          if (!content.simulator) return null
          const Icon = simulatorIcons[content.simulator]
          const color = getCategoryColor(content.category)
          return (
            <motion.div key={content.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.35 }} className="h-full">
              <Link
                to={`/${content.simulator}`}
                id={`card-${content.id}`}
                aria-label={`Abrir ${content.title}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 active:scale-[0.98]"
                style={{ ['--accent' as string]: color }}
              >
                <div className="h-1.5 shrink-0" style={{ background: color }} aria-hidden="true" />
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-3 flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: color }} aria-hidden="true">
                      <Icon size={22} />
                    </span>
                    <div className="min-w-0">
                      <p className="accent-text text-[11px] font-black uppercase tracking-wide">{content.category}</p>
                      <p className="text-xs font-semibold text-slate-500">
                        {educationLevelLabels[content.educationLevel]} · {content.grade}
                      </p>
                    </div>
                  </div>
                  <h2 className="mb-1.5 text-[17px] font-black leading-tight text-slate-900 sm:text-[19px]">{content.title}</h2>
                  <p className="mb-3 flex-1 text-[13px] leading-relaxed text-slate-600 sm:text-[14px]">{content.description}</p>
                  <span className="accent-text inline-flex min-h-[36px] items-center gap-1.5 text-sm font-bold transition-all group-hover:gap-2.5">
                    Abrir simulador <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </section>

      {visibleContents.length === 0 && (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <h2 className="text-lg font-black text-slate-900">Nenhum simulador encontrado</h2>
          <p className="mt-1 text-sm text-slate-600">Ainda não há simuladores com esses filtros. Tente outra combinação.</p>
        </section>
      )}
    </div>
  )
}
