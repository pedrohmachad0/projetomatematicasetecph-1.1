export const MIN_RADIUS = 0.5
export const MAX_RADIUS = 10
export const DEFAULT_RADIUS = 4
export const RADIUS_STEP = 0.5

export type CircleMode = 'medidas' | 'circunferencia' | 'angulos' | 'elementos' | 'area'

export interface CircleState { radius: number; diameter: number; circumference: number; area: number; ratio: number }

export function getCircleState(radius: number): CircleState {
  const safeRadius = Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, radius))
  const diameter = safeRadius * 2
  const circumference = Math.PI * diameter
  return { radius: safeRadius, diameter, circumference, area: Math.PI * safeRadius ** 2, ratio: circumference / diameter }
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