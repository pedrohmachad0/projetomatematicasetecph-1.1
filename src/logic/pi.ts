export const PI = Math.PI
export const MIN_DIAMETER = 0.5
export const MAX_DIAMETER = 10
export const DEFAULT_DIAMETER = 4
export const DIAMETER_STEP = 0.5

export interface PiState {
  diameter: number
  radius: number
  circumference: number
  ratio: number
  wholeDiameters: number
  remainder: number
  remainderRatio: number
}

export function getPiState(diameter: number): PiState {
  const safeDiameter = Math.min(MAX_DIAMETER, Math.max(MIN_DIAMETER, diameter))
  const radius = safeDiameter / 2
  const circumference = PI * safeDiameter
  const wholeDiameters = Math.floor(circumference / safeDiameter)
  const remainder = circumference - wholeDiameters * safeDiameter
  const remainderRatio = remainder / safeDiameter

  return {
    diameter: safeDiameter,
    radius,
    circumference,
    ratio: circumference / safeDiameter,
    wholeDiameters,
    remainder,
    remainderRatio,
  }
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals).replace('.', ',')
}
