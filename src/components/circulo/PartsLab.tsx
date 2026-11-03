import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Gamepad2, RotateCcw, Search, XCircle } from 'lucide-react'
import NumberControl from '../ui/NumberControl'
import SegmentedControl from '../ui/SegmentedControl'
import ChallengeCard from '../ui/ChallengeCard'
import { formatNumber } from '../../logic/circulo'

type Part = 'centro' | 'raio' | 'diametro' | 'corda' | 'arco' | 'circunferencia'

const CX = 200
const CY = 200
const R = 140
const at = (deg: number, r = R) => ({ x: CX + r * Math.cos((deg * Math.PI) / 180), y: CY - r * Math.sin((deg * Math.PI) / 180) })

const parts: Array<{ id: Part; label: string; color: string; text: string }> = [
  { id: 'centro', label: 'Centro', color: '#e11d48', text: 'O ponto do meio. Todos os pontos da circunferência estão à mesma distância dele.' },
  { id: 'raio', label: 'Raio', color: '#2563eb', text: 'Segmento que vai do centro até a borda. Todo raio do mesmo círculo tem o mesmo tamanho.' },
  { id: 'diametro', label: 'Diâmetro', color: '#7c3aed', text: 'Segmento que atravessa o círculo passando pelo centro. Vale dois raios: d = 2r.' },
  { id: 'corda', label: 'Corda', color: '#ea580c', text: 'Segmento reto que liga dois pontos da borda. O diâmetro é a maior corda de todas.' },
  { id: 'arco', label: 'Arco', color: '#0d9488', text: 'Um pedaço curvo da borda, entre dois pontos.' },
  { id: 'circunferencia', label: 'Circunferência', color: '#334155', text: 'A linha da borda, a “volta” do círculo. Mede π vezes o diâmetro.' },
]

const pick = (current: Part | null) => {
  const options = parts.map((p) => p.id).filter((id) => id !== current)
  return options[Math.floor(Math.random() * options.length)]
}

// Posições fixas de cada parte no desenho (escolhidas para não se sobreporem).
const radiusEnd = at(50)
const dLeft = at(180)
const dRight = at(0)
const chordA = at(215)
const chordB = at(295)
const arcA = at(110)
const arcB = at(160)

