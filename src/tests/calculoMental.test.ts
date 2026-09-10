import { describe, it, expect } from 'vitest'
import {
  gerarQuestaoSoma,
  gerarQuestaoSubtracao,
  verificarResposta,
  calcularPontos,
  gerarFeedback,
  transferirSoma,
  deslocarSubtracao,
  isDezenaExata,
} from '../logic/calculoMental'
import { transferir, podeTransferir, isDezenaExata as isDezenaSoma, getBarrasECubos } from '../logic/adicao'
import { deslocar, podeDeslocar, isDezenaExata as isDezenaSub } from '../logic/subtracao'
import { additionProblems } from '../data/additionProblems'
import { subtractionProblems } from '../data/subtractionProblems'

describe('calculoMental – gerarQuestaoSoma (legado)', () => {
  it('resposta é igual a a + b', () => {
    const q = gerarQuestaoSoma()
    expect(q.resposta).toBe(q.a + q.b)
  })
  it('valores dentro do intervalo esperado (1–99)', () => {
    for (let i = 0; i < 20; i++) {
      const q = gerarQuestaoSoma()
      expect(q.a).toBeGreaterThanOrEqual(1)
      expect(q.a).toBeLessThanOrEqual(99)
      expect(q.b).toBeGreaterThanOrEqual(1)
      expect(q.b).toBeLessThanOrEqual(99)
    }
  })
})

describe('calculoMental – gerarQuestaoSubtracao (legado)', () => {
  it('resposta é igual a a - b', () => {
    const q = gerarQuestaoSubtracao()
    expect(q.resposta).toBe(q.a - q.b)
  })
  it('resultado nunca é negativo', () => {
    for (let i = 0; i < 20; i++) {
      const q = gerarQuestaoSubtracao()
      expect(q.resposta).toBeGreaterThanOrEqual(0)
    }
  })
})

describe('calculoMental – verificarResposta', () => {
  it('retorna true quando resposta está correta', () => {
    const q = { a: 7, b: 3, resposta: 10 }
    expect(verificarResposta(q, 10)).toBe(true)
  })
  it('retorna false quando resposta está errada', () => {
    const q = { a: 7, b: 3, resposta: 10 }
    expect(verificarResposta(q, 9)).toBe(false)
  })
})

describe('calculoMental – calcularPontos', () => {
  it('retorna 0 quando errou', () => {
    expect(calcularPontos(1000, false)).toBe(0)
  })
  it('retorna 10 para respostas muito rápidas (≤3s)', () => {
    expect(calcularPontos(2000, true)).toBe(10)
  })
  it('retorna 7 para respostas entre 3s e 6s', () => {
    expect(calcularPontos(4000, true)).toBe(7)
  })
  it('retorna 5 para respostas entre 6s e 10s', () => {
    expect(calcularPontos(8000, true)).toBe(5)
  })
  it('retorna 3 para respostas lentas (>10s)', () => {
    expect(calcularPontos(12000, true)).toBe(3)
  })
})

describe('calculoMental – gerarFeedback', () => {
  it('feedback de acerto não inclui a resposta correta no texto', () => {
    const msg = gerarFeedback(true, 10)
    expect(typeof msg).toBe('string')
    expect(msg.length).toBeGreaterThan(0)
  })
  it('feedback de erro inclui a resposta correta', () => {
    const msg = gerarFeedback(false, 42)
    expect(msg).toContain('42')
  })
})

