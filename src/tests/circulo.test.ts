import { describe, expect, it } from 'vitest'
import { DEFAULT_RADIUS, MAX_RADIUS, MIN_RADIUS, getArcLength, getChordLength, getCircleState, getSectorArea, getUnrolledDistance } from '../logic/circulo'

describe('getCircleState', () => {
  it('calcula as medidas e a razão de um círculo', () => {
    const state = getCircleState(4)

    expect(state.radius).toBe(4)
    expect(state.diameter).toBe(8)
    expect(state.circumference).toBeCloseTo(8 * Math.PI, 10)
    expect(state.area).toBeCloseTo(16 * Math.PI, 10)
    expect(state.ratio).toBeCloseTo(Math.PI, 10)
  })

  it('limita o raio e usa o padrão para valores não finitos', () => {
    expect(getCircleState(0).radius).toBe(MIN_RADIUS)
    expect(getCircleState(100).radius).toBe(MAX_RADIUS)
    expect(getCircleState(Number.NaN).radius).toBe(DEFAULT_RADIUS)
  })
})

describe('medidas de arcos, setores e cordas', () => {
  it('calcula um quarto de circunferência e um quarto da área', () => {
    expect(getArcLength(4, 90)).toBeCloseTo(2 * Math.PI, 10)
    expect(getSectorArea(4, 90)).toBeCloseTo(4 * Math.PI, 10)
  })

  it('trata volta completa e cordas nos limites do ângulo', () => {
    expect(getArcLength(4, 360)).toBeCloseTo(8 * Math.PI, 10)
    expect(getSectorArea(4, 360)).toBeCloseTo(16 * Math.PI, 10)
    expect(getChordLength(4, 0)).toBeCloseTo(0, 10)
    expect(getChordLength(4, 180)).toBeCloseTo(8, 10)
    expect(getChordLength(4, 360)).toBeCloseTo(0, 10)
  })
})

describe('getUnrolledDistance', () => {
  it('mantém avanço e circunferência na mesma escala durante a volta', () => {
    const radius = 4

    expect(getUnrolledDistance(radius, 0)).toBe(0)
    expect(getUnrolledDistance(radius, 0.5)).toBeCloseTo(4 * Math.PI, 10)
    expect(getUnrolledDistance(radius, 1)).toBeCloseTo(8 * Math.PI, 10)
  })

  it('limita o progresso ao intervalo de uma volta', () => {
    expect(getUnrolledDistance(4, -1)).toBe(0)
    expect(getUnrolledDistance(4, 2)).toBeCloseTo(getCircleState(4).circumference, 10)
    expect(getUnrolledDistance(4, Number.NaN)).toBe(0)
  })
})
