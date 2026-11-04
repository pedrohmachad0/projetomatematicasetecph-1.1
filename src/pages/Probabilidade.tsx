import { useRef, useState } from 'react'
import { Dices, RotateCcw } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Coin, Die, DieFace } from '../components/probabilidade/Pieces'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import { experiments, formatPercent, maxDeviation, relativeFrequencies, runRolls, theoretical, type ExperimentId, type Roll } from '../logic/probabilidade'

const OBSERVED = '#be123c'
const BATCHES = [1, 10, 100, 1000]

function FrequencyChart({ id, counts }: { id: ExperimentId; counts: number[] }) {
  const experiment = experiments[id]
  const expected = theoretical(experiment)
  const observed = relativeFrequencies(counts)
  const width = 640
  const height = 290
  const top = 20
  const bottom = 40
  const maxValue = Math.max(0.2, ...expected, ...observed) * 1.15
  const toY = (value: number) => top + (1 - value / maxValue) * (height - top - bottom)
  const slot = (width - 40) / experiment.outcomes.length
  const barWidth = Math.min(56, slot * 0.6)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full" role="img" aria-label={`Frequência observada comparada à probabilidade teórica para ${experiment.label}`}>
      {[0, 0.25, 0.5, 0.75, 1].filter((tick) => tick <= maxValue).map((tick) => (
        <g key={tick}>
          <line x1={36} x2={width - 4} y1={toY(tick)} y2={toY(tick)} strokeWidth={1} style={{ stroke: 'var(--svg-grid)' }} />
          <text x={30} y={toY(tick) + 4} textAnchor="end" fontSize={10} fontWeight={700} style={{ fill: 'var(--svg-muted)' }}>
            {tick * 100}%
          </text>
        </g>
      ))}
      {experiment.outcomes.map((outcome, i) => {
        const x = 40 + slot * i + (slot - barWidth) / 2
        return (
          <g key={outcome}>
            <motion.rect initial={false} animate={{ y: toY(observed[i]), height: Math.max(0, toY(0) - toY(observed[i])) }} transition={{ duration: 0.35 }} x={x} width={barWidth} rx={4} fill={OBSERVED} opacity={0.85} />
            {counts[i] > 0 && (
              <text x={x + barWidth / 2} y={toY(observed[i]) - 6} textAnchor="middle" fontSize={experiment.outcomes.length > 6 ? 10 : 13} fontWeight={900} fill={OBSERVED}>
                {formatPercent(observed[i])}
              </text>
            )}
            <line x1={x - 6} x2={x + barWidth + 6} y1={toY(expected[i])} y2={toY(expected[i])} strokeWidth={3} strokeDasharray="6 4" style={{ stroke: 'var(--svg-ink)' }} />
            <text x={x + barWidth / 2} y={height - 16} textAnchor="middle" fontSize={experiment.outcomes.length > 6 ? 12 : 14} fontWeight={800} style={{ fill: 'var(--svg-text)' }}>
              {outcome}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function Table({ id, roll, spin, rolling, history }: { id: ExperimentId; roll: Roll | null; spin: number; rolling: boolean; history: Array<Roll & { key: number }> }) {
  const faces = roll?.faces ?? (id === 'moeda' ? [0] : id === 'dado' ? [6] : [3, 4])
  return (
    <div className="overflow-hidden rounded-2xl border-4 border-amber-900/70 shadow-inner" style={{ background: 'radial-gradient(ellipse at 50% 40%, #16a34a, #166534 70%, #14532d)' }}>
      <div className="flex min-h-[190px] items-center justify-center gap-6 px-4 pb-4 pt-10 sm:min-h-[220px]">
        {id === 'moeda' ? (
          <Coin side={faces[0]} spin={spin} size={116} />
        ) : (
          faces.map((value, i) => <Die key={i} value={value} rolling={rolling} delay={i * 0.08} size={id === 'dado' ? 104 : 88} />)
        )}
      </div>
      <div className="flex min-h-[46px] items-center gap-1.5 overflow-hidden bg-black/25 px-3 py-2" aria-label="Últimos resultados">
        <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-emerald-100">Últimos</span>
        <AnimatePresence initial={false}>
          {history.map((h) => (
            <motion.span key={h.key} layout initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex shrink-0 items-center gap-0.5">
              {id === 'moeda' ? (
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black ${h.faces[0] === 0 ? 'bg-amber-400 text-amber-900' : 'bg-slate-300 text-slate-700'}`}>{h.faces[0] === 0 ? 'Ca' : 'Co'}</span>
              ) : (
                h.faces.map((f, i) => <DieFace key={i} value={f} size={24} />)
              )}
            </motion.span>
          ))}
        </AnimatePresence>
        {history.length === 0 && <span className="text-xs font-semibold text-emerald-100/80">faça o primeiro lançamento</span>}
      </div>
    </div>
  )
}

export default function Probabilidade() {
  const [id, setId] = useState<ExperimentId>('moeda')
  const experiment = experiments[id]
  const [counts, setCounts] = useState<number[]>(() => Array(experiment.outcomes.length).fill(0))
  const [lastOutcome, setLastOutcome] = useState<number | null>(null)
  const [roll, setRoll] = useState<Roll | null>(null)
  const [spin, setSpin] = useState(0)
  const [rolling, setRolling] = useState(false)
  const [history, setHistory] = useState<Array<Roll & { key: number }>>([])
  const keyRef = useRef(0)
  const reduceMotion = useReducedMotion()
  const total = counts.reduce((sum, count) => sum + count, 0)
  const expected = theoretical(experiment)
  const observed = relativeFrequencies(counts)

  function choose(next: ExperimentId) {
    setId(next)
    setCounts(Array(experiments[next].outcomes.length).fill(0))
    setLastOutcome(null)
    setRoll(null)
    setHistory([])
  }

  function launch(trials: number) {
    if (rolling) return
    const result = runRolls(id, trials, counts, 10)
    const final = result.last[result.last.length - 1]
    const show = () => {
      setCounts(result.counts)
      setLastOutcome(trials === 1 ? final.index : null)
      setHistory((list) => [...result.last.map((r) => ({ ...r, key: ++keyRef.current })).reverse(), ...list].slice(0, 12))
      setRolling(false)
    }
    setRoll(final)
    setSpin((v) => v + 1)
    if (reduceMotion) {
      show()
      return
    }
    setRolling(true)
    window.setTimeout(show, trials === 1 ? 950 : 600)
  }

  return (
    <PresentationMode title="Laboratório de Probabilidade">
      <SimulatorHeader id="probabilidade">
        Probabilidade é casos favoráveis ÷ casos possíveis. Faça lançamentos virtuais e veja a frequência observada se aproximar da probabilidade teórica quando o número de lançamentos cresce.
      </SimulatorHeader>

      <div className="mb-4 sm:mb-6">
        <SegmentedControl label="Experimento" options={Object.values(experiments).map((item) => ({ id: item.id, label: item.label }))} value={id} onChange={choose} />
      </div>

      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel stage title="Mesa de lançamentos">
          <Table id={id} roll={roll} spin={spin} rolling={rolling} history={history} />
          <h3 className="mb-1 mt-4 flex items-center gap-2 text-sm font-black text-slate-800">
            <Dices size={16} aria-hidden="true" /> Frequência observada × probabilidade teórica
          </h3>
          <FrequencyChart id={id} counts={counts} />
          <div className="mt-1 flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm" style={{ background: OBSERVED }} /> frequência observada</span>
            <span className="inline-flex items-center gap-1.5"><span className="w-5 border-t-[3px] border-dashed border-slate-700" /> probabilidade teórica</span>
          </div>
        </Panel>

        <div className="space-y-4 sm:space-y-5">
          <Panel title="Lançar">
            <div className="grid grid-cols-2 gap-2">
              {BATCHES.map((batch) => (
                <button key={batch} type="button" onClick={() => launch(batch)} disabled={rolling} className={`min-h-[52px] rounded-xl px-3 text-base font-black transition active:scale-95 ${batch === 1 ? 'bg-blue-600 text-white shadow hover:bg-blue-700' : 'border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100'}`}>
                  {batch === 1 ? 'Lançar 1 vez' : `+${batch.toLocaleString('pt-BR')}`}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3" aria-live="polite">
              <div>
                <div className="text-[11px] font-black uppercase text-slate-500">Lançamentos</div>
                <div className="font-mono text-2xl font-black text-slate-900">{total.toLocaleString('pt-BR')}</div>
              </div>
              {lastOutcome !== null && (
                <div className="text-right">
                  <div className="text-[11px] font-black uppercase text-slate-500">Último resultado</div>
                  <motion.div key={total} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="text-2xl font-black text-rose-700">{experiment.outcomes[lastOutcome]}</motion.div>
                </div>
              )}
            </div>
            <button type="button" onClick={() => choose(id)} className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
              <RotateCcw size={15} /> Zerar
            </button>
          </Panel>

          <Panel title="Tabela">
            <div className="max-h-[320px] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-1">Resultado</th>
                    <th className="py-1 text-right">Teórica</th>
                    <th className="py-1 text-right">Observada</th>
                  </tr>
                </thead>
                <tbody className="font-mono font-bold text-slate-800">
                  {experiment.outcomes.map((outcome, i) => (
                    <tr key={outcome} className="border-t border-slate-200">
                      <td className="py-1.5 font-sans">{outcome}</td>
                      <td className="py-1.5 text-right">
                        {experiment.favorable[i]}/{experiment.space} ≈ {formatPercent(expected[i])}
                      </td>
                      <td className="py-1.5 text-right">
                        {counts[i]} · {formatPercent(observed[i])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > 0 && (
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                Maior diferença entre observado e teórico: <strong className="text-slate-900">{formatPercent(maxDeviation(experiment, counts))}</strong>
                {total < 100 ? '. Com poucos lançamentos, ela costuma ser grande.' : '. Quanto mais lançamentos, menor ela tende a ficar.'}
              </p>
            )}
          </Panel>
        </div>
      </div>

      <ChallengeCard
        simulator="probabilidade"
        goals={[
          { id: 'mil', text: 'Faça pelo menos 1.000 lançamentos de um experimento.', met: total >= 1000 },
          { id: 'sete', text: 'Com dois dados, veja o 7 sair mais vezes que qualquer outra soma (30+ lançamentos).', met: id === 'dois-dados' && total >= 30 && counts.every((count, i) => i === 5 || count < counts[5]) },
          { id: 'perto', text: 'Com o dado, deixe todas as frequências a menos de 1 ponto percentual da teórica.', met: id === 'dado' && total >= 100 && maxDeviation(experiment, counts) < 0.01 },
          { id: 'sorte', text: 'Com a moeda, tire 3 lançamentos e todos dão o mesmo lado.', met: id === 'moeda' && total === 3 && (counts[0] === 3 || counts[1] === 3) },
        ]}
      />
      <TipBox>
        {id === 'dois-dados' ? (
          <>
            <strong>Por que o 7 aparece mais?</strong> Existem 6 combinações que somam 7 (1+6, 2+5, 3+4, 4+3, 5+2, 6+1) entre as 36 possíveis, mas só uma que soma 2 (1+1).
          </>
        ) : (
          <>
            <strong>Lei dos grandes números:</strong> em poucos lançamentos o resultado pode parecer “injusto”. Faça 1.000 lançamentos e compare de novo as barras com as linhas tracejadas.
          </>
        )}
      </TipBox>
    </PresentationMode>
  )
}
