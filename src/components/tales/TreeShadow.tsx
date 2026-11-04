import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun } from 'lucide-react'
import NumberControl from '../ui/NumberControl'

const br = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

/**
 * Aplicação de Tales: os raios de sol chegam paralelos, então a razão
 * altura ÷ sombra é a mesma para o bastão e para a árvore.
 */
export default function TreeShadow() {
  const [stick, setStick] = useState(1)
  const [stickShadow, setStickShadow] = useState(1.5)
  const [treeShadow, setTreeShadow] = useState(9)
  const [revealed, setRevealed] = useState(false)
  const tree = (stick * treeShadow) / stickShadow
  const W = 560
  const ground = 230
  const u = Math.min(200 / Math.max(tree, 1), 185 / treeShadow, 26)
  const treeX = 360
  const stickX = 90
  const ray = (x: number, h: number, s: number) => `M ${x} ${ground - h * u} L ${x + s * u} ${ground}`

  return (
    <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <svg viewBox={`0 0 ${W} 260`} className="block h-auto w-full rounded-2xl" style={{ background: 'linear-gradient(#bae6fd, #e0f2fe 70%)' }} role="img" aria-label={`Bastão de ${br(stick)} m com sombra de ${br(stickShadow)} m e árvore com sombra de ${br(treeShadow)} m`}>
        <circle cx={40} cy={36} r={20} fill="#fde047" stroke="#facc15" strokeWidth={6} />
        <rect x={0} y={ground} width={W} height={30} fill="#86efac" />
        {/* sombras */}
        <motion.rect initial={false} animate={{ width: stickShadow * u }} x={stickX} y={ground - 3} height={7} rx={3} fill="#334155" opacity={0.45} />
        <motion.rect initial={false} animate={{ width: treeShadow * u }} x={treeX} y={ground - 3} height={7} rx={3} fill="#334155" opacity={0.45} />
        {/* raios paralelos */}
        <path d={ray(stickX, stick, stickShadow)} stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="6 5" fill="none" />
        <path d={ray(treeX, tree, treeShadow)} stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="6 5" fill="none" />
        {/* bastão */}
        <rect x={stickX - 3} y={ground - stick * u} width={6} height={stick * u} fill="#78350f" />
        {/* árvore */}
        <motion.g initial={false} animate={{ scaleY: 1 }}>
          <rect x={treeX - 7} y={ground - tree * u * 0.45} width={14} height={tree * u * 0.45} fill="#92400e" />
          <ellipse cx={treeX} cy={ground - tree * u * 0.68} rx={Math.max(18, tree * u * 0.22)} ry={tree * u * 0.32} fill="#16a34a" />
          <ellipse cx={treeX - 10} cy={ground - tree * u * 0.74} rx={Math.max(10, tree * u * 0.1)} ry={tree * u * 0.14} fill="#22c55e" opacity={0.8} />
        </motion.g>
        {/* cotas */}
        <text x={stickX - 10} y={ground - (stick * u) / 2} textAnchor="end" fontSize={13} fontWeight={900} fill="#78350f">
          {br(stick)} m
        </text>
        <text x={stickX + (stickShadow * u) / 2} y={ground + 20} textAnchor="middle" fontSize={12} fontWeight={900} fill="#1e293b">
          {br(stickShadow)} m
        </text>
        <text x={treeX + (treeShadow * u) / 2} y={ground + 20} textAnchor="middle" fontSize={12} fontWeight={900} fill="#1e293b">
          {br(treeShadow)} m
        </text>
        <line x1={treeX - 26} x2={treeX - 26} y1={ground} y2={ground - tree * u} stroke="#7c3aed" strokeWidth={2.5} />
        <rect x={treeX - 84} y={ground - (tree * u) / 2 - 13} width={54} height={24} rx={8} fill="#7c3aed" />
        <text x={treeX - 57} y={ground - (tree * u) / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={900} fill="#ffffff">
          {revealed ? `${br(tree)} m` : '? m'}
        </text>
      </svg>
      <div className="space-y-3">
        <p className="text-sm font-semibold leading-relaxed text-slate-700">
          Os raios de sol chegam paralelos. Por isso a altura e a sombra do bastão estão na mesma razão que a altura e a sombra da árvore.
        </p>
        <NumberControl label="Altura do bastão" value={stick} min={0.5} max={2} step={0.1} onChange={(v) => { setStick(v); setRevealed(false) }} format={(v) => `${br(v)} m`} />
        <NumberControl label="Sombra do bastão" value={stickShadow} min={0.5} max={3} step={0.1} onChange={(v) => { setStickShadow(v); setRevealed(false) }} format={(v) => `${br(v)} m`} />
        <NumberControl label="Sombra da árvore" value={treeShadow} min={2} max={20} step={0.5} onChange={(v) => { setTreeShadow(v); setRevealed(false) }} format={(v) => `${br(v)} m`} />
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm font-bold text-slate-700">
          <p>altura ÷ sombra é igual nos dois:</p>
          <p className="mt-1">
            {br(stick)} ÷ {br(stickShadow)} = h ÷ {br(treeShadow)}
          </p>
          <p>h = {br(stick)} × {br(treeShadow)} ÷ {br(stickShadow)}</p>
        </div>
        <button type="button" onClick={() => setRevealed(true)} className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-base font-black ${revealed ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'bg-blue-700 text-white shadow'}`}>
          <Sun size={18} /> {revealed ? `A árvore mede ${br(tree)} m` : 'Calcular a altura da árvore'}
        </button>
      </div>
    </div>
  )
}
