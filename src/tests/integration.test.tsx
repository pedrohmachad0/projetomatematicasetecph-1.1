import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Navegação da plataforma', () => {
  it('abre a Aventura e inicia uma batalha sem exibir quizzes separados', () => {
    window.history.replaceState({}, '', '/aprender')
    render(<App />)
    expect(screen.queryByRole('link', { name: 'Quizzes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Praticar' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Simuladores' })).toHaveAttribute('href', '/')
    fireEvent.click(screen.getByRole('button', { name: /Começar aventura/ }))
    expect(screen.getByRole('button', { name: /Confirmar/ })).toBeInTheDocument()
  })
})
