import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, RotateCcw, Star, Target } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import QuestionCard from '../components/learn/QuestionCard'
import { QUIZ_QUESTION_COUNT, quizTopics, type QuizAnswer, type QuizQuestion, type QuizTopic } from '../data/quiz'
import { calculateQuizPoints, generateSimulatorQuiz, isCorrectAnswer } from '../logic/quiz'

type QuizPhase = 'intro' | 'quiz' | 'result'

interface Feedback {
  isCorrect: boolean
  explanation: string
  points: number
}

function isQuizTopic(topic: string | undefined): topic is QuizTopic {
  return Boolean(topic && topic in quizTopics)
}

export default function Quiz() {
  const { topic } = useParams()
  const [phase, setPhase] = useState<QuizPhase>('intro')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<QuizAnswer | null>(null)
  const [typedAnswer, setTypedAnswer] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [score, setScore] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const questionStartedAt = useRef(0)

  const currentQuestion = questions[questionIndex]

  useEffect(() => {
    if (phase !== 'quiz' || feedback) return
    const updateTimer = () => setElapsedSeconds(Math.floor((Date.now() - questionStartedAt.current) / 1000))
    updateTimer()
    const timer = window.setInterval(updateTimer, 250)
    return () => window.clearInterval(timer)
  }, [phase, questionIndex, feedback])

  if (!isQuizTopic(topic)) return <Navigate to="/" replace />

  const config = quizTopics[topic]

  function startQuiz() {
    if (!isQuizTopic(topic)) return
    setQuestions(generateSimulatorQuiz(topic, QUIZ_QUESTION_COUNT))
    setQuestionIndex(0)
    setSelectedOption(null)
    setTypedAnswer('')
    setFeedback(null)
    setCorrectAnswers(0)
    setScore(0)
    setElapsedSeconds(0)
    questionStartedAt.current = Date.now()
    setPhase('quiz')
  }

  function submitAnswer() {
    if (!currentQuestion || feedback) return
    const submittedAnswer = currentQuestion.answerMode === 'choice' ? selectedOption : typedAnswer
    if (submittedAnswer === null || submittedAnswer === '') return

    const correct = isCorrectAnswer(currentQuestion, submittedAnswer)
    const points = calculateQuizPoints(Date.now() - questionStartedAt.current, correct)
    if (correct) setCorrectAnswers((value) => value + 1)
    setScore((value) => value + points)
    setFeedback({ isCorrect: correct, explanation: currentQuestion.explanation, points })
  }

  function continueQuiz() {
    if (questionIndex === questions.length - 1) {
      setPhase('result')
      return
    }
    setQuestionIndex((value) => value + 1)
    setSelectedOption(null)
    setTypedAnswer('')
    setFeedback(null)
    setElapsedSeconds(0)
    questionStartedAt.current = Date.now()
  }

  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-2xl">
        <Link to={config.simulatorPath} className="mb-5 inline-flex min-h-[44px] items-center gap-2 font-bold text-violet-700 hover:underline"><ArrowLeft size={18} /> Voltar ao simulador</Link>
        <section className="rounded-3xl bg-gradient-to-br from-violet-700 to-indigo-700 p-7 text-center text-white shadow-lg sm:p-10">
          <div className="text-6xl" aria-hidden="true">{config.icon}</div>
          <p className="mt-5 text-xs font-black tracking-[0.18em] text-violet-200">DESAFIO DE 5 QUESTÕES</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">{config.title}</h1>
          <p className="mx-auto mt-3 max-w-lg text-violet-100">{config.description}</p>
          <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 text-left text-sm font-bold">
            <p className="rounded-xl bg-white/10 p-3"><Target className="mb-1" size={20} />100 pontos por acerto</p>
            <p className="rounded-xl bg-white/10 p-3"><Clock3 className="mb-1" size={20} />Até 100 de bônus por rapidez</p>
          </div>
          <button type="button" onClick={startQuiz} className="mt-7 inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-white px-7 font-black text-violet-700 transition hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300">
            Começar quiz <ArrowRight size={19} />
          </button>
        </section>
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div className="mx-auto max-w-2xl">
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7 text-center shadow-sm sm:p-10">
          <div className="text-6xl" aria-hidden="true">🏆</div>
          <p className="mt-4 text-xs font-black tracking-[0.18em] text-emerald-700">QUIZ CONCLUÍDO</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">{config.title}</h1>
          <div className="mx-auto my-7 grid max-w-sm grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-3xl font-black text-emerald-600">{correctAnswers}/{QUIZ_QUESTION_COUNT}</div><div className="mt-1 text-xs font-bold text-slate-500">ACERTOS</div></div>
            <div className="rounded-2xl bg-white p-4 shadow-sm"><div className="text-3xl font-black text-violet-600">{score}</div><div className="mt-1 text-xs font-bold text-slate-500">PONTOS</div></div>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={startQuiz} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 font-black text-white hover:bg-violet-700"><RotateCcw size={18} /> Novo desafio</button>
            <Link to={config.simulatorPath} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-5 font-black text-slate-700 hover:bg-slate-50"><ArrowLeft size={18} /> Voltar ao simulador</Link>
          </div>
        </section>
      </div>
    )
  }

  if (!currentQuestion) return null

  const progress = ((questionIndex + (feedback ? 1 : 0)) / questions.length) * 100

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={config.simulatorPath} className="mb-5 inline-flex min-h-[44px] items-center gap-2 font-bold text-violet-700 hover:underline"><ArrowLeft size={18} /> Sair do quiz</Link>
      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-black text-slate-900">{config.icon} {config.title}</h1>
          <div className="flex flex-wrap gap-2 text-sm font-black">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700"><Target size={16} /> {correctAnswers}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1.5 text-violet-700"><Star size={16} /> {score}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-slate-700"><Clock3 size={16} /> {elapsedSeconds}s</span>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-600 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      </section>

      <QuestionCard question={currentQuestion} questionNumber={questionIndex + 1} totalQuestions={questions.length} selectedOption={selectedOption} typedAnswer={typedAnswer} isAnswered={feedback !== null} onSelectOption={setSelectedOption} onTypedAnswerChange={setTypedAnswer} onSubmit={submitAnswer} />

      {feedback && (
        <section aria-live="polite" className={`mt-4 rounded-3xl border p-5 shadow-sm ${feedback.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
          <div className="flex gap-3">
            <CheckCircle2 className={feedback.isCorrect ? 'shrink-0 text-emerald-600' : 'shrink-0 text-rose-600'} size={24} />
            <div><h2 className="text-lg font-black text-slate-900">{feedback.isCorrect ? `Correto! +${feedback.points} pontos` : 'Ainda não. Veja como resolver:'}</h2><p className="mt-1 text-slate-700">{feedback.explanation}</p>{!feedback.isCorrect && <p className="mt-2 font-bold">Resposta correta: {currentQuestion.answer}</p>}</div>
          </div>
          <button type="button" onClick={continueQuiz} className={`mt-5 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl px-5 font-black text-white ${feedback.isCorrect ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>{questionIndex === questions.length - 1 ? 'Ver resultado' : 'Próxima questão'} <ArrowRight size={18} /></button>
        </section>
      )}
    </div>
  )
}
