# Plataforma de Simuladores Matemáticos Interativos — PEMFM

Plataforma web educacional com Hub + 3 simuladores interativos, desenvolvida em **React + TypeScript + Vite + Tailwind + SVG + Framer Motion**.

**Stack:** React 19, Vite 8, TypeScript 6, Tailwind 4, Framer Motion 13, Lucide React, Vitest + Testing Library, Oxlint/Prettier.

## Simuladores

1. **Explorador de Pitágoras** (`/pitagoras`) — ângulo 10°–120° passo 10°, dois lados fixos de 10u, terceiro lado via Lei dos Cossenos, 3 quadrados (2 fixos + 1 dinâmico), classificação acutângulo/retângulo/obtusângulo com cor + texto, comparação `A²+B² <> C²`.
2. **Cálculo Mental — Soma** (`/soma`) — 10 problemas em `src/data/additionProblems.ts`, material dourado (barras dezenas + cubos unidades), transferência mantém soma constante, destaque dezena exata, animação.
3. **Cálculo Mental — Subtração** (`/subtracao`) — 10 problemas em `src/data/subtractionProblems.ts`, reta numérica SVG com marcações, deslocamento `-1/+1` mantém diferença, posição original tracejada, destaque dezena.

Todos com SVG, Tailwind, acessibilidade (`aria-label`, foco visível, teclado), responsivo mobile/desktop/projetor/TV sem overflow.

## Rodar local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run test     # vitest run — 49 testes
npm run lint     # oxlint
```

## Estrutura

```
src/
├── components/{pitagoras,soma,subtracao}/
├── pages/{Hub,Pitagoras,CalcSoma,CalcSubtracao}
├── data/{additionProblems,subtractionProblems,mathContent}
├── logic/{pitagoras,adicao,subtracao,calculoMental}
└── tests/
```

Arquitetura preparada para expansão Fundamental II (6º–9º) e Médio (1º–3º) via `src/data/mathContent.ts`.

---

> Template base Vite + React. Ver `regrasdoprojeto.md` para regras técnicas e pedagógicas.
