/**
 * Banco de perguntas do MathQuest por assunto. Cada gerador cria uma pergunta nova
 * a partir de `random`, com resposta calculada (nunca escrita à mão), explicação e dica.
 * `story` troca a conta direta por um problema contado por um morador do mapa.
 */
import type { ChapterQuestion } from '../data/chapter'
import { exactCosine, exactSine } from './trigonometria'

export type TopicId =
  | 'soma-10'
  | 'soma-20'
  | 'subtracao-10'
  | 'subtracao-20'
  | 'misto-30'
  | 'mental-50'
  | 'mult-2-3'
  | 'mult-4-5'
  | 'revisao'
  | 'combinadas'
  | 'fracao-parte'
  | 'fracao-equivalente'
  | 'fracao-simplificar'
  | 'fracao-porcentagem'
  | 'porcentagem'
  | 'desconto'
  | 'equacao'
  | 'media'
  | 'mediana'
  | 'moda'
  | 'pitagoras'
  | 'triangulo'
  | 'circulo'
  | 'trigonometria'
  | 'funcao-valor'
  | 'funcao-raiz'
  | 'pa'
  | 'pg'
  | 'probabilidade'

type Random = () => number
type Generator = (random: Random, story: boolean) => ChapterQuestion

const int = (random: Random, min: number, max: number) => min + Math.floor(random() * (max - min + 1))
const pick = <T,>(random: Random, items: readonly T[]): T => items[Math.floor(random() * items.length)]
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))
const fmt = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

