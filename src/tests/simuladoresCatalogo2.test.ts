import { describe, expect, it } from 'vitest'
import { addIntegers, compareIntegers, opposite, signed, subtractIntegers } from '../logic/inteiros'
import { directRule, inverseRule, isProportion, simplifyRatio } from '../logic/proporcao'
import { expandPower, isPerfectSquare, power, squareRootInfo, cubeRoot } from '../logic/potencias'
import { format, solveAll, tokenize } from '../logic/expressoes'
import { measure, vertices } from '../logic/areas'
import { notable } from '../logic/notaveis'
import { formatEq, lineY, solveSystem } from '../logic/sistemas'
import { angleType, diagonals, exteriorAngle, interiorAngle, interiorSum, polygonName } from '../logic/poligonos'
import { talesMissing, talesSegments } from '../logic/tales'
import { checkLog, expBehavior, logValue } from '../logic/exponencial'
import { add, determinant, determinantTerms, multiply, transpose } from '../logic/matrizes'
import { arrangement, combination, countChoices, factorial, listArrangements, listCombinations } from '../logic/combinatoria'
import { solidMeasures } from '../logic/espacial'
import { distance, lineEquation, midpoint, slope } from '../logic/analitica'
import { compoundAmount, simpleAmount, table } from '../logic/juros'

describe('números inteiros', () => {
  it('soma e subtrai como deslocamentos', () => {
    expect(addIntegers(-3, 5)).toEqual({ start: -3, delta: 5, end: 2 })
    expect(subtractIntegers(2, -4)).toEqual({ start: 2, delta: 4, end: 6 })
    expect(opposite(0)).toBe(0)
    expect(opposite(-7)).toBe(7)
    expect(compareIntegers(-5, -2)).toBe('<')
    expect(signed(-3)).toBe('(−3)')
    expect(signed(4)).toBe('4')
  })
})

describe('razão e proporção', () => {
  it('simplifica razões e resolve regra de três', () => {
    expect(simplifyRatio(6, 8)).toEqual([3, 4])
    expect(directRule(2, 6, 5)).toBe(15)
    expect(inverseRule(4, 6, 8)).toBe(3)
    expect(isProportion(2, 3, 4, 6)).toBe(true)
    expect(isProportion(2, 3, 4, 5)).toBe(false)
  })
})

describe('potências e raízes', () => {
  it('expande e calcula', () => {
    expect(power(2, 5)).toBe(32)
    expect(power(7, 0)).toBe(1)
    expect(expandPower(3, 3)).toBe('3 × 3 × 3')
    expect(isPerfectSquare(49)).toBe(true)
    expect(squareRootInfo(20)).toMatchObject({ exact: false, lower: 4, upper: 5 })
    expect(squareRootInfo(36)).toMatchObject({ exact: true, lower: 6, upper: 6 })
    expect(cubeRoot(27)).toBe(3)
  })
})

describe('expressões numéricas', () => {
  it('respeita a ordem das operações', () => {
    expect(solveAll('2 + 3 × 4').result).toBe(14)
    expect(solveAll('(2 + 3) × 4').result).toBe(20)
    expect(solveAll('20 − 12 ÷ 4 × 2').result).toBe(14)
    expect(solveAll('10 − 4 − 3').result).toBe(3)
    expect(solveAll('2 × (3 + (8 − 2) ÷ 3)').result).toBe(10)
  })
  it('primeiro passo de 2 + 3 × 4 é a multiplicação', () => {
    const { steps } = solveAll('2 + 3 × 4')
    expect(steps[0].focus).toEqual([2, 4])
    expect(steps[0].result).toBe(12)
    expect(format(tokenize('(1+2)*3'))).toBe('(1 + 2) × 3')
  })
})

describe('áreas e perímetros', () => {
  it('calcula as figuras', () => {
    const size = { base: 6, height: 4, top: 2, offset: 3 }
    expect(measure('retangulo', size)).toMatchObject({ area: 24, perimeter: 20 })
    expect(measure('quadrado', size)).toMatchObject({ area: 36, perimeter: 24 })
    expect(measure('triangulo', size).area).toBe(12)
    expect(measure('paralelogramo', size).area).toBe(24)
    expect(measure('trapezio', size).area).toBe(16)
    expect(vertices('triangulo', size)).toHaveLength(3)
  })
  it('paralelogramo tem a mesma área do retângulo de mesma base e altura', () => {
    const size = { base: 5, height: 3, top: 2, offset: 4 }
    expect(measure('paralelogramo', size).area).toBe(measure('retangulo', size).area)
  })
})

describe('produtos notáveis', () => {
  it('confere as identidades', () => {
    for (const [a, b] of [[3, 2], [5, 1], [7, 4]]) {
      for (const kind of ['soma', 'diferenca', 'produto'] as const) {
        const r = notable(kind, a, b)
        expect(r.left).toBe(r.right)
      }
    }
  })
})

describe('sistemas de equações', () => {
  it('classifica e resolve', () => {
    expect(solveSystem({ a: 1, b: 1, c: 5 }, { a: 1, b: -1, c: 1 })).toEqual({ kind: 'unica', x: 3, y: 2 })
    expect(solveSystem({ a: 1, b: 1, c: 5 }, { a: 2, b: 2, c: 4 }).kind).toBe('impossivel')
    expect(solveSystem({ a: 1, b: 1, c: 5 }, { a: 2, b: 2, c: 10 }).kind).toBe('indeterminado')
    expect(lineY({ a: 1, b: 1, c: 5 }, 2)).toBe(3)
    expect(formatEq({ a: 2, b: -1, c: -3 })).toBe('2x − y = −3')
    expect(formatEq({ a: 1, b: 1, c: 5 })).toBe('x + y = 5')
  })
})

