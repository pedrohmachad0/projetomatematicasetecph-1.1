import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, Tag } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import { calculateDiscount, calculateIncrease, calculatePercentage, formatPercentage } from '../logic/percentage'

type Mode = 'percentage' | 'discount' | 'increase'

const modes: Array<{ id: Mode; label: string }> = [
  { id: 'percentage', label: 'Parte de um valor' },
  { id: 'discount', label: 'Desconto' },
  { id: 'increase', label: 'Acréscimo' },
]

const PART = '#0e7490'
const OFF = '#dc2626'
const EXTRA = '#16a34a'
const br = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const shortcuts: Record<number, string> = { 10: '÷ 10', 20: '÷ 5', 25: '÷ 4', 50: '÷ 2', 75: '÷ 4 × 3', 100: 'o valor todo' }

function PriceTag({ mode, base, total, percentage }: { mode: Mode; base: number; total: number; percentage: number }) {
  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      <svg viewBox="0 0 300 150" className="block h-auto w-full drop-shadow-md" aria-hidden="true">
        <path d="M 40 10 L 285 10 Q 292 10 292 17 L 292 133 Q 292 140 285 140 L 40 140 L 8 75 Z" fill="#fef3c7" stroke="#d97706" strokeWidth={3} />
        <circle cx={38} cy={75} r={8} fill="#ffffff" stroke="#d97706" strokeWidth={3} />
        <path d="M 30 75 Q 10 40 -4 30" fill="none" stroke="#a16207" strokeWidth={2} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pl-10 text-center">
        {mode === 'percentage' ? (
          <>
            <p className="text-[11px] font-black uppercase tracking-widest text-amber-800">{formatPercentage(percentage)} de</p>
            <p className="font-mono text-2xl font-black text-amber-950">{br(base)}</p>
          </>
        ) : (
          <>
            <p className="font-mono text-base font-bold text-amber-800 line-through decoration-2" style={{ textDecorationColor: mode === 'discount' ? OFF : undefined, textDecorationLine: mode === 'discount' ? 'line-through' : 'none' }}>
              {money(base)}
            </p>
            <motion.p key={total} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="font-mono text-2xl font-black" style={{ color: mode === 'discount' ? OFF : EXTRA }}>
              {money(total)}
            </motion.p>
          </>
        )}
      </div>
      {mode !== 'percentage' && percentage > 0 && (
        <motion.span key={`${mode}${percentage}`} initial={{ rotate: -30, scale: 0 }} animate={{ rotate: -12, scale: 1 }} className="absolute -right-2 -top-3 flex h-16 w-16 flex-col items-center justify-center rounded-full text-white shadow-lg ring-4 ring-white" style={{ background: mode === 'discount' ? OFF : EXTRA }}>
          {mode === 'discount' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
          <span className="text-sm font-black leading-none">{mode === 'discount' ? '−' : '+'}{percentage}%</span>
        </motion.span>
      )}
    </div>
  )
}

