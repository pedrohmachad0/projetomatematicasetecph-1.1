type Props = { className?: string }

export function PixelItem({
  kind,
}: {
  kind: 'sword' | 'spark' | 'boot' | 'map' | 'gem' | 'fire' | 'mushroom' | 'crown'
}) {
  if (kind === 'fire') return <PixelFire />
  return (
    <svg viewBox="0 0 48 48" shapeRendering="crispEdges" aria-hidden="true">
      {kind === 'sword' && (
        <g>
          <path
            fill="#435346"
            d="M35 2h11v11h-5v5h-5v5h-5v5h-5v5h-5L9 45H3v-6l12-12v-5L4 11l5-5 12 11h5V12h5V7h4z"
          />
          <path fill="#c8d9c4" d="M36 6h6v6h-5v5h-5v5h-5v5h-5v-5h5v-5h5v-5h4z" />
          <path fill="#a9bba5" d="M37 12h5v3h-5v5h-5v5h-5v5h-5v-5h5v-5h5v-5h5z" />
          <path fill="#d2a454" d="m9 10 19 19-4 4L5 14z" />
          <path fill="#8e633e" d="m16 29 4 4L7 44l-3-4z" />
        </g>
      )}
      {kind === 'spark' && (
        <g>
          <path fill="#506745" d="M20 5h8v6h7v6h6v15h-6v7H13v-7H7V17h6v-6h7z" />
          <path fill="#9caf6f" d="M12 20h10v11H12zM27 20h10v11H27z" />
          <path fill="#e7c46f" d="M20 15h9v22h-9z" />
          <path fill="#fff1b2" d="M22 23h5v8h-5z" />
          <path fill="#3f5740" d="M21 11h7v8h-7z" />
        </g>
      )}
      {kind === 'boot' && (
        <g>
          <path fill="#4d4939" d="M13 4h21v22h9v7h4v11H6V24h7z" />
          <path fill="#997544" d="M16 8h14v21h-8v7h20v5H10V27h6z" />
          <path fill="#c4a065" d="M15 8h16v7H15zM21 19h8v3h-8zM21 25h8v3h-8z" />
          <path fill="#403e33" d="M7 39h39v5H7z" />
        </g>
      )}
      {kind === 'map' && (
        <g>
          <path fill="#887c51" d="m3 8 14-4 14 5 14-5v36l-14 5-14-5-14 4z" />
          <path fill="#e1d4a0" d="m6 11 11-3 14 5 11-4v28l-11 4-14-5-11 4z" />
          <path stroke="#bcb279" strokeWidth="2" d="M17 9v27M31 13v27" />
          <path stroke="#ad6541" strokeWidth="3" fill="none" d="M10 30h9V20h16m-4-4 8 8m0-8-8 8" />
        </g>
      )}
      {kind === 'gem' && (
        <g>
          <path fill="#395950" d="M13 4h23v7h7v20h-7v7h-7v7h-9v-7h-7v-7H5V11h8z" />
          <path fill="#84af98" d="M15 8h19v7h5v14H9V15h6z" />
          <path fill="#c0d4a7" d="M15 10h9v12H11v-7h4z" />
          <path fill="#568d77" d="M10 29h29l-15 13z" />
          <path fill="#a2c7aa" d="M24 9h9v14h-9z" />
        </g>
      )}
      {kind === 'mushroom' && (
        <g>
          <path fill="#584e3b" d="M15 4h19v7h8v7h4v14H32v11H17V32H3V18h5v-7h7z" />
          <path fill="#c18152" d="M16 8h16v7h7v7h4v7H6v-7h5v-7h5z" />
          <path fill="#e2cf94" d="M20 31h9v9h-9zM17 13h8v6h-8zM8 23h7v5H8zM32 20h7v6h-7z" />
          <path fill="#9c6040" d="M7 27h35v4H7z" />
        </g>
      )}
      {kind === 'crown' && (
        <g>
          <path fill="#78613a" d="M2 10h7v6h6v-5h5V3h8v8h5v5h6v-6h7v25h-4v9H6v-9H2z" />
          <path fill="#d4a553" d="M6 15h3v6h10V11h3V7h4v4h3v10h10v-6h3v17H6zM10 33h28v7H10z" />
          <path fill="#f3d98a" d="M9 26h30v5H9zM13 35h21v3H13z" />
          <path fill="#b76348" d="M21 25h7v7h-7z" />
        </g>
      )}
    </svg>
  )
}

