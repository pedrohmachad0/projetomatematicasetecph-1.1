/** Ângulos e polígonos regulares. */

export const interiorSum = (n: number) => (n - 2) * 180
export const interiorAngle = (n: number) => interiorSum(n) / n
export const exteriorAngle = (n: number) => 360 / n
export const diagonals = (n: number) => (n * (n - 3)) / 2

const names: Record<number, string> = { 3: 'Triângulo', 4: 'Quadrado', 5: 'Pentágono', 6: 'Hexágono', 7: 'Heptágono', 8: 'Octógono', 9: 'Eneágono', 10: 'Decágono', 11: 'Undecágono', 12: 'Dodecágono' }
export const polygonName = (n: number) => names[n] ?? `Polígono de ${n} lados`

export function angleType(degrees: number): 'nulo' | 'agudo' | 'reto' | 'obtuso' | 'raso' | 'reflexo' | 'completo' {
  if (degrees === 0) return 'nulo'
  if (degrees < 90) return 'agudo'
  if (degrees === 90) return 'reto'
  if (degrees < 180) return 'obtuso'
  if (degrees === 180) return 'raso'
  if (degrees < 360) return 'reflexo'
  return 'completo'
}

/** Vértices de um polígono regular inscrito num círculo de raio r. */
export function regularVertices(n: number, cx: number, cy: number, r: number): Array<[number, number]> {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  })
}
