export const MIN_RADIUS = 0.5
export const MAX_RADIUS = 10
export const DEFAULT_RADIUS = 4
export const RADIUS_STEP = 0.5

export type CircleMode = 'medidas' | 'circunferencia' | 'angulos' | 'elementos' | 'area'

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
