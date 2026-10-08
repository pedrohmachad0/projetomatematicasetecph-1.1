import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { formatNumber, getArcLength, getChordLength, getSectorArea, getUnrolledDistance, type CircleMode, type CircleState } from '../../logic/circulo'

interface Props {
  state: CircleState
  mode: CircleMode
  angle: number
}

const diagramCx = 450
const diagramCy = 330
const diagramScale = 30
const experimentDuration = 10

const getDiagramPoint = (degrees: number, radius: number) => {
  const radians = ((degrees - 90) * Math.PI) / 180
  return { x: diagramCx + radius * Math.cos(radians), y: diagramCy + radius * Math.sin(radians) }
}

const getFullCirclePath = (cx: number, cy: number, radius: number) =>
  `M ${cx + radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx - radius} ${cy} A ${radius} ${radius} 0 1 0 ${cx + radius} ${cy}`

const getSectorPath = (degrees: number, radius: number) => {
  if (degrees <= 0) return ''
  if (degrees >= 360) return getFullCirclePath(diagramCx, diagramCy, radius) + ' Z'
  const start = getDiagramPoint(0, radius)
  const end = getDiagramPoint(degrees, radius)
  return `M ${diagramCx} ${diagramCy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${degrees > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`
}

const getArcPath = (startDegrees: number, endDegrees: number, radius: number) => {
  if (endDegrees - startDegrees >= 360) return getFullCirclePath(diagramCx, diagramCy, radius)
  const start = getDiagramPoint(startDegrees, radius)
  const end = getDiagramPoint(endDegrees, radius)
  const sweep = endDegrees >= startDegrees ? endDegrees - startDegrees : endDegrees + 360 - startDegrees
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${end.x} ${end.y}`
}

const getCircumferencePoint = (progress: number, radius: number, cx: number, cy: number) => {
  const radians = progress * Math.PI * 2
  return { x: cx + radius * Math.cos(radians), y: cy - radius * Math.sin(radians) }
}

const formatDiameterCount = (value: number) => {
  const unit = Math.abs(value - 1) < 0.005 ? 'diâmetro' : 'diâmetros'
  return `${formatNumber(value, 2)} ${unit}`
}

type AnimationStatus = 'idle' | 'running' | 'paused' | 'complete'
type CirclePart = 'raio' | 'diametro' | 'arco' | 'corda' | 'centro'

const circleParts: Array<{ id: CirclePart; label: string; description: string }> = [
  { id: 'raio', label: 'Raio', description: 'Raio: segmento que vai do centro até a circunferência.' },
  { id: 'diametro', label: 'Diâmetro', description: 'Diâmetro: segmento que liga dois pontos da circunferência e passa pelo centro.' },
  { id: 'arco', label: 'Arco', description: 'Arco: trecho curvo entre dois pontos da circunferência.' },
  { id: 'corda', label: 'Corda', description: 'Corda: segmento reto que liga dois pontos da circunferência.' },
  { id: 'centro', label: 'Centro', description: 'Centro: ponto que fica à mesma distância de toda a circunferência.' },
]

const circlePartColors: Record<CirclePart, string> = {
  raio: '#2563eb',
  diametro: '#7c3aed',
  arco: '#0f766e',
  corda: '#ea580c',
  centro: '#e11d48',
}

export default function CircleVisualization({ state, mode, angle }: Props) {
  const [progress, setProgress] = useState(0)
  const [animationStatus, setAnimationStatus] = useState<AnimationStatus>('idle')
  const [isDragging, setIsDragging] = useState(false)
  const [isPortraitLayout, setIsPortraitLayout] = useState(false)
  const [selectedPart, setSelectedPart] = useState<CirclePart>('raio')
  const progressMotion = useMotionValue(0)
  const animationControls = useRef<ReturnType<typeof animate> | null>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mediaQuery = window.matchMedia('(max-width: 639px)')
    const updateLayout = () => setIsPortraitLayout(mediaQuery.matches)
    updateLayout()
    mediaQuery.addEventListener('change', updateLayout)
    return () => mediaQuery.removeEventListener('change', updateLayout)
  }, [])

  const radius = state.radius * diagramScale
  const start = getDiagramPoint(0, radius)
  const end = getDiagramPoint(angle, radius)
  const chord = getChordLength(state.radius, angle)
  const arc = getArcLength(state.radius, angle)
  const sector = getSectorArea(state.radius, angle)

  // Circle, arc, and straight line share a single scale in both layouts.
  const experimentViewWidth = isPortraitLayout ? 400 : 900
  const experimentViewHeight = isPortraitLayout ? 1100 : 400
  const experimentCx = isPortraitLayout ? 200 : 450
  const experimentCy = isPortraitLayout ? 200 : 150
  const experimentTrackX = 200
  const experimentTrackY = isPortraitLayout ? 0 : 330
  const desiredExperimentScale = (isPortraitLayout ? 100 : 130) / state.radius
  const maxFittedScale = isPortraitLayout
    ? (experimentViewHeight - 56) / (state.radius * Math.PI * 2)
    : (experimentViewWidth - 48) / (state.radius * Math.PI * 2)
  const experimentScale = Math.min(desiredExperimentScale, maxFittedScale)
  const experimentRadius = state.radius * experimentScale
  const circlePath = getFullCirclePath(experimentCx, experimentCy, experimentRadius)
  const circumferencePixels = state.circumference * experimentScale
  const diameterPixels = state.diameter * experimentScale
  const trackStart = isPortraitLayout ? 410 : (experimentViewWidth - circumferencePixels) / 2
  const distance = getUnrolledDistance(state.radius, progress)
  const lineMarkerCoordinate = trackStart + distance * experimentScale
  const lineMarkerX = isPortraitLayout ? experimentTrackX : lineMarkerCoordinate
  const lineMarkerY = isPortraitLayout ? lineMarkerCoordinate : experimentTrackY
  const highlightedLineEnd = useTransform(progressMotion, (value) => trackStart + getUnrolledDistance(state.radius, value) * experimentScale)
  const circleMarkerX = useTransform(progressMotion, (value) => getCircumferencePoint(value, experimentRadius, experimentCx, experimentCy).x)
  const circleMarkerY = useTransform(progressMotion, (value) => getCircumferencePoint(value, experimentRadius, experimentCx, experimentCy).y)

  useEffect(() => () => animationControls.current?.stop(), [])

  useEffect(() => {
    if (mode !== 'circunferencia') animationControls.current?.pause()
    else if (animationStatus === 'running') animationControls.current?.play()
  }, [animationStatus, mode])

  const setManualProgress = (nextValue: number) => {
    const nextProgress = Math.max(0, Math.min(1, nextValue))
    const shouldStayPaused = animationStatus === 'running' || animationStatus === 'paused'
    animationControls.current?.stop()
    progressMotion.set(nextProgress)
    setProgress(nextProgress)
    setAnimationStatus(nextProgress >= 1 ? 'complete' : shouldStayPaused ? 'paused' : 'idle')
  }

  const getSvgPosition = (event: PointerEvent<SVGCircleElement>) => {
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return null
    const bounds = svg.getBoundingClientRect()
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * experimentViewWidth,
      y: ((event.clientY - bounds.top) / bounds.height) * experimentViewHeight,
    }
  }

  const beginDrag = (event: PointerEvent<SVGCircleElement>, updateProgress: (position: { x: number; y: number }) => void) => {
    const position = getSvgPosition(event)
    if (!position) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
    updateProgress(position)
  }

  const dragCircleMarker = (event: PointerEvent<SVGCircleElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const position = getSvgPosition(event)
    if (!position) return
    let radians = Math.atan2(experimentCy - position.y, position.x - experimentCx)
    if (radians < 0) radians += Math.PI * 2
    setManualProgress(radians / (Math.PI * 2))
  }

  const dragLineMarker = (event: PointerEvent<SVGCircleElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const position = getSvgPosition(event)
    if (position) setManualProgress(((isPortraitLayout ? position.y : position.x) - trackStart) / circumferencePixels)
  }

  const stopDragging = (event: PointerEvent<SVGCircleElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setIsDragging(false)
  }

  const startAnimation = (from = progress) => {
    animationControls.current?.stop()
    const safeFrom = Math.max(0, Math.min(1, from))
    progressMotion.set(safeFrom)
    setProgress(safeFrom)
    let targetProgress = 1
    if (prefersReducedMotion) {
      const completedDiameters = safeFrom * state.ratio
      const nextCheckpoint = Math.min(state.ratio, Math.floor(completedDiameters + 1e-4) + 1)
      targetProgress = nextCheckpoint / state.ratio
    }
    setAnimationStatus('running')
    animationControls.current = animate(progressMotion, targetProgress, {
      duration: prefersReducedMotion ? 1.35 : Math.max(0.01, experimentDuration * (1 - safeFrom)),
      ease: 'linear',
      onUpdate: setProgress,
      onComplete: () => setAnimationStatus(targetProgress >= 1 ? 'complete' : 'idle'),
    })
  }

  const pauseAnimation = () => {
    animationControls.current?.pause()
    setAnimationStatus('paused')
  }

  const resumeAnimation = () => startAnimation(progressMotion.get())

  const resetAnimation = () => {
    animationControls.current?.stop()
    progressMotion.set(0)
    setProgress(0)
    setAnimationStatus('idle')
  }

  const traveledDiameters = progress * state.ratio
  const remainingDiameters = Math.max(0, state.ratio - traveledDiameters)
  const stage = progress >= 0.999 ? 4 : Math.min(4, Math.floor(traveledDiameters + 1e-4) + 1)
  const learningMessage = progress >= 0.999
    ? 'Uma volta mede cerca de 3,14 diâmetros. Essa razão é o número π.'
    : traveledDiameters >= 2.999
      ? `Três diâmetros quase fecham a volta; ainda falta o equivalente a ${formatDiameterCount(remainingDiameters)}.`
      : progress > 0
        ? `A parte rosa já percorreu o equivalente a ${formatDiameterCount(traveledDiameters)}. Faltam ${formatDiameterCount(remainingDiameters)} para completar a volta.`
        : 'Observe a parte rosa: ela mostra a borda que já se desenrolou na linha.'
  const reducedMotionActionLabel = progress >= 0.999
    ? 'Recomeçar por etapas'
    : traveledDiameters >= 2.999
      ? 'Completar a sobra'
      : `Desenrolar até ${Math.floor(traveledDiameters + 1e-4) + 1}º diâmetro`

  const handleProgressKeyDown = (event: KeyboardEvent<SVGCircleElement>) => {
    const step = event.shiftKey ? 0.05 : 0.01
    let nextProgress: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') nextProgress = progress + step
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') nextProgress = progress - step
    if (event.key === 'PageUp') nextProgress = progress + 0.1
    if (event.key === 'PageDown') nextProgress = progress - 0.1
    if (event.key === 'Home') nextProgress = 0
    if (event.key === 'End') nextProgress = 1
    if (nextProgress !== null) {
      event.preventDefault()
      setManualProgress(nextProgress)
    }
  }

  const activateMilestone = (event: KeyboardEvent<SVGGElement>, nextProgress: number) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    setManualProgress(nextProgress)
  }

  return (
    <div className="w-full">
      {mode !== 'circunferencia' ? (
        <>
        <svg viewBox="0 0 900 600" role="img" aria-label={`Visualização do círculo com raio ${formatNumber(state.radius)} unidades`} className="w-full">
          <defs>
            <linearGradient id="circleFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="100%" stopColor="#f8fafc" />
            </linearGradient>
          </defs>
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <circle cx={diagramCx} cy={diagramCy} r={radius} fill="url(#circleFill)" stroke="#2563eb" strokeWidth="5" />
            <circle cx={diagramCx} cy={diagramCy} r={radius + 10} fill="none" stroke="#dbeafe" strokeWidth="2" strokeDasharray="3 8" />
            {mode === 'medidas' && (
              <>
                <line x1={diagramCx} y1={diagramCy} x2={diagramCx + radius} y2={diagramCy} stroke="#1d4ed8" strokeWidth="5" strokeLinecap="round" />
                <circle cx={diagramCx} cy={diagramCy} r="7" fill="#1d4ed8" />
                <text x={diagramCx + radius / 2} y={diagramCy - 14} textAnchor="middle" className="fill-blue-800 text-[16px] font-black">r = {formatNumber(state.radius)} u</text>
                <line x1={diagramCx} y1={diagramCy - radius} x2={diagramCx} y2={diagramCy + radius} stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
                <text x={diagramCx + 12} y={diagramCy + radius / 2} className="fill-violet-800 text-[15px] font-black">D = {formatNumber(state.diameter)} u</text>
              </>
            )}
            {mode === 'angulos' && (
              <>
                <path d={getSectorPath(angle, radius)} fill="#bfdbfe" fillOpacity="0.72" stroke="#2563eb" strokeWidth="2" />
                <line x1={diagramCx} y1={diagramCy} x2={start.x} y2={start.y} stroke="#1d4ed8" strokeWidth="4" />
                <line x1={diagramCx} y1={diagramCy} x2={end.x} y2={end.y} stroke="#1d4ed8" strokeWidth="4" />
                <text x={diagramCx + 18} y={diagramCy - 18} className="fill-blue-900 text-[19px] font-black">{angle}°</text>
                <text x={diagramCx} y={diagramCy + radius + 30} textAnchor="middle" className="fill-slate-600 text-[13px] font-semibold">arco = {formatNumber(arc)} u · corda = {formatNumber(chord)} u</text>
              </>
            )}
            {mode === 'area' && (
              <>
                <path d={getSectorPath(angle, radius)} fill="#60a5fa" fillOpacity="0.42" stroke="#2563eb" strokeWidth="2" />
                <text x={diagramCx} y={diagramCy + 5} textAnchor="middle" className="fill-blue-900 text-[20px] font-black">{angle}°</text>
                <text x={diagramCx} y={diagramCy + radius + 30} textAnchor="middle" className="fill-slate-600 text-[13px] font-semibold">setor = {formatNumber(sector)} u²</text>
              </>
            )}
            {mode === 'elementos' && (
              <>
                <line x1={diagramCx} y1={diagramCy} x2={diagramCx + radius} y2={diagramCy} stroke={selectedPart === 'raio' ? circlePartColors.raio : '#cbd5e1'} strokeWidth={selectedPart === 'raio' ? 7 : 3} strokeLinecap="round" />
                <line x1={diagramCx} y1={diagramCy - radius} x2={diagramCx} y2={diagramCy + radius} stroke={selectedPart === 'diametro' ? circlePartColors.diametro : '#cbd5e1'} strokeWidth={selectedPart === 'diametro' ? 7 : 3} />
                <path d={getArcPath(300, 420, radius)} fill="none" stroke={selectedPart === 'arco' ? circlePartColors.arco : '#cbd5e1'} strokeWidth={selectedPart === 'arco' ? 10 : 5} strokeLinecap="round" />
                <line x1={diagramCx - radius * 0.6} y1={diagramCy + radius * 0.55} x2={diagramCx + radius * 0.6} y2={diagramCy + radius * 0.55} stroke={selectedPart === 'corda' ? circlePartColors.corda : '#cbd5e1'} strokeWidth={selectedPart === 'corda' ? 8 : 4} strokeLinecap="round" />
                <circle cx={diagramCx} cy={diagramCy} r={selectedPart === 'centro' ? 11 : 7} fill={circlePartColors.centro} stroke={selectedPart === 'centro' ? '#ffe4e6' : 'none'} strokeWidth="7" />
                <text x={diagramCx + radius / 2} y={diagramCy - 13} textAnchor="middle" fill={selectedPart === 'raio' ? circlePartColors.raio : '#94a3b8'} className="text-[15px] font-black">raio</text>
                <text x={diagramCx} y={diagramCy + 28} textAnchor="middle" fill={selectedPart === 'diametro' ? circlePartColors.diametro : '#94a3b8'} className="text-[15px] font-black">diâmetro</text>
                <text x={diagramCx} y={diagramCy - radius - 25} textAnchor="middle" fill={selectedPart === 'arco' ? circlePartColors.arco : '#94a3b8'} className="text-[15px] font-black">arco</text>
                <text x={diagramCx} y={diagramCy + radius * 0.55 + 28} textAnchor="middle" fill={selectedPart === 'corda' ? circlePartColors.corda : '#94a3b8'} className="text-[15px] font-black">corda</text>
                <text x={diagramCx + 14} y={diagramCy - 12} fill={selectedPart === 'centro' ? circlePartColors.centro : '#94a3b8'} className="text-[13px] font-bold">centro</text>
              </>
            )}
          </motion.g>
          <text x="450" y="570" textAnchor="middle" className="fill-slate-500 text-[13px] font-semibold">
            {mode === 'elementos' ? 'Selecione uma parte para destacá-la no círculo.' : mode === 'area' ? 'A área do setor depende diretamente do ângulo central.' : mode === 'angulos' ? 'Mova o ângulo e observe arco e corda mudarem juntos.' : 'Altere o raio e observe todas as medidas acompanharem a mudança.'}
          </text>
        </svg>
        {mode === 'elementos' && <div className="mx-auto mt-2 max-w-3xl rounded-2xl border border-white/80 bg-white/90 p-3 shadow-sm sm:p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Toque em uma parte</p>
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Partes do círculo">
            {circleParts.map(part => <button key={part.id} type="button" aria-pressed={selectedPart === part.id} onClick={() => setSelectedPart(part.id)} className={'min-h-10 rounded-full border px-3.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:text-sm ' + (selectedPart === part.id ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50')}>{part.label}</button>)}
          </div>
          <p role="status" aria-live="polite" className="mt-2 text-center text-sm font-semibold text-slate-700">{circleParts.find(part => part.id === selectedPart)?.description}</p>
        </div>}
        </>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${experimentViewWidth} ${experimentViewHeight}`} role="group" aria-label={`Experimento: desenrole a circunferência e compare com o diâmetro. Raio ${formatNumber(state.radius)} e diâmetro ${formatNumber(state.diameter)}.`} className="block w-full">
            <circle cx={experimentCx} cy={experimentCy} r={experimentRadius} fill="#ffffff" stroke="#475569" strokeWidth="6" />
            <motion.path d={circlePath} fill="none" stroke="#e11d48" strokeWidth="10" strokeLinecap="round" pathLength={progressMotion} />

            <line x1={experimentCx - experimentRadius} y1={experimentCy} x2={experimentCx + experimentRadius} y2={experimentCy} stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
            <text x={experimentCx} y={experimentCy - 12} textAnchor="middle" className="fill-slate-900 text-[25px] font-black" paintOrder="stroke" stroke="white" strokeWidth="6">DIÂMETRO</text>

            {[0, 1, 2, 3].map((count) => {
              const fraction = count / state.ratio
              const point = getCircumferencePoint(fraction, experimentRadius, experimentCx, experimentCy)
              return <circle key={`circumference-mark-${count}`} cx={point.x} cy={point.y} r="7" fill="#f472b6" stroke="white" strokeWidth="2" />
            })}

            {[1, 2, 3].map((count) => {
              const midpointRadians = 2 * count - 1
              const labelRadius = experimentRadius + 34
              const x = experimentCx + labelRadius * Math.cos(midpointRadians)
              const y = experimentCy - labelRadius * Math.sin(midpointRadians)
              const passed = traveledDiameters >= count - 1e-3
              const active = traveledDiameters > count - 1 && !passed
              const color = passed ? '#be123c' : active ? '#f43f5e' : '#475569'
              return <motion.text key={`segment-label-${count}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[27px] font-black" animate={{ fill: color }} transition={{ duration: 0.2 }}>{count}</motion.text>
            })}

            <motion.circle
              cx={circleMarkerX}
              cy={circleMarkerY}
              r="10"
              fill="#ec4899"
              stroke="white"
              strokeWidth="3"
              role="slider"
              tabIndex={0}
              aria-label="Ponto que percorre a circunferência"
              aria-orientation="horizontal"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              aria-valuetext={`Percurso equivalente a ${formatDiameterCount(traveledDiameters)}`}
              className={isDragging ? 'cursor-grabbing touch-none focus-visible:stroke-blue-700 focus-visible:stroke-[5px]' : 'cursor-grab touch-none focus-visible:stroke-blue-700 focus-visible:stroke-[5px]'}
              onKeyDown={handleProgressKeyDown}
              onPointerDown={(event) => beginDrag(event, (position) => {
                let radians = Math.atan2(experimentCy - position.y, position.x - experimentCx)
                if (radians < 0) radians += Math.PI * 2
                setManualProgress(radians / (Math.PI * 2))
              })}
              onPointerMove={dragCircleMarker}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
            />

            <line
              x1={isPortraitLayout ? experimentTrackX : trackStart - 8}
              y1={isPortraitLayout ? trackStart - 8 : experimentTrackY}
              x2={isPortraitLayout ? experimentTrackX : trackStart + circumferencePixels + 8}
              y2={isPortraitLayout ? trackStart + circumferencePixels + 8 : experimentTrackY}
              stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round"
            />
            <motion.line
              x1={isPortraitLayout ? experimentTrackX : trackStart}
              y1={isPortraitLayout ? trackStart : experimentTrackY}
              x2={isPortraitLayout ? experimentTrackX : highlightedLineEnd}
              y2={isPortraitLayout ? highlightedLineEnd : experimentTrackY}
              stroke="#e11d48" strokeWidth="8" strokeLinecap="round"
            />

            {[1, 2, 3].map((count) => {
              const tickX = trackStart + diameterPixels * count
              const checkpoint = count / state.ratio
              const passed = traveledDiameters >= count - 1e-3
              const selected = Math.abs(progress - checkpoint) < 0.006
              const accent = passed ? '#be123c' : '#64748b'
              const pillFill = selected ? '#ffe4e6' : passed ? '#fff1f2' : '#ffffff'
              const pillStroke = selected || passed ? '#fda4af' : '#cbd5e1'
              return <g
                key={`line-tick-${count}`}
                role="button"
                tabIndex={0}
                aria-label={`Avançar para ${count} ${count === 1 ? 'diâmetro' : 'diâmetros'}`}
                aria-pressed={selected}
                className="cursor-pointer outline-none focus-visible:drop-shadow-[0_0_4px_rgba(37,99,235,0.8)]"
                onClick={() => setManualProgress(checkpoint)}
                onKeyDown={(event) => activateMilestone(event, checkpoint)}
              >
                {isPortraitLayout ? <>
                  <rect x={experimentTrackX - 24} y={tickX - 24} width="48" height="48" rx="16" fill="transparent" />
                  <line x1={experimentTrackX - 12} y1={tickX} x2={experimentTrackX + 12} y2={tickX} stroke={accent} strokeWidth={passed ? 4 : 3} />
                  <rect x={experimentTrackX + 23} y={tickX - 13} width="42" height="26" rx="13" fill={pillFill} stroke={pillStroke} strokeWidth="1.5" />
                  <text x={experimentTrackX + 44} y={tickX + 5} textAnchor="middle" fill={accent} className="text-[13px] font-black">{count}d</text>
                </> : <>
                  <rect x={tickX - 27} y={experimentTrackY - 25} width="54" height="62" rx="18" fill="transparent" />
                  <line x1={tickX} y1={experimentTrackY - 12} x2={tickX} y2={experimentTrackY + 12} stroke={accent} strokeWidth={passed ? 4 : 3} />
                  <rect x={tickX - 22} y={experimentTrackY + 22} width="44" height="26" rx="13" fill={pillFill} stroke={pillStroke} strokeWidth="1.5" />
                  <text x={tickX} y={experimentTrackY + 40} textAnchor="middle" fill={accent} className="text-[13px] font-black">{count}d</text>
                </>}
              </g>
            })}
            <motion.circle
              cx={lineMarkerX}
              cy={lineMarkerY}
              r="9"
              fill="#ec4899"
              stroke="white"
              strokeWidth="3"
              aria-hidden="true"
              className={isDragging ? 'cursor-grabbing touch-none' : 'cursor-grab touch-none'}
              onPointerDown={(event) => beginDrag(event, (position) => setManualProgress(((isPortraitLayout ? position.y : position.x) - trackStart) / circumferencePixels))}
              onPointerMove={dragLineMarker}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
            />
            {isPortraitLayout ? <>
              <text x={experimentTrackX + 25} y={trackStart + 5} textAnchor="start" className="fill-slate-500 text-[15px] font-bold">0</text>
              <g role="button" tabIndex={0} aria-label="Completar uma volta, pi diâmetros" aria-pressed={progress >= 0.999} className="cursor-pointer outline-none focus-visible:drop-shadow-[0_0_4px_rgba(37,99,235,0.8)]" onClick={() => setManualProgress(1)} onKeyDown={(event) => activateMilestone(event, 1)}>
                <rect x={experimentTrackX + 21} y={trackStart + circumferencePixels - 18} width="48" height="40" rx="14" fill="transparent" />
                <rect x={experimentTrackX + 23} y={trackStart + circumferencePixels - 13} width="42" height="26" rx="13" fill={progress >= 0.999 ? '#ffe4e6' : '#ffffff'} stroke={progress >= 0.999 ? '#fda4af' : '#cbd5e1'} strokeWidth="1.5" />
                <text x={experimentTrackX + 44} y={trackStart + circumferencePixels + 5} textAnchor="middle" className="fill-rose-700 text-[13px] font-black">πd</text>
              </g>
            </> : <>
              <text x={trackStart} y={experimentTrackY + 40} textAnchor="middle" className="fill-slate-500 text-[13px] font-bold">0</text>
              <g role="button" tabIndex={0} aria-label="Completar uma volta, pi diâmetros" aria-pressed={progress >= 0.999} className="cursor-pointer outline-none focus-visible:drop-shadow-[0_0_4px_rgba(37,99,235,0.8)]" onClick={() => setManualProgress(1)} onKeyDown={(event) => activateMilestone(event, 1)}>
                <rect x={trackStart + circumferencePixels - 27} y={experimentTrackY - 28} width="54" height="48" rx="16" fill="transparent" />
                <rect x={trackStart + circumferencePixels - 22} y={experimentTrackY - 23} width="44" height="26" rx="13" fill={progress >= 0.999 ? '#ffe4e6' : '#ffffff'} stroke={progress >= 0.999 ? '#fda4af' : '#cbd5e1'} strokeWidth="1.5" />
                <text x={trackStart + circumferencePixels} y={experimentTrackY - 5} textAnchor="middle" className="fill-rose-700 text-[13px] font-black">πd</text>
              </g>
            </>}
          </svg>

          <div className="mt-3 rounded-2xl border border-white/80 bg-white/85 px-3 py-3 shadow-sm sm:px-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-700">Etapa {stage} de 4</p>
                <p className="mt-0.5 text-sm font-bold text-slate-700">Borda desenrolada</p>
              </div>
              <output aria-label="Diâmetros percorridos" className="font-mono text-base font-black text-blue-800">{formatNumber(traveledDiameters, 2)} <span className="text-xs font-semibold text-slate-500">de {formatNumber(state.ratio, 2)} diâmetros</span></output>
            </div>
            <p role="status" aria-live="polite" className="mt-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-semibold leading-relaxed text-slate-700">{learningMessage}</p>
            {progress >= 0.999 && <p className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-center text-xs font-bold text-blue-900 sm:text-sm">Circunferência ÷ diâmetro = π ≈ 3,14159…</p>}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {animationStatus === 'idle' || animationStatus === 'complete' ? (
                <button type="button" onClick={() => startAnimation(animationStatus === 'complete' ? 0 : progress)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"><Play size={16} /> {prefersReducedMotion ? reducedMotionActionLabel : animationStatus === 'complete' ? 'Repetir' : progress > 0 ? 'Continuar' : 'Desenrolar a volta'}</button>
              ) : animationStatus === 'running' ? (
                <button type="button" onClick={pauseAnimation} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800"><Pause size={16} /> Pausar</button>
              ) : (
                <button type="button" onClick={resumeAnimation} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800"><Play size={16} /> Retomar</button>
              )}
              <button type="button" onClick={resetAnimation} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"><RotateCcw size={15} /> Reiniciar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
