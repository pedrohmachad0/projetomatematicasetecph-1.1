import { midiToFrequency, tracks, type Note, type TrackId } from '../data/music'

/**
 * Tocador de música em Web Audio. Agenda as notas um pouco à frente do tempo
 * real (lookahead) para não falhar quando a aba fica ocupada. Sem suporte a
 * áudio, tudo vira silêncio sem erro.
 */
class MusicPlayer {
  private context: AudioContext | null = null
  private gain: GainNode | null = null
  private timer: number | undefined
  private current: TrackId | null = null
  private voices: { notes: Note[]; index: number; time: number; wave: OscillatorType; level: number }[] = []
  private eighth = 0.25
  private volume = 0.6
  private enabled = true

  configure(enabled: boolean, volume: number) {
    this.enabled = enabled
    this.volume = volume
    if (this.gain) this.gain.gain.value = this.level()
    if (!enabled) this.stop()
  }

  private level() {
    return this.enabled ? 0.09 * this.volume : 0
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    try {
      this.context ??= new Ctor()
      if (!this.gain) {
        this.gain = this.context.createGain()
        this.gain.connect(this.context.destination)
      }
      this.gain.gain.value = this.level()
      if (this.context.state === 'suspended') void this.context.resume()
      return this.context
    } catch {
      return null
    }
  }

  play(track: TrackId) {
    if (!this.enabled) {
      this.current = track
      return
    }
    if (this.current === track && this.timer !== undefined) return
    this.stop()
    const context = this.ensureContext()
    this.current = track
    if (!context) return
    const data = tracks[track]
    this.eighth = 60 / data.bpm / 2
    const start = context.currentTime + 0.08
    this.voices = [
      { notes: data.lead, index: 0, time: start, wave: data.leadWave, level: 1 },
      { notes: data.bass, index: 0, time: start, wave: data.bassWave, level: 0.7 },
    ]
    this.timer = window.setInterval(() => this.schedule(), 90)
    this.schedule()
  }

  /** Volta a tocar a última faixa pedida (depois de ligar a música). */
  resume() {
    if (this.current) {
      const track = this.current
      this.current = null
      this.play(track)
    }
  }

  private schedule() {
    const context = this.context
    if (!context || !this.gain) return
    const horizon = context.currentTime + 0.35
    for (const voice of this.voices) {
      while (voice.time < horizon) {
        const [note, length] = voice.notes[voice.index]
        const duration = length * this.eighth
        if (note !== null) {
          const oscillator = context.createOscillator()
          const envelope = context.createGain()
          oscillator.type = voice.wave
          oscillator.frequency.value = midiToFrequency(note)
          envelope.gain.setValueAtTime(0.0001, voice.time)
          envelope.gain.exponentialRampToValueAtTime(voice.level, voice.time + 0.015)
          envelope.gain.exponentialRampToValueAtTime(0.0001, voice.time + duration * 0.92)
          oscillator.connect(envelope).connect(this.gain)
          oscillator.start(voice.time)
          oscillator.stop(voice.time + duration)
        }
        voice.time += duration
        voice.index = (voice.index + 1) % voice.notes.length
      }
    }
  }

  stop() {
    if (this.timer !== undefined) window.clearInterval(this.timer)
    this.timer = undefined
    this.voices = []
  }
}

export const music = new MusicPlayer()
