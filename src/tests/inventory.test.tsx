import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import Inventory, { chapterCoins } from '../components/learn/Inventory'
import { emptyProgress } from '../data/chapter'
import { recordVictory } from '../logic/chapter'

beforeEach(() => {
  localStorage.clear()
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    },
  })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('concede moedas pelas primeiras vitórias e reconhece progresso anterior', () => {
  const first = recordVictory(emptyProgress(), 1, 8, 30).progress
  expect(chapterCoins(first)).toBe(25)
  expect(chapterCoins(recordVictory(first, 1, 8, 20).progress)).toBe(25)
  expect(chapterCoins({ ...first, completed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] })).toBe(325)
})
it('equipa, restaura e desequipa somente itens conquistados', () => {
  const progress = { ...emptyProgress(), completed: [1, 2, 3] }
  const close = vi.fn()
  const view = render(<Inventory progress={progress} onClose={close} />)
  fireEvent.click(screen.getByRole('button', { name: 'Botas de explorador' }))
  fireEvent.click(screen.getByRole('button', { name: 'Equipar' }))
  expect(screen.getByRole('button', { name: 'Sapatos: Botas de explorador' })).toBeInTheDocument()
  view.unmount()
  render(<Inventory progress={progress} onClose={close} />)
  fireEvent.click(screen.getByRole('button', { name: 'Sapatos: Botas de explorador' }))
  fireEvent.click(screen.getByRole('button', { name: 'Desequipar' }))
  expect(screen.getByRole('button', { name: 'Sapatos: vazio' })).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Item da fase 10, ainda não conquistado' }),
  ).toBeDisabled()
})
it('descarta equipamentos salvos incompatíveis ou não conquistados', () => {
  localStorage.setItem(
    'matematica-rpg-equipment-v1',
    JSON.stringify({ helmet: 10, feet: 1, right: 1 }),
  )
  render(<Inventory progress={{ ...emptyProgress(), completed: [1] }} onClose={() => {}} />)
  expect(screen.getByRole('button', { name: 'Capacete: vazio' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Sapatos: vazio' })).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: 'Mão direita: Graveto de aventureiro' }),
  ).toBeInTheDocument()
})
