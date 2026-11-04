import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Circle, RotateCcw, Star, Target, Trophy } from 'lucide-react'
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

const CONFETTI = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#a855f7', '#ec4899']

function Celebration({ text, all }: { text: string; all: boolean }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      className="pointer-events-none fixed inset-x-3 bottom-4 z-[60] mx-auto max-w-md"
      role="status"
    >
      <div className="relative overflow-visible rounded-2xl bg-emerald-600 p-4 text-white shadow-2xl ring-4 ring-emerald-200/60">
        {!reduceMotion &&
          Array.from({ length: 18 }, (_, i) => {
            const angle = (i / 18) * Math.PI * 2
            return (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2 h-2.5 w-1.5 rounded-sm"
                style={{ background: CONFETTI[i % CONFETTI.length] }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{ x: Math.cos(angle) * (120 + (i % 3) * 30), y: Math.sin(angle) * 70 - 40, opacity: 0, rotate: 360 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                aria-hidden="true"
              />
            )
          })}
        <div className="relative flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-emerald-600" style={{ background: '#ffffff' }}>{all ? <Trophy size={22} /> : <Star size={22} fill="currentColor" />}</span>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-100">{all ? 'Todos os desafios!' : 'Desafio concluído!'}</p>
            <p className="text-sm font-bold leading-snug">{text}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/** Metas que se completam sozinhas quando o aluno chega ao estado pedido. */
export default function ChallengeCard({ simulator, goals }: Props) {
  // O armazenamento é a fonte da verdade; `version` só força um novo desenho ao recomeçar.
  const [, setVersion] = useState(0)
  const [toast, setToast] = useState<{ text: string; all: boolean; stamp: number } | null>(null)
  const stored = readCompleted(simulator)
  const metNow = goals.filter((goal) => goal.met && !stored.includes(goal.id)).map((goal) => goal.id)
  const completed = [...stored, ...metNow]
  const pending = metNow.join(',')
  const doneCount = goals.filter((goal) => completed.includes(goal.id)).length
  const all = doneCount === goals.length
  const newText = goals.find((goal) => goal.id === metNow[0])?.text ?? ''

  // Grava as metas que acabaram de ser cumpridas e comemora (o aviso some sozinho).
  useEffect(() => {
    if (!pending) return
    markCompleted(simulator, pending.split(','))
    const stamp = Date.now() + Math.random()
    window.setTimeout(() => setToast({ text: newText, all, stamp }), 0)
    window.setTimeout(() => setToast((current) => (current?.stamp === stamp ? null : current)), 3200)
  }, [pending, simulator, newText, all])

  return (
    <section data-challenges aria-labelledby={`${simulator}-challenges`} className={`mt-5 rounded-2xl border p-4 shadow-sm sm:p-5 ${all ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${all ? 'bg-emerald-600' : 'sim-accent-bg'}`} aria-hidden="true">
          {all ? <Trophy size={19} /> : <Target size={19} />}
        </span>
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
      <div className="mb-3 h-2.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
        <motion.div className={`h-full rounded-full ${all ? 'bg-emerald-500' : 'sim-accent-bg'}`} initial={false} animate={{ width: `${(doneCount / goals.length) * 100}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />
      </div>
      <p className="mb-3 text-sm text-slate-600">{all ? 'Parabéns! Você cumpriu todos os desafios deste simulador.' : 'Use os controles acima para chegar a cada situação. A meta é marcada sozinha quando você conseguir.'}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {goals.map((goal) => {
          const done = completed.includes(goal.id)
          return (
            <li key={goal.id} className={`flex items-start gap-2 rounded-xl border p-3 text-sm font-semibold transition-colors ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
              <motion.span key={done ? 'done' : 'todo'} initial={done ? { scale: 0.3, rotate: -90 } : false} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} className="mt-0.5 shrink-0">
                {done ? <CheckCircle2 size={18} className="text-emerald-600" /> : <Circle size={18} className="text-slate-400" />}
              </motion.span>
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
      <AnimatePresence>{toast && <Celebration key={toast.stamp} text={toast.text} all={toast.all} />}</AnimatePresence>
    </section>
  )
}
