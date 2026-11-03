import { useState } from 'react'
import { CheckCircle2, Hand, Lightbulb, RotateCcw, SkipForward } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import { applyStep, isValidExpression, leftToRight, nextStep, tokenize, type Step, type Token } from '../logic/expressoes'

const presets = ['2 + 3 × 4', '(2 + 3) × 4', '20 − 12 ÷ 4 × 2', '10 − 4 − 3', '18 ÷ (3 + 6) × 5', '2 × (3 + (8 − 2) ÷ 3)', '50 − 2 × (4 + 3) × 3']

const show = (t: Token) => (typeof t === 'number' ? t.toLocaleString('pt-BR', { maximumFractionDigits: 3 }) : t)
const isOp = (t: Token) => t === '+' || t === '−' || t === '×' || t === '÷'

function TokenRow({ tokens, focus, onPick, wrong, size = 'lg' }: { tokens: Token[]; focus?: [number, number]; onPick?: (i: number) => void; wrong?: number | null; size?: 'lg' | 'sm' }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-1 font-mono font-black ${size === 'lg' ? 'text-2xl sm:text-4xl' : 'text-sm sm:text-base'}`}>
      {tokens.map((t, i) => {
        const inFocus = focus && i >= focus[0] && i <= focus[1]
        const clickable = onPick && (isOp(t) || t === '(' || t === ')')
        const base = size === 'lg' ? 'min-h-[48px] min-w-[36px] rounded-xl px-2 sm:min-h-[60px] sm:min-w-[44px]' : 'rounded-md px-1'
        const tone = wrong === i ? 'bg-rose-50 text-rose-700 ring-2 ring-rose-200' : inFocus ? 'bg-amber-200 text-slate-900' : typeof t === 'number' ? 'text-slate-900' : 'text-blue-700'
        return clickable ? (
          <button key={i} type="button" onClick={() => onPick(i)} aria-label={`Resolver a operação ${t === '(' || t === ')' ? 'dos parênteses' : String(t)} na posição ${i + 1}`} className={`${base} ${tone} border border-blue-200 bg-blue-50 transition hover:bg-blue-100 active:scale-95`}>
            {show(t)}
          </button>
        ) : (
          <span key={i} className={`${base} inline-flex items-center justify-center ${tone}`}>
            {show(t)}
          </span>
        )
      })}
    </div>
  )
}

function Workspace({ expression }: { expression: string }) {
  const start = tokenize(expression)
  const [tokens, setTokens] = useState<Token[]>(start)
  const [history, setHistory] = useState<Step[]>([])
  const [hint, setHint] = useState<Step | null>(null)
  const [wrong, setWrong] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [message, setMessage] = useState('Toque na operação que deve ser feita primeiro.')
  const step = nextStep(tokens)
  const done = step === null
  const naive = leftToRight(start)
  const result = tokens[0] as number

  function apply(s: Step) {
    setHistory((h) => [...h, s])
    setTokens(applyStep(s))
    setHint(null)
    setWrong(null)
    setMessage(`Certo! ${s.rule}`)
  }

  function pick(i: number) {
    if (!step) return
    const [a, b] = step.focus
    const target = b - a === 2 && step.tokens[a] === '(' ? [a, b] : [a + 1]
    if (target.includes(i)) apply(step)
    else {
      setWrong(i)
      setMistakes((m) => m + 1)
      setHint(step)
      setMessage(`Ainda não. ${step.rule} A operação destacada em amarelo vem antes.`)
    }
  }

  function reset() {
    setTokens(start)
    setHistory([])
    setHint(null)
    setWrong(null)
    setMistakes(0)
    setMessage('Toque na operação que deve ser feita primeiro.')
  }

  return (
    <>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel stage>
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-slate-500">{done ? 'Resultado' : 'Expressão atual'}</p>
          <TokenRow tokens={tokens} focus={hint?.focus} onPick={done ? undefined : pick} wrong={wrong} />
          <div role="status" className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm font-semibold ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : wrong !== null ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            {done ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <Hand size={18} className="mt-0.5 shrink-0" />}
            <span>{done ? `Pronto! ${expression} = ${show(result)}. ${mistakes === 0 ? 'Você acertou a ordem de primeira!' : `Foram ${mistakes} tentativa${mistakes === 1 ? '' : 's'} fora de ordem.`}` : message}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => step && setHint(step)} disabled={done} className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-black text-amber-900 hover:bg-amber-100 disabled:opacity-40">
              <Lightbulb size={16} /> Dica
            </button>
            <button type="button" onClick={() => step && apply(step)} disabled={done} className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-black text-white shadow hover:bg-blue-800 active:scale-95 disabled:opacity-40">
              <SkipForward size={16} /> Fazer o próximo passo
            </button>
            <button type="button" onClick={reset} className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <RotateCcw size={16} /> Recomeçar
            </button>
          </div>
        </Panel>
        <Panel title="Passo a passo">
          <ol className="space-y-2">
            <li className="rounded-xl border border-slate-200 bg-white p-2">
              <TokenRow tokens={start} size="sm" />
            </li>
            {history.map((s, i) => (
              <li key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                <TokenRow tokens={applyStep(s)} size="sm" />
                <p className="mt-1 text-center text-[11px] font-semibold text-slate-500">
                  {s.tokens.slice(s.focus[0], s.focus[1] + 1).map(show).join(' ')} = {show(s.result)}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs font-bold text-slate-600">Ordem: ( ) → × ÷ → + −</p>
          {naive !== null && naive !== result && done && (
            <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
              Pegadinha: quem faz tudo da esquerda para a direita chega em {show(naive)}, que está errado.
            </p>
          )}
        </Panel>
      </div>
      <ChallengeCard
        simulator="expressoes"
        goals={[
          { id: 'sem-erro', text: 'Resolva uma expressão inteira sem errar a ordem nenhuma vez.', met: done && mistakes === 0 && history.length >= 2 },
          { id: 'parenteses', text: 'Resolva uma expressão com parênteses dentro de parênteses.', met: done && expression.split('(').length > 2 },
          { id: 'pegadinha', text: 'Encontre uma expressão em que fazer da esquerda para a direita dá errado.', met: done && naive !== null && naive !== result },
          { id: 'propria', text: 'Escreva a sua própria expressão e resolva.', met: done && !presets.includes(expression) },
        ]}
      />
    </>
  )
}

export default function Expressoes() {
  const [expression, setExpression] = useState(presets[0])
  const [draft, setDraft] = useState('')
  const valid = draft.trim() !== '' && isValidExpression(draft)

  function applyDraft() {
    if (!valid) return
    setExpression(tokenize(draft).map(show).join(' ').replace(/\( /g, '(').replace(/ \)/g, ')'))
  }

  return (
    <PresentationMode title="Expressões Numéricas">
      <SimulatorHeader id="expressoes">
        Numa expressão com várias operações existe uma ordem: primeiro os parênteses, depois multiplicações e divisões, por último somas e subtrações. Toque na operação que vem primeiro.
      </SimulatorHeader>
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-6 sm:p-4">
        <p className="mb-2 text-xs font-semibold text-slate-600 sm:text-sm">Escolha a expressão:</p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {presets.map((item) => (
            <button key={item} type="button" aria-current={item === expression ? 'true' : undefined} onClick={() => setExpression(item)} className={`min-h-[44px] rounded-xl border-2 px-3 font-mono text-xs font-bold transition active:scale-95 sm:text-sm ${item === expression ? 'border-blue-600 bg-blue-600 text-white shadow' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'}`}>
              {item}
            </button>
          ))}
        </div>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            applyDraft()
          }}
        >
          <label htmlFor="expressao-propria" className="sr-only">
            Escreva sua expressão
          </label>
          <input id="expressao-propria" value={draft} onChange={(event) => setDraft(event.target.value)} inputMode="text" autoComplete="off" placeholder="Escreva a sua: 3 + 4 * (5 - 2)" className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 font-mono text-sm font-bold text-slate-800 outline-none focus:border-blue-500" />
          <button type="submit" disabled={!valid} className="min-h-[44px] rounded-xl bg-blue-700 px-4 text-sm font-black text-white disabled:opacity-40">
            Usar
          </button>
        </form>
        {draft.trim() !== '' && !valid && <p className="mt-1 text-xs font-semibold text-rose-700">Use números inteiros e + − × ÷ ( ). Também vale * e /.</p>}
      </div>
      <Workspace key={expression} expression={expression} />
      <TipBox>
        <strong>Por que existe uma ordem?</strong> Para todo mundo chegar ao mesmo resultado. “2 + 3 × 4” é “2 mais três vezes quatro”: primeiro o grupo 3 × 4 = 12, depois soma 2. Se quiser somar antes, use parênteses: (2 + 3) × 4.
      </TipBox>
    </PresentationMode>
  )
}
