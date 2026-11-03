import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Footprints, RotateCcw } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import Fact from '../components/ui/Fact'
import { useCompact } from '../components/ui/useCompact'
import { useStepper } from '../components/ui/useStepper'
import { addIntegers, compareIntegers, opposite, signed, subtractIntegers } from '../logic/inteiros'

type Mode = 'somar' | 'subtrair' | 'comparar'

const modes: Array<{ id: Mode; label: string }> = [
  { id: 'somar', label: 'Somar' },
  { id: 'subtrair', label: 'Subtrair' },
  { id: 'comparar', label: 'Comparar' },
]

const MIN = -20
const MAX = 20
const POS = '#1d4ed8'
const NEG = '#dc2626'
const fmt = (n: number) => signed(n, false)

function NumberLine({ start, delta, shown, compare }: { start: number; delta: number; shown: number; compare?: number }) {
  const compact = useCompact()
  const k = compact ? 1.7 : 1
  const W = compact ? 520 : 860
  const pad = 22 * k
  const y = 92 * k
  const H = 150 * k
  const dir = Math.sign(delta)
  // No celular a reta mostra só o trecho usado, com casas maiores.
  const used = [0, start, start + delta, compare ?? 0]
  const lo = compact ? Math.max(MIN, Math.min(...used) - 2) : MIN
  const hi = compact ? Math.min(MAX, Math.max(Math.max(...used) + 2, lo + 12)) : MAX
  const x = (v: number) => pad + ((v - lo) / (hi - lo)) * (W - pad * 2)
  const hops = Array.from({ length: shown }, (_, i) => start + dir * i)
  const now = start + dir * shown
  const color = dir >= 0 ? POS : NEG
  const labelEvery = compact ? (hi - lo > 16 ? 4 : 2) : 5

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full touch-manipulation" role="img" aria-label={compare === undefined ? `Reta numérica: começa em ${fmt(start)} e anda ${Math.abs(delta)} casas para a ${dir >= 0 ? 'direita' : 'esquerda'}` : `Reta numérica com ${fmt(start)} e ${fmt(compare)}`}>
      <rect x={x(lo) - 6} y={y - 6 * k} width={Math.max(0, x(0) - x(lo) + 6)} height={12 * k} rx={6 * k} fill={NEG} opacity={0.08} />
      <rect x={Math.max(x(lo), x(0))} y={y - 6 * k} width={Math.max(0, x(hi) - Math.max(x(lo), x(0)) + 6)} height={12 * k} rx={6 * k} fill={POS} opacity={0.08} />
      <line x1={pad - 10} x2={W - pad + 10} y1={y} y2={y} strokeWidth={3 * k} strokeLinecap="round" style={{ stroke: 'var(--svg-axis)' }} />
      {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((v) => {
        const major = v % labelEvery === 0
        return (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={y - (major ? 9 : 5) * k} y2={y + (major ? 9 : 5) * k} strokeWidth={(major ? 2.5 : 1.5) * k} style={{ stroke: v === 0 ? 'var(--svg-ink)' : 'var(--svg-axis)' }} />
            {major && (
              <text x={x(v)} y={y + 30 * k} textAnchor="middle" fontSize={15 * k} fontWeight={800} style={{ fill: v === 0 ? 'var(--svg-ink)' : v < 0 ? NEG : POS }}>
                {fmt(v)}
              </text>
            )}
          </g>
        )
      })}
      {compare === undefined ? (
        <>
          {hops.map((from, i) => {
            const to = from + dir
            const mid = (x(from) + x(to)) / 2
            return <path key={i} d={`M ${x(from)} ${y - 4} Q ${mid} ${y - 34 * k} ${x(to)} ${y - 4}`} fill="none" stroke={color} strokeWidth={2.5 * k} strokeLinecap="round" />
          })}
          <circle cx={x(start)} cy={y} r={7 * k} fill="#ffffff" stroke={color} strokeWidth={3 * k} />
          <g transform={`translate(${x(now)} ${y - 44 * k})`} style={{ transition: 'transform 0.25s ease' }}>
            <rect x={-24 * k} y={-16 * k} width={48 * k} height={26 * k} rx={8 * k} fill={color} />
            <text y={3 * k} textAnchor="middle" fontSize={15 * k} fontWeight={900} fill="#ffffff">
              {fmt(now)}
            </text>
            <path d={`M ${-6 * k} ${10 * k} L 0 ${18 * k} L ${6 * k} ${10 * k} Z`} fill={color} />
          </g>
        </>
      ) : (
        <>
          {[start, compare].map((v, i) => (
            <g key={i}>
              <line x1={x(0)} x2={x(v)} y1={y + (i ? 46 : 40) * k} y2={y + (i ? 46 : 40) * k} stroke={i ? '#7c3aed' : '#0f766e'} strokeWidth={4 * k} strokeLinecap="round" opacity={0.55} />
              <circle cx={x(v)} cy={y} r={9 * k} fill={i ? '#7c3aed' : '#0f766e'} stroke="#ffffff" strokeWidth={2.5 * k} />
              <text x={x(v)} y={y - 18 * k - (i && Math.abs(start - compare) < 3 ? 22 * k : 0)} textAnchor="middle" fontSize={16 * k} fontWeight={900} fill={i ? '#7c3aed' : '#0f766e'}>
                {i ? 'b' : 'a'} = {fmt(v)}
              </text>
            </g>
          ))}
        </>
      )}
    </svg>
  )
}

