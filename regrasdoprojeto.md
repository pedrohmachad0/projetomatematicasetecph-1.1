# REGRAS DO PROJETO --- Plataforma de Simuladores Matemáticos Interativos

## 1. Objetivo deste documento

Este arquivo define as regras técnicas, matemáticas, visuais e de
desenvolvimento que devem ser seguidas durante a criação e manutenção da
Plataforma de Simuladores Matemáticos Interativos.

O projeto é uma aplicação web educacional composta por uma página
inicial (Hub) e três simuladores matemáticos interativos:

1.  Explorador de Pitágoras e Áreas Triangulares
2.  Cálculo Mental por Compensação Aditiva (Soma)
3.  Cálculo Mental por Deslocamento (Subtração na Reta)

A aplicação deve priorizar clareza, interatividade, correção matemática
e facilidade de uso em sala de aula, especialmente em projetor ou TV.

------------------------------------------------------------------------

# 2. Stack oficial

## 2.1 Linguagem

A linguagem oficial do projeto é:

-   TypeScript

JavaScript puro não deve ser utilizado para implementar novas
funcionalidades.

## 2.2 Frontend

Utilizar:

-   React
-   Vite

## 2.3 Estilização

Utilizar:

-   Tailwind CSS

CSS adicional pode ser criado quando realmente necessário.

## 2.4 Elementos matemáticos

Priorizar:

-   SVG

Canvas somente deve ser utilizado quando existir uma necessidade técnica
real que torne SVG inadequado.

## 2.5 Animações

Utilizar:

-   Framer Motion

As animações devem ajudar na compreensão do conceito e não apenas servir
como decoração.

## 2.6 Ícones

Utilizar:

-   Lucide React

Não adicionar bibliotecas de ícones diferentes sem necessidade.

## 2.7 Qualidade

Utilizar:

-   ESLint
-   Prettier
-   Vitest
-   React Testing Library

## 2.8 Versionamento

Utilizar:

-   Git
-   GitHub

------------------------------------------------------------------------

# 3. Regra principal: não alterar o objetivo do projeto

A IA de programação deve seguir a especificação original.

Não deve:

-   remover simuladores;
-   alterar os conceitos matemáticos;
-   substituir os simuladores por páginas estáticas;
-   transformar a aplicação em um projeto diferente;
-   adicionar sistemas complexos que não sejam necessários.

Novas funcionalidades só devem ser adicionadas quando forem compatíveis
com o objetivo educacional ou quando forem solicitadas explicitamente.

------------------------------------------------------------------------

# 4. Regra de desenvolvimento incremental

Nunca implementar todo o projeto de uma única vez sem validação.

A ordem recomendada é:

1.  Estrutura do projeto
2.  Layout global
3.  Página inicial
4.  Navegação
5.  Simulador de Pitágoras
6.  Simulador de Soma
7.  Simulador de Subtração
8.  Responsividade
9.  Acessibilidade
10. Testes
11. Build de produção

Depois de cada etapa importante:

-   executar a aplicação;
-   verificar erros;
-   testar a funcionalidade;
-   corrigir problemas antes de avançar.

------------------------------------------------------------------------

# 5. Regra de funcionamento real

Uma funcionalidade não deve ser considerada concluída apenas porque o
código foi escrito.

É obrigatório verificar a aplicação em execução.

Antes de concluir uma etapa:

-   iniciar o projeto;
-   abrir a página correspondente;
-   testar os controles;
-   verificar o console;
-   confirmar os resultados matemáticos;
-   verificar o comportamento visual.

------------------------------------------------------------------------

# 6. Regras de arquitetura

O projeto deve ser componentizado.

Não concentrar toda a aplicação em um único arquivo.

Separar:

-   páginas;
-   componentes;
-   dados;
-   lógica matemática;
-   utilitários;
-   estilos;
-   testes.

A lógica matemática deve ficar separada da apresentação visual sempre
que possível.

Exemplo:

``` text
src/
├── components/
├── pages/
├── data/
├── utils/
├── hooks/
└── tests/
```

