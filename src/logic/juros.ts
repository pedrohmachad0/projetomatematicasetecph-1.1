/** Juros simples e compostos. Taxa em % ao mês, tempo em meses. */

export const simpleAmount = (capital: number, rate: number, months: number) => capital * (1 + (rate / 100) * months)
export const compoundAmount = (capital: number, rate: number, months: number) => capital * (1 + rate / 100) ** months

export interface Row {
  month: number
  simple: number
  compound: number
}

export function table(capital: number, rate: number, months: number): Row[] {
  return Array.from({ length: months + 1 }, (_, month) => ({ month, simple: simpleAmount(capital, rate, month), compound: compoundAmount(capital, rate, month) }))
}

export const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