export function PixelTree({ className = '' }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 64"
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path fill="#192e24" d="M20 37h10v25H20zM12 60h25v4H12z" />
      <path fill="#886944" d="M22 38h6v24h-6z" />
      <path fill="#2a4a31" d="M20 0h8v6h6v6h6v10h5v12h3v12h-5v7H6v-7H0V34h5V22h6V12h6V6h3z" />
      <path fill="#3e6540" d="M20 4h8v8h7v12h5v9h4v10H5V33h6V22h6V12h3z" />
      <path fill="#54804a" d="M20 6h5v9h-5v9h-5v11H8v-6h4V18h5v-6h3zM20 30h8v5h-8zM31 38h8v4h-8z" />
      <path fill="#253f2b" d="M6 43h37v6H6zM12 24h6v5h-6zM29 18h6v7h-6z" />
    </svg>
  )
}

export function PixelFire({ className = '' }: Props) {
  return (
    <svg
      className={`pixel-fire ${className}`}
      viewBox="0 0 40 48"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <path fill="#322b22" d="M3 38h34v7H3zM8 34h7v14H8zM27 34h6v14h-6z" />
      <path fill="#9d6540" d="M5 38h30v4H5z" />
      <g className="flame">
        <path fill="#ce532f" d="M17 1h6v9h6v8h5v8h3v8h-6v5H9v-5H4V22h5V12h5v9h3z" />
        <path fill="#ee943f" d="M18 12h6v9h6v13H11V23h7z" />
        <path fill="#ffdb79" d="M18 23h6v13h-9v-7h3z" />
      </g>
    </svg>
  )
}

export function PixelChest({ className = '' }: Props) {
  return (
    <svg className={className} viewBox="0 0 48 42" shapeRendering="crispEdges" aria-hidden="true">
      <path fill="#302b28" d="M6 4h36v4h4v30h-4v4H4V8h2z" />
      <path fill="#a96935" d="M8 8h32v28H8z" />
      <path
        fill="#e1ad52"
        d="M8 8h32v5H8zM8 22h32v5H8zM8 13h5v23H8zM35 13h5v23h-5zM13 32h22v4H13z"
      />
      <path fill="#744529" d="M13 13h22v9H13zM13 27h22v5H13z" />
      <path fill="#ffe29b" d="M21 20h8v11h-8z" />
      <path fill="#493625" d="M24 23h3v5h-3z" />
    </svg>
  )
}

