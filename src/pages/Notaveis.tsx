import { useState } from 'react'
import { motion } from 'framer-motion'
import { Puzzle } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import { notable, type Notable } from '../logic/notaveis'

const kinds: Array<{ id: Notable; label: string }> = [
  { id: 'soma', label: '(a + b)²' },
  { id: 'diferenca', label: '(a − b)²' },
  { id: 'produto', label: '(a + b)(a − b)' },
]

const CA = '#1d4ed8'
const CAB = '#047857'
const CB = '#ea580c'
const CUT = '#dc2626'
const SIZE = 300
const spring = { type: 'spring' as const, stiffness: 120, damping: 18 }

function Piece({ x, y, w, h, color, label, opacity = 0.85 }: { x: number; y: number; w: number; h: number; color: string; label: string; opacity?: number }) {
  return (
    <motion.g initial={false} animate={{ x, y }} transition={spring}>
      <motion.rect initial={false} animate={{ width: w, height: h }} transition={spring} rx={4} fill={color} fillOpacity={opacity} stroke="#ffffff" strokeWidth={2} />
      {w > 26 && h > 18 && (
        <motion.text initial={false} animate={{ x: w / 2, y: h / 2 + 6 }} transition={spring} textAnchor="middle" fontSize={Math.min(20, w / 3, h / 1.5)} fontWeight={900} fill="#ffffff">
          {label}
        </motion.text>
      )}
    </motion.g>
  )
}

