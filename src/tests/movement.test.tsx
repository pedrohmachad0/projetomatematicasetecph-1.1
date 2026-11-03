import { describe, expect, it } from 'vitest'
import { cameraOffset, keyToDirection } from '../logic/movement'

describe('Movimento no mapa', () => {
  it('setas e WASD viram direções', () => {
    expect(keyToDirection('ArrowUp')).toBe('up')
    expect(keyToDirection('D')).toBe('right')
    expect(keyToDirection('q')).toBeUndefined()
  })

  it('a câmera centraliza o herói sem passar das bordas', () => {
    expect(cameraOffset(0, 40, 24, 520)).toBe(0)
    expect(cameraOffset(12, 40, 24, 520)).toBe(12 * 40 + 20 - 260)
    expect(cameraOffset(23, 40, 24, 520)).toBe(24 * 40 - 520)
    expect(cameraOffset(0, 40, 15, 360, 44)).toBe(-44)
    expect(cameraOffset(3, 40, 5, 400)).toBe(-100)
  })

})
