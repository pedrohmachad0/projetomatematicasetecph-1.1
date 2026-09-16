import { CheckCircle2, LockKeyhole, Play, Star } from 'lucide-react'
import { type LearningLevel } from '../../data/learningPath'

interface LevelMapProps {
  levels: LearningLevel[]
  completedLevelIds: string[]
  onStartLevel: (level: LearningLevel) => void
}

export default function LevelMap({ levels, completedLevelIds, onStartLevel }: LevelMapProps) {
  return (
    <section aria-labelledby="levels-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-black tracking-[0.2em] text-violet-700">JORNADA DE APRENDIZAGEM</p>
          <h2 id="levels-title" className="text-2xl font-black text-slate-900 sm:text-3xl">Escolha sua próxima missão</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">Avance passo a passo, pratique os fundamentos e desbloqueie novos desafios.</p>
        </div>
        <p className="rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
          <Star className="mr-1 inline text-amber-500" size={16} fill="currentColor" aria-hidden="true" /> {completedLevelIds.length}/{levels.length} níveis concluídos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {levels.map((level, index) => {
          const isCompleted = completedLevelIds.includes(level.id)
          const previousLevel = levels[index - 1]
          const isUnlocked = index === 0 || (previousLevel ? completedLevelIds.includes(previousLevel.id) : false)

          return (
            <article
              key={level.id}
              className={`relative flex min-w-0 flex-col overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${
                isUnlocked ? 'border-slate-200' : 'border-slate-200 opacity-65'
              }`}
              aria-label={`Nível ${level.order}: ${level.title}${isCompleted ? ', concluído' : !isUnlocked ? ', bloqueado' : ''}`}
            >
              <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: level.color }} />
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-2xl" aria-hidden="true">{level.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-black tracking-widest text-slate-500">NÍVEL {level.order}</p>
                    <h3 className="truncate text-xl font-black text-slate-900">{level.title}</h3>
                  </div>
                </div>
                {isCompleted ? <CheckCircle2 className="shrink-0 text-emerald-600" aria-label="Nível concluído" /> : !isUnlocked ? <LockKeyhole className="shrink-0 text-slate-400" aria-label="Nível bloqueado" /> : null}
              </div>

              <p className="mb-1 text-sm font-bold" style={{ color: level.color }}>{level.subtitle}</p>
              <p className="mb-5 min-h-[40px] flex-1 text-sm leading-relaxed text-slate-600">{level.objective}</p>

              {isUnlocked ? (
                <button
                  type="button"
                  onClick={() => onStartLevel(level)}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black text-white shadow-sm transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300"
                  style={{ backgroundColor: level.color }}
                >
                  <Play size={17} fill="currentColor" aria-hidden="true" /> {isCompleted ? 'Praticar novamente' : 'Começar nível'}
                </button>
              ) : (
                <p className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-500">Conclua o nível anterior</p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
