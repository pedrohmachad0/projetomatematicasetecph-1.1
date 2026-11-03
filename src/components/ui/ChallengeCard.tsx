import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, RotateCcw, Target, Trophy } from 'lucide-react'
import { clearCompleted, markCompleted, readCompleted } from '../../logic/challenges'

export interface Goal {
  id: string
  text: string
  /** Verdadeiro quando o estado atual do simulador cumpre a meta. */
  met: boolean
}

interface Props {
  simulator: string
  goals: Goal[]
}

/** Metas que se completam sozinhas quando o aluno chega ao estado pedido. */
export default function ChallengeCard({ simulator, goals }: Props) {
  // O armazenamento é a fonte da verdade; `version` só força um novo desenho ao recomeçar.
  const [, setVersion] = useState(0)
  const stored = readCompleted(simulator)
  const metNow = goals.filter((goal) => goal.met && !stored.includes(goal.id)).map((goal) => goal.id)
  const completed = [...stored, ...metNow]
  const pending = metNow.join(',')

  // Grava no navegador as metas que acabaram de ser cumpridas.
  useEffect(() => {
    if (pending) markCompleted(simulator, pending.split(','))
  }, [pending, simulator])

  const doneCount = goals.filter((goal) => completed.includes(goal.id)).length
  const all = doneCount === goals.length

  return (
    <section aria-labelledby={`${simulator}-challenges`} className={`mt-5 rounded-2xl border p-4 shadow-sm sm:p-5 ${all ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {all ? <Trophy size={20} className="text-emerald-600" /> : <Target size={20} className="text-blue-600" />}
        <h2 id={`${simulator}-challenges`} className="text-base font-black text-slate-900 sm:text-lg">
          Desafios
        </h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-600">
          {doneCount}/{goals.length}
        </span>
        {doneCount > 0 && (
          <button
            type="button"
            onClick={() => {
              clearCompleted(simulator)
              setVersion((value) => value + 1)
            }}
            className="ml-auto inline-flex min-h-[32px] items-center gap-1 rounded-lg px-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
          >
            <RotateCcw size={13} /> Recomeçar desafios
          </button>
        )}
      </div>
      <p className="mb-3 text-sm text-slate-600">{all ? 'Parabéns! Você cumpriu todos os desafios deste simulador.' : 'Use os controles acima para chegar a cada situação. A meta é marcada sozinha quando você conseguir.'}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {goals.map((goal) => {
          const done = completed.includes(goal.id)
          return (
            <li key={goal.id} className={`flex items-start gap-2 rounded-xl border p-3 text-sm font-semibold ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
              {done ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" /> : <Circle size={18} className="mt-0.5 shrink-0 text-slate-400" />}
              <span>
                <span className="sr-only">{done ? 'Concluído: ' : 'Pendente: '}</span>
                {goal.text}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="sr-only" aria-live="polite">
        {doneCount > 0 ? `${doneCount} de ${goals.length} desafios concluídos` : ''}
      </p>
    </section>
  )
}
