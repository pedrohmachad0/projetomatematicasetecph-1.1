/** Escala do plano cartesiano em SVG: converte coordenadas matemáticas em pixels. */

export const PLANE_SIZE = 440
export const PLANE_PADDING = 20

export interface PlaneScale {
  min: number
  max: number
  toX: (value: number) => number
  toY: (value: number) => number
}

export function createScale(min: number, max: number): PlaneScale {
  const span = max - min
  const inner = PLANE_SIZE - PLANE_PADDING * 2
  return {
    min,
    max,
    toX: (value) => PLANE_PADDING + ((value - min) / span) * inner,
    toY: (value) => PLANE_PADDING + ((max - value) / span) * inner,
  }
}

/** Gera o atributo `d` de um caminho, quebrando a linha quando a curva sai da área visível. */
export function plotPath(fn: (x: number) => number, scale: PlaneScale, samples = 240): string {
  const limit = (scale.max - scale.min) * 1.5
  let d = ''
  let drawing = false
  for (let i = 0; i <= samples; i++) {
    const x = scale.min + ((scale.max - scale.min) * i) / samples
    const y = fn(x)
    if (!Number.isFinite(y) || Math.abs(y) > limit) {
      drawing = false
      continue
    }
    d += `${drawing ? 'L' : 'M'} ${scale.toX(x).toFixed(2)} ${scale.toY(y).toFixed(2)} `
    drawing = true
  }
  return d.trim()
}