------------------------------------------------------------------------

# 7. Regra de componentes

Componentes devem possuir responsabilidades claras.

Evitar componentes gigantes.

Um componente deve fazer uma coisa principal.

Exemplo:

``` text
PythagorasSimulator
├── AngleControl
├── Triangle
├── Square
├── AreaPanel
└── ClassificationMessage
```

Não duplicar componentes quando eles puderem ser reutilizados.

------------------------------------------------------------------------

# 8. Regra de estado

O estado da aplicação deve ser controlado pelo React.

Não utilizar manipulação direta do DOM como estratégia principal.

Evitar:

``` ts
document.querySelector(...)
```

para controlar elementos que poderiam ser controlados pelo estado do
React.

O fluxo preferencial deve ser:

``` text
ação do usuário
↓
alteração do estado
↓
recalculo
↓
renderização
↓
feedback visual
```

------------------------------------------------------------------------

# 9. Regra matemática geral

Toda informação matemática exibida na interface deve ser derivada de
cálculos reais.

Não utilizar valores falsos apenas para fazer a interface parecer
funcionar.

Os cálculos devem ser determinísticos e testáveis.

Quando possível, criar funções matemáticas independentes dos componentes
visuais.

------------------------------------------------------------------------

# 10. Regras do Simulador de Pitágoras

## 10.1 Ângulo

O ângulo deve:

-   iniciar em um valor válido;
-   variar de 10° até 120°;
-   mudar em incrementos de 10°;
-   nunca ultrapassar esses limites.

Controles:

-   -10°
-   +10°

## 10.2 Triângulo

Dois lados devem permanecer fixos e possuir a mesma medida.

O terceiro lado deve ser calculado conforme o ângulo.

Não usar valores pré-calculados para simular a geometria.

## 10.3 Quadrados

Devem existir três quadrados:

-   quadrado sobre o primeiro lado;
-   quadrado sobre o segundo lado;
-   quadrado sobre o terceiro lado.

Os dois primeiros permanecem neutros.

O terceiro é dinâmico.

## 10.4 Classificação

Usar exatamente:

-   ângulo \< 90° → acutângulo;
-   ângulo = 90° → retângulo;
-   ângulo \> 90° → obtusângulo.

Cores previstas na proposta:

-   acutângulo → amarelo;
-   retângulo → verde;
-   obtusângulo → laranja.

Além da cor, a classificação deve aparecer em texto.

## 10.5 Comparação das áreas

A interface deve mostrar a comparação entre:

``` text
A² + B²
```

e

``` text
C²
```

A mensagem deve ser atualizada conforme o ângulo.

Para ângulo menor que 90°:

``` text
A² + B² > C²
```

Para 90°:

``` text
A² + B² = C²
```

Para ângulo maior que 90°:

``` text
A² + B² < C²
```

------------------------------------------------------------------------

# 11. Regras do Simulador de Soma

## 11.1 Problemas

Devem existir 10 problemas pré-configurados.

Os problemas devem ficar separados da interface, preferencialmente em:

``` text
src/data/additionProblems.ts
```

## 11.2 Material Dourado

Representar cada parcela com:

-   barras de dezena;
-   cubos de unidade.

## 11.3 Transferência

O usuário deve conseguir transferir unidades entre as parcelas.

A transferência deve alterar os valores de forma real.

Exemplo:

``` text
12 + 27 = 39
```

pode se transformar em:

``` text
10 + 29 = 39
```

O resultado deve permanecer constante.

## 11.4 Animação

Quando uma unidade for transferida:

-   mostrar a saída visual;
-   mostrar a chegada;
-   atualizar os valores;
-   atualizar a expressão.

## 11.5 Dezena exata

Quando uma parcela atingir uma dezena exata:

-   destacar visualmente o número;
-   mostrar uma explicação;
-   indicar que o cálculo mental foi facilitado.

------------------------------------------------------------------------

# 12. Regras do Simulador de Subtração