export function PixelOgre({
  mood = 'idle',
  className = '',
}: Props & { mood?: 'idle' | 'hurt' | 'laugh' | 'defeated' }) {
  return (
    <svg
      className={`pixel-ogre ogre-${mood} ${className}`}
      viewBox="0 0 160 144"
      role="img"
      aria-label={`Grum, ogro forte de óculos e tatuagens numéricas${mood === 'defeated' ? ', derrotado' : mood === 'laugh' ? ', dando risada' : ''}`}
      shapeRendering="crispEdges"
    >
      <ellipse cx="80" cy="134" rx="61" ry="7" fill="#182d2470" />
      <g className="ogre-body">
        <path
          fill="var(--ogre-outline, #29372b)"
          d="M52 8h49v6h10v20h-5v9h18v7h13v12h9v37h-8v7h-20v-8h-8v20h-5v18H81v-24h-5v24H50v-18h-5V97h-9v10H16v-7H8V65h9V53h15V43h20V34h-8V19h8z"
        />
        <path
          fill="#7b984e"
          d="M54 16h46v26H54zM36 49h86v11h9v34h-17V80h-6v29H48V81h-8v18H20V65h16z"
        />
        <path
          fill="#9eb464"
          d="M56 17h17v7H56zM37 51h25v11H37zM92 50h25v10H92zM23 66h13v14H23zM118 64h10v17h-10zM55 67h18v15H55zM83 67h18v15H83z"
        />
        <path
          fill="#546e3b"
          d="M68 43h24v6H68zM48 83h58v7H48zM72 60h8v37h-8zM89 88h10v8H89zM28 86h9v10h-9z"
        />
        <path fill="#6a4935" d="M47 98h62v16H47zM51 113h22v13H51zM85 113h20v13H85z" />
        <path fill="#a67f43" d="M47 97h62v6H47z" />
        <path fill="#e2b75d" d="M73 97h12v9H73z" />
        <path fill="#453b30" d="M48 126h25v8H48zM85 126h25v8H85z" />
        <path fill="#bed184" d="M44 22h10v11H44zM100 22h11v11h-11z" />
        <path fill="#202d29" d="M52 23h23v15H52zM80 23h23v15H80zM75 27h5v4h-5z" />
        <path fill="#c6e6cf" d="M56 27h15v7H56zM84 27h15v7H84z" />
        {mood === 'defeated' ? (
          <path stroke="#273b2e" strokeWidth="2" d="m60 28 5 5m0-5-5 5m28-5 5 5m0-5-5 5" />
        ) : (
          <path fill="#273b2e" d="M64 28h4v6h-4zM87 28h4v6h-4z" />
        )}
        <path fill="#283728" d={mood === 'laugh' ? 'M62 40h31v13H62z' : 'M66 40h23v6H66z'} />
        <path fill="#efe5b7" d="M63 37h5v8h-5zM89 37h5v8h-5z" />
        {mood === 'laugh' && <path fill="#d78970" d="M70 48h16v5H70z" />}
        <g fill="#344d31" fontFamily="monospace" fontWeight="bold">
          <text x="24" y="78" fontSize="13">
            7
          </text>
          <text x="112" y="81" fontSize="16">
            π
          </text>
          <text x="55" y="78" fontSize="14">
            +
          </text>
          <text x="87" y="77" fontSize="13">
            9
          </text>
          <text x="60" y="95" fontSize="11">
            ×
          </text>
        </g>
        <path fill="#545847" d="M128 100h7v30h-7zM119 105h24v8h-24z" />
        <path fill="#b6b29a" d="M124 112h15v19h-15zM128 130h7v6h-7z" />
      </g>
    </svg>
  )
}

export function ForestBackdrop() {
  return (
    <div className="forest-decoration" aria-hidden="true">
      {Array.from({ length: 42 }, (_, i) => (
        <PixelTree key={i} className={`tree tree-${i % 4}`} />
      ))}
      <svg
        className="forest-details"
        viewBox="0 0 720 780"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
      >
        <path fill="#496755" d="M0 478h100v16h65v16h45v30h-35v18h-60v30H60v20H0z" />
        <path fill="#709382" d="M0 496h92v15h60v16h-43v20H45v31H0z" />
        <path fill="#94b2a0" d="M16 520h31v3H16zM66 529h29v3H66zM12 561h31v3H12z" />
        <path fill="#927044" d="M164 410h25v151h-25zM193 409h25v151h-25z" />
        <path fill="#b49559" d="M156 419h71v8h-71zM156 538h71v8h-71z" />
        {[
          [100, 145],
          [542, 250],
          [87, 351],
          [470, 540],
          [550, 662],
          [322, 700],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path fill="#c39d65" d="M5 8h6v10H5z" />
            <path fill="#c47853" d="M0 3h16v8H0zM4 0h8v3H4z" />
            <path fill="#e5c58a" d="M3 4h3v3H3zM11 6h3v3h-3z" />
          </g>
        ))}
        {[
          [114, 215],
          [563, 175],
          [490, 406],
          [86, 653],
          [580, 581],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <path fill="#7b8068" d="M0 8h6V0h19v5h8v17H0z" />
            <path fill="#a1a18a" d="M8 2h15v5H8z" />
          </g>
        ))}
      </svg>
      <PixelFire className="map-fire fire-one" />
      <PixelFire className="map-fire fire-two" />
      {Array.from({ length: 14 }, (_, i) => (
        <i
          key={i}
          className="ember"
          style={{
            left: `${10 + ((i * 23) % 83)}%`,
            top: `${8 + ((i * 17) % 85)}%`,
            animationDelay: `${i * 0.37}s`,
          }}
        />
      ))}
    </div>
  )
}
