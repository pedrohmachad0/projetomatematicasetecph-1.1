import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { motion } from 'framer-motion'
import { Bike, Car, CheckCircle2, CupSoda, Sandwich, XCircle, type LucideIcon } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import CartesianPlane from '../components/graph/CartesianPlane'
import { createScale, plotPath } from '../logic/plane'
import { formatEq, lineY, solveSystem, type LinearEq } from '../logic/sistemas'

const scale = createScale(-10, 10)
const L1 = '#1d4ed8'
const L2 = '#c2410c'
const br = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }).replace('-', '−')

const presets: Array<{ id: string; label: string; story: string; e1: LinearEq; e2: LinearEq }> = [
  { id: 'carros', label: 'Carros e motos', story: 'Num estacionamento há 10 veículos (x carros e y motos) e 32 rodas.', e1: { a: 1, b: 1, c: 10 }, e2: { a: 4, b: 2, c: 32 } },
  { id: 'idades', label: 'Soma e diferença', story: 'Dois números somam 7 e a diferença entre eles é 1.', e1: { a: 1, b: 1, c: 7 }, e2: { a: 1, b: -1, c: 1 } },
  { id: 'lanche', label: 'Lanche', story: '2 sucos e 1 pastel custam R$ 8; 1 suco e 3 pastéis custam R$ 9.', e1: { a: 2, b: 1, c: 8 }, e2: { a: 1, b: 3, c: 9 } },
  { id: 'paralelas', label: 'Sem solução', story: 'Duas retas paralelas nunca se encontram.', e1: { a: 1, b: 1, c: 2 }, e2: { a: 1, b: 1, c: 6 } },
]

const scenes: Record<string, { x: { icon: LucideIcon; name: string }; y: { icon: LucideIcon; name: string }; check: (x: number, y: number) => string }> = {
  carros: { x: { icon: Car, name: 'carros' }, y: { icon: Bike, name: 'motos' }, check: (x, y) => `${x} + ${y} = ${x + y} veículos · ${x} × 4 + ${y} × 2 = ${4 * x + 2 * y} rodas` },
  lanche: { x: { icon: CupSoda, name: 'suco (R$)' }, y: { icon: Sandwich, name: 'pastel (R$)' }, check: (x, y) => `2 sucos + 1 pastel = ${2 * x + y} reais · 1 suco + 3 pastéis = ${x + 3 * y} reais` },
}

/** Mostra a solução do sistema dentro da história: os carros e motos, ou os preços do lanche. */
function StoryScene({ id, x, y }: { id: string; x: number; y: number }) {
  const scene = scenes[id]
  if (!scene || !Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x > 12 || y > 12) return null
  const groups = [
    { ...scene.x, n: x, color: '#1d4ed8', label: 'x' },
    { ...scene.y, n: y, color: '#c2410c', label: 'y' },
  ]
  return (
    <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
      <p className="mb-2 text-xs font-black uppercase tracking-wide text-emerald-800">Conferindo na história</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.label} className="rounded-xl bg-white p-2">
            <p className="mb-1 text-sm font-black" style={{ color: g.color }}>
              {g.label} = {g.n} {id === 'carros' ? g.name : ''}
            </p>
            <div className="flex flex-wrap gap-1">
              {id === 'carros' ? (
                Array.from({ length: g.n }, (_, i) => (
                  <motion.span key={i} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }} style={{ color: g.color }}>
                    <g.icon size={26} />
                  </motion.span>
                ))
              ) : (
                <span className="inline-flex items-center gap-1 font-mono text-lg font-black" style={{ color: g.color }}>
                  <g.icon size={24} /> {g.name.replace('(R$)', '')} = R$ {g.n}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 font-mono text-xs font-bold text-emerald-800">{scene.check(x, y)} ✓</p>
    </div>
  )
}

function EquationEditor({ title, color, eq, onChange }: { title: string; color: string; eq: LinearEq; onChange: (eq: LinearEq) => void }) {
  return (
    <Panel>
      <h2 className="mb-3 font-mono text-lg font-black" style={{ color }}>
        <span className="accent-text" style={{ ['--accent' as string]: color }}>{title}: {formatEq(eq)}</span>
      </h2>
      <div className="space-y-3">
        <NumberControl label="Número de x" value={eq.a} min={-5} max={5} step={1} onChange={(a) => onChange({ ...eq, a })} />
        <NumberControl label="Número de y" value={eq.b} min={-5} max={5} step={1} onChange={(b) => onChange({ ...eq, b })} />
        <NumberControl label="Resultado" value={eq.c} min={-40} max={40} step={1} onChange={(c) => onChange({ ...eq, c })} />
      </div>
    </Panel>
  )
}

