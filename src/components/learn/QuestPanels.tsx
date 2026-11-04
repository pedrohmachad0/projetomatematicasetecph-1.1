import { useEffect, type ReactNode } from 'react'
import { Coins, Heart, Hourglass, Lock, Search, Shield, Trophy, X } from 'lucide-react'
import { achievements, powerUps, type PowerUpId } from '../../data/quest'

const icons: Record<PowerUpId, typeof Heart> = { pocao: Heart, lupa: Search, escudo: Shield, ampulheta: Hourglass }

function Modal({ title, kicker, onClose, children }: { title: string; kicker: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const id = `${kicker.replace(/\W+/g, '-').toLowerCase()}-title`
  return (
    <div className="rpg-modal-backdrop" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <section className="rpg-modal quest-modal" role="dialog" aria-modal="true" aria-labelledby={id}>
        <button autoFocus className="modal-close" aria-label="Fechar" onClick={onClose}>
          <X size={20} />
        </button>
        <p className="eyebrow">{kicker}</p>
        <h2 id={id}>{title}</h2>
        {children}
      </section>
    </div>
  )
}

export function ShopPanel({
  coins,
  items,
  onBuy,
  onClose,
}: {
  coins: number
  items: Record<PowerUpId, number>
  onBuy: (id: PowerUpId) => void
  onClose: () => void
}) {
  return (
    <Modal title="Loja do acampamento" kicker="GASTE SUAS MOEDAS" onClose={onClose}>
      <p className="shop-wallet">
        <Coins size={18} /> Você tem <strong>{coins}</strong> moedas
      </p>
      <ul className="shop-list">
        {powerUps.map((item) => {
          const Icon = icons[item.id]
          const affordable = coins >= item.price
          return (
            <li key={item.id} className="shop-item">
              <span className="shop-icon">
                <Icon size={22} />
              </span>
              <div>
                <strong>{item.name}</strong>
                <p>{item.description}</p>
                <small>Na mochila: {items[item.id]}</small>
              </div>
              <button className="rpg-button" disabled={!affordable} onClick={() => onBuy(item.id)} aria-label={`Comprar ${item.name} por ${item.price} moedas`}>
                <Coins size={15} /> {item.price}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="shop-note">Ganhe moedas vencendo fases pela primeira vez, fazendo combos e jogando o Desafio Relâmpago. Os itens aparecem na barra de itens durante a batalha.</p>
    </Modal>
  )
}

export function AchievementsPanel({ unlocked, onClose }: { unlocked: string[]; onClose: () => void }) {
  return (
    <Modal title="Conquistas" kicker={`${unlocked.length} DE ${achievements.length} DESBLOQUEADAS`} onClose={onClose}>
      <ul className="achievement-list">
        {achievements.map((item) => {
          const done = unlocked.includes(item.id)
          return (
            <li key={item.id} className={`achievement ${done ? 'unlocked' : ''}`}>
              <span className="achievement-icon">{done ? <Trophy size={20} /> : <Lock size={18} />}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}

export function AchievementToast({ ids, onDone }: { ids: string[]; onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 4200)
    return () => window.clearTimeout(timer)
  }, [ids, onDone])
  const items = achievements.filter((item) => ids.includes(item.id))
  if (!items.length) return null
  return (
    <div className="achievement-toast" role="status">
      <Trophy size={24} />
      <div>
        <small>{items.length === 1 ? 'CONQUISTA DESBLOQUEADA' : `${items.length} CONQUISTAS DESBLOQUEADAS`}</small>
        <strong>{items.map((item) => item.title).join(' · ')}</strong>
      </div>
    </div>
  )
}
