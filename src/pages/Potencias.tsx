import { useState } from 'react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import Fact from '../components/ui/Fact'
import { cubeRoot, expandPower, power, squareRootInfo } from '../logic/potencias'

type Mode = 'potencia' | 'quadrada' | 'cubica'

const modes: Array<{ id: Mode; label: string }> = [
  { id: 'potencia', label: 'Potência' },
  { id: 'quadrada', label: 'Raiz quadrada' },
  { id: 'cubica', label: 'Cubo e raiz cúbica' },
]

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n: number) => String(n).split('').map((d) => SUP[Number(d)]).join('')
const br = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

function PowerMode() {
  const [base, setBase] = useState(2)
  const [exp, setExp] = useState(3)
  const value = power(base, exp)
  const rows = Array.from({ length: 7 }, (_, i) => 6 - i)
  return (
    <>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel>
          <p className="text-center font-mono text-4xl font-black text-slate-900 sm:text-6xl" aria-live="polite">
            {base}
            <span className="text-blue-700">{sup(exp)}</span> = {br(value)}
          </p>
          <p className="mt-2 text-center font-mono text-lg font-bold text-slate-600 sm:text-2xl">{exp === 0 ? 'nenhuma multiplicação: vale 1' : `${expandPower(base, exp)}`}</p>
          <div className="mt-4 flex min-h-[64px] flex-wrap items-center justify-center gap-1.5" aria-hidden="true">
            {Array.from({ length: exp }, (_, i) => (
              <span key={i} className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 font-mono text-xl font-black text-white shadow sm:h-14 sm:w-14 sm:text-2xl">
                {base}
              </span>
            ))}
            {exp === 0 && <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 font-mono text-xl font-black text-slate-900">1</span>}
          </div>
          <p className="mt-2 text-center text-sm font-semibold text-slate-600">
            A <strong>base</strong> {base} é o fator que se repete; o <strong>expoente</strong> {exp} diz quantas vezes ele aparece.
          </p>
        </Panel>
        <Panel title="Escolha a potência">
          <div className="space-y-4">
            <NumberControl label="Base" value={base} min={1} max={10} step={1} onChange={setBase} />
            <NumberControl label="Expoente" value={exp} min={0} max={6} step={1} onChange={setExp} />
          </div>
        </Panel>
      </div>
      <Panel className="mt-4 sm:mt-6" title={`Escada das potências de ${base}`}>
        <p className="mb-3 text-sm text-slate-600">Descendo a escada, cada degrau é o anterior dividido por {base}. Por isso {base}⁰ = 1: é o que sobra depois de dividir {base}¹ por {base}.</p>
        <ol className="space-y-1">
          {rows.map((e) => (
            <li key={e}>
              <button type="button" onClick={() => setExp(e)} aria-pressed={e === exp} className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl border px-3 text-left font-mono text-base font-black transition sm:text-lg ${e === exp ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                <span className="w-14">{base}{sup(e)}</span>
                <span className="flex-1">= {br(power(base, e))}</span>
                {e > 0 && base > 1 && <span className="text-xs font-bold text-slate-500">÷ {base} ↓</span>}
              </button>
            </li>
          ))}
        </ol>
      </Panel>
      <ChallengeCard
        simulator="potencias"
        goals={[
          { id: 'zero', text: 'Descubra quanto vale qualquer número elevado a zero.', met: exp === 0 && base > 1 },
          { id: 'mil', text: 'Monte uma potência igual a 1.000.', met: value === 1000 },
          { id: 'um', text: 'Veja que 1 elevado a qualquer expoente continua 1.', met: base === 1 && exp >= 3 },
          { id: 'grande', text: 'Passe de 100.000 com uma única potência.', met: value > 100000 },
        ]}
      />
    </>
  )
}

function SquareMode() {
  const [n, setN] = useState(20)
  const info = squareRootInfo(n)
  const side = info.lower
  const leftover = n - side * side
  const cell = 22
  const extraCols = Math.ceil(leftover / Math.max(side, 1))
  const W = (side + extraCols + 1) * cell + 20
  const H = Math.max(side, 1) * cell + 40
  return (
    <>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel>
          <p className="text-center font-mono text-4xl font-black text-slate-900 sm:text-5xl" aria-live="polite">
            √{n} {info.exact ? <>= <span className="text-emerald-700">{info.root}</span></> : <>≈ <span className="text-blue-700">{br(info.root)}</span></>}
          </p>
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto mt-3 block h-auto w-full max-w-[460px]" role="img" aria-label={`${n} quadradinhos: ${side * side} formam um quadrado de lado ${side}${leftover ? ` e sobram ${leftover}` : ''}`}>
            {Array.from({ length: side * side }, (_, i) => (
              <rect key={i} x={10 + (i % side) * cell} y={10 + Math.floor(i / side) * cell} width={cell - 3} height={cell - 3} rx={3} fill={info.exact ? '#059669' : '#1d4ed8'} />
            ))}
            {Array.from({ length: leftover }, (_, i) => (
              <rect key={`l${i}`} x={10 + (side + 1 + Math.floor(i / Math.max(side, 1))) * cell} y={10 + (i % Math.max(side, 1)) * cell} width={cell - 3} height={cell - 3} rx={3} fill="#f97316" />
            ))}
            {side > 0 && (
              <text x={10 + (side * cell) / 2} y={H - 8} textAnchor="middle" fontSize={14} fontWeight={900} style={{ fill: 'var(--svg-ink)' }}>
                lado {side}
              </text>
            )}
          </svg>
          <p role="status" className={`mt-2 rounded-xl border p-3 text-sm font-semibold ${info.exact ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
            {info.exact
              ? `${n} é um quadrado perfeito: os quadradinhos formam um quadrado ${side} × ${side} sem sobrar nenhum. Por isso √${n} = ${side}.`
              : `Com ${n} quadradinhos dá para montar um quadrado ${side} × ${side} (${side * side}) e sobram ${leftover}. Como ${side * side} < ${n} < ${(side + 1) ** 2}, a raiz fica entre ${side} e ${side + 1}.`}
          </p>
        </Panel>
        <Panel title="Quantos quadradinhos?">
          <NumberControl label="Número" value={n} min={1} max={100} step={1} onChange={setN} />
          <div className="mt-4 flex flex-wrap gap-1.5">
            {[4, 9, 16, 25, 36, 49, 64, 81, 100].map((q) => (
              <button key={q} type="button" onClick={() => setN(q)} aria-pressed={n === q} className={`min-h-[40px] min-w-[44px] rounded-lg border font-mono text-sm font-black ${n === q ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
                {q}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">Os botões são os quadrados perfeitos até 100.</p>
          <dl className="mt-4 grid grid-cols-2 gap-2">
            <Fact label="Quadrado abaixo" value={`${info.lower}² = ${info.lower ** 2}`} />
            <Fact label="Quadrado acima" value={`${info.exact ? info.lower : info.lower + 1}² = ${(info.exact ? info.lower : info.lower + 1) ** 2}`} />
          </dl>
        </Panel>
      </div>
      <ChallengeCard
        simulator="potencias-raiz"
        goals={[
          { id: 'perfeito', text: 'Encontre um quadrado perfeito maior que 40.', met: info.exact && n > 40 },
          { id: 'entre', text: 'Escolha um número cuja raiz fica entre 7 e 8.', met: info.lower === 7 && !info.exact },
          { id: 'quase', text: 'Deixe sobrar só 1 quadradinho fora do quadrado.', met: leftover === 1 && side > 1 },
          { id: 'cem', text: 'Monte o maior quadrado possível: 10 × 10.', met: n === 100 },
        ]}
      />
    </>
  )
}

function IsoCube({ a }: { a: number }) {
  const s = 120 / Math.max(a, 1)
  const cx = 150
  const cy = 150
  const u = (i: number, j: number, k: number) => ({ x: cx + (i - j) * s * 0.87, y: cy + (i + j) * s * 0.5 - k * s })
  const P = (p: { x: number; y: number }) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`
  const faces = [
    { pts: [u(0, 0, a), u(a, 0, a), u(a, a, a), u(0, a, a)], fill: '#93c5fd' },
    { pts: [u(0, a, 0), u(a, a, 0), u(a, a, a), u(0, a, a)], fill: '#3b82f6' },
    { pts: [u(a, 0, 0), u(a, a, 0), u(a, a, a), u(a, 0, a)], fill: '#1d4ed8' },
  ]
  const lines: Array<[{ x: number; y: number }, { x: number; y: number }]> = []
  for (let t = 1; t < a; t++) {
    lines.push([u(t, 0, a), u(t, a, a)], [u(0, t, a), u(a, t, a)])
    lines.push([u(t, a, 0), u(t, a, a)], [u(0, a, t), u(a, a, t)])
    lines.push([u(a, t, 0), u(a, t, a)], [u(a, 0, t), u(a, a, t)])
  }
  return (
    <svg viewBox="0 -20 300 300" className="mx-auto block h-auto w-full max-w-[320px]" role="img" aria-label={`Cubo de aresta ${a} formado por ${a ** 3} cubinhos`}>
      {faces.map((f, i) => (
        <polygon key={i} points={f.pts.map(P).join(' ')} fill={f.fill} stroke="#ffffff" strokeWidth={2} strokeLinejoin="round" />
      ))}
      {lines.map(([p, q], i) => (
        <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="#ffffff" strokeOpacity={0.8} strokeWidth={1.2} />
      ))}
    </svg>
  )
}

function CubeMode() {
  const [a, setA] = useState(3)
  const [guess, setGuess] = useState(64)
  const root = cubeRoot(guess)
  const exact = Number.isInteger(root)
  return (
    <>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel>
          <p className="text-center font-mono text-4xl font-black text-slate-900 sm:text-5xl" aria-live="polite">
            {a}³ = {a} × {a} × {a} = <span className="text-blue-700">{a ** 3}</span>
          </p>
          <IsoCube a={a} />
          <p className="text-center text-sm font-semibold text-slate-600">
            {a} camadas de {a} × {a} = {a * a} cubinhos. Total: {a ** 3} cubinhos. A raiz cúbica faz o caminho de volta: ∛{a ** 3} = {a}.
          </p>
        </Panel>
        <Panel title="Monte o cubo">
          <NumberControl label="Aresta (cubinhos por lado)" value={a} min={1} max={6} step={1} onChange={setA} />
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <NumberControl label="Teste uma raiz cúbica: ∛" value={guess} min={1} max={216} step={1} onChange={setGuess} />
            <p className={`mt-2 font-mono text-lg font-black ${exact ? 'text-emerald-700' : 'text-slate-700'}`}>
              ∛{guess} {exact ? '=' : '≈'} {br(root)}
            </p>
            <p className="text-xs text-slate-500">{exact ? `${guess} é um cubo perfeito.` : 'Não forma um cubo inteiro de cubinhos.'}</p>
          </div>
        </Panel>
      </div>
      <ChallengeCard
        simulator="potencias-cubo"
        goals={[
          { id: 'sessenta', text: 'Monte um cubo com 64 cubinhos.', met: a === 4 },
          { id: 'perfeito', text: 'Encontre um cubo perfeito maior que 100 na raiz cúbica.', met: exact && guess > 100 },
          { id: 'compara', text: 'Monte um cubo de aresta 5 e compare 5² com 5³.', met: a === 5 },
          { id: 'um', text: 'Descubra a raiz cúbica de 1.', met: guess === 1 },
        ]}
      />
    </>
  )
}

export default function Potencias() {
  const [mode, setMode] = useState<Mode>('potencia')
  return (
    <PresentationMode title="Potências e Raízes">
      <SimulatorHeader id="potencias">
        Potência é uma multiplicação repetida. A raiz é a operação inversa: descobre o lado do quadrado ou a aresta do cubo a partir da quantidade de peças.
      </SimulatorHeader>
      <div className="mb-4 sm:mb-6">
        <SegmentedControl label="Escolha o assunto" options={modes} value={mode} onChange={setMode} />
      </div>
      {mode === 'potencia' ? <PowerMode /> : mode === 'quadrada' ? <SquareMode /> : <CubeMode />}
      <TipBox>
        <strong>Cuidado com a pegadinha:</strong> 3² não é 3 × 2. É 3 × 3 = 9. O expoente conta quantas vezes a base se repete na multiplicação.
      </TipBox>
    </PresentationMode>
  )
}
