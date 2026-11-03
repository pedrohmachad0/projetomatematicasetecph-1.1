/**
 * Livros do MathQuest. Cada livro é um capítulo com fases em sequência; cada fase
 * tem um mapa para explorar, missões e um guardião no fim. Os assuntos seguem os
 * simuladores da plataforma, do 6º ano ao Ensino Médio.
 */
import { CHAPTER_STORAGE, chapterLevels } from './chapter'
import { enemies, type Enemy } from './quest'
import type { SimulatorId } from './mathContent'
import type { TopicId } from '../logic/questTopics'

export type BookTheme = 'forest' | 'village' | 'mountain' | 'temple' | 'city'
export type ItemIcon = (typeof chapterLevels)[number]['icon']

export interface QuestPhase {
  title: string
  topic: string
  description: string
  hint: string
  reward: string
  icon: ItemIcon
  topics: TopicId[]
  /** Guardião da saída; `null` é o Grum (chefão do Livro I). */
  guardian: Enemy | null
  simulator?: SimulatorId
}

export interface QuestBook {
  id: string
  roman: string
  title: string
  accent: string
  chapter: string
  summary: string
  theme: BookTheme
  storage: string
  /** Nome do obstáculo que bloqueia o caminho até o guardião. */
  gate: { name: string; article: 'a' | 'o'; broken: string; fixed: string }
  minions: Enemy[]
  villagers: string[]
  phases: QuestPhase[]
}

const livro1Topics: TopicId[] = ['soma-10', 'soma-20', 'subtracao-10', 'subtracao-20', 'misto-30', 'mental-50', 'mult-2-3', 'mult-4-5', 'revisao', 'combinadas']
const livro1Simulators: Array<SimulatorId | undefined> = ['soma', 'soma', 'subtracao', 'subtracao', 'soma', 'subtracao', undefined, undefined, undefined, undefined]

const livro1: QuestBook = {
  id: 'livro-1',
  roman: 'I',
  title: 'Floresta das',
  accent: 'Brasas',
  chapter: 'CAPÍTULO 01 · OS PRIMEIROS NÚMEROS',
  summary: 'Soma, subtração e multiplicação',
  theme: 'forest',
  storage: CHAPTER_STORAGE,
  gate: { name: 'ponte', article: 'a', broken: 'Ponte quebrada', fixed: 'Ponte consertada' },
  minions: [
    { name: 'GOSMINHA', title: 'GELEIA DA TRILHA', kind: 'slime', color: '#8fbf6a', taunt: 'Blub!' },
    { name: 'MORCEGUINHO', title: 'MORCEGO DO MATO', kind: 'bat', color: '#8a7aa8', taunt: 'Chiii!' },
    { name: 'FUNGUINHO', title: 'COGUMELO SALTITANTE', kind: 'mushroom', color: '#c8703f', taunt: 'Pof!' },
  ],
  villagers: ['Coruja Sábia', 'Lenhador Tito', 'Dona Raposa'],
  phases: chapterLevels.map((level, i) => ({
    title: level.title,
    topic: level.topic,
    description: level.description,
    hint: level.hint,
    reward: level.reward,
    icon: level.icon,
    topics: [livro1Topics[i]],
    guardian: i < 9 ? enemies[i] : null,
    simulator: livro1Simulators[i],
  })),
}

