import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Triangle, Plus, Minus, Sparkles, MonitorSmartphone } from 'lucide-react'

interface SimulatorCard {
  id: string
  title: string
  description: string
  path: string
  icon: React.ReactNode
  color: string
  badge: string
}

const simulators: SimulatorCard[] = [
  {
    id: 'pitagoras',
    title: 'Explorador de Pitágoras',
    description: 'Ajuste o ângulo entre dois lados iguais e compare as áreas dos quadrados. Veja o Teorema em ação.',
    path: '/pitagoras',
    icon: <Triangle size={28} className="sm:w-9 sm:h-9" />,
    color: '#1e40af',
    badge: 'GEOMETRIA · ÂNGULO LIVRE',
  },
  {
    id: 'soma',
    title: 'Cálculo Mental – Soma',
    description: 'Material dourado interativo. Transfira unidades e leve uma parcela à dezena exata sem alterar a soma.',
    path: '/soma',
    icon: <Plus size={28} className="sm:w-9 sm:h-9" />,
    color: '#2563eb',
    badge: 'ARITMÉTICA · COMPENSAÇÃO',
  },
  {
    id: 'subtracao',
    title: 'Cálculo Mental – Subtração',
    description: 'Desloque os dois termos na reta numérica. Mantenha a distância e facilite a conta mental.',
    path: '/subtracao',
    icon: <Minus size={28} className="sm:w-9 sm:h-9" />,
    color: '#7c3aed',
    badge: 'RETA NUMÉRICA · DESLOCAMENTO',
  },
]

export default function Hub() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero - totalmente responsivo */}
      <section className="text-center mb-6 sm:mb-10 px-2 sm:px-0">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 bg-blue-100 text-blue-800 border border-blue-200 max-w-full flex-wrap justify-center">
          <Sparkles size={14} className="shrink-0 sm:w-4 sm:h-4" />
          <span className="text-center leading-tight">Plataforma Educacional PEMFM — Fundamental & Médio</span>
        </div>
        <h1 className="text-[1.85rem] sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3 sm:mb-4 text-slate-900 leading-[1.1] sm:leading-tight px-1">
          Simuladores <span className="text-blue-600">Matemáticos</span>
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>Interativos
        </h1>
        <p className="text-[15px] sm:text-lg md:text-xl max-w-3xl mx-auto text-slate-600 leading-relaxed px-2 sm:px-4">
          Explore conceitos com interação, visualização em tempo real e feedback imediato. Projetado para sala de aula,
          projetor e TV — controles grandes, contraste alto e animações com propósito.
        </p>
        <div className="mt-3 sm:mt-4 inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200 px-2.5 sm:px-3 py-1.5 rounded-full max-w-[95vw] sm:max-w-none">
          <MonitorSmartphone size={12} className="shrink-0 sm:w-3.5 sm:h-3.5" />
          <span className="truncate">Responsivo · Desktop · Tablet · Projetor · TV</span>
        </div>
      </section>

      {/* Cards - 1 col mobile, 2 tablet, 3 desktop */}
      <section aria-label="Simuladores disponíveis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
        {simulators.map((sim, idx) => (
          <motion.div
            key={sim.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            className="h-full"
          >
            <Link
              to={sim.path}
              id={`card-${sim.id}`}
              aria-label={`Abrir ${sim.title}`}
              className="group flex flex-col h-full rounded-2xl overflow-hidden shadow-md hover:shadow-xl active:scale-[0.98] transition-all duration-300 bg-white border border-slate-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 touch-manipulation"
            >
              <div
                className="h-28 sm:h-32 flex flex-col items-center justify-center text-white relative shrink-0"
                style={{ background: `linear-gradient(135deg, ${sim.color} 0%, #3b82f6 100%)` }}
              >
                <div className="bg-white/15 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/20">{sim.icon}</div>
                <span className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] font-bold tracking-widest bg-white/20 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-white/20 text-center">
                  {sim.badge}
                </span>
              </div>
              <div className="p-4 sm:p-5 lg:p-6 flex flex-col flex-1">
                <h2 className="text-[17px] sm:text-[19px] font-black mb-1.5 sm:mb-2 text-slate-900 leading-tight">{sim.title}</h2>
                <p className="text-[13px] sm:text-[14px] leading-relaxed mb-3 sm:mb-4 text-slate-600 flex-1">{sim.description}</p>
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-bold transition-all group-hover:gap-2.5 group-active:gap-1 min-h-[44px] touch-manipulation"
                  style={{ color: sim.color }}
                >
                  Abrir simulador <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Info expansão */}
      <section className="mt-8 sm:mt-10 rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 md:p-7">
        <h2 className="text-xs sm:text-sm font-black tracking-widest text-slate-500 mb-3 sm:mb-4">ESTRUTURA PREPARADA PARA EXPANSÃO</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm text-slate-600">
          <div>
            <div className="font-bold text-slate-800 text-sm">Fundamental II</div>
            <div className="flex gap-1.5 sm:gap-2 mt-2 flex-wrap">
              {['6º ano', '7º ano', '8º ano', '9º ano'].map((g) => (
                <span key={g} className="px-2 sm:px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold">
                  {g}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm">Ensino Médio</div>
            <div className="flex gap-1.5 sm:gap-2 mt-2 flex-wrap">
              {['1º ano', '2º ano', '3º ano'].map((g) => (
                <span key={g} className="px-2 sm:px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-500 mt-4 leading-relaxed">
          Arquitetura modular: cada novo simulador pode ser adicionado sem reescrever o Hub — basta registrar em{' '}
          <code className="bg-slate-100 px-1 sm:px-1.5 py-0.5 rounded text-slate-700 break-all">src/data/mathContent.ts</code>.
        </p>
      </section>
    </div>
  )
}
