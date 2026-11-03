import type { CreatureKind } from '../../data/quest'
import { batSprite, golemSprite, mushroomSprite, slimeSprite } from '../../data/sprites'
import PixelSprite from './PixelSprite'
import { shade } from '../../logic/color'

export type CreatureMood = 'idle' | 'hurt' | 'laugh' | 'defeated'

interface Props {
  kind: CreatureKind
  color: string
  mood?: CreatureMood
  name: string
}

const fixed = { k: '#1d2420', w: '#fffbe9', r: '#c2413a', t: '#f5f1df', p: '#f29e9e', y: '#f4c14a', g: '#fff1a8', s: '#efe0b6', S: '#cdb582' }

const eyes: Record<CreatureMood, string[]> = {
  idle: ['kw', 'kk', 'kk'],
  hurt: ['..', 'kk', '..'],
  laugh: ['kk', 'k.', '..'],
  defeated: ['k.k', '.k.', 'k.k'],
}

const mouths: Record<CreatureMood, string[]> = {
  idle: ['kkkk'],
  hurt: ['.kk.', 'k..k'],
  laugh: ['kkkkkk', 'krrrrk', '.kkkk.'],
  defeated: ['kkkk'],
}

interface Layout {
  rows: string[]
  width: number
  height: number
  leftEye: [number, number]
  rightEye: [number, number]
  mouth: [number, number]
  cheeks?: [number, number][]
  fangs?: boolean
}

const layouts: Record<CreatureKind, Layout> = {
  slime: { rows: slimeSprite, width: 24, height: 18, leftEye: [8, 8], rightEye: [14, 8], mouth: [12, 12], cheeks: [[6, 11], [17, 11]] },
  bat: { rows: batSprite, width: 28, height: 18, leftEye: [12, 7], rightEye: [18, 7], mouth: [15, 11], fangs: true },
  mushroom: { rows: mushroomSprite, width: 24, height: 21, leftEye: [8, 14], rightEye: [14, 14], mouth: [12, 17], cheeks: [[6, 16], [17, 16]] },
  golem: { rows: golemSprite, width: 24, height: 20, leftEye: [9, 3], rightEye: [13, 3], mouth: [12, 5] },
}

/** Monstros do MathQuest em pixel art, coloridos com a cor de cada fase. */
export default function PixelCreature({ kind, color, mood = 'idle', name }: Props) {
  const layout = layouts[kind]
  const palette = { ...fixed, o: shade(color, 0.62), d: shade(color, 0.3), b: color, l: shade(color, -0.3), h: shade(color, -0.62) }
  const mouth = mouths[mood]
  const eyePattern = eyes[mood]
  const eyeShift = mood === 'defeated' ? -1 : 0
  const pad = 2
  return (
    <svg
      className={`pixel-creature creature-${kind} ogre-${mood}`}
      viewBox={`${-pad} ${-pad} ${layout.width + pad * 2} ${layout.height + pad * 2 + 2}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`${name}${mood === 'defeated' ? ', derrotado' : mood === 'laugh' ? ', zombando' : mood === 'hurt' ? ', atingido' : ''}`}
    >
      <ellipse cx={layout.width / 2} cy={layout.height + 1} rx={layout.width * 0.38} ry={1.4} fill="#182d2455" />
      <g className={`ogre-body ${kind === 'bat' ? 'creature-wings' : ''}`}>
        <PixelSprite rows={layout.rows} palette={palette} />
        <PixelSprite rows={eyePattern} palette={palette} x={layout.leftEye[0] + eyeShift} y={layout.leftEye[1]} />
        <PixelSprite rows={eyePattern} palette={palette} x={layout.rightEye[0] + eyeShift} y={layout.rightEye[1]} />
        <PixelSprite rows={mouth} palette={palette} x={layout.mouth[0] - Math.floor(mouth[0].length / 2)} y={layout.mouth[1]} />
        {layout.fangs && mood !== 'defeated' && <PixelSprite rows={['t..t']} palette={palette} x={layout.mouth[0] - 2} y={layout.mouth[1] + (mood === 'laugh' ? 3 : 1)} />}
        {layout.cheeks?.map(([x, y]) => <PixelSprite key={x} rows={['pp']} palette={palette} x={x} y={y} opacity={0.75} />)}
      </g>
    </svg>
  )
}