## 12.1 Problemas

Devem existir 10 problemas pré-configurados.

Os dados devem ficar separados da interface.

## 12.2 Reta numérica

A reta deve possuir:

-   marcações;
-   números;
-   dois marcadores;
-   segmento representando a distância.

## 12.3 Deslocamento

Os dois números devem se deslocar juntos.

Controles:

-   -1
-   +1

Adicionar ou subtrair o mesmo valor aos dois termos deve manter a
diferença.

Exemplo:

``` text
27 - 12 = 15
```

pode se transformar em:

``` text
25 - 10 = 15
```

## 12.4 Posição original

A posição inicial deve continuar indicada de forma discreta.

## 12.5 Dezena

Quando o subtraendo atingir uma dezena inteira:

-   destacar o valor;
-   exibir uma explicação;
-   indicar que a conta ficou mais simples mentalmente.

------------------------------------------------------------------------

# 13. Regra de consistência matemática

Sempre que uma operação alterar os dados:

1.  recalcular;
2.  validar;
3.  atualizar a representação;
4.  atualizar o texto;
5.  verificar se a propriedade matemática continua verdadeira.

Nunca permitir que a interface mostre uma expressão matematicamente
inconsistente.

------------------------------------------------------------------------

# 14. Regras de interface

A interface deve ser:

-   moderna;
-   limpa;
-   educacional;
-   profissional;
-   fácil de compreender.

Evitar aparência excessivamente infantil.

Priorizar:

-   títulos grandes;
-   controles grandes;
-   bom contraste;
-   espaçamento;
-   hierarquia visual;
-   poucos elementos desnecessários.

------------------------------------------------------------------------

# 15. Regra para projetor e TV

Como a plataforma será utilizada em sala de aula, todos os elementos
importantes devem ser legíveis à distância.

Priorizar:

-   fontes maiores;
-   botões grandes;
-   contraste;
-   área central de simulação;
-   pouca informação desnecessária.

------------------------------------------------------------------------

# 16. Responsividade

A aplicação deve funcionar em:

-   desktop;
-   notebook;
-   projetor;
-   TV;
-   tablet.

Não deve existir overflow horizontal desnecessário.

Em telas menores, reorganizar os elementos sem destruir a
funcionalidade.

------------------------------------------------------------------------

# 17. Acessibilidade

Todos os controles interativos devem ser acessíveis.

Utilizar:

-   `aria-label` quando necessário;
-   foco visível;
-   navegação por teclado;
-   textos claros;
-   contraste adequado.

Não depender somente da cor para comunicar um estado.

Exemplo:

Não mostrar apenas um quadrado verde.

Mostrar também:

``` text
TRIÂNGULO RETÂNGULO
```

------------------------------------------------------------------------

# 18. Regra de animações

Animações devem ter propósito.

Priorizar:

-   transição do triângulo;
-   redimensionamento do quadrado;
-   movimentação dos cubos;
-   deslocamento dos números.

Evitar:

-   animações excessivas;
-   efeitos que dificultem a leitura;
-   elementos piscando sem necessidade;
-   transições longas.

------------------------------------------------------------------------

# 19. Regra de dependências

Não instalar uma biblioteca apenas porque ela parece útil.

Antes de adicionar uma dependência:

1.  verificar se a funcionalidade pode ser feita com as ferramentas
    existentes;
2.  verificar se a biblioteca realmente simplifica o projeto;
3.  evitar dependências redundantes;
4.  manter o projeto leve.

------------------------------------------------------------------------

# 20. Regra de código

O código deve:

-   utilizar TypeScript;
-   evitar `any`;
-   possuir nomes claros;
-   evitar duplicação;
-   utilizar funções pequenas;
-   manter componentes focados;
-   manter cálculos testáveis;
-   evitar comentários óbvios;
-   comentar somente lógica que realmente precise de explicação.

------------------------------------------------------------------------

# 21. Regra de segurança

A aplicação não deve possuir:

