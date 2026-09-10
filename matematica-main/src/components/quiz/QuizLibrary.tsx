import { ArrowRight, Clock3, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { quizTopics, type QuizTopic } from '../../data/quiz'

const topics = Object.entries(quizTopics) as Array<[QuizTopic, (typeof quizTopics)[QuizTopic]]>

export default function QuizLibrary() {
  return (
    <section aria-labelledby="quiz-library-title">
      <div className="mb-5">
        <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-black tracking-[0.2em] text-violet-700"><Trophy size={15} /> QUIZZES RÁPIDOS</p>
        <h2 id="quiz-library-title" className="text-2xl font-black text-slate-900 sm:text-3xl">Escolha um tema para praticar</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">Cada partida tem 5 questões aleatórias. Você recebe 100 pontos pelo acerto e até 100 pontos extras pela rapidez.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {topics.map(([topic, config]) => (
          <article key={topic} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-2xl" aria-hidden="true">{config.icon}</span>
              <h3 className="text-xl font-black text-slate-900">{config.title}</h3>
            </div>
            <p className="mb-5 flex-1 text-sm leading-relaxed text-slate-600">{config.description}</p>
            <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-violet-700"><Clock3 size={15} /> Pontos por acerto e velocidade</p>
            <Link to={`/quiz/${topic}`} className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 text-sm font-black text-white transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300">
              Começar quiz <ArrowRight size={17} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
