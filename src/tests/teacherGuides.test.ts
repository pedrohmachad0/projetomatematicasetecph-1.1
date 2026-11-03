import { describe, expect, it } from 'vitest'
import { mathContents } from '../data/mathContent'
import { teacherGuides } from '../data/teacherGuides'

describe('guia do professor', () => {
  it.each(mathContents.filter((item) => item.available).map((item) => [item.id]))('o simulador %s tem roteiro completo', (id) => {
    const guide = teacherGuides[id as keyof typeof teacherGuides]
    expect(guide).toBeDefined()
    expect(guide.objective.length).toBeGreaterThan(20)
    expect(guide.plan.length).toBeGreaterThanOrEqual(3)
    expect(guide.questions.length).toBeGreaterThanOrEqual(3)
    expect(guide.mistakes.length).toBeGreaterThanOrEqual(2)
    expect(guide.minutes).toBeGreaterThan(0)
  })
})
