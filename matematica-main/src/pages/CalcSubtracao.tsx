import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, RotateCcw, Minus, Plus, Lightbulb } from 'lucide-react'
import { subtractionProblems, type SubtractionProblem } from '../data/subtractionProblems'
import { deslocar, isDezenaExata, podeDeslocar } from '../logic/subtracao'
import RetaNumerica from '../components/subtracao/RetaNumerica'
import PresentationMode from '../components/PresentationMode'

const MAX_VALUE = 120

function clampValue(value: number) {
  return Math.min(MAX_VALUE, Math.max(0, Math.round(value)))
}

function SubtracaoWorkspace({ problema }: { problema: SubtractionProblem }) {
  const [minuendo, setMinuendo] = useState(problema.minuendo)
  const [subtraendo, setSubtraendo] = useState(problema.subtraendo)
  const [desl, setDesl] = useState(0)
  const [showResult, setShowResult] = useState(true)

  const diferenca = minuendo - subtraendo
  const diferencaOrig = problema.minuendo - problema.subtraendo
  const isDezena = isDezenaExata(subtraendo)
  const constante = diferenca === diferencaOrig

  function updateValue(rawValue: string, setValue: (value: number) => void) {
    if (rawValue === '') return
    const next = Number(rawValue)
    if (Number.isFinite(next)) setValue(clampValue(next))
  }

  function doShift(delta: number) {
    const { novoMinuendo, novoSubtraendo } = deslocar(minuendo, subtraendo, delta)
    if (!podeDeslocar(novoMinuendo, novoSubtraendo)) return
    setMinuendo(novoMinuendo)
    setSubtraendo(novoSubtraendo)
    setDesl((current) => current + delta)
  }

  function reset() {
    setMinuendo(problema.minuendo)
    setSubtraendo(problema.subtraendo)
    setDesl(0)
  }

  const numberInputClass =
    'w-[4.4rem] rounded-xl border-2 px-2 py-1.5 text-center text-2xl font-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:w-24 sm:text-3xl md:text-4xl lg:text-5xl'

  return (
    <>
      <div className="mb-4 overflow-hidden rounded-2xl border-2 bg-white p-3 text-center shadow-sm sm:mb-6 sm:p-5">
        <p className="mb-2 text-[11px] font-medium text-slate-500">Clique em um número para editá-lo.</p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
          <motion.input
            initial={{ y: -6, opacity: 0.7 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            type="number"
            min="0"
            max={MAX_VALUE}
            inputMode="numeric"
            value={minuendo}
            onChange={(event) => updateValue(event.target.value, setMinuendo)}
            className={`${numberInputClass} border-blue-200 bg-blue-50 text-blue-800`}
            aria-label="Minuendo"
          />
          <span className="text-xl font-black text-slate-400 sm:text-2xl md:text-3xl">−</span>
          <motion.input
            initial={{ y: -6, opacity: 0.7 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            type="number"
            min="0"
            max={MAX_VALUE}
            inputMode="numeric"
            value={subtraendo}
            onChange={(event) => updateValue(event.target.value, setSubtraendo)}
            className={`${numberInputClass} ${isDezena ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-violet-200 bg-violet-50 text-violet-800'}`}
            aria-label="Subtraendo"
          />
          <span className="text-xl font-black text-slate-400 sm:text-2xl md:text-3xl">=</span>
          <span className="min-w-[4rem] text-2xl font-black text-emerald-600 sm:text-3xl md:text-4xl lg:text-5xl" aria-live="polite">
            {showResult ? diferenca : '?'}
          </span>
        </div>

        <div className="mt-3 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            Original: {problema.minuendo} − {problema.subtraendo} = {diferencaOrig}
          </p>
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
            <input
              type="checkbox"
              checked={showResult}
              onChange={(event) => setShowResult(event.target.checked)}
              className="h-4 w-4 rounded accent-blue-600"
            />
            Mostrar resultado
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-center text-xs font-bold ${
              constante ? 'border border-emerald-200 bg-emerald-100 text-emerald-700' : 'border border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            {constante ? '✓ Diferença constante' : 'Conta alterada'} · {showResult ? diferenca : 'resultado oculto'}
          </span>
          <span className="text-xs text-slate-500">desl. {desl > 0 ? `+${desl}` : desl}</span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
          >
            <RotateCcw size={12} /> Resetar
          </button>
        </div>

        {isDezena && (
          <div className="mx-auto mt-3 flex max-w-2xl items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left">
            <Lightbulb className="mt-0.5 shrink-0 text-amber-600" size={16} />
            <div className="text-xs leading-relaxed text-amber-800 sm:text-sm">
              <span className="font-bold">Dezena exata! </span>
              {subtraendo} é dezena — conta mais simples: <span className="font-mono font-bold">{minuendo} − {subtraendo} = {diferenca}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:p-4 md:p-6">
        <div className="-mx-3 overflow-x-auto px-3 sm:mx-0 sm:px-0">
          <RetaNumerica
            minuendo={minuendo}
            subtraendo={subtraendo}
            origMinuendo={problema.minuendo}
            origSubtraendo={problema.subtraendo}
            isDezena={isDezena}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 justify-center gap-2 sm:mt-6 sm:gap-3 lg:mx-auto lg:max-w-lg">
          <button
            type="button"
            aria-label="Deslocar menos 1"
            onClick={() => doShift(-1)}
            disabled={!podeDeslocar(minuendo - 1, subtraendo - 1)}
            className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-base font-bold text-slate-800 transition hover:bg-slate-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={16} /> Mover 1
          </button>
          <button
            type="button"
            aria-label="Deslocar mais 1"
            onClick={() => doShift(1)}
            disabled={!podeDeslocar(minuendo + 1, subtraendo + 1)}
            className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-3 text-base font-bold text-white shadow transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={16} /> Mover 1
          </button>
          <button
            type="button"
            aria-label="Deslocar menos 5"
            onClick={() => doShift(-5)}
            disabled={!podeDeslocar(minuendo - 5, subtraendo - 5)}
            className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-base font-bold text-blue-800 transition hover:bg-blue-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={16} /> Mover 5
          </button>
          <button
            type="button"
            aria-label="Deslocar mais 5"
            onClick={() => doShift(5)}
            disabled={!podeDeslocar(minuendo + 5, subtraendo + 5)}
            className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-base font-bold text-blue-800 transition hover:bg-blue-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={16} /> Mover 5
          </button>
        </div>

        <p className="mt-3 px-2 text-center text-[11px] leading-relaxed text-slate-500 sm:text-xs">
          Ex.: <span className="font-mono">27 − 12 = 15</span> → <span className="font-mono font-bold">25 − 10 = 15</span> (−2). Distância igual!
        </p>
      </div>
    </>
  )
}

export default function CalcSubtracao() {
  const [idx, setIdx] = useState(0)
  const orig = subtractionProblems[idx]

  return (
    <PresentationMode title="Cálculo Mental — Subtração">
      <div className="mx-auto max-w-6xl overflow-x-hidden">
        <Link
          to="/"
          className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 rounded text-xs font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:mb-6 sm:text-sm"
        >
          <ArrowLeft size={16} className="shrink-0" /> Voltar ao início
        </Link>

        <header className="mb-4 px-1 text-center sm:mb-6 sm:px-0 sm:text-left">
          <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl">➖ Cálculo Mental — Subtração</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:mt-3 sm:text-base md:text-lg">
            Desloque, edite os valores e compare a diferença com a conta inicial na reta numérica.
          </p>
        </header>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:p-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="mb-1 mr-1 w-full text-xs font-semibold text-slate-600 sm:mb-0 sm:w-auto sm:text-sm">Escolha o problema:</span>
            {subtractionProblems.map((p, i) => (
              <button
                type="button"
                key={p.id}
                aria-label={`Problema ${p.id}: ${p.minuendo} menos ${p.subtraendo}`}
                aria-current={i === idx ? 'true' : undefined}
                onClick={() => setIdx(i)}
                className={`min-h-[44px] rounded-xl border-2 px-3 py-2 text-xs font-bold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:px-3.5 sm:text-sm ${
                  i === idx ? 'border-blue-600 bg-blue-600 text-white shadow' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {p.minuendo} − {p.subtraendo}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:mt-3 sm:text-sm">{orig.description}</p>
        </div>

        <SubtracaoWorkspace key={idx} problema={orig} />
      </div>
    </PresentationMode>
  )
}
