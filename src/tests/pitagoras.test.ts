import { describe, it, expect } from 'vitest'
import {
  calcularHipotenusa,
  calcularAngulos,
  calcularArea,
  isTrianguloValido,
  // novo spec
  FIXED_SIDE,
  calcularLadoC,
  classificarTriangulo,
  compararAreas,
  calcularAreas,
  getEstadoCompleto,
  isAnguloValido,
  clampAngle,
  getCorClassificacao,
  getTextoClassificacao,
} from '../logic/pitagoras'

// ---- Legado (mantido para compatibilidade) ----
describe('pitagoras – calcularHipotenusa (legado)', () => {
  it('calcula corretamente com 3-4-5', () => {
    expect(calcularHipotenusa(3, 4)).toBeCloseTo(5, 5)
  })
  it('calcula corretamente com 5-12-13', () => {
    expect(calcularHipotenusa(5, 12)).toBeCloseTo(13, 5)
  })
  it('retorna valor maior que ambos os catetos', () => {
    const c = calcularHipotenusa(6, 8)
    expect(c).toBeGreaterThan(6)
    expect(c).toBeGreaterThan(8)
  })
})

describe('pitagoras – calcularAngulos (legado)', () => {
  it('soma dos ângulos internos é 90° para retângulo', () => {
    const { alfa, beta } = calcularAngulos(3, 4)
    expect(alfa + beta).toBeCloseTo(90, 1)
  })
  it('ângulos são positivos', () => {
    const { alfa, beta } = calcularAngulos(1, 1)
    expect(alfa).toBeGreaterThan(0)
    expect(beta).toBeGreaterThan(0)
  })
  it('triângulo isósceles tem alfa = beta = 45°', () => {
    const { alfa, beta } = calcularAngulos(1, 1)
    expect(alfa).toBeCloseTo(45, 1)
    expect(beta).toBeCloseTo(45, 1)
  })
})

describe('pitagoras – calcularArea (legado)', () => {
  it('calcula área corretamente (base * altura / 2)', () => {
    expect(calcularArea(4, 6)).toBe(12)
  })
  it('área é sempre positiva', () => {
    expect(calcularArea(3, 4)).toBeGreaterThan(0)
  })
})

describe('pitagoras – isTrianguloValido (legado)', () => {
  it('retorna true para valores positivos', () => {
    expect(isTrianguloValido(3, 4)).toBe(true)
  })
  it('retorna false quando cateto é zero', () => {
    expect(isTrianguloValido(0, 4)).toBe(false)
    expect(isTrianguloValido(3, 0)).toBe(false)
  })
})

