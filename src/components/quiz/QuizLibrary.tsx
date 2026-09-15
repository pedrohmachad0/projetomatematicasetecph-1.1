import { ArrowRight, Clock3, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { quizTopics, type QuizTopic } from '../../data/quiz'
import { getQuizStats } from '../../logic/quizStats'

const topics = Object.entries(quizTopics) as Array<[QuizTopic, (typeof quizTopics)[QuizTopic]]>

export default function QuizLibrary() {
  const stats = getQuizStats()

  return (
    <section aria-labelledby="quiz-library-title">
      <div className="mb-5">
        <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-black tracking-[0.2em] text-violet-700"><Trophy size={15} /> QUIZZES RÁPIDOS</p>
        <h2 id="quiz-library-title" className="text-2xl font-black text-slate-900 sm:text-3xl">Escolha um tema para praticar</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">Cada partida tem 5 questões aleatórias. Seus resultados ficam salvos neste dispositivo para acompanhar sua evolução.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {topics.map(([topic, config]) => {
          const topicStats = stats[topic]
          const accuracy = topicStats.answeredQuestions > 0
            ? Math.round((topicStats.correctAnswers / topicStats.answeredQuestions) * 100)
            : 0

          return (
            <article key={topic} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-2xl" aria-hidden="true">{config.icon}</span>
                <h3 className="text-xl font-black text-slate-900">{config.title}</h3>
              </div>
              <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-600">{config.description}</p>
              <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="text-lg font-black text-slate-900">{topicStats.attempts}</p>
                  <p className="text-[10px] font-black tracking-wide text-slate-500">PARTIDAS</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="text-lg font-black text-emerald-600">{accuracy}%</p>
                  <p className="text-[10px] font-black tracking-wide text-slate-500">PRECISÃO</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5">
                  <p className="text-lg font-black text-amber-500">{topicStats.bestScore}</p>
                  <p className="text-[10px] font-black tracking-wide text-slate-500">MELHOR</p>
                </div>
              </div>
              <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-violet-700"><Clock3 size={15} /> 100 pontos + bônus por velocidade</p>
              <Link to={`/quiz/${topic}`} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 text-sm font-black text-white transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300">
                {topicStats.attempts > 0 ? 'Jogar novamente' : 'Começar quiz'} <ArrowRight size={17} />
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}