-   credenciais secretas no código;
-   chaves de API expostas;
-   senhas hardcoded;
-   informações sensíveis desnecessárias.

Como o MVP não exige backend, não criar servidor ou banco de dados sem
necessidade.

------------------------------------------------------------------------

# 22. Regra de dados

Os exercícios pré-configurados devem ser tratados como dados.

Não espalhar os valores diretamente pelos componentes.

Preferir:

``` ts
const additionProblems = [...]
```

e:

``` ts
const subtractionProblems = [...]
```

em arquivos próprios.

Isso deve facilitar futuras alterações.

------------------------------------------------------------------------

# 23. Regra de testes

Testar principalmente a lógica matemática.

### Pitágoras

Testar:

-   10°;
-   60°;
-   90°;
-   120°.

Verificar:

-   lados;
-   áreas;
-   classificação;
-   comparação.

### Soma

Testar:

-   transferência esquerda;
-   transferência direita;
-   manutenção do resultado;
-   chegada em dezena.

### Subtração

Testar:

-   deslocamento para esquerda;
-   deslocamento para direita;
-   manutenção da diferença;
-   chegada em dezena.

------------------------------------------------------------------------

# 24. Regra de build

Antes de considerar o projeto concluído, executar:

``` bash
npm run build
```

A build deve terminar sem erros.

Também verificar:

``` bash
npm run lint
```

quando esse script estiver configurado.

Não considerar o projeto pronto enquanto houver erros de build ou erros
críticos no console.

------------------------------------------------------------------------

# 25. Regra de Git

Fazer commits pequenos e descritivos.

Exemplos:

``` text
feat: create project structure
feat: add simulator hub
feat: implement pythagoras simulator
feat: implement addition simulator
feat: implement subtraction simulator
fix: correct triangle area calculation
style: improve projector layout
test: add mathematical logic tests
```

Evitar commits genéricos como:

``` text
update
changes
teste
final
coisas
```

------------------------------------------------------------------------

# 26. Regra de não regressão

Ao adicionar uma funcionalidade nova:

-   não quebrar simuladores existentes;
-   não remover componentes funcionais;
-   não alterar cálculos que já foram validados;
-   não modificar estilos globalmente sem verificar os outros módulos.

Depois de alterações importantes, testar novamente os três simuladores.

------------------------------------------------------------------------

# 27. Regra de escopo

O primeiro objetivo é entregar um MVP funcional.

Não adicionar inicialmente:

-   login;
-   cadastro;
-   banco de dados;
-   painel administrativo;
-   sistema de usuários;
-   API externa;
-   autenticação;
-   sistema de notas;
-   gamificação complexa.

Esses recursos só devem ser implementados se forem solicitados
posteriormente.

------------------------------------------------------------------------

# 28. Critério final de qualidade

O projeto só será considerado pronto quando:

-   [ ] Home funcionando.
-   [ ] Três simuladores acessíveis.
-   [ ] Navegação funcionando.
-   [ ] Pitágoras funcionando matematicamente.
-   [ ] Soma funcionando matematicamente.
-   [ ] Subtração funcionando matematicamente.
-   [ ] Interações funcionando em tempo real.
-   [ ] Animações funcionando.
-   [ ] Interface legível em projetor/TV.
-   [ ] Responsividade funcionando.
-   [ ] Acessibilidade básica implementada.
-   [ ] Sem erros críticos no console.
-   [ ] Testes principais passando.
-   [ ] Lint sem erros críticos.
-   [ ] Build de produção funcionando.
-   [ ] Código organizado e componentizado.

------------------------------------------------------------------------

# 29. Regra para a IA de programação

Antes de modificar qualquer parte do projeto:

1.  Ler este arquivo.
2.  Ler o código existente.
3.  Identificar a arquitetura atual.
4.  Verificar quais regras deste documento são afetadas.
5.  Fazer a menor alteração necessária.
6.  Testar a alteração.
7.  Verificar se não houve regressão.

Nunca modificar uma funcionalidade existente sem primeiro entender como
ela funciona.

