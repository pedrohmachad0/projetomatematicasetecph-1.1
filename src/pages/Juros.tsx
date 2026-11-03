import { useState } from 'react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import Fact from '../components/ui/Fact'
import { useCompact } from '../components/ui/useCompact'
import { money, table } from '../logic/juros'

const SIMPLE = '#1d4ed8'
const COMPOUND = '#4d7c0f'

export default function Juros() {
  const [capital, setCapital] = useState(1000)
  const [rate, setRate] = useState(3)
  const [months, setMonths] = useState(12)
  const [month, setMonth] = useState(6)
  const compact = useCompact()
  const k = compact ? 1.8 : 1
  const W = 560
  const H = compact ? 420 : 300
  const PAD = { l: 64 * k, r: 16, t: 16, b: 36 * k }
  const rows = table(capital, rate, months)
  const at = rows[Math.min(month, months)]
  const max = rows[rows.length - 1].compound
  const X = (m: number) => PAD.l + (m / months) * (W - PAD.l - PAD.r)
  const Y = (v: number) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b)
  const line = (key: 'simple' | 'compound') => rows.map((r, i) => `${i ? 'L' : 'M'} ${X(r.month).toFixed(1)} ${Y(r[key]).toFixed(1)}`).join(' ')
  const yTicks = Array.from({ length: 5 }, (_, i) => (max * i) / 4)
  const barW = Math.max(3, ((W - PAD.l - PAD.r) / (months + 1)) * 0.35)
  const doubled = rows.find((r) => r.compound >= 2 * capital)
  const simpleInterest = at.simple - capital
  const compoundInterest = at.compound - capital
  const shown = Math.min(month, months)

  return (
    <PresentationMode title="Juros Simples e Compostos">
      <SimulatorHeader id="juros">
        Nos juros simples, todo mês rende a mesma quantia, calculada sobre o valor inicial. Nos compostos, rende juros sobre juros: cada mês calcula a taxa sobre o valor acumulado.
      </SimulatorHeader>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel stage>
          <div className="mb-2 flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm font-black">
            <span className="accent-text" style={{ ['--accent' as string]: SIMPLE }}>━ Juros simples (reta)</span>
            <span className="accent-text" style={{ ['--accent' as string]: COMPOUND }}>━ Juros compostos (curva)</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full touch-manipulation" role="img" aria-label={`Gráfico do montante em ${months} meses: simples ${money(rows[months].simple)}, compostos ${money(rows[months].compound)}`}>
            {yTicks.map((v) => (
              <g key={v}>
                <line x1={PAD.l} x2={W - PAD.r} y1={Y(v)} y2={Y(v)} strokeWidth={1} style={{ stroke: 'var(--svg-grid)' }} />
                <text x={PAD.l - 6} y={Y(v) + 4} textAnchor="end" fontSize={11 * k} fontWeight={700} style={{ fill: 'var(--svg-muted)' }}>
                  {compact && v >= 1000 ? `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil` : Math.round(v).toLocaleString('pt-BR')}
                </text>
              </g>
            ))}
            {rows.map((r) => (
              <g key={r.month} onClick={() => setMonth(r.month)} style={{ cursor: 'pointer' }}>
                <rect x={X(r.month) - barW - 1} y={Y(r.simple)} width={barW} height={Y(0) - Y(r.simple)} fill={SIMPLE} opacity={r.month === shown ? 0.9 : 0.25} />
                <rect x={X(r.month) + 1} y={Y(r.compound)} width={barW} height={Y(0) - Y(r.compound)} fill={COMPOUND} opacity={r.month === shown ? 0.9 : 0.25} />
                {(months <= (compact ? 6 : 12) || r.month % (compact ? Math.ceil(months / 6) : 2) === 0) && (
                  <text x={X(r.month)} y={H - PAD.b + 16 * k} textAnchor="middle" fontSize={11 * k} fontWeight={r.month === shown ? 900 : 700} style={{ fill: r.month === shown ? 'var(--svg-ink)' : 'var(--svg-muted)' }}>
                    {r.month}
                  </text>
                )}
              </g>
            ))}
            <path d={line('simple')} fill="none" stroke={SIMPLE} strokeWidth={3} />
            <path d={line('compound')} fill="none" stroke={COMPOUND} strokeWidth={3} />
            <line x1={X(shown)} x2={X(shown)} y1={PAD.t} y2={Y(0)} strokeWidth={1.5} strokeDasharray="4 4" style={{ stroke: 'var(--svg-ink)' }} />
            <text x={(PAD.l + W - PAD.r) / 2} y={H - 4} textAnchor="middle" fontSize={11 * k} fontWeight={800} style={{ fill: 'var(--svg-muted)' }}>
              meses
            </text>
          </svg>
          <p role="status" className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
            No mês {shown}: os juros simples renderam {money(simpleInterest)} e os compostos, {money(compoundInterest)}. Diferença: {money(compoundInterest - simpleInterest)}.
            {shown <= 1 && ' No primeiro mês os dois são iguais: a diferença só aparece quando os juros começam a render juros.'}
          </p>
        </Panel>
        <div className="space-y-4">
          <Panel title="Aplicação">
            <div className="space-y-4">
              <NumberControl label="Capital inicial" value={capital} min={100} max={5000} step={100} onChange={setCapital} format={money} />
              <NumberControl label="Taxa ao mês" value={rate} min={1} max={20} step={1} onChange={setRate} format={(v) => `${v}%`} />
              <NumberControl label="Tempo (meses)" value={months} min={1} max={24} step={1} onChange={(v) => { setMonths(v); setMonth(Math.min(month, v)) }} />
              <NumberControl label="Ver o mês" value={shown} min={0} max={months} step={1} onChange={setMonth} />
            </div>
          </Panel>
          <Panel title={`Montante no mês ${shown}`}>
            <dl className="grid gap-2">
              <Fact label="Simples" value={money(at.simple)} detail={`M = C · (1 + i · t) = ${capital} · (1 + ${rate / 100} · ${shown})`} />
              <Fact label="Compostos" value={money(at.compound)} detail={`M = C · (1 + i)ᵗ = ${capital} · ${1 + rate / 100}^${shown}`} highlight />
            </dl>
            <p className="mt-3 text-xs font-semibold text-slate-600">{doubled ? `Nos compostos, o dinheiro dobra no mês ${doubled.month}.` : 'Nesse prazo, o dinheiro ainda não dobra nos compostos.'}</p>
          </Panel>
        </div>
      </div>
      <Panel className="mt-4 sm:mt-6" title="Mês a mês">
        <div className="max-h-72 overflow-auto">
          <table className="w-full min-w-[320px] text-right font-mono text-xs sm:text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="text-[11px] uppercase text-slate-500">
                <th className="p-2 text-left font-sans">Mês</th>
                <th className="p-2 font-sans">Simples</th>
                <th className="p-2 font-sans">Compostos</th>
                <th className="p-2 font-sans">Juros do mês (compostos)</th>
              </tr>
            </thead>
            <tbody className="font-bold text-slate-800">
              {rows.map((r, i) => (
                <tr key={r.month} onClick={() => setMonth(r.month)} className={`cursor-pointer ${r.month === shown ? 'bg-blue-50' : ''}`}>
                  <td className="p-2 text-left">{r.month}</td>
                  <td className="p-2">{money(r.simple)}</td>
                  <td className="p-2">{money(r.compound)}</td>
                  <td className="p-2 text-slate-600">{i === 0 ? '—' : `+ ${money(r.compound - rows[i - 1].compound)}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-500">Nos simples, os juros de cada mês são sempre {money((capital * rate) / 100)}. Nos compostos, eles crescem todo mês.</p>
      </Panel>
      <ChallengeCard
        simulator="juros"
        goals={[
          { id: 'igual', text: 'Encontre o mês em que simples e compostos ainda são iguais.', met: shown === 1 },
          { id: 'dobrar', text: 'Faça o dinheiro dobrar nos juros compostos em até 12 meses.', met: Boolean(doubled && doubled.month <= 12) },
          { id: 'diferenca', text: 'Faça a diferença entre os dois passar de R$ 1.000,00.', met: compoundInterest - simpleInterest > 1000 },
          { id: 'longo', text: 'Simule dois anos de aplicação.', met: months === 24 && shown === 24 },
        ]}
      />
      <TipBox>
        <strong>O mesmo vale para dívidas:</strong> o cartão de crédito e o cheque especial cobram juros compostos com taxas altas. Uma dívida de R$ 1.000 a 10% ao mês vira mais de R$ 3.100 em um ano. Por isso vale a pena pagar o quanto antes.
      </TipBox>
    </PresentationMode>
  )
}