export default function Notaveis() {
  const [kind, setKind] = useState<Notable>('soma')
  const [a, setA] = useState(5)
  const [b, setB] = useState(2)
  const [built, setBuilt] = useState(false)
  const bb = kind === 'soma' ? b : Math.min(b, a - 1)
  const r = notable(kind, a, bb)
  const gap = built ? 0 : 18
  const O = 30

  let pieces = null
  let outline = null
  if (kind === 'soma') {
    const u = SIZE / (a + bb)
    pieces = (
      <>
        <Piece x={O} y={O} w={a * u} h={a * u} color={CA} label="a²" />
        <Piece x={O + a * u + gap} y={O} w={bb * u} h={a * u} color={CAB} label="ab" />
        <Piece x={O} y={O + a * u + gap} w={a * u} h={bb * u} color={CAB} label="ab" />
        <Piece x={O + a * u + gap} y={O + a * u + gap} w={bb * u} h={bb * u} color={CB} label="b²" />
      </>
    )
    outline = { w: (a + bb) * u, h: (a + bb) * u, top: `a + b = ${a + bb}`, side: `a + b = ${a + bb}` }
  } else if (kind === 'diferenca') {
    const u = SIZE / a
    const c = a - bb
    pieces = (
      <>
        <Piece x={O} y={O} w={c * u} h={c * u} color={CA} label="(a−b)²" />
        <Piece x={O + c * u + gap} y={O} w={bb * u} h={c * u} color={CUT} label="" opacity={built ? 0.25 : 0.7} />
        <Piece x={O} y={O + c * u + gap} w={c * u} h={bb * u} color={CUT} label="" opacity={built ? 0.25 : 0.7} />
        <Piece x={O + c * u + gap} y={O + c * u + gap} w={bb * u} h={bb * u} color={CB} label="b²" />
      </>
    )
    outline = { w: a * u, h: a * u, top: `a = ${a}`, side: `a = ${a}` }
  } else {
    const u = SIZE / (a + bb)
    const c = a - bb
    pieces = (
      <>
        <Piece x={O} y={O} w={a * u} h={c * u} color={CA} label="a(a−b)" />
        <Piece x={built ? O + a * u : O} y={built ? O : O + c * u + 14} w={built ? bb * u : c * u} h={built ? c * u : bb * u} color={CAB} label="b(a−b)" />
        {!built && <rect x={O + c * u} y={O + c * u + 14} width={bb * u} height={bb * u} fill="none" stroke={CUT} strokeWidth={2.5} strokeDasharray="6 5" />}
      </>
    )
    outline = built ? { w: (a + bb) * u, h: c * u, top: `a + b = ${a + bb}`, side: `a − b = ${c}` } : { w: a * u, h: a * u + 14, top: `a = ${a}`, side: `a = ${a}` }
  }

  const termText =
    kind === 'soma'
      ? `${a + bb}² = ${a}² + 2·${a}·${bb} + ${bb}² → ${r.left} = ${r.terms.a2} + ${r.terms.ab2} + ${r.terms.b2}`
      : kind === 'diferenca'
        ? `${a - bb}² = ${a}² − 2·${a}·${bb} + ${bb}² → ${r.left} = ${r.terms.a2} − ${r.terms.ab2} + ${r.terms.b2}`
        : `${a + bb} · ${a - bb} = ${a}² − ${bb}² → ${r.left} = ${r.terms.a2} − ${r.terms.b2}`

  const explain =
    kind === 'soma'
      ? 'O quadrado de lado a + b é formado por um quadrado a², um quadrado b² e DOIS retângulos a × b. Por isso aparece o 2ab: esquecer ele é o erro mais comum!'
      : kind === 'diferenca'
        ? 'Do quadrado a² tiramos duas faixas a × b (em vermelho). Mas o cantinho b² foi tirado duas vezes, então devolvemos um b².'
        : 'Do quadrado a² tiramos o cantinho b². A peça verde gira e encaixa ao lado: vira um retângulo (a + b) × (a − b).'

  return (
    <PresentationMode title="Produtos Notáveis">
      <SimulatorHeader id="notaveis">
        Produtos notáveis são multiplicações que aparecem tanto que viraram fórmula. Monte cada uma com peças de área e veja de onde vem cada termo.
      </SimulatorHeader>
      <div className="mb-4 sm:mb-6">
        <SegmentedControl label="Produto notável" options={kinds} value={kind} onChange={(k) => { setKind(k); setBuilt(false) }} />
      </div>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel stage>
          <p className="text-center font-mono text-lg font-black text-slate-900 sm:text-3xl">{r.formula}</p>
          <svg viewBox={`0 0 ${SIZE + 2 * O + 40} ${SIZE + 2 * O + 30}`} className="mx-auto mt-2 block h-auto w-full max-w-[440px]" role="img" aria-label={`${r.formula} com a = ${a} e b = ${bb}`}>
            {built && outline && <rect x={O} y={O} width={outline.w} height={outline.h} fill="none" strokeWidth={3} style={{ stroke: 'var(--svg-ink)' }} />}
            {pieces}
            {outline && (
              <>
                <text x={O + outline.w / 2} y={O - 10} textAnchor="middle" fontSize={15} fontWeight={900} style={{ fill: 'var(--svg-ink)' }}>
                  {outline.top}
                </text>
                <text x={O + outline.w + (built ? 10 : 28)} y={O + outline.h / 2} fontSize={15} fontWeight={900} style={{ fill: 'var(--svg-ink)' }} transform={`rotate(90 ${O + outline.w + (built ? 10 : 28)} ${O + outline.h / 2})`} textAnchor="middle">
                  {outline.side}
                </text>
              </>
            )}
          </svg>
          <button type="button" aria-pressed={built} onClick={() => setBuilt((v) => !v)} className={`mt-2 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl px-4 text-base font-black shadow transition active:scale-95 ${built ? 'bg-amber-400 text-slate-900' : 'bg-blue-700 text-white hover:bg-blue-800'}`}>
            <Puzzle size={18} /> {built ? 'Separar as peças' : kind === 'produto' ? 'Mover a peça verde' : 'Encaixar as peças'}
          </button>
          <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">{explain}</p>
        </Panel>
        <div className="space-y-4">
          <Panel title="Medidas">
            <div className="space-y-4">
              <NumberControl label="a" value={a} min={2} max={8} step={1} onChange={setA} />
              <NumberControl label="b" value={bb} min={1} max={kind === 'soma' ? 5 : a - 1} step={1} onChange={setB} />
            </div>
          </Panel>
          <Panel title="Conferindo com números">
            <p className="font-mono text-base font-black leading-relaxed text-slate-800" aria-live="polite">
              {termText}
            </p>
            <p className="mt-2 text-xs font-semibold text-emerald-700">Os dois lados dão {r.left}: a fórmula funciona.</p>
            {kind === 'soma' && (
              <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                Erro comum: achar que ({a} + {bb})² = {a}² + {bb}² = {a * a + bb * bb}. Faltam os {2 * a * bb} dos dois retângulos!
              </p>
            )}
          </Panel>
        </div>
      </div>
      <ChallengeCard
        simulator="notaveis"
        goals={[
          { id: 'montar', text: 'Encaixe as peças do quadrado da soma.', met: kind === 'soma' && built },
          { id: 'cem', text: 'Monte (a + b)² = 100.', met: kind === 'soma' && r.left === 100 },
          { id: 'devolver', text: 'Descubra por que o b² volta no quadrado da diferença.', met: kind === 'diferenca' && built },
          { id: 'retangulo', text: 'Transforme a² − b² em um retângulo.', met: kind === 'produto' && built },
        ]}
      />
      <TipBox>
        <strong>Fatorar é o caminho de volta:</strong> se você vê x² + 6x + 9, pense nas peças: x², dois retângulos 3x e um quadrado 9 = 3². Elas formam um quadrado de lado x + 3, então x² + 6x + 9 = (x + 3)².
      </TipBox>
    </PresentationMode>
  )
}
