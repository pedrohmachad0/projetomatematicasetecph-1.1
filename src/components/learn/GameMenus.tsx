import { useEffect, useRef, useState, type ReactNode } from 'react'
import { BookOpen, Gamepad2, Home, Map, Maximize2, Minimize2, Music, Play, RotateCcw, Settings, Sparkles, Volume2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cleanName, type GameSettings, type TextSpeed } from '../../logic/settings'
import { HeroSprite } from './MapSprites'
import PixelCreature from './PixelCreature'
import { PixelOgre, PixelTree } from './PixelArt'

function Overlay({ title, kicker, onClose, children, className = '' }: { title: string; kicker: string; onClose: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])
  const id = `${kicker.replace(/\W+/g, '-').toLowerCase()}-menu`
  return (
    <div className="game-overlay" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`game-panel ${className}`} role="dialog" aria-modal="true" aria-labelledby={id}>
        <button className="game-panel-close" aria-label="Fechar" onClick={onClose}>
          <X size={18} />
        </button>
        <p className="game-kicker">{kicker}</p>
        <h2 id={id}>{title}</h2>
        {children}
      </section>
    </div>
  )
}

export function SettingsPanel({ settings, onChange, onClose }: { settings: GameSettings; onChange: (next: GameSettings) => void; onClose: () => void }) {
  const speeds: Array<{ id: TextSpeed; label: string }> = [
    { id: 'lento', label: 'Lento' },
    { id: 'normal', label: 'Normal' },
    { id: 'rapido', label: 'Rápido' },
  ]
  return (
    <Overlay title="Configurações" kicker="AJUSTE DO SEU JEITO" onClose={onClose}>
      <div className="settings-list">
        <label className="setting-row">
          <span>
            <Music size={16} /> Música
          </span>
          <input type="checkbox" checked={settings.music} onChange={(event) => onChange({ ...settings, music: event.target.checked })} />
        </label>
        <label className="setting-row">
          <span>
            <Volume2 size={16} /> Efeitos sonoros
          </span>
          <input type="checkbox" checked={settings.sfx} onChange={(event) => onChange({ ...settings, sfx: event.target.checked })} />
        </label>
        <label className="setting-row setting-column">
          <span>Volume da música: {Math.round(settings.volume * 100)}%</span>
          <input type="range" min={0} max={1} step={0.1} value={settings.volume} onChange={(event) => onChange({ ...settings, volume: Number(event.target.value) })} />
        </label>
        <div className="setting-row setting-column" role="group" aria-label="Velocidade do texto">
          <span>Velocidade do texto</span>
          <div className="setting-options">
            {speeds.map((speed) => (
              <button key={speed.id} type="button" aria-pressed={settings.textSpeed === speed.id} onClick={() => onChange({ ...settings, textSpeed: speed.id })}>
                {speed.label}
              </button>
            ))}
          </div>
        </div>
        <label className="setting-row setting-column">
          <span>Nome do aventureiro</span>
          <input type="text" value={settings.playerName} maxLength={14} onChange={(event) => onChange({ ...settings, playerName: cleanName(event.target.value) })} placeholder="Seu nome" />
        </label>
      </div>
    </Overlay>
  )
}

export function HowToPlay({ onClose }: { onClose: () => void }) {
  return (
    <Overlay title="Como jogar" kicker="GUIA DO AVENTUREIRO" onClose={onClose} className="howto-panel">
      <ol className="howto-list">
        <li>
          <strong>Escolha uma fase na trilha.</strong> Cada livro é um capítulo da Matemática, do 6º ano ao Ensino Médio.
        </li>
        <li>
          <strong>Explore o mapa.</strong> Ande com setas/WASD (segure para continuar), toque no mapa ou use o joystick no celular. Encoste nos personagens ou aperte <kbd>E</kbd>.
        </li>
        <li>
          <strong>Cumpra as missões:</strong> derrote monstros, ajude os moradores com problemas, conserte a passagem e encontre o guardião.
        </li>
        <li>
          <strong>Batalha por turnos:</strong> escolha Atacar, Esquivar, Mochila ou Fugir. Cada ação é uma conta: acertando, seu golpe funciona e o contra-ataque fica mais fraco.
        </li>
        <li>
          <strong>Ganhe estrelas, moedas e conquistas.</strong> Use as moedas na loja e teste sua velocidade no Desafio Relâmpago.
        </li>
        <li>
          <kbd>Esc</kbd> ou <kbd>P</kbd> abre a pausa; <kbd>J</kbd> abre o diário de missões no mapa.
        </li>
      </ol>
    </Overlay>
  )
}