const signRules = [
  { id: 'pp', text: '(+) + (+): anda para a direita, resultado positivo.' },
  { id: 'nn', text: '(−) + (−): anda para a esquerda, resultado negativo.' },
  { id: 'pn', text: 'Sinais diferentes: subtraia as distâncias e fique com o sinal do número mais longe do zero.' },
] as const

export default function Inteiros() {
  const reduceMotion = useReducedMotion() ?? false
  const [mode, setMode] = useState<Mode>('somar')
  const [a, setA] = useState(-3)
  const [b, setB] = useState(5)
  const move = mode === 'subtrair' ? subtractIntegers(a, b) : addIntegers(a, b)
  const steps = Math.abs(move.delta)
  const walk = useStepper(`${mode}:${a}:${b}`, steps, 260)
  const finished = walk.done
  const relation = compareIntegers(a, b)
  const rule = move.delta === 0 || a === 0 ? null : Math.sign(a) === Math.sign(move.delta) ? (a > 0 ? 'pp' : 'nn') : 'pn'

  const sentence =
    mode === 'comparar'
      ? relation === '='
        ? `Os dois números são iguais: ${fmt(a)} = ${fmt(b)}.`
        : `${fmt(a)} ${relation} ${fmt(b)}, porque ${fmt(relation === '<' ? a : b)} está mais à esquerda na reta. Mais à esquerda é sempre menor, mesmo que pareça “maior” sem o sinal.`
      : !finished
        ? `Comece no ${fmt(a)}. ${mode === 'subtrair' ? `Subtrair ${signed(b)} é o mesmo que somar o oposto, ${signed(opposite(b))}. ` : ''}${move.delta === 0 ? 'Somar zero não sai do lugar.' : `Ande ${steps} casa${steps === 1 ? '' : 's'} para a ${move.delta > 0 ? 'direita' : 'esquerda'}.`}`
        : `Chegou em ${fmt(move.end)}. Então ${signed(a)} ${mode === 'subtrair' ? '−' : '+'} ${signed(b)} = ${fmt(move.end)}.`

  return (
    <PresentationMode title="Reta dos Inteiros">
      <SimulatorHeader id="inteiros">
        Números negativos ficam à esquerda do zero. Somar um positivo é andar para a direita; somar um negativo é andar para a esquerda. Escolha os números e veja o caminho casa por casa.
      </SimulatorHeader>

      <div className="space-y-4 sm:space-y-6">
        <Panel stage>
          <SegmentedControl label="O que fazer" options={modes} value={mode} onChange={setMode} />
          <p className="mt-4 text-center font-mono text-3xl font-black text-slate-900 sm:text-5xl" aria-live="polite">
            {mode === 'comparar' ? (
              <>
                {fmt(a)} <span className="text-blue-700">{relation}</span> {fmt(b)}
              </>
            ) : (
              <>
                {signed(a)} {mode === 'subtrair' ? '−' : '+'} {signed(b)} = <span className={finished ? '' : 'text-slate-400'}>{finished ? fmt(move.end) : '?'}</span>
              </>
            )}
          </p>
          {mode === 'subtrair' && (
            <p className="mt-1 text-center font-mono text-base font-bold text-slate-600 sm:text-lg">
              = {signed(a)} + {signed(opposite(b))} <span className="font-sans text-xs font-semibold">(subtrair é somar o oposto)</span>
            </p>
          )}
          <div className="mt-3">
            <NumberLine start={a} delta={mode === 'comparar' ? 0 : move.delta} shown={walk.shown} compare={mode === 'comparar' ? b : undefined} />
          </div>
          <p role="status" className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700 sm:text-base">
            {sentence}
          </p>
          {mode !== 'comparar' && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
              <button type="button" onClick={() => walk.play(reduceMotion)} disabled={walk.running} className="col-span-2 inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-base font-black text-white shadow-md transition hover:bg-blue-800 active:scale-95 disabled:opacity-60">
                <Footprints size={18} /> {walk.running ? 'Andando…' : finished && steps > 0 ? 'Andar de novo' : 'Andar casa por casa'}
              </button>
              <button type="button" onClick={walk.step} disabled={finished} className="min-h-[52px] rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-black text-blue-800 transition hover:bg-blue-100 disabled:opacity-40">
                +1 passo
              </button>
              <button type="button" onClick={walk.showAll} disabled={finished} className="min-h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40">
                Ver resultado
              </button>
            </div>
          )}
        </Panel>

        <div className="grid items-start gap-4 sm:gap-6 md:grid-cols-2">
          <Panel title="Escolha os números">
            <div className="space-y-4">
              <NumberControl label={mode === 'comparar' ? 'Número a' : 'Primeiro número (onde começa)'} value={a} min={-10} max={10} step={1} onChange={setA} format={fmt} />
              <NumberControl label={mode === 'comparar' ? 'Número b' : mode === 'subtrair' ? 'Número que vou subtrair' : 'Número que vou somar'} value={b} min={-10} max={10} step={1} onChange={setB} format={fmt} />
              <button type="button" onClick={() => { setA(-3); setB(5) }} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
                <RotateCcw size={15} /> Recomeçar
              </button>
            </div>
          </Panel>

          {mode === 'comparar' ? (
            <Panel title="Distância até o zero">
              <dl className="grid grid-cols-2 gap-2">
                <Fact label="Módulo de a" value={`|${fmt(a)}| = ${Math.abs(a)}`} detail="distância de a até o zero" />
                <Fact label="Módulo de b" value={`|${fmt(b)}| = ${Math.abs(b)}`} detail="distância de b até o zero" />
                <Fact label="Oposto de a" value={fmt(opposite(a))} detail="mesma distância, outro lado" />
                <Fact label="Oposto de b" value={fmt(opposite(b))} detail="mesma distância, outro lado" />
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">As faixas embaixo da reta mostram o módulo: o tamanho do caminho até o zero, sem o sinal.</p>
            </Panel>
          ) : (
            <Panel title="Regras de sinais">
              <ul className="space-y-2">
                {signRules.map((item) => (
                  <li key={item.id} className={`rounded-xl border p-3 text-sm font-semibold ${rule === item.id ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                    {rule === item.id && <span className="mr-1 font-black">Agora:</span>}
                    {item.text}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                {mode === 'subtrair' ? 'Na subtração, troque o sinal do segundo número e some: 2 − (−4) = 2 + 4.' : 'Dica: olhe para onde a seta vai. A direção da caminhada é o sinal do número somado.'}
              </p>
            </Panel>
          )}
        </div>
      </div>

      <ChallengeCard
        simulator="inteiros"
        goals={[
          { id: 'zero', text: 'Some dois números diferentes de zero e chegue exatamente no zero.', met: mode === 'somar' && finished && a !== 0 && move.end === 0 },
          { id: 'atravessar', text: 'Comece num número positivo e termine num negativo.', met: mode !== 'comparar' && finished && a > 0 && move.end < 0 },
          { id: 'menos-menos', text: 'Subtraia um número negativo e veja a caminhada ir para a direita.', met: mode === 'subtrair' && finished && b < 0 },
          { id: 'comparar', text: 'Compare dois negativos e descubra qual é o maior.', met: mode === 'comparar' && a < 0 && b < 0 && a !== b },
        ]}
      />
      <TipBox>
        <strong>Pense em temperatura:</strong> se está −3 °C e esquenta 5 graus, fica 2 °C. Se está 2 °C e esfria 6 graus, fica −4 °C. Somar é esquentar, subtrair é esfriar, e o zero é só mais um ponto da reta.
      </TipBox>
    </PresentationMode>
  )
}
