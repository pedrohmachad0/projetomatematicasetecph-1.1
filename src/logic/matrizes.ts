/** Matrizes 2×2 e 3×3: operações e determinante. */

export type Matrix = number[][]

export const size = (m: Matrix) => m.length

export function add(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v + b[i][j]))
}

export function multiply(a: Matrix, b: Matrix): Matrix {
  return a.map((row) => b[0].map((_, j) => row.reduce((sum, v, k) => sum + v * b[k][j], 0)))
}

export function scale(m: Matrix, k: number): Matrix {
  return m.map((row) => row.map((v) => v * k))
}

export function transpose(m: Matrix): Matrix {
  return m[0].map((_, j) => m.map((row) => row[j]))
}

export function determinant(m: Matrix): number {
  if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0]
  const [[a, b, c], [d, e, f], [g, h, i]] = m
  return a * e * i + b * f * g + c * d * h - c * e * g - a * f * h - b * d * i
}

/** Diagonais da regra de Sarrus (3×3) ou da regra 2×2, com seus produtos. */
export function determinantTerms(m: Matrix): { plus: number[][]; minus: number[][]; plusValues: number[]; minusValues: number[] } {
  if (m.length === 2)
    return { plus: [[0, 0, 1, 1]], minus: [[0, 1, 1, 0]], plusValues: [m[0][0] * m[1][1]], minusValues: [m[0][1] * m[1][0]] }
  const plus = [
    [0, 0, 1, 1, 2, 2],
    [0, 1, 1, 2, 2, 0],
    [0, 2, 1, 0, 2, 1],
  ]
  const minus = [
    [0, 2, 1, 1, 2, 0],
    [0, 0, 1, 2, 2, 1],
    [0, 1, 1, 0, 2, 2],
  ]
  const product = (cells: number[]) => {
    let p = 1
    for (let i = 0; i < cells.length; i += 2) p *= m[cells[i]][cells[i + 1]]
    return p
  }
  return { plus, minus, plusValues: plus.map(product), minusValues: minus.map(product) }
}
