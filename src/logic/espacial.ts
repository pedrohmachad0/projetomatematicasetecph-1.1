/** Geometria espacial: volume e área total dos principais sólidos. */

export type Solid = 'cubo' | 'paralelepipedo' | 'cilindro' | 'cone' | 'piramide' | 'esfera'

export interface SolidSize {
  a: number
  b: number
  h: number
  r: number
}

export interface SolidMeasures {
  volume: number
  area: number
  volumeFormula: string
  volumeCalc: string
}

const r2 = (v: number) => Math.round(v * 100) / 100
const PI = Math.PI

export function solidMeasures(solid: Solid, { a, b, h, r }: SolidSize): SolidMeasures {
  switch (solid) {
    case 'cubo':
      return { volume: a ** 3, area: 6 * a * a, volumeFormula: 'V = a³', volumeCalc: `${a}³ = ${a ** 3}` }
    case 'paralelepipedo':
      return { volume: a * b * h, area: 2 * (a * b + a * h + b * h), volumeFormula: 'V = comprimento × largura × altura', volumeCalc: `${a} × ${b} × ${h} = ${a * b * h}` }
    case 'cilindro':
      return { volume: r2(PI * r * r * h), area: r2(2 * PI * r * r + 2 * PI * r * h), volumeFormula: 'V = π · r² · h', volumeCalc: `π · ${r}² · ${h} ≈ ${r2(PI * r * r * h)}` }
    case 'cone': {
      const g = Math.hypot(r, h)
      return { volume: r2((PI * r * r * h) / 3), area: r2(PI * r * r + PI * r * g), volumeFormula: 'V = π · r² · h ÷ 3', volumeCalc: `π · ${r}² · ${h} ÷ 3 ≈ ${r2((PI * r * r * h) / 3)}` }
    }
    case 'piramide': {
      const slant = Math.hypot(a / 2, h)
      return { volume: r2((a * a * h) / 3), area: r2(a * a + 2 * a * slant), volumeFormula: 'V = área da base × h ÷ 3', volumeCalc: `${a}² × ${h} ÷ 3 ≈ ${r2((a * a * h) / 3)}` }
    }
    case 'esfera':
      return { volume: r2((4 / 3) * PI * r ** 3), area: r2(4 * PI * r * r), volumeFormula: 'V = 4 · π · r³ ÷ 3', volumeCalc: `4 · π · ${r}³ ÷ 3 ≈ ${r2((4 / 3) * PI * r ** 3)}` }
  }
}
