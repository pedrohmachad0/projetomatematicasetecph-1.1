import {
  ChartColumn,
  ChartSpline,
  Circle,
  Dices,
  Divide,
  ListOrdered,
  Minus,
  Percent,
  Plus,
  Radius,
  Scale,
  Triangle,
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
}

export function getCategoryColor(category: string): string {
  return categoryColors[category] ?? '#1d4ed8'
}
