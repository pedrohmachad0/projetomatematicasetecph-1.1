import type { BookTheme } from '../../data/questBooks'

/** Sprites pequenos do mapa de exploração, em pixel art (16 × 16). */

export function HeroSprite({ facing }: { facing: 'left' | 'right' | 'up' | 'down' }) {
  return (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" className={`hero-sprite facing-${facing}`} aria-hidden="true">
      <path fill="#2b3a2d" d="M5 1h6v1h1v4h-1v1H5V6H4V2h1z" />
      <path fill="#e8b98c" d="M5 3h6v3H5z" />
      <path fill="#7a4b2a" d="M5 2h6v1H5zM4 3h1v2H4z" />
      {facing !== 'up' && <path fill="#1f2a22" d={facing === 'left' ? 'M6 4h1v1H6z' : facing === 'right' ? 'M9 4h1v1H9z' : 'M6 4h1v1H6zM9 4h1v1H9z'} />}
      <path fill="#3f7d4a" d="M4 7h8v5H4z" />
      <path fill="#2f5f38" d="M4 11h8v1H4zM7 7h2v5H7z" />
      <path fill="#d4a95f" d="M4 9h8v1H4z" />
      <path fill="#e8b98c" d="M3 8h1v3H3zM12 8h1v3h-1z" />
      <path fill="#5a3d24" d="M5 12h2v3H5zM9 12h2v3H9z" />
      <path fill="#cfd8c4" d={facing === 'left' ? 'M1 6h1v5H1z' : 'M14 6h1v5h-1z'} />
    </svg>
  )
}

const villagerColors = ['#b0537a', '#4d7aa8', '#c8703f']

export function VillagerSprite({ variant }: { variant: number }) {
  const color = villagerColors[variant % villagerColors.length]
  return (
    <svg viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="#2b2b2b" d="M5 1h6v2H5z" />
      <path fill="#e2b48a" d="M5 3h6v4H5z" />
      <path fill="#1f2a22" d="M6 4h1v1H6zM9 4h1v1H9z" />
      <path fill="#a0522d" d="M7 6h2v1H7z" />
      <path fill={color} d="M3 7h10v6H3z" />
      <path fill="#fff3d0" d="M6 8h4v4H6z" />
      <path fill="#4b3a2a" d="M5 13h2v2H5zM9 13h2v2H9z" />
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
