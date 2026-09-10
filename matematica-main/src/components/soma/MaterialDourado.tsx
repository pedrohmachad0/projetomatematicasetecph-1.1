import { motion, AnimatePresence } from 'framer-motion'
import { getBarrasECubos } from '../../logic/adicao'

interface Props {
  valor: number
  label: string
  destacado: boolean
  cor: string
}

export default function MaterialDourado({ valor, label, destacado, cor }: Props) {
  const { dezenas, unidades } = getBarrasECubos(valor)

  return (
    <div
      className={`rounded-2xl border-2 p-3 sm:p-4 flex flex-col items-center gap-2 sm:gap-3 transition-all ${
        destacado ? 'shadow-lg scale-[1.01] sm:scale-[1.02]' : 'shadow-sm'
      }`}
      style={{
        background: destacado ? `${cor}0f` : 'var(--surface-card)',
        borderColor: destacado ? cor : '#e2e8f0',
      }}
      aria-label={`${label}: ${valor} — ${dezenas} dezenas e ${unidades} unidades`}
    >
      <div className="flex items-baseline gap-1.5 sm:gap-2">
        <span className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-500">{label}</span>
        <span
          className={`text-3xl sm:text-4xl font-black ${destacado ? '' : 'text-slate-800'}`}
          style={destacado ? { color: cor } : undefined}
        >
          {valor}
        </span>
      </div>

      {destacado && (
        <div
          className="text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full text-white text-center leading-tight"
          style={{ background: cor }}
        >
          ✨ DEZENA EXATA!
        </div>
      )}

      <div className="w-full min-h-[100px] sm:min-h-[110px] flex flex-col items-center justify-center gap-2">
        {/* Barras de dezena */}
        {dezenas > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center">
            <AnimatePresence>
              {Array.from({ length: dezenas }).map((_, i) => (
                <motion.div
                  key={`bar-${valor}-${i}`}
                  initial={{ scale: 0, opacity: 0, y: -10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0, y: 10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.04 }}
                  className="w-12 sm:w-16 h-3 sm:h-4 rounded-sm border-2 shadow-sm flex items-center justify-center"
                  style={{ background: `${cor}20`, borderColor: cor }}
                  aria-hidden="true"
                >
                  <span className="w-full h-[2px] bg-white/60 mx-1" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Cubos de unidade */}
        <div className="flex flex-wrap gap-1 sm:gap-1 justify-center max-w-[120px] sm:max-w-[140px]">
          <AnimatePresence>
            {Array.from({ length: unidades }).map((_, i) => (
              <motion.div
                key={`cube-${valor}-${i}`}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0, x: 20 }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-[3px] border shadow-sm"
                style={{ background: cor, borderColor: '#ffffff' }}
                aria-hidden="true"
              />
            ))}
          </AnimatePresence>
          {unidades === 0 && dezenas > 0 && (
            <span className="text-[11px] sm:text-xs text-slate-400 italic">nenhuma unidade solta</span>
          )}
          {valor === 0 && <span className="text-xs text-slate-400">zero</span>}
        </div>

        <div className="text-[11px] sm:text-xs text-slate-500 text-center">
          {dezenas} dezena{dezenas !== 1 ? 's' : ''} · {unidades} unidade{unidades !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
