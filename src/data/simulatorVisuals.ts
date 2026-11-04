import {
  ArrowLeftRight,
  Box,
  ChartColumn,
  ChartSpline,
  Circle,
  Dices,
  Divide,
  Grid2x2,
  Grid3x3,
  Hexagon,
  ListOrdered,
  Minus,
  Parentheses,
  Percent,
  PiggyBank,
  Plus,
  Radius,
  Rows3,
  Scale,
  Scaling,
  Shuffle,
  Spline,
  SquareDashed,
  Superscript,
  TrendingUp,
  Triangle,
  Waypoints,
  type LucideIcon,
} from 'lucide-react'
import type { SimulatorId } from './mathContent'

/** Ícone de cada simulador. */
export const simulatorIcons: Record<SimulatorId, LucideIcon> = {
  soma: Plus,
  subtracao: Minus,
  fracoes: Divide,
  porcentagem: Percent,
  equacoes: Scale,
  estatistica: ChartColumn,
  pitagoras: Triangle,
  pi: Circle,
  funcoes: ChartSpline,
  progressoes: ListOrdered,
  trigonometria: Radius,
  probabilidade: Dices,
  inteiros: ArrowLeftRight,
  proporcao: Scaling,
  potencias: Superscript,
  expressoes: Parentheses,
  poligonos: Hexagon,
  areas: SquareDashed,
  tales: Rows3,
  sistemas: Waypoints,
  notaveis: Grid2x2,
  exponencial: TrendingUp,
  espacial: Box,
  analitica: Spline,
  matrizes: Grid3x3,
  combinatoria: Shuffle,
  juros: PiggyBank,
}

/**
 * Cor de destaque por área da Matemática: simuladores da mesma área
 * compartilham a mesma cor, e áreas diferentes nunca usam a mesma.
 * Todas têm contraste suficiente com texto branco.
 */
export const categoryColors: Record<string, string> = {
  'Aritmética e Números': '#1d4ed8',
  'Frações e Números Racionais': '#4f46e5',
  'Razão, Proporção e Porcentagem': '#0e7490',
  Álgebra: '#0f766e',
  Estatística: '#c2410c',
  Geometria: '#047857',
  Funções: '#be185d',
  Progressões: '#7c3aed',
  Trigonometria: '#b45309',
  'Análise Combinatória e Probabilidade': '#be123c',
  'Matrizes e Sistemas': '#a21caf',
  'Matemática Financeira': '#4d7c0f',
}

export function getCategoryColor(category: string): string {
  return categoryColors[category] ?? '#1d4ed8'
}
