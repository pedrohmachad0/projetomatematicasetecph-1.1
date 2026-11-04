/**
 * Trilhas originais do MathQuest em notação simples: cada nota é
 * [nota MIDI ou null para pausa, duração em colcheias]. Tocadas em loop.
 */
export type Note = [number | null, number]

export interface Track {
  bpm: number
  lead: Note[]
  bass: Note[]
  leadWave: OscillatorType
  bassWave: OscillatorType
}

export type TrackId = 'title' | 'map' | 'battle' | 'boss'

// Atalhos de altura (MIDI): C4 = 60.
const C4 = 60, D4 = 62, E4 = 64, F4 = 65, G4 = 67, A4 = 69, B4 = 71
const C5 = 72, D5 = 74, E5 = 76, G5 = 79
const C3 = 48, D3 = 50, E3 = 52, F3 = 53, G3 = 55, A3 = 57, A2 = 45, F2 = 41, G2 = 43, E2 = 40, B2 = 47

export const tracks: Record<TrackId, Track> = {
  // Tema heroico e calmo para a tela de título.
  title: {
    bpm: 96,
    leadWave: 'square',
    bassWave: 'triangle',
    lead: [[E4, 2], [G4, 2], [C5, 3], [B4, 1], [A4, 2], [G4, 2], [E4, 4], [F4, 2], [A4, 2], [D5, 3], [C5, 1], [B4, 2], [G4, 2], [A4, 4], [E4, 2], [G4, 2], [C5, 3], [D5, 1], [E5, 2], [D5, 2], [C5, 4], [A4, 2], [B4, 2], [C5, 2], [G4, 2], [C5, 8]],
    bass: [[C3, 4], [G3, 4], [A2, 4], [E3, 4], [F2, 4], [C3, 4], [G2, 4], [G3, 4], [C3, 4], [G3, 4], [A2, 4], [E3, 4], [F2, 4], [G2, 4], [C3, 8]],
  },
  // Passeio leve para explorar os mapas.
  map: {
    bpm: 112,
    leadWave: 'triangle',
    bassWave: 'triangle',
    lead: [[C5, 1], [null, 1], [G4, 1], [E4, 1], [A4, 2], [G4, 2], [E4, 1], [null, 1], [D4, 1], [E4, 1], [G4, 4], [A4, 1], [null, 1], [C5, 1], [A4, 1], [G4, 2], [E4, 2], [D4, 2], [E4, 1], [D4, 1], [C4, 4], [E4, 1], [G4, 1], [A4, 2], [C5, 2], [D5, 2], [C5, 2], [A4, 2], [G4, 4], [E4, 2], [D4, 2], [C4, 6]],
    bass: [[C3, 2], [G3, 2], [C3, 2], [G3, 2], [F3, 2], [C3, 2], [G3, 2], [D3, 2], [A2, 2], [E3, 2], [F3, 2], [C3, 2], [G2, 2], [D3, 2], [C3, 4], [F3, 2], [C3, 2], [A2, 2], [E3, 2], [F3, 2], [G3, 2], [C3, 4]],
  },
  // Batalha com ritmo acelerado.
  battle: {
    bpm: 150,
    leadWave: 'square',
    bassWave: 'sawtooth',
    lead: [[A4, 1], [A4, 1], [C5, 1], [A4, 1], [E5, 2], [D5, 1], [C5, 1], [B4, 1], [B4, 1], [D5, 1], [B4, 1], [G4, 2], [A4, 2], [A4, 1], [A4, 1], [C5, 1], [E5, 1], [G5, 2], [E5, 1], [D5, 1], [C5, 1], [B4, 1], [A4, 1], [G4, 1], [A4, 4]],
    bass: [[A2, 1], [A2, 1], [A3, 1], [A2, 1], [A2, 1], [A3, 1], [A2, 1], [A3, 1], [G2, 1], [G2, 1], [G3, 1], [G2, 1], [G2, 1], [G3, 1], [G2, 1], [G3, 1], [F2, 1], [F2, 1], [F3, 1], [F2, 1], [E2, 1], [E3, 1], [E2, 1], [E3, 1]],
  },
  // Chefão: mais grave e tenso.
  boss: {
    bpm: 140,
    leadWave: 'sawtooth',
    bassWave: 'square',
    lead: [[E4, 1], [null, 1], [E4, 1], [F4, 1], [E4, 2], [B4, 2], [A4, 1], [G4, 1], [F4, 1], [E4, 1], [D4, 4], [E4, 1], [null, 1], [E4, 1], [G4, 1], [A4, 2], [C5, 2], [B4, 2], [A4, 1], [G4, 1], [E4, 4]],
    bass: [[E2, 1], [E2, 1], [E3, 1], [E2, 1], [E2, 1], [E3, 1], [F2, 1], [F3, 1], [D3, 1], [D3, 1], [D3, 1], [D3, 1], [A2, 1], [A2, 1], [B2, 1], [B2, 1]],
  },
}

export const midiToFrequency = (note: number) => 440 * 2 ** ((note - 69) / 12)

/** Duração total (em colcheias) de uma voz. */
export const voiceLength = (notes: Note[]) => notes.reduce((sum, [, length]) => sum + length, 0)
