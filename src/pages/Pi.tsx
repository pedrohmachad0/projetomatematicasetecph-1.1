import { useState } from 'react'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import CircleVisualization from '../components/circulo/CircleVisualization'
import { DEFAULT_RADIUS, MAX_RADIUS, MIN_RADIUS, RADIUS_STEP, formatNumber, getCircleState, type CircleMode } from '../logic/circulo'

const topics: Array<{ id: CircleMode; mark: string; title: string; shortTitle: string; prompt: string; instruction: string }> = [
  {
    id: 'circunferencia',
    mark: 'π',
    title: 'Descobrir π',
    shortTitle: 'Descobrir',
    prompt: 'Quantos diâmetros cabem na volta?',
    instruction: 'Faça uma estimativa. Depois arraste o ponto rosa ou toque nas marcas para conferir.',
  },
  {
    id: 'medidas',
    mark: 'r · d',
    title: 'Raio e diâmetro',
    shortTitle: 'Raio',
    prompt: 'Qual é a relação entre raio e diâmetro?',
    instruction: 'Mude o raio e observe o diâmetro acompanhar: ele mede sempre o dobro.',
  },
  {
    id: 'angulos',
    mark: '⌒',
    title: 'Arcos e cordas',
    shortTitle: 'Arcos',
    prompt: 'Como o ângulo muda o arco e a corda?',
    instruction: 'Mova o controle do ângulo e compare o trecho curvo com a linha que liga suas pontas.',
  },
  {
    id: 'area',
    mark: '◔',
    title: 'Área do setor',
    shortTitle: 'Setor',
    prompt: 'Quanto espaço ocupa esta fatia?',
    instruction: 'Aumente o ângulo central e veja a área do setor crescer dentro do círculo.',
  },
  {
    id: 'elementos',
    mark: '○',
    title: 'Partes do círculo',
    shortTitle: 'Partes',
    prompt: 'Onde está cada parte do círculo?',
    instruction: 'Escolha um elemento para destacá-lo e entender o que ele representa.',
  },
]

