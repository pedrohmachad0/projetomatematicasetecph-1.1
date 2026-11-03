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
  | 'inteiros'
  | 'proporcao'
  | 'potencias'
  | 'expressoes'
  | 'poligonos'
  | 'areas'
  | 'tales'
  | 'sistemas'
  | 'notaveis'
  | 'exponencial'
  | 'espacial'
  | 'analitica'
  | 'matrizes'
  | 'combinatoria'
  | 'juros'

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
    id: 'expressoes',
    title: 'Expressões Numéricas',
    description: 'Resolva expressões passo a passo e veja por que a ordem das operações muda o resultado.',
    educationLevel: 'fundamental-2',
    grade: '6º ano',
    category: 'Aritmética e Números',
    subject: 'Ordem das operações',
    interaction: 'sequência',
    simulator: 'expressoes',
    available: true,
  },
  {
    id: 'inteiros',
    title: 'Reta dos Inteiros',
    description: 'Ande pela reta com números negativos e positivos e descubra as regras de sinais da soma e da subtração.',
    educationLevel: 'fundamental-2',
    grade: '7º ano',
    category: 'Aritmética e Números',
    subject: 'Números inteiros',
    interaction: 'reta numérica',
    simulator: 'inteiros',
    available: true,
  },
  {
    id: 'potencias',
    title: 'Potências e Raízes',
    description: 'Monte quadrados e cubos com blocos e veja a potência e a raiz como operações inversas.',
    educationLevel: 'fundamental-2',
    grade: '8º ano',
    category: 'Aritmética e Números',
    subject: 'Potenciação e radiciação',
    interaction: 'geométrica',
    simulator: 'potencias',
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
    id: 'proporcao',
    title: 'Razão e Regra de Três',
    description: 'Monte receitas e misturas proporcionais e resolva regras de três diretas e inversas.',
    educationLevel: 'fundamental-2',
    grade: '7º ano',
    category: 'Razão, Proporção e Porcentagem',
    subject: 'Razão, proporção e regra de três',
    interaction: 'manipulação',
    simulator: 'proporcao',
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
    id: 'sistemas',
    title: 'Sistemas de Equações',
    description: 'Ajuste duas retas no plano e encontre o ponto em que as duas equações são verdadeiras.',
    educationLevel: 'fundamental-2',
    grade: '8º ano',
    category: 'Álgebra',
    subject: 'Sistemas do 1º grau',
    interaction: 'gráfico',
    simulator: 'sistemas',
    available: true,
  },
  {
    id: 'notaveis',
    title: 'Produtos Notáveis',
    description: 'Monte (a + b)² com quadrados e retângulos e veja de onde vem cada termo da fórmula.',
    educationLevel: 'fundamental-2',
    grade: '8º ano',
    category: 'Álgebra',
    subject: 'Produtos notáveis e fatoração',
    interaction: 'geométrica',
    simulator: 'notaveis',
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
    id: 'areas',
    title: 'Perímetro e Área',
    description: 'Estique figuras na malha quadriculada e conte os quadradinhos para entender as fórmulas de área.',
    educationLevel: 'fundamental-2',
    grade: '6º ano',
    category: 'Geometria',
    subject: 'Perímetro e área',
    interaction: 'geométrica',
    simulator: 'areas',
    available: true,
  },
  {
    id: 'poligonos',
    title: 'Ângulos e Polígonos',
    description: 'Mude o número de lados de um polígono regular e descubra a soma dos ângulos internos.',
    educationLevel: 'fundamental-2',
    grade: '8º ano',
    category: 'Geometria',
    subject: 'Ângulos e polígonos',
    interaction: 'geométrica',
    simulator: 'poligonos',
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
    id: 'tales',
    title: 'Teorema de Tales',
    description: 'Arraste as retas paralelas e confira que os segmentos nas transversais continuam proporcionais.',
    educationLevel: 'fundamental-2',
    grade: '9º ano',
    category: 'Geometria',
    subject: 'Teorema de Tales',
    interaction: 'geométrica',
    simulator: 'tales',
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
    id: 'exponencial',
    title: 'Exponencial e Logaritmo',
    description: 'Compare o gráfico de aˣ com o de logₐ x e veja como uma função desfaz a outra.',
    educationLevel: 'medio',
    grade: '1º ano',
    category: 'Funções',
    subject: 'Função exponencial e logarítmica',
    interaction: 'gráfico',
    simulator: 'exponencial',
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
    id: 'juros',
    title: 'Juros Simples e Compostos',
    description: 'Simule uma aplicação mês a mês e compare o crescimento em linha reta com o crescimento em curva.',
    educationLevel: 'medio',
    grade: '1º ano',
    category: 'Matemática Financeira',
    subject: 'Juros simples e compostos',
    interaction: 'gráfico',
    simulator: 'juros',
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
    id: 'matrizes',
    title: 'Matrizes e Determinantes',
    description: 'Edite matrizes, some, multiplique e calcule o determinante com as diagonais destacadas.',
    educationLevel: 'medio',
    grade: '2º ano',
    category: 'Matrizes e Sistemas',
    subject: 'Matrizes e determinantes',
    interaction: 'manipulação',
    simulator: 'matrizes',
    available: true,
  },
  {
    id: 'espacial',
    title: 'Geometria Espacial',
    description: 'Gire sólidos em 3D, mude as medidas e acompanhe volume e área da superfície.',
    educationLevel: 'medio',
    grade: '2º ano',
    category: 'Geometria',
    subject: 'Volume e área de sólidos',
    interaction: 'geométrica',
    simulator: 'espacial',
    available: true,
  },
  {
    id: 'combinatoria',
    title: 'Análise Combinatória',
    description: 'Forme filas e grupos com personagens e descubra quando a ordem importa: arranjo ou combinação.',
    educationLevel: 'medio',
    grade: '2º ano',
    category: 'Análise Combinatória e Probabilidade',
    subject: 'Contagem, arranjo e combinação',
    interaction: 'experimento',
    simulator: 'combinatoria',
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
  {
    id: 'analitica',
    title: 'Geometria Analítica',
    description: 'Arraste dois pontos no plano e veja a distância, o ponto médio e a equação da reta.',
    educationLevel: 'medio',
    grade: '3º ano',
    category: 'Geometria',
    subject: 'Distância, ponto médio e reta',
    interaction: 'gráfico',
    simulator: 'analitica',
    available: true,
  },
]

export function getContent(id: SimulatorId): MathContent {
  const content = mathContents.find((item) => item.id === id)
  if (!content) throw new Error(`Conteúdo inexistente: ${id}`)
  return content
}
