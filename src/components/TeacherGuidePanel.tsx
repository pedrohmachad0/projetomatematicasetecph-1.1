import { useState } from 'react'
import { AlertTriangle, ChevronDown, Clock, GraduationCap, ListOrdered, MessageCircleQuestion, Target } from 'lucide-react'
import type { SimulatorId } from '../data/mathContent'
import { teacherGuides } from '../data/teacherGuides'

const STORAGE = 'simuladores-guia-professor-aberto'

function readOpen() {
  try {
    return localStorage.getItem(STORAGE) === '1'
  } catch {
    return false
  }
}

/** Roteiro de aula para o professor: fica fechado para não distrair a turma na projeção. */
export default function TeacherGuidePanel({ id }: { id: SimulatorId }) {
  const guide = teacherGuides[id]
  const [open, setOpen] = useState(readOpen)

  function toggle() {
    setOpen((value) => {
      try {
        localStorage.setItem(STORAGE, value ? '0' : '1')
      } catch {
        // Sem armazenamento, o painel só não lembra a escolha.
      }
      return !value
    })
  }

  return (
    <section className="teacher-guide mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:mb-6" aria-label="Guia do professor">
      <button type="button" onClick={toggle} aria-expanded={open} className="flex min-h-[52px] w-full items-center gap-3 px-4 text-left transition hover:bg-slate-50">
        <span className="sim-accent-bg flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" aria-hidden="true">
          <GraduationCap size={19} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black text-slate-900 sm:text-base">Guia do professor</span>
          <span className="block truncate text-xs font-semibold text-slate-500">Roteiro de aula, perguntas para a turma e erros comuns</span>
        </span>
        <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600 sm:inline-flex">
          <Clock size={13} /> ~{guide.minutes} min
        </span>
        <ChevronDown size={20} className={`shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="grid gap-4 border-t border-slate-100 p-4 sm:p-5 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <p className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              <Target size={17} className="mt-0.5 shrink-0" /> <span><strong>Objetivo:</strong> {guide.objective}</span>
            </p>
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-800">
              <ListOrdered size={16} /> Roteiro em sala
            </h3>
            <ol className="space-y-1.5">
              {guide.plan.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm leading-snug text-slate-700">
                  <span className="sim-accent-bg mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-800">
              <MessageCircleQuestion size={16} /> Perguntas para a turma
            </h3>
            <ul className="space-y-1.5">
              {guide.questions.map((q) => (
                <li key={q} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold leading-snug text-slate-700">
                  “{q}”
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-black text-slate-800">
              <AlertTriangle size={16} /> Erros comuns
            </h3>
            <ul className="space-y-1.5">
              {guide.mistakes.map((m) => (
                <li key={m} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-snug text-amber-900">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