export function PauseMenu({ onResume, onJournal, onSettings, onTrail, canJournal, fullscreen = false, onFullscreen }: { onResume: () => void; onJournal: () => void; onSettings: () => void; onTrail: () => void; canJournal: boolean; fullscreen?: boolean; onFullscreen?: () => void }) {
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => first.current?.focus(), [])
  return (
    <Overlay title="Pausa" kicker="RESPIRE. A AVENTURA ESPERA." onClose={onResume} className="pause-panel">
      <div className="pause-actions">
        <button ref={first} className="pause-button primary" onClick={onResume}>
          <Play size={18} />
          <span>
            <strong>Retomar</strong>
            <small>Voltar ao jogo</small>
          </span>
        </button>
        {canJournal && (
          <button className="pause-button" onClick={onJournal}>
            <BookOpen size={18} />
            <span>
              <strong>Diário de missões</strong>
              <small>O que falta nesta fase</small>
            </span>
          </button>
        )}
        <button className="pause-button" onClick={onSettings}>
          <Settings size={18} />
          <span>
            <strong>Configurações</strong>
            <small>Música, efeitos e texto</small>
          </span>
        </button>
        {onFullscreen && (
          <button className="pause-button" onClick={onFullscreen}>
            {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            <span>
              <strong>{fullscreen ? 'Sair da tela cheia' : 'Tela cheia'}</strong>
              <small>Jogar ocupando a tela toda</small>
            </span>
          </button>
        )}
        <button className="pause-button" onClick={onTrail}>
          <Map size={18} />
          <span>
            <strong>Voltar à trilha</strong>
            <small>O progresso do mapa fica salvo</small>
          </span>
        </button>
        <Link className="pause-button" to="/">
          <Home size={18} />
          <span>
            <strong>Sair para o site</strong>
            <small>Ir aos simuladores</small>
          </span>
        </Link>
      </div>
    </Overlay>
  )
}

interface TitleProps {
  hasSave: boolean
  playerName: string
  summary: string
  onContinue: () => void
  onNewGame: (name: string) => void
  onSettings: () => void
  onHowTo: () => void
}

/** Tela de abertura do jogo. */
export function TitleScreen({ hasSave, playerName, summary, onContinue, onNewGame, onSettings, onHowTo }: TitleProps) {
  const [naming, setNaming] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [name, setName] = useState(playerName)
  const first = useRef<HTMLButtonElement>(null)
  const nameInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (naming) nameInput.current?.focus()
    else first.current?.focus()
  }, [naming])

  return (
    <main className="title-screen" id="conteudo">
      <div className="title-sky" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 45}%`, animationDelay: `${(i % 6) * 0.4}s` }} />
        ))}
      </div>
      <div className="title-hills" aria-hidden="true">
        {Array.from({ length: 14 }, (_, i) => (
          <PixelTree key={i} />
        ))}
      </div>
      <div className="title-cast" aria-hidden="true">
        <span className="cast-hero">
          <HeroSprite facing="right" frame={0} />
        </span>
        <span className="cast-slime">
          <PixelCreature kind="slime" color="#7fb069" name="Bolha" />
        </span>
        <span className="cast-ogre">
          <PixelOgre />
        </span>
      </div>
      <div className="title-content">
        <p className="title-kicker">
          <Sparkles size={14} /> UM RPG DE MATEMÁTICA
        </p>
        <h1 className="title-logo">
          MATH<span>QUEST</span>
        </h1>
        <p className="title-tagline">Pequenos passos. Grandes conquistas.</p>

        {!naming ? (
          <nav className="title-menu" aria-label="Menu principal do jogo">
            {hasSave && (
              <button ref={first} className="title-button primary" onClick={onContinue}>
                <Play size={18} /> Continuar
                <small>{playerName ? `${playerName} · ` : ''}{summary}</small>
              </button>
            )}
            <button ref={hasSave ? undefined : first} className={`title-button ${hasSave ? '' : 'primary'}`} onClick={() => (hasSave ? setConfirmReset(true) : setNaming(true))}>
              <Gamepad2 size={18} /> {hasSave ? 'Novo jogo' : 'Começar aventura'}
            </button>
            <button className="title-button" onClick={onHowTo}>
              <BookOpen size={18} /> Como jogar
            </button>
            <button className="title-button" onClick={onSettings}>
              <Settings size={18} /> Configurações
            </button>
          </nav>
        ) : (
          <form
            className="title-name"
            onSubmit={(event) => {
              event.preventDefault()
              onNewGame(cleanName(name) || 'Aventureiro')
            }}
          >
            <label htmlFor="hero-name">Como devemos te chamar, aventureiro?</label>
            <input ref={nameInput} id="hero-name" value={name} maxLength={14} onChange={(event) => setName(cleanName(event.target.value))} placeholder="Seu nome" autoComplete="off" />
            <div className="title-name-actions">
              <button type="button" className="title-button" onClick={() => setNaming(false)}>
                Voltar
              </button>
              <button type="submit" className="title-button primary">
                <Play size={18} /> Partir!
              </button>
            </div>
          </form>
        )}
      </div>
      {confirmReset && (
        <Overlay title="Começar do zero?" kicker="NOVO JOGO" onClose={() => setConfirmReset(false)}>
          <p className="game-text">Todo o progresso da aventura (fases, estrelas, moedas, itens e conquistas) será apagado deste navegador. Isso não pode ser desfeito.</p>
          <div className="pause-actions">
            <button
              className="pause-button danger"
              onClick={() => {
                setConfirmReset(false)
                setNaming(true)
              }}
            >
              <RotateCcw size={18} />
              <span>
                <strong>Apagar e começar</strong>
                <small>Escolher um novo nome</small>
              </span>
            </button>
            <button className="pause-button primary" onClick={() => setConfirmReset(false)}>
              <Play size={18} />
              <span>
                <strong>Manter meu jogo</strong>
                <small>Voltar ao título</small>
              </span>
            </button>
          </div>
        </Overlay>
      )}
    </main>
  )
}
