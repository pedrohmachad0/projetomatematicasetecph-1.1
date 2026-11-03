import type { BookTheme } from '../../data/questBooks'
import { heroBackSprite, heroPalette, heroSprite, villagerSprite } from '../../data/sprites'
import PixelSprite from './PixelSprite'

/** Sprites pequenos do mapa de exploração, em pixel art (16 × 16). */

/** Herói do mapa: de frente, de lado (espelhado) ou de costas, conforme a direção. */
export function HeroSprite({ facing }: { facing: 'left' | 'right' | 'up' | 'down' }) {
  if (facing === 'up')
    return (
      <svg viewBox="0 0 20 21" shapeRendering="crispEdges" className="hero-sprite facing-up" aria-hidden="true">
        <PixelSprite rows={heroBackSprite} palette={heroPalette} />
      </svg>
    )
  return (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className={`hero-sprite facing-${facing}`} aria-hidden="true">
      <PixelSprite rows={heroSprite} palette={heroPalette} />
    </svg>
  )
}

/** Herói visto de costas, usado na batalha. */
export function HeroBattleSprite({ state }: { state: 'idle' | 'attack' | 'hurt' | 'dodge' }) {
  return (
    <svg viewBox="-1 -1 22 24" shapeRendering="crispEdges" className={`hero-battle hero-${state}`} role="img" aria-label="Seu aventureiro">
      <ellipse cx="10" cy="21.5" rx="8" ry="1.3" fill="#182d2455" />
      <PixelSprite rows={heroBackSprite} palette={heroPalette} />
      <PixelSprite rows={['oo', 'ww', 'ww', 'ww', 'ww', 'ww', 'yy', 'dd']} palette={{ o: '#22302a', w: '#d9e2d2', y: '#e2b04a', d: '#6b4626' }} x={18} y={5} />
    </svg>
  )
}

const villagerPalettes = [
  { o: '#2a2320', h: '#3a2a20', s: '#e9b98f', k: '#1d2420', p: '#e98b8b', c: '#b0537a', w: '#fff3d0', d: '#4b3a2a', B: '#2f241b' },
  { o: '#20262e', h: '#c9b27e', s: '#d9a273', k: '#1d2420', p: '#e98b8b', c: '#4d7aa8', w: '#f0f4f8', d: '#3a4350', B: '#2a2f36' },
  { o: '#2a2320', h: '#8a8f99', s: '#f1c39b', k: '#1d2420', p: '#e98b8b', c: '#c8703f', w: '#fff3d0', d: '#5a3d24', B: '#2f241b' },
]

export function VillagerSprite({ variant }: { variant: number }) {
  return (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <PixelSprite rows={villagerSprite} palette={villagerPalettes[variant % villagerPalettes.length]} />
    </svg>
  )
}

export function SignSprite() {
  return (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="#5a3d24" d="M7 9h2v6H7z" />
      <path fill="#7a5230" d="M2 3h12v7H2z" />
      <path fill="#c8a06a" d="M3 4h10v5H3z" />
      <path fill="#5a3d24" d="M4 5h6v1H4zM4 7h8v1H4z" />
    </svg>
  )
}

export function ChestSprite({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="#4a2f1c" d={open ? 'M2 4h12v3H2z' : 'M2 5h12v4H2z'} />
      <path fill="#8a5a30" d={open ? 'M3 5h10v1H3z' : 'M3 6h10v2H3z'} />
      <path fill="#4a2f1c" d="M2 8h12v6H2z" />
      <path fill="#a86d3a" d="M3 9h10v4H3z" />
      <path fill="#e3b341" d={open ? 'M4 7h8v2H4z' : 'M7 8h2v3H7z'} />
    </svg>
  )
}

export function GateSprite({ open, theme }: { open: boolean; theme: BookTheme }) {
  if (theme === 'village' || theme === 'temple' || theme === 'city') {
    const wood = theme === 'temple' ? '#b59b6a' : theme === 'city' ? '#d9534f' : '#7a5230'
    return (
      <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        {open ? (
          <path fill={wood} opacity=".55" d="M1 2h2v13H1zM13 2h2v13h-2z" />
        ) : (
          <>
            <path fill="#3d2b1c" d="M1 2h14v13H1z" />
            <path fill={wood} d="M2 3h12v11H2z" />
            <path fill="#3d2b1c" d="M5 3h1v11H5zM10 3h1v11h-1zM2 8h12v1H2z" />
            <path fill="#e3b341" d="M7 7h2v3H7z" />
          </>
        )}
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="#5a3d24" d="M0 3h16v1H0zM0 12h16v1H0z" />
      {open ? (
        <path fill="#a8763f" d="M1 4h14v8H1z M1 6h14v1H1z" />
      ) : (
        <>
          <path fill="#a8763f" d="M1 4h4v8H1zM11 4h4v8h-4z" />
          <path fill="#6b4626" d="M5 5h1v2H5zM10 8h1v3h-1z" />
        </>
      )}
      <path fill="#6b4626" d={open ? 'M4 4h1v8H4zM8 4h1v8H8zM12 4h1v8h-1z' : 'M3 4h1v8H3zM13 4h1v8h-1z'} />
    </svg>
  )
}

export function ObstacleSprite({ theme, variant }: { theme: BookTheme; variant: number }) {
  if (theme === 'village')
    return (
      <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        <path fill="#8c3b2e" d="M7 1h2v1h2v1h2v1h2v3H1V4h2V3h2V2h2z" />
        <path fill="#e8d9b0" d="M2 7h12v8H2z" />
        <path fill="#7a5230" d="M7 10h2v5H7z" />
        <path fill="#6fa3c9" d="M3 9h3v2H3zM10 9h3v2h-3z" />
      </svg>
    )
  if (theme === 'mountain')
    return (
      <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        <path fill="#5a6270" d="M6 2h4v2h2v3h2v8H2V8h2V4h2z" />
        <path fill="#8a93a3" d="M7 3h2v2h2v3h2v6H4V8h2V5h1z" />
        <path fill={variant % 2 ? '#eef3f7' : '#b7c0cc'} d="M7 3h2v2H7z" />
      </svg>
    )
  if (theme === 'temple')
    return (
      <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        <path fill="#8a7650" d="M3 1h10v2H3zM3 13h10v2H3z" />
        <path fill="#d6c08e" d="M5 3h6v10H5z" />
        <path fill="#b8a170" d="M6 3h1v10H6zM9 3h1v10H9z" />
      </svg>
    )
  if (theme === 'city')
    return (
      <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
        <path fill="#4a5568" d="M2 2h12v13H2z" />
        <path fill={variant % 2 ? '#f6d365' : '#9fb3c8'} d="M4 4h2v2H4zM10 4h2v2h-2zM4 8h2v2H4zM10 8h2v2h-2z" />
        <path fill="#2d3748" d="M7 11h2v4H7z" />
      </svg>
    )
  return (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="#28452e" d="M7 0h2v2h2v2h2v3h-1v2h2v3H2V9h2V7H3V4h2V2h2z" />
      <path fill={variant % 2 ? '#4f7f4a' : '#3f6b42'} d="M7 2h2v2h2v3H5V4h2zM5 8h6v3H5z" />
      <path fill="#6b4626" d="M7 12h2v4H7z" />
    </svg>
  )
}
