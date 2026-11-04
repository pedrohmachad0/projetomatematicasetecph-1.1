import { useEffect, useRef, useState } from 'react'
import { Droplets } from 'lucide-react'
import {
  FIXED_SIDE,
  MIN_ANGLE,
  MAX_ANGLE,
  ANGLE_STEP,
  getCorClassificacao,
  getEstadoCompleto,
} from '../logic/pitagoras'
import AngleControl from '../components/pitagoras/AngleControl'
import TriangleSVG from '../components/pitagoras/TriangleSVG'
import AreaPanel from '../components/pitagoras/AreaPanel'
import ClassificationMessage from '../components/pitagoras/ClassificationMessage'
import PresentationMode from '../components/PresentationMode'
import SimulatorHeader from '../components/SimulatorHeader'
import ChallengeCard from '../components/ui/ChallengeCard'

export default function Pitagoras() {
  const [angle, setAngle] = useState(90)
  const [showAllAngles, setShowAllAngles] = useState(true)
  const [pour, setPour] = useState(0)
  const [pouring, setPouring] = useState(false)
  const frame = useRef(0)
  const changeAngle = (value: number) => {
    setPour(0)
    setPouring(false)
    setAngle(value)
  }

  useEffect(() => {
    if (!pouring) return
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1800)
      setPour(t)
      if (t < 1) frame.current = requestAnimationFrame(tick)
      else setPouring(false)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [pouring])

  const estado = getEstadoCompleto(angle)
  const { sideA, sideB, sideC, areaA, areaB, areaC, sumAB, classification, comparison } = estado
  const classColor = getCorClassificacao(classification)

  return (
    <PresentationMode title="Explorador de Pitágoras">
    <div className="max-w-6xl mx-auto overflow-x-hidden">
      <SimulatorHeader id="pitagoras">
        Visualize como o quadrado sobre o terceiro lado muda com o ângulo entre dois lados iguais de {FIXED_SIDE} unidades.
        Compare <span className="font-mono font-bold">A² + B²</span> com <span className="font-mono font-bold">C²</span> em tempo real.
      </SimulatorHeader>

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4 sm:gap-6 items-start">
        {/* Painel esquerdo — controles */}
        <div className="space-y-4 sm:space-y-5 order-2 lg:order-1">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6">
            <h2 className="font-bold text-base sm:text-lg text-slate-900 mb-3 sm:mb-4">Controles</h2>
            <AngleControl
              angle={angle}
              min={MIN_ANGLE}
              max={MAX_ANGLE}
              step={ANGLE_STEP}
              onChange={changeAngle}
            />
            <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
              <input
                type="checkbox"
                checked={showAllAngles}
                onChange={(event) => setShowAllAngles(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-blue-600"
              />
              Mostrar todos os ângulos do triângulo
            </label>
            <div className="mt-4 sm:mt-5">
              <ClassificationMessage classification={classification} />
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6">
            <h2 className="font-bold text-xs sm:text-sm tracking-wide text-slate-700 mb-2 sm:mb-3">COMPARAÇÃO DAS ÁREAS</h2>
            <AreaPanel
              sideA={sideA}
              sideB={sideB}
              sideC={sideC}
              areaA={areaA}
              areaB={areaB}
              areaC={areaC}
              sumAB={sumAB}
              comparison={comparison}
              classification={classification}
            />
            <div className="mt-3 sm:mt-4 rounded-xl bg-slate-50 border border-slate-200 p-2.5 sm:p-3 text-[11px] sm:text-xs leading-relaxed text-slate-600">
              <span className="font-bold text-slate-700">Como ler:</span> Os dois quadrados claros têm áreas fixas
              ({areaA} cada). O quadrado colorido muda com o ângulo. Em{' '}
              <span className="font-semibold">90°</span> as áreas se igualam — é o Teorema de Pitágoras.
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-[#0f172a] p-4 text-white sm:rounded-2xl sm:p-5">
            <div className="text-[11px] sm:text-xs tracking-widest opacity-60 mb-1.5 sm:mb-2">LEI DOS COSSENOS</div>
            <div className="font-mono text-xs opacity-90 sm:text-sm">C² = A² + B² − 2AB·cos(θ)</div>
            <div className="mt-1.5 font-mono text-sm font-bold [overflow-wrap:anywhere] sm:mt-2 sm:text-lg">
              {sideC}² = {sideA}² + {sideB}² − 2·{sideA}·{sideB}·<span className="whitespace-nowrap">cos({angle}°)</span>
            </div>
          </div>
        </div>

        {/* Visualização SVG */}
        <div className="sim-stage rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-4 md:p-6 order-1 lg:order-2 flex flex-col items-center overflow-hidden">
          <TriangleSVG
            angle={angle}
            sideA={sideA}
            sideB={sideB}
            sideC={sideC}
            classification={classification}
            showAllAngles={showAllAngles}
            pour={pour}
          />
          <button type="button" onClick={() => { setPour(0); setPouring(true) }} disabled={pouring} className="mt-3 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-black text-white shadow disabled:opacity-60">
            <Droplets size={17} /> {pouring ? 'Despejando…' : 'Despejar a água de A² e B² em C²'}
          </button>
          {pour === 1 && (
            <p role="status" className={`mt-2 rounded-xl border px-3 py-2 text-center text-sm font-semibold ${classification === 'retangulo' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
              {classification === 'retangulo'
                ? 'Encheu certinho! Em 90°, a água dos dois quadrados menores cabe exata no maior: A² + B² = C².'
                : areaC > sumAB
                  ? `Faltou água: com ${angle}°, C² (${areaC.toFixed(0)}) é maior que A² + B² (${sumAB}).`
                  : `Transbordou: com ${angle}°, C² (${areaC.toFixed(0)}) é menor que A² + B² (${sumAB}).`}
            </p>
          )}

          <div className="mt-4 sm:mt-6 w-full max-w-xl grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 sm:p-3">
              <div className="text-[10px] sm:text-[11px] tracking-wide font-semibold text-slate-500">LADO A</div>
              <div className="text-lg sm:text-xl font-black text-slate-800">{sideA}</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 sm:p-3">
              <div className="text-[10px] sm:text-[11px] tracking-wide font-semibold text-slate-500">LADO B</div>
              <div className="text-lg sm:text-xl font-black text-slate-800">{sideB}</div>
            </div>
            <div className="rounded-xl border-2 bg-white p-2 sm:p-3" style={{ borderColor: classColor, background: `${classColor}1a` }}>
              <div className="text-[10px] font-semibold tracking-wide text-slate-500 sm:text-[11px]">LADO C</div>
              <div className="text-lg font-black text-slate-800 sm:text-xl">{sideC}</div>
            </div>
          </div>
        </div>
      </div>
      <ChallengeCard
        simulator="pitagoras"
        goals={[
          { id: 'agua', text: 'Despeje a água num triângulo retângulo e veja encher certinho.', met: pour === 1 && classification === 'retangulo' },
          { id: 'agudo-meio', text: 'Deixe o triângulo acutângulo com C² entre 100 e 150.', met: areaC > 100 && areaC < 150 },
          { id: 'equilatero', text: 'Deixe o lado C igual aos outros dois (triângulo equilátero).', met: angle === 60 },
          { id: 'c2-300', text: 'Faça a área C² passar de 300.', met: areaC > 300 },
        ]}
      />
    </div>
    </PresentationMode>
  )
}