const livro2: QuestBook = {
  id: 'livro-2',
  roman: 'II',
  title: 'Vila das',
  accent: 'Frações',
  chapter: 'CAPÍTULO 02 · PARTES DE UM INTEIRO',
  summary: 'Frações, equivalência e porcentagem',
  theme: 'village',
  storage: 'matematica-rpg-book-2-v1',
  gate: { name: 'portão', article: 'o', broken: 'Portão trancado', fixed: 'Portão aberto' },
  minions: [
    { name: 'RATÃO', title: 'LADRÃO DE QUEIJO', kind: 'golem', color: '#9a8f86', taunt: 'Faltou um pedaço!' },
    { name: 'GOSMA-MEL', title: 'GELEIA DA PADARIA', kind: 'slime', color: '#e0a64a', taunt: 'Grudou!' },
    { name: 'CORVO', title: 'O CONTADOR DE MIGALHAS', kind: 'bat', color: '#4f5466', taunt: 'Crá!' },
  ],
  villagers: ['Padeira Lia', 'Mercador Abel', 'Moleiro Juca'],
  phases: [
    { title: 'O mercado das partes', topic: 'O que é uma fração', description: 'Os comerciantes dividem tudo em partes iguais. Descubra que fração cada um vendeu.', hint: 'Embaixo vai o total de partes; em cima, as partes escolhidas.', reward: 'Balança de cobre', icon: 'map', topics: ['fracao-parte'], guardian: { name: 'FATIADOR', title: 'O CORTADOR DE TORTAS', kind: 'mushroom', color: '#d08c5b', taunt: 'Pedaço errado!' }, simulator: 'fracoes' },
    { title: 'A padaria equivalente', topic: 'Frações equivalentes', description: 'A padeira troca pães inteiros por fatias. Ajude a manter as frações equivalentes.', hint: 'Multiplique numerador e denominador pelo mesmo número.', reward: 'Pá de padeiro', icon: 'sword', topics: ['fracao-equivalente', 'fracao-parte'], guardian: { name: 'MASSUDO', title: 'A MASSA QUE CRESCE', kind: 'slime', color: '#e8c37a', taunt: 'Cresci demais!' }, simulator: 'fracoes' },
    { title: 'Torre da simplificação', topic: 'Simplificar frações', description: 'No alto da torre, as frações estão enormes. Simplifique para destrancar as portas.', hint: 'Divida numerador e denominador pelo mesmo número até não dar mais.', reward: 'Chave simplificada', icon: 'gem', topics: ['fracao-simplificar', 'fracao-equivalente'], guardian: { name: 'TIJOLÃO', title: 'O GUARDA DA TORRE', kind: 'golem', color: '#b06a4f', taunt: 'Muito grande!' }, simulator: 'fracoes' },
    { title: 'Feira dos cem quadrados', topic: 'Frações e porcentagem', description: 'Na feira, tudo é medido em cem partes. Transforme frações em porcentagens.', hint: 'Porcentagem é uma fração com denominador 100.', reward: 'Grade da feira', icon: 'spark', topics: ['fracao-porcentagem', 'porcentagem'], guardian: { name: 'CENTENA', title: 'O VAGA-LUME DOS CEM', kind: 'bat', color: '#d9a441', taunt: 'Cem por cento errado!' }, simulator: 'porcentagem' },
    { title: 'Loja dos descontos', topic: 'Descontos e acréscimos', description: 'A loja da vila mudou os preços. Calcule descontos e aumentos para não ser enganado.', hint: 'Ache quanto é a porcentagem e depois some ou subtraia do preço.', reward: 'Bolsa do bom negócio', icon: 'boot', topics: ['desconto', 'porcentagem'], guardian: { name: 'PECHINCHA', title: 'O COGUMELO DO PREÇO', kind: 'mushroom', color: '#8f6bb0', taunt: 'Paga mais!' }, simulator: 'porcentagem' },
    { title: 'Baronesa Metade', topic: 'Chefão · frações e porcentagem', description: 'A Baronesa quer dividir a vila ao meio. Use tudo o que aprendeu para impedi-la!', hint: 'Revise frações, equivalências e porcentagens antes do duelo.', reward: 'Coroa das Partes', icon: 'crown', topics: ['fracao-parte', 'fracao-equivalente', 'fracao-simplificar', 'fracao-porcentagem', 'porcentagem', 'desconto'], guardian: { name: 'BARONESA', title: 'A BARONESA METADE', kind: 'golem', color: '#a8556b', taunt: 'Metade é minha!' }, simulator: 'fracoes' },
  ],
}