export default function Pi() {
  const [radius, setRadius] = useState(DEFAULT_RADIUS)
  const [mode, setMode] = useState<CircleMode>('circunferencia')
  const [angle, setAngle] = useState(90)
  const [experimentKey, setExperimentKey] = useState(0)
  const state = getCircleState(radius)
  const activeTopic = topics.find(topic => topic.id === mode) ?? topics[0]

  const updateRadius = (value: number) => {
    if (!Number.isFinite(value)) return
    const clamped = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, value))
    setRadius(Math.round(clamped / RADIUS_STEP) * RADIUS_STEP)
  }

  const reset = () => {
    setRadius(DEFAULT_RADIUS)
    setAngle(90)
    setMode('circunferencia')
    setExperimentKey(value => value + 1)
  }

  return <PresentationMode title="Círculo e π">
    <div className="mx-auto max-w-6xl space-y-3.5 sm:space-y-4">
      <section aria-labelledby="circle-intro-title" className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0b2851] via-[#164c91] to-[#2869c8] px-5 py-3 text-white shadow-[0_24px_60px_-35px_rgba(30,64,175,0.7)] sm:px-7 sm:py-4 md:px-9">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-1 -top-10 h-48 w-48 rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative flex items-center justify-between gap-3 sm:gap-6">
          <div className="max-w-3xl">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-100 sm:text-[10px]">Geometria para explorar</p>
            <h1 id="circle-intro-title" className="mt-1 text-xl font-black leading-tight tracking-tight sm:text-2xl md:text-3xl">O círculo e o número π</h1>
            <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-blue-50 sm:text-sm">
              A volta de qualquer círculo mede cerca de <strong className="font-black text-white">3,14 diâmetros</strong>: essa razão é o π.
            </p>
          </div>
          <div className="relative grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full border border-white/40 bg-white/10 shadow-inner sm:h-20 sm:w-20" aria-label="Pi aproximadamente 3,14">
            <span className="text-3xl font-black leading-none sm:text-4xl">π</span>
            <span className="absolute -bottom-2 rounded-full border border-white/30 bg-[#123b76] px-2 py-0.5 text-[10px] font-black text-white sm:text-xs">≈ 3,14</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="active-circle-topic" className="overflow-hidden rounded-[28px] border border-blue-100 bg-white p-3 shadow-[0_18px_55px_-35px_rgba(30,64,175,0.35)] sm:p-5 md:p-6">
        <div className="mb-3 border-b border-slate-100 pb-3">
          <div className="mb-1 flex items-center justify-between gap-3 px-1">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Explore o círculo</p>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-blue-700">{topics.length} experiências</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2" role="group" aria-label="Simuladores sobre o círculo">
            {topics.map(topic => {
              const selected = mode === topic.id
              return <button
                key={topic.id}
                type="button"
                aria-pressed={selected}
                aria-label={topic.title}
                onClick={() => setMode(topic.id)}
                className={'group flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl border px-1 py-1 text-center transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:min-h-10 sm:flex-row sm:gap-2 sm:px-2 sm:py-1.5 ' + (selected
                  ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/60')}
              >
                <span className={'grid h-6 min-w-6 shrink-0 place-items-center rounded-lg px-1 font-mono text-[11px] font-black transition sm:h-7 sm:min-w-7 sm:text-xs ' + (selected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-800')}>{topic.mark}</span>
                <span className="text-[9px] font-black leading-tight sm:text-left sm:text-[11px] md:text-xs"><span className="sm:hidden">{topic.shortTitle}</span><span className="hidden sm:inline">{topic.title}</span></span>
              </button>
            })}
          </div>
        </div>

        <header className="mb-2 px-1 text-center sm:mb-3">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-700">Simulador interativo</p>
          <h2 id="active-circle-topic" className="mt-0.5 text-lg font-black leading-tight tracking-tight text-slate-950 sm:text-xl md:text-2xl">{activeTopic.prompt}</h2>
          <p className="mx-auto mt-1 max-w-3xl text-[11px] leading-relaxed text-slate-600 sm:text-xs">{activeTopic.instruction}</p>
        </header>

        <div className="rounded-[24px] bg-[#dce9f7] p-2 sm:p-4 md:p-5">
          <CircleVisualization key={experimentKey} state={state} mode={mode} angle={angle} />

          {mode === 'medidas' && <div className="mx-auto mt-3 max-w-3xl rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm sm:px-5 sm:py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="circle-radius" className="text-sm font-bold text-slate-700">Ajuste o raio</label>
              <output htmlFor="circle-radius" className="rounded-xl bg-blue-50 px-3 py-1.5 font-mono text-sm font-black text-blue-800">r = {formatNumber(state.radius)} u <span className="px-1 text-blue-300">·</span> d = {formatNumber(state.diameter)} u</output>
            </div>
            <input id="circle-radius" aria-label="Ajustar raio do círculo" type="range" min={MIN_RADIUS} max={MAX_RADIUS} step={RADIUS_STEP} value={radius} onChange={event => updateRadius(Number(event.target.value))} className="mt-2 w-full accent-blue-700" />
            <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-400"><span>{MIN_RADIUS} u</span><span>{MAX_RADIUS} u</span></div>
            <p className="mt-2 text-center text-xs font-semibold text-slate-600">O diâmetro passa pelo centro e mede sempre <strong>2 × raio</strong>.</p>
          </div>}

          {(mode === 'angulos' || mode === 'area') && <div className="mx-auto mt-3 max-w-3xl rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm sm:px-5 sm:py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="circle-angle" className="text-sm font-bold text-slate-700">Ângulo central</label>
              <output htmlFor="circle-angle" className="rounded-xl bg-blue-50 px-3 py-1.5 font-mono text-sm font-black text-blue-800">{angle}°</output>
            </div>
            <input id="circle-angle" type="range" min="0" max="360" step="5" value={angle} onChange={event => setAngle(Number(event.target.value))} className="mt-2 w-full accent-blue-700" />
            <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-400"><span>0°</span><span>90°</span><span>180°</span><span>270°</span><span>360°</span></div>
          </div>}
        </div>
      </section>

      <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left sm:px-5 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2.5 text-sm font-bold text-slate-700 sm:text-base">
            <SlidersHorizontal size={17} className="text-blue-700" aria-hidden="true" />
            Testar outro tamanho de círculo
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">opcional</span>
        </summary>

        <div className="border-t border-slate-100 px-4 pb-5 pt-4 sm:px-5">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="circle-radius-explore" className="text-sm font-bold text-slate-700">Raio do círculo</label>
                <output htmlFor="circle-radius-explore" className="rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-sm font-black text-blue-800">{formatNumber(radius)} u</output>
              </div>
              <input id="circle-radius-explore" type="range" min={MIN_RADIUS} max={MAX_RADIUS} step={RADIUS_STEP} value={radius} onChange={event => updateRadius(Number(event.target.value))} className="w-full accent-blue-700" />
              <div className="mt-1 flex justify-between text-[11px] font-semibold text-slate-400"><span>{MIN_RADIUS} u</span><span>{MAX_RADIUS} u</span></div>
            </div>

            <button type="button" onClick={reset} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
              <RotateCcw size={15} aria-hidden="true" /> Restaurar início
            </button>
          </div>
          {mode === 'circunferencia' && <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold leading-relaxed text-blue-900">Mude o raio e repita o experimento: a razão entre a volta e o diâmetro continua próxima de 3,14.</p>}
        </div>
      </details>
    </div>
  </PresentationMode>
}
