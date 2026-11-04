import { describe, expect, it } from 'vitest'
import { questBooks, guardianQuestions } from '../data/questBooks'
import { answerMatches } from '../logic/chapter'
import { topicBattle, topicGenerators, topicQuestion, type TopicId } from '../logic/questTopics'
import { findPath, generateQuestMap, mapSeed, reachable, requiredMissions, seededRandom, MAP_HEIGHT, MAP_WIDTH } from '../logic/questMap'
import { exactCosine, exactSine } from '../logic/trigonometria'

/** Resolve a pergunta a partir da expressão, de forma independente do gerador. */
function solve(topic: TopicId, expression: string, instruction: string): string | null {
  const nums = (expression.match(/\d+/g) ?? []).map(Number)
  const listMatch = /^[\d, ]+$/.test(expression)
  switch (topic) {
    case 'soma-10':
    case 'soma-20':
    case 'subtracao-10':
    case 'subtracao-20':
    case 'misto-30':
    case 'mental-50':
    case 'mult-2-3':
    case 'mult-4-5':
    case 'revisao': {
      const [a, op, b] = expression.replace(' = ?', '').split(' ')
      return String(op === '+' ? +a + +b : op === '−' ? +a - +b : +a * +b)
    }
    case 'combinadas':
      return String(nums[0] + nums[1] * nums[2])
    case 'fracao-equivalente': {
      const [a, b, d] = nums
      return String((a * d) / b)
    }
    case 'porcentagem':
      return String((nums[0] * nums[1]) / 100)
    case 'desconto': {
      const [value, p] = nums
      return String(expression.includes('+') ? value + (value * p) / 100 : value - (value * p) / 100)
    }
    case 'equacao': {
      const [left, right] = expression.split(' = ')
      const a = /^(\d*)x/.exec(left)![1]
      const b = /\+ (\d+)/.exec(left)?.[1] ?? '0'
      return String((+right - +b) / (a ? +a : 1))
    }
    case 'media':
      return listMatch ? String(nums.reduce((s, v) => s + v, 0) / nums.length) : null
    case 'mediana':
      return String([...nums].sort((a, b) => a - b)[2])
    case 'moda': {
      const counts = new Map<number, number>()
      for (const n of nums) counts.set(n, (counts.get(n) ?? 0) + 1)
      return String([...counts].sort((a, b) => b[1] - a[1])[0][0])
    }
    case 'pitagoras': {
      if (expression.includes('?²')) {
        const [a, b] = nums.filter((n) => n !== 2)
        if (expression.startsWith(`${a}² + ?²`)) return String(Math.sqrt(b * b - a * a))
        return String(Math.sqrt(a * a + b * b))
      }
      return null
    }
    case 'triangulo':
      return nums[0] < 90 ? 'Acutângulo' : nums[0] === 90 ? 'Retângulo' : 'Obtusângulo'
    case 'circulo': {
      const r = nums[0]
      if (instruction.includes('diâmetro')) return String(2 * r)
      const value = instruction.match(/comprimento|volta|corda/) ? 2 * 3.14 * r : 3.14 * r * r
      return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
    }
    case 'trigonometria':
      return expression.startsWith('sen') ? exactSine(nums[0]) : exactCosine(nums[0])
    case 'funcao-valor': {
      const m = /f\(x\) = (\d*)x(?: \+ (\d+))?; f\((\d+)\)/.exec(expression)!
      return String((m[1] ? +m[1] : 1) * +m[3] + (m[2] ? +m[2] : 0))
    }
    case 'funcao-raiz': {
      const m = /f\(x\) = (\d*)x − (\d+)/.exec(expression)!
      return String(+m[2] / (m[1] ? +m[1] : 1))
    }
    case 'pa': {
      const n = +/(\d+)º/.exec(instruction)![1]
      return String(nums[0] + (n - 1) * (nums[1] - nums[0]))
    }
    case 'pg': {
      const n = +/(\d+)ª|(\d+)º/.exec(instruction)!.slice(1).find(Boolean)!
      return String(nums[0] * (nums[1] / nums[0]) ** (n - 1))
    }
    default:
      return null
  }
}

