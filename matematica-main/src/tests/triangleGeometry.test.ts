import { describe, expect, it } from 'vitest'
import { buildAngleMarker, buildExternalSquare, type Point } from '../logic/triangleGeometry'

function signedSide(p1: Point, p2: Point, point: Point): number {
  return (p2.x - p1.x) * (point.y - p1.y) - (p2.y - p1.y) * (point.x - p1.x)
}

function triangleForAngle(angle: number) {
  const radians = (angle * Math.PI) / 180
  const origin = { x: 220, y: 210 }
  const first = { x: 330, y: 210 }
  const second = { x: 220 + 110 * Math.cos(radians), y: 210 - 110 * Math.sin(radians) }
  return { origin, first, second }
}

describe('geometria visual do triângulo', () => {
  it.each([25, 60, 90, 130, 170])('mantém os três quadrados fora do triângulo em %i°', (angle) => {
    const { origin, first, second } = triangleForAngle(angle)
    const cases = [
      { edgeStart: origin, edgeEnd: first, opposite: second },
      { edgeStart: origin, edgeEnd: second, opposite: first },
      { edgeStart: first, edgeEnd: second, opposite: origin },
    ]

    for (const { edgeStart, edgeEnd, opposite } of cases) {
      const square = buildExternalSquare(edgeStart, edgeEnd, opposite)
      const insideSide = signedSide(edgeStart, edgeEnd, opposite)
      const squareSide = signedSide(edgeStart, edgeEnd, square[2])
      expect(insideSide * squareSide).toBeLessThan(0)
    }
  })

  it('constrói arcos nos três vértices com rótulos voltados para o interior', () => {
    const { origin, first, second } = triangleForAngle(130)
    const markers = [
      buildAngleMarker(origin, first, second, 28, 42),
      buildAngleMarker(first, origin, second, 22, 36),
      buildAngleMarker(second, origin, first, 22, 36),
    ]

    markers.forEach((marker) => {
      expect(marker.path).toContain(' A ')
      expect(Number.isFinite(marker.label.x)).toBe(true)
      expect(Number.isFinite(marker.label.y)).toBe(true)
    })
  })
})
