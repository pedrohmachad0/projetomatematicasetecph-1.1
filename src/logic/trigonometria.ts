/** Círculo trigonométrico de raio 1, ângulo em graus. */

export const NOTABLE_ANGLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330]

export function normalizeAngle(degrees: number): number {
  return ((degrees % 360) + 360) % 360
}

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/** Remove resíduos de ponto flutuante como 6,1e-17 → 0. */
function clean(value: number): number {
  const rounded = Math.round(value * 1e10) / 1e10
  return Object.is(rounded, -0) ? 0 : rounded
}

export function sine(degrees: number): number {
  return clean(Math.sin(toRadians(degrees)))
}

export function cosine(degrees: number): number {
  return clean(Math.cos(toRadians(degrees)))
}

/** Tangente; `null` quando não existe (cosseno zero: 90° e 270°). */
export function tangent(degrees: number): number | null {
  const cos = cosine(degrees)
  if (cos === 0) return null
  return clean(sine(degrees) / cos)
}

export function quadrant(degrees: number): 0 | 1 | 2 | 3 | 4 {
  const angle = normalizeAngle(degrees)
  if (angle % 90 === 0) return 0
  return (Math.floor(angle / 90) + 1) as 1 | 2 | 3 | 4
}

/** Fração de π em texto, ex.: 150° → "5π/6". */
export function radiansLabel(degrees: number): string {
  const angle = normalizeAngle(degrees)
  if (angle === 0) return '0'
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(angle, 180)
  const numerator = angle / divisor
  const denominator = 180 / divisor
  const top = numerator === 1 ? 'π' : `${numerator}π`
  return denominator === 1 ? top : `${top}/${denominator}`
}

export function formatTrig(value: number | null): string {
  if (value === null) return 'não existe'
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 3 })
}

const exactSinByReference: Record<number, string> = { 0: '0', 30: '1/2', 45: '√2/2', 60: '√3/2', 90: '1' }
const exactTanByReference: Record<number, string> = { 0: '0', 30: '√3/3', 45: '1', 60: '√3' }

/** Ângulo de referência no 1º quadrante (0° a 90°). */
export function referenceAngle(degrees: number): number {
  const angle = normalizeAngle(degrees)
  if (angle <= 90) return angle
  if (angle <= 180) return 180 - angle
  if (angle <= 270) return angle - 180
  return 360 - angle
}

function withSign(value: number, text: string): string {
  return value < 0 ? `−${text}` : text
}

/** Valor exato para ângulos notáveis (ex.: "√2/2"); `null` para os demais. */
export function exactSine(degrees: number): string | null {
  const text = exactSinByReference[referenceAngle(degrees)]
  return text === undefined ? null : withSign(sine(degrees), text)
}

export function exactCosine(degrees: number): string | null {
  const text = exactSinByReference[90 - referenceAngle(degrees)]
  return text === undefined ? null : withSign(cosine(degrees), text)
}

export function exactTangent(degrees: number): string | null {
  const value = tangent(degrees)
  if (value === null) return null
  const text = exactTanByReference[referenceAngle(degrees)]
  return text === undefined ? null : withSign(value, text)
}