const livro3: QuestBook = {
  id: 'livro-3',
  roman: 'III',
  title: 'Montanhas da',
  accent: 'Álgebra',
  chapter: 'CAPÍTULO 03 · O VALOR ESCONDIDO',
  summary: 'Equações, média, mediana e moda',
  theme: 'mountain',
  storage: 'matematica-rpg-book-3-v1',
  gate: { name: 'ponte de corda', article: 'a', broken: 'Ponte de corda solta', fixed: 'Ponte de corda firme' },
  minions: [
    { name: 'PEDRISCO', title: 'PEDRA ROLANTE', kind: 'golem', color: '#8d939c', taunt: 'Rolou!' },
    { name: 'NEVINHA', title: 'GELEIA DE NEVE', kind: 'slime', color: '#a9c7d8', taunt: 'Brrr!' },
    { name: 'ÁGUIA X', title: 'A AVE INCÓGNITA', kind: 'bat', color: '#6d5a48', taunt: 'Quem é x?' },
  ],
  villagers: ['Mineira Rosa', 'Pastor Davi', 'Alpinista Bia'],
  phases: [
    { title: 'A balança da ponte', topic: 'Equações do 1º grau', description: 'A ponte só passa quem equilibra a balança. Descubra o valor de x.', hint: 'Faça a mesma operação nos dois lados da equação.', reward: 'Contrapeso de ferro', icon: 'gem', topics: ['equacao'], guardian: { name: 'EQUILÍBRIO', title: 'O GOLEM DA BALANÇA', kind: 'golem', color: '#7a8a6d', taunt: 'Desequilibrou!' }, simulator: 'equacoes' },
    { title: 'Mina das incógnitas', topic: 'Problemas com equações', description: 'Os mineiros falam por enigmas. Transforme cada um em equação e resolva.', hint: 'Escreva o número desconhecido como x e monte a conta.', reward: 'Picareta de x', icon: 'sword', topics: ['equacao'], guardian: { name: 'MINÉRIO', title: 'O COGUMELO DA MINA', kind: 'mushroom', color: '#5f6b7a', taunt: 'Enigma sem resposta!' }, simulator: 'equacoes' },
    { title: 'Censo da aldeia', topic: 'Média', description: 'O chefe da aldeia quer saber a média de tudo. Conte, some e divida.', hint: 'Média = soma ÷ quantidade.', reward: 'Caderno do censo', icon: 'map', topics: ['media'], guardian: { name: 'MEDIANO', title: 'A GELEIA DA MÉDIA', kind: 'slime', color: '#6a9b8a', taunt: 'Na média, errou!' }, simulator: 'estatistica' },
    { title: 'A fila do meio', topic: 'Mediana', description: 'Na fila da montanha, só o do meio pode passar. Ache a mediana.', hint: 'Coloque em ordem e pegue o valor do meio.', reward: 'Bandeira do meio', icon: 'spark', topics: ['mediana', 'media'], guardian: { name: 'ORDEIRO', title: 'O GOLEM DA FILA', kind: 'golem', color: '#9a7d5c', taunt: 'Fora de ordem!' }, simulator: 'estatistica' },
    { title: 'Festival da moda', topic: 'Moda', description: 'No festival, ganha o valor que mais aparece. Descubra a moda.', hint: 'A moda é o valor que mais se repete.', reward: 'Chapéu da moda', icon: 'mushroom', topics: ['moda', 'mediana', 'media'], guardian: { name: 'REPETECO', title: 'O MORCEGO DO FESTIVAL', kind: 'bat', color: '#b0537a', taunt: 'De novo!' }, simulator: 'estatistica' },
    { title: 'Golem Incógnito', topic: 'Chefão · álgebra e estatística', description: 'No pico mais alto, o Golem Incógnito esconde o valor de tudo. Revele-o!', hint: 'Equações: mesma operação nos dois lados. Estatística: ordene e conte.', reward: 'Coroa da Montanha', icon: 'crown', topics: ['equacao', 'media', 'mediana', 'moda'], guardian: { name: 'INCÓGNITO', title: 'O GOLEM DO PICO', kind: 'golem', color: '#5e6c84', taunt: 'Você nunca achará x!' }, simulator: 'equacoes' },
  ],
}

