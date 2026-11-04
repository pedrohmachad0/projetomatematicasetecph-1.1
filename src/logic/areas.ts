/** Perímetro e área de figuras planas (medidas em unidades da malha). */

export type Shape = 'retangulo' | 'quadrado' | 'triangulo' | 'paralelogramo' | 'trapezio'

export interface ShapeSize {
  base: number
  height: number
  /** Base menor do trapézio. */
  top: number
  /** Deslocamento do topo (inclinação do paralelogramo / triângulo). */
  offset: number
}

export interface Measures {
  area: number
  perimeter: number
  formula: string
  calc: string
}

const side = (dx: number, dy: number) => Math.hypot(dx, dy)
const r2 = (v: number) => Math.round(v * 100) / 100

export function measure(shape: Shape, size: ShapeSize): Measures {
  const { base: b, height: h, top: t, offset: o } = size
  switch (shape) {
    case 'quadrado':
      return { area: b * b, perimeter: 4 * b, formula: 'A = lado × lado', calc: `${b} × ${b} = ${b * b}` }
    case 'retangulo':
      return { area: b * h, perimeter: 2 * (b + h), formula: 'A = base × altura', calc: `${b} × ${h} = ${b * h}` }
    case 'paralelogramo':
      return { area: b * h, perimeter: r2(2 * b + 2 * side(o, h)), formula: 'A = base × altura', calc: `${b} × ${h} = ${b * h}` }
    case 'triangulo':
      return { area: (b * h) / 2, perimeter: r2(b + side(o, h) + side(b - o, h)), formula: 'A = base × altura ÷ 2', calc: `${b} × ${h} ÷ 2 = ${(b * h) / 2}` }
    case 'trapezio': {
      const left = side((b - t) / 2, h)
      return { area: ((b + t) * h) / 2, perimeter: r2(b + t + 2 * left), formula: 'A = (B + b) × altura ÷ 2', calc: `(${b} + ${t}) × ${h} ÷ 2 = ${((b + t) * h) / 2}` }
    }
  }
}

/** Vértices da figura na malha, com a base apoiada em y = 0. */
export function vertices(shape: Shape, size: ShapeSize): Array<[number, number]> {
  const { base: b, height: h, top: t, offset: o } = size
  if (shape === 'quadrado') return [[0, 0], [b, 0], [b, b], [0, b]]
  if (shape === 'retangulo') return [[0, 0], [b, 0], [b, h], [0, h]]
  if (shape === 'paralelogramo') return [[0, 0], [b, 0], [b + o, h], [o, h]]
  if (shape === 'triangulo') return [[0, 0], [b, 0], [o, h]]
  const left = (b - t) / 2
  return [[0, 0], [b, 0], [b - left, h], [left, h]]
}
