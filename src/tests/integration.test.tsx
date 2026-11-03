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
  it('abre a Aventura e explora a primeira fase sem exibir quizzes separados', async () => {
    window.history.replaceState({}, '', '/aprender')
    render(<App />)
    await screen.findByRole('button', { name: /Explorar a fase/ })
    expect(screen.queryByRole('link', { name: 'Quizzes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Praticar' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Simuladores' })).toHaveAttribute('href', '/')
    fireEvent.click(screen.getByRole('button', { name: /Explorar a fase/ }))
    expect(screen.getByRole('heading', { name: /Missões/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Guardião bloqueado/ })).toBeDisabled()
  })

  it('a biblioteca mostra os cinco livros e o modo professor libera todos', async () => {
    window.history.replaceState({}, '', '/aprender')
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: /Seus livros/ }))
    expect(screen.getByRole('button', { name: /Vila das Frações/ })).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox', { name: /Modo professor/ }))
    fireEvent.click(screen.getByRole('button', { name: /Cidade das Funções/ }))
    expect(screen.getByRole('heading', { level: 1, name: /Cidade das Funções/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Treinar no simulador/ })).toHaveAttribute('href', '/funcoes')
  })
})