function linePath(eq: LinearEq) {
  if (eq.b !== 0) return plotPath((x) => lineY(eq, x), scale)
  if (eq.a === 0) return ''
  const x = eq.c / eq.a
  return `M ${scale.toX(x)} ${scale.toY(scale.min)} L ${scale.toX(x)} ${scale.toY(scale.max)}`
}

export default function Sistemas() {
  const [e1, setE1] = useState<LinearEq>(presets[0].e1)
  const [e2, setE2] = useState<LinearEq>(presets[0].e2)
  const [story, setStory] = useState(presets[0].story)
  const [presetId, setPresetId] = useState<string | null>(presets[0].id)
  const [probe, setProbe] = useState<{ x: number; y: number } | null>(null)
  const [found, setFound] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const sol = solveSystem(e1, e2)
  const ok1 = probe ? e1.a * probe.x + e1.b * probe.y === e1.c : false
  const ok2 = probe ? e2.a * probe.x + e2.b * probe.y === e2.c : false

  function choose(p: (typeof presets)[number]) {
    setE1(p.e1)
    setE2(p.e2)
    setStory(p.story)
    setPresetId(p.id)
    setProbe(null)
  }

  function tap(event: ReactPointerEvent) {
    const svg = wrap.current?.querySelector('svg')
    const ctm = svg?.getScreenCTM()
    if (!ctm) return
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse())
    const span = scale.max - scale.min
    const inner = scale.toX(scale.max) - scale.toX(scale.min)
    const x = Math.round(scale.min + ((p.x - scale.toX(scale.min)) / inner) * span)
    const y = Math.round(scale.max - ((p.y - scale.toY(scale.max)) / inner) * span)
    if (x < scale.min || x > scale.max || y < scale.min || y > scale.max) return
    setProbe({ x, y })
    if (e1.a * x + e1.b * y === e1.c && e2.a * x + e2.b * y === e2.c) setFound(true)
  }

  const verdict =
    sol.kind === 'unica'
      ? `As retas se cruzam em um único ponto: x = ${br(sol.x!)} e y = ${br(sol.y!)}. Esse par deixa as duas equações verdadeiras ao mesmo tempo. (Sistema possível e determinado.)`
      : sol.kind === 'impossivel'
        ? 'As retas são paralelas: nunca se cruzam, então nenhum par (x, y) satisfaz as duas equações. (Sistema impossível.)'
        : 'As duas equações desenham a mesma reta: existem infinitas soluções. (Sistema possível e indeterminado.)'

  return (
    <PresentationMode title="Sistemas de Equações">
      <SimulatorHeader id="sistemas">
        Cada equação com x e y desenha uma reta. A solução do sistema é o ponto em que as duas retas se cruzam. Toque no plano para testar pontos.
      </SimulatorHeader>
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:p-4">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {presets.map((p) => (
            <button key={p.id} type="button" onClick={() => choose(p)} className="min-h-[44px] rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 active:scale-95">
              {p.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-700">{story}</p>
      </div>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_380px]">
        <Panel stage>
          <div className="mb-2 text-center font-mono text-lg font-black sm:text-2xl" aria-live="polite">
            <p className="accent-text" style={{ ['--accent' as string]: L1 }}>{formatEq(e1)}</p>
            <p className="accent-text" style={{ ['--accent' as string]: L2 }}>{formatEq(e2)}</p>
          </div>
          <div ref={wrap} onPointerDown={tap} className="cursor-crosshair touch-manipulation">
            <CartesianPlane scale={scale} label={`Retas ${formatEq(e1)} e ${formatEq(e2)}`}>
              <path d={linePath(e1)} fill="none" stroke={L1} strokeWidth={4} strokeLinecap="round" />
              <path d={linePath(e2)} fill="none" stroke={L2} strokeWidth={4} strokeLinecap="round" strokeDasharray={sol.kind === 'indeterminado' ? '10 8' : undefined} />
              {sol.kind === 'unica' && <circle cx={scale.toX(sol.x!)} cy={scale.toY(sol.y!)} r={8} fill="#047857" stroke="#ffffff" strokeWidth={3} />}
              {probe && (
                <g>
                  <circle cx={scale.toX(probe.x)} cy={scale.toY(probe.y)} r={9} fill="none" stroke={ok1 && ok2 ? '#047857' : '#7c3aed'} strokeWidth={4} />
                  <text x={scale.toX(probe.x) + 12} y={scale.toY(probe.y) - 10} fontSize={14} fontWeight={900} fill="#7c3aed" style={{ paintOrder: 'stroke', stroke: 'var(--svg-surface)', strokeWidth: 4 }}>
                    ({probe.x}, {probe.y})
                  </text>
                </g>
              )}
            </CartesianPlane>
          </div>
          {probe && (
            <div className="mt-2 grid gap-2 sm:grid-cols-2" aria-live="polite">
              {[
                { eq: e1, ok: ok1, color: 'text-blue-800' },
                { eq: e2, ok: ok2, color: 'text-orange-800' },
              ].map(({ eq, ok, color }, i) => (
                <p key={i} className={`flex items-center gap-2 rounded-xl border p-2 font-mono text-sm font-bold ${ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 ' + color}`}>
                  {ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {eq.a}·{br(probe.x)} + {eq.b}·{br(probe.y)} = {eq.a * probe.x + eq.b * probe.y} {ok ? '✓' : `≠ ${eq.c}`}
                </p>
              ))}
            </div>
          )}
          {presetId && sol.kind === 'unica' && <StoryScene id={presetId} x={sol.x!} y={sol.y!} />}
          <p role="status" className={`mt-2 rounded-xl border p-3 text-sm font-semibold ${sol.kind === 'unica' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
            {verdict}
          </p>
        </Panel>
        <div className="space-y-4">
          <EquationEditor title="1ª" color={L1} eq={e1} onChange={(eq) => { setE1(eq); setStory(''); setPresetId(null) }} />
          <EquationEditor title="2ª" color={L2} eq={e2} onChange={(eq) => { setE2(eq); setStory(''); setPresetId(null) }} />
        </div>
      </div>
      {sol.kind === 'unica' && (
        <Panel className="mt-4 sm:mt-6" title="Pelo método da adição">
          <ol className="space-y-1.5 font-mono text-sm font-bold text-slate-700">
            <li>1. Multiplique a 1ª por {e2.b} e a 2ª por {e1.b} para o y ficar com o mesmo número:</li>
            <li className="pl-4">{formatEq({ a: e1.a * e2.b, b: e1.b * e2.b, c: e1.c * e2.b })}</li>
            <li className="pl-4">{formatEq({ a: e2.a * e1.b, b: e2.b * e1.b, c: e2.c * e1.b })}</li>
            <li>2. Subtraia uma da outra: o y some.</li>
            <li className="pl-4">{br(e1.a * e2.b - e2.a * e1.b)}x = {br(e1.c * e2.b - e2.c * e1.b)} → x = {br(sol.x!)}</li>
            <li>3. Coloque x = {br(sol.x!)} numa das equações e descubra y = {br(sol.y!)}.</li>
          </ol>
        </Panel>
      )}
      <ChallengeCard
        simulator="sistemas"
        goals={[
          { id: 'achar', text: 'Toque no ponto do plano que resolve o sistema.', met: found },
          { id: 'paralelas', text: 'Monte um sistema sem solução (retas paralelas).', met: sol.kind === 'impossivel' },
          { id: 'mesma', text: 'Monte duas equações diferentes que desenham a mesma reta.', met: sol.kind === 'indeterminado' && (e1.a !== e2.a || e1.b !== e2.b || e1.c !== e2.c) },
          { id: 'origem', text: 'Faça as retas se cruzarem na origem (0, 0).', met: sol.kind === 'unica' && sol.x === 0 && sol.y === 0 },
        ]}
      />
      <TipBox>
        <strong>Ler o gráfico:</strong> todo ponto de uma reta é uma solução daquela equação. O ponto de cruzamento está nas duas retas ao mesmo tempo, por isso resolve o sistema. Confira sempre substituindo x e y nas duas equações.
      </TipBox>
    </PresentationMode>
  )
}
