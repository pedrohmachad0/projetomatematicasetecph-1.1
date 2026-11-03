import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import NumberPad from '../components/learn/NumberPad'

function Harness() {
  const [value, setValue] = useState('')
  return <NumberPad id="teste" value={value} onChange={setValue} />
}

function mockPointer(coarse: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('coarse') ? coarse : false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

describe('teclado numérico do jogo', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('em tela de toque usa os botões e o campo não abre o teclado do sistema', () => {
    mockPointer(true)
    render(<Harness />)
    const input = screen.getByLabelText('Sua resposta') as HTMLInputElement
    expect(input.readOnly).toBe(true)
    expect(input.getAttribute('inputmode')).toBe('none')
    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '8' }))
    expect(input.value).toBe('18')
    fireEvent.click(screen.getByRole('button', { name: 'Apagar o último número' }))
    expect(input.value).toBe('1')
    fireEvent.click(screen.getByRole('button', { name: 'Limpar a resposta' }))
    expect(input.value).toBe('')
  })

  it('no computador o campo aceita digitação e não mostra os botões', () => {
    mockPointer(false)
    render(<Harness />)
    const input = screen.getByLabelText('Sua resposta') as HTMLInputElement
    expect(input.readOnly).toBe(false)
    expect(screen.queryByRole('group', { name: 'Teclado numérico' })).toBeNull()
    fireEvent.change(input, { target: { value: '42' } })
    expect(input.value).toBe('42')
    fireEvent.change(input, { target: { value: '4a' } })
    expect(input.value).toBe('42')
  })
})
