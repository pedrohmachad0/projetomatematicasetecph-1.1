/** Direções de movimento do mapa, teclas e câmera. */

export type Direction = 'up' | 'down' | 'left' | 'right'

export const directionDelta: Record<Direction, [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
}

const keyDirections: Record<string, Direction> = {
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

export const keyToDirection = (key: string): Direction | undefined => keyDirections[key.toLowerCase()]

/**
 * Câmera: desloca o mundo para centralizar o herói, sem mostrar além das bordas.
 * `startPad` deixa uma folga antes da borda (espaço do painel de missões).
 * Valores em pixels de tela.
 */
export function cameraOffset(hero: number, tile: number, worldTiles: number, viewport: number, startPad = 0): number {
  const world = worldTiles * tile
  if (world + startPad <= viewport) return (world - viewport - startPad) / 2
  return Math.min(world - viewport, Math.max(-startPad, hero * tile + tile / 2 - viewport / 2)) + 0
}
