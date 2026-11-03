import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ListChecks, Shuffle } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import { useStepper } from '../components/ui/useStepper'
import { add, determinant, determinantTerms, multiply, scale, transpose, type Matrix } from '../logic/matrizes'

type Mode = 'determinante' | 'operacoes'
type Op = 'soma' | 'subtracao' | 'escalar' | 'produto' | 'transposta'

const modes: Array<{ id: Mode; label: string }> = [
  { id: 'determinante', label: 'Determinante' },
  { id: 'operacoes', label: 'Operações' },
]
const ops: Array<{ id: Op; label: string }> = [
  { id: 'soma', label: 'A + B' },
  { id: 'subtracao', label: 'A − B' },
  { id: 'escalar', label: '2 · A' },
  { id: 'produto', label: 'A × B' },
  { id: 'transposta', label: 'Aᵗ' },
]

const fmt = (v: number) => String(v).replace('-', '−')
const PLUS = '#1d4ed8'
const MINUS = '#dc2626'

function CellInput({ value, onChange, label, tone }: { value: number; onChange: (v: number) => void; label: string; tone?: string }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      aria-label={label}
      value={value}
      onChange={(event) => {
        const v = Number(event.target.value)
        if (Number.isFinite(v)) onChange(Math.max(-99, Math.min(99, Math.round(v))))
      }}
      className={`h-12 w-12 rounded-xl border-2 text-center font-mono text-lg font-black outline-none focus:border-blue-500 sm:h-14 sm:w-14 ${tone ?? 'border-slate-200 bg-white text-slate-900'}`}
    />
  )
}

function MatrixGrid({ m, name, onChange, highlight }: { m: Matrix; name: string; onChange?: (i: number, j: number, v: number) => void; highlight?: (i: number, j: number) => string | undefined }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xl font-black text-slate-700">{name} =</span>
      <div className="relative grid gap-1.5 border-x-4 border-slate-700 px-2 py-1" style={{ gridTemplateColumns: `repeat(${m[0].length}, minmax(0, auto))`, borderRadius: 10 }}>
        {m.map((row, i) =>
          row.map((v, j) =>
            onChange ? (
              <CellInput key={`${i}${j}`} value={v} label={`${name} linha ${i + 1} coluna ${j + 1}`} onChange={(next) => onChange(i, j, next)} tone={highlight?.(i, j)} />
            ) : (
              <span key={`${i}${j}`} className={`flex h-12 min-w-12 items-center justify-center rounded-xl border-2 px-1 font-mono text-lg font-black sm:h-14 sm:min-w-14 ${highlight?.(i, j) ?? 'border-slate-200 bg-slate-50 text-slate-900'}`}>
                {fmt(v)}
              </span>
            ),
          ),
        )}
      </div>
    </div>
  )
}

const update = (m: Matrix, i: number, j: number, v: number) => m.map((row, r) => row.map((x, c) => (r === i && c === j ? v : x)))
const randomMatrix = (n: number) => Array.from({ length: n }, () => Array.from({ length: n }, () => Math.floor(Math.random() * 11) - 4))

