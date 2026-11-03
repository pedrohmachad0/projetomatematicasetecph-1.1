import { memo } from 'react'
import type { BookTheme } from '../../data/questBooks'
import { terrainPalettes } from '../../data/terrainPalettes'
import type { QuestMap, Tile } from '../../logic/questMap'

/** Cada casa do mapa é desenhada numa grade de 16 × 16 pixels. */
export const TILE_PX = 16

const hash = (x: number, y: number, salt = 0) => {
  let h = (x * 374761393 + y * 668265263 + salt * 2147483647) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

const isWater = (tile: Tile | undefined) => tile === 'water' || tile === 'gate'
const isPath = (tile: Tile | undefined) => tile === 'path'

interface Props {
  map: QuestMap
  theme: BookTheme
}

/** Chão do mapa: grama com tufos, flores, trilhas com bordas, água com ondas e margens. */
function MapTerrain({ map, theme }: Props) {
  const p = terrainPalettes[theme]
  const rects: Array<[number, number, number, number, string, string?]> = []
  const add = (x: number, y: number, w: number, h: number, fill: string, cls?: string) => rects.push([x, y, w, h, fill, cls])
  const at = (x: number, y: number) => map.tiles[y]?.[x]

  map.tiles.forEach((row, y) =>
    row.forEach((tile, x) => {
      const ox = x * TILE_PX
      const oy = y * TILE_PX
      if (isWater(tile)) {
        add(ox, oy, 16, 16, p.water[1])
        add(ox, oy + 12, 16, 4, p.water[0])
        for (let i = 0; i < 2; i++) {
          const wx = Math.floor(hash(x, y, i) * 11)
          const wy = 2 + Math.floor(hash(x, y, i + 7) * 9)
          add(ox + wx, oy + wy, 4, 1, p.water[2], 'wave')
          add(ox + wx + 1, oy + wy + 1, 2, 1, p.water[2], 'wave')
        }
        // Espuma onde a água encosta na terra.
        if (!isWater(at(x - 1, y))) add(ox, oy, 2, 16, p.water[2])
        if (!isWater(at(x + 1, y))) add(ox + 14, oy, 2, 16, p.water[2])
        if (!isWater(at(x, y - 1))) add(ox, oy, 16, 2, p.water[2])
        if (!isWater(at(x, y + 1))) add(ox, oy + 14, 16, 2, p.water[2])
        return
      }
      if (isPath(tile)) {
        add(ox, oy, 16, 16, p.path[1])
        for (let i = 0; i < 3; i++) {
          const px = 1 + Math.floor(hash(x, y, i + 20) * 12)
          const py = 1 + Math.floor(hash(x, y, i + 30) * 12)
          add(ox + px, oy + py, 2, 1, p.path[0])
          add(ox + px, oy + py - 1, 2, 1, p.path[2])
        }
        // Bordas da trilha: a grama invade com um contorno irregular.
        const edge = (side: 'l' | 'r' | 't' | 'b') => {
          for (let i = 0; i < 16; i += 2) {
            const depth = 1 + Math.floor(hash(x * 3 + i, y * 5, side.charCodeAt(0)) * 2)
            if (side === 'l') add(ox, oy + i, depth, 2, p.grass[1])
            if (side === 'r') add(ox + 16 - depth, oy + i, depth, 2, p.grass[1])
            if (side === 't') add(ox + i, oy, 2, depth, p.grass[1])
            if (side === 'b') add(ox + i, oy + 16 - depth, 2, depth, p.grass[1])
          }
        }
        const pathLike = (t: Tile | undefined) => isPath(t) || isWater(t)
        if (!pathLike(at(x - 1, y))) edge('l')
        if (!pathLike(at(x + 1, y))) edge('r')
        if (!pathLike(at(x, y - 1))) edge('t')
        if (!pathLike(at(x, y + 1))) edge('b')
        return
      }
      // Grama (também por baixo de obstáculos e flores).
      add(ox, oy, 16, 16, p.grass[1])
      // Manchas de grama mais clara, em grupos irregulares (sem formar xadrez).
      if (hash(Math.floor(x / 3), Math.floor(y / 2), 5) < 0.35) {
        const bx = ox + Math.floor(hash(x, y, 8) * 5)
        const by = oy + Math.floor(hash(x, y, 9) * 5)
        add(bx + 3, by, 6, 2, p.grass[2])
        add(bx, by + 2, 11, 4, p.grass[2])
        add(bx + 2, by + 6, 7, 2, p.grass[2])
        add(bx + 4, by + 8, 3, 1, p.grass[2])
      }
      for (let i = 0; i < 3; i++) {
        const gx = 1 + Math.floor(hash(x, y, i + 40) * 13)
        const gy = 2 + Math.floor(hash(x, y, i + 50) * 12)
        add(ox + gx, oy + gy, 1, 2, p.grass[0])
        add(ox + gx + 1, oy + gy - 1, 1, 2, p.grass[3])
      }
      // Margem de areia ao lado da água.
      if (isWater(at(x + 1, y))) add(ox + 13, oy, 3, 16, p.shore)
      if (isWater(at(x - 1, y))) add(ox, oy, 3, 16, p.shore)
      if (isWater(at(x, y + 1))) add(ox, oy + 13, 16, 3, p.shore)
      if (isWater(at(x, y - 1))) add(ox, oy, 16, 3, p.shore)
      if (tile === 'decor') {
        for (let i = 0; i < 3; i++) {
          const fx = 2 + Math.floor(hash(x, y, i + 60) * 10)
          const fy = 3 + Math.floor(hash(x, y, i + 70) * 9)
          add(ox + fx, oy + fy + 2, 1, 2, p.grass[0])
          add(ox + fx - 1, oy + fy, 3, 2, p.flower[i % 2])
          add(ox + fx, oy + fy, 1, 1, p.flower[(i + 1) % 2])
        }
      }
      // Sombra de contato aos pés de árvores e construções.
      if (tile === 'obstacle') add(ox + 2, oy + 12, 12, 3, p.grass[0])
    }),
  )

  const width = map.tiles[0].length * TILE_PX
  const height = map.tiles.length * TILE_PX
  return (
    <svg className="map-terrain" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
      {rects.map(([x, y, w, h, fill, cls], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={fill} className={cls} />
      ))}
    </svg>
  )
}

export default memo(MapTerrain)
