import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Heart, Home, RotateCcw, Sparkles, Star, Target } from 'lucide-react'
import QuestionCard from '../components/learn/QuestionCard'
import LevelMap from '../components/learn/LevelMap'
import QuizLibrary from '../components/quiz/QuizLibrary'
import {
  learningLevels,
  MINIMUM_CORRECT_TO_COMPLETE,
  QUESTIONS_PER_LEVEL,
  type LearningLevel,
  type QuizQuestion,
} from '../data/learningPath'
import { type QuizAnswer } from '../data/quiz'
import { getLevelQuestions, isCorrectAnswer } from '../logic/learning'
import { calculateQuizPoints } from '../logic/quiz'

type LearningPhase = 'map' | 'quiz' | 'result'

interface QuizSession {
  level: LearningLevel
  questions: QuizQuestion[]
}

interface Feedback {
  isCorrect: boolean
  explanation: string
  points: number
}

interface LearningStats {
  completedQuizzes: number
  answeredQuestions: number
  correctAnswers: number
  totalPoints: number
  bestScore: number
}

const PROGRESS_STORAGE_KEY = 'pemfm-learning-completed-levels'
const STATS_STORAGE_KEY = 'pemfm-learning-stats'
const EMPTY_STATS: LearningStats = {
  completedQuizzes: 0,
  answeredQuestions: 0,
  correctAnswers: 0,
  totalPoints: 0,
  bestScore: 0,
}

function getStoredCompletedLevels(): string[] {
  try {
    const storedValue = localStorage.getItem(PROGRESS_STORAGE_KEY)
    const completedIds: unknown = storedValue ? JSON.parse(storedValue) : []
    return Array.isArray(completedIds) && completedIds.every((id) => typeof id === 'string') ? completedIds : []
  } catch {
    return []
  }
}

function getStoredStats(): LearningStats {
  try {
    const storedValue = localStorage.getItem(STATS_STORAGE_KEY)
    const stats: unknown = storedValue ? JSON.parse(storedValue) : null
    if (!stats || typeof stats !== 'object') return EMPTY_STATS

    const candidate = stats as Partial<LearningStats>
    return {
      completedQuizzes: typeof candidate.completedQuizzes === 'number' ? candidate.completedQuizzes : 0,
      answeredQuestions: typeof candidate.answeredQuestions === 'number' ? candidate.answeredQuestions : 0,
      correctAnswers: typeof candidate.correctAnswers === 'number' ? candidate.correctAnswers : 0,
      totalPoints: typeof candidate.totalPoints === 'number' ? candidate.totalPoints : 0,
      bestScore: typeof candidate.bestScore === 'number' ? candidate.bestScore : 0,
    }
  } catch {
    return EMPTY_STATS
  }
}