const livro4: QuestBook = {
  id: 'livro-4',
  roman: 'IV',
  title: 'Templo da',
  accent: 'Geometria',
  chapter: 'CAPÍTULO 04 · FORMAS E ÂNGULOS',
  summary: 'Pitágoras, círculo e trigonometria',
  theme: 'temple',
  storage: 'matematica-rpg-book-4-v1',
  gate: { name: 'porta de pedra', article: 'a', broken: 'Porta de pedra selada', fixed: 'Porta de pedra aberta' },
  minions: [
    { name: 'ESCARAVELHO', title: 'O BESOURO DAS AREIAS', kind: 'bat', color: '#3f7f73', taunt: 'Ângulo torto!' },
    { name: 'AREINHA', title: 'GELEIA DO DESERTO', kind: 'slime', color: '#d8b56a', taunt: 'Shhh!' },
    { name: 'ESTÁTUA', title: 'A ESTÁTUA VIVA', kind: 'golem', color: '#c2a878', taunt: 'Imóvel!' },
  ],
  villagers: ['Arquiteta Nara', 'Escriba Omar', 'Astrônoma Lua'],
  phases: [
    { title: 'Escada de Pitágoras', topic: 'Teorema de Pitágoras', description: 'As escadas do templo formam triângulos retângulos. Calcule cada lado.', hint: 'a² + b² = c² no triângulo retângulo.', reward: 'Esquadro antigo', icon: 'sword', topics: ['pitagoras'], guardian: { name: 'HIPOTENUSO', title: 'O GOLEM DO TRIÂNGULO', kind: 'golem', color: '#b38b59', taunt: 'Lado errado!' }, simulator: 'pitagoras' },
    { title: 'Salão dos ângulos', topic: 'Classificação de triângulos', description: 'Cada porta do salão tem um triângulo. Classifique-os pelo ângulo.', hint: 'Agudo < 90°, reto = 90°, obtuso > 90°.', reward: 'Transferidor dourado', icon: 'spark', topics: ['triangulo', 'pitagoras'], guardian: { name: 'OBTUSO', title: 'O MORCEGO DO SALÃO', kind: 'bat', color: '#a46d3c', taunt: 'Muito aberto!' }, simulator: 'pitagoras' },
    { title: 'A fonte circular', topic: 'Círculo e π', description: 'A fonte do templo é um círculo perfeito. Calcule diâmetros, voltas e áreas.', hint: 'Diâmetro = 2 · raio; comprimento = 2 · π · raio; área = π · raio².', reward: 'Compasso de bronze', icon: 'gem', topics: ['circulo'], guardian: { name: 'REDONDO', title: 'A GELEIA DA FONTE', kind: 'slime', color: '#5ba0b5', taunt: 'Rodei!' }, simulator: 'pi' },
    { title: 'Observatório do seno', topic: 'Seno e cosseno', description: 'Os astrônomos medem o céu com o círculo trigonométrico. Ajude nas contas.', hint: 'Seno é a altura; cosseno, a posição horizontal no círculo de raio 1.', reward: 'Luneta celeste', icon: 'map', topics: ['trigonometria'], guardian: { name: 'ECLIPSE', title: 'O COGUMELO DA SOMBRA', kind: 'mushroom', color: '#6c5a9b', taunt: 'Escureceu!' }, simulator: 'trigonometria' },
    { title: 'Jardim das formas', topic: 'Revisão de geometria', description: 'O jardim mistura triângulos, círculos e ângulos. Prove que domina todos.', hint: 'Desenhe a figura na cabeça antes de calcular.', reward: 'Semente geométrica', icon: 'mushroom', topics: ['pitagoras', 'circulo', 'triangulo', 'trigonometria'], guardian: { name: 'JARDINEIRO', title: 'O GOLEM DO JARDIM', kind: 'golem', color: '#6f9a5a', taunt: 'Poda errada!' }, simulator: 'pi' },
    { title: 'Esfinge dos Ângulos', topic: 'Chefão · geometria', description: 'A Esfinge guarda a saída do templo e só deixa passar quem responde aos seus enigmas.', hint: 'Pitágoras, círculo e trigonometria: revise as fórmulas.', reward: 'Coroa do Templo', icon: 'crown', topics: ['pitagoras', 'triangulo', 'circulo', 'trigonometria'], guardian: { name: 'ESFINGE', title: 'A ESFINGE DOS ÂNGULOS', kind: 'golem', color: '#c9a25c', taunt: 'Enigma não resolvido!' }, simulator: 'trigonometria' },
  ],
}

