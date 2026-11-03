import { useState } from 'react'
import { Pause, Play } from 'lucide-react'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import Panel from '../components/ui/Panel'
import NumberControl from '../components/ui/NumberControl'
import SegmentedControl from '../components/ui/SegmentedControl'
import TipBox from '../components/ui/TipBox'
import ChallengeCard from '../components/ui/ChallengeCard'
import Fact from '../components/ui/Fact'
import Solid3D from '../components/espacial/Solid3D'
import SolidNet from '../components/espacial/SolidNet'
import { solidMeasures, type Solid, type SolidSize } from '../logic/espacial'
import { companionMesh } from '../logic/mesh3d'

const solids: Array<{ id: Solid; label: string; color: string }> = [
  { id: 'cubo', label: 'Cubo', color: '#2563eb' },
  { id: 'paralelepipedo', label: 'Paralelepípedo', color: '#0d9488' },
  { id: 'piramide', label: 'Pirâmide', color: '#d97706' },
  { id: 'cilindro', label: 'Cilindro', color: '#7c3aed' },
  { id: 'cone', label: 'Cone', color: '#db2777' },
  { id: 'esfera', label: 'Esfera', color: '#059669' },
]

const compareText: Partial<Record<Solid, (v: number, c: number) => string>> = {
  cone: (v, c) => `O cone cabe dentro do cilindro de mesma base e altura (tracejado). O volume do cilindro é ${br(c)}; o do cone é ${br(v)}, exatamente 1/3. São necessários 3 cones cheios de água para encher o cilindro.`,
  piramide: (v, c) => `A pirâmide cabe dentro do prisma de mesma base e altura (tracejado). O prisma tem volume ${br(c)}; a pirâmide, ${br(v)}: exatamente 1/3.`,
  esfera: (v, c) => `A esfera cabe certinha num cilindro de altura 2r (tracejado). O cilindro tem volume ${br(c)}; a esfera, ${br(v)}: 2/3 do cilindro. Arquimedes ficou tão orgulhoso dessa descoberta que pediu um desenho dela no seu túmulo.`,
}

const br = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

