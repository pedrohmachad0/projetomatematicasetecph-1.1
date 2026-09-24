import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Circle, RotateCcw, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import PresentationMode from '../components/PresentationMode'
import CircleVisualization from '../components/circulo/CircleVisualization'
import { DEFAULT_RADIUS, MAX_RADIUS, MIN_RADIUS, RADIUS_STEP, formatNumber, getCircleState, type CircleMode } from '../logic/circulo'

const modes: Array<{ id: CircleMode; label: string }> = [
  { id: 'medidas', label: 'Medidas' },
  { id: 'angulos', label: 'Arcos e ângulos' },
  { id: 'elementos', label: 'Elementos' },
  { id: 'area', label: 'Área e setor' },
]

export default function Pi() {
  const [radius, setRadius] = useState(DEFAULT_RADIUS)
  const [mode, setMode] = useState<CircleMode>('medidas')
  const [angle, setAngle] = useState(90)
  const state = getCircleState(radius)

  const updateRadius = (value: number) => {
    if (!Number.isFinite(value)) return
    const clamped = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, value))
    setRadius(Math.round(clamped / RADIUS_STEP) * RADIUS_STEP)
  }

  const reset = () => {
    setRadius(DEFAULT_RADIUS)
    setAngle(90)
    setMode('medidas')
  }

  return (
    <PresentationMode title="Explorador do Círculo">
      <div className="mx-auto max-w-6xl overflow-x-hidden">
        <Link to="/" className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 rounded text-xs font-medium text-blue-700 hover:underline sm:mb-6 sm:text-sm"><ArrowLeft size={16}/> Voltar ao início</Link>
        <header className="mb-6 px-1 text-center sm:mb-8 sm:text-left">
          <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl"><span className="text-blue-800">◉</span> Explorador do Círculo</h1>
          <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:mt-3 sm:text-base md:text-lg sm:mx-0">Manipule o círculo e descubra como raio, diâmetro, circunferência, área, arcos, ângulos, cordas e setores se relacionam.</p>
          <p className="mt-2 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 sm:text-sm"><Sparkles size={14}/> Explore livremente: cada mudança atualiza a geometria em tempo real.</p>
        </header>
        <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-[340px_1fr]">
          <div className="order-2 space-y-4 sm:order-1">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2"><Circle size={19} className="text-blue-700"/><h2 className="text-base font-bold text-slate-900 sm:text-lg">Controles</h2></div>
              <label htmlFor="circle-radius" className="text-xs font-bold uppercase tracking-wide text-slate-600">Raio</label>
              <div className="mt-2 flex items-center gap-2"><input id="circle-radius" type="number" min={MIN_RADIUS} max={MAX_RADIUS} step={RADIUS_STEP} value={radius} onChange={e=>updateRadius(Number(e.target.value))} className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-black text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/><span className="font-mono text-sm font-bold text-slate-500">u</span></div>
              <input aria-label="Ajustar raio" type="range" min={MIN_RADIUS} max={MAX_RADIUS} step={RADIUS_STEP} value={radius} onChange={e=>updateRadius(Number(e.target.value))} className="mt-4 w-full accent-blue-600"/>
              <div className="mt-1 flex justify-between text-[11px] font-semibold text-slate-400"><span>{MIN_RADIUS}</span><span>{MAX_RADIUS}</span></div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {[
                  ['RAIO', `${formatNumber(state.radius)} u`],
                  ['DIÂMETRO', `${formatNumber(state.diameter)} u`],
                  ['CIRCUNFERÊNCIA', `${formatNumber(state.circumference)} u`],
                  ['ÁREA', `${formatNumber(state.area)} u²`],
                ].map(([label,value])=><div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-[10px] font-bold tracking-wide text-slate-500">{label}</div><div className="mt-0.5 text-lg font-black text-slate-800">{value}</div></div>)}
              </div>
              <div className="mt-5"><div className="mb-2 text-xs font-bold text-slate-600">O que explorar?</div><div className="grid grid-cols-2 gap-2">{modes.map(item=><button key={item.id} type="button" onClick={()=>setMode(item.id)} className={`min-h-[44px] rounded-xl border px-2 py-2 text-xs font-bold transition ${mode===item.id?'border-blue-600 bg-blue-50 text-blue-800':'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{item.label}</button>)}</div></div>
              {(mode==='angulos'||mode==='area')&&<div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3"><label htmlFor="circle-angle" className="text-xs font-bold text-blue-800">Ângulo central: {angle}°</label><input id="circle-angle" type="range" min="0" max="360" step="5" value={angle} onChange={e=>setAngle(Number(e.target.value))} className="mt-3 w-full accent-blue-600"/></div>}
              <button type="button" onClick={reset} className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"><RotateCcw size={15}/> Reiniciar exploração</button>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="text-[11px] font-black tracking-widest text-slate-500">RELAÇÕES EM TEMPO REAL</div>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="rounded-lg bg-slate-50 px-3 py-2">D = 2r <strong className="ml-2">{formatNumber(state.diameter)} = 2 × {formatNumber(state.radius)}</strong></div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">C = πD <strong className="ml-2">{formatNumber(state.circumference)} ≈ π × {formatNumber(state.diameter)}</strong></div>
                <div className="rounded-lg bg-slate-50 px-3 py-2">A = πr² <strong className="ml-2">{formatNumber(state.area)} ≈ π × {formatNumber(state.radius)}²</strong></div>
              </div>
            </section>
          </div>
          <section className="order-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:order-2 sm:p-4 md:p-6">
            <CircleVisualization state={state} mode={mode} angle={angle} onModeChange={setMode}/>
            <button type="button" onClick={()=>setMode('desenrolar')} className="mt-3 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white shadow-sm hover:bg-blue-800">Desenrolar circunferência e descobrir π</button>
          </section>
        </div>
        <motion.section initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-xs font-black tracking-wide text-blue-700">MEDIDAS</div><h2 className="mt-1 text-base font-black text-slate-900">Raio e diâmetro</h2><p className="mt-1.5 text-sm text-slate-600">O diâmetro atravessa o centro e mede duas vezes o raio.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-xs font-black tracking-wide text-blue-700">GEOMETRIA</div><h2 className="mt-1 text-base font-black text-slate-900">Arcos, cordas e setores</h2><p className="mt-1.5 text-sm text-slate-600">Altere o ângulo central e observe as medidas mudarem.</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-xs font-black tracking-wide text-blue-700">EXPERIMENTO</div><h2 className="mt-1 text-base font-black text-slate-900">Descobrindo π</h2><p className="mt-1.5 text-sm text-slate-600">Desenrole a circunferência e compare seu comprimento com o diâmetro.</p></div>
        </motion.section>
      </div>
    </PresentationMode>
  )
}