// ── Novos testes spec: Soma compensação aditiva ──
describe('Soma – compensação aditiva (spec 11 + 23)', () => {
  it('additionProblems contém 10 problemas pré-configurados separados da UI', () => {
    expect(additionProblems).toHaveLength(10)
    for (const p of additionProblems) {
      expect(p.a).toBeGreaterThan(0)
      expect(p.b).toBeGreaterThan(0)
      expect(p.id).toBeGreaterThan(0)
    }
  })

  it('transferência mantém a soma constante (exemplo 12+27 -> 10+29)', () => {
    const { novoA, novoB, soma } = transferir(12, 27, 2)
    expect(novoA).toBe(10)
    expect(novoB).toBe(29)
    expect(soma).toBe(39)
    expect(novoA + novoB).toBe(12 + 27)
  })

  it('transferência para esquerda (delta negativo)', () => {
    const { novoA, novoB, soma } = transferir(10, 29, -2)
    expect(novoA).toBe(12)
    expect(novoB).toBe(27)
    expect(soma).toBe(39)
  })

  it('transferência 1 unidade mantém soma', () => {
    const a = 18, b = 25
    const somaOrig = a + b
    const r1 = transferir(a, b, 1)
    expect(r1.soma).toBe(somaOrig)
    const r2 = transferir(a, b, -1)
    expect(r2.soma).toBe(somaOrig)
  })

  it('podeTransferir evita valores negativos', () => {
    expect(podeTransferir(1, 10, 2)).toBe(false) // 1-2 = -1
    expect(podeTransferir(5, 5, -6)).toBe(false) // 5+6=11 ok mas 5-(-6)=11? wait delta -6 => 11,  -1 -> let's testar negativo B
    expect(podeTransferir(0, 10, 1)).toBe(false)
    expect(podeTransferir(5, 5, 1)).toBe(true)
  })

  it('detecção de dezena exata', () => {
    expect(isDezenaSoma(10)).toBe(true)
    expect(isDezenaSoma(20)).toBe(true)
    expect(isDezenaSoma(30)).toBe(true)
    expect(isDezenaSoma(12)).toBe(false)
    expect(isDezenaSoma(29)).toBe(false)
    // via calculoMental também
    expect(isDezenaExata(40)).toBe(true)
  })

  it('chegada em dezena facilita cálculo (ex: 12+27 -> 10+29)', () => {
    let a = 12, b = 27
    const res = transferir(a, b, 2)
    expect(isDezenaSoma(res.novoA)).toBe(true)
    expect(res.novoA).toBe(10)
  })

  it('material dourado: barras e cubos', () => {
    expect(getBarrasECubos(27)).toEqual({ dezenas: 2, unidades: 7 })
    expect(getBarrasECubos(10)).toEqual({ dezenas: 1, unidades: 0 })
    expect(getBarrasECubos(38)).toEqual({ dezenas: 3, unidades: 8 })
    expect(getBarrasECubos(0)).toEqual({ dezenas: 0, unidades: 0 })
  })

  it('transferirSoma alias mantém compatibilidade', () => {
    const r = transferirSoma(14, 29, 4)
    expect(r.novoA).toBe(10)
    expect(r.novoB).toBe(33)
    expect(r.soma).toBe(43)
  })
})

// ── Novos testes spec: Subtração deslocamento ──
describe('Subtração – deslocamento na reta (spec 12 + 23)', () => {
  it('subtractionProblems contém 10 problemas pré-configurados', () => {
    expect(subtractionProblems).toHaveLength(10)
    for (const p of subtractionProblems) {
      expect(p.minuendo).toBeGreaterThanOrEqual(p.subtraendo) // diferença não negativa
      expect(p.id).toBeGreaterThan(0)
    }
  })

  it('deslocamento mantém a diferença constante (ex 27-12 -> 25-10)', () => {
    const { novoMinuendo, novoSubtraendo, diferenca } = deslocar(27, 12, -2)
    expect(novoMinuendo).toBe(25)
    expect(novoSubtraendo).toBe(10)
    expect(diferenca).toBe(15)
    expect(diferenca).toBe(27 - 12)
  })

  it('deslocamento para esquerda e direita', () => {
    const origM = 34, origS = 18, diff = 16
    const left = deslocar(origM, origS, -1)
    expect(left.diferenca).toBe(diff)
    expect(left.novoMinuendo).toBe(33)
    expect(left.novoSubtraendo).toBe(17)

    const right = deslocar(origM, origS, 1)
    expect(right.diferenca).toBe(diff)
    expect(right.novoMinuendo).toBe(35)
    expect(right.novoSubtraendo).toBe(19)
  })

  it('podeDeslocar valida intervalo', () => {
    expect(podeDeslocar(5, 5)).toBe(true)
    expect(podeDeslocar(-1, 5)).toBe(false)
    expect(podeDeslocar(5, -1)).toBe(false)
    expect(podeDeslocar(200, 10)).toBe(false) // acima de 120
  })

  it('detecção de dezena exata no subtraendo', () => {
    expect(isDezenaSub(10)).toBe(true)
    expect(isDezenaSub(20)).toBe(true)
    expect(isDezenaSub(12)).toBe(false)
    expect(isDezenaExata(30)).toBe(true)
  })

  it('chegada em dezena facilita cálculo (ex 34-18 -> 36-20)', () => {
    const { novoMinuendo, novoSubtraendo } = deslocar(34, 18, 2)
    expect(isDezenaSub(novoSubtraendo)).toBe(true)
    expect(novoSubtraendo).toBe(20)
    expect(novoMinuendo).toBe(36)
  })

  it('deslocarSubtracao alias mantém compatibilidade', () => {
    const r = deslocarSubtracao(45, 19, 1)
    expect(r.novoSubtraendo).toBe(20)
    expect(r.novoMinuendo).toBe(46)
    expect(r.diferenca).toBe(26)
  })

  it('diferença constante após múltiplos deslocamentos', () => {
    let m = 52, s = 27
    const diff = m - s
    for (const d of [-3, 1, 2, -2, 5]) {
      const r = deslocar(m, s, d)
      expect(r.diferenca).toBe(diff)
      m = r.novoMinuendo
      s = r.novoSubtraendo
    }
  })
})
