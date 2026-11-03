import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import { classify, formatTerm as fmt, sum, terms, type ProgressionKind } from '../logic/progressoes'

const COLOR = '#7c3aed'
const defaults: Record<ProgressionKind, { a1: number; step: number }> = {
  pa: { a1: 2, step: 3 },
  pg: { a1: 1, step: 2 },
}

function TermsChart({ values }: { values: number[] }) {
  const width = 640
  const height = 280
  const top = 24
  const bottom = 36
  const maxValue = Math.max(0, ...values)
  const minValue = Math.min(0, ...values)
  const span = maxValue - minValue || 1
  const toY = (value: number) => top + ((maxValue - value) / span) * (height - top - bottom)
  const slot = (width - 20) / values.length
  const barWidth = Math.min(44, slot * 0.7)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full" role="img" aria-label={`Gráfico de barras dos termos: ${values.map(fmt).join(', ')}`}>
      <line x1={10} x2={width - 10} y1={toY(0)} y2={toY(0)} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
      {values.map((value, i) => {
        const x = 10 + slot * i + (slot - barWidth) / 2
        const y = Math.min(toY(value), toY(0))
        const barHeight = Math.max(2, Math.abs(toY(value) - toY(0)))
        return (
          <g key={i}>
            <motion.rect initial={false} animate={{ y, height: barHeight }} transition={{ type: 'spring', stiffness: 160, damping: 20 }} x={x} width={barWidth} rx={5} fill={COLOR} opacity={0.85} />
            {values.length <= 12 && (
              <text x={x + barWidth / 2} y={value >= 0 ? y - 6 : y + barHeight + 14} textAnchor="middle" fontSize={11} fontWeight={800} style={{ fill: 'var(--svg-text)' }}>
                {fmt(value)}
              </text>
            )}
            <text x={x + barWidth / 2} y={height - 12} textAnchor="middle" fontSize={11} fontWeight={700} style={{ fill: 'var(--svg-muted)' }}>
              a{i + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Progressoes() {
  const [kind, setKind] = useState<ProgressionKind>('pa')
  const [a1, setA1] = useState(defaults.pa.a1)
  const [step, setStep] = useState(defaults.pa.step)
  const [n, setN] = useState(8)
  const values = terms(kind, a1, step, n)
  const last = values[values.length - 1]
  const total = sum(kind, a1, step, n)
  const isPa = kind === 'pa'
  const stepName = isPa ? 'razão r' : 'razão q'
  const stepText = isPa ? `${step >= 0 ? '+' : '−'}${fmt(Math.abs(step))}` : `×${fmt(step)}`

  function changeKind(next: ProgressionKind) {
    setKind(next)
    setA1(defaults[next].a1)
    setStep(defaults[next].step)
  }

  return (
    <PresentationMode title="Progressões: PA e PG">
      <SimulatorHeader id="progressoes">
        Na PA cada termo é o anterior <strong>mais</strong> uma razão fixa; na PG, o anterior <strong>vezes</strong> uma razão fixa. Mude os valores e compare o crescimento.
      </SimulatorHeader>

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4 sm:space-y-5">
          <Panel title="Termos da sequência">
            <ol className="mb-4 flex flex-wrap items-center gap-1 font-mono" aria-label="Termos e a passagem de um para o outro">
              {values.map((value, i) => (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-xs font-black text-violet-700">{stepText}</span>}
                  <span className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-base font-black text-slate-900 sm:text-lg">{fmt(value)}</span>
                </li>
              ))}
            </ol>
            <TermsChart values={values} />
          </Panel>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <Panel title="Monte a progressão">
            <SegmentedControl
              label="Tipo de progressão"
              options={[
                { id: 'pa', label: 'PA (soma)' },
                { id: 'pg', label: 'PG (multiplica)' },
              ]}
              value={kind}
              onChange={changeKind}
            />
            <div className="mt-4 space-y-4">
              <NumberControl label="1º termo (a₁)" value={a1} min={-10} max={10} step={1} onChange={setA1} format={fmt} />
              {isPa ? (
                <NumberControl label={stepName} value={step} min={-5} max={5} step={1} onChange={setStep} format={fmt} />
              ) : (
                <NumberControl label={stepName} value={step} min={-3} max={3} step={0.5} onChange={setStep} format={fmt} />
              )}
              <NumberControl label="quantidade de termos (n)" value={n} min={2} max={12} step={1} onChange={setN} />
            </div>
            <button type="button" onClick={() => changeKind(kind)} className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
              <RotateCcw size={15} /> Restaurar exemplo
            </button>
          </Panel>

          <Panel title="Fórmulas com os seus valores">
            <dl className="space-y-3">
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
                <dt className="text-xs font-black uppercase tracking-wide text-violet-800">Termo geral</dt>
                <dd className="font-mono text-sm font-bold text-slate-700">{isPa ? 'aₙ = a₁ + (n − 1)·r' : 'aₙ = a₁ · qⁿ⁻¹'}</dd>
                <dd className="font-mono text-base font-black text-slate-900">
                  a{n} = {fmt(a1)} {isPa ? `+ (${n} − 1)·(${fmt(step)})` : `· (${fmt(step)})^${n - 1}`} = {fmt(last)}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <dt className="text-xs font-black uppercase tracking-wide text-slate-600">Soma dos {n} termos</dt>
                <dd className="font-mono text-sm font-bold text-slate-700">{isPa ? 'Sₙ = (a₁ + aₙ)·n ÷ 2' : step === 1 ? 'Sₙ = a₁ · n (q = 1)' : 'Sₙ = a₁·(qⁿ − 1) ÷ (q − 1)'}</dd>
                <dd className="font-mono text-base font-black text-slate-900">S{n} = {fmt(total)}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <dt className="text-xs font-black uppercase tracking-wide text-slate-600">Classificação</dt>
                <dd className="text-base font-black text-slate-900">{isPa ? 'PA' : 'PG'} {classify(kind, a1, step)}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>

      <ChallengeCard
        simulator="progressoes"
        goals={[
          { id: 'pa-30', text: 'Monte uma PA cujo 8º termo seja 30.', met: isPa && values.length >= 8 && values[7] === 30 },
          { id: 'pg-48', text: 'Monte uma PG cujo 5º termo seja 48.', met: !isPa && values.length >= 5 && values[4] === 48 },
          { id: 'pa-decrescente', text: 'Monte uma PA decrescente com 10 termos, todos positivos.', met: isPa && step < 0 && n >= 10 && values.every((value) => value > 0) },
          { id: 'soma-mil', text: 'Faça a soma dos termos passar de 1.000.', met: total > 1000 },
        ]}
      />
      <TipBox>
        <strong>Compare:</strong> com a₁ = 1, a PA de razão 2 chega a 23 no 12º termo; a PG de razão 2 chega a 2048. Somar sempre o mesmo valor gera crescimento linear; multiplicar gera crescimento exponencial.
      </TipBox>
    </PresentationMode>
  )
}
