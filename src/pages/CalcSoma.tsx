import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react'
import { additionProblems, type AdditionProblem } from '../data/additionProblems'
import { transferir, isDezenaExata, podeTransferir } from '../logic/adicao'
import MaterialDourado from '../components/soma/MaterialDourado'
import PresentationMode from '../components/PresentationMode'

const MAX_VALUE = 120

function clampValue(value: number) {
  return Math.min(MAX_VALUE, Math.max(0, Math.round(value)))
}

function SomaWorkspace({ problema }: { problema: AdditionProblem }) {
  const [a, setA] = useState(problema.a)
  const [b, setB] = useState(problema.b)
  const [animDelta, setAnimDelta] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(true)

  const soma = a + b
  const somaOriginal = problema.a + problema.b
  const constante = soma === somaOriginal
  const isADezena = isDezenaExata(a)
  const isBDezena = isDezenaExata(b)

  function updateValue(rawValue: string, setValue: (value: number) => void) {
    if (rawValue === '') return
    const next = Number(rawValue)
    if (Number.isFinite(next)) setValue(clampValue(next))
  }

  function doTransfer(delta: number) {
    if (!podeTransferir(a, b, delta)) return
    const { novoA, novoB } = transferir(a, b, delta)
    setAnimDelta(delta)
    setA(novoA)
    setB(novoB)
    window.setTimeout(() => setAnimDelta(null), 800)
  }

  function reset() {
    setA(problema.a)
    setB(problema.b)
    setAnimDelta(null)
  }

  const numberInputClass =
    'w-[4.4rem] rounded-xl border-2 px-2 py-1.5 text-center text-2xl font-black outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:w-24 sm:text-3xl md:text-4xl lg:text-5xl'

  return (
    <>
      <div className="mb-4 h-[320px] overflow-hidden rounded-2xl border-2 bg-white p-3 text-center shadow-sm sm:mb-6 sm:h-[330px] sm:p-5">
        <p className="mb-2 text-[11px] font-medium text-slate-500">Clique em um número para editá-lo.</p>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4">
          <motion.input
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            type="number"
            min="0"
            max={MAX_VALUE}
            inputMode="numeric"
            value={a}
            onChange={(event) => updateValue(event.target.value, setA)}
            className={`${numberInputClass} ${isADezena ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-800'}`}
            aria-label="Parcela A"
          />
          <span className="text-xl font-black text-slate-400 sm:text-2xl md:text-3xl">+</span>
          <motion.input
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            type="number"
            min="0"
            max={MAX_VALUE}
            inputMode="numeric"
            value={b}
            onChange={(event) => updateValue(event.target.value, setB)}
            className={`${numberInputClass} ${isBDezena ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-800'}`}
            aria-label="Parcela B"
          />
          <span className="text-xl font-black text-slate-400 sm:text-2xl md:text-3xl">=</span>
          <span className="min-w-[4rem] text-2xl font-black text-blue-700 sm:text-3xl md:text-4xl lg:text-5xl" aria-live="polite">
            {showResult ? soma : '?'}
          </span>
        </div>

        <div className="mt-3 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <p className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            Original: {problema.a} + {problema.b} = {somaOriginal}
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
            {constante ? '✓ Soma constante' : 'Conta alterada'} · {showResult ? soma : 'resultado oculto'}
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95"
          >
            <RotateCcw size={12} /> Resetar
          </button>
        </div>

        <AnimatePresence>
          {animDelta !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-3 h-5 px-2 text-xs font-medium text-blue-700 sm:text-sm"
            >
              {animDelta > 0
                ? `→ ${animDelta} unidade${animDelta === 1 ? '' : 's'} de A para B`
                : `← ${Math.abs(animDelta)} unidade${Math.abs(animDelta) === 1 ? '' : 's'} de B para A`}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto mt-3 h-[58px] max-w-2xl">
          {(isADezena || isBDezena) && (
            <div className="flex h-full items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left">
              <Lightbulb className="mt-0.5 shrink-0 text-amber-600" size={16} />
              <div className="text-xs leading-relaxed text-amber-800 sm:text-sm">
                <span className="font-bold">Dezena exata! </span>
                {isADezena && isBDezena ? `Ambas são dezenas exatas (${a} e ${b})!` : isADezena ? `${a} é dezena exata.` : `${b} é dezena exata.`}
                <span className="hidden sm:inline"> Some mentalmente agora.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-3 sm:gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <MaterialDourado valor={a} label="PARCELA A" destacado={isADezena} cor="#2563eb" />

        <div className="order-first grid grid-cols-2 gap-2 py-1 sm:gap-3 lg:order-none lg:grid-cols-1 lg:py-2">
          <button
            type="button"
            aria-label="Transferir 1 unidade de B para A"
            onClick={() => doTransfer(-1)}
            disabled={!podeTransferir(a, b, -1)}
            className="inline-flex min-h-[48px] items-center justify-center gap-1 rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white shadow transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Mover 1
          </button>
          <button
            type="button"
            aria-label="Transferir 1 unidade de A para B"
            onClick={() => doTransfer(1)}
            disabled={!podeTransferir(a, b, 1)}
            className="inline-flex min-h-[48px] items-center justify-center gap-1 rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white shadow transition hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mover 1 <ChevronRight size={16} />
          </button>
          <button
            type="button"
            aria-label="Transferir 5 unidades de B para A"
            onClick={() => doTransfer(-5)}
            disabled={!podeTransferir(a, b, -5)}
            className="inline-flex min-h-[48px] items-center justify-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm font-bold text-blue-800 transition hover:bg-blue-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Mover 5
          </button>
          <button
            type="button"
            aria-label="Transferir 5 unidades de A para B"
            onClick={() => doTransfer(5)}
            disabled={!podeTransferir(a, b, 5)}
            className="inline-flex min-h-[48px] items-center justify-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm font-bold text-blue-800 transition hover:bg-blue-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mover 5 <ChevronRight size={16} />
          </button>
          <p className="col-span-2 text-center text-[11px] font-medium text-slate-500 lg:col-span-1">A transferência mantém a soma atual.</p>
        </div>

        <MaterialDourado valor={b} label="PARCELA B" destacado={isBDezena} cor="#7c3aed" />
      </div>
    </>
  )
}

export default function CalcSoma() {
  const [idx, setIdx] = useState(0)
  const problemaOriginal = additionProblems[idx]

  return (
    <PresentationMode title="Cálculo Mental — Soma">
      <div className="mx-auto max-w-6xl overflow-x-hidden">
        <Link
          to="/"
          className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 rounded text-xs font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:mb-6 sm:text-sm"
        >
          <ArrowLeft size={16} className="shrink-0" /> Voltar ao início
        </Link>

        <header className="mb-4 px-1 text-center sm:mb-6 sm:px-0 sm:text-left">
          <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl">➕ Cálculo Mental — Soma</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:mt-3 sm:text-base md:text-lg">
            Compensação aditiva com material dourado. Transfira ou edite os valores e compare com a conta inicial.
          </p>
        </header>

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:p-4">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="mb-1 mr-1 w-full text-xs font-semibold text-slate-600 sm:mb-0 sm:w-auto sm:text-sm">Escolha o problema:</span>
            {additionProblems.map((p, i) => (
              <button
                type="button"
                key={p.id}
                aria-label={`Problema ${p.id}: ${p.a} + ${p.b}`}
                aria-current={i === idx ? 'true' : undefined}
                onClick={() => setIdx(i)}
                className={`min-h-[44px] rounded-xl border-2 px-3 py-2 text-xs font-bold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:px-3.5 sm:text-sm ${
                  i === idx ? 'border-blue-600 bg-blue-600 text-white shadow' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {p.a} + {p.b}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:mt-3 sm:text-sm">{problemaOriginal.description}</p>
        </div>

        <SomaWorkspace key={idx} problema={problemaOriginal} />

        <div className="mt-4 rounded-xl bg-slate-900 p-3 text-xs leading-relaxed text-white sm:mt-6 sm:p-4 sm:text-sm">
          <span className="font-bold tracking-wide text-slate-300">DICA: </span>
          <span className="font-mono font-bold">12 + 27 = 39</span> → <span className="font-mono font-bold text-amber-300">10 + 29 = 39</span>. Leve uma parcela para dezena!
        </div>
      </div>
    </PresentationMode>
  )
}
