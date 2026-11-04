export const MIN_RADIUS = 0.5
export const MAX_RADIUS = 10
export const DEFAULT_RADIUS = 4
export const RADIUS_STEP = 0.5

export type CircleMode = 'dobrar' | 'partes' | 'arcos' | 'area'

export interface CircleState { radius: number; diameter: number; circumference: number; area: number; ratio: number }

export function getCircleState(radius: number): CircleState {
  const finiteRadius = Number.isFinite(radius) ? radius : DEFAULT_RADIUS
  const safeRadius = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, finiteRadius))
  const diameter = safeRadius * 2
  const circumference = Math.PI * diameter
  return { radius: safeRadius, diameter, circumference, area: Math.PI * safeRadius ** 2, ratio: circumference / diameter }
}

/** Distância percorrida ao desenrolar uma fração de uma volta completa. */
export function getUnrolledDistance(radius: number, progress: number): number {
  const safeProgress = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0
  return getCircleState(radius).circumference * safeProgress
}

export function getArcLength(radius: number, angle: number) {
  const safeAngle = Math.max(0, Math.min(360, angle))
  return (safeAngle / 360) * 2 * Math.PI * radius
}

export function getSectorArea(radius: number, angle: number) {
  const safeAngle = Math.max(0, Math.min(360, angle))
  return (safeAngle / 360) * Math.PI * radius ** 2
}

export function getChordLength(radius: number, angle: number) {
  const safeAngle = Math.max(0, Math.min(360, angle))
  return 2 * radius * Math.sin((safeAngle * Math.PI) / 360)
}

export function formatNumber(value: number, decimals = 2) { return value.toFixed(decimals).replace('.', ',') }

/* ---------- Experimento "Dobrar o diâmetro" ---------- */

/** Um diâmetro dobrado sobre a borda cobre 2 radianos (comprimento 2r num raio r). */
export const DIAMETER_ARC_RADIANS = 2

/** Quantos diâmetros inteiros cabem na volta: 3. */
export const WHOLE_DIAMETERS = Math.floor((2 * Math.PI) / DIAMETER_ARC_RADIANS)

/** O que sobra da volta depois de 3 diâmetros, em diâmetros: π − 3 ≈ 0,1416. */
export const LEFTOVER_DIAMETERS = Math.PI - WHOLE_DIAMETERS

export interface Point2 {
  x: number
  y: number
}

/**
 * Ponto da circunferência no ângulo `a` (radianos, sentido anti-horário a partir
 * da direita), em coordenadas de tela (y para baixo).
 */
export function circlePoint(cx: number, cy: number, r: number, a: number): Point2 {
  return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) }
}

/**
 * Régua de comprimento 2r saindo do ângulo `start`.
 * - `turn` (0–1): a régua gira em torno do ponto inicial, de deitada sobre o
 *   diâmetro (apontando para o centro) até ficar tangente à borda.
 * - `wrap` (0–1): a parte já encostada vira arco; o resto continua reto, tangente.
 * Devolve o arco já dobrado (ângulos) e a ponta solta da régua.
 */
export function rulerGeometry(cx: number, cy: number, r: number, start: number, turn: number, wrap: number) {
  const length = 2 * r
  const wrapped = Math.max(0, Math.min(1, wrap)) * DIAMETER_ARC_RADIANS
  const touch = circlePoint(cx, cy, r, start + wrapped)
  // Direção tangente no sentido anti-horário (em coordenadas de tela).
  const tangent = { x: -Math.sin(start + wrapped), y: -Math.cos(start + wrapped) }
  // Antes de dobrar, a régua gira de "para o centro" até a tangente.
  const inward = { x: -Math.cos(start), y: Math.sin(start) }
  const t = Math.max(0, Math.min(1, turn))
  const blend = wrap > 0 ? tangent : { x: inward.x * (1 - t) + tangent.x * t, y: inward.y * (1 - t) + tangent.y * t }
  const size = Math.hypot(blend.x, blend.y) || 1
  const rest = length * (1 - wrapped / DIAMETER_ARC_RADIANS)
  return {
    arcStart: start,
    arcEnd: start + wrapped,
    touch,
    tip: { x: touch.x + (blend.x / size) * rest, y: touch.y + (blend.y / size) * rest },
  }
}

/** Caminho SVG de um arco no sentido anti-horário entre dois ângulos. */
export function arcPathCCW(cx: number, cy: number, r: number, from: number, to: number): string {
  if (to - from <= 0) return ''
  const a = circlePoint(cx, cy, r, from)
  const b = circlePoint(cx, cy, r, to)
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${to - from > Math.PI ? 1 : 0} 0 ${b.x} ${b.y}`
}