// ---- Novo spec: seção 10 e 23 ----
describe('pitagoras – spec ângulo livre (1°..179°)', () => {
  it('valida ângulos e limites', () => {
    expect(isAnguloValido(10)).toBe(true)
    expect(isAnguloValido(60)).toBe(true)
    expect(isAnguloValido(90)).toBe(true)
    expect(isAnguloValido(120)).toBe(true)
    expect(isAnguloValido(1)).toBe(true)
    expect(isAnguloValido(179)).toBe(true)
    expect(isAnguloValido(0)).toBe(false)
    expect(isAnguloValido(180)).toBe(false)
    expect(isAnguloValido(15.5)).toBe(false)
    expect(clampAngle(0)).toBe(1)
    expect(clampAngle(180)).toBe(179)
    expect(clampAngle(23.4)).toBe(23)
  })

  it('calcula lado C corretamente para 60° (equilátero quando A=B)', () => {
    // A=B=10, ângulo 60° -> triângulo equilátero -> C=10
    const c60 = calcularLadoC(60, FIXED_SIDE, FIXED_SIDE)
    expect(c60).toBeCloseTo(10, 1)
  })

  it('calcula lado C corretamente para 90° (Pitágoras clássico)', () => {
    const c90 = calcularLadoC(90, FIXED_SIDE, FIXED_SIDE)
    // sqrt(10²+10²)=14.142...
    expect(c90).toBeCloseTo(Math.sqrt(200), 2)
  })

  it('calcula lado C corretamente para 10° (pequeno) e 120° (obtuso)', () => {
    const c10 = calcularLadoC(10, FIXED_SIDE, FIXED_SIDE)
    const c120 = calcularLadoC(120, FIXED_SIDE, FIXED_SIDE)
    // 10° deve ser pequeno (<10), 120° deve ser grande (>14.14)
    expect(c10).toBeGreaterThan(0)
    expect(c10).toBeLessThan(10)
    expect(c120).toBeGreaterThan(14.14)
    // 120° com lados 10: c²=100+100-200*cos120=200-200*(-0.5)=300 -> c=17.32
    expect(c120).toBeCloseTo(Math.sqrt(300), 2)
  })

  it('classificação correta para ângulos chave', () => {
    expect(classificarTriangulo(10)).toBe('acutangulo')
    expect(classificarTriangulo(60)).toBe('acutangulo')
    expect(classificarTriangulo(90)).toBe('retangulo')
    expect(classificarTriangulo(120)).toBe('obtusangulo')
  })

  it('cores e textos de classificação existem e não dependem só de cor', () => {
    expect(getCorClassificacao('acutangulo')).toMatch(/^#/)
    expect(getCorClassificacao('retangulo')).toMatch(/^#/)
    expect(getCorClassificacao('obtusangulo')).toMatch(/^#/)
    expect(getTextoClassificacao('acutangulo')).toContain('ACUTÂNGULO')
    expect(getTextoClassificacao('retangulo')).toContain('RETÂNGULO')
    expect(getTextoClassificacao('obtusangulo')).toContain('OBTUSÂNGULO')
  })

  it('áreas e comparação A²+B² vs C² para ângulos chave', () => {
    const testCases: Array<{ angle: number; expected: '>' | '=' | '<' }> = [
      { angle: 10, expected: '>' }, // C pequeno -> soma maior
      { angle: 60, expected: '>' },
      { angle: 90, expected: '=' },
      { angle: 120, expected: '<' },
    ]
    for (const { angle, expected } of testCases) {
      const estado = getEstadoCompleto(angle)
      expect(estado.angle).toBe(angle)
      expect(estado.sideA).toBe(FIXED_SIDE)
      expect(estado.sideB).toBe(FIXED_SIDE)
      expect(estado.areaA).toBe(100)
      expect(estado.areaB).toBe(100)
      expect(estado.sumAB).toBe(200)
      expect(estado.areaC).toBeCloseTo(estado.sideC ** 2, 0)
      expect(estado.comparison).toBe(expected)
      // verifica compararAreas diretamente
      expect(compararAreas(estado.sumAB, estado.areaC)).toBe(expected)
    }
  })

  it('getEstadoCompleto mantém matemática consistente (recalcular, validar)', () => {
    for (const angle of [10, 30, 60, 90, 100, 120]) {
      const e = getEstadoCompleto(angle)
      expect(e.sumAB).toBe(e.areaA + e.areaB)
      // Lei dos cossenos: C² = A²+B²-2AB cosθ (tolerância para arredondamento de 2 casas)
      const rad = (angle * Math.PI) / 180
      const c2Esperado = e.sideA ** 2 + e.sideB ** 2 - 2 * e.sideA * e.sideB * Math.cos(rad)
      expect(e.sideC ** 2).toBeCloseTo(c2Esperado, 0)
      // verifica que área exibida corresponde ao quadrado do lado exibido (com arredondamento)
      expect(e.areaC).toBeCloseTo(e.sideC ** 2, 0)
    }
  })

  it('calcularAreas retorna valores corretos', () => {
    const sideC = calcularLadoC(90)
    const { areaA, areaB, areaC, sumAB } = calcularAreas(FIXED_SIDE, FIXED_SIDE, sideC)
    expect(areaA).toBe(100)
    expect(areaB).toBe(100)
    expect(areaC).toBeCloseTo(200, 0)
    expect(sumAB).toBe(200)
  })
})
