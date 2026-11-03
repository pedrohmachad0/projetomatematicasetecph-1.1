import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Trigonometria from '../pages/Trigonometria'
import { CHALLENGES_STORAGE, markCompleted, readCompleted } from '../logic/challenges'

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('Desafios dos simuladores', () => {
  it('marca a meta sozinha quando o aluno chega ao estado pedido e lembra depois', () => {
    const view = render(
      <MemoryRouter>
        <Trigonometria />
      </MemoryRouter>,
    )
    expect(screen.getByText('0/4')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '150°' }))
    expect(screen.getByText('1/4')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '90°' }))
    expect(screen.getByText('2/4')).toBeInTheDocument()
    expect(readCompleted('trigonometria')).toEqual(['seno-meio', 'tg-nao-existe'])
    view.unmount()
    render(
      <MemoryRouter>
        <Trigonometria />
      </MemoryRouter>,
    )
    expect(screen.getByText('2/4')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Recomeçar desafios/ }))
    expect(readCompleted('trigonometria')).toEqual([])
  })

  it('tolera armazenamento corrompido', () => {
    localStorage.setItem(CHALLENGES_STORAGE, '{')
    expect(readCompleted('x')).toEqual([])
    expect(markCompleted('x', ['a'])).toEqual(['a'])
  })
})
