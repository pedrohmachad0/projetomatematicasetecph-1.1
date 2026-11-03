import type { SVGProps } from 'react'

interface Props extends Omit<SVGProps<SVGGElement>, 'children'> {
  rows: readonly string[]
  palette: Record<string, string>
  x?: number
  y?: number
}

/**
 * Desenha um sprite a partir de linhas de texto. Pixels vizinhos da mesma cor
 * viram um único retângulo, o que deixa o SVG leve.
 */
export default function PixelSprite({ rows, palette, x = 0, y = 0, ...rest }: Props) {
  const rects: { x: number; y: number; w: number; fill: string }[] = []
  rows.forEach((row, rowIndex) => {
    let start = 0
    for (let i = 1; i <= row.length; i++) {
      if (i < row.length && row[i] === row[start]) continue
      const char = row[start]
      const fill = palette[char]
      if (char !== '.' && fill) rects.push({ x: x + start, y: y + rowIndex, w: i - start, fill })
      start = i
    }
  })
  return (
    <g {...rest}>
      {rects.map((rect, i) => (
        <rect key={i} x={rect.x} y={rect.y} width={rect.w} height={1} fill={rect.fill} />
      ))}
    </g>
  )
}
