import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cameraOffset, directionFrom, keyToDirection } from '../logic/movement'
import VirtualJoystick from '../components/learn/VirtualJoystick'

afterEach(cleanup)

describe('Movimento no mapa', () => {
  it('o joystick usa o eixo dominante e ignora toques curtos', () => {
    expect(directionFrom(3, 4)).toBeNull()
    expect(directionFrom(30, 5)).toBe('right')
    expect(directionFrom(-30, 12)).toBe('left')
    expect(directionFrom(4, -25)).toBe('up')
    expect(directionFrom(-10, 40)).toBe('down')
  })

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

  it('o joystick envia a direção ao arrastar e solta ao levantar o dedo', () => {
    const onDirection = vi.fn()
    const { container } = render(<VirtualJoystick onDirection={onDirection} />)
    const zone = container.querySelector('.joystick-zone')!
    fireEvent.pointerDown(zone, { pointerId: 1, clientX: 50, clientY: 50 })
    fireEvent.pointerMove(zone, { pointerId: 1, clientX: 90, clientY: 55 })
    expect(onDirection).toHaveBeenLastCalledWith('right')
    fireEvent.pointerMove(zone, { pointerId: 1, clientX: 52, clientY: 10 })
    expect(onDirection).toHaveBeenLastCalledWith('up')
    fireEvent.pointerUp(zone, { pointerId: 1 })
    expect(onDirection).toHaveBeenLastCalledWith(null)
  })
})
