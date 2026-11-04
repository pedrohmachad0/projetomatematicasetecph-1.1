import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUp, CalendarDays, Croissant, HardHat, ListChecks, type LucideIcon } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import Fact from '../components/ui/Fact'
import { useStepper } from '../components/ui/useStepper'
import { directRule, inverseRule, round2, simplifyRatio } from '../logic/proporcao'
import { mixHex } from '../logic/color'

type Mode = 'razao' | 'direta' | 'inversa'

const modes: Array<{ id: Mode; label: string }> = [
  { id: 'razao', label: 'Razão' },
  { id: 'direta', label: 'Regra de três direta' },
  { id: 'inversa', label: 'Inversa' },
]

const JUICE = '#f97316'
const WATER = '#bae6fd'
const num = (v: number) => round2(v).toLocaleString('pt-BR')

function Jar({ juice, water, label }: { juice: number; water: number; label: string }) {
  const total = juice + water
  const cols = 4
  const rows = Math.ceil(total / cols)
  const cell = 26
  const W = cols * cell + 24
  const H = Math.max(4, rows) * cell + 40
  const color = mixHex('#fff7ed', JUICE, juice / total)
  return (
    <figure className="text-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block h-auto w-full max-w-[130px]" role="img" aria-label={`${label}: ${juice} copos de suco e ${water} de água`}>
        <path d={`M 6 8 L 6 ${H - 10} Q 6 ${H - 4} 14 ${H - 4} L ${W - 14} ${H - 4} Q ${W - 6} ${H - 4} ${W - 6} ${H - 10} L ${W - 6} 8`} fill={color} fillOpacity={0.55} strokeWidth={3} style={{ stroke: 'var(--svg-axis)' }} />
        {Array.from({ length: total }, (_, i) => {
          const r = Math.floor(i / cols)
          const c = i % cols
          return <rect key={i} x={12 + c * cell} y={H - 10 - (r + 1) * cell} width={cell - 4} height={cell - 4} rx={5} fill={i < juice ? JUICE : WATER} stroke="#ffffff" strokeWidth={1.5} />
        })}
      </svg>
      <figcaption className="mt-1 text-xs font-bold text-slate-600">{label}</figcaption>
      <div className="mx-auto mt-1 h-4 w-20 rounded-full border border-slate-200" style={{ background: color }} aria-hidden="true" />
    </figure>
  )
}

