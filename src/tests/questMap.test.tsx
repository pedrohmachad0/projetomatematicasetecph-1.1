import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import QuestMap from '../components/learn/QuestMap'
import { questBooks } from '../data/questBooks'
import { generateQuestMap, mapSeed, RIVER_X } from '../logic/questMap'

const book = questBooks[0]
const map = generateQuestMap(mapSeed(0, 1), { monsters: 3, minionKinds: book.minions.length, villagers: 1 })

function renderMap(props: Partial<Parameters<typeof QuestMap>[0]> = {}) {
  return render(
    <MemoryRouter>
      <QuestMap book={book} bookIndex={0} phaseNumber={1} phase={book.phases[0]} soundOn={false} replay={false} onExit={() => {}} onGuardian={() => {}} onCoins={() => {}} {...props} />
    </MemoryRouter>,
  )
}

/** Responde certo o desafio aberto (fase 1 do Livro I: somas até 10). */
function answerEncounter() {
  const [a, b] = document.getElementById('encounter-expression')!.textContent!.match(/\d+/g)!.map(Number)
  const answer = String(a + b)
  const input = screen.queryByRole('textbox')
  if (input) fireEvent.change(input, { target: { value: answer } })
  else fireEvent.click(Array.from(document.querySelectorAll<HTMLButtonElement>('.encounter .answer-option')).find((o) => o.textContent!.slice(1) === answer)!)
  fireEvent.click(screen.getByRole('button', { name: /Atacar|Responder/ }))
  fireEvent.click(screen.getByRole('button', { name: /Próximo golpe|Voltar ao mapa/ }))
}

/** Vence a batalha por turnos contra um monstro da trilha (aberta por cima do mapa). */
function winBattle() {
  for (let turn = 0; turn < 20 && document.querySelector('.map-battle-layer'); turn++) {
    const next = screen.queryByRole('button', { name: /Continuar|Ver resultado/ })
    if (next) {
      fireEvent.click(next)
      continue
    }
    fireEvent.click(screen.getByRole('button', { name: /Atacar/ }))
    fireEvent.click(screen.getByRole('button', { name: /Golpe rápido/ }))
    const [a, b] = document.getElementById('question-expression')!.textContent!.match(/\d+/g)!.map(Number)
    const answer = String(a + b)
    const input = screen.queryByRole('textbox')
    if (input) fireEvent.change(input, { target: { value: answer } })
    else fireEvent.click(Array.from(document.querySelectorAll<HTMLButtonElement>('.map-battle-layer .answer-option')).find((o) => o.textContent!.slice(1) === answer)!)
    fireEvent.click(screen.getByRole('button', { name: /Confirmar/ }))
  }
}

/** Monstro: batalha por turnos. Morador, baú e ponte: janela de pergunta. */
function solve() {
  if (document.querySelector('.map-battle-layer')) winBattle()
  else {
    answerEncounter()
    if (screen.queryByRole('dialog')) answerEncounter()
  }
}

/** Clica no personagem (ou na ponte) e espera o herói chegar até ele. */
function walkTo(x: number, y: number) {
  const target = document.querySelector<HTMLButtonElement>(`.map-object[style*="left: ${x * 30}px"][style*="top: ${y * 30}px"]`)!
  fireEvent.click(target)
  for (let i = 0; i < 90; i++) act(() => vi.advanceTimersByTime(120))
}

/** Passa a conversa até o fim (o primeiro clique completa o texto, o segundo avança). */
function finishTalk() {
  for (let i = 0; i < 12 && document.querySelector('.dialogue-next'); i++) fireEvent.click(document.querySelector('.dialogue-next')!)
}

function openJournal() {
  fireEvent.keyDown(window, { key: 'j' })
}

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Mapa explorável', () => {
  it('começa com o guardião bloqueado e o herói no ponto de partida', () => {
    renderMap()
    expect(screen.queryByRole('button', { name: /^Guardião$/ })).not.toBeInTheDocument()
    openJournal()
    expect(screen.getByRole('button', { name: /Guardião bloqueado/ })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Fechar o diário' }))
    expect(screen.getByRole('region', { name: /^Mapa\./ })).toHaveAccessibleName(`Mapa. Você está na coluna ${map.start.x + 1}, linha ${map.start.y + 1}.`)
  })

  it('segurar a seta continua andando; soltar para', () => {
    renderMap()
    const label = () => screen.getByRole('region', { name: /^Mapa\./ }).getAttribute('aria-label')
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    const first = label()
    act(() => vi.advanceTimersByTime(160))
    fireEvent.keyUp(window, { key: 'ArrowRight' })
    const afterHold = label()
    act(() => vi.advanceTimersByTime(600))
    expect(label()).toBe(afterHold)
    expect(first).not.toBe(`Mapa. Você está na coluna ${map.start.x + 1}, linha ${map.start.y + 1}.`)
  })

  it('anda pelas setas e não atravessa obstáculos', () => {
    renderMap()
    const before = screen.getByRole('region', { name: /^Mapa\./ }).getAttribute('aria-label')
    for (let i = 0; i < 20; i++) fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByRole('region', { name: /^Mapa\./ }).getAttribute('aria-label')).toBe(before)
  })

  it('cumpre as missões, abre o caminho e libera o guardião', () => {
    const coins = vi.fn()
    const guardian = vi.fn()
    renderMap({ onCoins: coins, onGuardian: guardian })
    const order = [...map.entities.filter((e) => e.x < RIVER_X && e.type === 'monster'), map.entities.find((e) => e.type === 'villager')!]
    for (const entity of order) {
      walkTo(entity.x, entity.y)
      finishTalk()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      solve()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    }
    walkTo(map.gate.x, map.gate.y)
    expect(screen.getByRole('heading', { name: book.gate.broken })).toBeInTheDocument()
    answerEncounter()
    for (const entity of map.entities.filter((e) => e.x > RIVER_X && e.type === 'monster')) {
      walkTo(entity.x, entity.y)
      solve()
    }
    const enter = screen.getByRole('button', { name: /^Guardião$/ })
    fireEvent.click(enter)
    expect(guardian).toHaveBeenCalled()
    expect(coins).toHaveBeenCalledWith(3)
    expect(coins).toHaveBeenCalledWith(5)
  }, 30_000)

  it('o morador conversa antes de pedir ajuda', () => {
    renderMap({ heroName: 'Ana' })
    const villager = map.entities.find((e) => e.type === 'villager')!
    walkTo(villager.x, villager.y)
    expect(screen.getByRole('dialog', { name: /Conversa com/ })).toBeInTheDocument()
    expect(document.querySelector('.dialogue-box p')!.textContent).toContain('Olá, Ana!')
    finishTalk()
    expect(screen.getByRole('heading', { name: book.villagers[villager.variant % book.villagers.length] })).toBeInTheDocument()
  })

  it('a placa mostra a dica e o link do simulador; o progresso fica salvo', () => {
    renderMap()
    const sign = map.entities.find((e) => e.type === 'sign')!
    walkTo(sign.x, sign.y)
    expect(screen.getByRole('heading', { name: book.phases[0].topic })).toBeInTheDocument()
    for (const link of screen.getAllByRole('link', { name: 'Abrir simulador' })) expect(link).toHaveAttribute('href', '/soma')
    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao mapa' }))
    cleanup()
    renderMap()
    openJournal()
    expect(screen.getByText('Leia a placa do sábio (opcional)').closest('li')).toHaveClass('done')
  })
})
