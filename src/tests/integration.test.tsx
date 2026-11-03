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

/** Da tela de título até a trilha de fases, com um novo jogo. */
async function startGame(name = 'Ana') {
  fireEvent.click(await screen.findByRole('button', { name: /Começar aventura/ }))
  fireEvent.change(screen.getByLabelText(/Como devemos te chamar/), { target: { value: name } })
  fireEvent.click(screen.getByRole('button', { name: /Partir/ }))
  await screen.findByRole('button', { name: /Explorar a fase/ })
}

describe('Navegação da plataforma', () => {
  it('o jogo abre na tela de título e o novo jogo guarda o nome do aventureiro', async () => {
    window.history.replaceState({}, '', '/aprender')
    render(<App />)
    expect(await screen.findByRole('heading', { name: /MATHQUEST/ })).toBeInTheDocument()
    await startGame('Bia')
    expect(screen.getByRole('button', { name: 'Abrir inventário de Bia' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /Floresta das Brasas/ })).toBeInTheDocument()
  })

  it('Esc abre a pausa e as configurações', async () => {
    window.history.replaceState({}, '', '/aprender')
    render(<App />)
    await startGame()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByRole('heading', { name: 'Pausa' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Configurações/ }))
    expect(screen.getByRole('checkbox', { name: /Música/ })).toBeChecked()
    fireEvent.click(screen.getByRole('checkbox', { name: /Música/ }))
    expect(JSON.parse(localStorage.getItem('matematica-rpg-settings-v1')!).music).toBe(false)
  })

  it('quem já tem progresso vê Continuar no título', async () => {
    localStorage.setItem('matematica-rpg-chapter-1-v1', JSON.stringify({ completed: [1], xp: 100, best: {} }))
    window.history.replaceState({}, '', '/aprender')
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: /Continuar/ }))
    expect(await screen.findByRole('button', { name: /Explorar a fase/ })).toBeInTheDocument()
  })

  it('abre a Aventura e explora a primeira fase sem exibir quizzes separados', async () => {
    window.history.replaceState({}, '', '/aprender')
    render(<App />)
    await startGame()
    expect(screen.queryByRole('link', { name: 'Quizzes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Praticar' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Simuladores' })).toHaveAttribute('href', '/')
    fireEvent.click(screen.getByRole('button', { name: /Explorar a fase/ }))
    expect(screen.getByRole('region', { name: /^Mapa\./ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /diário de missões/ }))
    expect(screen.getByRole('heading', { name: /Missões/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Guardião bloqueado/ })).toBeDisabled()
  })

  it('a biblioteca mostra os cinco livros e o modo professor libera todos', async () => {
    window.history.replaceState({}, '', '/aprender')
    render(<App />)
    await startGame()
    fireEvent.click(screen.getByRole('button', { name: /Seus livros/ }))
    expect(screen.getByRole('button', { name: /Vila das Frações/ })).toBeDisabled()
    fireEvent.click(screen.getByRole('checkbox', { name: /Modo professor/ }))
    fireEvent.click(screen.getByRole('button', { name: /Cidade das Funções/ }))
    expect(screen.getByRole('heading', { level: 1, name: /Cidade das Funções/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Treinar no simulador/ })).toHaveAttribute('href', '/funcoes')
  })
})
