/** Dados do MathQuest além das fases: monstros, itens da loja e conquistas. */

export type CreatureKind = 'slime' | 'bat' | 'mushroom' | 'golem'

export interface Enemy {
  name: string
  title: string
  kind: CreatureKind
  /** Cor principal do corpo; a sombra e o contorno são derivados dela. */
  color: string
  taunt: string
}

/** Um monstro por fase comum (fases 1 a 9). A fase 10 é sempre o Grum. */
export const enemies: Enemy[] = [
  { name: 'GOSMINHA', title: 'A GELEIA DAS SOMAS', kind: 'slime', color: '#7fb069', taunt: 'Blub! Errou!' },
  { name: 'PISCA', title: 'O VAGA-LUME TRAPALHÃO', kind: 'bat', color: '#e3b23c', taunt: 'Bzzz! Quase!' },
  { name: 'TOPA', title: 'A TOUPEIRA DAS PEGADAS', kind: 'golem', color: '#9c7a54', taunt: 'Hehe, cavou errado!' },
  { name: 'TÁBUA', title: 'O GUARDIÃO DA PONTE', kind: 'golem', color: '#8a8f7a', taunt: 'Ponte quebrada!' },
  { name: 'RAIZINHA', title: 'A GOSMA DAS RAÍZES', kind: 'slime', color: '#6a9b8a', taunt: 'Blub blub!' },
  { name: 'BRASA', title: 'O MORCEGO DAS CINZAS', kind: 'bat', color: '#c8553d', taunt: 'Chiii! Errou!' },
  { name: 'COGU', title: 'O COGUMELO EM DOBRO', kind: 'mushroom', color: '#c18152', taunt: 'Pof! Esporos!' },
  { name: 'PEDRÃO', title: 'O GOLEM DO CÍRCULO', kind: 'golem', color: '#7d8597', taunt: 'Rocha firme!' },
  { name: 'SOMBRINHA', title: 'O COGUMELO DO COVIL', kind: 'mushroom', color: '#7b6d9b', taunt: 'Sombras!' },
]

export type PowerUpId = 'pocao' | 'lupa' | 'escudo' | 'ampulheta'

export interface PowerUp {
  id: PowerUpId
  name: string
  description: string
  price: number
  /** Só faz sentido em batalhas com tempo (chefão). */
  bossOnly?: boolean
}

export const powerUps: PowerUp[] = [
  { id: 'pocao', name: 'Poção de vida', description: 'Recupera 1 coração perdido durante a batalha.', price: 30 },
  { id: 'lupa', name: 'Lupa da verdade', description: 'Risca duas alternativas erradas de uma questão de escolha.', price: 20 },
  { id: 'escudo', name: 'Escudo de madeira', description: 'O próximo erro nesta batalha não tira coração.', price: 25 },
  { id: 'ampulheta', name: 'Ampulheta', description: 'Dá mais 30 segundos contra o Grum.', price: 20, bossOnly: true },
]

export interface Achievement {
  id: string
  title: string
  description: string
}

export const achievements: Achievement[] = [
  { id: 'primeiro-passo', title: 'Primeiro passo', description: 'Conclua a fase 1.' },
  { id: 'sem-arranhoes', title: 'Sem arranhões', description: 'Vença uma fase sem perder nenhum coração.' },
  { id: 'combo-5', title: 'Pegando fogo', description: 'Acerte 5 desafios seguidos.' },
  { id: 'combo-8', title: 'Chama eterna', description: 'Acerte 8 desafios seguidos.' },
  { id: 'relampago', title: 'Rápido como raio', description: 'Vença uma fase comum em menos de 1 minuto.' },
  { id: 'estrategista', title: 'Estrategista', description: 'Use um item da loja numa batalha.' },
  { id: 'metade', title: 'Meio caminho', description: 'Conclua 5 fases do Livro I.' },
  { id: 'grum', title: 'Herói da floresta', description: 'Derrote o Grum.' },
  { id: 'treino', title: 'Aquecimento', description: 'Jogue o Desafio Relâmpago.' },
  { id: 'maratona', title: 'Maratonista', description: 'Faça 15 pontos no Desafio Relâmpago.' },
  { id: 'estrelas', title: 'Céu estrelado', description: 'Consiga 3 estrelas em todas as 10 fases do Livro I.' },
  { id: 'explorador', title: 'Caçador de tesouros', description: 'Abra um baú do tesouro num mapa.' },
  { id: 'segundo-livro', title: 'Virando a página', description: 'Conclua dois livros da aventura.' },
  { id: 'biblioteca', title: 'Lenda da biblioteca', description: 'Conclua os cinco livros da aventura.' },
]

export const BLITZ_SECONDS = 60
export const QUEST_STATS_STORAGE = 'matematica-rpg-stats-v1'
export const QUEST_SOUND_STORAGE = 'matematica-rpg-sound-v1'