const livro5: QuestBook = {
  id: 'livro-5',
  roman: 'V',
  title: 'Cidade das',
  accent: 'Funções',
  chapter: 'CAPÍTULO 05 · RELAÇÕES E PADRÕES',
  summary: 'Funções, PA, PG e probabilidade',
  theme: 'city',
  storage: 'matematica-rpg-book-5-v1',
  gate: { name: 'cancela', article: 'a', broken: 'Cancela travada', fixed: 'Cancela liberada' },
  minions: [
    { name: 'ROBOZINHO', title: 'O ROBÔ DA ESQUINA', kind: 'golem', color: '#7f8fa6', taunt: 'Erro 404!' },
    { name: 'POMBO', title: 'O POMBO DA PRAÇA', kind: 'bat', color: '#8c8f99', taunt: 'Ruuu!' },
    { name: 'GOSMA NEON', title: 'GELEIA LUMINOSA', kind: 'slime', color: '#5fc4a0', taunt: 'Bzzt!' },
  ],
  villagers: ['Taxista Rui', 'Engenheira Sol', 'Professora Iara'],
  phases: [
    { title: 'Avenida da reta', topic: 'Valor de uma função', description: 'Os táxis da cidade cobram por quilômetro. Calcule f(x) para cada corrida.', hint: 'Troque o x pelo número e faça a conta.', reward: 'Bilhete de táxi', icon: 'map', topics: ['funcao-valor'], guardian: { name: 'TAXÍMETRO', title: 'O ROBÔ DA AVENIDA', kind: 'golem', color: '#d1a93a', taunt: 'Corrida errada!' }, simulator: 'funcoes' },
    { title: 'Praça das raízes', topic: 'Raiz da função afim', description: 'As lanternas da praça só acendem quando f(x) chega a zero. Ache as raízes.', hint: 'A raiz é o x que faz f(x) = 0.', reward: 'Lanterna da praça', icon: 'fire', topics: ['funcao-raiz', 'funcao-valor'], guardian: { name: 'ZERÃO', title: 'A GELEIA DO ZERO', kind: 'slime', color: '#5b8fd1', taunt: 'Não zerou!' }, simulator: 'funcoes' },
    { title: 'Escadaria da PA', topic: 'Progressão aritmética', description: 'Os prédios crescem sempre o mesmo tanto. Descubra os andares da PA.', hint: 'Na PA, some a razão a cada passo.', reward: 'Degrau de prata', icon: 'boot', topics: ['pa'], guardian: { name: 'DEGRAU', title: 'O GOLEM DA ESCADA', kind: 'golem', color: '#8a6f9e', taunt: 'Pulou degrau!' }, simulator: 'progressoes' },
    { title: 'Torre da PG', topic: 'Progressão geométrica', description: 'A torre dobra de tamanho a cada andar. Calcule os termos da PG.', hint: 'Na PG, multiplique pela razão a cada passo.', reward: 'Antena dobrada', icon: 'spark', topics: ['pg', 'pa'], guardian: { name: 'DOBRADOR', title: 'O MORCEGO DA TORRE', kind: 'bat', color: '#4d7aa8', taunt: 'Dobrei!' }, simulator: 'progressoes' },
    { title: 'Feira das chances', topic: 'Probabilidade', description: 'Na feira de jogos, entenda suas chances antes de escolher.', hint: 'Probabilidade = casos favoráveis ÷ casos possíveis.', reward: 'Dado da sorte', icon: 'gem', topics: ['probabilidade'], guardian: { name: 'ACASO', title: 'O COGUMELO DA SORTE', kind: 'mushroom', color: '#c0506a', taunt: 'Que azar!' }, simulator: 'probabilidade' },
    { title: 'Doutora Função', topic: 'Chefão · funções e padrões', description: 'A Doutora Função travou todos os semáforos da cidade. Só a matemática destrava!', hint: 'Funções, progressões e probabilidade: revise cada fórmula.', reward: 'Coroa da Cidade', icon: 'crown', topics: ['funcao-valor', 'funcao-raiz', 'pa', 'pg', 'probabilidade'], guardian: { name: 'DOUTORA F', title: 'A DOUTORA FUNÇÃO', kind: 'golem', color: '#6b4fa0', taunt: 'f(você) = derrota!' }, simulator: 'funcoes' },
  ],
}

export const questBooks: QuestBook[] = [livro1, livro2, livro3, livro4, livro5]

export function getBook(id: string): QuestBook {
  return questBooks.find((book) => book.id === id) ?? questBooks[0]
}

/** Quantas perguntas tem a batalha contra o guardião: o chefão (última fase) tem 10. */
export const guardianQuestions = (book: QuestBook, phase: number) => (phase === book.phases.length ? 10 : 8)
