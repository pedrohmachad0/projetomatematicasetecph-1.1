import { describe, expect, it } from 'vitest'
import { applyOperation, formatEquation, isBalanced, isSolved, solutionOf, tilt } from '../logic/equacoes'
import { equationProblems } from '../data/equationProblems'
import { describeModes, frequencies, mean, median, modes, range } from '../logic/estatistica'
import { affineBehavior, affineRoot, discriminant, evaluate, formatLaw, quadraticRoots, vertex } from '../logic/funcoes'
import { classify, paSum, paTerm, pgSum, pgTerm, sum, terms } from '../logic/progressoes'
import { cosine, exactCosine, exactSine, exactTangent, normalizeAngle, quadrant, radiansLabel, sine, tangent } from '../logic/trigonometria'
import { drawOutcome, experiments, maxDeviation, relativeFrequencies, runTrials, theoretical } from '../logic/probabilidade'

function seeded(seed = 42) {
  let state = seed
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
}

describe('Balança de equações', () => {
  const problem = { a: 2, b: 3, c: 11 }
  const x = solutionOf(problem)

  it('todos os problemas têm solução inteira positiva e começam equilibrados', () => {
    for (const p of equationProblems) {
      const s = solutionOf(p)
      expect(Number.isInteger(s) && s > 0).toBe(true)
      expect(isBalanced(p, s)).toBe(true)
    }
  })

  it('operar nos dois lados mantém o equilíbrio até isolar x', () => {
    const semPesos = applyOperation(problem, { kind: 'subtrair', value: 3 }, 'ambos')!
    expect(semPesos).toEqual({ a: 2, b: 0, c: 8 })
    expect(isBalanced(semPesos, x)).toBe(true)
    const resolvido = applyOperation(semPesos, { kind: 'dividir', value: 2 }, 'ambos')!
    expect(resolvido).toEqual({ a: 1, b: 0, c: 4 })
    expect(isSolved(resolvido, x)).toBe(true)
    expect(formatEquation(resolvido, x)).toBe('x = 4')
  })

  it('operar em um lado só desequilibra a balança', () => {
    const torto = applyOperation(problem, { kind: 'subtrair', value: 1 }, 'esquerdo')!
    expect(isBalanced(torto, x)).toBe(false)
    expect(tilt(torto, x)).toBe(-1)
    expect(formatEquation(torto, x)).toBe('2x + 2 ≠ 11')
  })

  it('recusa operações sem peças inteiras', () => {
    expect(applyOperation(problem, { kind: 'dividir', value: 2 }, 'ambos')).toBeNull()
    expect(applyOperation(problem, { kind: 'subtrair', value: 4 }, 'ambos')).toBeNull()
  })
})

describe('Estatística', () => {
  const data = [7, 5, 9, 5, 8, 6]
  it('calcula média, mediana, moda e amplitude', () => {
    expect(mean(data)).toBe(40 / 6)
    expect(median(data)).toBe(6.5)
    expect(median([3, 1, 2])).toBe(2)
    expect(modes(data)).toEqual([5])
    expect(range(data)).toBe(4)
  })
  it('identifica conjuntos amodais e bimodais', () => {
    expect(modes([1, 2, 3])).toEqual([])
    expect(modes([1, 1, 2, 2, 3])).toEqual([1, 2])
    expect(describeModes([1, 2])).toMatch(/^Bimodal/)
  })
  it('conta frequências', () => {
    expect(frequencies([0, 2, 2], 0, 3)).toEqual([1, 0, 2, 0])
  })
})

