/**
 * Lógica pura do simulador de Cálculo Mental (desacoplada da UI)
 */

export interface Questao {
  a: number
  b: number
  resposta: number
}

export type Operacao = 'soma' | 'subtracao'

/** Gera um número inteiro aleatório entre min e max (inclusivo) */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Gera uma nova questão de soma */
export function gerarQuestaoSoma(maxValor = 99): Questao {
  const a = randInt(1, maxValor)
  const b = randInt(1, maxValor)
  return { a, b, resposta: a + b }
}

/** Gera uma nova questão de subtração (garante resultado ≥ 0) */
export function gerarQuestaoSubtracao(maxValor = 99): Questao {
  const a = randInt(1, maxValor)
  const b = randInt(0, a) // b ≤ a para resultado ≥ 0
  return { a, b, resposta: a - b }
}

/** Verifica se a resposta do usuário está correta */
export function verificarResposta(questao: Questao, tentativa: number): boolean {
  return tentativa === questao.resposta
}

/** Calcula pontuação baseada no tempo de resposta */
export function calcularPontos(tempoMs: number, acertou: boolean): number {
  if (!acertou) return 0
  if (tempoMs <= 3000) return 10
  if (tempoMs <= 6000) return 7
  if (tempoMs <= 10000) return 5
  return 3
}

/** Gera feedback textual para o resultado */
export function gerarFeedback(acertou: boolean, respostaCorreta: number): string {
  if (acertou) {
    const msgs = ['Excelente! 🎉', 'Correto! 🌟', 'Muito bem! 👏', 'Perfeito! ✅']
    return msgs[Math.floor(Math.random() * msgs.length)]
  }
  return `Resposta correta: ${respostaCorreta} ❌`
}

// ── Novas funções alinhadas à especificação (compensação / deslocamento) ──
export function isDezenaExata(valor: number): boolean {
  return valor % 10 === 0
}

export function transferirSoma(
  a: number,
  b: number,
  delta: number,
): { novoA: number; novoB: number; soma: number } {
  const novoA = a - delta
  const novoB = b + delta
  return { novoA, novoB, soma: novoA + novoB }
}

export function deslocarSubtracao(
  minuendo: number,
  subtraendo: number,
  delta: number,
): { novoMinuendo: number; novoSubtraendo: number; diferenca: number } {
  const novoMinuendo = minuendo + delta
  const novoSubtraendo = subtraendo + delta
  return { novoMinuendo, novoSubtraendo, diferenca: novoMinuendo - novoSubtraendo }
}