function shuffle<T>(items: T[], random: Random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Monta 4 alternativas distintas, sempre com a correta. */
function choices(answer: string, distractors: string[], random: Random, fallback: () => string): string[] {
  const set = new Set([answer])
  for (const item of distractors) if (set.size < 4) set.add(item)
  let guard = 0
  while (set.size < 4 && guard++ < 50) set.add(fallback())
  return shuffle([...set], random)
}

let counter = 0
function question(kind: ChapterQuestion['kind'], instruction: string, expression: string, answer: string | number, explanation: string, hint: string, options?: string[]): ChapterQuestion {
  counter += 1
  return { id: `q-${counter}-${expression}`, kind, instruction, expression, answer: String(answer), explanation, hint, ...(options ? { choices: options } : {}) }
}

function numberChoices(answer: number, random: Random, spread = 3): string[] {
  return choices(
    String(answer),
    [answer + 1, Math.max(0, answer - 1), answer + spread, answer + 10].map(String),
    random,
    () => String(Math.max(0, answer + int(random, -9, 9))),
  )
}

/* ---------- Livro I: operações ---------- */

type Op = '+' | '−' | '×'

function arithmetic(random: Random, story: boolean, ops: Op[], max: number, multMax = 5): ChapterQuestion {
  const op = pick(random, ops)
  let a: number
  let b: number
  if (op === '×') {
    a = int(random, 2, multMax)
    b = int(random, 2, 10)
  } else if (op === '+') {
    a = int(random, 1, max - 1)
    b = int(random, 1, max - a)
  } else {
    a = int(random, 2, max)
    b = int(random, 1, a)
  }
  const answer = op === '+' ? a + b : op === '−' ? a - b : a * b
  const expression = `${a} ${op} ${b}`
  const explanation = `${expression} = ${answer}. ${op === '+' ? 'Somar é juntar as quantidades.' : op === '−' ? 'Subtrair é descobrir quanto resta.' : `São ${a} grupos de ${b}.`}`
  const hint = op === '+' ? 'Comece pelo maior número e conte para a frente.' : op === '−' ? 'Comece pelo primeiro número e volte a quantidade indicada.' : 'Multiplicar é somar grupos iguais.'
  if (story) {
    const text =
      op === '+'
        ? pick(random, [`A coruja guardou ${a} sementes e achou mais ${b}. Quantas sementes ela tem agora?`, `O lenhador cortou ${a} toras de manhã e ${b} à tarde. Quantas toras ele cortou?`, `Havia ${a} vaga-lumes na clareira e chegaram mais ${b}. Quantos vaga-lumes há agora?`])
        : op === '−'
          ? pick(random, [`O esquilo tinha ${a} nozes e comeu ${b}. Quantas nozes sobraram?`, `Na ponte havia ${a} tábuas e ${b} caíram no rio. Quantas tábuas ficaram?`, `A cesta tinha ${a} cogumelos e ${b} foram usados na sopa. Quantos restaram?`])
          : pick(random, [`O ferreiro fez ${a} caixas com ${b} pregos cada. Quantos pregos ele usou?`, `Há ${a} árvores e cada uma tem ${b} maçãs. Quantas maçãs há ao todo?`])
    return question('input', text, `${expression} = ?`, answer, explanation, hint)
  }
  return random() < 0.5
    ? question('input', 'Digite o resultado', `${expression} = ?`, answer, explanation, hint)
    : question('choice', 'Escolha a resposta correta', `${expression} = ?`, answer, explanation, hint, numberChoices(answer, random))
}

function combined(random: Random, story: boolean): ChapterQuestion {
  const a = int(random, 2, 20)
  const b = int(random, 2, 5)
  const c = int(random, 2, 9)
  const answer = a + b * c
  const expression = `${a} + ${b} × ${c}`
  const explanation = `Primeiro a multiplicação: ${b} × ${c} = ${b * c}. Depois ${a} + ${b * c} = ${answer}.`
  const hint = 'Resolva a multiplicação antes da soma.'
  if (story) return question('input', `Grum tinha ${a} moedas e ganhou ${b} sacos com ${c} moedas cada. Quantas moedas ele tem?`, `${expression} = ?`, answer, explanation, hint)
  return question('choice', 'Escolha a resposta correta', `${expression} = ?`, answer, explanation, hint, choices(String(answer), [String((a + b) * c), String(answer + 1), String(answer - 2)], random, () => String(answer + int(random, 3, 12))))
}

/* ---------- Livro II: frações e porcentagem ---------- */

const fractionPart: Generator = (random, story) => {
  const d = int(random, 3, 10)
  const n = int(random, 1, d - 1)
  const answer = `${n}/${d}`
  const instruction = story
    ? pick(random, [`A padeira cortou uma torta em ${d} pedaços iguais e vendeu ${n}. Que fração da torta foi vendida?`, `Um muro tem ${d} partes iguais e ${n} já foram pintadas. Que fração está pintada?`])
    : `Um inteiro foi dividido em ${d} partes iguais e ${n} foram destacadas. Qual fração foi destacada?`
  return question('choice', instruction, `${n} de ${d} partes`, answer, `O denominador ${d} diz em quantas partes o inteiro foi dividido; o numerador ${n}, quantas foram escolhidas: ${answer}.`, 'Embaixo vai o total de partes; em cima, as partes escolhidas.', choices(answer, [`${d}/${n}`, `${d - n}/${d}`, `${n}/${d + 1}`], random, () => `${int(random, 1, 9)}/${int(random, 2, 12)}`))
}

const fractionEquivalent: Generator = (random, story) => {
  const b = int(random, 2, 6)
  const a = int(random, 1, b - 1)
  const k = int(random, 2, 5)
  const answer = a * k
  const instruction = story ? `O moleiro quer trocar ${a}/${b} de saco de farinha por pacotes de 1/${b * k}. Quantos pacotes ele precisa?` : 'Complete a fração equivalente'
  return question('input', instruction, `${a}/${b} = ?/${b * k}`, answer, `O denominador foi multiplicado por ${k} (${b} × ${k} = ${b * k}); o numerador também: ${a} × ${k} = ${answer}.`, 'Descubra por quanto o denominador foi multiplicado e faça o mesmo em cima.')
}

const fractionSimplify: Generator = (random, story) => {
  let a = 1
  let b = 2
  do {
    b = int(random, 2, 9)
    a = int(random, 1, b - 1)
  } while (gcd(a, b) !== 1)
  const k = int(random, 2, 5)
  const answer = `${a}/${b}`
  const instruction = story ? `O sábio da vila escreveu ${a * k}/${b * k} na lousa e pediu a forma mais simples. Qual é?` : 'Qual é a forma simplificada?'
  return question('choice', instruction, `${a * k}/${b * k}`, answer, `${a * k} e ${b * k} podem ser divididos por ${k}: ${a * k} ÷ ${k} = ${a} e ${b * k} ÷ ${k} = ${b}.`, 'Divida numerador e denominador pelo mesmo número até não dar mais.', choices(answer, [`${a * k}/${b}`, `${a}/${b * k}`, `${a + 1}/${b}`], random, () => `${int(random, 1, 8)}/${int(random, 2, 9)}`))
}

const fractionPercent: Generator = (random, story) => {
  const [n, d] = pick(random, [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 10], [3, 10], [7, 10], [1, 20]] as const)
  const answer = `${(n / d) * 100}%`
  const instruction = story ? `O mercador disse que ${n}/${d} das frutas já foram vendidas. Que porcentagem é isso?` : 'Quanto vale esta fração em porcentagem?'
  return question('choice', instruction, `${n}/${d}`, answer, `${n} ÷ ${d} = ${fmt(n / d)}, e ${fmt(n / d)} × 100 = ${answer}.`, 'Divida o numerador pelo denominador e multiplique por 100.', choices(answer, [`${n * 10}%`, `${d}%`, `${(n / d) * 50}%`], random, () => `${int(random, 1, 19) * 5}%`))
}

