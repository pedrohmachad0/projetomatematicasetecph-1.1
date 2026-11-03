import { useEffect, useRef, useState } from 'react'
import { Coins, Crown, Footprints, Hand, HardHat, Shirt, Swords, X } from 'lucide-react'
import { chapterLevels, type ChapterProgress } from '../../data/chapter'
import { PixelItem } from './PixelArt'
import './inventory.css'

const slots = [
  { id: 'helmet', label: 'Capacete', Icon: HardHat },
  { id: 'chest', label: 'Peitoral', Icon: Shirt },
  { id: 'right', label: 'Mão direita', Icon: Swords },
  { id: 'left', label: 'Mão esquerda', Icon: Hand },
  { id: 'legs', label: 'Calças', Icon: Shirt },
  { id: 'feet', label: 'Sapatos', Icon: Footprints },
] as const
type Slot = (typeof slots)[number]['id']
type Equipment = Partial<Record<Slot, number>>
const equipmentKey = 'matematica-rpg-equipment-v1'
const itemSlots: Partial<Record<number, Slot>> = {
  1: 'right',
  2: 'left',
  3: 'feet',
  6: 'left',
  9: 'right',
  10: 'helmet',
}
export const coinsForLevel = (level: number) => (level === 10 ? 100 : 25)
export const chapterCoins = (progress: ChapterProgress) =>
  progress.completed.reduce((total, level) => total + coinsForLevel(level), 0)

export default function Inventory({
  progress,
  onClose,
}: {
  progress: ChapterProgress
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [selected, setSelected] = useState<number | null>(progress.completed[0] ?? null)
  const [error, setError] = useState(false)
  const [equipment, setEquipment] = useState<Equipment>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(equipmentKey) || '{}')
      return Object.fromEntries(
        slots.flatMap(({ id }) => {
          const level = saved?.[id]
          return progress.completed.includes(level) && itemSlots[level] === id ? [[id, level]] : []
        }),
      )
    } catch {
      return {}
    }
  })
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.showModal()
    return () => {
      document.body.style.overflow = previous
    }
  }, [])
  const item = selected ? chapterLevels[selected - 1] : null
  const slot = selected ? itemSlots[selected] : undefined
  const equipped = selected && slot && equipment[slot] === selected
  function updateEquipment(next: Equipment) {
    setEquipment(next)
    try {
      localStorage.setItem(equipmentKey, JSON.stringify(next))
      setError(false)
    } catch {
      setError(true)
    }
  }
  return (
    <dialog
      ref={dialog}
      className="inventory-dialog"
      aria-labelledby="inventory-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="inventory-shell">
        <header className="inventory-heading">
          <div>
            <span className="inventory-kicker">ACAMPAMENTO DO AVENTUREIRO</span>
            <h2 id="inventory-title">Seu arsenal de descobertas</h2>
          </div>
          <button
            autoFocus
            className="inventory-close"
            aria-label="Fechar inventário"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </header>
        <div className="inventory-wallet">
          <Coins size={28} />
          <div>
            <strong>
              {chapterCoins(progress)} <span>moedas</span>
            </strong>
            <small>25 por fase · 100 ao vencer Grum · uma vez por missão</small>
          </div>
          <span className="inventory-level">Nível {Math.floor(progress.xp / 300) + 1}</span>
        </div>
        <div className="inventory-columns">
          <section className="inventory-loadout" aria-label="Equipamentos do aventureiro">
            <h3>
              <Crown size={18} /> Equipamentos
            </h3>
            <div className="equipment-stage">
              <svg className="inventory-hero" viewBox="0 0 160 260" aria-hidden="true">
                <ellipse cx="80" cy="244" rx="49" ry="9" fill="currentColor" opacity=".15" />
                <path
                  d="M61 25h38v39H61zM51 70h58l18 79-29 17H62l-29-17zM56 164h48l-4 66H84l-4-42-4 42H60z"
                  fill="currentColor"
                  opacity=".22"
                />
                <path
                  d="M51 70 25 121l13 12 28-42M109 70l26 51-13 12-28-42"
                  stroke="currentColor"
                  strokeWidth="13"
                  fill="none"
                  opacity=".3"
                />
                <path d="m80 79 15 19-15 19-15-19z" fill="#d4a95f" />
                <path
                  d="M60 230h18v10H52v-7zM82 230h18l8 3v7H82z"
                  fill="currentColor"
                  opacity=".4"
                />
              </svg>
              {slots.map(({ id, label, Icon }) => {
                const level = equipment[id]
                return (
                  <button
                    key={id}
                    className={`equipment-slot equipment-${id} ${level ? 'filled' : ''}`}
                    aria-label={`${label}: ${level ? chapterLevels[level - 1].reward : 'vazio'}`}
                    onClick={() => setSelected(level ?? null)}
                  >
                    {level ? (
                      <PixelItem kind={chapterLevels[level - 1].icon} />
                    ) : (
                      <Icon size={27} />
                    )}
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
            <p className="inventory-note">
              Escolha um item da mochila para equipar. Seu visual conta a história da sua jornada.
            </p>
          </section>
          <section className="inventory-bag" aria-label="Itens conquistados">
            <h3>
              Mochila <span>{progress.completed.length} / 10 descobertas</span>
            </h3>
            <div className="inventory-bag-grid">
              {chapterLevels.map((reward, index) => {
                const level = index + 1
                const owned = progress.completed.includes(level)
                const wearing = Object.values(equipment).includes(level)
                return (
                  <button
                    key={reward.reward}
                    disabled={!owned}
                    className={`inventory-item ${selected === level ? 'chosen' : ''}`}
                    aria-label={
                      owned ? reward.reward : `Item da fase ${level}, ainda não conquistado`
                    }
                    aria-pressed={selected === level}
                    onClick={() => setSelected(level)}
                  >
                    {owned ? (
                      <PixelItem kind={reward.icon} />
                    ) : (
                      <span className="inventory-unknown">?</span>
                    )}
                    <small>
                      {owned ? (wearing ? 'Equipado' : `Fase ${level}`) : `Fase ${level}`}
                    </small>
                  </button>
                )
              })}
            </div>
            <div className="inventory-detail" aria-live="polite">
              {item ? (
                <>
                  <strong>{item.reward}</strong>
                  <p>
                    {slot
                      ? `Equipamento · ${slots.find((s) => s.id === slot)?.label}`
                      : 'Relíquia da floresta · item de coleção'}
                  </p>
                  {slot && (
                    <button
                      className="rpg-button"
                      onClick={() => {
                        const next = { ...equipment }
                        if (equipped) delete next[slot]
                        else next[slot] = selected!
                        updateEquipment(next)
                      }}
                    >
                      {equipped ? 'Desequipar' : 'Equipar'}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <strong>Uma mochila cheia de possibilidades</strong>
                  <p>Vença fases para ganhar moedas e descobrir seus primeiros itens.</p>
                </>
              )}
            </div>
          </section>
        </div>
        {error && (
          <p role="alert" className="inventory-note">
            Não foi possível salvar os equipamentos. A seleção ficará disponível apenas nesta
            sessão.
          </p>
        )}
        <footer className="inventory-note">
          Moedas e equipamentos ficam salvos neste navegador. Os itens são cosméticos.
        </footer>
      </div>
    </dialog>
  )
}
