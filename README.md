# Simuladores Matemáticos Interativos

Plataforma web educacional com um catálogo de simuladores de Matemática para o Ensino Fundamental II e o Ensino Médio, além da aventura MathQuest (`/aprender`). Feita com **React + TypeScript + Vite + Tailwind + SVG + Framer Motion**.

**Stack:** React 19, Vite 8, TypeScript 6, Tailwind 4, Framer Motion 13, Lucide React, Vitest + Testing Library, Oxlint/Prettier.

## Simuladores

| Rota | Simulador | Etapa | Área |
| --- | --- | --- | --- |
| `/soma` | Cálculo Mental: Soma (material dourado, compensação) | 6º ano | Aritmética |
| `/subtracao` | Cálculo Mental: Subtração (reta numérica, deslocamento) | 6º ano | Aritmética |
| `/fracoes` | Explorador de Frações | 6º ano | Frações |
| `/porcentagem` | Explorador de Porcentagem | 7º ano | Porcentagem |
| `/equacoes` | Balança de Equações (1º grau) | 7º ano | Álgebra |
| `/estatistica` | Média, Mediana e Moda | 8º ano | Estatística |
| `/pitagoras` | Explorador de Pitágoras | 9º ano | Geometria |
| `/pi` | Explorador do Círculo (π, raio, arcos, setor) | 9º ano | Geometria |
| `/funcoes` | Explorador de Funções (afim e quadrática) | 1º ano EM | Funções |
| `/progressoes` | Progressões: PA e PG | 1º ano EM | Progressões |
| `/trigonometria` | Círculo Trigonométrico | 2º ano EM | Trigonometria |
| `/probabilidade` | Laboratório de Probabilidade | 2º ano EM | Probabilidade |

Todos seguem a filosofia do §31.3 de `regrasdoprojeto.md`: interação, cálculo em tempo real, representação visual em SVG, feedback textual e modo apresentação para projetor/TV, com tema claro e escuro.

## MathQuest (`/aprender`)

Mini RPG para aprender Matemática por livros (capítulos) e fases, seguindo os simuladores. Abre numa tela de título (Continuar, Novo jogo com nome do aventureiro, Como jogar, Configurações), tem menu de pausa (Esc/P), música própria em chiptune gerada no navegador (`src/data/music.ts`), caixas de diálogo com texto digitado, transições de tela e tela cheia.

| Livro | Tema | Fases | Simuladores ligados |
| --- | --- | --- | --- |
| I · Floresta das Brasas | Soma, subtração e multiplicação | 10 | Soma, Subtração |
| II · Vila das Frações | Frações, equivalência e porcentagem | 6 | Frações, Porcentagem |
| III · Montanhas da Álgebra | Equações, média, mediana e moda | 6 | Equações, Estatística |
| IV · Templo da Geometria | Pitágoras, círculo e trigonometria | 6 | Pitágoras, Círculo, Trigonometria |
| V · Cidade das Funções | Funções, PA, PG e probabilidade | 6 | Funções, PA e PG, Probabilidade |

Cada fase é um mapa explorável de 24 × 15 casas, com câmera que acompanha o herói, caminhada animada, minimapa e andar por toque: no celular, toque onde quer ir e o herói anda até lá (no computador, setas/WASD ou clique) com missões: derrotar monstros, ajudar um morador com um problema do local, consertar a ponte/portão, abrir o baú e ler a placa que leva ao simulador. Depois vem a batalha por turnos contra o guardião: menu **Atacar** (golpe rápido, golpe pesado e chama especial), **Esquivar**, **Mochila** e **Fugir**; cada ação pede uma conta, o monstro contra-ataca a cada turno e avisa antes de um golpe carregado. As estrelas dependem dos erros. As regras de dano ficam em `src/logic/battle.ts` e os sprites em pixel art em `src/data/sprites.ts`. Os mapas são gerados de forma determinística (`src/logic/questMap.ts`) e as perguntas vêm de `src/logic/questTopics.ts`; os testes conferem que todo mapa é jogável e que toda resposta está certa. O **modo professor** (na biblioteca de livros) libera todos os livros e fases.

## Rodar local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run test     # vitest run
npm run lint     # oxlint
```

## Estrutura

```
src/
├── components/   # componentes de cada simulador, SimulatorHeader, PresentationMode, ui/
├── pages/        # uma página por simulador + Hub + Aprender (MathQuest)
├── data/         # mathContent (catálogo), simulatorVisuals, problemas pré-configurados
├── logic/        # lógica matemática pura e testável
└── tests/
```

## Como adicionar um simulador

1. Crie a lógica em `src/logic/` e os testes em `src/tests/`.
2. Crie a página em `src/pages/` usando `PresentationMode` e `SimulatorHeader`.
3. Registre o conteúdo em `src/data/mathContent.ts` (nome, etapa, ano, área) e o ícone em `src/data/simulatorVisuals.ts`.
4. Adicione a rota em `src/App.tsx`.

O Hub, os filtros e o cabeçalho da página leem o nome e a classificação do catálogo, então eles não divergem.

---

Feito no Colégio Estadual Barbosa Ferraz (Ivaiporã · PR). O logo original fica em `docs/logo-barbosa-original.png`; o site usa uma versão reduzida em `public/logo-barbosa.webp`.

Ver `regrasdoprojeto.md` para as regras técnicas e pedagógicas.
