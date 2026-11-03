import { useState } from 'react'
import { Hammer, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import { useStepper } from '../components/ui/useStepper'
import { classify, formatTerm as fmt, sum, terms, type ProgressionKind } from '../logic/progressoes'

const COLOR = '#7c3aed'
const defaults: Record<ProgressionKind, { a1: number; step: number }> = {
  pa: { a1: 2, step: 3 },
  pg: { a1: 1, step: 2 },
}

function shadeBlock(light: boolean) {
  return light ? '#c4b5fd' : COLOR
}

/** Torres de blocos: a parte clara de cada torre é o que foi acrescentado desde o termo anterior. */
function TermsChart({ values, shown, stepText }: { values: number[]; shown: number; stepText: string }) {
  const width = 640
  const height = 300
  const top = 36
  const bottom = 34
  const blocksOk = values.every((v) => v >= 0 && Number.isInteger(v))
  const maxValue = Math.max(1, ...values)
  const minValue = Math.min(0, ...values)
  const span = maxValue - minValue || 1
  const toY = (value: number) => top + ((maxValue - value) / span) * (height - top - bottom)
  const slot = (width - 20) / values.length
  const barWidth = Math.min(46, slot * 0.68)
  const unit = 1
  const useBlocks = blocksOk && maxValue <= 30
  const blockH = (toY(0) - toY(unit))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full" role="img" aria-label={`Termos: ${values.map(fmt).join(', ')}`}>
      <line x1={10} x2={width - 10} y1={toY(0)} y2={toY(0)} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
      {values.map((value, i) => {
        if (i >= shown) return null
        const x = 10 + slot * i + (slot - barWidth) / 2
        const prev = i > 0 ? values[i - 1] : 0
        const y = Math.min(toY(value), toY(0))
        const barHeight = Math.max(2, Math.abs(toY(value) - toY(0)))
        const blocks = Math.round(value / unit)
        const oldBlocks = i > 0 ? Math.min(blocks, Math.round(prev / unit)) : 0
        return (
          <motion.g key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
            {useBlocks ? (
              Array.from({ length: blocks }, (_, k) => (
                <rect key={k} x={x} y={toY(0) - (k + 1) * blockH + 1} width={barWidth} height={Math.max(1, blockH - 2)} rx={Math.min(4, blockH / 3)} fill={shadeBlock(k >= oldBlocks && i > 0)} stroke="#ffffff" strokeOpacity={0.6} strokeWidth={blockH > 6 ? 1 : 0} />
              ))
            ) : blocksOk ? (
              <g>
                <rect x={x} y={y} width={barWidth} height={barHeight} rx={5} fill={shadeBlock(i > 0)} />
                {i > 0 && <rect x={x} y={toY(prev)} width={barWidth} height={Math.max(0, toY(0) - toY(prev))} rx={5} fill={COLOR} />}
              </g>
            ) : (
              <motion.rect initial={false} animate={{ y, height: barHeight }} transition={{ type: 'spring', stiffness: 160, damping: 20 }} x={x} width={barWidth} rx={5} fill={COLOR} opacity={0.85} />
            )}
            {values.length <= 12 && (
              <text x={x + barWidth / 2} y={value >= 0 ? y - 6 : y + barHeight + 14} textAnchor="middle" fontSize={12} fontWeight={900} style={{ fill: 'var(--svg-text)' }}>
                {fmt(value)}
              </text>
            )}
            {i > 0 && values.length <= 10 && (
              <g>
                <path d={`M ${x - slot + barWidth * 0.8} ${Math.min(toY(prev), toY(0)) - 20} Q ${x - slot / 2 + barWidth / 2} ${Math.min(toY(prev), toY(value)) - 44} ${x + barWidth * 0.2} ${y - 22}`} fill="none" stroke="#a78bfa" strokeWidth={2} strokeDasharray="4 4" markerEnd="url(#arrow-pg)" />
                <text x={x - slot / 2 + barWidth / 2} y={Math.min(toY(prev), toY(value)) - 40} textAnchor="middle" fontSize={11} fontWeight={900} fill={COLOR}>
                  {stepText}
                </text>
              </g>
            )}
            <text x={x + barWidth / 2} y={height - 12} textAnchor="middle" fontSize={11} fontWeight={700} style={{ fill: 'var(--svg-muted)' }}>
              a{i + 1}
            </text>
          </motion.g>
        )
      })}
      <defs>
        <marker id="arrow-pg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#a78bfa" />
        </marker>
      </defs>
      {useBlocks && (
        <text x={14} y={16} fontSize={11} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
          cada bloco = 1
        </text>
      )}
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
  const build = useStepper(`${kind}:${a1}:${step}:${n}`, n, 450)
  // Fora da construção (ou quando os valores mudam), todos os termos aparecem.
  const shown = build.running || build.shown > 0 ? build.shown : n

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
          <Panel stage title="Termos da sequência">
            <ol className="mb-4 flex flex-wrap items-center gap-1 font-mono" aria-label="Termos e a passagem de um para o outro">
              {values.map((value, i) => (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-xs font-black text-violet-700">{stepText}</span>}
                  <span className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-base font-black text-slate-900 sm:text-lg">{fmt(value)}</span>
                </li>
              ))}
            </ol>
            <TermsChart values={values} shown={shown} stepText={stepText} />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => build.play()} disabled={build.running} className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-black text-white shadow">
                <Hammer size={16} /> {build.running ? 'Construindo…' : 'Construir termo a termo'}
              </button>
              <p className="flex-1 text-xs font-semibold text-slate-600">{isPa ? `A parte clara de cada torre são os ${fmt(Math.abs(step))} que entram a cada passo: na PA o acréscimo é sempre igual.` : `A parte clara é o que cresceu: na PG o acréscimo aumenta, porque cada torre é ${fmt(step)} vezes a anterior.`}</p>
            </div>
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