export default function PartsLab() {
  const [mode, setMode] = useState<'explorar' | 'jogo'>('explorar')
  const [radius, setRadius] = useState(3)
  const [selected, setSelectedRaw] = useState<Part>('raio')
  const [seen, setSeen] = useState<Part[]>(['raio'])
  const setSelected = (id: Part) => {
    setSelectedRaw(id)
    setSeen((list) => (list.includes(id) ? list : [...list, id]))
  }
  const [target, setTarget] = useState<Part>('diametro')
  const [score, setScore] = useState({ hits: 0, misses: 0, streak: 0 })
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const info = parts.find((p) => p.id === selected)!
  const color = (id: Part) => parts.find((p) => p.id === id)!.color
  const lit = (id: Part) => mode === 'explorar' && selected === id
  const width = (id: Part, base: number) => (lit(id) ? base + 3 : base)
  const opacity = (id: Part) => (mode === 'explorar' && selected !== id ? 0.35 : 1)

  function tap(id: Part) {
    if (mode === 'explorar') {
      setSelected(id)
      return
    }
    if (id === target) {
      setScore((s) => ({ hits: s.hits + 1, misses: s.misses, streak: s.streak + 1 }))
      setFeedback({ ok: true, text: `Isso! Esse é o ${parts.find((p) => p.id === id)!.label.toLowerCase()}.` })
      setTarget(pick(target))
    } else {
      setScore((s) => ({ hits: s.hits, misses: s.misses + 1, streak: 0 }))
      setFeedback({ ok: false, text: `Ops, você tocou no(a) ${parts.find((p) => p.id === id)!.label.toLowerCase()}. Procure o(a) ${parts.find((p) => p.id === target)!.label.toLowerCase()}.` })
    }
  }

  const hit = (id: Part) => ({ onClick: () => tap(id), style: { cursor: 'pointer' }, 'data-part': id })
  const labelAt = (id: Part) =>
    id === 'centro' ? { x: CX - 18, y: CY + 26 } : id === 'raio' ? { ...at(50, R / 2 + 18) } : id === 'diametro' ? { x: CX - 70, y: CY - 12 } : id === 'corda' ? { x: (chordA.x + chordB.x) / 2 - 8, y: (chordA.y + chordB.y) / 2 - 12 } : id === 'arco' ? at(135, R + 22) : at(330, R + 24)

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-3">
        <SegmentedControl
          label="Modo"
          options={[
            { id: 'explorar', label: 'Explorar' },
            { id: 'jogo', label: 'Jogo: encontre a parte' },
          ]}
          value={mode}
          onChange={(m) => {
            setMode(m)
            setFeedback(null)
          }}
        />
      </div>
      <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <svg viewBox="0 0 400 400" className="mx-auto block h-auto w-full max-w-[420px] touch-manipulation select-none" role="img" aria-label="Círculo com centro, raio, diâmetro, corda, arco e circunferência">
          <circle cx={CX} cy={CY} r={R} fill="#ffffff" fillOpacity={0.9} stroke={color('circunferencia')} strokeWidth={width('circunferencia', 4)} opacity={opacity('circunferencia')} />
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="transparent" strokeWidth={22} {...hit('circunferencia')} />

          <path d={`M ${arcA.x} ${arcA.y} A ${R} ${R} 0 0 0 ${arcB.x} ${arcB.y}`} fill="none" stroke={color('arco')} strokeWidth={width('arco', 9)} strokeLinecap="round" opacity={opacity('arco')} />
          <path d={`M ${arcA.x} ${arcA.y} A ${R} ${R} 0 0 0 ${arcB.x} ${arcB.y}`} fill="none" stroke="transparent" strokeWidth={30} {...hit('arco')} />

          <line x1={dLeft.x} y1={dLeft.y} x2={dRight.x} y2={dRight.y} stroke={color('diametro')} strokeWidth={width('diametro', 5)} strokeLinecap="round" opacity={opacity('diametro')} />
          <line x1={dLeft.x} y1={dLeft.y} x2={dRight.x} y2={dRight.y} stroke="transparent" strokeWidth={26} {...hit('diametro')} />

          <line x1={chordA.x} y1={chordA.y} x2={chordB.x} y2={chordB.y} stroke={color('corda')} strokeWidth={width('corda', 5)} strokeLinecap="round" opacity={opacity('corda')} />
          <line x1={chordA.x} y1={chordA.y} x2={chordB.x} y2={chordB.y} stroke="transparent" strokeWidth={26} {...hit('corda')} />

          <line x1={CX} y1={CY} x2={radiusEnd.x} y2={radiusEnd.y} stroke={color('raio')} strokeWidth={width('raio', 5)} strokeLinecap="round" opacity={opacity('raio')} />
          <line x1={CX} y1={CY} x2={radiusEnd.x} y2={radiusEnd.y} stroke="transparent" strokeWidth={26} {...hit('raio')} />

          <circle cx={CX} cy={CY} r={lit('centro') ? 10 : 7} fill={color('centro')} stroke="#ffffff" strokeWidth={2.5} opacity={opacity('centro')} />
          <circle cx={CX} cy={CY} r={20} fill="transparent" {...hit('centro')} />

          {mode === 'explorar' &&
            (() => {
              const p = labelAt(selected)
              return (
                <motion.g key={selected} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ pointerEvents: 'none' }}>
                  <rect x={p.x - 52} y={p.y - 17} width={104} height={26} rx={13} fill={info.color} />
                  <text x={p.x} y={p.y + 1} textAnchor="middle" fontSize={14} fontWeight={900} fill="#ffffff">
                    {selected === 'raio' ? `r = ${formatNumber(radius, 1)}` : selected === 'diametro' ? `d = ${formatNumber(2 * radius, 1)}` : selected === 'circunferencia' ? `C ≈ ${formatNumber(2 * Math.PI * radius, 1)}` : info.label}
                  </text>
                </motion.g>
              )
            })()}
        </svg>

        <div className="space-y-3">
          {mode === 'explorar' ? (
            <>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Partes do círculo">
                {parts.map((p) => (
                  <button key={p.id} type="button" aria-pressed={selected === p.id} onClick={() => setSelected(p.id)} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border-2 px-3 text-sm font-black transition" style={selected === p.id ? { background: p.color, borderColor: p.color, color: '#ffffff' } : { borderColor: '#e2e8f0' }}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: selected === p.id ? '#ffffff' : p.color }} aria-hidden="true" />
                    <span className={selected === p.id ? '' : 'text-slate-700'}>{p.label}</span>
                  </button>
                ))}
              </div>
              <motion.div key={selected} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border bg-white p-4 shadow-sm" style={{ borderColor: info.color }}>
                <p className="flex items-center gap-2 text-lg font-black" style={{ color: info.color }}>
                  <Search size={18} /> {info.label}
                </p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-700">{info.text}</p>
              </motion.div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <NumberControl label="Raio" value={radius} min={1} max={10} step={0.5} onChange={setRadius} format={(v) => `${formatNumber(v, 1)} cm`} />
                <p className="mt-2 font-mono text-sm font-black text-slate-700">
                  d = 2 × {formatNumber(radius, 1)} = <span className="text-violet-700">{formatNumber(2 * radius, 1)} cm</span>
                </p>
                <p className="text-xs text-slate-500">Mude o raio: o diâmetro é sempre o dobro.</p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl border-2 border-dashed bg-white p-4 text-center" style={{ borderColor: color(target) }}>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">Toque no desenho:</p>
                <motion.p key={target + score.hits} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-1 text-3xl font-black" style={{ color: color(target) }}>
                  {parts.find((p) => p.id === target)!.label}
                </motion.p>
              </div>
              {feedback && (
                <p role="status" className={`flex items-start gap-2 rounded-xl border p-3 text-sm font-semibold ${feedback.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
                  {feedback.ok ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <XCircle size={18} className="mt-0.5 shrink-0" />} {feedback.text}
                </p>
              )}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2">
                  <p className="text-[10px] font-black uppercase text-emerald-700">Acertos</p>
                  <p className="font-mono text-2xl font-black text-emerald-800">{score.hits}</p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2">
                  <p className="text-[10px] font-black uppercase text-rose-700">Erros</p>
                  <p className="font-mono text-2xl font-black text-rose-800">{score.misses}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-2">
                  <p className="text-[10px] font-black uppercase text-amber-700">Sequência</p>
                  <p className="font-mono text-2xl font-black text-amber-900">{score.streak}</p>
                </div>
              </div>
              <button type="button" onClick={() => { setScore({ hits: 0, misses: 0, streak: 0 }); setFeedback(null); setTarget(pick(null)) }} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
                <RotateCcw size={15} /> Zerar placar
              </button>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Gamepad2 size={14} /> Dica: o arco é o pedaço curvo verde; a circunferência é a borda inteira.
              </p>
            </>
          )}
        </div>
      </div>
      <ChallengeCard
        simulator="pi-partes"
        goals={[
          { id: 'todas', text: 'Toque em cada uma das 6 partes no modo Explorar.', met: seen.length === parts.length },
          { id: 'cinco', text: 'No jogo, acerte 5 partes seguidas sem errar.', met: score.streak >= 5 },
          { id: 'dez', text: 'Faça um círculo com diâmetro de 10 cm.', met: radius === 5 },
          { id: 'dez-acertos', text: 'Chegue a 10 acertos no jogo.', met: score.hits >= 10 },
        ]}
      />
    </div>
  )
}