const percentOf: Generator = (random, story) => {
  const p = pick(random, [10, 20, 25, 50, 75, 5])
  const step = 100 / gcd(p, 100)
  const value = step * int(random, 1, Math.max(1, Math.floor(400 / step)))
  const answer = (value * p) / 100
  const instruction = story ? `Dos ${value} moradores da vila, ${p}% foram à feira. Quantos moradores foram?` : 'Digite o resultado'
  return question('input', instruction, `${p}% de ${value} = ?`, answer, `${p}% de ${value} = ${value} × ${p} ÷ 100 = ${answer}.`, p === 50 ? '50% é a metade.' : p === 25 ? '25% é a quarta parte: divida por 4.' : p === 10 ? '10% é dividir por 10.' : 'Multiplique pelo número e divida por 100.')
}

const discount: Generator = (random, story) => {
  const p = pick(random, [10, 20, 25, 50])
  const step = 100 / gcd(p, 100)
  const value = step * int(random, 1, Math.max(1, Math.floor(300 / step)))
  const increase = random() < 0.35
  const amount = (value * p) / 100
  const answer = increase ? value + amount : value - amount
  const instruction = story
    ? increase
      ? `O ferreiro aumentou em ${p}% o preço de uma espada de ${value} moedas. Qual é o novo preço?`
      : `Uma capa custa ${value} moedas e está com ${p}% de desconto. Quanto ela custa agora?`
    : increase
      ? 'Qual é o novo valor após o acréscimo?'
      : 'Qual é o valor final após o desconto?'
  return question('input', instruction, `${value} ${increase ? '+' : '−'} ${p}%`, answer, `${p}% de ${value} = ${amount}; ${value} ${increase ? '+' : '−'} ${amount} = ${answer}.`, 'Calcule quanto é a porcentagem e depois some ou subtraia do valor.')
}

/* ---------- Livro III: álgebra e estatística ---------- */

const equation: Generator = (random, story) => {
  const a = int(random, 1, 6)
  const x = int(random, 1, 12)
  const b = int(random, 0, 15)
  const c = a * x + b
  const left = `${a === 1 ? '' : a}x${b ? ` + ${b}` : ''}`
  const instruction = story ? `Pensei num número, multipliquei por ${a}${b ? ` e somei ${b}` : ''}. Deu ${c}. Que número pensei?` : 'Descubra o valor de x'
  return question('input', instruction, `${left} = ${c}`, x, `${b ? `Tire ${b} dos dois lados: ${a === 1 ? '' : a}x = ${c - b}. ` : ''}${a > 1 ? `Divida por ${a}: x = ${x}.` : `Então x = ${x}.`}`, 'Faça a mesma operação nos dois lados: primeiro tire o número somado, depois divida.')
}

/** Lista com média inteira: sorteia a média e ajusta o último valor. */
function integerMeanList(random: Random, size: number) {
  for (;;) {
    const mean = int(random, 3, 9)
    const values = Array.from({ length: size - 1 }, () => int(random, 1, 12))
    const last = mean * size - values.reduce((sum, value) => sum + value, 0)
    if (last >= 1 && last <= 15) return [...values, last]
  }
}

const meanTopic: Generator = (random, story) => {
  const size = int(random, 3, 5)
  const values = integerMeanList(random, size)
  const total = values.reduce((sum, value) => sum + value, 0)
  const answer = total / size
  const instruction = story ? `Os ${size} pastores contaram suas ovelhas: ${values.join(', ')}. Qual é a média de ovelhas por pastor?` : 'Qual é a média?'
  return question('input', instruction, values.join(', '), answer, `Some tudo (${total}) e divida pela quantidade (${size}): ${answer}.`, 'Média = soma dos valores ÷ quantidade de valores.')
}

