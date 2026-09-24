import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Circle, RotateCcw, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import PresentationMode from '../components/PresentationMode'
import PiVisualization from '../components/pi/PiVisualization'
import {
  DEFAULT_DIAMETER,
  DIAMETER_STEP,
  MAX_DIAMETER,
  MIN_DIAMETER,
  formatNumber,
  getPiState,
} from '../logic/pi'

export default function Pi() {
  const [diameter, setDiameter] = useState(DEFAULT_DIAMETER)
  const [isUnrolled, setIsUnrolled] = useState(false)

  const state = getPiState(diameter)

  function updateDiameter(value: number) {
    if (!Number.isFinite(value)) return
    const clamped = Math.min(MAX_DIAMETER, Math.max(MIN_DIAMETER, value))
    setDiameter(Math.round(clamped / DIAMETER_STEP) * DIAMETER_STEP)
  }

  function reset() {
    setDiameter(DEFAULT_DIAMETER)
    setIsUnrolled(false)
  }

  return (
    <PresentationMode title="Explorador de π">
      <div className="mx-auto max-w-6xl overflow-x-hidden">
        <Link
          to="/"
          className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 rounded text-xs font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:mb-6 sm:text-sm"
        >
          <ArrowLeft size={16} /> Voltar ao início
        </Link>

        <header className="mb-6 px-1 text-center sm:mb-8 sm:text-left">
          <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl">
            <span className="text-blue-800">◉</span> Explorador de π
          </h1>
          <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:mt-3 sm:text-base md:text-lg sm:mx-0">
            Descubra por que a razão entre a circunferência e o diâmetro de qualquer círculo é sempre π.
          </p>
          <p className="mt-2 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 sm:text-sm">
            <Sparkles size={14} />
            Mude o diâmetro, desenrole a circunferência e observe a mesma razão aparecer.
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-[340px_1fr]">
          <div className="order-2 space-y-4 sm:space-y-5 lg:order-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Circle size={19} className="text-blue-700" />
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">Controles</h2>
              </div>

              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600" htmlFor="pi-diameter">
                Diâmetro
              </label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  id="pi-diameter"
                  type="number"
                  min={MIN_DIAMETER}
                  max={MAX_DIAMETER}
                  step={DIAMETER_STEP}
                  value={diameter}
                  onChange={(event) => updateDiameter(Number(event.target.value))}
                  className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-black text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <span className="font-mono text-sm font-bold text-slate-500">u</span>
              </div>

              <input
                id="pi-diameter-range"
                aria-label="Ajustar diâmetro"
                type="range"
                min={MIN_DIAMETER}
                max={MAX_DIAMETER}
                step={DIAMETER_STEP}
                value={diameter}
                onChange={(event) => updateDiameter(Number(event.target.value))}
                className="mt-4 w-full accent-blue-600"
              />
              <div className="mt-1 flex justify-between text-[11px] font-semibold text-slate-400">
                <span>{MIN_DIAMETER}</span>
                <span>{MAX_DIAMETER}</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold tracking-wide text-slate-500">RAIO</div>
                  <div className="mt-0.5 text-lg font-black text-slate-800">{formatNumber(state.radius)} u</div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[10px] font-bold tracking-wide text-slate-500">CIRCUNFERÊNCIA</div>
                  <div className="mt-0.5 text-lg font-black text-slate-800">{formatNumber(state.circumference)} u</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUnrolled((current) => !current)}
                className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              >
                {isUnrolled ? 'Voltar ao círculo' : 'Desenrolar circunferência'}
              </button>

              <button
                type="button"
                onClick={reset}
                className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <RotateCcw size={15} /> Reiniciar experimento
              </button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-3 text-[11px] font-black tracking-widest text-slate-500">A RELAÇÃO FUNDAMENTAL</div>
              <div className="rounded-xl bg-slate-900 p-4 text-white">
                <div className="font-mono text-lg font-black sm:text-xl">C ÷ D = π</div>
                <div className="mt-2 font-mono text-sm text-slate-300">
                  {formatNumber(state.circumference, 4)} ÷ {formatNumber(state.diameter, 2)} = {formatNumber(state.ratio, 5)}
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                Não importa o tamanho do círculo: ao dividir a circunferência pelo diâmetro, o resultado se aproxima de 3,14159…
              </p>
            </section>
          </div>

          <section className="order-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-6 lg:order-2">
            <PiVisualization state={state} isUnrolled={isUnrolled} />
          </section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-3"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="text-xs font-black tracking-wide text-blue-700">1. MEÇA</div>
            <h2 className="mt-1 text-base font-black text-slate-900">Escolha um diâmetro</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">O diâmetro atravessa o círculo de um lado ao outro passando pelo centro.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="text-xs font-black tracking-wide text-blue-700">2. DESENROLE</div>
            <h2 className="mt-1 text-base font-black text-slate-900">Transforme a curva em linha</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">A circunferência fica com o mesmo comprimento, mas agora podemos compará-la diretamente com o diâmetro.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="text-xs font-black tracking-wide text-blue-700">3. COMPARE</div>
            <h2 className="mt-1 text-base font-black text-slate-900">Aparecem 3 + 0,14159…</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">A circunferência mede aproximadamente 3,14159 diâmetros. Essa razão é o número π.</p>
          </div>
        </motion.section>
      </div>
    </PresentationMode>
  )
}