function RatioMode() {
  const [juice, setJuice] = useState(1)
  const [water, setWater] = useState(3)
  const [times, setTimes] = useState(2)
  const [sj, sw] = simplifyRatio(juice, water)
  const share = juice / (juice + water)
  return (
    <>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel stage>
          <p className="text-center font-mono text-3xl font-black text-slate-900 sm:text-4xl" aria-live="polite">
            {juice} : {water} {sj !== juice && <span className="text-blue-700">= {sj} : {sw}</span>}
          </p>
          <p className="mb-3 text-center text-sm font-semibold text-slate-600">suco : água</p>
          <div className="grid grid-cols-3 items-end gap-2 sm:gap-3">
            <Jar juice={juice} water={water} label="1 receita" />
            <Jar juice={juice * times} water={water * times} label={`${times} receitas`} />
            <Jar juice={sj} water={sw} label="Simplificada" />
          </div>
          <p role="status" className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
            As três jarras têm a mesma cor: a razão {juice}:{water} é igual a {juice * times}:{water * times} e a {sj}:{sw}. Multiplicar ou dividir os dois termos pelo mesmo número não muda o sabor.
          </p>
        </Panel>
        <Panel title="Monte a receita">
          <div className="space-y-4">
            <NumberControl label="Copos de suco" value={juice} min={1} max={6} step={1} onChange={setJuice} />
            <NumberControl label="Copos de água" value={water} min={1} max={8} step={1} onChange={setWater} />
            <NumberControl label="Quantas receitas" value={times} min={1} max={4} step={1} onChange={setTimes} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2">
            <Fact label="Razão" value={`${juice}/${water}`} detail={`suco para cada água = ${num(juice / water)}`} />
            <Fact label="Suco na jarra" value={`${Math.round(share * 100)}%`} detail={`${juice} de ${juice + water} copos`} />
          </dl>
        </Panel>
      </div>
      <Panel className="mt-4 sm:mt-6" title="Tabela de proporção">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] text-center font-mono text-sm sm:text-base">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-500">
                <th className="p-2 text-left font-sans">Receitas</th>
                {[1, 2, 3, 4].map((n) => (
                  <th key={n} className={`p-2 ${n === times ? 'text-blue-700' : ''}`}>{n}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-black text-slate-800">
              <tr>
                <td className="p-2 text-left font-sans text-sm font-bold text-orange-700">Suco</td>
                {[1, 2, 3, 4].map((n) => <td key={n} className={`p-2 ${n === times ? 'rounded-lg bg-blue-50' : ''}`}>{juice * n}</td>)}
              </tr>
              <tr>
                <td className="p-2 text-left font-sans text-sm font-bold text-cyan-800">Água</td>
                {[1, 2, 3, 4].map((n) => <td key={n} className={`p-2 ${n === times ? 'rounded-lg bg-blue-50' : ''}`}>{water * n}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
      <ChallengeCard
        simulator="proporcao-razao"
        goals={[
          { id: 'simplificar', text: 'Monte uma receita que dê para simplificar (como 2:4 = 1:2).', met: sj !== juice },
          { id: 'metade', text: 'Faça uma jarra com exatamente metade de suco.', met: juice === water },
          { id: 'triplo', text: 'Prepare o triplo da receita.', met: times === 3 },
          { id: 'forte', text: 'Monte um suco mais forte que água (mais de 50% de suco).', met: share > 0.5 },
        ]}
      />
    </>
  )
}

const scenarios: Record<'direta' | 'inversa', { a: string; b: string; unitA: string; unitB: string; story: (a: number, b: number, c: number) => string }> = {
  direta: {
    a: 'Pães',
    b: 'Preço (R$)',
    unitA: 'pães',
    unitB: 'reais',
    story: (a, b, c) => `Se ${a} pães custam R$ ${num(b)}, quanto custam ${c} pães?`,
  },
  inversa: {
    a: 'Pedreiros',
    b: 'Dias de obra',
    unitA: 'pedreiros',
    unitB: 'dias',
    story: (a, b, c) => `${a} pedreiros constroem um muro em ${num(b)} dias. Em quantos dias ${c} pedreiros constroem o mesmo muro?`,
  },
}

/** Uma linha da cena: os ícones da grandeza A e o valor da grandeza B. */
function SceneRow({ icon: Icon, count, value, unit, color, hidden }: { icon: LucideIcon; count: number; value: string; unit: 'preco' | 'dias'; color: string; hidden: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-2">
      <div className="flex flex-1 flex-wrap gap-1">
        {Array.from({ length: count }, (_, i) => (
          <motion.span key={i} initial={{ scale: 0, y: -10 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 18, delay: i * 0.03 }} className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}>
            <Icon size={20} />
          </motion.span>
        ))}
      </div>
      <motion.div key={hidden ? 'h' : value} initial={{ rotate: -8, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} className="flex min-w-[92px] items-center justify-center gap-1 rounded-xl px-2 py-2 font-mono text-base font-black text-white shadow" style={{ background: hidden ? '#94a3b8' : color }}>
        {unit === 'dias' && <CalendarDays size={16} />}
        {hidden ? '?' : unit === 'preco' ? `R$ ${value}` : `${value} dias`}
      </motion.div>
    </div>
  )
}

function RuleMode({ kind }: { kind: 'direta' | 'inversa' }) {
  const reduceMotion = useReducedMotion() ?? false
  const [a, setA] = useState(kind === 'direta' ? 3 : 4)
  const [b, setB] = useState(kind === 'direta' ? 6 : 6)
  const [c, setC] = useState(kind === 'direta' ? 7 : 6)
  const s = scenarios[kind]
  const x = kind === 'direta' ? directRule(a, b, c) : inverseRule(a, b, c)
  const steps = useStepper(`${kind}:${a}:${b}:${c}`, 3, 900)
  const grows = c > a
  const xGrows = x > b
  // Mesma escala nos dois retângulos, para as áreas poderem ser comparadas.
  const unit = Math.min(150 / Math.max(a, c), 110 / Math.max(b, x))

  const stepTexts =
    kind === 'direta'
      ? [
          `As grandezas são diretamente proporcionais: mais pães, mais dinheiro. As setas vão no mesmo sentido.`,
          `Monte a proporção e multiplique cruzado: ${a} · x = ${num(b)} · ${c}`,
          `x = ${num(b)} · ${c} ÷ ${a} = ${num(x)} ${s.unitB}`,
        ]
      : [
          `As grandezas são inversamente proporcionais: mais pedreiros, menos dias. As setas vão em sentidos opostos.`,
          `O trabalho total não muda: ${a} · ${num(b)} = ${c} · x (inverta uma das razões antes de cruzar).`,
          `x = ${a} · ${num(b)} ÷ ${c} = ${num(x)} ${s.unitB}`,
        ]

  return (
    <>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel stage>
          <p className="rounded-xl bg-slate-50 p-3 text-base font-bold text-slate-800 sm:text-lg">{s.story(a, b, c)}</p>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr_auto] items-center gap-x-2 gap-y-2 text-center font-mono text-2xl font-black sm:text-3xl">
            <span className="text-xs font-sans font-black uppercase tracking-wide text-slate-500">{s.a}</span>
            <span />
            <span className="text-xs font-sans font-black uppercase tracking-wide text-slate-500">{s.b}</span>
            <span />
            <span className="rounded-xl border border-slate-200 bg-white py-2 text-slate-900">{a}</span>
            <span className="row-span-2 text-blue-700">{grows ? <ArrowDown aria-label="aumenta" /> : <ArrowUp aria-label="diminui" />}</span>
            <span className="rounded-xl border border-slate-200 bg-white py-2 text-slate-900">{num(b)}</span>
            <span className={`row-span-2 ${kind === 'direta' ? 'text-blue-700' : 'text-rose-700'}`}>{xGrows ? <ArrowDown aria-label="aumenta" /> : <ArrowUp aria-label="diminui" />}</span>
            <span className="rounded-xl border border-slate-200 bg-white py-2 text-slate-900">{c}</span>
            <span className={`rounded-xl border-2 py-2 ${steps.done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-dashed border-blue-200 bg-blue-50 text-blue-700'}`}>{steps.done ? num(x) : 'x'}</span>
          </div>

          <div className="mt-4 space-y-2" aria-hidden="true">
            <SceneRow icon={kind === 'direta' ? Croissant : HardHat} count={Math.min(a, 12)} value={num(b)} unit={kind === 'direta' ? 'preco' : 'dias'} color="#0e7490" hidden={false} />
            <SceneRow icon={kind === 'direta' ? Croissant : HardHat} count={Math.min(c, 12)} value={num(x)} unit={kind === 'direta' ? 'preco' : 'dias'} color="#7c3aed" hidden={!steps.done} />
          </div>
          {kind === 'inversa' && (
            <div className="mt-4 flex flex-wrap items-end justify-center gap-6" aria-hidden="true">
              {[
                { w: a, h: b, label: `${a} × ${num(b)}` },
                { w: c, h: x, label: `${c} × ${steps.done ? num(x) : 'x'}` },
              ].map((r, i) => (
                <div key={i} className="text-center">
                  <svg width={Math.max(30, r.w * unit) + 4} height={Math.max(20, r.h * unit) + 4}>
                    <rect x={2} y={2} width={Math.max(26, r.w * unit)} height={Math.max(16, r.h * unit)} rx={4} fill={i ? '#0f766e' : '#1d4ed8'} fillOpacity={0.25} stroke={i ? '#0f766e' : '#1d4ed8'} strokeWidth={2} />
                  </svg>
                  <p className="font-mono text-xs font-bold text-slate-600">{r.label}</p>
                </div>
              ))}
              <p className="w-full text-center text-xs font-semibold text-slate-500">Os dois retângulos têm a mesma área: é o mesmo trabalho total.</p>
            </div>
          )}

          <ol className="mt-4 space-y-2" aria-live="polite">
            {stepTexts.slice(0, steps.shown).map((text, i) => (
              <li key={i} className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-black text-white">{i + 1}</span>
                <span className={i > 0 ? 'font-mono' : ''}>{text}</span>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={steps.step} disabled={steps.done} className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-base font-black text-white shadow-md transition hover:bg-blue-800 active:scale-95 disabled:opacity-50">
              <ListChecks size={18} /> {steps.done ? 'Resolvido!' : `Próximo passo (${steps.shown + 1}/3)`}
            </button>
            <button type="button" onClick={() => steps.play(reduceMotion)} className="min-h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
              Resolver tudo
            </button>
          </div>
        </Panel>
        <Panel title="Mude o problema">
          <div className="space-y-4">
            <NumberControl label={`${s.a} (situação conhecida)`} value={a} min={1} max={12} step={1} onChange={setA} />
            <NumberControl label={s.b} value={b} min={1} max={30} step={1} onChange={setB} />
            <NumberControl label={`${s.a} (nova situação)`} value={c} min={1} max={12} step={1} onChange={setC} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            {kind === 'direta' ? 'Na direta, dobrar uma grandeza dobra a outra.' : 'Na inversa, dobrar uma grandeza divide a outra pela metade.'}
          </p>
        </Panel>
      </div>
      <ChallengeCard
        simulator={`proporcao-${kind}`}
        goals={
          kind === 'direta'
            ? [
                { id: 'resolver', text: 'Resolva uma regra de três direta até o fim.', met: steps.done },
                { id: 'dobro', text: 'Monte um problema em que a nova quantidade é o dobro (e veja o preço dobrar).', met: c === 2 * a },
                { id: 'decimal', text: 'Encontre um problema em que a resposta não é um número inteiro.', met: steps.done && !Number.isInteger(x) },
                { id: 'menos', text: 'Resolva um problema em que a nova quantidade é menor que a conhecida.', met: steps.done && c < a },
              ]
            : [
                { id: 'resolver', text: 'Resolva uma regra de três inversa até o fim.', met: steps.done },
                { id: 'metade', text: 'Dobre os pedreiros e veja os dias caírem pela metade.', met: c === 2 * a },
                { id: 'mais-dias', text: 'Faça um problema em que a obra demora mais dias.', met: steps.done && x > b },
                { id: 'um', text: 'Descubra quantos dias 1 pedreiro sozinho levaria.', met: steps.done && c === 1 },
              ]
        }
      />
    </>
  )
}

export default function Proporcao() {
  const [mode, setMode] = useState<Mode>('razao')
  return (
    <PresentationMode title="Razão e Regra de Três">
      <SimulatorHeader id="proporcao">
        Uma razão compara duas quantidades. Quando duas razões são iguais, temos uma proporção, e a regra de três descobre o valor que falta.
      </SimulatorHeader>
      <div className="mb-4 sm:mb-6">
        <SegmentedControl label="Escolha o assunto" options={modes} value={mode} onChange={setMode} />
      </div>
      {mode === 'razao' ? <RatioMode /> : <RuleMode key={mode} kind={mode} />}
      <TipBox>
        <strong>Como saber se é direta ou inversa?</strong> Pergunte: “se uma aumentar, a outra aumenta ou diminui?”. Se as duas sobem juntas, é direta. Se uma sobe e a outra desce, é inversa.
      </TipBox>
    </PresentationMode>
  )
}
