import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import {
  FIXED_SIDE,
  MIN_ANGLE,
  MAX_ANGLE,
  ANGLE_STEP,
  getEstadoCompleto,
} from '../logic/pitagoras'
import AngleControl from '../components/pitagoras/AngleControl'
import TriangleSVG from '../components/pitagoras/TriangleSVG'
import AreaPanel from '../components/pitagoras/AreaPanel'
import ClassificationMessage from '../components/pitagoras/ClassificationMessage'
import PresentationMode from '../components/PresentationMode'

export default function Pitagoras() {
  const [angle, setAngle] = useState(90)
  const [showAllAngles, setShowAllAngles] = useState(true)

  const estado = getEstadoCompleto(angle)
  const { sideA, sideB, sideC, areaA, areaB, areaC, sumAB, classification, comparison } = estado

  return (
    <PresentationMode title="Explorador de Pitágoras">
    <div className="max-w-6xl mx-auto overflow-x-hidden">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium mb-4 sm:mb-6 hover:underline text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded min-h-[44px] touch-manipulation"
      >
        <ArrowLeft size={16} className="shrink-0" /> Voltar ao início
      </Link>

      <header className="mb-6 sm:mb-8 text-center sm:text-left px-1 sm:px-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
          <span className="text-blue-800">📐</span> Explorador de Pitágoras
        </h1>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl sm:mx-0 mx-auto leading-relaxed px-1 sm:px-0">
          Visualize como o quadrado sobre o terceiro lado muda com o ângulo entre dois lados iguais.
          Compare <span className="font-mono font-bold">A² + B²</span> com <span className="font-mono font-bold">C²</span> em tempo real.
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm bg-blue-50 text-blue-700 px-2.5 sm:px-3 py-1.5 rounded-full border border-blue-200 max-w-full flex-wrap justify-center text-center leading-tight">
          <Info size={14} className="shrink-0 hidden sm:block" /> Dois lados fixos de {FIXED_SIDE} unidades · terceiro lado pela Lei dos Cossenos
        </p>
      </header>

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
              onChange={setAngle}
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

          <div className="rounded-xl sm:rounded-2xl bg-slate-900 text-white p-4 sm:p-5">
            <div className="text-[11px] sm:text-xs tracking-widest opacity-60 mb-1.5 sm:mb-2">LEI DOS COSSENOS</div>
            <div className="font-mono text-xs sm:text-sm opacity-90 break-all">C² = A² + B² − 2AB·cos(θ)</div>
            <div className="font-mono text-sm sm:text-lg font-bold mt-1.5 sm:mt-2 break-all">
              {sideC}² = {sideA}² + {sideB}² − 2·{sideA}·{sideB}·cos({angle}°)
            </div>
          </div>
        </div>

        {/* Visualização SVG */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-3 sm:p-4 md:p-6 order-1 lg:order-2 flex flex-col items-center overflow-hidden">
          <TriangleSVG
            angle={angle}
            sideA={sideA}
            sideB={sideB}
            sideC={sideC}
            classification={classification}
            showAllAngles={showAllAngles}
          />

          <div className="mt-4 sm:mt-6 w-full max-w-xl grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 sm:p-3">
              <div className="text-[10px] sm:text-[11px] tracking-wide font-semibold text-slate-500">LADO A</div>
              <div className="text-lg sm:text-xl font-black text-slate-800">{sideA}</div>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 sm:p-3">
              <div className="text-[10px] sm:text-[11px] tracking-wide font-semibold text-slate-500">LADO B</div>
              <div className="text-lg sm:text-xl font-black text-slate-800">{sideB}</div>
            </div>
            <div className="rounded-xl border-2 p-2 sm:p-3" style={{ borderColor: classification === 'acutangulo' ? '#eab308' : classification === 'retangulo' ? '#22c55e' : '#f97316', background: classification === 'acutangulo' ? '#fefce8' : classification === 'retangulo' ? '#f0fdf4' : '#fff7ed' }}>
              <div className="text-[10px] sm:text-[11px] tracking-wide font-semibold" style={{ color: classification === 'acutangulo' ? '#a16207' : classification === 'retangulo' ? '#15803d' : '#c2410c' }}>LADO C</div>
              <div className="text-lg sm:text-xl font-black" style={{ color: classification === 'acutangulo' ? '#a16207' : classification === 'retangulo' ? '#15803d' : '#c2410c' }}>{sideC}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PresentationMode>
  )
}
