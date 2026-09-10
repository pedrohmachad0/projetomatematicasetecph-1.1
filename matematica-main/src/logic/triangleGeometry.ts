export interface Point {
  x: number
  y: number
}

export interface AngleMarker {
  path: string
  label: Point
}

/**
 * Constrói um quadrado no lado externo da aresta p1-p2.
 * O terceiro vértice define o semiplano interno do triângulo.
 */
export function buildExternalSquare(p1: Point, p2: Point, oppositeVertex: Point): Point[] {
  const edge = { x: p2.x - p1.x, y: p2.y - p1.y }
  const perpendicular = { x: -edge.y, y: edge.x }
  const edgeMiddle = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }
  const towardTriangle = {
    x: oppositeVertex.x - edgeMiddle.x,
    y: oppositeVertex.y - edgeMiddle.y,
  }
  const pointsInside = perpendicular.x * towardTriangle.x + perpendicular.y * towardTriangle.y > 0
  const outward = pointsInside
    ? { x: -perpendicular.x, y: -perpendicular.y }
    : perpendicular

  return [
    p1,
    p2,
    { x: p2.x + outward.x, y: p2.y + outward.y },
    { x: p1.x + outward.x, y: p1.y + outward.y },
  ]
}

/** Cria o arco interno e a posição do rótulo de um ângulo em qualquer vértice. */
export function buildAngleMarker(
  vertex: Point,
  firstRayPoint: Point,
  secondRayPoint: Point,
  radius: number,
  labelDistance: number,
): AngleMarker {
  const firstLength = Math.hypot(firstRayPoint.x - vertex.x, firstRayPoint.y - vertex.y) || 1
  const secondLength = Math.hypot(secondRayPoint.x - vertex.x, secondRayPoint.y - vertex.y) || 1
  const firstUnit = {
    x: (firstRayPoint.x - vertex.x) / firstLength,
    y: (firstRayPoint.y - vertex.y) / firstLength,
  }
  const secondUnit = {
    x: (secondRayPoint.x - vertex.x) / secondLength,
    y: (secondRayPoint.y - vertex.y) / secondLength,
  }
  const start = { x: vertex.x + firstUnit.x * radius, y: vertex.y + firstUnit.y * radius }
  const end = { x: vertex.x + secondUnit.x * radius, y: vertex.y + secondUnit.y * radius }
  const cross = firstUnit.x * secondUnit.y - firstUnit.y * secondUnit.x
  const sweep = cross >= 0 ? 1 : 0
  const bisector = { x: firstUnit.x + secondUnit.x, y: firstUnit.y + secondUnit.y }
  const bisectorLength = Math.hypot(bisector.x, bisector.y) || 1

  return {
    path: `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${sweep} ${end.x} ${end.y}`,
    label: {
      x: vertex.x + (bisector.x / bisectorLength) * labelDistance,
      y: vertex.y + (bisector.y / bisectorLength) * labelDistance,
    },
  }
}
