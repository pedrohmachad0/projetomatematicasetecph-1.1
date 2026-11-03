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