const medianTopic: Generator = (random, story) => {
  const values = Array.from({ length: 5 }, () => int(random, 1, 20))
  const sorted = [...values].sort((a, b) => a - b)
  const answer = sorted[2]
  const instruction = story ? `Cinco alpinistas subiram estas alturas (em centenas de metros): ${values.join(', ')}. Qual é a mediana?` : 'Qual é a mediana?'
  return question('input', instruction, values.join(', '), answer, `Em ordem: ${sorted.join(', ')}. O valor do meio é ${answer}.`, 'Coloque os valores em ordem e pegue o do meio.')
}

const modeTopic: Generator = (random, story) => {
  const mode = int(random, 1, 9)
  const others = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9].filter((value) => value !== mode), random).slice(0, 3)
  const values = shuffle([mode, mode, mode, ...others, others[0]], random)
  const instruction = story ? `Na festa, cada criança disse quantos doces comeu: ${values.join(', ')}. Qual é a moda?` : 'Qual é a moda?'
  return question('input', instruction, values.join(', '), mode, `O ${mode} aparece 3 vezes, mais que qualquer outro valor.`, 'A moda é o valor que mais se repete.')
}

/* ---------- Livro IV: geometria ---------- */

const pythagorasTopic: Generator = (random, story) => {
  const [a, b, c] = pick(random, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]] as const)
  const missingLeg = random() < 0.35
  const instruction = story
    ? missingLeg
      ? `Uma escada de ${c} metros encosta num muro, com o pé a ${a} metros dele. A que altura ela toca o muro?`
      : `O mapa do templo mostra um atalho em ângulo reto: ${a} passos para o leste e ${b} para o norte. Quantos passos tem a linha reta?`
    : missingLeg
      ? 'Num triângulo retângulo, qual é o cateto que falta?'
      : 'Num triângulo retângulo, qual é a hipotenusa?'
  return missingLeg
    ? question('input', instruction, `${a}² + ?² = ${c}²`, b, `${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b}, e √${b * b} = ${b}.`, 'Hipotenusa² − cateto² = outro cateto².')
    : question('input', instruction, `${a}² + ${b}² = ?²`, c, `${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}, e √${c * c} = ${c}.`, 'Some os quadrados dos catetos e tire a raiz quadrada.')
}

const triangleTopic: Generator = (random, story) => {
  const angle = pick(random, [30, 40, 50, 60, 70, 80, 90, 90, 100, 110, 120, 140])
  const answer = angle < 90 ? 'Acutângulo' : angle === 90 ? 'Retângulo' : 'Obtusângulo'
  const instruction = story ? `O arquiteto do templo desenhou um triângulo com um ângulo de ${angle}° entre dois lados iguais. Como ele se classifica?` : 'Como se classifica o triângulo com este ângulo?'
  return question('choice', instruction, `ângulo de ${angle}°`, answer, `${angle}° é ${angle < 90 ? 'menor que' : angle === 90 ? 'igual a' : 'maior que'} 90°, então o triângulo é ${answer.toLowerCase()}.`, 'Menor que 90° é agudo, igual é reto e maior é obtuso.', ['Acutângulo', 'Retângulo', 'Obtusângulo'])
}

const circleTopic: Generator = (random, story) => {
  const r = int(random, 1, 10)
  const kind = pick(random, ['diametro', 'comprimento', 'area'] as const)
  if (kind === 'diametro') {
    const instruction = story ? `A fonte redonda do templo tem raio de ${r} metros. Qual é o diâmetro?` : 'Qual é o diâmetro?'
    return question('input', instruction, `raio = ${r}`, 2 * r, `O diâmetro é o dobro do raio: 2 × ${r} = ${2 * r}.`, 'O diâmetro atravessa o círculo: vale dois raios.')
  }
  const value = kind === 'comprimento' ? 2 * 3.14 * r : 3.14 * r * r
  const answer = fmt(value)
  const instruction = story
    ? kind === 'comprimento'
      ? `Quantos metros de corda dão a volta numa roda de raio ${r} m? (use π ≈ 3,14)`
      : `Qual é a área de um tapete redondo de raio ${r} m? (use π ≈ 3,14)`
    : kind === 'comprimento'
      ? 'Qual é o comprimento da circunferência? (π ≈ 3,14)'
      : 'Qual é a área do círculo? (π ≈ 3,14)'
  const wrong = kind === 'comprimento' ? [3.14 * r, 3.14 * r * r, 2 * r + 3.14] : [2 * 3.14 * r, 3.14 * 2 * r * 2, r * r]
  return question('choice', instruction, `raio = ${r}`, answer, kind === 'comprimento' ? `C = 2 · π · r = 2 · 3,14 · ${r} = ${answer}.` : `A = π · r² = 3,14 · ${r * r} = ${answer}.`, kind === 'comprimento' ? 'Comprimento = 2 · π · raio.' : 'Área = π · raio².', choices(answer, wrong.map(fmt), random, () => fmt(3.14 * int(random, 1, 40))))
}

