import type { BookTheme } from './questBooks'

/** Cores do chão de cada livro, em rampas do escuro ao claro (luz do alto à esquerda). */
export interface TerrainPalette {
  grass: [string, string, string, string]
  path: [string, string, string]
  water: [string, string, string]
  shore: string
  flower: [string, string]
}

export const terrainPalettes: Record<BookTheme, TerrainPalette> = {
  forest: { grass: ['#4f7d3a', '#679b46', '#7db352', '#a3cf6c'], path: ['#9c7a4c', '#c9a46b', '#e2c48d'], water: ['#2c6a8f', '#3f8fb8', '#8fd0e8'], shore: '#e8d39c', flower: ['#f3d65b', '#f7f2e0'] },
  village: { grass: ['#8a8a3e', '#a8a54f', '#c1bd62', '#dcd68a'], path: ['#a07c52', '#cfa874', '#ead0a0'], water: ['#2f6f86', '#4a93ab', '#9fd6e2'], shore: '#eedcae', flower: ['#e8774f', '#f7e9d0'] },
  mountain: { grass: ['#6c7a68', '#84917f', '#9ca995', '#c3cdbd'], path: ['#8d8778', '#b3ad9c', '#d4cfc1'], water: ['#1f2530', '#2c3442', '#56637a'], shore: '#a6a39a', flower: ['#eef3f7', '#c9d6e3'] },
  temple: { grass: ['#b39654', '#cfb06a', '#e0c584', '#f1dcaa'], path: ['#b49a6c', '#dcc595', '#f2e3bf'], water: ['#1f7a7d', '#2f9a9c', '#8fdbd6'], shore: '#f3e6c2', flower: ['#b26a3a', '#f0c27a'] },
  city: { grass: ['#7c8593', '#959eab', '#acb4bf', '#cdd3da'], path: ['#5f6672', '#7c8491', '#9aa2ae'], water: ['#232a36', '#323b4b', '#e2b04a'], shore: '#c4c9d0', flower: ['#6fbf73', '#e8f3e0'] },
}
