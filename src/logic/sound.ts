import { QUEST_SOUND_STORAGE } from '../data/quest'

/** Efeitos sonoros curtos sintetizados com Web Audio, sem arquivos de áudio. */
export type SoundEffect = 'correct' | 'wrong' | 'combo' | 'victory' | 'defeat' | 'coin' | 'item' | 'select'

type Note = [frequency: number, start: number, duration: number]

const melodies: Record<SoundEffect, { wave: OscillatorType; notes: Note[] }> = {
  select: { wave: 'square', notes: [[660, 0, 0.04]] },
  correct: { wave: 'square', notes: [[523, 0, 0.08], [784, 0.08, 0.12]] },
  wrong: { wave: 'sawtooth', notes: [[220, 0, 0.12], [165, 0.12, 0.18]] },
  combo: { wave: 'square', notes: [[659, 0, 0.06], [880, 0.06, 0.06], [1175, 0.12, 0.14]] },
  coin: { wave: 'square', notes: [[988, 0, 0.06], [1319, 0.06, 0.16]] },
  item: { wave: 'triangle', notes: [[440, 0, 0.08], [660, 0.08, 0.08], [880, 0.16, 0.16]] },
  victory: { wave: 'square', notes: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.36, 0.3]] },
  defeat: { wave: 'triangle', notes: [[392, 0, 0.18], [330, 0.18, 0.18], [262, 0.36, 0.36]] },
}

let context: AudioContext | null = null

export function readSoundEnabled(): boolean {
  try {
    return localStorage.getItem(QUEST_SOUND_STORAGE) !== 'off'
  } catch {
    return true
  }
}

export function writeSoundEnabled(enabled: boolean) {
  try {
    localStorage.setItem(QUEST_SOUND_STORAGE, enabled ? 'on' : 'off')
  } catch {
    // Sem armazenamento, a preferência vale só nesta sessão.
  }
}

export function playSound(effect: SoundEffect, enabled = readSoundEnabled()) {
  if (!enabled || typeof window === 'undefined') return
  const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtor) return
  try {
    context ??= new AudioCtor()
    if (context.state === 'suspended') void context.resume()
    const now = context.currentTime
    const { wave, notes } = melodies[effect]
    for (const [frequency, start, duration] of notes) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.type = wave
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, now + start)
      gain.gain.exponentialRampToValueAtTime(0.06, now + start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration)
      oscillator.connect(gain).connect(context.destination)
      oscillator.start(now + start)
      oscillator.stop(now + start + duration + 0.02)
    }
  } catch {
    // Áudio é opcional: falhas nunca interrompem o jogo.
  }
}
