import type { CreatureKind } from '../../data/quest'

export type CreatureMood = 'idle' | 'hurt' | 'laugh' | 'defeated'

interface Props {
  kind: CreatureKind
  color: string
  mood?: CreatureMood
  name: string
}

/** Escurece uma cor hexadecimal (#rrggbb) para contornos e sombras. */
function shade(hex: string, amount: number): string {
  const value = Number.parseInt(hex.slice(1), 16)
  const channel = (shift: number) => Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * (1 - amount))))
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`
}

function Eyes({ y, left, right, mood }: { y: number; left: number; right: number; mood: CreatureMood }) {
  if (mood === 'defeated')
    return <path stroke="#1f2a22" strokeWidth="3" d={`m${left - 3} ${y - 3} 6 6m0-6-6 6m${right - left} 0 6 6m0-6-6 6`} />
  return (
    <g>
      <path fill="#fffbe9" d={`M${left - 5} ${y - 5}h10v10h-10zM${right - 5} ${y - 5}h10v10h-10z`} />
      <path fill="#1f2a22" d={mood === 'hurt' ? `M${left - 4} ${y}h8v3h-8zM${right - 4} ${y}h8v3h-8z` : `M${left - 1} ${y - 3}h5v6h-5zM${right - 1} ${y - 3}h5v6h-5z`} />
    </g>
  )
}

function Mouth({ x, y, mood }: { x: number; y: number; mood: CreatureMood }) {
  if (mood === 'laugh') return <path fill="#3a2320" d={`M${x - 9} ${y}h18v8h-18z`} />
  if (mood === 'hurt') return <path fill="#3a2320" d={`M${x - 6} ${y + 2}h12v3h-12z`} />
  return <path fill="#3a2320" d={`M${x - 7} ${y}h14v3h-14z`} />
}

/** Monstros das fases comuns, desenhados em pixel art com a cor de cada fase. */
export default function PixelCreature({ kind, color, mood = 'idle', name }: Props) {
  const dark = shade(color, 0.45)
  const mid = shade(color, 0.2)
  const light = shade(color, -0.25)
  return (
    <svg className={`pixel-creature creature-${kind} ogre-${mood}`} viewBox="0 0 120 110" shapeRendering="crispEdges" role="img" aria-label={`${name}${mood === 'defeated' ? ', derrotado' : mood === 'laugh' ? ', zombando' : mood === 'hurt' ? ', atingido' : ''}`}>
      <ellipse cx="60" cy="102" rx="38" ry="6" fill="#182d2455" />
      <g className="ogre-body">
        {kind === 'slime' && (
          <g>
            <path fill={dark} d="M40 30h40v8h10v10h8v16h6v30H16V64h6V48h8V38h10z" />
            <path fill={color} d="M42 36h36v8h10v10h8v14h4v22H20V68h4V54h8V44h10z" />
            <path fill={light} d="M46 40h14v6H46zM34 50h8v8h-8z" />
            <path fill={mid} d="M24 84h72v6H24z" />
            <Eyes y={62} left={46} right={70} mood={mood} />
            <Mouth x={60} y={76} mood={mood} />
          </g>
        )}
        {kind === 'bat' && (
          <g className="creature-wings">
            <path fill={dark} d="M4 30h14v8h10v8h8V36h48v10h8v-8h10v-8h14v34h-8v8h-10v8h-12v10H38V80H26v-8H16v-8H4z" />
            <path fill={color} d="M8 36h8v8h10v8h10V42h48v10h10v-8h10v-8h8v24h-6v8h-10v8H82v10H38V76H26v-8H16v-8H8z" />
            <path fill={mid} d="M8 52h10v8H8zM102 52h10v8h-10z" />
            <path fill={light} d="M44 46h12v6H44z" />
            <path fill={dark} d="M44 34h8v-8h4v10zM68 34h8V26h-4v10z" />
            <Eyes y={58} left={50} right={70} mood={mood} />
            <Mouth x={60} y={70} mood={mood} />
          </g>
        )}
        {kind === 'mushroom' && (
          <g>
            <path fill={dark} d="M36 10h48v8h12v8h8v14h6v14H10V40h6V26h8v-8h12z" />
            <path fill={color} d="M38 14h44v8h12v8h8v12h4v8H14v-8h4V30h8v-8h12z" />
            <path fill="#f1e3b5" d="M30 26h12v8H30zM60 18h12v8H60zM84 34h10v8H84zM48 36h8v6h-8z" />
            <path fill="#5b4a37" d="M32 54h56v44H32z" />
            <path fill="#e6d3a3" d="M36 54h48v40H36z" />
            <Eyes y={68} left={50} right={70} mood={mood} />
            <Mouth x={60} y={80} mood={mood} />
          </g>
        )}
        {kind === 'golem' && (
          <g>
            <path fill={dark} d="M34 14h52v10h10v24h12v30h-12v20H24V78H12V48h12V24h10z" />
            <path fill={color} d="M38 18h44v10h10v54H28V28h10zM16 52h10v22H16zM94 52h10v22H94z" />
            <path fill={mid} d="M38 50h10v8H38zM66 40h14v6H66zM44 72h30v6H44z" />
            <path fill={light} d="M40 22h18v6H40z" />
            <path fill="#e7c46f" d="M57 30h6v6h-6z" />
            <path fill={dark} d="M32 92h22v6H32zM66 92h22v6H66z" />
            <Eyes y={50} left={50} right={70} mood={mood} />
            <Mouth x={60} y={62} mood={mood} />
          </g>
        )}
      </g>
    </svg>
  )
}