export default function Aprender() {
  const [phase, setPhase] = useState<LearningPhase>('map')
  const [completedLevelIds, setCompletedLevelIds] = useState<string[]>(getStoredCompletedLevels)
  const [learningStats, setLearningStats] = useState<LearningStats>(getStoredStats)
  const [session, setSession] = useState<QuizSession | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [selectedOption, setSelectedOption] = useState<QuizAnswer | null>(null)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [score, setScore] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const questionStartedAt = useRef(0)

  const currentQuestion = session?.questions[questionIndex]
  const progress = session ? ((questionIndex + (feedback ? 1 : 0)) / session.questions.length) * 100 : 0
  const passedLevel = correctAnswers >= MINIMUM_CORRECT_TO_COMPLETE
  const currentLevelCompleted = session ? completedLevelIds.includes(session.level.id) : false
  const accuracy = learningStats.answeredQuestions > 0
    ? Math.round((learningStats.correctAnswers / learningStats.answeredQuestions) * 100)
    : 0

  useEffect(() => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(completedLevelIds))
  }, [completedLevelIds])

  useEffect(() => {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(learningStats))
  }, [learningStats])

  useEffect(() => {
    if (phase !== 'quiz' || feedback) return

    const updateTimer = () => setElapsedSeconds(Math.floor((Date.now() - questionStartedAt.current) / 1000))
    updateTimer()
    const timer = window.setInterval(updateTimer, 250)
    return () => window.clearInterval(timer)
  }, [phase, questionIndex, feedback])

  const scoreMessage = useMemo(() => {
    if (correctAnswers === QUESTIONS_PER_LEVEL) return 'Excelente! Você dominou este nível.'
    if (passedLevel) return 'Missão cumprida! O próximo nível foi desbloqueado.'
    return `Você precisa de ${MINIMUM_CORRECT_TO_COMPLETE} acertos para liberar a próxima missão.`
  }, [correctAnswers, passedLevel])

  function startLevel(level: LearningLevel) {
    setSession({ level, questions: getLevelQuestions(level, QUESTIONS_PER_LEVEL) })
    setQuestionIndex(0)
    setCorrectAnswers(0)
    setScore(0)
    setElapsedSeconds(0)
    questionStartedAt.current = Date.now()
    setSelectedOption(null)
    setTypedAnswer('')
    setFeedback(null)
    setPhase('quiz')
  }

  function submitAnswer() {
    if (!currentQuestion || feedback) return

    const submittedAnswer = currentQuestion.answerMode === 'choice' ? selectedOption : typedAnswer
    if (submittedAnswer === null || submittedAnswer === '') return

    const isCorrect = isCorrectAnswer(currentQuestion, submittedAnswer)
    const points = calculateQuizPoints(Date.now() - questionStartedAt.current, isCorrect)
    if (isCorrect) setCorrectAnswers((currentScore) => currentScore + 1)
    setScore((currentScore) => currentScore + points)
    setFeedback({ isCorrect, explanation: currentQuestion.explanation, points })
  }

  function continueQuiz() {
    if (!session || !feedback) return

    const isLastQuestion = questionIndex === session.questions.length - 1
    if (isLastQuestion) {
      const finalScore = correctAnswers + (feedback.isCorrect ? 1 : 0)
      setLearningStats((stats) => ({
        completedQuizzes: stats.completedQuizzes + 1,
        answeredQuestions: stats.answeredQuestions + session.questions.length,
        correctAnswers: stats.correctAnswers + finalScore,
        totalPoints: stats.totalPoints + score + feedback.points,
        bestScore: Math.max(stats.bestScore, score + feedback.points),
      }))

      if (finalScore >= MINIMUM_CORRECT_TO_COMPLETE && !completedLevelIds.includes(session.level.id)) {
        setCompletedLevelIds((completedIds) => [...completedIds, session.level.id])
      }
      setPhase('result')
      return
    }

    setQuestionIndex((currentIndex) => currentIndex + 1)
    setSelectedOption(null)
    setTypedAnswer('')
    setFeedback(null)
    setElapsedSeconds(0)
    questionStartedAt.current = Date.now()
  }

  function returnToMap() {
    setPhase('map')
    setSession(null)
    setFeedback(null)
  }

  if (phase === 'map') {
    return (
      <div className="space-y-8">
        <section className="rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 p-6 text-white shadow-lg sm:p-10">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-black tracking-wider"><Sparkles size={15} /> APRENDA JOGANDO</p>
            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Sua jornada na matemática começa aqui.</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-violet-100 sm:text-lg">Cada nível traz 5 desafios escolhidos aleatoriamente. Acerte ao menos 3 para abrir a próxima missão.</p>
          </div>
        </section>

        <section aria-labelledby="learning-stats-title">
          <div className="mb-5">
            <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-black tracking-[0.2em] text-violet-700"><Target size={15} /> SEU PROGRESSO</p>
            <h2 id="learning-stats-title" className="text-2xl font-black text-slate-900 sm:text-3xl">Veja sua evolução</h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">Seus resultados ficam salvos neste dispositivo para você acompanhar sua evolução.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black tracking-widest text-slate-500">NÍVEIS</p>
              <p className="mt-1 text-3xl font-black text-violet-600">{completedLevelIds.length}/{learningLevels.length}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">concluídos</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black tracking-widest text-slate-500">QUESTÕES</p>
              <p className="mt-1 text-3xl font-black text-blue-600">{learningStats.answeredQuestions}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">respondidas</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black tracking-widest text-slate-500">PRECISÃO</p>
              <p className="mt-1 text-3xl font-black text-emerald-600">{accuracy}%</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">de acertos</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black tracking-widest text-slate-500">MELHOR PONTUAÇÃO</p>
              <p className="mt-1 text-3xl font-black text-amber-500">{learningStats.bestScore}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">em uma partida</p>
            </div>
          </div>
        </section>

        <QuizLibrary />
        <LevelMap levels={learningLevels} completedLevelIds={completedLevelIds} onStartLevel={startLevel} />
      </div>
    )
  }

  if (phase === 'result' && session) {
    return (
      <div className="mx-auto max-w-2xl">
        <section className={`rounded-3xl border p-6 text-center shadow-sm sm:p-10 ${passedLevel ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
          <div className="mb-4 text-6xl" aria-hidden="true">{passedLevel ? '🏆' : '💪'}</div>
          <p className="text-xs font-black tracking-[0.18em] text-slate-500">NÍVEL {session.level.order} · {session.level.title.toUpperCase()}</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">{passedLevel ? 'Nível concluído!' : 'Quase lá!'}</h1>
          <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-slate-600">{scoreMessage}</p>

          <div className="mx-auto my-7 grid max-w-sm grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="text-3xl font-black text-emerald-600">{correctAnswers}/5</div>
              <div className="mt-1 text-xs font-bold text-slate-500">ACERTOS</div>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="text-3xl font-black text-violet-600">{score}</div>
              <div className="mt-1 text-xs font-bold text-slate-500">PONTOS</div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => startLevel(session.level)} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 font-black text-white transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300">
              <RotateCcw size={18} /> Tentar novamente
            </button>
            <button type="button" onClick={returnToMap} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-5 font-black text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300">
              <Home size={18} /> Ver jornada
            </button>
          </div>
        </section>
      </div>
    )
  }

  if (!session || !currentQuestion) return null

  return (
    <div className="mx-auto max-w-3xl">
      <button type="button" onClick={returnToMap} className="mb-5 inline-flex min-h-[44px] items-center gap-1.5 rounded-lg text-sm font-bold text-violet-700 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
        <ArrowLeft size={17} /> Voltar para níveis
      </button>

      <section aria-label="Progresso do nível" className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-black tracking-widest text-slate-500">NÍVEL {session.level.order}</p>
            <h1 className="text-lg font-black text-slate-900">{session.level.icon} {session.level.title}</h1>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-sm font-black text-rose-600"><Heart size={16} fill="currentColor" /> {correctAnswers} acertos</p>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-black text-violet-700"><Star size={16} /> {score} pontos</p>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-black text-slate-700"><Clock3 size={16} /> {elapsedSeconds}s</p>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: session.level.color }} />
        </div>
      </section>

      <QuestionCard
        question={currentQuestion}
        questionNumber={questionIndex + 1}
        totalQuestions={session.questions.length}
        selectedOption={selectedOption}
        typedAnswer={typedAnswer}
        isAnswered={feedback !== null}
        onSelectOption={setSelectedOption}
        onTypedAnswerChange={setTypedAnswer}
        onSubmit={submitAnswer}
      />

      {feedback && (
        <section aria-live="polite" className={`mt-4 rounded-3xl border p-5 shadow-sm sm:p-6 ${feedback.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
          <div className="flex gap-3">
            <CheckCircle2 className={feedback.isCorrect ? 'shrink-0 text-emerald-600' : 'shrink-0 text-rose-600'} size={24} />
            <div>
              <h2 className={`text-lg font-black ${feedback.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>{feedback.isCorrect ? 'Muito bem!' : 'Vamos aprender com este erro'}</h2>
              {feedback.isCorrect && <p className="mt-1 font-black text-emerald-700">+{feedback.points} pontos pela resposta e velocidade</p>}
              <p className="mt-1 leading-relaxed text-slate-700">{feedback.explanation}</p>
              {!feedback.isCorrect && <p className="mt-2 font-bold text-slate-800">Resposta correta: {currentQuestion.answer}</p>}
            </div>
          </div>
          <button type="button" onClick={continueQuiz} className={`mt-5 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl px-5 font-black text-white transition focus-visible:outline-none focus-visible:ring-4 ${feedback.isCorrect ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-300' : 'bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-300'}`}>
            {questionIndex === session.questions.length - 1 ? 'Ver resultado' : 'Próxima questão'} <ArrowRight size={18} />
          </button>
        </section>
      )}

      {currentLevelCompleted && <p className="mt-4 text-center text-sm font-bold text-emerald-700">Este nível já foi concluído. Você está praticando para fortalecer suas habilidades!</p>}
    </div>
  )
}
