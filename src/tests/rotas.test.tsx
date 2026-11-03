import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../App'
import { mathContents } from '../data/mathContent'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('Rotas dos simuladores', () => {
  it('o Hub lista todos os simuladores disponíveis do catálogo', () => {
    window.history.replaceState({}, '', '/')
    render(<App />)
    for (const content of mathContents.filter((item) => item.available)) {
      expect(screen.getByRole('link', { name: `Abrir ${content.title}` })).toHaveAttribute('href', `/${content.simulator}`)
    }
  })

  it('filtrar por ano mostra só os simuladores daquele ano', () => {
    window.history.replaceState({}, '', '/')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /^9º ano/ }))
    expect(screen.getByRole('link', { name: 'Abrir Explorador de Pitágoras' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Abrir Cálculo Mental: Soma' })).not.toBeInTheDocument()
  })

  it.each(mathContents.filter((item) => item.available).map((item) => [item.simulator, item.title]))('a rota /%s abre "%s" com o mesmo nome do catálogo', async (route, title) => {
    window.history.replaceState({}, '', `/${route}`)
    render(<App />)
    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Ampliar ${title} para apresentação` })).toBeInTheDocument()
  })

  it('rota inexistente mostra uma página de aviso', () => {
    window.history.replaceState({}, '', '/nao-existe')
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Este caminho não existe' })).toBeInTheDocument()
  })
})
