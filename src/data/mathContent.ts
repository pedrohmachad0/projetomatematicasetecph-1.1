/**
 * Catálogo central dos conteúdos da plataforma.
 * Novos simuladores devem ser registrados aqui para aparecerem no Hub
 * e para que o cabeçalho de cada simulador use o mesmo nome e classificação.
 */

export type EducationLevel = 'fundamental-2' | 'medio'
export type Grade = '6º ano' | '7º ano' | '8º ano' | '9º ano' | '1º ano' | '2º ano' | '3º ano'
export type InteractionType =
  | 'manipulação'
  | 'reta numérica'
  | 'geométrica'
  | 'gráfico'
  | 'experimento'
  | 'balança'
  | 'sequência'

export type SimulatorId =
  | 'soma'
  | 'subtracao'
  | 'fracoes'
  | 'porcentagem'
  | 'equacoes'
  | 'estatistica'
  | 'pitagoras'
  | 'pi'
  | 'funcoes'
  | 'progressoes'
  | 'trigonometria'
  | 'probabilidade'

export interface MathContent {
  id: SimulatorId
  title: string
  description: string
  educationLevel: EducationLevel
  grade: Grade
  category: string
  subject: string
  interaction: InteractionType
  simulator?: SimulatorId
  available: boolean
}

export const educationLevelLabels: Record<EducationLevel, string> = {
  'fundamental-2': 'Fundamental II',
  medio: 'Ensino Médio',
}

export const mathContents: MathContent[] = [
  {
    id: 'soma',
    title: 'Cálculo Mental: Soma',
    description: 'Transfira unidades entre as parcelas no material dourado e veja a soma continuar igual.',
    educationLevel: 'fundamental-2',
    grade: '6º ano',
    category: 'Aritmética e Números',
    subject: 'Compensação aditiva',
    interaction: 'manipulação',
    simulator: 'soma',
    available: true,
  },
  {
    id: 'subtracao',
    title: 'Cálculo Mental: Subtração',
    description: 'Desloque os dois números juntos na reta numérica e veja a diferença se manter.',
    educationLevel: 'fundamental-2',
    grade: '6º ano',
    category: 'Aritmética e Números',
    subject: 'Deslocamento na reta',
    interaction: 'reta numérica',
    simulator: 'subtracao',
    available: true,
  },
  {
    id: 'fracoes',
    title: 'Explorador de Frações',
    description: 'Divida um inteiro em partes iguais e relacione fração, decimal, porcentagem e simplificação.',
    educationLevel: 'fundamental-2',
    grade: '6º ano',
    category: 'Frações e Números Racionais',
    subject: 'Frações',
    interaction: 'manipulação',
    simulator: 'fracoes',
    available: true,
  },
  {
    id: 'porcentagem',
    title: 'Explorador de Porcentagem',
    description: 'Entenda porcentagens, descontos e acréscimos com uma grade de 100 partes.',
    educationLevel: 'fundamental-2',
    grade: '7º ano',
    category: 'Razão, Proporção e Porcentagem',
    subject: 'Porcentagem',
    interaction: 'manipulação',
    simulator: 'porcentagem',
    available: true,
  },
  {
    id: 'equacoes',
    title: 'Balança de Equações',
    description: 'Resolva equações do 1º grau mantendo a balança equilibrada: o que se faz de um lado, faz-se do outro.',
    educationLevel: 'fundamental-2',
    grade: '7º ano',
    category: 'Álgebra',
    subject: 'Equações do 1º grau',
    interaction: 'balança',
    simulator: 'equacoes',
    available: true,
  },
  {
    id: 'estatistica',
    title: 'Média, Mediana e Moda',
    description: 'Altere os valores de um conjunto de dados e veja o gráfico e as medidas mudarem juntos.',
    educationLevel: 'fundamental-2',
    grade: '8º ano',
    category: 'Estatística',
    subject: 'Medidas de tendência central',
    interaction: 'gráfico',
    simulator: 'estatistica',
    available: true,
  },
  {
    id: 'pitagoras',
    title: 'Explorador de Pitágoras',
    description: 'Mude o ângulo entre dois lados iguais e compare A² + B² com C² para classificar o triângulo.',
    educationLevel: 'fundamental-2',
    grade: '9º ano',
    category: 'Geometria',
    subject: 'Teorema de Pitágoras',
    interaction: 'geométrica',
    simulator: 'pitagoras',
    available: true,
  },
  {
    id: 'pi',
    title: 'Explorador do Círculo',
    description: 'Descubra o número π e explore raio, diâmetro, arcos, cordas e área do setor.',
    educationLevel: 'fundamental-2',
    grade: '9º ano',
    category: 'Geometria',
    subject: 'Círculo e circunferência',
    interaction: 'geométrica',
    simulator: 'pi',
    available: true,
  },
  {
    id: 'funcoes',
    title: 'Explorador de Funções',
    description: 'Ajuste os coeficientes de funções afim e quadrática e veja o gráfico, as raízes e o vértice em tempo real.',
    educationLevel: 'medio',
    grade: '1º ano',
    category: 'Funções',
    subject: 'Função afim e quadrática',
    interaction: 'gráfico',
    simulator: 'funcoes',
    available: true,
  },
  {
    id: 'progressoes',
    title: 'Progressões: PA e PG',
    description: 'Monte sequências aritméticas e geométricas e compare como cada termo cresce.',
    educationLevel: 'medio',
    grade: '1º ano',
    category: 'Progressões',
    subject: 'PA e PG',
    interaction: 'sequência',
    simulator: 'progressoes',
    available: true,
  },
  {
    id: 'trigonometria',
    title: 'Círculo Trigonométrico',
    description: 'Gire um ponto no círculo de raio 1 e veja seno, cosseno e tangente como medidas reais.',
    educationLevel: 'medio',
    grade: '2º ano',
    category: 'Trigonometria',
    subject: 'Seno, cosseno e tangente',
    interaction: 'geométrica',
    simulator: 'trigonometria',
    available: true,
  },
  {
    id: 'probabilidade',
    title: 'Laboratório de Probabilidade',
    description: 'Lance moedas e dados virtuais e compare a frequência observada com a probabilidade teórica.',
    educationLevel: 'medio',
    grade: '2º ano',
    category: 'Análise Combinatória e Probabilidade',
    subject: 'Probabilidade',
    interaction: 'experimento',
    simulator: 'probabilidade',
    available: true,
  },
]

export function getContent(id: SimulatorId): MathContent {
  const content = mathContents.find((item) => item.id === id)
  if (!content) throw new Error(`Conteúdo inexistente: ${id}`)
  return content
}
