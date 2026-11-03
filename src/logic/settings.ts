/** Preferências do jogador do MathQuest, salvas no navegador. */

export type TextSpeed = 'lento' | 'normal' | 'rapido'

export interface GameSettings {
  playerName: string
  music: boolean
  sfx: boolean
  /** 0 a 1. */
  volume: number
  textSpeed: TextSpeed
  /** Modo turma: para projetar em sala, sem limite de tempo e com letras maiores. */
  classroom: boolean
}

export const SETTINGS_STORAGE = 'matematica-rpg-settings-v1'
const LEGACY_SOUND = 'matematica-rpg-sound-v1'

export const defaultSettings = (): GameSettings => ({ playerName: '', music: true, sfx: true, volume: 0.6, textSpeed: 'normal', classroom: false })

/** Milissegundos por letra na caixa de diálogo. */
export const textDelay: Record<TextSpeed, number> = { lento: 45, normal: 24, rapido: 8 }

export function cleanName(name: string): string {
  return name.replace(/[^\p{L}\p{N} '-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 14)
}

export function readSettings(): GameSettings {
  const base = defaultSettings()
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_STORAGE) || 'null')
    if (!parsed || typeof parsed !== 'object') {
      // Quem já tinha desligado o som continua com ele desligado.
      const legacy = localStorage.getItem(LEGACY_SOUND)
      return legacy === 'off' ? { ...base, music: false, sfx: false } : base
    }
    return {
      playerName: typeof parsed.playerName === 'string' ? cleanName(parsed.playerName) : '',
      music: typeof parsed.music === 'boolean' ? parsed.music : base.music,
      sfx: typeof parsed.sfx === 'boolean' ? parsed.sfx : base.sfx,
      volume: Number.isFinite(parsed.volume) ? Math.min(1, Math.max(0, parsed.volume)) : base.volume,
      textSpeed: ['lento', 'normal', 'rapido'].includes(parsed.textSpeed) ? parsed.textSpeed : base.textSpeed,
      classroom: typeof parsed.classroom === 'boolean' ? parsed.classroom : base.classroom,
    }
  } catch {
    return base
  }
}

export function writeSettings(settings: GameSettings): boolean {
  try {
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings))
    localStorage.setItem(LEGACY_SOUND, settings.sfx ? 'on' : 'off')
    return true
  } catch {
    return false
  }
}