function DeterminantMode() {
  const reduceMotion = useReducedMotion() ?? false
  const [n, setN] = useState<2 | 3>(3)
  const [m2, setM2] = useState<Matrix>([[3, 1], [2, 4]])
  const [m3, setM3] = useState<Matrix>([[2, 0, 1], [1, 3, 2], [1, 1, 2]])
  const m = n === 2 ? m2 : m3
  const setM = n === 2 ? setM2 : setM3
  const terms = determinantTerms(m)
  const diagonals = [...terms.plus.map((cells, k) => ({ cells, sign: 1, value: terms.plusValues[k] })), ...terms.minus.map((cells, k) => ({ cells, sign: -1, value: terms.minusValues[k] }))]
  const steps = useStepper(`${n}:${JSON.stringify(m)}`, diagonals.length, 900)
  const current = steps.shown > 0 ? diagonals[steps.shown - 1] : null
  const det = determinant(m)
  const partial = diagonals.slice(0, steps.shown).reduce((s, d) => s + d.sign * d.value, 0)

  // Sarrus: repete as duas primeiras colunas à direita; cada diagonal vira uma linha reta.
  const extended = n === 3 ? m.map((row) => [...row, row[0], row[1]]) : m
  const k = steps.shown - 1 < terms.plus.length ? steps.shown - 1 : steps.shown - 1 - terms.plus.length
  const highlight3 = (i: number, j: number) => {
    if (!current) return undefined
    const col = current.sign > 0 ? k + i : k + 2 - i
    if (col === j) return current.sign > 0 ? 'border-blue-600 bg-blue-600 text-white' : 'border-red-600 bg-red-600 text-white'
    return undefined
  }

  return (
    <>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_340px]">
        <Panel stage>
          <div className="mb-3">
            <SegmentedControl label="Tamanho" options={[{ id: '2', label: '2 × 2' }, { id: '3', label: '3 × 3' }]} value={String(n) as '2' | '3'} onChange={(v) => setN(v === '2' ? 2 : 3)} />
          </div>
          <div className="flex justify-center overflow-x-auto py-2">
            <MatrixGrid m={m} name="M" onChange={(i, j, v) => setM(update(m, i, j, v))} />
          </div>
          {n === 3 && (
            <div className="mt-3 overflow-x-auto">
              <p className="mb-1 text-center text-xs font-bold uppercase tracking-wide text-slate-500">Regra de Sarrus: repita as duas primeiras colunas</p>
              <div className="mx-auto grid w-max grid-cols-5 gap-1">
                {extended.map((row, i) =>
                  row.map((v, j) => (
                    <span key={`${i}${j}`} className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 font-mono text-base font-black ${highlight3(i, j) ?? (j >= 3 ? 'border-dashed border-slate-300 bg-white text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-900')}`}>
                      {fmt(v)}
                    </span>
                  )),
                )}
              </div>
            </div>
          )}
          {n === 2 && current && (
            <div className="mt-3 flex justify-center">
              <MatrixGrid m={m} name="" highlight={(i, j) => (current.sign > 0 ? (i === j ? 'border-blue-600 bg-blue-600 text-white' : undefined) : i + j === 1 ? 'border-red-600 bg-red-600 text-white' : undefined)} />
            </div>
          )}
          <ol className="mt-4 space-y-1.5 font-mono text-sm font-bold" aria-live="polite">
            {diagonals.slice(0, steps.shown).map((d, k) => {
              const factors = []
              for (let i = 0; i < d.cells.length; i += 2) factors.push(fmt(m[d.cells[i]][d.cells[i + 1]]))
              return (
                <li key={k} className="rounded-lg px-2 py-1" style={{ color: d.sign > 0 ? PLUS : MINUS }}>
                  <span className="accent-text" style={{ ['--accent' as string]: d.sign > 0 ? PLUS : MINUS }}>
                    {d.sign > 0 ? '+' : '−'} ({factors.join(' · ')}) = {d.sign > 0 ? '+' : '−'}{fmt(d.value)}
                  </span>
                </li>
              )
            })}
          </ol>
          <p role="status" className={`mt-3 rounded-xl border p-3 text-base font-black ${steps.done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            {steps.done ? `det M = ${fmt(det)}${det === 0 ? ' (determinante zero: a matriz não tem inversa)' : ''}` : steps.shown === 0 ? 'Calcule passo a passo: diagonais principais somam, diagonais secundárias subtraem.' : `Soma parcial: ${fmt(partial)}`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={steps.step} disabled={steps.done} className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 text-base font-black text-white shadow-md hover:bg-blue-800 active:scale-95 disabled:opacity-50">
              <ListChecks size={18} /> {steps.done ? 'Pronto!' : `Próxima diagonal (${steps.shown + 1}/${diagonals.length})`}
            </button>
            <button type="button" onClick={() => steps.play(reduceMotion)} className="min-h-[52px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
              Animar tudo
            </button>
            <button type="button" onClick={() => setM(randomMatrix(n))} className="inline-flex min-h-[52px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <Shuffle size={16} /> Sortear
            </button>
          </div>
        </Panel>
        <Panel title="Como funciona">
          <p className="text-sm leading-relaxed text-slate-700">
            {n === 2 ? 'No 2 × 2: multiplique a diagonal principal (↘) e subtraia o produto da diagonal secundária (↙).' : 'No 3 × 3 (Sarrus): copie as duas primeiras colunas à direita. Some os produtos das três diagonais ↘ (azuis) e subtraia os produtos das três diagonais ↙ (vermelhas).'}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">Se uma linha for múltipla de outra, ou tiver só zeros, o determinante dá zero. Experimente!</p>
        </Panel>
      </div>
      <ChallengeCard
        simulator="matrizes-det"
        goals={[
          { id: 'passo', text: 'Calcule um determinante 3 × 3 diagonal por diagonal.', met: n === 3 && steps.done },
          { id: 'zero', text: 'Edite a matriz até o determinante dar zero.', met: det === 0 },
          { id: 'negativo', text: 'Monte uma matriz com determinante negativo.', met: det < 0 },
          { id: 'um', text: 'Monte uma matriz 2 × 2 com determinante 1.', met: n === 2 && det === 1 },
        ]}
      />
    </>
  )
}

function OperationsMode() {
  const [A, setA] = useState<Matrix>([[1, 2], [3, 4]])
  const [B, setB] = useState<Matrix>([[0, 1], [1, 0]])
  const [op, setOp] = useState<Op>('produto')
  const [cell, setCell] = useState<[number, number] | null>([0, 0])
  const result = op === 'soma' ? add(A, B) : op === 'subtracao' ? add(A, scale(B, -1)) : op === 'escalar' ? scale(A, 2) : op === 'produto' ? multiply(A, B) : transpose(A)
  const same = (x: Matrix, y: Matrix) => JSON.stringify(x) === JSON.stringify(y)
  const identity = [[1, 0], [0, 1]]
  const commute = same(multiply(A, B), multiply(B, A)) && !same(A, B) && !same(A, identity) && !same(B, identity)
  const usesB = op === 'soma' || op === 'subtracao' || op === 'produto'
  const sel = cell ?? [0, 0]
  const [ci, cj] = sel

  const explain =
    op === 'produto'
      ? `Linha ${ci + 1} de A × coluna ${cj + 1} de B: ${A[ci].map((v, k) => `${fmt(v)}·${fmt(B[k][cj])}`).join(' + ')} = ${fmt(result[ci][cj])}`
      : op === 'transposta'
        ? `A linha ${ci + 1} de A virou a coluna ${ci + 1} de Aᵗ. O elemento (${ci + 1}, ${cj + 1}) de Aᵗ é o (${cj + 1}, ${ci + 1}) de A = ${fmt(A[cj][ci])}.`
        : op === 'escalar'
          ? `Cada elemento é multiplicado por 2: 2 · ${fmt(A[ci][cj])} = ${fmt(result[ci][cj])}`
          : `Elemento a elemento, na mesma posição: ${fmt(A[ci][cj])} ${op === 'soma' ? '+' : '−'} ${fmt(B[ci][cj])} = ${fmt(result[ci][cj])}`

  const highlightA = (i: number, j: number) => {
    if (op === 'produto') return i === ci ? 'border-blue-600 bg-blue-50 text-blue-800' : undefined
    if (op === 'transposta') return i === cj && j === ci ? 'border-blue-600 bg-blue-50 text-blue-800' : undefined
    return i === ci && j === cj ? 'border-blue-600 bg-blue-50 text-blue-800' : undefined
  }
  const highlightB = (i: number, j: number) => {
    if (op === 'produto') return j === cj ? 'border-orange-500 bg-orange-50 text-orange-800' : undefined
    return i === ci && j === cj ? 'border-orange-500 bg-orange-50 text-orange-800' : undefined
  }

  return (
    <>
      <div className="mb-4">
        <SegmentedControl label="Operação" options={ops} value={op} onChange={setOp} />
      </div>
      <Panel stage>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <MatrixGrid m={A} name="A" onChange={(i, j, v) => setA(update(A, i, j, v))} highlight={highlightA} />
          {usesB && <MatrixGrid m={B} name="B" onChange={(i, j, v) => setB(update(B, i, j, v))} highlight={highlightB} />}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="font-mono text-xl font-black text-slate-700">{ops.find((o) => o.id === op)!.label} =</span>
          <div className="grid grid-cols-2 gap-1.5 border-x-4 border-slate-700 px-2 py-1" style={{ borderRadius: 10 }}>
            {result.map((row, i) =>
              row.map((v, j) => (
                <button key={`${i}${j}`} type="button" onClick={() => setCell([i, j])} aria-pressed={ci === i && cj === j} aria-label={`Ver como foi calculado o elemento da linha ${i + 1}, coluna ${j + 1}`} className={`flex h-12 min-w-12 items-center justify-center rounded-xl border-2 px-1 font-mono text-lg font-black transition sm:h-14 sm:min-w-14 ${ci === i && cj === j ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100'}`}>
                  {fmt(v)}
                </button>
              )),
            )}
          </div>
        </div>
        <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 font-mono text-sm font-bold text-emerald-800">
          {explain}
        </p>
        <p className="mt-2 text-center text-xs font-semibold text-slate-500">Toque em um elemento do resultado para ver de onde ele veio.</p>
      </Panel>
      <ChallengeCard
        simulator="matrizes-op"
        goals={[
          { id: 'produto', text: 'Toque no elemento da linha 2, coluna 2 de A × B e confira linha × coluna.', met: op === 'produto' && ci === 1 && cj === 1 },
          { id: 'comuta', text: 'A ordem costuma importar. Encontre A e B diferentes (e sem a identidade) com A × B = B × A.', met: op === 'produto' && commute },
          { id: 'identidade', text: 'Coloque B como identidade [1 0; 0 1] e veja A × B = A.', met: op === 'produto' && same(B, identity) },
          { id: 'nula', text: 'Faça A − B dar a matriz nula.', met: op === 'subtracao' && result.every((row) => row.every((v) => v === 0)) },
        ]}
      />
    </>
  )
}

export default function Matrizes() {
  const [mode, setMode] = useState<Mode>('determinante')
  return (
    <PresentationMode title="Matrizes e Determinantes">
      <SimulatorHeader id="matrizes">
        Matrizes são tabelas de números. Edite os elementos, faça operações e calcule o determinante acompanhando cada diagonal.
      </SimulatorHeader>
      <div className="mb-4 sm:mb-6">
        <SegmentedControl label="Escolha o assunto" options={modes} value={mode} onChange={setMode} />
      </div>
      {mode === 'determinante' ? <DeterminantMode /> : <OperationsMode />}
      <TipBox>
        <strong>Multiplicação de matrizes não é elemento a elemento:</strong> cada elemento do produto combina uma linha inteira da primeira com uma coluna inteira da segunda. Por isso a ordem importa.
      </TipBox>
    </PresentationMode>
  )
}
