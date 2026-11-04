/**
 * Teorema de Tales: retas paralelas cortadas por duas transversais
 * determinam segmentos proporcionais. Se a/b = c/d, então d = b·c/a.
 */
export function talesMissing(a: number, b: number, c: number): number {
  return (b * c) / a
}

/**
 * Pontos de três paralelas horizontais (y1 < y2 < y3) cortadas por duas
 * transversais que passam por (top, 0) e têm inclinações `s1` e `s2`.
 * Devolve os segmentos cortados em cada transversal (medidos ao longo dela).
 */
export function talesSegments(ys: [number, number, number], s1: number, s2: number) {
  const len = (s: number, dy: number) => Math.hypot(s * dy, dy)
  const [y1, y2, y3] = ys
  return {
    a: len(s1, y2 - y1),
    b: len(s1, y3 - y2),
    c: len(s2, y2 - y1),
    d: len(s2, y3 - y2),
  }
}