describe('Funções', () => {
  it('função afim: raiz e crescimento', () => {
    expect(affineRoot(2, -4)).toBe(2)
    expect(affineRoot(0, 3)).toBeNull()
    expect(affineBehavior(-1)).toBe('decrescente')
    expect(evaluate('afim', { a: 2, b: 1, c: 0 }, 3)).toBe(7)
  })
  it('função quadrática: delta, raízes e vértice', () => {
    const f = { a: 1, b: -5, c: 6 }
    expect(discriminant(f)).toBe(1)
    expect(quadraticRoots(f)).toEqual([2, 3])
    expect(quadraticRoots({ a: 1, b: 2, c: 1 })).toEqual([-1])
    expect(quadraticRoots({ a: 1, b: 0, c: 1 })).toEqual([])
    expect(vertex(f)).toEqual({ x: 2.5, y: -0.25 })
    expect(evaluate('quadratica', f, 2)).toBe(0)
  })
  it('escreve a lei da função', () => {
    expect(formatLaw('quadratica', { a: 1, b: -5, c: 6 })).toBe('f(x) = x² − 5x + 6')
    expect(formatLaw('afim', { a: -1, b: 0, c: 0 })).toBe('f(x) = −x')
    expect(formatLaw('afim', { a: 0, b: 0, c: 0 })).toBe('f(x) = 0')
  })
})

describe('Progressões', () => {
  it('PA: termo geral e soma', () => {
    expect(paTerm(2, 3, 10)).toBe(29)
    expect(paSum(1, 1, 100)).toBe(5050)
    expect(terms('pa', 5, -2, 4)).toEqual([5, 3, 1, -1])
  })
  it('PG: termo geral e soma', () => {
    expect(pgTerm(3, 2, 5)).toBe(48)
    expect(pgSum(1, 2, 10)).toBe(1023)
    expect(sum('pg', 4, 1, 5)).toBe(20)
  })
  it('classifica as progressões', () => {
    expect(classify('pa', 1, 0)).toBe('constante')
    expect(classify('pg', 8, 0.5)).toBe('decrescente')
    expect(classify('pg', -1, 2)).toBe('decrescente')
    expect(classify('pg', 1, -2)).toMatch(/^oscilante/)
  })
})

describe('Trigonometria', () => {
  it('valores notáveis', () => {
    expect(sine(30)).toBe(0.5)
    expect(cosine(60)).toBe(0.5)
    expect(cosine(90)).toBe(0)
    expect(tangent(45)).toBe(1)
    expect(tangent(90)).toBeNull()
    expect(tangent(270)).toBeNull()
    expect(sine(180)).toBe(0)
  })
  it('sen² + cos² = 1 para qualquer ângulo', () => {
    for (let angle = 0; angle < 360; angle += 7) expect(sine(angle) ** 2 + cosine(angle) ** 2).toBeCloseTo(1, 8)
  })
  it('quadrantes e radianos', () => {
    expect(quadrant(120)).toBe(2)
    expect(quadrant(270)).toBe(0)
    expect(normalizeAngle(-30)).toBe(330)
    expect(radiansLabel(150)).toBe('5π/6')
    expect(radiansLabel(180)).toBe('π')
    expect(radiansLabel(90)).toBe('π/2')
  })
  it('valores exatos dos ângulos notáveis com sinal do quadrante', () => {
    expect(exactSine(150)).toBe('1/2')
    expect(exactCosine(150)).toBe('−√3/2')
    expect(exactTangent(225)).toBe('1')
    expect(exactTangent(300)).toBe('−√3')
    expect(exactSine(270)).toBe('−1')
    expect(exactCosine(90)).toBe('0')
    expect(exactSine(20)).toBeNull()
  })
})

describe('Probabilidade', () => {
  it('probabilidades teóricas somam 1', () => {
    for (const experiment of Object.values(experiments)) {
      expect(theoretical(experiment).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10)
    }
    expect(theoretical(experiments['dois-dados'])[5]).toBeCloseTo(1 / 6)
  })
  it('sorteios ficam dentro dos resultados possíveis', () => {
    const random = seeded()
    for (let i = 0; i < 500; i++) {
      const outcome = drawOutcome('dois-dados', random)
      expect(outcome).toBeGreaterThanOrEqual(0)
      expect(outcome).toBeLessThanOrEqual(10)
    }
  })
  it('com muitos lançamentos a frequência se aproxima da probabilidade', () => {
    const counts = runTrials('dado', 20000, Array(6).fill(0), seeded(7))
    expect(counts.reduce((a, b) => a + b, 0)).toBe(20000)
    expect(maxDeviation(experiments.dado, counts)).toBeLessThan(0.02)
    expect(relativeFrequencies([0, 0])).toEqual([0, 0])
  })
})