function Grid({ mode, percentage }: { mode: Mode; percentage: number }) {
  const filled = Math.round(Math.min(Math.max(percentage, 0), 100))
  const cells = mode === 'increase' ? 100 + filled : 100
  return (
    <div className="mx-auto grid max-w-[440px] grid-cols-10 gap-1 sm:gap-1.5" role="img" aria-label={mode === 'increase' ? `100 quadradinhos mais ${filled} de acréscimo` : `${filled} de 100 quadradinhos destacados`}>
      {Array.from({ length: cells }, (_, i) => {
        const extra = i >= 100
        // Desconto: os primeiros quadradinhos são riscados e o resto é o que se paga.
        // Acréscimo: os 100 ficam inteiros e os extras aparecem em verde.
        const removed = mode === 'discount' && i < filled
        const on = extra || mode !== 'percentage' || i < filled
        const color = extra ? EXTRA : removed ? OFF : PART
        return (
          <motion.div
            key={i}
            initial={false}
            animate={{ scale: on ? 1 : 0.86 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22, delay: on ? (extra ? i - 100 : i) * 0.004 : 0 }}
            className={`relative aspect-square rounded-[4px] ${on ? '' : 'bg-slate-100'}`}
            style={on ? { background: color, opacity: mode === 'discount' && !removed ? 0.75 : 1, boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.18)' } : undefined}
          >
            {removed && <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/90">×</span>}
          </motion.div>
        )
      })}
    </div>
  )
}

function DoubleLine({ base, percentage, mode }: { base: number; percentage: number; mode: Mode }) {
  const W = 560
  const X = (p: number) => 30 + (p / 100) * (W - 60)
  const color = mode === 'discount' ? OFF : PART
  return (
    <svg viewBox={`0 0 ${W} 96`} className="block h-auto w-full" role="img" aria-label={`${percentage}% corresponde a ${br(calculatePercentage(base, percentage))}`}>
      <line x1={X(0)} x2={X(100)} y1={30} y2={30} strokeWidth={6} strokeLinecap="round" style={{ stroke: 'var(--svg-grid)' }} />
      <motion.line initial={false} animate={{ x2: X(percentage) }} x1={X(0)} y1={30} y2={30} stroke={color} strokeWidth={6} strokeLinecap="round" />
      {[0, 25, 50, 75, 100].map((p) => (
        <g key={p}>
          <line x1={X(p)} x2={X(p)} y1={22} y2={38} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
          <text x={X(p)} y={14} textAnchor="middle" fontSize={13} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
            {p}%
          </text>
          <text x={X(p)} y={58} textAnchor="middle" fontSize={13} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
            {br((base * p) / 100)}
          </text>
        </g>
      ))}
      <motion.g initial={false} animate={{ x: X(percentage) }}>
        <circle cx={0} cy={30} r={9} fill="#ffffff" stroke={color} strokeWidth={4} />
        <rect x={-46} y={66} width={92} height={26} rx={13} fill={color} />
        <text x={0} y={84} textAnchor="middle" fontSize={14} fontWeight={900} fill="#ffffff">
          {br(calculatePercentage(base, percentage))}
        </text>
      </motion.g>
    </svg>
  )
}

export default function Porcentagem() {
  const [mode, setMode] = useState<Mode>('percentage')
  const [value, setValue] = useState(200)
  const [percentage, setPercentage] = useState(20)

  const result = useMemo(() => {
    if (mode === 'discount') return calculateDiscount(value, percentage)
    if (mode === 'increase') return calculateIncrease(value, percentage)
    return { base: value, percentage, amount: calculatePercentage(value, percentage), total: value }
  }, [mode, value, percentage])
  const perPart = value / 100

  const sentence =
    mode === 'percentage'
      ? `${formatPercentage(percentage)} quer dizer ${percentage} partes de cada 100. Dividindo ${br(value)} em 100 partes, cada uma vale ${br(perPart)}. Então ${percentage} partes valem ${percentage} × ${br(perPart)} = ${br(result.amount)}.`
      : mode === 'discount'
        ? `O desconto risca ${percentage} dos 100 quadradinhos: ${percentage} × ${br(perPart)} = ${br(result.amount)} a menos. Sobram ${100 - percentage} partes, ou seja, ${br(result.total)}.`
        : `O acréscimo cola mais ${percentage} quadradinhos em cima dos 100: ${percentage} × ${br(perPart)} = ${br(result.amount)} a mais. Agora são ${100 + percentage} partes: ${br(result.total)}.`

  return (
    <PresentationMode title="Explorador de Porcentagem">
      <SimulatorHeader id="porcentagem">Porcentagem é uma forma de dividir em 100 partes iguais. Escolha o valor e a porcentagem e veja a grade, a etiqueta de preço e a reta dupla mudarem juntas.</SimulatorHeader>

      <div className="mb-4 sm:mb-6">
        <SegmentedControl label="O que calcular" options={modes} value={mode} onChange={setMode} />
      </div>

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel stage>
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">{mode === 'increase' ? `100 + ${percentage} partes` : '100 partes'}</p>
              <p className="text-sm font-semibold text-slate-600">
                Cada quadradinho vale <strong className="text-slate-900">{br(perPart)}</strong>
              </p>
            </div>
            <p className="font-mono text-3xl font-black sm:text-4xl" style={{ color: mode === 'discount' ? OFF : mode === 'increase' ? EXTRA : PART }} aria-live="polite">
              {mode === 'percentage' ? br(result.amount) : br(result.total)}
            </p>
          </div>
          <div className="mt-3">
            <Grid mode={mode} percentage={percentage} />
          </div>
          <div className="mt-4">
            <DoubleLine base={value} percentage={percentage} mode={mode} />
          </div>
          <p role="status" className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-relaxed text-slate-700">
            {sentence}
          </p>
        </Panel>

        <div className="space-y-4">
          <Panel title={mode === 'percentage' ? 'O valor' : 'A etiqueta'}>
            <PriceTag mode={mode} base={value} total={mode === 'percentage' ? result.amount : result.total} percentage={percentage} />
            {mode !== 'percentage' && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-bold text-slate-600">
                <Tag size={15} /> {mode === 'discount' ? 'Você economiza' : 'Aumento de'} <span style={{ color: mode === 'discount' ? OFF : EXTRA }}>{money(result.amount)}</span>
              </p>
            )}
          </Panel>
          <Panel title="Controles">
            <div className="space-y-4">
              <NumberControl label={mode === 'percentage' ? 'Valor' : 'Preço'} value={value} min={0} max={2000} step={10} onChange={setValue} format={br} />
              <NumberControl label="Porcentagem" value={percentage} min={0} max={100} step={1} onChange={setPercentage} format={(v) => `${v}%`} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[10, 20, 25, 50, 75, 100].map((p) => (
                <button key={p} type="button" aria-pressed={percentage === p} onClick={() => setPercentage(p)} className={`min-h-[40px] rounded-lg border px-2.5 text-left font-mono text-xs font-black ${percentage === p ? 'border-cyan-200 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-white text-slate-700'}`}>
                  {p}% <span className="block font-sans text-[10px] font-bold text-slate-500">{shortcuts[p]}</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
      <ChallengeCard
        simulator="porcentagem"
        goals={[
          { id: 'dez-350', text: 'Descubra quanto é 10% de 350.', met: mode === 'percentage' && value === 350 && percentage === 10 },
          { id: 'desconto-120', text: 'Dê um desconto em 150 para o preço final ficar 120.', met: mode === 'discount' && value === 150 && result.total === 120 },
          { id: 'acrescimo-250', text: 'Faça 200 virar 250 com um acréscimo.', met: mode === 'increase' && value === 200 && result.total === 250 },
          { id: 'metade', text: 'Mostre 50% de um valor maior que 1.000.', met: mode === 'percentage' && value > 1000 && percentage === 50 },
        ]}
      />
      <TipBox>
        <strong>Atalhos de cabeça:</strong> 10% é dividir por 10, 25% é dividir por 4 e 50% é a metade. Para 30%, faça 10% e multiplique por 3. Um desconto de 20% deixa você pagando 80% do preço.
      </TipBox>
    </PresentationMode>
  )
}
