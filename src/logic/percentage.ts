export interface PercentageBreakdown {
  base: number
  percentage: number
  amount: number
  total: number
}

function normalize(value: number): number {
  return Number.isFinite(value) ? value : 0
}

export function calculatePercentage(value: number, percentage: number): number {
  return (normalize(value) * normalize(percentage)) / 100
}

export function calculateDiscount(value: number, percentage: number): PercentageBreakdown {
  const base = normalize(value)
  const safePercentage = normalize(percentage)
  const amount = calculatePercentage(base, safePercentage)
  return { base, percentage: safePercentage, amount, total: base - amount }
}

export function calculateIncrease(value: number, percentage: number): PercentageBreakdown {
  const base = normalize(value)
  const safePercentage = normalize(percentage)
  const amount = calculatePercentage(base, safePercentage)
  return { base, percentage: safePercentage, amount, total: base + amount }
}

export function formatPercentage(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(2)}%`
}