export default function Espacial() {
  const [solid, setSolid] = useState<Solid>('cubo')
  const [size, setSize] = useState<SolidSize>({ a: 3, b: 2, h: 4, r: 2 })
  const [spin, setSpin] = useState(true)
  const [compare, setCompare] = useState(false)
  const [view, setView] = useState<'3d' | 'net'>('3d')
  const info = solids.find((s) => s.id === solid)!
  const m = solidMeasures(solid, size)
  const canCompare = solid in compareText
  const companion = canCompare && compare ? companionMesh(solid, size) : null
  const companionVolume = solid === 'cone' ? Math.PI * size.r ** 2 * size.h : solid === 'piramide' ? size.a ** 2 * size.h : 2 * Math.PI * size.r ** 3
  const set = (key: keyof SolidSize) => (value: number) => setSize((current) => ({ ...current, [key]: value }))
  const usesA = solid === 'cubo' || solid === 'paralelepipedo' || solid === 'piramide'
  const usesH = solid !== 'cubo' && solid !== 'esfera'
  const usesR = solid === 'cilindro' || solid === 'cone' || solid === 'esfera'

  return (
    <PresentationMode title="Geometria Espacial">
      <SimulatorHeader id="espacial">
        Escolha um sólido, mude as medidas e arraste o desenho para girar. O volume diz quanto cabe dentro; a área da superfície, quanto material é preciso para cobri-lo.
      </SimulatorHeader>
      <div className="mb-4 sm:mb-6">
        <SegmentedControl label="Sólido" options={solids} value={solid} onChange={(s) => { setSolid(s); setCompare(false) }} />
      </div>
      <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_360px]">
        <Panel stage>
          <div className="mb-2">
            <SegmentedControl
              label="Como ver"
              options={[
                { id: '3d', label: 'Sólido em 3D' },
                { id: 'net', label: 'Planificação' },
              ]}
              value={view}
              onChange={setView}
            />
          </div>
          {view === '3d' ? (
            <>
              <Solid3D solid={solid} size={size} color={info.color} ghost={companion} spin={spin} label={`${info.label} com volume ${br(m.volume)}`} />
              <p className="text-center text-xs font-semibold text-slate-500">Arraste para girar o sólido.</p>
            </>
          ) : (
            <>
              <SolidNet solid={solid} size={size} color={info.color} />
              {solid !== 'esfera' && <p className="text-center text-xs font-semibold text-slate-500">Somando a área de todas as faces, chega-se à área total: {br(m.area)} u².</p>}
            </>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setSpin((v) => !v)} className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
              {spin ? <Pause size={16} /> : <Play size={16} />} {spin ? 'Parar de girar' : 'Girar sozinho'}
            </button>
            {canCompare && (
              <button type="button" aria-pressed={compare} onClick={() => setCompare((v) => !v)} className={`min-h-[48px] flex-1 rounded-xl px-4 text-sm font-black shadow transition active:scale-95 ${compare ? 'bg-amber-400 text-slate-900' : 'bg-blue-700 text-white hover:bg-blue-800'}`}>
                {compare ? 'Esconder comparação' : solid === 'piramide' ? 'Comparar com o prisma' : 'Comparar com o cilindro'}
              </button>
            )}
          </div>
          {compare && canCompare && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">{compareText[solid]!(m.volume, companionVolume)}</p>}
          {(solid === 'cubo' || solid === 'paralelepipedo') && (
            <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
              Pense em cubinhos de 1 u³: no fundo cabem {solid === 'cubo' ? `${size.a} × ${size.a}` : `${size.a} × ${size.b}`} = {solid === 'cubo' ? size.a ** 2 : size.a * size.b} cubinhos, e são {solid === 'cubo' ? size.a : size.h} camadas. Total: {m.volume} cubinhos.
            </p>
          )}
        </Panel>
        <div className="space-y-4">
          <Panel title="Medidas">
            <div className="space-y-4">
              {usesA && <NumberControl label={solid === 'cubo' ? 'Aresta a' : solid === 'piramide' ? 'Lado da base' : 'Comprimento'} value={size.a} min={1} max={6} step={1} onChange={set('a')} />}
              {solid === 'paralelepipedo' && <NumberControl label="Largura" value={size.b} min={1} max={6} step={1} onChange={set('b')} />}
              {usesR && <NumberControl label="Raio r" value={size.r} min={1} max={4} step={1} onChange={set('r')} />}
              {usesH && <NumberControl label="Altura h" value={size.h} min={1} max={8} step={1} onChange={set('h')} />}
            </div>
          </Panel>
          <Panel title="Resultados">
            <dl className="grid grid-cols-2 gap-2">
              <Fact label="Volume" value={`${br(m.volume)} u³`} detail={m.volumeCalc} highlight />
              <Fact label="Área total" value={`${br(m.area)} u²`} detail="soma das faces" />
            </dl>
            <p className="mt-3 font-mono text-sm font-black text-slate-700">{m.volumeFormula}</p>
          </Panel>
        </div>
      </div>
      <ChallengeCard
        simulator="espacial"
        goals={[
          { id: 'cubo', text: 'Monte um cubo com volume 64.', met: solid === 'cubo' && m.volume === 64 },
          { id: 'cone', text: 'Compare o cone com o cilindro e descubra a fração.', met: solid === 'cone' && compare },
          { id: 'esfera', text: 'Veja a esfera dentro do cilindro de Arquimedes.', met: solid === 'esfera' && compare },
          { id: 'planificar', text: 'Abra a planificação do cilindro e veja o retângulo da lateral.', met: solid === 'cilindro' && view === 'net' },
        ]}
      />
      <TipBox>
        <strong>Dobrar as medidas não dobra o volume:</strong> um cubo de aresta 2 tem volume 8; com aresta 4, o volume é 64, ou seja, 8 vezes maior. Quando todas as medidas dobram, o volume fica 2 × 2 × 2 = 8 vezes maior.
      </TipBox>
    </PresentationMode>
  )
}
