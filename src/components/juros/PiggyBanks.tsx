import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  capital: number
  simple: number
  compound: number
  money: (value: number) => string
}

function Piggy({ color, label }: { color: string; label: string }) {
  return (
    <g>
      <ellipse cx={60} cy={70} rx={46} ry={34} fill={color} />
      <circle cx={100} cy={64} r={13} fill={color} />
      <ellipse cx={108} cy={66} rx={7} ry={9} fill="#ffffff" opacity={0.35} />
      <circle cx={106} cy={63} r={1.8} fill="#1e293b" />
      <circle cx={110} cy={68} r={1.8} fill="#1e293b" />
      <path d="M 78 38 L 90 30 L 88 46 Z" fill={color} />
      <circle cx={84} cy={56} r={3} fill="#1e293b" />
      <rect x={45} y={36} width={26} height={5} rx={2.5} fill="#1e293b" opacity={0.55} />
      {[30, 52, 74, 92].map((x) => (
        <rect key={x} x={x} y={96} width={10} height={14} rx={3} fill={color} />
      ))}
      <path d="M 14 64 q -10 -6 -6 -14" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" />
      <text x={60} y={78} textAnchor="middle" fontSize={11} fontWeight={900} fill="#ffffff">
        {label}
      </text>
    </g>
  )
}

function Stack({ coins, capitalCoins, x0 }: { coins: number; capitalCoins: number; x0: number }) {
  const shown = Math.min(coins, 60)
  return (
    <g>
      <AnimatePresence>
        {Array.from({ length: shown }, (_, i) => {
          const col = Math.floor(i / 12)
          const row = i % 12
          const interest = i >= capitalCoins
          return (
            <motion.g key={i} initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ type: 'spring', stiffness: 400, damping: 22, delay: Math.max(0, i - capitalCoins) * 0.015 }}>
              <ellipse cx={x0 + col * 26} cy={106 - row * 7} rx={11} ry={4} fill={interest ? '#b45309' : '#64748b'} />
              <ellipse cx={x0 + col * 26} cy={104 - row * 7} rx={11} ry={4} fill={interest ? '#fbbf24' : '#cbd5e1'} stroke={interest ? '#d97706' : '#94a3b8'} strokeWidth={1} />
            </motion.g>
          )
        })}
      </AnimatePresence>
      {coins > shown && (
        <text x={x0 + 60} y={20} fontSize={11} fontWeight={900} fill="#b45309">
          + {coins - shown}
        </text>
      )}
    </g>
  )
}

/** Dois cofrinhos lado a lado: moedas prateadas são o capital, douradas são os juros. */
export default function PiggyBanks({ capital, simple, compound, money }: Props) {
  const unit = Math.max(capital / 6, compound / 48)
  const capitalCoins = Math.round(capital / unit)
  const cols = [
    { label: 'simples', value: simple, color: '#60a5fa' },
    { label: 'compostos', value: compound, color: '#84cc16' },
  ]
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {cols.map((c) => (
        <figure key={c.label} className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center">
          <svg viewBox="0 0 250 120" className="block h-auto w-full" role="img" aria-label={`Cofrinho dos juros ${c.label}: ${money(c.value)}`}>
            <Piggy color={c.color} label={c.label} />
            <Stack coins={Math.round(c.value / unit)} capitalCoins={capitalCoins} x0={140} />
          </svg>
          <figcaption className="font-mono text-sm font-black text-slate-800">{money(c.value)}</figcaption>
        </figure>
      ))}
      <p className="flex flex-wrap sm:col-span-2 items-center justify-center gap-3 text-[11px] font-bold text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300 ring-1 ring-slate-400" /> capital
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 ring-1 ring-amber-600" /> juros
        </span>
        <span>cada moeda ≈ {money(unit)}</span>
      </p>
    </div>
  )
}
