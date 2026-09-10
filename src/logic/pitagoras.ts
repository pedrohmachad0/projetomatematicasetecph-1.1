/**
 * Lógica pura do Explorador de Pitágoras e Áreas Triangulares
 * Especificação seção 10 das regras do projeto.
 *
 * Dois lados fixos A e B com mesma medida (FIXED_SIDE).
 * Terceiro lado C calculado via Lei dos Cossenos: C² = A² + B² − 2AB·cos(θ)
 * Ângulo θ varia 10°..120° passo 10°.
 */

export const FIXED_SIDE = 10
export const MIN_ANGLE = 1
export const MAX_ANGLE = 179
export const ANGLE_STEP = 10

export type Classification = 'acutangulo' | 'retangulo' | 'obtusangulo'
export type ComparisonSymbol = '>' | '=' | '<'

export interface PythagorasState {
  angle: number
  sideA: number
  sideB: number
  sideC: number
  areaA: number
  areaB: number
  areaC: number
  sumAB: number
  classification: Classification
  comparison: ComparisonSymbol
}

// mantém compatibilidade com código legado que usa catetos
export interface LegacyPythagorasState {
  catA: number
  catB: number
}

/** Valida um ângulo interno inteiro que forma um triângulo. */
export function isAnguloValido(angle: number): boolean {
  return Number.isInteger(angle) && angle >= MIN_ANGLE && angle <= MAX_ANGLE
}

export function clampAngle(angle: number): number {
  return Math.min(MAX_ANGLE, Math.max(MIN_ANGLE, Math.round(angle)))
}

export function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Calcula o terceiro lado C usando Lei dos Cossenos.
 * A e B são fixos (padrão FIXED_SIDE)
 */
export function calcularLadoC(
  angleDeg: number,
  sideA: number = FIXED_SIDE,
  sideB: number = FIXED_SIDE,
): number {
  const rad = toRadians(angleDeg)
  const c2 = sideA ** 2 + sideB ** 2 - 2 * sideA * sideB * Math.cos(rad)
  // proteção numérica para ângulos muito pequenos
  return Math.sqrt(Math.max(0, c2))
}

export function calcularAreas(
  sideA: number = FIXED_SIDE,
  sideB: number = FIXED_SIDE,
  sideC: number,
): { areaA: number; areaB: number; areaC: number; sumAB: number } {
  const areaA = sideA ** 2
  const areaB = sideB ** 2
  const areaC = parseFloat((sideC ** 2).toFixed(2))
  return { areaA, areaB, areaC, sumAB: areaA + areaB }
}

export function classificarTriangulo(angleDeg: number): Classification {
  if (angleDeg < 90) return 'acutangulo'
  if (angleDeg === 90) return 'retangulo'
  return 'obtusangulo'
}

export function getCorClassificacao(c: Classification): string {
  switch (c) {
    case 'acutangulo':
      return '#eab308' // amarelo
    case 'retangulo':
      return '#22c55e' // verde
    case 'obtusangulo':
      return '#f97316' // laranja
  }
}

export function getTextoClassificacao(c: Classification): string {
  switch (c) {
    case 'acutangulo':
      return 'TRIÂNGULO ACUTÂNGULO'
    case 'retangulo':
      return 'TRIÂNGULO RETÂNGULO'
    case 'obtusangulo':
      return 'TRIÂNGULO OBTUSÂNGULO'
  }
}

export function compararAreas(sumAB: number, areaC: number): ComparisonSymbol {
  const eps = 0.15
  if (Math.abs(sumAB - areaC) < eps) return '='
  return sumAB > areaC ? '>' : '<'
}

export function getMensagemComparacao(sym: ComparisonSymbol, sumAB: number, areaC: number): string {
  return `A² + B² ${sym} C²  (${sumAB} ${sym} ${areaC})`
}

export function getEstadoCompleto(angleDeg: number): PythagorasState {
  const sideA = FIXED_SIDE
  const sideB = FIXED_SIDE
  const sideCPrecise = calcularLadoC(angleDeg, sideA, sideB)
  const sideC = parseFloat(sideCPrecise.toFixed(2))
  // Comparação deve usar valor preciso (sem erro de arredondamento)
  const areaCPrecise = sideCPrecise ** 2
  const { areaA, areaB, areaC, sumAB } = calcularAreas(sideA, sideB, sideCPrecise)
  // areaC exibido é arredondado, mas comparação usa preciso
  const classification = classificarTriangulo(angleDeg)
  const comparison = compararAreas(sumAB, areaCPrecise)
  return {
    angle: angleDeg,
    sideA,
    sideB,
    sideC,
    areaA,
    areaB,
    areaC,
    sumAB,
    classification,
    comparison,
  }
}

// ── Compatibilidade legado (catetos) ──
// Mantidos para não quebrar testes antigos até migração completa

/** Calcula a hipotenusa: c = √(a² + b²) — legado para triângulo retângulo clássico */
export function calcularHipotenusa(catA: number, catB: number): number {
  return Math.sqrt(catA ** 2 + catB ** 2)
}

/** Verifica se os valores formam um triângulo retângulo válido */
export function isTrianguloValido(catA: number, catB: number): boolean {
  return catA > 0 && catB > 0
}

/** Retorna os ângulos internos do triângulo em graus — legado */
export function calcularAngulos(catA: number, catB: number): { alfa: number; beta: number } {
  const hipotenusa = calcularHipotenusa(catA, catB)
  const alfa = (Math.asin(catA / hipotenusa) * 180) / Math.PI
  const beta = 90 - alfa
  return { alfa: parseFloat(alfa.toFixed(2)), beta: parseFloat(beta.toFixed(2)) }
}

/** Área do triângulo retângulo — legado */
export function calcularArea(catA: number, catB: number): number {
  return (catA * catB) / 2
}