const trigTopic: Generator = (random, story) => {
  const angle = pick(random, [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 270, 300, 330])
  const useSine = random() < 0.5
  const answer = (useSine ? exactSine(angle) : exactCosine(angle))!
  const pool = ['0', '1/2', '√2/2', '√3/2', '1', '−1/2', '−√2/2', '−√3/2', '−1']
  const name = useSine ? 'seno' : 'cosseno'
  const instruction = story ? `O relógio de sol do observatório marca ${angle}°. Qual é o ${name} desse ângulo?` : `Qual é o ${name} do ângulo?`
  return question('choice', instruction, `${useSine ? 'sen' : 'cos'} ${angle}°`, answer, `No círculo trigonométrico, ${angle}° tem ${name} igual a ${answer}.`, useSine ? 'O seno é a altura do ponto no círculo de raio 1.' : 'O cosseno é a posição horizontal do ponto no círculo de raio 1.', choices(answer, shuffle(pool.filter((value) => value !== answer), random).slice(0, 3), random, () => pick(random, pool)))
}

/* ---------- Livro V: funções, progressões e probabilidade ---------- */

const functionValue: Generator = (random, story) => {
  const a = int(random, 1, 5)
  const b = int(random, 0, 10)
  const x = int(random, 0, 8)
  const answer = a * x + b
  const law = `f(x) = ${a === 1 ? '' : a}x${b ? ` + ${b}` : ''}`
  const instruction = story ? `O táxi da cidade cobra ${b} moedas fixas mais ${a} por quilômetro. Quanto custa uma corrida de ${x} km?` : `Calcule f(${x})`
  return question('input', instruction, `${law}; f(${x}) = ?`, answer, `Troque x por ${x}: ${a} · ${x} + ${b} = ${answer}.`, 'Substitua o x pelo número e faça a conta.')
}

const functionRoot: Generator = (random, story) => {
  const a = int(random, 1, 6)
  const root = int(random, 1, 9)
  const b = a * root
  const law = `f(x) = ${a === 1 ? '' : a}x − ${b}`
  const instruction = story ? `Uma lanterna começa com −${b} de energia e ganha ${a} por minuto (f(x) = ${a === 1 ? '' : a}x − ${b}). Em quantos minutos ela chega a zero?` : 'Qual é a raiz da função?'
  return question('input', instruction, `${law} = 0`, root, `${a === 1 ? '' : a}x − ${b} = 0 → ${a === 1 ? '' : a}x = ${b} → x = ${root}.`, 'A raiz é o x que faz f(x) valer zero.')
}

const paTopic: Generator = (random, story) => {
  const a1 = int(random, 1, 10)
  const r = int(random, 1, 6)
  const n = int(random, 4, 10)
  const answer = a1 + (n - 1) * r
  const instruction = story ? `Uma escadaria começa no degrau ${a1} da torre e cada lance sobe ${r}. Em que número está o ${n}º lance?` : `Qual é o ${n}º termo?`
  return question('input', instruction, `PA: ${a1}, ${a1 + r}, ${a1 + 2 * r}, …`, answer, `aₙ = a₁ + (n − 1)·r = ${a1} + ${n - 1}·${r} = ${answer}.`, 'Na PA, some a razão (n − 1) vezes ao primeiro termo.')
}

