import { Check, ExternalLink, Printer, Star } from 'lucide-react'
import { emptyProgress, type ChapterProgress } from '../../data/chapter'
import { getContent } from '../../data/mathContent'
import { questBooks } from '../../data/questBooks'
import { formatTime } from '../../logic/chapter'
import { starsFor } from '../../logic/quest'
import { Overlay } from './GameMenus'

interface Props {
  progresses: Record<string, ChapterProgress>
  onClose: () => void
  /** Abre a fase direto (o professor escolhe a fase para a turma jogar no projetor). */
  onOpenPhase: (bookIndex: number, phase: number) => void
}

/** Painel do professor: o que já foi jogado neste aparelho, fase por fase, com o simulador de cada uma. */
export default function TeacherDashboard({ progresses, onClose, onOpenPhase }: Props) {
  return (
    <Overlay title="Painel do professor" kicker="PROGRESSO NESTE APARELHO" onClose={onClose} className="teacher-dashboard">
      <p className="teacher-dashboard-intro">Veja as fases concluídas, as estrelas e o melhor resultado de cada uma. Toque numa fase para abri-la direto no projetor, ou no simulador para revisar o conteúdo antes.</p>
      <div className="teacher-dashboard-books">
        {questBooks.map((book, bookIndex) => {
          const progress = progresses[book.id] ?? emptyProgress()
          const total = book.phases.length
          const stars = progress.completed.reduce((sum, n) => sum + starsFor(n, progress.best[n]?.correct ?? 0, total), 0)
          return (
            <section key={book.id} className="teacher-book">
              <header>
                <strong>
                  Livro {book.roman} · {book.title} {book.accent}
                </strong>
                <span>
                  {progress.completed.length}/{total} fases · {stars}/{total * 3} ★
                </span>
              </header>
              <div className="teacher-progress" aria-hidden="true">
                <span style={{ width: `${(progress.completed.length / total) * 100}%` }} />
              </div>
              <ol>
                {book.phases.map((phase, i) => {
                  const n = i + 1
                  const done = progress.completed.includes(n)
                  const best = progress.best[n]
                  const phaseStars = done ? starsFor(n, best?.correct ?? 0, total) : 0
                  return (
                    <li key={n} className={done ? 'done' : ''}>
                      <button type="button" className="teacher-phase" onClick={() => onOpenPhase(bookIndex, n)} aria-label={`Abrir a fase ${n}: ${phase.title}`}>
                        <span className="teacher-phase-n">{done ? <Check size={14} /> : n}</span>
                        <span className="teacher-phase-text">
                          <strong>{phase.title}</strong>
                          <small>{phase.topic}</small>
                        </span>
                        <span className="teacher-phase-result">
                          {done ? (
                            <>
                              <span className="teacher-stars" aria-label={`${phaseStars} estrelas`}>
                                {[1, 2, 3].map((k) => (
                                  <Star key={k} size={12} fill={k <= phaseStars ? 'currentColor' : 'none'} />
                                ))}
                              </span>
                              {best && (
                                <small>
                                  {best.correct} acertos · {formatTime(best.seconds)}
                                </small>
                              )}
                            </>
                          ) : (
                            <small>não jogada</small>
                          )}
                        </span>
                      </button>
                      {phase.simulator && (
                        <a className="teacher-sim" href={`/${phase.simulator}`} target="_blank" rel="noreferrer" title={`Abrir o simulador ${getContent(phase.simulator).title}`}>
                          <ExternalLink size={14} /> <span>{getContent(phase.simulator).title}</span>
                        </a>
                      )}
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      </div>
      <button type="button" className="rpg-button teacher-print" onClick={() => window.print()}>
        <Printer size={16} /> Imprimir relatório
      </button>
    </Overlay>
  )
}
