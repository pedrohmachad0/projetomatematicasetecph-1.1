import { motion } from 'framer-motion'
import { CircleDot } from 'lucide-react'
import { formatNumber, getArcLength, getSectorArea, type CircleMode, type CircleState } from '../../logic/circulo'

interface Props { state: CircleState; mode: CircleMode; angle: number; onModeChange: (mode: CircleMode) => void }

const cx = 300
const cy = 205
const r = 145
const point = (deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}
const sectorPath = (deg: number) => {
  const s = point(0); const e = point(deg)
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${deg > 180 ? 1 : 0} 1 ${e.x} ${e.y} Z`
}

export default function CircleVisualization({ state, mode, angle, onModeChange }: Props) {
  const e = point(angle)
  const chord = Math.hypot(e.x - point(0).x, e.y - point(0).y)
  const arc = getArcLength(state.radius, angle)
  const sector = getSectorArea(state.radius, angle)

  return <div className="w-full">
    <div className="mb-3 flex items-center justify-between gap-2 px-1">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-700"><CircleDot size={18} className="text-blue-700" />{mode === 'desenrolar' ? 'Desenrolando a circunferência' : 'Visualização do círculo'}</div>
      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">r = {formatNumber(state.radius)} u</span>
    </div>

    <svg viewBox="0 0 900 500" role="img" aria-label="Visualização interativa do círculo" className="w-full">
      <defs><linearGradient id="circleFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#dbeafe"/><stop offset="100%" stopColor="#eff6ff"/></linearGradient></defs>

      <motion.g animate={{ opacity: mode === 'desenrolar' ? 0.2 : 1 }} transition={{ duration: 0.35 }}>
        <circle cx={cx} cy={cy} r={r} fill="url(#circleFill)" stroke="#2563eb" strokeWidth="5" />
        {mode === 'area' && <path d={sectorPath(angle)} fill="#93c5fd" stroke="#2563eb" strokeWidth="2" />}
        {mode === 'angulos' && <>
          <line x1={cx} y1={cy} x2={point(0).x} y2={point(0).y} stroke="#1e40af" strokeWidth="4" />
          <line x1={cx} y1={cy} x2={e.x} y2={e.y} stroke="#1e40af" strokeWidth="4" />
          <path d={`M ${cx} ${cy-48} A 48 48 0 ${angle > 180 ? 1 : 0} 1 ${cx + 48*Math.sin(angle*Math.PI/180)} ${cy - 48*Math.cos(angle*Math.PI/180)}`} fill="none" stroke="#1d4ed8" strokeWidth="3" />
          <text x={cx+18} y={cy-18} className="fill-blue-800 text-[18px] font-black">{angle}°</text>
        </>}
        {mode === 'elementos' && <>
          <line x1={cx} y1={cy} x2={cx+r} y2={cy} stroke="#1e40af" strokeWidth="4"/>
          <line x1={cx-r} y1={cy} x2={cx+r} y2={cy} stroke="#7c3aed" strokeWidth="4"/>
          <path d={`M ${cx-r*.65} ${cy-r*.76} A ${r} ${r} 0 0 1 ${cx+r*.65} ${cy-r*.76}`} fill="none" stroke="#0f766e" strokeWidth="7" strokeLinecap="round"/>
          <line x1={cx-80} y1={cy+90} x2={cx+80} y2={cy+90} stroke="#ea580c" strokeWidth="5" strokeLinecap="round"/>
          <circle cx={cx} cy={cy} r="7" fill="#1e40af"/>
          <text x={cx+70} y={cy-10} className="fill-blue-800 text-[15px] font-black">raio</text><text x={cx} y={cy+28} textAnchor="middle" className="fill-violet-800 text-[15px] font-black">diâmetro</text><text x={cx} y={cy-r-18} textAnchor="middle" className="fill-teal-700 text-[15px] font-black">arco</text><text x={cx} y={cy+116} textAnchor="middle" className="fill-orange-700 text-[15px] font-black">corda</text><text x={cx+12} y={cy-10} className="fill-slate-700 text-[13px] font-bold">centro</text>
        </>}
        {mode !== 'elementos' && mode !== 'angulos' && <><line x1={cx} y1={cy} x2={cx+r} y2={cy} stroke="#1e40af" strokeWidth="4" strokeLinecap="round"/><circle cx={cx} cy={cy} r="7" fill="#1e40af"/><text x={cx+r/2} y={cy-12} textAnchor="middle" className="fill-blue-800 text-[15px] font-black">r = {formatNumber(state.radius)} u</text></>}
      </motion.g>

      {mode === 'desenrolar' && <>
        <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke="#2563eb" strokeWidth="7" strokeLinecap="round" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:1.8}} />
        <motion.circle r="9" fill="#1d4ed8" initial={{cx:cx+r,cy}} animate={{cx:[cx+r,cx,cx-r,cx,cx+r],cy:[cy,cy-r,cy,cy+r,cy]}} transition={{duration:1.8,ease:'linear'}} />
        <motion.line x1="80" y1="410" x2="820" y2="410" stroke="#2563eb" strokeWidth="14" strokeLinecap="round" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:1.8,delay:1.3}} />
        {[0,1,2].map(i => <g key={i}><line x1={80+i*235} y1="382" x2={80+i*235} y2="438" stroke="#1e40af" strokeWidth="2"/><text x={197.5+i*235} y="370" textAnchor="middle" className="fill-blue-800 text-[16px] font-black">{i+1}D</text></g>)}
        <text x="785" y="370" textAnchor="middle" className="fill-blue-700 text-[14px] font-black">+{formatNumber(state.ratio-3,5)}D</text>
        <text x="450" y="470" textAnchor="middle" className="fill-slate-600 text-[15px] font-bold">C = {formatNumber(state.ratio,5)} × D · C ÷ D = π</text>
      </>}

      {mode !== 'desenrolar' && <text x="450" y="470" textAnchor="middle" className="fill-slate-500 text-[13px] font-semibold">{mode === 'area' ? `Setor de ${angle}° · área = ${formatNumber(sector)} u²` : mode === 'angulos' ? `corda = ${formatNumber(chord)} u · arco = ${formatNumber(arc)} u` : 'Altere os controles e observe a geometria em tempo real.'}</text>}
    </svg>

    {mode === 'desenrolar' && <button type="button" onClick={() => onModeChange('medidas')} className="mt-2 min-h-[44px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Voltar ao círculo</button>}
  </div>
}
