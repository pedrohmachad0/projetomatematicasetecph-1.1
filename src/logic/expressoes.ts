/**
 * Expressões numéricas resolvidas passo a passo, na ordem correta:
 * parênteses, depois × e ÷ (da esquerda para a direita), depois + e −.
 */

export type Token = number | '+' | '−' | '×' | '÷' | '(' | ')'

export function tokenize(expression: string): Token[] {
  const tokens: Token[] = []
  const clean = expression.replace(/\s+/g, '')
  for (let i = 0; i < clean.length; ) {
    const char = clean[i]
    if (/\d/.test(char)) {
      let j = i
      while (j < clean.length && /\d/.test(clean[j])) j++
      tokens.push(Number(clean.slice(i, j)))
      i = j
    } else if ('+−×÷()'.includes(char)) {
      tokens.push(char as Token)
      i++
    } else if (char === '-') {
      tokens.push('−')
      i++
    } else if (char === '*' || char === 'x') {
      tokens.push('×')
      i++
    } else if (char === '/' || char === ':') {
      tokens.push('÷')
      i++
    } else throw new Error(`Caractere inválido: ${char}`)
  }
  return tokens
}

export function format(tokens: Token[]): string {
  return tokens
    .map((t) => String(t))
    .join(' ')
    .replace(/\( /g, '(')
    .replace(/ \)/g, ')')
}

export interface Step {
  tokens: Token[]
  /** Índices [início, fim] (inclusivos) da operação que será feita agora. */
  focus: [number, number]
  result: number
  rule: string
}

const apply = (a: number, op: Token, b: number) => (op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b)

/** Encontra a próxima operação a resolver, respeitando a ordem das operações. */
export function nextStep(tokens: Token[]): Step | null {
  if (tokens.length === 1) return null
  // Parênteses mais internos com um único número viram só o número.
  let open = -1
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === '(') open = i
    if (tokens[i] === ')' && open >= 0) {
      if (i - open === 2) return { tokens, focus: [open, i], result: tokens[open + 1] as number, rule: 'Tire os parênteses que só têm um número.' }
      return stepInRange(tokens, open + 1, i - 1, 'Resolva primeiro o que está dentro dos parênteses')
    }
  }
  return stepInRange(tokens, 0, tokens.length - 1, '')
}

function stepInRange(tokens: Token[], from: number, to: number, prefix: string): Step {
  for (const ops of [['×', '÷'], ['+', '−']] as const) {
    for (let i = from + 1; i < to; i += 2) {
      const op = tokens[i]
      if ((ops as readonly Token[]).includes(op)) {
        const a = tokens[i - 1] as number
        const b = tokens[i + 1] as number
        const rule = ops[0] === '×' ? 'Multiplicações e divisões vêm antes de somas e subtrações' : 'Por último, somas e subtrações, da esquerda para a direita'
        return { tokens, focus: [i - 1, i + 1], result: apply(a, op, b), rule: prefix ? `${prefix}. ${rule}.` : `${rule}.` }
      }
    }
  }
  throw new Error('Expressão inválida')
}

export function applyStep(step: Step): Token[] {
  const [a, b] = step.focus
  return [...step.tokens.slice(0, a), step.result, ...step.tokens.slice(b + 1)]
}

export function solveAll(expression: string): { steps: Step[]; result: number } {
  let tokens = tokenize(expression)
  const steps: Step[] = []
  for (let guard = 0; guard < 50; guard++) {
    const step = nextStep(tokens)
    if (!step) break
    steps.push(step)
    tokens = applyStep(step)
  }
  return { steps, result: tokens[0] as number }
}

/** Resultado errado de quem faz tudo da esquerda para a direita (só sem parênteses). */
export function leftToRight(tokens: Token[]): number | null {
  if (tokens.some((t) => t === '(' || t === ')')) return null
  let acc = tokens[0] as number
  for (let i = 1; i < tokens.length; i += 2) acc = apply(acc, tokens[i], tokens[i + 1] as number)
  return acc
}

/** Confere se a expressão pode ser resolvida (sintaxe certa e sem divisão por zero). */
export function isValidExpression(expression: string): boolean {
  try {
    const tokens = tokenize(expression)
    if (tokens.length === 0) return false
    let depth = 0
    let expectNumber = true
    for (const t of tokens) {
      if (t === '(') {
        if (!expectNumber) return false
        depth++
      } else if (t === ')') {
        if (expectNumber) return false
        depth--
        if (depth < 0) return false
      } else if (typeof t === 'number') {
        if (!expectNumber) return false
        expectNumber = false
      } else {
        if (expectNumber) return false
        expectNumber = true
      }
    }
    if (depth !== 0 || expectNumber) return false
    const { result } = solveAll(expression)
    return Number.isFinite(result)
  } catch {
    return false
  }
}
