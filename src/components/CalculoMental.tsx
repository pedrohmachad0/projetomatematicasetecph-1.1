import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  gerarQuestaoSoma,
  gerarQuestaoSubtracao,
  verificarResposta,
  calcularPontos,
  gerarFeedback,
  type Questao,
  type Operacao,
} from '../logic/calculoMental'

interface Props {
  operacao: Operacao
}

const TOTAL_QUESTOES = 10
const TEMPO_POR_QUESTAO_MS = 15000

export default function CalculoMental({ operacao }: Props) {
  const titulo = operacao === 'soma' ? '➕ Cálculo Mental – Soma' : '➖ Cálculo Mental – Subtração'
  const pathVoltar = '/'

  type Fase = 'idle' | 'jogando' | 'resultado'

  const [fase, setFase] = useState<Fase>('idle')
  const [questao, setQuestao] = useState<Questao | null>(null)
  const [input, setInput] = useState('')
  const [pontuacao, setPontuacao] = useState(0)
  const [numQuestao, setNumQuestao] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [acertos, setAcertos] = useState(0)
  const [tempoRestante, setTempoRestante] = useState(TEMPO_POR_QUESTAO_MS)
  const inicioQuestaoRef = useRef<number>(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const gerarQuestao = useCallback(() => {
    return operacao === 'soma' ? gerarQuestaoSoma() : gerarQuestaoSubtracao()
  }, [operacao])

  const limparTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const proximaQuestao = useCallback(
    (q: number) => {
      if (q >= TOTAL_QUESTOES) {
        limparTimer()
        setFase('resultado')
        return
      }
      setQuestao(gerarQuestao())
      setNumQuestao(q)
      setInput('')
      setFeedback(null)
      setTempoRestante(TEMPO_POR_QUESTAO_MS)
      inicioQuestaoRef.current = Date.now()
      setTimeout(() => inputRef.current?.focus(), 50)
    },
    [gerarQuestao],
  )

  // Timer de contagem regressiva
  useEffect(() => {
    if (fase !== 'jogando') return
    limparTimer()
    timerRef.current = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 100) {
          // Tempo esgotado – avança automaticamente
          limparTimer()
          setFeedback('Tempo esgotado! ⏱️')
          setTimeout(() => {
            setNumQuestao((n) => {
              const next = n + 1
              proximaQuestao(next)
              return next
            })
          }, 900)
          return 0
        }
        return prev - 100
      })
    }, 100)
    return limparTimer
  }, [fase, questao, acertos, pontuacao, proximaQuestao])

  function iniciar() {
    setPontuacao(0)
    setAcertos(0)
    setFeedback(null)
    setFase('jogando')
    const q = gerarQuestao()
    setQuestao(q)
    setNumQuestao(0)
    setInput('')
    setTempoRestante(TEMPO_POR_QUESTAO_MS)
    inicioQuestaoRef.current = Date.now()
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function confirmar() {
    if (!questao) return
    const tentativa = parseInt(input, 10)
    if (isNaN(tentativa)) return

    limparTimer()
    const tempoMs = Date.now() - inicioQuestaoRef.current
    const acertou = verificarResposta(questao, tentativa)
    const pontos = calcularPontos(tempoMs, acertou)
    const msg = gerarFeedback(acertou, questao.resposta)

    const novoPontos = pontuacao + pontos
    const novosAcertos = acertos + (acertou ? 1 : 0)

    setPontuacao(novoPontos)
    setAcertos(novosAcertos)
    setFeedback(msg)

    setTimeout(() => {
      const next = numQuestao + 1
      proximaQuestao(next)
      setNumQuestao(next)
    }, 900)
  }

  const progressoTempo = (tempoRestante / TEMPO_POR_QUESTAO_MS) * 100
  const simbolo = operacao === 'soma' ? '+' : '−'

  return (
    <div>
      <Link
        to={pathVoltar}
        className="inline-flex items-center gap-1 text-sm mb-6 hover:underline"
        style={{ color: '#2563eb' }}
      >
        ← Voltar ao início
      </Link>

      <h1 className="text-3xl font-bold mb-2" style={{ color: '#1e3a8a' }}>
        {titulo}
      </h1>
      <p className="mb-8" style={{ color: '#64748b' }}>
        {TOTAL_QUESTOES} questões cronometradas. Responda o mais rápido possível!
      </p>

      {/* IDLE */}
      {fase === 'idle' && (
        <div
          className="rounded-2xl shadow-sm p-10 text-center max-w-md mx-auto"
          style={{ background: 'white', border: '1px solid #e2e8f0' }}
        >
          <div className="text-6xl mb-4">{operacao === 'soma' ? '➕' : '➖'}</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#1e3a8a' }}>
            Pronto para começar?
          </h2>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            Você terá {TEMPO_POR_QUESTAO_MS / 1000} segundos por questão. Respostas mais rápidas
            valem mais pontos!
          </p>
          <button
            id="btn-iniciar"
            onClick={iniciar}
            className="px-8 py-3 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}
          >
            Iniciar
          </button>
        </div>
      )}

      {/* JOGANDO */}
      {fase === 'jogando' && questao && (
        <div className="max-w-md mx-auto">
          {/* Progresso */}
          <div className="flex justify-between text-sm mb-2" style={{ color: '#64748b' }}>
            <span>
              Questão {numQuestao + 1} de {TOTAL_QUESTOES}
            </span>
            <span className="font-bold" style={{ color: '#1e40af' }}>
              ⭐ {pontuacao} pts
            </span>
          </div>
          <div className="w-full h-2 rounded-full mb-1" style={{ background: '#e2e8f0' }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${(numQuestao / TOTAL_QUESTOES) * 100}%`,
                background: 'linear-gradient(90deg, #1e40af, #3b82f6)',
              }}
            />
          </div>

          {/* Timer */}
          <div className="w-full h-1.5 rounded-full mb-6" style={{ background: '#fee2e2' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-100"
              style={{
                width: `${progressoTempo}%`,
                background:
                  progressoTempo > 40 ? '#22c55e' : progressoTempo > 20 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>

          {/* Questão */}
          <div
            className="rounded-2xl shadow-sm p-8 text-center mb-4"
            style={{ background: 'white', border: '1px solid #e2e8f0' }}
          >
            <div className="text-5xl font-bold mb-6" style={{ color: '#1e3a8a' }}>
              {questao.a} {simbolo} {questao.b} = ?
            </div>

            {feedback ? (
              <div
                className="text-xl font-bold py-3 px-6 rounded-xl"
                style={{
                  background:
                    feedback.includes('❌') || feedback.includes('⏱') ? '#fef2f2' : '#f0fdf4',
                  color: feedback.includes('❌') || feedback.includes('⏱') ? '#dc2626' : '#16a34a',
                }}
              >
                {feedback}
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                <input
                  id="input-resposta"
                  ref={inputRef}
                  type="number"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmar()}
                  placeholder="Sua resposta"
                  className="w-36 text-center text-xl font-bold rounded-xl px-4 py-3 outline-none border-2 transition-colors"
                  style={{ borderColor: '#1e40af', color: '#1e3a8a' }}
                />
                <button
                  id="btn-confirmar"
                  onClick={confirmar}
                  className="px-5 py-3 rounded-xl font-bold text-white"
                  style={{ background: '#1e40af' }}
                >
                  OK
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-center" style={{ color: '#94a3b8' }}>
            ⏱ {(tempoRestante / 1000).toFixed(1)}s restantes · Pressione Enter para confirmar
          </p>
        </div>
      )}

      {/* RESULTADO */}
      {fase === 'resultado' && (
        <div
          className="rounded-2xl shadow-sm p-10 text-center max-w-md mx-auto"
          style={{ background: 'white', border: '1px solid #e2e8f0' }}
        >
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#1e3a8a' }}>
            Resultado Final
          </h2>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            Você completou todas as questões!
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl p-3" style={{ background: '#eff6ff' }}>
              <div className="text-2xl font-bold" style={{ color: '#1e40af' }}>
                {pontuacao}
              </div>
              <div className="text-xs" style={{ color: '#64748b' }}>
                Pontos
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#f0fdf4' }}>
              <div className="text-2xl font-bold" style={{ color: '#16a34a' }}>
                {acertos}
              </div>
              <div className="text-xs" style={{ color: '#64748b' }}>
                Acertos
              </div>
            </div>
            <div className="rounded-xl p-3" style={{ background: '#fef2f2' }}>
              <div className="text-2xl font-bold" style={{ color: '#dc2626' }}>
                {TOTAL_QUESTOES - acertos}
              </div>
              <div className="text-xs" style={{ color: '#64748b' }}>
                Erros
              </div>
            </div>
          </div>

          <div className="text-sm mb-6" style={{ color: '#475569' }}>
            {acertos === TOTAL_QUESTOES
              ? '🎉 Perfeito! Você acertou tudo!'
              : acertos >= 7
                ? '🌟 Muito bem! Desempenho excelente!'
                : acertos >= 5
                  ? '👍 Bom trabalho! Continue praticando.'
                  : '💪 Continue praticando para melhorar!'}
          </div>

          <button
            id="btn-jogar-novamente"
            onClick={iniciar}
            className="px-8 py-3 rounded-xl font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)' }}
          >
            Jogar Novamente
          </button>
        </div>
      )}
    </div>
  )
}