const pgTopic: Generator = (random, story) => {
  const a1 = int(random, 1, 5)
  const q = int(random, 2, 3)
  const n = int(random, 3, 6)
  const answer = a1 * q ** (n - 1)
  const instruction = story ? `Um boato começa com ${a1} pessoa${a1 > 1 ? 's' : ''} e, a cada hora, o número de pessoas que sabem ${q === 2 ? 'dobra' : 'triplica'}. Quantas sabem na ${n}ª contagem?` : `Qual é o ${n}º termo?`
  return question('input', instruction, `PG: ${a1}, ${a1 * q}, ${a1 * q * q}, …`, answer, `aₙ = a₁ · qⁿ⁻¹ = ${a1} · ${q}^${n - 1} = ${answer}.`, 'Na PG, multiplique pela razão (n − 1) vezes.')
}

const probabilityTopic: Generator = (random, story) => {
  const kind = pick(random, ['urna', 'dado'] as const)
  if (kind === 'dado') {
    const [label, favorable] = pick(random, [['um número par', 3], ['um número maior que 4', 2], ['o número 6', 1], ['um número menor que 3', 2], ['um múltiplo de 3', 2]] as const)
    const answer = `${favorable}/6`
    const instruction = story ? `Na feira, você ganha um prêmio se o dado mostrar ${label}. Qual é a probabilidade?` : `Probabilidade de sair ${label} num dado`
    return question('choice', instruction, `${label} em 1 dado`, answer, `Há ${favorable} casos favoráveis entre 6 possíveis: ${answer}.`, 'Probabilidade = casos favoráveis ÷ casos possíveis.', choices(answer, [`${6 - favorable}/6`, `${favorable}/3`, `1/${favorable + 1}`], random, () => `${int(random, 1, 5)}/6`))
  }
  const blue = int(random, 1, 8)
  const red = int(random, 1, 8)
  const total = blue + red
  const answer = `${blue}/${total}`
  const instruction = story ? `O mágico tem ${blue} lenços azuis e ${red} vermelhos num chapéu. Qual a chance de tirar um azul?` : 'Qual a probabilidade de tirar uma bola azul?'
  return question('choice', instruction, `${blue} azuis e ${red} vermelhas`, answer, `São ${blue} azuis em ${total} no total: ${answer}.`, 'Divida as azuis pelo total de bolas.', choices(answer, [`${red}/${total}`, `${blue}/${red}`, `${total}/${blue}`], random, () => `${int(random, 1, 9)}/${total}`))
}

export const topicGenerators: Record<TopicId, Generator> = {
  'soma-10': (r, s) => arithmetic(r, s, ['+'], 10),
  'soma-20': (r, s) => arithmetic(r, s, ['+'], 20),
  'subtracao-10': (r, s) => arithmetic(r, s, ['−'], 10),
  'subtracao-20': (r, s) => arithmetic(r, s, ['−'], 20),
  'misto-30': (r, s) => arithmetic(r, s, ['+', '−'], 30),
  'mental-50': (r, s) => arithmetic(r, s, ['+', '−'], 50),
  'mult-2-3': (r, s) => arithmetic(r, s, ['×'], 10, 3),
  'mult-4-5': (r, s) => arithmetic(r, s, ['×'], 10, 5),
  revisao: (r, s) => arithmetic(r, s, ['+', '−', '×'], 50),
  combinadas: combined,
  'fracao-parte': fractionPart,
  'fracao-equivalente': fractionEquivalent,
  'fracao-simplificar': fractionSimplify,
  'fracao-porcentagem': fractionPercent,
  porcentagem: percentOf,
  desconto: discount,
  equacao: equation,
  media: meanTopic,
  mediana: medianTopic,
  moda: modeTopic,
  pitagoras: pythagorasTopic,
  triangulo: triangleTopic,
  circulo: circleTopic,
  trigonometria: trigTopic,
  'funcao-valor': functionValue,
  'funcao-raiz': functionRoot,
  pa: paTopic,
  pg: pgTopic,
  probabilidade: probabilityTopic,
}

export function topicQuestion(topics: TopicId[], random: Random = Math.random, story = false): ChapterQuestion {
  return topicGenerators[pick(random, topics)](random, story)
}

/** Perguntas da batalha contra o guardião: sem expressões repetidas. */
export function topicBattle(topics: TopicId[], count: number, random: Random = Math.random): ChapterQuestion[] {
  const list: ChapterQuestion[] = []
  const seen = new Set<string>()
  let guard = 0
  while (list.length < count && guard++ < count * 30) {
    const item = topicQuestion(topics, random, random() < 0.25)
    const key = `${item.instruction}|${item.expression}`
    if (seen.has(key)) continue
    seen.add(key)
    list.push(item)
  }
  return list
}
