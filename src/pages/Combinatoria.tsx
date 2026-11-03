import { useState } from 'react'
import { Eye, RotateCcw, Undo2 } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import { arrangement, combination, countChoices, factorial, listArrangements, listCombinations } from '../logic/combinatoria'

type Mode = 'arranjo' | 'combinacao' | 'permutacao' | 'pfc'

const modes: Array<{ id: Mode; label: string }> = [
  { id: 'pfc', label: 'Princípio da contagem' },
  { id: 'permutacao', label: 'Permutação' },
  { id: 'arranjo', label: 'Arranjo' },
  { id: 'combinacao', label: 'Combinação' },
]

const people = [
  { id: 'A', name: 'Ana', color: '#1d4ed8' },
  { id: 'B', name: 'Beto', color: '#c2410c' },
  { id: 'C', name: 'Caio', color: '#047857' },
  { id: 'D', name: 'Duda', color: '#7c3aed' },
  { id: 'E', name: 'Enzo', color: '#be185d' },
  { id: 'F', name: 'Flor', color: '#0e7490' },
]
const colorOf = (id: string) => people.find((p) => p.id === id)!.color
const LIMIT = 72

function Avatar({ id, size = 'md' }: { id: string; size?: 'sm' | 'md' }) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full font-black text-white ${size === 'sm' ? 'h-6 w-6 text-[11px]' : 'h-11 w-11 text-base'}`} style={{ background: colorOf(id) }} aria-hidden="true">
      {id}
    </span>
  )
}

function Builder({ mode }: { mode: 'arranjo' | 'combinacao' | 'permutacao' }) {
  const [n, setN] = useState(4)
  const [pRaw, setP] = useState(2)
  const p = mode === 'permutacao' ? n : Math.min(pRaw, n)
  const [picked, setPicked] = useState<string[]>([])
  const [found, setFound] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [showAll, setShowAll] = useState(false)
  const items = people.slice(0, n).map((x) => x.id)
  const ordered = mode !== 'combinacao'
  const total = mode === 'combinacao' ? combination(n, p) : arrangement(n, p)
  const all = ordered ? listArrangements(items, p) : listCombinations(items, p)
  const keyOf = (list: string[]) => (ordered ? list.join('') : [...list].sort().join(''))

  function resetAll(nextN = n, nextP = p) {
    setPicked([])
    setFound([])
    setMessage('')
    setShowAll(false)
    setN(nextN)
    setP(nextP)
  }

  function pick(id: string) {
    if (picked.includes(id) || picked.length >= p) return
    const next = [...picked, id]
    if (next.length < p) {
      setPicked(next)
      return
    }
    const key = keyOf(next)
    if (found.includes(key)) {
      setMessage(ordered ? 'Essa você já tinha encontrado.' : `Esse grupo você já tinha! ${next.join(', ')} é o mesmo grupo que ${key.split('').join(', ')}: na combinação a ordem não importa.`)
    } else {
      setFound((list) => [...list, key])
      setMessage(found.length + 1 === total ? 'Você encontrou todas as possibilidades!' : `Nova possibilidade: ${next.join(ordered ? ' → ' : ', ')}.`)
    }
    setPicked([])
  }

  const slotNames = mode === 'arranjo' ? ['1º lugar', '2º lugar', '3º lugar', '4º lugar'] : mode === 'permutacao' ? Array.from({ length: 6 }, (_, i) => `${i + 1}º da fila`) : Array.from({ length: 6 }, () => 'membro')
  const formula =
    mode === 'combinacao'
      ? `C(${n}, ${p}) = ${n}! ÷ (${p}! · ${n - p}!) = ${total}`
      : mode === 'arranjo'
        ? `A(${n}, ${p}) = ${Array.from({ length: p }, (_, i) => n - i).join(' × ')} = ${total}`
        : `P(${n}) = ${n}! = ${Array.from({ length: n }, (_, i) => n - i).join(' × ')} = ${factorial(n)}`
  const story =
    mode === 'combinacao'
      ? `Escolha uma comissão de ${p} pessoas entre ${n}. Não há cargos: só importa quem está no grupo.`
      : mode === 'arranjo'
        ? `Monte o pódio de uma corrida com ${n} pessoas: quem fica em 1º, 2º${p > 2 ? `, 3º` : ''}${p > 3 ? ' e 4º' : ''}. A ordem importa.`
        : `De quantas formas ${n} pessoas podem formar uma fila? Todas entram, só muda a ordem.`

  return (
    <>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_340px]">
        <Panel stage>
          <p className="rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-800 sm:text-base">{story}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Posições">
            {Array.from({ length: p }, (_, i) => (
              <div key={i} className={`flex min-w-[72px] flex-col items-center gap-1 rounded-2xl border-2 border-dashed p-2 ${picked[i] ? 'border-blue-200 bg-blue-50' : 'border-slate-300 bg-white'}`}>
                {picked[i] ? <Avatar id={picked[i]} /> : <span className="h-11 w-11 rounded-full bg-slate-100" />}
                <span className="text-[10px] font-black uppercase text-slate-500">{slotNames[i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {people.slice(0, n).map((person) => (
              <button key={person.id} type="button" onClick={() => pick(person.id)} disabled={picked.includes(person.id)} className="flex min-h-[56px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-30">
                <Avatar id={person.id} /> {person.name}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => setPicked((list) => list.slice(0, -1))} disabled={picked.length === 0} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 disabled:opacity-40">
              <Undo2 size={15} /> Desfazer
            </button>
            <button type="button" onClick={() => resetAll()} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
              <RotateCcw size={15} /> Recomeçar
            </button>
            <button type="button" aria-pressed={showAll} onClick={() => setShowAll((v) => !v)} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-blue-700 px-3 text-sm font-black text-white">
              <Eye size={15} /> {showAll ? 'Esconder lista' : 'Mostrar todas'}
            </button>
          </div>
          <p role="status" className="mt-3 min-h-[1.5rem] text-center text-sm font-semibold text-slate-700">
            {message}
          </p>
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-500">
              <span>Encontradas</span>
              <span>
                {found.length} de {total}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(found.length / total) * 100}%` }} />
            </div>
          </div>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {(showAll ? all.map(keyOf) : found).slice(0, LIMIT).map((key) => (
              <li key={key} className={`flex items-center gap-0.5 rounded-lg border p-1 ${found.includes(key) ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                {key.split('').map((id, i) => (
                  <Avatar key={i} id={id} size="sm" />
                ))}
              </li>
            ))}
            {showAll && all.length > LIMIT && <li className="self-center text-xs font-bold text-slate-500">+ {all.length - LIMIT} outras</li>}
          </ul>
        </Panel>
        <div className="space-y-4">
          <Panel title="Quantidades">
            <div className="space-y-4">
              <NumberControl label="Pessoas" value={n} min={2} max={6} step={1} onChange={(v) => resetAll(v, Math.min(p, v))} />
              {mode !== 'permutacao' && <NumberControl label={mode === 'arranjo' ? 'Lugares no pódio' : 'Tamanho do grupo'} value={p} min={1} max={Math.min(4, n)} step={1} onChange={(v) => resetAll(n, v)} />}
            </div>
          </Panel>
          <Panel title="A conta">
            <p className="font-mono text-base font-black text-slate-800">{formula}</p>
            {mode === 'combinacao' && (
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Compare: com ordem seriam A({n}, {p}) = {arrangement(n, p)}. Cada grupo aparece {factorial(p)} vezes nessa lista (as {factorial(p)} ordens das mesmas pessoas), então dividimos: {arrangement(n, p)} ÷ {factorial(p)} = {total}.
              </p>
            )}
            {mode === 'arranjo' && <p className="mt-2 text-xs leading-relaxed text-slate-600">Para o 1º lugar há {n} opções; para o 2º sobram {n - 1}{p > 2 ? `; para o 3º, ${n - 2}` : ''}. Multiplica tudo.</p>}
          </Panel>
        </div>
      </div>
      <ChallengeCard
        simulator={`combinatoria-${mode}`}
        goals={[
          { id: 'todas', text: 'Encontre todas as possibilidades montando uma por uma.', met: total > 0 && found.length === total },
          { id: 'tres', text: 'Encontre 3 possibilidades diferentes.', met: found.length >= 3 },
          {
            id: 'mais',
            text: mode === 'permutacao' ? 'Descubra quantas filas 6 pessoas formam.' : mode === 'arranjo' ? 'Monte um pódio de 3 lugares com 5 pessoas.' : 'Descubra quantos grupos de 2 dá para formar com 6 pessoas.',
            met: mode === 'permutacao' ? n === 6 : mode === 'arranjo' ? n === 5 && p === 3 : n === 6 && p === 2,
          },
          { id: 'lista', text: 'Abra a lista completa e compare com a conta.', met: showAll },
        ]}
      />
    </>
  )
}

const shirts = ['#2563eb', '#dc2626', '#16a34a', '#f59e0b']
const pants = ['#1e293b', '#64748b', '#0369a1']
const shoes = ['#f8fafc', '#a16207', '#111827']

function Outfit({ s, p, t }: { s: number; p: number; t: number }) {
  return (
    <svg viewBox="0 0 60 100" className="h-24 w-14" aria-hidden="true">
      <circle cx={30} cy={12} r={9} fill="#f2c9a0" />
      <path d="M 14 24 L 46 24 L 50 50 L 10 50 Z" fill={shirts[s]} />
      <rect x={14} y={50} width={14} height={34} fill={pants[p]} />
      <rect x={32} y={50} width={14} height={34} fill={pants[p]} />
      <rect x={11} y={84} width={18} height={8} rx={3} fill={shoes[t]} stroke="#475569" strokeWidth={1} />
      <rect x={31} y={84} width={18} height={8} rx={3} fill={shoes[t]} stroke="#475569" strokeWidth={1} />
    </svg>
  )
}

function CountingMode() {
  const [ns, setNs] = useState(2)
  const [np, setNp] = useState(2)
  const [nt, setNt] = useState(2)
  const [look, setLook] = useState({ s: 0, p: 0, t: 0 })
  const total = countChoices([ns, np, nt])
  const leafW = 300 / Math.max(total, 1)
  const W = 340
  const nodeY = [20, 90, 160, 230]

  return (
    <>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_340px]">
        <Panel stage>
          <p className="rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-800 sm:text-base">
            Você tem {ns} camisetas, {np} calças e {nt} pares de tênis. Quantos looks diferentes dá para montar?
          </p>
          <svg viewBox={`0 0 ${W} 250`} className="mx-auto mt-3 block h-auto w-full max-w-[640px]" role="img" aria-label={`Árvore de possibilidades com ${total} looks`}>
            {Array.from({ length: ns }, (_, i) => {
              const sx = 20 + ((i + 0.5) / ns) * 300
              return (
                <g key={i}>
                  <line x1={W / 2} y1={nodeY[0]} x2={sx} y2={nodeY[1]} strokeWidth={1.5} style={{ stroke: 'var(--svg-axis)' }} />
                  {Array.from({ length: np }, (_, j) => {
                    const px = 20 + ((i * np + j + 0.5) / (ns * np)) * 300
                    return (
                      <g key={j}>
                        <line x1={sx} y1={nodeY[1]} x2={px} y2={nodeY[2]} strokeWidth={1.2} style={{ stroke: 'var(--svg-axis)' }} />
                        {Array.from({ length: nt }, (_, k) => {
                          const idx = (i * np + j) * nt + k
                          const tx = 20 + (idx + 0.5) * leafW
                          const active = look.s === i && look.p === j && look.t === k
                          return (
                            <g key={k} onClick={() => setLook({ s: i, p: j, t: k })} style={{ cursor: 'pointer' }}>
                              <line x1={px} y1={nodeY[2]} x2={tx} y2={nodeY[3] - 6} strokeWidth={active ? 3 : 1} stroke={active ? '#1d4ed8' : undefined} style={active ? undefined : { stroke: 'var(--svg-axis)' }} />
                              <circle cx={tx} cy={nodeY[3]} r={Math.min(6, leafW / 2.4)} fill={shoes[k]} stroke={active ? '#1d4ed8' : '#475569'} strokeWidth={active ? 3 : 1} />
                            </g>
                          )
                        })}
                        <rect x={px - 7} y={nodeY[2] - 7} width={14} height={14} rx={2} fill={pants[j]} stroke={look.s === i && look.p === j ? '#1d4ed8' : '#ffffff'} strokeWidth={2} />
                      </g>
                    )
                  })}
                  <circle cx={sx} cy={nodeY[1]} r={10} fill={shirts[i]} stroke={look.s === i ? '#1d4ed8' : '#ffffff'} strokeWidth={3} onClick={() => setLook((l) => ({ ...l, s: i }))} style={{ cursor: 'pointer' }} />
                </g>
              )
            })}
            <circle cx={W / 2} cy={nodeY[0]} r={8} style={{ fill: 'var(--svg-ink)' }} />
          </svg>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Outfit s={look.s} p={Math.min(look.p, np - 1)} t={Math.min(look.t, nt - 1)} />
            <p className="text-sm font-semibold text-slate-700">
              Toque nas pontas da árvore para vestir cada look. <br />
              <span className="font-mono text-lg font-black text-blue-700">
                {ns} × {np} × {nt} = {total}
              </span>
            </p>
          </div>
        </Panel>
        <Panel title="Guarda-roupa">
          <div className="space-y-4">
            <NumberControl label="Camisetas" value={ns} min={1} max={4} step={1} onChange={(v) => { setNs(v); setLook({ s: 0, p: 0, t: 0 }) }} />
            <NumberControl label="Calças" value={np} min={1} max={3} step={1} onChange={(v) => { setNp(v); setLook({ s: 0, p: 0, t: 0 }) }} />
            <NumberControl label="Tênis" value={nt} min={1} max={3} step={1} onChange={(v) => { setNt(v); setLook({ s: 0, p: 0, t: 0 }) }} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-600">Cada camiseta pode ir com cada calça, e cada uma dessas duplas com cada tênis. Quando as escolhas são feitas em etapas, multiplicamos as opções de cada etapa.</p>
        </Panel>
      </div>
      <ChallengeCard
        simulator="combinatoria-pfc"
        goals={[
          { id: 'doze', text: 'Monte um guarda-roupa com exatamente 12 looks.', met: total === 12 },
          { id: 'maximo', text: 'Chegue ao maior número possível de looks.', met: total === 36 },
          { id: 'vestir', text: 'Vista o último look da árvore (a ponta mais à direita).', met: look.s === ns - 1 && look.p === np - 1 && look.t === nt - 1 && total > 1 },
          { id: 'um', text: 'Descubra o que acontece quando só existe 1 calça.', met: np === 1 && ns > 1 },
        ]}
      />
    </>
  )
}

export default function Combinatoria() {
  const [mode, setMode] = useState<Mode>('pfc')
  return (
    <PresentationMode title="Análise Combinatória">
      <SimulatorHeader id="combinatoria">
        Contar sem precisar listar tudo: monte looks, filas, pódios e grupos tocando nas opções, e descubra quando a ordem importa.
      </SimulatorHeader>
      <div className="mb-4 sm:mb-6">
        <SegmentedControl label="Tipo de contagem" options={modes} value={mode} onChange={setMode} />
      </div>
      {mode === 'pfc' ? <CountingMode /> : <Builder key={mode} mode={mode} />}
      <TipBox>
        <strong>A pergunta-chave:</strong> trocar a ordem gera uma possibilidade nova? Num pódio, Ana 1º e Beto 2º é diferente de Beto 1º e Ana 2º (arranjo). Numa comissão, {'{'}Ana, Beto{'}'} é o mesmo grupo que {'{'}Beto, Ana{'}'} (combinação).
      </TipBox>
    </PresentationMode>
  )
}
