import type { SimulatorId } from './mathContent'

/** Roteiro para o professor usar o simulador projetado em sala. */
export interface TeacherGuide {
  /** O que a turma deve sair sabendo. */
  objective: string
  /** Passos da aula, na ordem, com o que fazer no simulador. */
  plan: string[]
  /** Perguntas para lançar à turma antes de mexer no simulador. */
  questions: string[]
  /** Erros comuns e como o simulador ajuda a desfazê-los. */
  mistakes: string[]
  /** Tempo sugerido, em minutos. */
  minutes: number
}

export const teacherGuides: Record<SimulatorId, TeacherGuide> = {
  soma: {
    objective: 'Somar de cabeça transformando uma parcela em dezena exata, sem mudar o resultado.',
    minutes: 20,
    plan: ['Mostre 12 + 27 e peça que a turma calcule de cabeça; anote as estratégias.', 'Clique em "1 para B" duas vezes e pergunte por que a soma não mudou.', 'Peça a um aluno que escolha o próximo problema e diga quantas unidades transferir.', 'Feche com os desafios: duas dezenas exatas e uma parcela zerada.'],
    questions: ['Se eu tiro 2 de um número e dou para o outro, o total muda?', 'Qual é mais fácil de somar: 12 + 27 ou 10 + 29? Por quê?', 'Dá para usar a mesma ideia com 48 + 35?'],
    mistakes: ['Tirar de uma parcela e esquecer de colocar na outra: o selo "Conta alterada" aparece na hora.', 'Achar que a soma muda quando as parcelas mudam: o resultado fica fixo enquanto os cubinhos passam.'],
  },
  subtracao: {
    objective: 'Entender que somar ou tirar o mesmo valor dos dois números mantém a diferença.',
    minutes: 20,
    plan: ['Mostre 27 − 12 e destaque a trena amarela: ela é a diferença.', 'Use −1 e +1 e peça que a turma observe a trena: ela desliza, mas não muda de tamanho.', 'Desloque até o subtraendo virar dezena exata e resolva de cabeça.', 'Compare com a estratégia "emprestar" do algoritmo.'],
    questions: ['A distância entre duas pessoas muda se as duas andarem um passo para a frente?', 'Como transformar 52 − 27 numa conta fácil?', 'Por que é melhor deixar o subtraendo (e não o minuendo) redondo?'],
    mistakes: ['Deslocar só um dos números: a diferença muda e o aviso aparece.', 'Confundir com a soma (passar de um para o outro): aqui os dois andam juntos.'],
  },
  expressoes: {
    objective: 'Resolver expressões na ordem correta: parênteses, multiplicação e divisão, soma e subtração.',
    minutes: 25,
    plan: ['Escreva 2 + 3 × 4 no quadro e faça uma votação: 20 ou 14?', 'Projete o simulador e peça que a turma diga onde tocar primeiro.', 'Mostre a escadinha da ordem e a pegadinha da esquerda para a direita.', 'Peça expressões inventadas pelos alunos no campo "Escreva a sua".'],
    questions: ['Por que precisamos combinar uma ordem para as operações?', 'Como fazer 2 + 3 × 4 dar 20?', 'Numa expressão só com + e −, qual a ordem?'],
    mistakes: ['Resolver tudo da esquerda para a direita: o simulador mostra o resultado errado da pegadinha.', 'Fazer a soma antes da multiplicação: tocar no + mostra a dica em amarelo.'],
  },
  fracoes: {
    objective: 'Ler, representar e comparar frações como partes iguais de um inteiro.',
    minutes: 25,
    plan: ['Comece pela pizza: 1/4 e peça que um aluno toque nas fatias.', 'Troque para chocolate e copo mantendo a fração: é a mesma quantidade.', 'Mostre as equivalentes: 1/2 = 2/4 = 3/6 ocupam o mesmo espaço.', 'Termine na reta: onde fica 3/4 entre 0 e 1?'],
    questions: ['O que o número de baixo (denominador) diz?', 'Quem come mais: quem pega 2/4 ou 1/2 da pizza?', 'Uma fração pode ser maior que 1?'],
    mistakes: ['Achar que 1/8 é maior que 1/4 porque 8 > 4: compare as fatias na pizza.', 'Partes desiguais: o simulador sempre divide o inteiro em partes iguais.'],
  },
  areas: {
    objective: 'Diferenciar área de perímetro e entender de onde vêm as fórmulas de área.',
    minutes: 30,
    plan: ['Monte um retângulo 6 × 4 e use "Contar quadradinhos".', 'Use "Andar pelo contorno" para mostrar o perímetro.', 'Paralelogramo: recorte e mova o triângulo; a área é base × altura.', 'Triângulo e trapézio: duplique a figura e divida por 2.'],
    questions: ['Dois terrenos com a mesma área têm o mesmo tamanho de cerca?', 'Por que a área do triângulo tem "÷ 2"?', 'Se eu inclino o paralelogramo, a área muda?'],
    mistakes: ['Somar os lados para calcular a área: os dois números aparecem lado a lado.', 'Usar o lado inclinado como altura: a altura tracejada fica sempre na vertical.'],
  },
  inteiros: {
    objective: 'Somar e subtrair números inteiros como deslocamentos na reta.',
    minutes: 25,
    plan: ['Comece com temperatura: −3 °C e esquenta 5 graus.', 'Use "Andar casa por casa" e peça que a turma conte os pulos em voz alta.', 'Passe para Subtrair: 2 − (−4) vira 2 + 4.', 'Termine no Comparar: −5 é maior ou menor que −2?'],
    questions: ['O que significa somar um número negativo?', 'Por que tirar um negativo faz o número aumentar?', 'Quem está mais perto do zero: −7 ou 4?'],
    mistakes: ['Achar que −5 > −2 porque 5 > 2: o modo Comparar mostra quem está mais à esquerda.', 'Errar o sinal em 2 − (−4): o simulador reescreve como soma do oposto.'],
  },
  porcentagem: {
    objective: 'Entender porcentagem como partes de 100 e calcular descontos e acréscimos.',
    minutes: 25,
    plan: ['Mostre 20% de 200: cada quadradinho vale 2.', 'Use os atalhos: 10% = ÷10, 25% = ÷4, 50% = metade.', 'Troque para Desconto e leia a etiqueta com a turma.', 'Acréscimo: os quadradinhos extras passam dos 100.'],
    questions: ['O que quer dizer "por cento"?', 'Desconto de 20% e depois acréscimo de 20% volta ao preço original?', 'Como calcular 30% de cabeça?'],
    mistakes: ['Somar a porcentagem ao preço (200 + 20): a grade mostra que 20% de 200 é 40.', 'Confundir o valor do desconto com o preço final: a etiqueta mostra os dois.'],
  },
  proporcao: {
    objective: 'Reconhecer razões iguais e resolver regras de três diretas e inversas.',
    minutes: 30,
    plan: ['Monte uma receita de suco 1:3 e dobre: a cor não muda.', 'Mostre a tabela de proporção e peça o próximo valor.', 'Regra de três direta com pães: resolva passo a passo.', 'Inversa com pedreiros: mais gente, menos dias.'],
    questions: ['Se a receita dobra, o sabor muda?', 'Como saber se é direta ou inversa?', '8 pedreiros terminam mais rápido ou mais devagar que 4?'],
    mistakes: ['Usar a regra direta num caso inverso: as setas mudam de sentido.', 'Somar em vez de multiplicar (2:4 → 3:5): a jarra muda de cor.'],
  },
  equacoes: {
    objective: 'Resolver equações do 1º grau mantendo a igualdade, como numa balança.',
    minutes: 30,
    plan: ['Pergunte quanto vale a caixa em x + 5 = 12 antes de mexer.', 'Faça uma operação "Só no esquerdo" de propósito: a balança pende.', 'Resolva fazendo a mesma operação nos dois lados.', 'Passe para 3x + 1 = 10, que exige dividir.'],
    questions: ['O que acontece com a balança se eu tiro 1 de um lado só?', 'Por que dividimos por 3 em 3x = 9?', 'Como conferir se a resposta está certa?'],
    mistakes: ['"Passar para o outro lado trocando o sinal" sem entender: aqui a operação acontece nos dois pratos.', 'Dividir só um termo: a balança e o selo ≠ mostram o erro.'],
  },
  potencias: {
    objective: 'Entender potência como multiplicação repetida e raiz como operação inversa.',
    minutes: 25,
    plan: ['Mostre 2³ com os pontinhos agrupados.', 'Desça a escada de potências até 2⁰ = 1.', 'Raiz quadrada: monte quadrados com 16, 20 e 25 quadradinhos.', 'Cubo: aresta 3 e a raiz cúbica de 27.'],
    questions: ['3² é igual a 3 × 2?', 'Por que qualquer número elevado a 0 dá 1?', 'Entre quais inteiros fica √20?'],
    mistakes: ['Multiplicar base pelo expoente (3² = 6): a expansão mostra 3 × 3.', 'Achar que a⁰ = 0: a escada mostra a divisão até 1.'],
  },
  sistemas: {
    objective: 'Resolver sistemas de duas equações e interpretar a solução no gráfico.',
    minutes: 30,
    plan: ['Leia a história dos carros e motos e peça palpites.', 'Mostre as duas retas e o ponto de cruzamento.', 'Peça que alunos toquem em pontos e confiram as duas equações.', 'Monte um sistema sem solução (retas paralelas).'],
    questions: ['Todo ponto da reta azul resolve qual equação?', 'Por que a solução tem que estar nas duas retas?', 'Duas retas podem não se cruzar?'],
    mistakes: ['Achar um par que resolve só uma equação: o teste de ponto mostra qual falhou.', 'Esquecer de conferir: a cena da história confere rodas e veículos.'],
  },
  notaveis: {
    objective: 'Entender de onde vêm os produtos notáveis usando áreas.',
    minutes: 25,
    plan: ['Pergunte: (3 + 2)² é 9 + 4?', 'Encaixe as peças de (a + b)² e conte os quadradinhos.', 'Mostre o quadrado da diferença e o b² que volta.', 'Termine com (a + b)(a − b) virando retângulo.'],
    questions: ['De onde vem o "2ab"?', 'Por que no quadrado da diferença o b² é somado?', 'Como fatorar x² + 6x + 9?'],
    mistakes: ['(a + b)² = a² + b²: faltam os dois retângulos verdes.', 'Esquecer o sinal do 2ab na diferença: as faixas vermelhas são tiradas.'],
  },
  poligonos: {
    objective: 'Calcular a soma dos ângulos internos de um polígono e classificar ângulos.',
    minutes: 25,
    plan: ['Divida o pentágono em triângulos.', 'Mude o número de lados e peça a regra (n − 2) × 180°.', 'Use "Andar em volta" para os ângulos externos (360°).', 'No modo ângulos, classifique agudo, reto, obtuso.'],
    questions: ['Quantos triângulos cabem num hexágono a partir de um vértice?', 'Quanto a tartaruga vira no total?', 'Por que o ângulo interno do hexágono é 120°?'],
    mistakes: ['Dividir por n errado ou usar n em vez de n − 2: a divisão em triângulos mostra.', 'Confundir ângulo interno e externo: os dois aparecem com cores diferentes.'],
  },
  estatistica: {
    objective: 'Calcular e comparar média, mediana e moda.',
    minutes: 25,
    plan: ['Mostre as notas da turma e a gangorra equilibrada na média.', 'Teste outro ponto de apoio: a gangorra pende.', 'Use o conjunto com valor discrepante.', 'Adicione e tire valores tocando na régua.'],
    questions: ['Por que a média é o ponto de equilíbrio?', 'Uma nota 0 muda mais a média ou a mediana?', 'Um conjunto pode ter duas modas?'],
    mistakes: ['Calcular a mediana sem ordenar: o painel "Dados em ordem" destaca os do meio.', 'Achar que a média é sempre um dos valores: ela pode cair entre eles.'],
  },
  pitagoras: {
    objective: 'Verificar que, no triângulo retângulo, a² + b² = c².',
    minutes: 25,
    plan: ['Comece em 90° e mostre os três quadrados.', 'Despeje a água de A² e B² em C²: enche certinho.', 'Mude para 60° e 120° e despeje de novo.', 'Classifique os triângulos pelos resultados.'],
    questions: ['O que acontece com C² quando o ângulo aumenta?', 'Em que ângulo as áreas se igualam?', 'Como descobrir a diagonal de uma TV?'],
    mistakes: ['Aplicar Pitágoras em triângulo que não é retângulo: a água transborda ou falta.', 'Somar os lados em vez das áreas: os quadrados mostram as áreas.'],
  },
  pi: {
    objective: 'Descobrir o π e explorar as partes, os arcos e a área do círculo.',
    minutes: 30,
    plan: ['Peça o palpite: quantos diâmetros cabem na volta?', 'Dobre o diâmetro três vezes e meça o que sobra.', 'Jogo das partes: chame alunos para tocar.', 'Pizza: rearrume as fatias e chegue a πr².'],
    questions: ['A volta de uma moeda é maior que 3 diâmetros?', 'Por que o π é o mesmo em qualquer círculo?', 'De onde vem o r² na fórmula da área?'],
    mistakes: ['Confundir raio e diâmetro: o jogo das partes treina isso.', 'Usar 2πr para a área: a pizza mostra base πr e altura r.'],
  },
  tales: {
    objective: 'Usar o Teorema de Tales para calcular segmentos e alturas.',
    minutes: 25,
    plan: ['Arraste as paralelas e compare a/b com c/d.', 'Incline as transversais: a razão continua igual.', 'Resolva o segmento que falta.', 'Feche medindo a árvore pela sombra.'],
    questions: ['O que as paralelas garantem?', 'Por que dá para medir a árvore sem subir nela?', 'E se as retas não fossem paralelas?'],
    mistakes: ['Montar a proporção com segmentos trocados: as cores ligam a com c e b com d.', 'Esquecer que só vale com paralelas: o simulador mantém as retas paralelas.'],
  },
  funcoes: {
    objective: 'Relacionar a lei da função com o gráfico.',
    minutes: 30,
    plan: ['Esconda a curva e jogue 5 valores de x na máquina.', 'Mostre a curva passando pelos pontos.', 'Mude a e b na afim: inclinação e ponto de corte.', 'Na quadrática, explore Δ, raízes e vértice.'],
    questions: ['O que a máquina faz com o x?', 'O que muda na reta quando o b muda?', 'Por que uma parábola pode não tocar o eixo x?'],
    mistakes: ['Trocar x e y ao marcar o ponto: a máquina mostra entrada e saída.', 'Confundir a com b: mexa em um de cada vez.'],
  },
  exponencial: {
    objective: 'Entender o crescimento exponencial e o logaritmo como sua inversa.',
    minutes: 30,
    plan: ['Comece pelas bactérias: passe as horas.', 'Mostre o gráfico de 2ˣ e o ponto (0, 1).', 'Mostre o logaritmo espelhado em y = x.', 'Faça a pergunta do logaritmo: 2 elevado a quanto dá 32?'],
    questions: ['Depois de 10 horas, quantas bactérias?', 'Por que todo aˣ passa por (0, 1)?', 'O que o logaritmo pergunta?'],
    mistakes: ['Confundir crescimento exponencial com linear (2x): a tabela mostra a diferença.', 'Achar que log transforma em multiplicação: a pergunta inversa deixa claro.'],
  },
  progressoes: {
    objective: 'Diferenciar PA (soma constante) de PG (multiplicação constante).',
    minutes: 25,
    plan: ['Construa uma PA termo a termo.', 'Mostre a parte clara: o acréscimo é sempre igual.', 'Troque para PG e compare o crescimento.', 'Use as fórmulas do termo geral com os valores.'],
    questions: ['Qual cresce mais rápido no longo prazo?', 'Como achar o 20º termo sem escrever todos?', 'Uma PG pode diminuir?'],
    mistakes: ['Usar a fórmula da PA numa PG: a construção mostra o acréscimo crescendo.', 'Errar o (n − 1) do termo geral: os valores aparecem na fórmula.'],
  },
  juros: {
    objective: 'Comparar juros simples e compostos ao longo do tempo.',
    minutes: 25,
    plan: ['Defina R$ 1.000 a 3% ao mês.', 'Compare os cofrinhos no mês 1 e no mês 12.', 'Aumente a taxa e o tempo: a curva se afasta da reta.', 'Discuta cartão de crédito e cheque especial.'],
    questions: ['No primeiro mês, qual rende mais?', 'Por que os compostos crescem mais depois?', 'Em quanto tempo o dinheiro dobra a 10% ao mês?'],
    mistakes: ['Calcular o composto somando sempre o mesmo juro: a tabela mostra o juro do mês crescendo.', 'Esquecer de converter a taxa (10% = 0,1): a fórmula aparece com os valores.'],
  },
  trigonometria: {
    objective: 'Ver seno, cosseno e tangente como medidas no círculo de raio 1.',
    minutes: 30,
    plan: ['Arraste o ponto até 30°, 45° e 60°.', 'Gire uma volta e desenhe a onda do seno.', 'Discuta os sinais em cada quadrante.', 'Mostre a relação sen² + cos² = 1.'],
    questions: ['Por que o seno nunca passa de 1?', 'Em que ângulos o seno é zero?', 'Onde a tangente não existe?'],
    mistakes: ['Trocar seno e cosseno: as cores ligam o eixo y ao seno e o x ao cosseno.', 'Esquecer o sinal no 2º quadrante: os valores mostram o sinal.'],
  },
  probabilidade: {
    objective: 'Comparar frequência observada com probabilidade teórica.',
    minutes: 25,
    plan: ['Peça palpites: em 10 lançamentos, quantas caras?', 'Lance 1 vez algumas vezes e anote.', 'Lance +1.000 e compare com a linha tracejada.', 'Dois dados: por que o 7 aparece mais?'],
    questions: ['Se saíram 3 caras seguidas, a próxima é mais provável coroa?', 'O que acontece com muitos lançamentos?', 'Quantas formas de somar 7 com dois dados?'],
    mistakes: ['Achar que a moeda "lembra" o resultado: a faixa dos últimos mostra sequências.', 'Esperar exatamente 50%: com poucos lançamentos a diferença é grande.'],
  },
  matrizes: {
    objective: 'Operar matrizes e calcular determinantes, entendendo o que eles medem.',
    minutes: 30,
    plan: ['Mostre A × B tocando nos elementos (linha × coluna).', 'Teste B × A: a ordem importa.', 'Calcule o determinante 3×3 diagonal por diagonal.', 'No 2×2, transforme o quadradinho: a área é o determinante.'],
    questions: ['Por que A × B pode ser diferente de B × A?', 'O que significa determinante zero?', 'Como a matriz identidade age?'],
    mistakes: ['Multiplicar elemento a elemento: o destaque mostra linha × coluna.', 'Esquecer de subtrair as diagonais secundárias: elas aparecem em vermelho.'],
  },
  espacial: {
    objective: 'Calcular volume e área de sólidos e relacionar com a planificação.',
    minutes: 30,
    plan: ['Gire o cubo e conte os cubinhos.', 'Abra a planificação e some as faces.', 'Compare o cone com o cilindro (1/3).', 'Mostre a esfera dentro do cilindro de Arquimedes.'],
    questions: ['Quantas faces tem a planificação do cubo?', 'Por que o cone tem 1/3 do volume do cilindro?', 'Por que não dá para planificar a esfera?'],
    mistakes: ['Confundir volume (u³) com área (u²): os dois aparecem separados.', 'Esquecer as bases no cilindro: a planificação mostra os dois círculos.'],
  },
  combinatoria: {
    objective: 'Decidir quando a ordem importa e contar sem listar tudo.',
    minutes: 30,
    plan: ['Princípio da contagem com camisetas e calças.', 'Pódio: monte possibilidades com os personagens.', 'Comissão: veja grupos repetidos em outra ordem.', 'Compare a lista completa com a fórmula.'],
    questions: ['Ana 1º e Beto 2º é igual a Beto 1º e Ana 2º?', 'E numa comissão?', 'Por que multiplicamos as opções?'],
    mistakes: ['Usar arranjo quando a ordem não importa: o simulador avisa grupo repetido.', 'Somar em vez de multiplicar no princípio da contagem: a árvore mostra os ramos.'],
  },
  analitica: {
    objective: 'Calcular distância, ponto médio e equação da reta usando coordenadas.',
    minutes: 30,
    plan: ['Arraste A e B e mostre o triângulo de Pitágoras.', 'Faça a corrida: pássaro × pedestre.', 'Mostre o ponto médio como média das coordenadas.', 'Ligue a reta e leia o coeficiente angular.'],
    questions: ['Por que a distância é a hipotenusa?', 'Quem chega primeiro na corrida? Sempre?', 'O que o m da reta diz?'],
    mistakes: ['Somar Δx e Δy como distância: a corrida mostra a diferença.', 'Calcular Δy ÷ Δx invertido: o painel mostra a conta.'],
  },
}
