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
  /** Missão do simulador: o que o aluno vai descobrir, numa frase. */
  goal: string
  /** Como usar, em três passos curtos. */
  steps: [string, string, string]
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
    goal: 'Descobrir por que dá para “passar” unidades de uma parcela para outra sem mudar a soma.',
    steps: ['Escolha uma conta', 'Transfira unidades até formar uma dezena', 'Veja a soma ficar fácil de fazer de cabeça'],
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
    goal: 'Entender que andar com os dois números juntos não muda a diferença.',
    steps: ['Escolha uma subtração', 'Desloque os dois números na reta', 'Chegue numa dezena e faça a conta de cabeça'],
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
    goal: 'Aprender a ordem certa das operações e nunca mais cair na pegadinha.',
    steps: ['Escolha ou escreva uma expressão', 'Toque na operação que vem primeiro', 'Resolva até chegar no resultado'],
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
    goal: 'Entender a soma e a subtração de números negativos como caminhadas na reta.',
    steps: ['Escolha os números', 'Ande casa por casa na reta', 'Descubra as regras de sinais'],
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
    goal: 'Ver potências como multiplicações repetidas e raízes como o caminho de volta.',
    steps: ['Escolha a base e o expoente', 'Monte quadrados e cubos com peças', 'Descubra a raiz pelo lado da figura'],
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
    goal: 'Ver que uma fração é um inteiro dividido em partes iguais e que ela tem vários “nomes”.',
    steps: ['Divida o inteiro em partes', 'Pinte as partes que quer', 'Compare com decimal, porcentagem e frações equivalentes'],
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
    goal: 'Enxergar a porcentagem como “tantos em cada 100” numa grade de 100 quadradinhos.',
    steps: ['Escolha a porcentagem', 'Pinte a grade de 100', 'Calcule descontos e acréscimos'],
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
    goal: 'Reconhecer razões iguais e resolver regras de três sem decorar.',
    steps: ['Monte uma receita ou um problema', 'Veja a tabela e as setas', 'Resolva passo a passo'],
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
    goal: 'Descobrir o valor de x mantendo a balança sempre equilibrada.',
    steps: ['Escolha uma equação', 'Tire peças dos dois lados ao mesmo tempo', 'Divida até sobrar só um x'],
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
    goal: 'Encontrar o ponto que resolve duas equações ao mesmo tempo.',
    steps: ['Escolha uma situação', 'Ajuste as duas retas', 'Toque no ponto em que elas se cruzam'],
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
    goal: 'Entender de onde vem cada termo das fórmulas dos produtos notáveis.',
    steps: ['Escolha o produto notável', 'Encaixe as peças de área', 'Confira a fórmula com números'],
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
    goal: 'Perceber como cada valor puxa a média, a mediana e a moda.',
    steps: ['Mude os valores do conjunto', 'Observe o gráfico de pontos', 'Compare as três medidas'],
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
    goal: 'Entender as fórmulas de área contando quadradinhos e recortando figuras.',
    steps: ['Escolha a figura', 'Arraste as bolinhas na malha', 'Recorte, duplique e descubra a fórmula'],
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
    goal: 'Descobrir quanto somam os ângulos de qualquer polígono.',
    steps: ['Escolha o número de lados', 'Divida em triângulos', 'Ande em volta e some os ângulos'],
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
    goal: 'Comprovar que, no triângulo retângulo, a² + b² = c².',
    steps: ['Mude o ângulo entre os lados', 'Compare as áreas dos quadrados', 'Descubra quando o triângulo é retângulo'],
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
    goal: 'Descobrir de onde vem o número π e como medir círculos.',
    steps: ['Escolha um experimento', 'Clique para dobrar, girar ou medir', 'Veja o π aparecer em todo círculo'],
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
    goal: 'Ver que paralelas cortam as transversais em pedaços proporcionais.',
    steps: ['Arraste as retas paralelas', 'Incline as transversais', 'Compare as razões a/b e c/d'],
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
    goal: 'Ligar cada coeficiente da lei da função a uma mudança no gráfico.',
    steps: ['Escolha afim ou quadrática', 'Mexa nos coeficientes', 'Observe raízes, vértice e inclinação'],
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
    goal: 'Ver o crescimento exponencial e o logaritmo como sua operação inversa.',
    steps: ['Escolha a base', 'Mova o ponto na curva', 'Mostre o logaritmo e veja o espelho'],
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
    goal: 'Comparar quem cresce somando (PA) com quem cresce multiplicando (PG).',
    steps: ['Escolha PA ou PG', 'Ajuste o primeiro termo e a razão', 'Veja os termos e as fórmulas'],
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
    goal: 'Comparar o crescimento dos juros simples com o dos juros compostos.',
    steps: ['Defina capital, taxa e tempo', 'Escolha um mês no gráfico', 'Compare simples × compostos'],
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
    goal: 'Ver seno, cosseno e tangente como medidas de verdade no círculo.',
    steps: ['Gire o ponto no círculo', 'Observe as projeções nos eixos', 'Relacione com o ângulo'],
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
    goal: 'Fazer operações com matrizes e calcular determinantes sem se perder.',
    steps: ['Edite os números da matriz', 'Escolha a operação', 'Acompanhe cada diagonal ou linha × coluna'],
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
    goal: 'Relacionar as medidas de um sólido com o seu volume e sua área.',
    steps: ['Escolha o sólido', 'Mude as medidas e gire com o dedo', 'Compare com o cilindro ou o prisma'],
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
    goal: 'Contar possibilidades sem listar tudo e saber quando a ordem importa.',
    steps: ['Escolha o tipo de contagem', 'Monte filas, pódios ou grupos', 'Compare sua lista com a fórmula'],
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
    goal: 'Ver a frequência dos lançamentos se aproximar da probabilidade teórica.',
    steps: ['Escolha moeda ou dado', 'Lance muitas vezes', 'Compare o observado com o esperado'],
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
    goal: 'Calcular distância, ponto médio e reta usando só as coordenadas.',
    steps: ['Arraste os pontos A e B', 'Observe o triângulo de Pitágoras', 'Leia a distância e a equação da reta'],
  },
]

export function getContent(id: SimulatorId): MathContent {
  const content = mathContents.find((item) => item.id === id)
  if (!content) throw new Error(`Conteúdo inexistente: ${id}`)
  return content
}