describe('Mundo do MathQuest', () => {
  it('tem cinco livros, com chefão na última fase e simuladores ligados', () => {
    expect(questBooks).toHaveLength(5)
    expect(questBooks[0].phases).toHaveLength(10)
    for (const book of questBooks.slice(1)) expect(book.phases).toHaveLength(6)
    expect(guardianQuestions(questBooks[1], 6)).toBe(10)
    expect(guardianQuestions(questBooks[1], 5)).toBe(8)
    expect(questBooks.flatMap((book) => book.phases).filter((phase) => phase.simulator).length).toBeGreaterThanOrEqual(25)
  })

  it('todas as fases geram um mapa jogável: tudo ao alcance e o guardião só depois do portão', () => {
    questBooks.forEach((book, bookIndex) =>
      book.phases.forEach((_, i) => {
        const map = generateQuestMap(mapSeed(bookIndex, i + 1), { monsters: i + 1 === book.phases.length ? 3 : 2, minionKinds: book.minions.length, villagers: 1 })
        expect(map.tiles).toHaveLength(MAP_HEIGHT)
        expect(map.tiles[0]).toHaveLength(MAP_WIDTH)
        const blocked = new Set(map.entities.map((e) => `${e.x},${e.y}`))
        const guardian = map.entities.find((e) => e.type === 'guardian')!
        expect(findPath(map, map.start, guardian, blocked, false)).toBeNull()
        expect(findPath(map, map.start, guardian, blocked, true)).not.toBeNull()
        for (const entity of map.entities) expect(findPath(map, map.start, entity, blocked, true)).not.toBeNull()
        expect(reachable(map, map.start, blocked, false).has(`${map.gate.x + 1},${map.gate.y}`)).toBe(false)
        expect(requiredMissions(map)).toContain('portao')
      }),
    )
  })

  it('os mapas são sempre os mesmos para a mesma fase', () => {
    const options = { monsters: 2, minionKinds: 3, villagers: 1 }
    expect(generateQuestMap(205, options)).toEqual(generateQuestMap(205, options))
    expect(generateQuestMap(205, options)).not.toEqual(generateQuestMap(206, options))
  })

  it('todas as perguntas de todos os assuntos têm resposta correta e alternativas válidas', () => {
    const random = seededRandom(99)
    for (const topic of Object.keys(topicGenerators) as TopicId[])
      for (let i = 0; i < 120; i++) {
        const q = topicGenerators[topic](random, i % 2 === 0)
        expect(q.explanation.length).toBeGreaterThan(10)
        expect(q.hint && q.hint.length).toBeGreaterThan(10)
        if (q.kind === 'input') {
          expect(q.answer).toMatch(/^\d+$/)
          expect(answerMatches(q, q.answer)).toBe(true)
        } else {
          expect(q.choices).toContain(q.answer)
          expect(new Set(q.choices).size).toBe(q.choices!.length)
          expect(q.choices!.length).toBeGreaterThanOrEqual(3)
        }
        const expected = solve(topic, q.expression, q.instruction)
        if (expected !== null) expect(q.answer, `${topic} · ${q.instruction} · ${q.expression}`).toBe(expected)
      }
  })

  it('a batalha contra o guardião não repete perguntas', () => {
    for (const book of questBooks)
      for (const phase of book.phases) {
        const battle = topicBattle(phase.topics, 10, seededRandom(3))
        expect(battle).toHaveLength(10)
        expect(new Set(battle.map((q) => q.instruction + q.expression)).size).toBe(10)
      }
    expect(topicQuestion(['fracao-parte'], seededRandom(1)).kind).toBe('choice')
  })
})