Quando uma solicitação futura entrar em conflito com estas regras,
priorizar:

1.  Segurança e correção matemática.
2.  Requisitos explícitos do projeto.
3.  Regras deste documento.
4.  Qualidade e simplicidade da implementação.

Se uma solicitação for ambígua, escolher a solução mais simples que
preserve o objetivo educacional e a arquitetura existente.

------------------------------------------------------------------------

# 30. Referência da proposta original

A proposta original define a aplicação como um portal único com uma tela
inicial e três ambientes de simulação, com controles interativos,
feedback visual em tempo real e retorno ao menu principal.

Os três simuladores e seus objetivos devem permanecer alinhados à
proposta original:

-   Pitágoras e áreas triangulares;
-   compensação aditiva na soma;
-   deslocamento na reta na subtração.

Este arquivo transforma esses requisitos em regras técnicas para
orientar a implementação.


# 31. Regra de expansão da plataforma — Matemática Fundamental II e Ensino Médio

A plataforma deve ser projetada desde o início para permitir expansão futura para outros conteúdos de Matemática.

O MVP continua sendo formado pelos três simuladores definidos na proposta original. Porém, a arquitetura não deve ser criada de maneira que impeça a inclusão de novos conteúdos e simuladores.

A referência de organização de conteúdos deverá considerar o material de Matemática do Toda Matéria fornecido como referência pelo responsável pelo projeto.

## 31.1 Organização por etapa escolar

A futura expansão deve permitir organizar conteúdos por:

### Ensino Fundamental II

- 6º ano
- 7º ano
- 8º ano
- 9º ano

### Ensino Médio

- 1º ano
- 2º ano
- 3º ano

A interface futura poderá permitir a seleção:

```text
Matemática
├── Ensino Fundamental II
│   ├── 6º ano
│   ├── 7º ano
│   ├── 8º ano
│   └── 9º ano
│
└── Ensino Médio
    ├── 1º ano
    ├── 2º ano
    └── 3º ano
```

## 31.2 Áreas de conteúdo

A arquitetura deve estar preparada para conteúdos relacionados às seguintes áreas:

### Aritmética e Números

- Números naturais
- Números inteiros
- Números racionais
- Frações
- Razão e proporção
- Regra de três
- Porcentagem
- Potenciação
- Radiciação
- Expressões numéricas
- Expressões algébricas

### Álgebra

- Equações
- Sistemas de equações
- Inequações
- Produtos notáveis
- Fatoração
- Polinômios

### Funções

- Conceito de função
- Função afim
- Função quadrática
- Função exponencial
- Função logarítmica
- Gráficos de funções

### Geometria

- Ângulos
- Triângulos
- Quadriláteros
- Polígonos
- Perímetro
- Áreas
- Teorema de Tales
- Teorema de Pitágoras
- Geometria espacial
- Geometria analítica

### Trigonometria

- Razões trigonométricas
- Seno
- Cosseno
- Tangente
- Relações trigonométricas
- Aplicações geométricas

### Progressões

- Progressão Aritmética (PA)
- Progressão Geométrica (PG)

### Matrizes e Sistemas

- Matrizes
- Operações com matrizes
- Determinantes
- Sistemas lineares

### Análise Combinatória e Probabilidade

- Princípio fundamental da contagem
- Permutações
- Arranjos
- Combinações
- Probabilidade

### Estatística

- Organização de dados
- Tabelas
- Gráficos
- Média
- Mediana
- Moda
- Medidas estatísticas

### Matemática Financeira

- Porcentagem
- Juros simples
- Juros compostos
- Descontos
- Aplicações financeiras

### Outros conteúdos

A arquitetura deve permitir adicionar posteriormente outros conteúdos de Matemática sem necessidade de reconstruir o sistema.

## 31.3 Regra de simuladores futuros

Sempre que um novo conteúdo for transformado em simulador, ele deve seguir a mesma filosofia dos três simuladores iniciais:

