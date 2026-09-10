import { Check, Send } from 'lucide-react'
import { type QuizAnswer, type QuizQuestion } from '../../data/quiz'

interface QuestionCardProps {
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  selectedOption: QuizAnswer | null
  typedAnswer: string
  isAnswered: boolean
  onSelectOption: (option: QuizAnswer) => void
  onTypedAnswerChange: (answer: string) => void
  onSubmit: () => void
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  typedAnswer,
  isAnswered,
  onSelectOption,
  onTypedAnswerChange,
  onSubmit,
}: QuestionCardProps) {
  const canSubmit = question.answerMode === 'choice' ? selectedOption !== null : typedAnswer.trim().length > 0

  return (
    <section aria-labelledby="question-title" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-3 text-sm font-bold text-slate-500">
        <span>Questão {questionNumber} de {totalQuestions}</span>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs tracking-wide text-violet-700">DESAFIO</span>
      </div>

      <h2 id="question-title" className="mb-8 text-center text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
        {question.prompt}
      </h2>

      {question.answerMode === 'choice' && question.options && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Alternativas de resposta">
          {question.options.map((option) => {
            const isSelected = selectedOption === option
            return (
              <button
                key={String(option)}
                type="button"
                disabled={isAnswered}
                aria-pressed={isSelected}
                onClick={() => onSelectOption(option)}
                className={`min-h-[64px] rounded-2xl border-2 px-4 text-xl font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:cursor-default ${
                  isSelected
                    ? 'border-violet-600 bg-violet-600 text-white shadow-md'
                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-violet-300 hover:bg-violet-50'
                }`}
              >
                {option}
              </button>
            )
          })}
        </div>
      )}

      {question.answerMode === 'input' && (
        <form
          className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            if (canSubmit && !isAnswered) onSubmit()
          }}
        >
          <label className="sr-only" htmlFor="typed-answer">Digite sua resposta</label>
          <input
            id="typed-answer"
            type="number"
            inputMode="numeric"
            value={typedAnswer}
            disabled={isAnswered}
            onChange={(event) => onTypedAnswerChange(event.target.value)}
            placeholder="Digite a resposta"
            className="min-h-[60px] flex-1 rounded-2xl border-2 border-slate-300 bg-white px-4 text-center text-xl font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-600 focus:ring-4 focus:ring-violet-200 disabled:opacity-70"
          />
          <button
            type="submit"
            disabled={!canSubmit || isAnswered}
            className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-base font-black text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={18} /> Conferir
          </button>
        </form>
      )}

      {question.answerMode === 'choice' && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isAnswered}
          className="mx-auto mt-5 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 text-base font-black text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Check size={18} /> Conferir resposta
        </button>
      )}
    </section>
  )
}
