import { describe, expect, it } from 'vitest'
import { PI, getPiState } from '../logic/pi'

describe('getPiState', () => {
  it('calcula circunferência, raio e razão para um diâmetro conhecido', () => {
    const state = getPiState(4)

    expect(state.radius).toBe(2)
    expect(state.circumference).toBeCloseTo(4 * PI, 10)
    expect(state.ratio).toBeCloseTo(PI, 10)
  })

  it('decompõe a circunferência em três diâmetros e o restante', () => {
    const state = getPiState(4)

    expect(state.wholeDiameters).toBe(3)
    expect(state.remainderRatio).toBeCloseTo(PI - 3, 10)
    expect(state.remainder).toBeCloseTo(4 * (PI - 3), 10)
  })

  it('mantém a razão C/D constante para diferentes diâmetros', () => {
    expect(getPiState(1).ratio).toBeCloseTo(PI, 10)
    expect(getPiState(7.5).ratio).toBeCloseTo(PI, 10)
    expect(getPiState(10).ratio).toBeCloseTo(PI, 10)
  })

  it('limita valores fora do intervalo permitido', () => {
    expect(getPiState(-2).diameter).toBe(0.5)
    expect(getPiState(99).diameter).toBe(10)
  })
})