1. Apresentar o conceito matemático.
2. Permitir interação do usuário.
3. Atualizar os cálculos em tempo real.
4. Representar visualmente o conceito.
5. Fornecer feedback textual.
6. Mostrar os resultados matemáticos.
7. Permitir que o aluno perceba a relação entre ação e resultado.

Um simulador futuro não deve ser apenas uma calculadora.

A finalidade é permitir **exploração e compreensão do conceito matemático**.

## 31.4 Estrutura de dados preparada para expansão

Os conteúdos futuros devem preferencialmente ser tratados como dados e metadados, em vez de serem codificados diretamente dentro da interface.

Uma estrutura conceitual possível:

```ts
type MathContent = {
  id: string
  title: string
  description: string
  educationLevel: "fundamental-2" | "medio"
  grade: string
  category: string
  simulator?: string
}
```

A estrutura exata pode mudar conforme a implementação, mas a separação entre conteúdo e interface deve ser preservada.

## 31.5 Regra de classificação dos simuladores

Cada simulador futuro deve poder ser associado a:

- etapa escolar;
- ano;
- área da Matemática;
- assunto;
- dificuldade;
- tipo de interação.

Exemplo:

```text
Simulador
├── Ensino Fundamental II
├── 9º ano
├── Geometria
├── Teorema de Pitágoras
└── Interação geométrica
```

## 31.6 Regra de evolução do projeto

Não implementar todos os conteúdos de uma vez.

A expansão deve ocorrer em fases.

### Fase atual — MVP

Implementar somente:

1. Explorador de Pitágoras e Áreas Triangulares
2. Cálculo Mental por Compensação Aditiva
3. Cálculo Mental por Deslocamento na Reta

### Fase futura

Adicionar novos simuladores de acordo com prioridade pedagógica e viabilidade técnica.

Priorizar inicialmente conteúdos que tenham grande potencial de visualização e interação.

Exemplos de candidatos:

- funções e gráficos;
- geometria;
- trigonometria;
- frações;
- porcentagem;
- equações;
- estatística;
- probabilidade;
- PA e PG.

## 31.7 Regra de arquitetura para crescimento

A arquitetura deve permitir que um novo simulador seja adicionado sem precisar modificar toda a aplicação.

Preferir uma estrutura semelhante a:

```text
Simuladores
├── Pitágoras
├── Soma
├── Subtração
├── Funções
├── Frações
├── Porcentagem
├── Trigonometria
└── ...
```

Cada novo simulador deve possuir seus próprios componentes, lógica e testes.

O Hub deve conseguir apresentar novos simuladores sem precisar ser reescrito completamente.

## 31.8 Regra de referência de conteúdo

O material do Toda Matéria deve ser tratado como referência de organização e levantamento de conteúdos, não como código ou conteúdo a ser copiado integralmente.

Quando novos conteúdos forem adicionados, verificar a necessidade de fontes pedagógicas adequadas e manter os textos explicativos próprios da plataforma.

Não copiar artigos inteiros, textos extensos ou materiais protegidos de terceiros.

## 31.9 Regra de prioridade

A existência de um grande mapa de conteúdos não autoriza a IA de programação a aumentar automaticamente o escopo do MVP.

Se uma tarefa solicitar apenas correção ou implementação de um simulador existente:

- trabalhar somente naquele escopo;
- não criar novos simuladores;
- não alterar a navegação inteira;
- não implementar conteúdos futuros.

O mapa de conteúdos serve para orientar a arquitetura e futuras expansões.

## 31.10 Visão de longo prazo

A visão do projeto é evoluir de:

```text
3 simuladores
```

para:

```text
Plataforma de Matemática Interativa
│
├── Fundamental II
│   ├── 6º ano
│   ├── 7º ano
│   ├── 8º ano
│   └── 9º ano
│
└── Ensino Médio
    ├── 1º ano
    ├── 2º ano
    └── 3º ano
```

Essa expansão deve acontecer gradualmente.

A qualidade e a estabilidade dos simuladores existentes têm prioridade sobre a quantidade de conteúdos disponíveis.
