import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Circle, Compass, Info, RotateCcw, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import PresentationMode from '../components/PresentationMode'
import CircleVisualization from '../components/circulo/CircleVisualization'
import { DEFAULT_RADIUS, MAX_RADIUS, MIN_RADIUS, RADIUS_STEP, formatNumber, getCircleState, type CircleMode } from '../logic/circulo'

const modes: Array<{ id: CircleMode; label: string; hint: string }> = [
  { id: 'medidas', label: 'Medidas', hint: 'raio e diâmetro' },
  { id: 'circunferencia', label: 'Circunferência', hint: 'descobrir π' },
  { id: 'angulos', label: 'Arcos e ângulos', hint: 'arco e corda' },
  { id: 'area', label: 'Área e setor', hint: 'ângulo e área' },
  { id: 'elementos', label: 'Elementos', hint: 'partes do círculo' },
]

export default function Pi() {
  const [radius, setRadius] = useState(DEFAULT_RADIUS)
  const [mode, setMode] = useState<CircleMode>('medidas')
  const [angle, setAngle] = useState(90)
  const state = getCircleState(radius)
  const updateRadius = (value: number) => { if (!Number.isFinite(value)) return; const clamped = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, value)); setRadius(Math.round(clamped / RADIUS_STEP) * RADIUS_STEP) }
  const reset = () => { setRadius(DEFAULT_RADIUS); setAngle(90); setMode('medidas') }

  return <PresentationMode title="Explorador do Círculo">
    <div className="mx-auto max-w-6xl overflow-x-hidden">
      <Link to="/" className="mb-4 inline-flex min-h-[44px] items-center gap-1.5 text-xs font-medium text-blue-700 hover:underline sm:mb-6 sm:text-sm"><ArrowLeft size={16}/> Voltar ao início</Link>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-black leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl"><span className="text-blue-800">◉</span> Explorador do Círculo</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 sm:mt-3 sm:text-base md:text-lg">Manipule o círculo e descubra visualmente como raio, diâmetro, circunferência, área, arcos, ângulos, cordas e setores se relacionam.</p>
        <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 sm:text-sm"><Sparkles size={14}/> Explore livremente: tudo acontece em tempo real.</p>
      </header>
      <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 lg:grid-cols-[390px_1fr]">
        <aside className="order-2 space-y-4 lg:order-1">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2"><Circle size={19} className="text-blue-700"/><h2 className="text-base font-bold text-slate-900 sm:text-lg">Controles</h2></div><button type="button" onClick={reset} title="Reiniciar" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><RotateCcw size={15}/></button></div>
            <label htmlFor="circle-radius" className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-600"><span>Raio</span><span className="font-mono text-blue-700">{formatNumber(radius)} u</span></label>
            <div className="mt-2 flex items-center gap-2"><input id="circle-radius" type="number" min={MIN_RADIUS} max={MAX_RADIUS} step={RADIUS_STEP} value={radius} onChange={e=>updateRadius(Number(e.target.value))} className="min-h-[44px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-base font-black text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"/><span className="font-mono text-sm font-bold text-slate-500">u</span></div>
            <input aria-label="Ajustar raio" type="range" min={MIN_RADIUS} max={MAX_RADIUS} step={RADIUS_STEP} value={radius} onChange={e=>updateRadius(Number(e.target.value))} className="mt-4 w-full accent-blue-600"/>
            <div className="mt-1 flex justify-between text-[11px] font-semibold text-slate-400"><span>{MIN_RADIUS} u</span><span>{MAX_RADIUS} u</span></div>
            <div className="mt-5 grid grid-cols-2 gap-2">{[['RAIO',formatNumber(state.radius)+' u'],['DIÂMETRO',formatNumber(state.diameter)+' u'],['CIRCUNFERÊNCIA',formatNumber(state.circumference)+' u'],['ÁREA',formatNumber(state.area)+' u²']].map(([label,value])=><div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3"><div className="text-[10px] font-bold tracking-wide text-slate-500">{label}</div><div className="mt-0.5 text-lg font-black text-slate-800">{value}</div></div>)}</div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-600"><Compass size={15} className="text-blue-700"/> Explorar</div>
            <div className="space-y-2">{modes.map(item => <button key={item.id} type="button" onClick={()=>setMode(item.id)} className={'flex min-h-[50px] w-full items-center justify-between rounded-xl border px-3 text-left transition '+(mode===item.id?'border-blue-300 bg-blue-50 text-blue-900 shadow-sm':'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')}><span className="text-sm font-bold">{item.label}</span><span className="text-[11px] font-medium text-slate-500">{item.hint}</span></button>)}</div>
            {(mode==='angulos'||mode==='area') && <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3.5"><div className="flex items-center justify-between"><label htmlFor="circle-angle" className="text-xs font-bold text-blue-800">Ângulo central</label><span className="font-mono text-sm font-black text-blue-900">{angle}°</span></div><input id="circle-angle" type="range" min="0" max="360" step="5" value={angle} onChange={e=>setAngle(Number(e.target.value))} className="mt-3 w-full accent-blue-600"/><div className="mt-1 flex justify-between text-[10px] font-semibold text-blue-600"><span>0°</span><span>180°</span><span>360°</span></div></div>}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-black tracking-widest text-slate-500"><Info size={14}/> RELAÇÕES</div>
            <div className="space-y-2 text-sm"><div className="rounded-lg bg-slate-50 px-3 py-2.5"><span className="font-mono font-bold text-blue-800">D = 2r</span><span className="ml-2 text-slate-600">{formatNumber(state.diameter)} = 2 × {formatNumber(state.radius)}</span></div><div className="rounded-lg bg-slate-50 px-3 py-2.5"><span className="font-mono font-bold text-blue-800">C = πD</span><span className="ml-2 text-slate-600">{formatNumber(state.circumference)} ≈ π × {formatNumber(state.diameter)}</span></div><div className="rounded-lg bg-slate-50 px-3 py-2.5"><span className="font-mono font-bold text-blue-800">A = πr²</span><span className="ml-2 text-slate-600">{formatNumber(state.area)} ≈ π × {formatNumber(state.radius)}²</span></div></div>
          </section>
        </aside>
        <main className="order-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:p-6 lg:order-2">
          <CircleVisualization state={state} mode={mode} angle={angle} onModeChange={setMode}/>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{[['r',formatNumber(state.radius)+' u'],['d',formatNumber(state.diameter)+' u'],['C',formatNumber(state.circumference)+' u'],['A',formatNumber(state.area)+' u²']].map(([symbol,value])=><div key={symbol} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center"><div className="font-mono text-xs font-bold text-blue-700">{symbol}</div><div className="text-sm font-black text-slate-800">{value}</div></div>)}</div>
          <button type="button" onClick={()=>setMode('circunferencia')} className="mt-3 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-800"><Sparkles size={17}/> Desenrolar a circunferência e descobrir π</button>
        </main>
      </div>
      <motion.section initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mt-4 grid gap-4 sm:mt-6 lg:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="text-xs font-black tracking-wide text-blue-700">MEDIDAS</div><h2 className="mt-1 text-base font-black text-slate-900">Raio e diâmetro</h2><p className="mt-1.5 text-sm leading-relaxed text-slate-600">Mude o raio e veja o diâmetro, a área e a circunferência acompanharem a mudança.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="text-xs font-black tracking-wide text-blue-700">GEOMETRIA</div><h2 className="mt-1 text-base font-black text-slate-900">Arcos, cordas e setores</h2><p className="mt-1.5 text-sm leading-relaxed text-slate-600">Um único ângulo central controla diferentes medidas da mesma região.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="text-xs font-black tracking-wide text-blue-700">EXPERIMENTO</div><h2 className="mt-1 text-base font-black text-slate-900">Por que aparece π?</h2><p className="mt-1.5 text-sm leading-relaxed text-slate-600">Ao comparar a circunferência com o diâmetro, a mesma razão aparece para qualquer círculo.</p></div></motion.section>
    </div>
  </PresentationMode>
}