import { useState } from 'react'
import { motion } from 'framer-motion'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import TipBox from '../components/ui/TipBox'
import DiameterWrap from '../components/circulo/DiameterWrap'
import PartsLab from '../components/circulo/PartsLab'
import ArcLab from '../components/circulo/ArcLab'
import PizzaLab from '../components/circulo/PizzaLab'
import type { CircleMode } from '../logic/circulo'

const topics: Array<{ id: CircleMode; mark: string; title: string; hint: string; prompt: string; instruction: string }> = [
  {
    id: 'dobrar',
    mark: 'π',
    title: 'Dobrar o diâmetro',
    hint: 'de onde vem o π',
    prompt: 'Quantos diâmetros cabem na volta?',
    instruction: 'Use o diâmetro como régua: a cada clique ele gira até a borda e se dobra sobre a circunferência.',
  },
  {
    id: 'partes',
    mark: 'r·d',
    title: 'Partes do círculo',
    hint: 'raio, diâmetro, corda…',
    prompt: 'Onde está cada parte do círculo?',
    instruction: 'Toque nas partes do desenho para conhecê-las. Depois jogue: encontre a parte pedida o mais rápido que puder.',
  },
  {
    id: 'arcos',
    mark: '⌒',
    title: 'Arcos e cordas',
    hint: 'o curvo e o reto',
    prompt: 'Qual caminho é maior: o curvo ou o reto?',
    instruction: 'Arraste a bolinha laranja pela borda e compare o arco (curvo) com a corda (reta).',
  },
  {
    id: 'area',
    mark: 'πr²',
    title: 'Área do círculo',
    hint: 'a pizza que vira retângulo',
    prompt: 'Por que a área do círculo é π · r²?',
    instruction: 'Corte o círculo em fatias e rearrume em fila. Toque nas fatias para montar setores.',
  },
]

export default function Pi() {
  const [mode, setMode] = useState<CircleMode>('dobrar')
  const [experimentKey, setExperimentKey] = useState(0)
  const active = topics.find((topic) => topic.id === mode) ?? topics[0]

  return (
    <PresentationMode title="Explorador do Círculo">
      <SimulatorHeader id="pi">
        A volta de qualquer círculo mede cerca de <strong className="font-black">3,14 diâmetros</strong>: esse número é o π. Descubra isso dobrando o diâmetro e depois explore as partes, os arcos e a área do círculo.
      </SimulatorHeader>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3" role="group" aria-label="Experiências sobre o círculo">
        {topics.map((topic) => {
          const selected = mode === topic.id
          return (
            <button
              key={topic.id}
              type="button"
              aria-pressed={selected}
              aria-label={topic.title}
              onClick={() => {
                setMode(topic.id)
                if (topic.id === 'dobrar' && mode === 'dobrar') setExperimentKey((v) => v + 1)
              }}
              className={`relative flex min-h-[64px] items-center gap-2.5 overflow-hidden rounded-2xl border-2 p-2.5 text-left transition active:scale-[0.98] sm:p-3 ${selected ? 'border-transparent text-white shadow-lg' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
            >
              {selected && <motion.span layoutId="pi-topic" className="sim-segment-pill absolute inset-0 rounded-2xl" transition={{ type: 'spring', stiffness: 380, damping: 32 }} aria-hidden="true" />}
              <span className={`relative grid h-10 min-w-10 shrink-0 place-items-center rounded-xl px-1 font-serif text-base font-black ${selected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}`}>{topic.mark}</span>
              <span className="relative min-w-0">
                <span className="block text-[13px] font-black leading-tight sm:text-sm">{topic.title}</span>
                <span className={`block text-[11px] font-semibold leading-tight ${selected ? 'text-white/85' : 'text-slate-500'}`}>{topic.hint}</span>
              </span>
            </button>
          )
        })}
      </div>

      <section aria-labelledby="circle-topic" className="sim-stage rounded-3xl border border-slate-200 p-3 sm:p-5 md:p-6">
        <motion.header key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-3 text-center sm:mb-4">
          <h2 id="circle-topic" className="text-lg font-black leading-tight text-slate-900 sm:text-2xl">
            {active.prompt}
          </h2>
          <p className="mx-auto mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">{active.instruction}</p>
        </motion.header>
        {mode === 'dobrar' && (
          <div className="rounded-[24px] bg-[#dce9f7] p-2 sm:p-4 md:p-5">
            <DiameterWrap key={experimentKey} />
          </div>
        )}
        {mode === 'partes' && <PartsLab />}
        {mode === 'arcos' && <ArcLab />}
        {mode === 'area' && <PizzaLab />}
      </section>

      <TipBox>
        <strong>π aparece em todo círculo:</strong> do tamanho de uma moeda ao de uma roda-gigante, a volta mede sempre cerca de 3,14 vezes o diâmetro. Por isso C = π · d e, cortando em fatias, A = π · r².
      </TipBox>
    </PresentationMode>
  )
}
