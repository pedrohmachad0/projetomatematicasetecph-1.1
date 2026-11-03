import { useMemo, useState } from 'react'
import { Lightbulb, Minus, Plus, RotateCcw } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import ChallengeCard from '../components/ui/ChallengeCard'
import { calculateDiscount, calculateIncrease, calculatePercentage, formatPercentage } from '../logic/percentage'

type Mode = 'percentage' | 'discount' | 'increase'

const modes: Array<{ id: Mode; label: string; description: string }> = [
  { id: 'percentage', label: 'Parte de um valor', description: 'Descubra quanto representa uma porcentagem.' },
  { id: 'discount', label: 'Desconto', description: 'Veja o valor retirado e o preço final.' },
  { id: 'increase', label: 'Acréscimo', description: 'Veja o aumento e o novo valor.' },
]

function formatNumber(value: number) {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

export default function Porcentagem() {
  const [mode, setMode] = useState<Mode>('percentage')
  const [value, setValue] = useState(200)
  const [percentage, setPercentage] = useState(25)

  const result = useMemo(() => {
    if (mode === 'discount') return calculateDiscount(value, percentage)
    if (mode === 'increase') return calculateIncrease(value, percentage)
    return { base: value, percentage, amount: calculatePercentage(value, percentage), total: value }
  }, [mode, value, percentage])

  const reset = () => {
    setMode('percentage')
    setValue(200)
    setPercentage(25)
  }

  const normalizedValue = Number.isFinite(value) ? value : 0
  const valuePerPart = normalizedValue / 100
  const filledBlocks = Math.round(Math.min(Math.max(percentage, 0), 100))

  return (
    <PresentationMode title="Explorador de Porcentagem">
      <SimulatorHeader id="porcentagem">Entenda porcentagens usando valores, uma grade de 100 partes, descontos e acréscimos em tempo real.</SimulatorHeader>

      <div className="mb-5 grid gap-2 sm:grid-cols-3">{modes.map((item) => <button key={item.id} type="button" onClick={() => setMode(item.id)} aria-pressed={mode === item.id} className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${mode === item.id ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 bg-white hover:border-blue-300'}`}><span className="block text-sm font-black text-slate-900">{item.label}</span><span className="mt-1 block text-xs text-slate-600">{item.description}</span></button>)}</div>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="sim-stage rounded-3xl border border-slate-200 p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-black text-slate-900">Monte seu exemplo</h2>
          <label className="mt-5 block text-sm font-bold text-slate-700">Valor base<input type="number" min="0" value={value} onChange={(event) => setValue(Number(event.target.value))} className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-3 text-lg font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
          <p className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-900">{formatNumber(normalizedValue)} ÷ 100 = <span className="text-blue-700">{formatNumber(valuePerPart)}</span> por parte</p>
          <label className="mt-5 block text-sm font-bold text-slate-700">Porcentagem: <span className="text-blue-700">{formatPercentage(percentage)}</span><input type="range" min="0" max="100" step="1" value={percentage} onChange={(event) => setPercentage(Number(event.target.value))} className="mt-3 w-full accent-blue-600" /><input type="number" min="0" max="100" value={percentage} onChange={(event) => setPercentage(Math.min(100, Math.max(0, Number(event.target.value))))} className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 px-3 font-bold outline-none focus:border-blue-500" /></label>
          <button type="button" onClick={reset} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800"><RotateCcw size={15} /> Restaurar exemplo</button>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-black text-slate-900">Visualização de 100 partes</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">Cada quadradinho representa <strong className="text-blue-700">{formatNumber(valuePerPart)}</strong> ({formatNumber(normalizedValue)} ÷ 100).</p>
          <div className="mt-4 grid grid-cols-10 gap-1.5">{Array.from({ length: 100 }, (_, index) => <div key={index} className={`flex aspect-square items-center justify-center rounded-sm px-0.5 text-[7px] font-black leading-none sm:text-[9px] ${index < filledBlocks ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`} aria-label={`Parte ${index + 1}: ${formatNumber(valuePerPart)}`} aria-hidden="true">{formatNumber(valuePerPart)}</div>)}</div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-600">{formatPercentage(percentage)} de {formatNumber(normalizedValue)}</p><p className="mt-1 text-3xl font-black text-blue-700">{formatNumber(result.amount)}</p>{mode !== 'percentage' && <p className="mt-2 text-sm text-slate-600">{mode === 'discount' ? 'Valor final após desconto:' : 'Novo valor após acréscimo:'} <strong className="text-slate-900">{formatNumber(result.total)}</strong></p>}</div>
          {mode === 'percentage' ? <p className="mt-4 text-sm text-slate-600">A porcentagem indica quantas partes de cada 100 estão sendo consideradas.</p> : <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-600">{mode === 'discount' ? <Minus size={16} /> : <Plus size={16} />} O cálculo mostra o impacto percentual sobre o valor base.</p>}
        </div>
      </section>
      <ChallengeCard
        simulator="porcentagem"
        goals={[
          { id: 'dez-350', text: 'Descubra quanto é 10% de 350.', met: mode === 'percentage' && value === 350 && percentage === 10 },
          { id: 'desconto-120', text: 'Dê um desconto em 150 para o preço final ficar 120.', met: mode === 'discount' && value === 150 && result.total === 120 },
          { id: 'acrescimo-250', text: 'Faça 200 virar 250 com um acréscimo.', met: mode === 'increase' && value === 200 && result.total === 250 },
          { id: 'metade', text: 'Mostre 50% de um valor maior que 1.000.', met: mode === 'percentage' && value > 1000 && percentage === 50 },
        ]}
      />
      <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900"><Lightbulb className="mt-0.5 shrink-0 text-amber-600" size={20} /><p><strong>Dica:</strong> 25% é a mesma coisa que dividir por 4, e 50% é a metade. Experimente mudar os valores e observe a grade.</p></div>
    </PresentationMode>
  )
}
