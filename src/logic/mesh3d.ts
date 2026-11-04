/** Malhas simples (vértices + faces) dos sólidos, centradas na origem, com y para cima. */
import type { Solid, SolidSize } from './espacial'

export interface Mesh {
  vertices: number[][]
  faces: number[][]
  edges: Array<[number, number]>
  /** Superfícies curvas: as arestas entre faces não são desenhadas. */
  smooth: boolean
}

const SEGMENTS = 28

function box(w: number, h: number, d: number): Mesh {
  const [x, y, z] = [w / 2, h / 2, d / 2]
  const vertices = [
    [-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],
    [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z],
  ]
  const faces = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [3, 2, 6, 7], [0, 3, 7, 4], [1, 2, 6, 5]]
  const edges: Array<[number, number]> = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
  return { vertices, faces, edges, smooth: false }
}

function cylinder(r: number, h: number, topR = r): Mesh {
  const vertices: number[][] = []
  for (let i = 0; i < SEGMENTS; i++) {
    const a = (i / SEGMENTS) * Math.PI * 2
    vertices.push([r * Math.cos(a), -h / 2, r * Math.sin(a)])
  }
  for (let i = 0; i < SEGMENTS; i++) {
    const a = (i / SEGMENTS) * Math.PI * 2
    vertices.push([topR * Math.cos(a), h / 2, topR * Math.sin(a)])
  }
  const faces: number[][] = []
  for (let i = 0; i < SEGMENTS; i++) {
    const j = (i + 1) % SEGMENTS
    faces.push([i, j, SEGMENTS + j, SEGMENTS + i])
  }
  faces.push(Array.from({ length: SEGMENTS }, (_, i) => i))
  faces.push(Array.from({ length: SEGMENTS }, (_, i) => SEGMENTS + i))
  const edges: Array<[number, number]> = []
  for (let i = 0; i < SEGMENTS; i++) {
    const j = (i + 1) % SEGMENTS
    edges.push([i, j], [SEGMENTS + i, SEGMENTS + j])
  }
  edges.push([0, SEGMENTS], [SEGMENTS / 2, SEGMENTS + SEGMENTS / 2])
  return { vertices, faces, edges, smooth: true }
}

function cone(r: number, h: number): Mesh {
  const vertices: number[][] = []
  for (let i = 0; i < SEGMENTS; i++) {
    const a = (i / SEGMENTS) * Math.PI * 2
    vertices.push([r * Math.cos(a), -h / 2, r * Math.sin(a)])
  }
  vertices.push([0, h / 2, 0])
  const apex = SEGMENTS
  const faces: number[][] = []
  for (let i = 0; i < SEGMENTS; i++) faces.push([i, (i + 1) % SEGMENTS, apex])
  faces.push(Array.from({ length: SEGMENTS }, (_, i) => i))
  return { vertices, faces, edges: [], smooth: true }
}

function pyramid(a: number, h: number): Mesh {
  const s = a / 2
  const vertices = [[-s, -h / 2, -s], [s, -h / 2, -s], [s, -h / 2, s], [-s, -h / 2, s], [0, h / 2, 0]]
  const faces = [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]]
  return { vertices, faces, edges: [], smooth: false }
}

function sphere(r: number): Mesh {
  const rings = 12
  const vertices: number[][] = []
  for (let i = 0; i <= rings; i++) {
    const phi = (i / rings) * Math.PI
    for (let j = 0; j < SEGMENTS; j++) {
      const t = (j / SEGMENTS) * Math.PI * 2
      vertices.push([r * Math.sin(phi) * Math.cos(t), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(t)])
    }
  }
  const faces: number[][] = []
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < SEGMENTS; j++) {
      const k = (j + 1) % SEGMENTS
      const quad = [i * SEGMENTS + j, i * SEGMENTS + k, (i + 1) * SEGMENTS + k, (i + 1) * SEGMENTS + j]
      // Nos polos a face vira triângulo: tira o vértice repetido.
      faces.push(i === 0 ? [quad[0], quad[2], quad[3]] : i === rings - 1 ? [quad[0], quad[1], quad[2]] : quad)
    }
  }
  return { vertices, faces, edges: [], smooth: true }
}

export function solidMesh(solid: Solid, { a, b, h, r }: SolidSize): Mesh {
  switch (solid) {
    case 'cubo':
      return box(a, a, a)
    case 'paralelepipedo':
      return box(a, h, b)
    case 'cilindro':
      return cylinder(r, h)
    case 'cone':
      return cone(r, h)
    case 'piramide':
      return pyramid(a, h)
    case 'esfera':
      return sphere(r)
  }
}

/** Sólido "parceiro" para comparar volumes: cilindro do cone, prisma da pirâmide, cilindro da esfera. */
export function companionMesh(solid: Solid, size: SolidSize): Mesh | null {
  if (solid === 'cone') return cylinder(size.r, size.h)
  if (solid === 'piramide') return box(size.a, size.h, size.a)
  if (solid === 'esfera') return cylinder(size.r, 2 * size.r)
  return null
}
