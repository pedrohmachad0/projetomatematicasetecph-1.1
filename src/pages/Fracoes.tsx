import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, RotateCcw } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'

type View = 'pizza' | 'chocolate' | 'copo' | 'reta'

const views: Array<{ id: View; label: string }> = [
  { id: 'pizza', label: '🍕 Pizza' },
  { id: 'chocolate', label: '🍫 Chocolate' },
  { id: 'copo', label: '🥤 Copo' },
  { id: 'reta', label: '📏 Reta' },
]

const ACCENT = '#4f46e5'
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) || 1 : gcd(b, a % b))
const br = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 4 })

function Fraction({ n, d, className = '' }: { n: number; d: number; className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`} aria-label={`${n} sobre ${d}`}>
      <span className="border-b-[3px] border-current px-2 pb-1">{n}</span>
      <span className="px-2 pt-1">{d}</span>
    </span>
  )
}

function Pizza({ d, picked, onToggle }: { d: number; picked: number[]; onToggle: (i: number) => void }) {
  const R = 120
  const C = 150
  const slice = (i: number) => {
    const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / d
    const a1 = a0 + (2 * Math.PI) / d
    if (d === 1) return `M ${C - R} ${C} A ${R} ${R} 0 1 1 ${C + R} ${C} A ${R} ${R} 0 1 1 ${C - R} ${C} Z`
    return `M ${C} ${C} L ${C + R * Math.cos(a0)} ${C + R * Math.sin(a0)} A ${R} ${R} 0 0 1 ${C + R * Math.cos(a1)} ${C + R * Math.sin(a1)} Z`
  }
  return (
    <svg viewBox="0 0 300 300" className="mx-auto block h-auto w-full max-w-[340px] touch-manipulation select-none" role="img" aria-label={`Pizza em ${d} fatias, ${picked.length} escolhidas`}>
      <circle cx={C} cy={C + 6} r={R + 12} fill="#000000" opacity={0.1} />
      <circle cx={C} cy={C} r={R + 10} fill="#d97706" />
      {Array.from({ length: d }, (_, i) => {
        const on = picked.includes(i)
        const mid = -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / d
        const dx = on && d > 1 ? Math.cos(mid) * 10 : 0
        const dy = on && d > 1 ? Math.sin(mid) * 10 : 0
        return (
          <motion.g key={`${d}-${i}`} initial={false} animate={{ x: dx, y: dy }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} onClick={() => onToggle(i)} style={{ cursor: 'pointer' }}>
            <path d={slice(i)} fill={on ? '#fbbf24' : '#fde68a'} stroke="#b45309" strokeWidth={2.5} strokeLinejoin="round" />
            {on &&
              [0.45, 0.72].map((r, k) => (
                <circle key={k} cx={C + R * r * Math.cos(mid + (k ? 0.12 : -0.1))} cy={C + R * r * Math.sin(mid + (k ? 0.12 : -0.1))} r={Math.max(5, 13 - d)} fill="#dc2626" stroke="#991b1b" strokeWidth={1.5} />
              ))}
          </motion.g>
        )
      })}
    </svg>
  )
}

function Chocolate({ d, picked, onToggle }: { d: number; picked: number[]; onToggle: (i: number) => void }) {
  const cols = d <= 6 ? d : Math.ceil(d / 2)
  const rows = Math.ceil(d / cols)
  return (
    <div className="mx-auto w-full max-w-[420px] rounded-2xl bg-[#5b3417] p-2 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)]">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }} role="img" aria-label={`Barra de chocolate em ${d} pedaços, ${picked.length} escolhidos`}>
        {Array.from({ length: d }, (_, i) => {
          const on = picked.includes(i)
          return (
            <motion.button
              key={`${d}-${i}`}
              type="button"
              aria-label={`Pedaço ${i + 1}`}
              aria-pressed={on}
              onClick={() => onToggle(i)}
              initial={false}
              animate={{ y: on ? -6 : 0, scale: on ? 1.03 : 1 }}
              className="rounded-lg"
              style={{
                aspectRatio: rows === 1 ? '0.7' : '1',
                background: on ? 'linear-gradient(145deg, #c084fc, #7c3aed)' : 'linear-gradient(145deg, #a16207, #78350f)',
                boxShadow: on ? '0 8px 14px -6px rgba(76,29,149,0.7), inset 0 -4px 0 rgba(0,0,0,0.25)' : 'inset 3px 3px 0 rgba(255,255,255,0.18), inset -3px -4px 0 rgba(0,0,0,0.3)',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

function Glass({ n, d }: { n: number; d: number }) {
  const H = 220
  const level = (n / d) * H
  return (
    <svg viewBox="0 0 220 280" className="mx-auto block h-auto w-full max-w-[180px]" role="img" aria-label={`Copo com ${n} de ${d} partes cheias`}>
      <defs>
        <clipPath id="glass-inside">
          <path d={`M 45 30 L 175 30 L 160 ${30 + H} L 60 ${30 + H} Z`} />
        </clipPath>
        <linearGradient id="juice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <g clipPath="url(#glass-inside)">
        <motion.rect initial={false} animate={{ y: 30 + H - level, height: level }} transition={{ type: 'spring', stiffness: 80, damping: 14 }} x={40} width={140} fill="url(#juice)" />
        <motion.ellipse initial={false} animate={{ cy: 30 + H - level }} transition={{ type: 'spring', stiffness: 80, damping: 14 }} cx={110} rx={70} ry={6} fill="#c4b5fd" opacity={n > 0 ? 0.9 : 0} />
      </g>
      {Array.from({ length: d - 1 }, (_, i) => {
        const y = 30 + H - ((i + 1) / d) * H
        return <line key={i} x1={150} x2={172 - ((y - 30) / H) * 15} y1={y} y2={y} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
      })}
      <path d={`M 45 30 L 175 30 L 160 ${30 + H} L 60 ${30 + H} Z`} fill="none" strokeWidth={5} strokeLinejoin="round" style={{ stroke: 'var(--svg-axis)' }} />
      <path d="M 62 44 L 72 230" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={6} strokeLinecap="round" />
    </svg>
  )
}

function NumberLine({ n, d }: { n: number; d: number }) {
  const X = (t: number) => 30 + t * 440
  return (
    <svg viewBox="0 0 500 130" className="block h-auto w-full" role="img" aria-label={`Reta de 0 a 1 dividida em ${d} partes, marcando ${n}/${d}`}>
      <line x1={X(0)} x2={X(1)} y1={70} y2={70} strokeWidth={5} strokeLinecap="round" style={{ stroke: 'var(--svg-axis)' }} />
      <motion.line initial={false} animate={{ x2: X(n / d) }} x1={X(0)} y1={70} y2={70} stroke={ACCENT} strokeWidth={8} strokeLinecap="round" />
      {Array.from({ length: d + 1 }, (_, i) => (
        <g key={i}>
          <line x1={X(i / d)} x2={X(i / d)} y1={58} y2={82} strokeWidth={i === 0 || i === d ? 4 : 2.5} style={{ stroke: 'var(--svg-ink)' }} />
          {(d <= 12 || i % 2 === 0) && (
            <text x={X(i / d)} y={104} textAnchor="middle" fontSize={i === 0 || i === d ? 18 : 13} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
              {i === 0 ? '0' : i === d ? '1' : `${i}/${d}`}
            </text>
          )}
        </g>
      ))}
      <motion.g initial={false} animate={{ x: X(n / d) }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
        <path d="M 0 52 L -12 30 L 12 30 Z" fill={ACCENT} />
        <rect x={-26} y={2} width={52} height={28} rx={8} fill={ACCENT} />
        <text y={22} textAnchor="middle" fontSize={15} fontWeight={900} fill="#ffffff">
          {n}/{d}
        </text>
      </motion.g>
    </svg>
  )
}

export default function Fracoes() {
  const [view, setView] = useState<View>('pizza')
  const [d, setD] = useState(4)
  const [picked, setPicked] = useState<number[]>([0])
  const n = picked.length
  const divisor = gcd(n, d)
  const simple = { n: n / divisor, d: d / divisor }
  const decimal = n / d

  function setNumerator(value: number) {
    setPicked(Array.from({ length: value }, (_, i) => i))
  }
  function setDenominator(value: number) {
    setD(value)
    setPicked((list) => Array.from({ length: Math.min(list.length, value) }, (_, i) => i))
  }
  function toggle(i: number) {
    setPicked((list) => (list.includes(i) ? list.filter((x) => x !== i) : [...list, i]))
  }

  const equivalents = [1, 2, 3].map((k) => ({ n: simple.n * k, d: simple.d * k })).filter((f) => f.d <= 24)

  return (
    <PresentationMode title="Explorador de Frações">
      <SimulatorHeader id="fracoes">Uma fração é um inteiro dividido em partes iguais. O denominador diz em quantas partes dividimos; o numerador, quantas pegamos. Toque nos pedaços para escolher.</SimulatorHeader>

      <div className="mb-4 sm:mb-6">
        <SegmentedControl label="Como representar" options={views} value={view} onChange={setView} />
      </div>

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel stage>
          <div className="mb-3 flex items-center justify-center gap-4">
            <span className="text-5xl font-black text-slate-900 sm:text-6xl" aria-live="polite">
              <Fraction n={n} d={d} />
            </span>
            <div className="text-left text-sm font-semibold text-slate-600">
              <p>
                <strong className="text-indigo-700">{n}</strong> pedaço{n === 1 ? '' : 's'} escolhido{n === 1 ? '' : 's'}
              </p>
              <p>
                de <strong className="text-slate-900">{d}</strong> pedaços iguais
              </p>
            </div>
          </div>
          <motion.div key={view} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            {view === 'pizza' && <Pizza d={d} picked={picked} onToggle={toggle} />}
            {view === 'chocolate' && <Chocolate d={d} picked={picked} onToggle={toggle} />}
            {view === 'copo' && <Glass n={n} d={d} />}
            {view === 'reta' && <NumberLine n={n} d={d} />}
          </motion.div>
          <p className="mt-3 text-center text-xs font-semibold text-slate-500">{view === 'pizza' || view === 'chocolate' ? 'Toque nos pedaços para pegar ou devolver.' : 'Use os controles para encher o copo ou andar na reta.'}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberControl label="Numerador (pegamos)" value={n} min={0} max={d} step={1} onChange={setNumerator} />
            <NumberControl label="Denominador (partes)" value={d} min={1} max={12} step={1} onChange={setDenominator} />
          </div>
          <button type="button" onClick={() => { setD(4); setNumerator(1) }} className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
            <RotateCcw size={15} /> Recomeçar
          </button>
        </Panel>

        <div className="space-y-4">
          <Panel title="Outros nomes da mesma quantidade">
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1 text-center">
              <div className="rounded-xl bg-indigo-50 p-2">
                <Fraction n={n} d={d} className="text-2xl font-black text-indigo-800" />
                <p className="mt-1 text-[10px] font-black uppercase text-slate-500">fração</p>
              </div>
              <ArrowRight size={18} className="text-slate-400" />
              <div className="rounded-xl bg-indigo-50 p-2">
                <p className="font-mono text-2xl font-black text-indigo-800">{br(decimal)}</p>
                <p className="mt-1 text-[10px] font-black uppercase text-slate-500">decimal</p>
              </div>
              <ArrowRight size={18} className="text-slate-400" />
              <div className="rounded-xl bg-indigo-50 p-2">
                <p className="font-mono text-2xl font-black text-indigo-800">{br(decimal * 100)}%</p>
                <p className="mt-1 text-[10px] font-black uppercase text-slate-500">porcentagem</p>
              </div>
            </div>
            <p className="mt-3 text-center font-mono text-sm font-bold text-slate-600">
              {n} ÷ {d} = {br(decimal)} · {br(decimal)} × 100 = {br(decimal * 100)}%
            </p>
          </Panel>
          <Panel title="Frações equivalentes">
            <p className="mb-3 text-sm text-slate-600">{n === 0 ? 'Pegue algum pedaço para ver as equivalentes.' : 'Todas ocupam o mesmo espaço da barra: são a mesma quantidade com nomes diferentes.'}</p>
            {n > 0 && (
              <ul className="space-y-2">
                {equivalents.map((f) => (
                  <li key={`${f.n}/${f.d}`} className="flex items-center gap-3">
                    <span className="w-14 text-center font-mono text-base font-black text-slate-800">
                      {f.n}/{f.d}
                    </span>
                    <div className="flex h-7 flex-1 overflow-hidden rounded-md border-2 border-indigo-900/70">
                      {Array.from({ length: f.d }, (_, i) => (
                        <motion.span key={i} initial={false} animate={{ backgroundColor: i < f.n ? ACCENT : 'rgba(148,163,184,0.15)' }} className="h-full flex-1 border-r border-white/70 last:border-r-0" />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {divisor > 1 && n > 0 && (
              <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-sm font-semibold text-emerald-800">
                Simplificando: {n}/{d} ÷ {divisor} = {simple.n}/{simple.d}
              </p>
            )}
          </Panel>
        </div>
      </div>

      <ChallengeCard
        simulator="fracoes"
        goals={[
          { id: 'meio-oitavos', text: 'Monte uma fração equivalente a 1/2 usando 8 partes.', met: n === 4 && d === 8 },
          { id: 'setenta-cinco', text: 'Mostre uma fração que vale 75%.', met: n > 0 && n * 4 === d * 3 },
          { id: 'dois-tercos', text: 'Monte uma fração diferente de 2/3 que se simplifica para 2/3.', met: simple.n === 2 && simple.d === 3 && d !== 3 },
          { id: 'inteiro', text: 'Represente um inteiro completo dividido em 5 partes.', met: n === 5 && d === 5 },
        ]}
      />
      <TipBox>
        <strong>Fração é divisão:</strong> 3/4 de uma pizza é o mesmo que dividir 3 pizzas entre 4 pessoas. Cada uma fica com 3 ÷ 4 = 0,75 de pizza. E 2/4, 4/8 e 1/2 são exatamente a mesma quantidade.
      </TipBox>
    </PresentationMode>
  )
}
