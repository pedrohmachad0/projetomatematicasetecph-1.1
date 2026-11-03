import { useState } from 'react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import Fact from '../components/ui/Fact'
import CartesianPlane from '../components/graph/CartesianPlane'
import { createScale, plotPath } from '../logic/plane'
import { expBehavior, expValue, logValue } from '../logic/exponencial'

const scale = createScale(-4, 8)
const EXP = '#be185d'
const LOG = '#0f766e'
const br = (v: number, d = 2) => (Number.isFinite(v) ? v.toLocaleString('pt-BR', { maximumFractionDigits: d }).replace('-', '−') : '—')

export default function Exponencial() {
  const [base, setBase] = useState(2)
  const [x, setX] = useState(2)
  const [showLog, setShowLog] = useState(false)
  const [target, setTarget] = useState(8)
  const [revealed, setRevealed] = useState(false)
  const y = expValue(base, x)
  const behavior = expBehavior(base)
  const hasLog = base !== 1
  const logAnswer = hasLog ? logValue(base, target) : NaN

  return (
    <PresentationMode title="Exponencial e Logaritmo">
      <SimulatorHeader id="exponencial">
        Na exponencial f(x) = aˣ, cada passo em x multiplica o resultado pela base. O logaritmo faz a pergunta inversa: “a elevado a quanto dá esse número?”.
      </SimulatorHeader>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_380px]">
        <Panel stage>
          <div className="mb-2 flex flex-wrap justify-center gap-x-6 text-center font-mono text-xl font-black sm:text-2xl" aria-live="polite">
            <span className="accent-text" style={{ ['--accent' as string]: EXP }}>f(x) = {br(base, 1)}ˣ</span>
            {showLog && hasLog && <span className="accent-text" style={{ ['--accent' as string]: LOG }}>g(x) = log<sub>{br(base, 1)}</sub> x</span>}
          </div>
          <CartesianPlane scale={scale} label={`Gráfico de ${br(base, 1)} elevado a x`}>
            {showLog && <line x1={scale.toX(-4)} y1={scale.toY(-4)} x2={scale.toX(8)} y2={scale.toY(8)} strokeWidth={1.5} strokeDasharray="6 5" style={{ stroke: 'var(--svg-axis)' }} />}
            <path d={plotPath((t) => expValue(base, t), scale, 300)} fill="none" stroke={EXP} strokeWidth={3.5} />
            {showLog && hasLog && <path d={plotPath((t) => (t > 0 ? logValue(base, t) : NaN), scale, 600)} fill="none" stroke={LOG} strokeWidth={3.5} />}
            <line x1={scale.toX(x)} x2={scale.toX(x)} y1={scale.toY(0)} y2={scale.toY(y)} stroke={EXP} strokeWidth={2} strokeDasharray="5 4" />
            <line x1={scale.toX(0)} x2={scale.toX(x)} y1={scale.toY(y)} y2={scale.toY(y)} stroke={EXP} strokeWidth={2} strokeDasharray="5 4" />
            <circle cx={scale.toX(x)} cy={scale.toY(y)} r={7} fill={EXP} stroke="#ffffff" strokeWidth={2.5} />
            {showLog && hasLog && (
              <>
                <line x1={scale.toX(x)} y1={scale.toY(y)} x2={scale.toX(y)} y2={scale.toY(x)} stroke="#7c3aed" strokeWidth={2} strokeDasharray="3 4" />
                <circle cx={scale.toX(y)} cy={scale.toY(x)} r={7} fill={LOG} stroke="#ffffff" strokeWidth={2.5} />
              </>
            )}
            <circle cx={scale.toX(0)} cy={scale.toY(1)} r={5} fill="#ffffff" stroke={EXP} strokeWidth={2.5} />
          </CartesianPlane>
          <p role="status" className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
            {behavior === 'crescente'
              ? `Base maior que 1: a função cresce, e cada +1 em x multiplica y por ${br(base, 1)}.`
              : behavior === 'decrescente'
                ? `Base entre 0 e 1: a função decresce, cada +1 em x multiplica y por ${br(base, 1)} (diminui).`
                : 'Base 1: 1ˣ é sempre 1. Não é exponencial de verdade, e não existe logaritmo de base 1.'}{' '}
            Todo gráfico aˣ passa por (0, 1), porque a⁰ = 1.
            {showLog && hasLog && ` O ponto (${br(x)}, ${br(y)}) da exponencial vira (${br(y)}, ${br(x)}) no logaritmo: as curvas são espelhos na reta y = x.`}
          </p>
        </Panel>
        <div className="space-y-4">
          <Panel title="Controles">
            <div className="space-y-4">
              <NumberControl label="Base a" value={base} min={0.2} max={4} step={0.1} onChange={setBase} format={(v) => br(v, 1)} />
              <NumberControl label="x" value={x} min={-3} max={3} step={0.5} onChange={setX} format={(v) => br(v, 1)} />
            </div>
            <label className="mt-4 flex min-h-[44px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={showLog} onChange={(event) => setShowLog(event.target.checked)} />
              Mostrar o logaritmo (a inversa)
            </label>
            <dl className="mt-4 grid grid-cols-2 gap-2">
              <Fact label="f(x)" value={br(y)} detail={`${br(base, 1)} elevado a ${br(x, 1)}`} highlight />
              <Fact label="f(x + 1)" value={br(expValue(base, x + 1))} detail={`= f(x) × ${br(base, 1)}`} />
            </dl>
          </Panel>
          <Panel title="Pergunta do logaritmo">
            {hasLog ? (
              <>
                <p className="font-mono text-lg font-black text-slate-800">
                  {br(base, 1)}<sup>?</sup> = {target}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[1, 2, 4, 8, 10, 16, 32, 100].map((n) => (
                    <button key={n} type="button" onClick={() => { setTarget(n); setRevealed(false) }} aria-pressed={target === n} className={`min-h-[40px] min-w-[44px] rounded-lg border font-mono text-sm font-black ${target === n ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700'}`}>
                      {n}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setRevealed(true)} className={`mt-3 min-h-[48px] w-full rounded-xl font-mono text-base font-black ${revealed ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'bg-blue-700 text-white'}`}>
                  {revealed ? `log${br(base, 1)} ${target} = ${br(logAnswer, 3)}` : 'Mostrar a resposta'}
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-600">Escolha uma base diferente de 1.</p>
            )}
          </Panel>
        </div>
      </div>
      <Panel className="mt-4 sm:mt-6" title="Tabela de valores">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-center font-mono text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-500">
                <th className="p-2 text-left font-sans">x</th>
                {[-2, -1, 0, 1, 2, 3].map((v) => <th key={v} className="p-2">{br(v)}</th>)}
              </tr>
            </thead>
            <tbody className="font-black text-slate-800">
              <tr>
                <td className="p-2 text-left font-sans text-xs font-bold text-pink-700">{br(base, 1)}ˣ</td>
                {[-2, -1, 0, 1, 2, 3].map((v) => <td key={v} className="p-2">{br(expValue(base, v))}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
      <ChallengeCard
        simulator="exponencial"
        goals={[
          { id: 'decrescente', text: 'Faça uma exponencial que decresce.', met: behavior === 'decrescente' },
          { id: 'espelho', text: 'Mostre o logaritmo e veja o espelho na reta y = x.', met: showLog && hasLog },
          { id: 'oito', text: 'Coloque o ponto em f(x) = 8 com base 2.', met: base === 2 && x === 3 },
          { id: 'log', text: 'Descubra log₂ 32.', met: base === 2 && target === 32 && revealed },
        ]}
      />
      <TipBox>
        <strong>Crescimento exponencial na vida real:</strong> uma bactéria que se divide em duas a cada hora vira 2, 4, 8, 16… Em 10 horas já são 1.024. O logaritmo responde ao contrário: “em quantas horas teremos 1.024?”. Resposta: log₂ 1024 = 10.
      </TipBox>
    </PresentationMode>
  )
}
