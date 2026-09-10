/**
 * Lógica pura do simulador de Deslocamento na Reta (Subtração)
 * seção 12 das regras do projeto.
 */

export function isDezenaExata(valor: number): boolean {
  return valor % 10 === 0
}

export function deslocar(
  minuendo: number,
  subtraendo: number,
  delta: number,
): { novoMinuendo: number; novoSubtraendo: number; diferenca: number } {
  const novoMinuendo = minuendo + delta
  const novoSubtraendo = subtraendo + delta
  return { novoMinuendo, novoSubtraendo, diferenca: novoMinuendo - novoSubtraendo }
}

export function podeDeslocar(novoMinuendo: number, novoSubtraendo: number): boolean {
  // mantém não-negativos e dentro de um intervalo razoável para visualização (0..100)
  return novoMinuendo >= 0 && novoSubtraendo >= 0 && novoMinuendo <= 120 && novoSubtraendo <= 120
}

export function getMensagemDezena(valor: number): string | null {
  if (isDezenaExata(valor)) {
    return `✨ ${valor} é uma dezena exata! A conta ficou mais simples.`
  }
  return null
}

/** Calcula o domínio visível da reta com margem */
export function getDominioReta(
  minuendo: number,
  subtraendo: number,
  origemMinuendo: number,
  origemSubtraendo: number,
  margem = 5,
): { min: number; max: number } {
  const minVal = Math.min(minuendo, subtraendo, origemMinuendo, origemSubtraendo) - margem
  const maxVal = Math.max(minuendo, subtraendo, origemMinuendo, origemSubtraendo) + margem
  return { min: Math.max(0, minVal), max: maxVal }
}