describe('ângulos e polígonos', () => {
  it('mede os polígonos regulares', () => {
    expect(interiorSum(3)).toBe(180)
    expect(interiorAngle(6)).toBe(120)
    expect(exteriorAngle(5)).toBe(72)
    expect(diagonals(5)).toBe(5)
    expect(polygonName(8)).toBe('Octógono')
    expect(angleType(90)).toBe('reto')
    expect(angleType(135)).toBe('obtuso')
    expect(angleType(270)).toBe('reflexo')
  })
})

describe('Teorema de Tales', () => {
  it('os segmentos são proporcionais', () => {
    expect(talesMissing(2, 3, 4)).toBe(6)
    const s = talesSegments([0, 100, 250], 0.3, 1.1)
    expect(s.a / s.b).toBeCloseTo(s.c / s.d, 9)
  })
})

describe('exponencial e logaritmo', () => {
  it('são inversas', () => {
    expect(expBehavior(2)).toBe('crescente')
    expect(expBehavior(0.5)).toBe('decrescente')
    expect(logValue(2, 8)).toBeCloseTo(3)
    expect(checkLog(10, 1000).y).toBeCloseTo(3)
    expect(checkLog(3, 20).back).toBeCloseTo(20)
  })
})

describe('matrizes', () => {
  it('opera e calcula determinantes', () => {
    expect(add([[1, 2], [3, 4]], [[1, 1], [1, 1]])).toEqual([[2, 3], [4, 5]])
    expect(multiply([[1, 2], [3, 4]], [[0, 1], [1, 0]])).toEqual([[2, 1], [4, 3]])
    expect(transpose([[1, 2], [3, 4]])).toEqual([[1, 3], [2, 4]])
    expect(determinant([[1, 2], [3, 4]])).toBe(-2)
    const m = [[2, 0, 1], [1, 3, 2], [1, 1, 2]]
    expect(determinant(m)).toBe(6)
    const t = determinantTerms(m)
    expect(t.plusValues.reduce((a, b) => a + b) - t.minusValues.reduce((a, b) => a + b)).toBe(determinant(m))
  })
})

describe('análise combinatória', () => {
  it('conta e lista', () => {
    expect(factorial(5)).toBe(120)
    expect(arrangement(5, 2)).toBe(20)
    expect(combination(5, 2)).toBe(10)
    expect(listArrangements(['A', 'B', 'C'], 2)).toHaveLength(6)
    expect(listCombinations(['A', 'B', 'C', 'D'], 2)).toHaveLength(6)
    expect(countChoices([3, 2, 4])).toBe(24)
  })
})

describe('geometria espacial', () => {
  it('calcula volumes', () => {
    const s = { a: 3, b: 4, h: 5, r: 2 }
    expect(solidMeasures('cubo', s).volume).toBe(27)
    expect(solidMeasures('paralelepipedo', s)).toMatchObject({ volume: 60, area: 94 })
    expect(solidMeasures('cilindro', s).volume).toBeCloseTo(Math.PI * 20, 1)
    expect(solidMeasures('cone', s).volume).toBeCloseTo((Math.PI * 20) / 3, 1)
    expect(solidMeasures('esfera', s).volume).toBeCloseTo((32 / 3) * Math.PI, 1)
    expect(solidMeasures('piramide', s).volume).toBe(15)
  })
})

describe('geometria analítica', () => {
  it('mede distância, ponto médio e reta', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
    expect(midpoint({ x: -2, y: 4 }, { x: 4, y: 0 })).toEqual({ x: 1, y: 2 })
    expect(slope({ x: 1, y: 1 }, { x: 1, y: 5 })).toBeNull()
    expect(lineEquation({ x: 0, y: 1 }, { x: 2, y: 5 })).toBe('y = 2x + 1')
    expect(lineEquation({ x: 0, y: 3 }, { x: 4, y: 3 })).toBe('y = 3')
    expect(lineEquation({ x: 2, y: 0 }, { x: 2, y: 4 })).toBe('x = 2')
    expect(lineEquation({ x: 0, y: 0 }, { x: 2, y: -2 })).toBe('y = −x')
  })
})

describe('juros', () => {
  it('compara simples e compostos', () => {
    expect(simpleAmount(1000, 10, 2)).toBeCloseTo(1200)
    expect(compoundAmount(1000, 10, 2)).toBeCloseTo(1210)
    const rows = table(100, 5, 3)
    expect(rows).toHaveLength(4)
    expect(rows[0].simple).toBe(100)
    expect(rows[3].compound).toBeGreaterThan(rows[3].simple)
  })
})

describe('expressões: validação e pegadinha', () => {
  it('detecta expressões inválidas e o erro da esquerda para a direita', async () => {
    const { isValidExpression, leftToRight, tokenize: tk } = await import('../logic/expressoes')
    expect(isValidExpression('2 + 3 × 4')).toBe(true)
    expect(isValidExpression('2 + × 4')).toBe(false)
    expect(isValidExpression('(2 + 3')).toBe(false)
    expect(isValidExpression('4 ÷ (2 − 2)')).toBe(false)
    expect(isValidExpression('abc')).toBe(false)
    expect(leftToRight(tk('2 + 3 × 4'))).toBe(20)
    expect(leftToRight(tk('(2 + 3) × 4'))).toBeNull()
  })
})
