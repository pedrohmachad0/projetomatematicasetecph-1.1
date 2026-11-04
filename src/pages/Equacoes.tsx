import { useState } from 'react'
import { CheckCircle2, RotateCcw, Scale } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import BalanceSVG from '../components/equacoes/BalanceSVG'
import { equationProblems, type EquationProblem } from '../data/equationProblems'
import { applyOperation, formatEquation, formatSide, isBalanced, isSolved, solutionOf, tilt, type Balance, type Operation, type Scope } from '../logic/equacoes'

const scopes: Array<{ id: Scope; label: string }> = [
  { id: 'ambos', label: 'Nos dois lados' },
  { id: 'esquerdo', label: 'Só no esquerdo' },
  { id: 'direito', label: 'Só no direito' },
]

const scopeText: Record<Scope, string> = { ambos: 'nos dois lados', esquerdo: 'só no lado esquerdo', direito: 'só no lado direito' }

function describe(op: Operation) {
  if (op.kind === 'dividir') return `÷ ${op.value}`
  return `${op.kind === 'somar' ? '+' : '−'} ${op.value}`
}

function Workspace({ problem }: { problem: EquationProblem }) {
  const x = solutionOf(problem)
  const [state, setState] = useState<Balance>(problem)
  const [scope, setScope] = useState<Scope>('ambos')
  const [history, setHistory] = useState<string[]>([])
  const balanced = isBalanced(state, x)
  const solved = isSolved(state, x)
  const difference = tilt(state, x)

  const operations: Operation[] = [
    { kind: 'subtrair', value: 1 },
    { kind: 'somar', value: 1 },
    ...(state.b > 1 ? [{ kind: 'subtrair' as const, value: state.b }] : []),
    ...(state.a > 1 ? [{ kind: 'dividir' as const, value: state.a }] : []),
  ]

  function run(op: Operation) {
    const next = applyOperation(state, op, scope)
    if (!next) return
    setState(next)
    setHistory((items) => [...items, `${describe(op)} ${scopeText[scope]} → ${formatEquation(next, x)}`])
  }

  function reset() {
    setState(problem)
    setHistory([])
    setScope('ambos')
  }

  return (
    <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_380px]">
      <Panel stage className="overflow-hidden">
        <div className="mb-2 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Equação atual</p>
          <p className={`mt-1 font-mono text-3xl font-black sm:text-5xl ${balanced ? 'text-slate-900' : 'text-rose-700'}`} aria-live="polite">
            {formatEquation(state, x)}
          </p>
        </div>
        <BalanceSVG a={state.a} b={state.b} c={state.c} tilt={difference} revealX={solved ? x : null} />
        <div
          role="status"
          className={`mt-2 flex items-start gap-2 rounded-xl border p-3 text-sm font-semibold ${
            solved ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : balanced ? 'border-slate-200 bg-slate-50 text-slate-700' : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {solved ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <Scale size={18} className="mt-0.5 shrink-0" />}
          <span>
            {solved
              ? `Resolvido! A caixa x vale ${x}. Confira: ${problem.a === 1 ? '' : `${problem.a}·`}${x} + ${problem.b} = ${problem.c}.`
              : balanced
                ? 'A balança está equilibrada: os dois lados valem o mesmo. Continue isolando o x.'
                : `A balança desequilibrou: o lado ${difference > 0 ? 'esquerdo' : 'direito'} ficou ${Math.abs(difference)} unidade${Math.abs(difference) === 1 ? '' : 's'} mais pesado. Faça a mesma operação no outro lado.`}
          </span>
        </div>
      </Panel>

      <div className="space-y-4 sm:space-y-5">
        <Panel title="Operações">
          <SegmentedControl label="Onde aplicar a operação" options={scopes} value={scope} onChange={setScope} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {operations.map((op) => {
              const allowed = applyOperation(state, op, scope) !== null
              return (
                <button
                  key={`${op.kind}-${op.value}`}
                  type="button"
                  onClick={() => run(op)}
                  disabled={!allowed}
                  className={`min-h-[52px] rounded-xl px-3 font-mono text-lg font-black transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                    op.kind === 'dividir' || op.value > 1 ? 'bg-blue-600 text-white shadow hover:bg-blue-700' : 'border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                  aria-label={`${op.kind === 'dividir' ? 'Dividir por' : op.kind === 'somar' ? 'Somar' : 'Subtrair'} ${op.value} ${scopeText[scope]}`}
                >
                  {describe(op)}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            Estratégia: primeiro retire as unidades do lado do x; depois divida pelo número de caixas.
          </p>
          <button type="button" onClick={reset} className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
            <RotateCcw size={15} /> Recomeçar
          </button>
        </Panel>

        <Panel title="Passo a passo">
          <ol className="space-y-1.5 font-mono text-sm text-slate-700">
            <li className="font-bold">{formatEquation(problem, x)}</li>
            {history.map((step, index) => (
              <li key={index} className="text-slate-600">
                {step}
              </li>
            ))}
          </ol>
          {history.length === 0 && <p className="mt-2 text-xs text-slate-500">Suas operações aparecerão aqui.</p>}
        </Panel>
      </div>
      <div className="lg:col-span-2">
        <ChallengeCard
          simulator="equacoes"
          goals={[
            { id: 'resolver', text: 'Resolva uma equação até sobrar só x de um lado.', met: solved },
            { id: 'desequilibrar', text: 'Faça uma operação em um lado só e veja a balança pender.', met: !balanced },
            { id: 'dividir', text: 'Resolva uma equação com 3x ou mais (você vai precisar dividir).', met: solved && problem.a >= 3 },
            { id: 'grande', text: 'Resolva a equação 5x + 5 = 30.', met: solved && problem.a === 5 && problem.b === 5 && problem.c === 30 },
          ]}
        />
      </div>
    </div>
  )
}

export default function Equacoes() {
  const [index, setIndex] = useState(0)
  const problem = equationProblems[index]

  return (
    <PresentationMode title="Balança de Equações">
      <SimulatorHeader id="equacoes">
        Cada caixa vale x. Tire ou coloque peças e divida os lados para descobrir o valor de x, sem deixar a balança desequilibrar.
      </SimulatorHeader>
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:p-4">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="mb-1 mr-1 w-full text-xs font-semibold text-slate-600 sm:mb-0 sm:w-auto sm:text-sm">Escolha a equação:</span>
          {equationProblems.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-current={i === index ? 'true' : undefined}
              onClick={() => setIndex(i)}
              className={`min-h-[44px] rounded-xl border-2 px-3 py-2 font-mono text-xs font-bold transition active:scale-95 sm:text-sm ${
                i === index ? 'border-blue-600 bg-blue-600 text-white shadow' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {formatSide(item.a, item.b)} = {item.c}
            </button>
          ))}
        </div>
      </div>
      <Workspace key={problem.id} problem={problem} />
      <TipBox>
        <strong>Princípio da balança:</strong> uma equação é uma igualdade. Se você somar, subtrair ou dividir apenas um lado, a igualdade deixa de valer. Fazendo o mesmo nos dois lados, ela continua verdadeira.
      </TipBox>
    </PresentationMode>
  )
}
