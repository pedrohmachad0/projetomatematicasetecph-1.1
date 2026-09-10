/**
 * Lógica pura do simulador de Compensação Aditiva (Soma)
 * seção 11 das regras do projeto.
 */

export function isDezenaExata(valor: number): boolean {
  return valor % 10 === 0
}

export function transferir(
  a: number,
  b: number,
  delta: number,
): { novoA: number; novoB: number; soma: number } {
  const novoA = a - delta
  const novoB = b + delta
  return { novoA, novoB, soma: novoA + novoB }
}

export function podeTransferir(a: number, b: number, delta: number): boolean {
  const novoA = a - delta
  const novoB = b + delta
  return novoA >= 0 && novoB >= 0
}

export function getBarrasECubos(valor: number): { dezenas: number; unidades: number } {
  const dezenas = Math.floor(valor / 10)
  const unidades = valor % 10
  return { dezenas, unidades }
}

export function getMensagemDezena(valor: number): string | null {
  if (isDezenaExata(valor)) {
    return `✨ ${valor} é uma dezena exata! O cálculo ficou mais fácil.`
  }
  return null
}
