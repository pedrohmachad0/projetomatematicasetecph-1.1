import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Anchor, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import { useCompact } from '../components/ui/useCompact'
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

interface PlotProps {
  values: number[]
  /** Posição do apoio da gangorra; `null` = apoio na média. */
  pivot: number | null
  onPivot: (value: number) => void
  onAdd: (value: number) => void
  onRemove: (value: number) => void
}

const LEFT = 36
const RIGHT = 26
const BASE = 210

/** Gráfico de pontos em cima de uma gangorra: ela só fica reta com o apoio na média. */
function DotPlot({ values, pivot, onPivot, onAdd, onRemove }: PlotProps) {
  const svg = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)
  // No celular a régua fica mais curta, para os números e as bolinhas ficarem maiores.
  const compact = useCompact()
  const PW = compact ? 440 : 640
  const k = compact ? 1.25 : 1
  const scaleX = (value: number) => LEFT + ((value - MIN) / (MAX - MIN)) * (PW - LEFT - RIGHT)
  const toValue = (x: number) => MIN + ((x - LEFT) / (PW - LEFT - RIGHT)) * (MAX - MIN)
  const counts = frequencies(values, MIN, MAX)
  const highest = Math.max(4, ...counts)
  const dot = Math.min(compact ? 26 : 22, 150 / highest)
  const average = mean(values)
  const middle = median(values)
  const found = modes(values)
  const support = pivot ?? average
  const angle = Math.max(-12, Math.min(12, (average - support) * 5))
  const px = scaleX(support)

  function svgX(event: ReactPointerEvent) {
    const ctm = svg.current?.getScreenCTM()
    if (!ctm) return null
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse()).x
  }

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${PW} 320`}
      className="block h-auto w-full touch-manipulation select-none"
      role="img"
      aria-label={`Gráfico de pontos com ${values.length} valores. Média ${format(average)}, mediana ${format(middle)}.`}
      onPointerMove={(event) => {
        if (!dragging.current) return
        const x = svgX(event)
        if (x !== null) onPivot(Math.max(MIN, Math.min(MAX, Math.round(toValue(x) * 4) / 4)))
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <defs>
        <linearGradient id="plank" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6a26b" />
          <stop offset="1" stopColor="#8b5a2b" />
        </linearGradient>
      </defs>
      <line x1={scaleX(middle)} x2={scaleX(middle)} y1={26} y2={BASE} stroke={MEDIAN_COLOR} strokeWidth={3} strokeDasharray="6 5" />
      <text x={scaleX(middle)} y={18} textAnchor="middle" fontSize={13 * k} fontWeight={900} fill={MEDIAN_COLOR}>
        mediana {format(middle)}
      </text>

      <motion.g initial={false} animate={{ rotate: angle }} transition={{ type: 'spring', stiffness: 90, damping: 12 }} style={{ originX: `${px}px`, originY: `${BASE + 11}px`, transformBox: 'view-box' }}>
        <rect x={LEFT - 22} y={BASE} width={PW - LEFT - RIGHT + 44} height={24} rx={8} fill="url(#plank)" stroke="#6b4423" strokeWidth={1.5} />
        {counts.map((count, i) => {
          const value = MIN + i
          const isMode = found.includes(value)
          return (
            <g key={value}>
              <rect x={scaleX(value) - 20} y={BASE - 200} width={40} height={200} fill="transparent" style={{ cursor: 'copy' }} onClick={() => onAdd(value)} />
              <text x={scaleX(value)} y={BASE + 17} textAnchor="middle" fontSize={14 * k} fontWeight={900} fill="#ffffff" style={{ pointerEvents: 'none' }}>
                {value}
              </text>
              <AnimatePresence>
                {Array.from({ length: count }, (_, k) => (
                  <motion.g key={k} initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 20 }}>
                    <circle cx={scaleX(value)} cy={BASE - dot / 2 - 2 - k * (dot + 2)} r={dot / 2} fill={isMode ? '#7c3aed' : '#2563eb'} stroke="#ffffff" strokeWidth={2} style={{ cursor: 'pointer' }} onClick={() => onRemove(value)} />
                    <circle cx={scaleX(value) - dot / 6} cy={BASE - dot / 2 - 2 - k * (dot + 2) - dot / 6} r={dot / 7} fill="#ffffff" opacity={0.45} style={{ pointerEvents: 'none' }} />
                  </motion.g>
                ))}
              </AnimatePresence>
              {isMode && count > 0 && (
                <text x={scaleX(value)} y={BASE - count * (dot + 2) - 10} textAnchor="middle" fontSize={16} style={{ pointerEvents: 'none' }}>
                  👑
                </text>
              )}
            </g>
          )
        })}
      </motion.g>

      {/* Apoio (triângulo) arrastável */}
      <motion.g initial={false} animate={{ x: px }} transition={{ type: 'spring', stiffness: 200, damping: 22 }}>
        <path d={`M 0 ${BASE + 26} L -26 ${BASE + 72} L 26 ${BASE + 72} Z`} fill={MEAN_COLOR} stroke="#7c2d12" strokeWidth={2} style={{ cursor: 'ew-resize', touchAction: 'none' }} onPointerDown={(event) => {
          ;(event.target as Element).setPointerCapture?.(event.pointerId)
          dragging.current = true
        }} />
        <text y={BASE + 96} textAnchor="middle" fontSize={13 * k} fontWeight={900} fill={MEAN_COLOR}>
          {pivot === null ? `média ${format(average)}` : `apoio em ${format(support)}`}
        </text>
      </motion.g>
      <rect x={20} y={BASE + 72} width={PW - 40} height={6} rx={3} style={{ fill: 'var(--svg-grid)' }} />
    </svg>
  )
}

export default function Estatistica() {
  const [values, setValues] = useState<number[]>(presets[0].values)
  const [pivot, setPivot] = useState<number | null>(null)
  const [balancedTest, setBalancedTest] = useState(false)
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
          <Panel stage title="Gangorra dos dados">
            <DotPlot
              values={values}
              pivot={pivot}
              onPivot={(p) => {
                setPivot(p)
                if (Math.abs(p - average) < 0.13) setBalancedTest(true)
              }}
              onAdd={(v) => values.length < MAX_ITEMS && setValues((items) => [...items, v])}
              onRemove={(v) => values.length > 1 && setValues((items) => items.filter((_, i) => i !== items.indexOf(v)))}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" aria-pressed={pivot !== null} onClick={() => setPivot(pivot === null ? Math.max(MIN, Math.round(average) - 2) : null)} className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-sm font-black ${pivot === null ? 'bg-blue-700 text-white' : 'border border-orange-200 bg-orange-50 text-orange-800'}`}>
                <Anchor size={16} /> {pivot === null ? 'Testar outro ponto de apoio' : 'Voltar o apoio para a média'}
              </button>
              <p role="status" className="flex-1 text-sm font-semibold text-slate-700">
                {pivot === null
                  ? 'A gangorra fica reta com o apoio na média: a média é o ponto de equilíbrio dos dados.'
                  : Math.abs(pivot - average) < 0.13
                    ? 'Equilibrou! Esse ponto é a média.'
                    : `Arraste o triângulo laranja. Com o apoio em ${format(pivot)}, a gangorra pende para a ${pivot < average ? 'direita' : 'esquerda'}.`}
              </p>
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-500">Toque acima de um número da régua para colocar um valor; toque numa bolinha para tirá-la.</p>
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

      <ChallengeCard
        simulator="estatistica"
        goals={[
          { id: 'bimodal', text: 'Monte um conjunto com exatamente duas modas.', met: found.length === 2 },
          { id: 'media-oito', text: 'Deixe a média exatamente 8 com pelo menos 6 valores.', met: values.length >= 6 && Math.abs(average - 8) < 1e-9 },
          { id: 'equilibrio', text: 'Teste outro apoio e arraste o triângulo até a gangorra equilibrar.', met: balancedTest },
          { id: 'media-mediana', text: 'Com 9 valores ou mais, deixe a média igual à mediana.', met: values.length >= 9 && Math.abs(average - middle) < 1e-9 },
        ]}
      />
      <TipBox>
        <strong>Experimente:</strong> escolha “Com um valor discrepante”. A nota 0 puxa a média para baixo, mas quase não mexe na mediana. Por isso a mediana é mais resistente a valores muito diferentes dos outros.
      </TipBox>
    </PresentationMode>
  )
}
