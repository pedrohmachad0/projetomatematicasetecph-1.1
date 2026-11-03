import { useState } from 'react'
import { Minus, Plus, RotateCcw, Trash2 } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import TipBox from '../components/ui/TipBox'
import { describeModes, frequencies, mean, median, modes, range, sortValues } from '../logic/estatistica'

const MIN = 0
const MAX = 10
const MAX_ITEMS = 16

const presets: Array<{ id: string; label: string; values: number[] }> = [
  { id: 'turma', label: 'Notas de uma turma', values: [7, 5, 9, 5, 8, 6, 7, 5] },
  { id: 'discrepante', label: 'Com um valor discrepante', values: [7, 8, 7, 6, 8, 7, 0] },
  { id: 'bimodal', label: 'Dois grupos', values: [3, 3, 4, 3, 8, 8, 9, 8] },
]

const MEAN_COLOR = '#c2410c'
const MEDIAN_COLOR = '#0f766e'

function format(value: number) {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

function DotPlot({ values }: { values: number[] }) {
  const counts = frequencies(values, MIN, MAX)
  const highest = Math.max(4, ...counts)
  const width = 640
  const left = 30
  const right = 20
  const base = 250
  const dot = Math.min(20, 200 / highest)
  const scale = (value: number) => left + ((value - MIN) / (MAX - MIN)) * (width - left - right)
  const average = mean(values)
  const middle = median(values)
  const found = modes(values)

  return (
    <svg viewBox="0 0 640 320" className="block h-auto w-full" role="img" aria-label={`Gráfico de pontos com ${values.length} valores. Média ${format(average)}, mediana ${format(middle)}.`}>
      <line x1={left - 10} x2={width - right + 10} y1={base} y2={base} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
      {counts.map((count, i) => {
        const value = MIN + i
        const isMode = found.includes(value)
        return (
          <g key={value}>
            <line x1={scale(value)} x2={scale(value)} y1={base} y2={base + 6} strokeWidth={2} style={{ stroke: 'var(--svg-axis)' }} />
            <text x={scale(value)} y={base + 24} textAnchor="middle" fontSize={14} fontWeight={800} style={{ fill: 'var(--svg-text)' }}>
              {value}
            </text>
            {Array.from({ length: count }, (_, k) => (
              <circle key={k} cx={scale(value)} cy={base - dot / 2 - 2 - k * (dot + 2)} r={dot / 2} fill={isMode ? '#7c3aed' : '#2563eb'} stroke="#ffffff" strokeWidth={1.5} />
            ))}
          </g>
        )
      })}
      {values.length > 0 && (
        <>
          <line x1={scale(middle)} x2={scale(middle)} y1={30} y2={base} stroke={MEDIAN_COLOR} strokeWidth={3} strokeDasharray="6 5" />
          <text x={scale(middle)} y={22} textAnchor="middle" fontSize={13} fontWeight={900} fill={MEDIAN_COLOR}>
            mediana {format(middle)}
          </text>
          <line x1={scale(average)} x2={scale(average)} y1={44} y2={base} stroke={MEAN_COLOR} strokeWidth={3} />
          <path d={`M ${scale(average)} ${base + 30} l -9 14 h 18 z`} fill={MEAN_COLOR} />
          <text x={scale(average)} y={base + 44 + 14} textAnchor="middle" fontSize={13} fontWeight={900} fill={MEAN_COLOR}>
            média {format(average)}
          </text>
        </>
      )}
    </svg>
  )
}

export default function Estatistica() {
  const [values, setValues] = useState<number[]>(presets[0].values)
  const average = mean(values)
  const middle = median(values)
  const found = modes(values)
  const sorted = sortValues(values)
  const middleIndexes = sorted.length % 2 === 0 ? [sorted.length / 2 - 1, sorted.length / 2] : [Math.floor(sorted.length / 2)]
  const total = values.reduce((sum, value) => sum + value, 0)

  function change(index: number, delta: number) {
    setValues((items) => items.map((value, i) => (i === index ? Math.min(MAX, Math.max(MIN, value + delta)) : value)))
  }

  return (
    <PresentationMode title="Média, Mediana e Moda">
      <SimulatorHeader id="estatistica">
        Cada ponto é um valor do conjunto (por exemplo, notas de 0 a 10). Mude os valores e observe como a média, a mediana e a moda reagem de formas diferentes.
      </SimulatorHeader>

      <div className="mb-4 flex flex-wrap gap-2 sm:mb-6" role="group" aria-label="Conjuntos de exemplo">
        {presets.map((preset) => (
          <button key={preset.id} type="button" onClick={() => setValues(preset.values)} className="min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-300 hover:bg-blue-50">
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4 sm:space-y-5">
          <Panel title="Gráfico de pontos">
            <DotPlot values={values} />
            <div className="mt-1 flex flex-wrap justify-center gap-3 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#2563eb]" /> valor</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-[#7c3aed]" /> moda</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4" style={{ background: MEAN_COLOR }} /> média</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: MEDIAN_COLOR }} /> mediana</span>
            </div>
          </Panel>

          <Panel title="Valores do conjunto">
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {values.map((value, index) => (
                <li key={index} className="flex items-center justify-between gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
                  <button type="button" onClick={() => change(index, -1)} disabled={value <= MIN} aria-label={`Diminuir valor ${index + 1}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30">
                    <Minus size={16} />
                  </button>
                  <span className="font-mono text-xl font-black text-slate-900">{value}</span>
                  <button type="button" onClick={() => change(index, 1)} disabled={value >= MAX} aria-label={`Aumentar valor ${index + 1}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30">
                    <Plus size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => setValues((items) => [...items, 5])} disabled={values.length >= MAX_ITEMS} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow hover:bg-blue-700 disabled:opacity-40">
                <Plus size={16} /> Adicionar valor
              </button>
              <button type="button" onClick={() => setValues((items) => items.slice(0, -1))} disabled={values.length <= 1} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40">
                <Trash2 size={16} /> Remover o último
              </button>
              <button type="button" onClick={() => setValues(presets[0].values)} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
                <RotateCcw size={16} /> Recomeçar
              </button>
            </div>
          </Panel>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <Panel title="Medidas">
            <dl className="space-y-3">
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
                <dt className="text-xs font-black uppercase tracking-wide text-orange-800">Média</dt>
                <dd className="font-mono text-2xl font-black text-slate-900">{format(average)}</dd>
                <dd className="text-xs text-slate-600">
                  soma ÷ quantidade = {total} ÷ {values.length}
                </dd>
              </div>
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
                <dt className="text-xs font-black uppercase tracking-wide text-teal-800">Mediana</dt>
                <dd className="font-mono text-2xl font-black text-slate-900">{format(middle)}</dd>
                <dd className="text-xs text-slate-600">{sorted.length % 2 === 0 ? 'média dos dois valores do meio, com os dados em ordem' : 'valor do meio, com os dados em ordem'}</dd>
              </div>
              <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
                <dt className="text-xs font-black uppercase tracking-wide text-violet-800">Moda</dt>
                <dd className="font-mono text-2xl font-black text-slate-900">{found.length ? found.join(' e ') : '—'}</dd>
                <dd className="text-xs text-slate-600">{describeModes(found)}</dd>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <dt className="text-xs font-black uppercase tracking-wide text-slate-600">Amplitude</dt>
                <dd className="font-mono text-2xl font-black text-slate-900">{range(values)}</dd>
                <dd className="text-xs text-slate-600">maior valor − menor valor</dd>
              </div>
            </dl>
          </Panel>

          <Panel title="Dados em ordem">
            <p className="flex flex-wrap gap-1.5 font-mono text-lg font-black" aria-label="Valores em ordem crescente">
              {sorted.map((value, index) => (
                <span key={index} className={`rounded-lg px-2 py-0.5 ${middleIndexes.includes(index) ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                  {value}
                </span>
              ))}
            </p>
            <p className="mt-2 text-xs text-slate-500">Os valores destacados são os do meio, usados na mediana.</p>
          </Panel>
        </div>
      </div>

      <TipBox>
        <strong>Experimente:</strong> escolha “Com um valor discrepante”. A nota 0 puxa a média para baixo, mas quase não mexe na mediana. Por isso a mediana é mais resistente a valores muito diferentes dos outros.
      </TipBox>
    </PresentationMode>
  )
}
