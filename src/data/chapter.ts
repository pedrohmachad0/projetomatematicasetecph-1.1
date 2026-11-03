export const BOSS_SECONDS = 180
export const CHAPTER_STORAGE = 'matematica-rpg-chapter-1-v1'
export const chapterLevels = [
  {
    title: 'O primeiro passo',
    topic: 'Somas até 10',
    description:
      'Toda grande aventura começa com uma pequena soma. Junte os números e acenda sua primeira chama.',
    hint: 'Somar é juntar quantidades. Comece pelo maior número e conte para a frente.',
    reward: 'Graveto de aventureiro',
    icon: 'sword',
  },
  {
    title: 'Clareira dos vaga-lumes',
    topic: 'Somas até 20',
    description: 'Os vaga-lumes iluminam o caminho. Conte suas luzes e atravesse a clareira.',
    hint: 'Complete uma dezena: em 8 + 5, use 2 para chegar a 10 e some os 3 que sobraram.',
    reward: 'Vaga-lume de bolso',
    icon: 'spark',
  },
  {
    title: 'Pegadas na terra',
    topic: 'Subtrações até 10',
    description: 'Algumas pegadas desapareceram. Descubra quantas restaram para seguir a trilha.',
    hint: 'Subtrair é retirar. Em 9 − 3, comece em 9 e volte três passos.',
    reward: 'Botas de explorador',
    icon: 'boot',
  },
  {
    title: 'A ponte esquecida',
    topic: 'Subtrações até 20',
    description: 'Encontre as peças que faltam e reconstrua a ponte de madeira.',
    hint: 'Use a soma para conferir: se 17 − 8 = 9, então 9 + 8 precisa ser 17.',
    reward: 'Mapa da floresta',
    icon: 'map',
  },
  {
    title: 'O segredo das raízes',
    topic: 'Somas e subtrações até 30',
    description: 'Raízes escondem números antigos. Complete as contas e revele seus segredos.',
    hint: 'Para descobrir o número que falta em 7 + □ = 12, calcule 12 − 7.',
    reward: 'Pedra das raízes',
    icon: 'gem',
  },
  {
    title: 'Acampamento das brasas',
    topic: 'Cálculo mental até 50',
    description: 'Aqueça o raciocínio junto à fogueira. A jornada está ficando mais desafiadora.',
    hint: 'Separe dezenas e unidades. Em 23 + 14, faça 20 + 10 e depois 3 + 4.',
    reward: 'Lanterna de brasas',
    icon: 'fire',
  },
  {
    title: 'Cogumelos em dobro',
    topic: 'Multiplicação por 2 e 3',
    description: 'Os cogumelos crescem em pequenos grupos. Descubra um novo jeito de contar.',
    hint: 'Multiplicar é somar grupos iguais: 3 × 4 = 4 + 4 + 4 = 12.',
    reward: 'Cogumelo de cobre',
    icon: 'mushroom',
  },
  {
    title: 'O círculo das pedras',
    topic: 'Multiplicação por 4 e 5',
    description: 'Decifre os símbolos das pedras e abra a passagem para o coração da floresta.',
    hint: 'Para multiplicar por 4, dobre duas vezes. Por 5, conte de cinco em cinco.',
    reward: 'Amuleto do cálculo',
    icon: 'gem',
  },
  {
    title: 'Às portas do covil',
    topic: 'Revisão das três operações',
    description: 'A floresta ficou silenciosa. Use tudo que aprendeu antes do encontro final.',
    hint: 'Leia o sinal com atenção: + junta, − retira e × forma grupos iguais.',
    reward: 'Espada de aprendiz',
    icon: 'sword',
  },
  {
    title: 'Grum, o Colecionador',
    topic: 'Chefão · operações combinadas',
    description:
      'Ele é grande, usa óculos e coleciona números. Acerte as contas para quebrar sua defesa!',
    hint: 'Nas contas combinadas, resolva a multiplicação antes da soma ou da subtração.',
    reward: 'Coroa das Brasas',
    icon: 'crown',
  },
] as const
export type ChapterQuestion = {
  id: string
  kind: 'choice' | 'input' | 'missing' | 'truth'
  instruction: string
  expression: string
  answer: string
  choices?: string[]
  explanation: string
}
export type ChapterProgress = {
  completed: number[]
  xp: number
  best: Record<string, { correct: number; seconds: number }>
}
export const emptyProgress = (): ChapterProgress => ({ completed: [], xp: 0, best: {} })
