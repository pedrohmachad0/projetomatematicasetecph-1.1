import { useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  Heart,
  LockKeyhole,
  Map,
  Moon,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Sun,
  Swords,
  X,
} from 'lucide-react'
import { CHAPTER_STORAGE, chapterLevels } from '../data/chapter'
import { formatTime, readChapterProgress, recordVictory } from '../logic/chapter'
import ChapterBattle, { type BattleResult } from '../components/learn/ChapterBattle'
import Inventory, { coinsForLevel } from '../components/learn/Inventory'
import {
  ForestBackdrop,
  PixelChest,
  PixelFire,
  PixelOgre,
  PixelTree,
  PixelItem,
} from '../components/learn/PixelArt'
import { type ThemeContext } from '../components/Layout'
import '../styles/chapter.css'

const positions = [
  [43, 10],
  [54, 19],
  [48, 28],
  [36, 37],
  [43, 46],
  [56, 55],
  [63, 64],
  [53, 73],
  [41, 82],
  [52, 92],
]
const path = positions.map(([x, y], i) => `${i ? 'L' : 'M'} ${x * 7.2} ${y * 7.8}`).join(' ')

export default function Aprender() {
  const { isDark, toggleTheme } = useOutletContext<ThemeContext>()
  const [progress, setProgress] = useState(readChapterProgress)
  const [selected, setSelected] = useState(Math.min(progress.completed.length + 1, 10))
  const [screen, setScreen] = useState<'map' | 'battle' | 'result'>('map')
  const [panel, setPanel] = useState<'books' | null>(null)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [result, setResult] = useState<(BattleResult & { earned: number }) | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [storageError, setStorageError] = useState(false)
  const missionCard = useRef<HTMLElement>(null)
  const unlocked = Math.min(progress.completed.length + 1, 10)
  const level = chapterLevels[selected - 1]
  const complete = progress.completed.includes(selected)
  const locked = selected > unlocked
  const boss = selected === 10
  const finishedChapter = progress.completed.length === 10
  const xpLevel = Math.floor(progress.xp / 300) + 1

  function start(n = selected) {
    if (n > unlocked) return
    setSelected(n)
    setAttempt((a) => a + 1)
    setScreen('battle')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  function finish(battle: BattleResult) {
    let earned = 0
    if (battle.won) {
      const update = recordVictory(progress, battle.level, battle.correct, battle.seconds)
      earned = update.earned
      setProgress(update.progress)
      try {
        localStorage.setItem(CHAPTER_STORAGE, JSON.stringify(update.progress))
        setStorageError(false)
      } catch {
        setStorageError(true)
      }
    }
    setResult({ ...battle, earned })
    setScreen('result')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <div className="rpg-app tab-slide-in">
      <header className="rpg-header">
        <Link to="/aprender" className="rpg-brand" onClick={() => setScreen('map')}>
          <span className="brand-mark">
            <Swords size={24} />
          </span>
          <span>
            MATH<span className="brand-quest">QUEST</span>
            <small>PEQUENOS PASSOS. GRANDES CONQUISTAS.</small>
          </span>
        </Link>
        <nav aria-label="Navegação principal">
          <Link to="/">Simuladores</Link>
          <button className="active" aria-current="page" onClick={() => setScreen('map')}>
            <Map size={17} /> Aventura
          </button>
        </nav>
        <div className="header-player">
          <button
            type="button"
            className="rpg-theme-button"
            onClick={toggleTheme}
            aria-pressed={isDark}
            aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDark ? 'Tema claro' : 'Tema escuro'}</span>
          </button>
          <span className="xp-counter">
            <Star size={16} fill="currentColor" />
            {progress.xp} XP
          </span>
          <button
            type="button"
            className="player-avatar"
            aria-label="Abrir inventário"
            onClick={() => setInventoryOpen(true)}
          >
            V<span>{xpLevel}</span>
          </button>
        </div>
      </header>
      {screen === 'battle' ? (
        <ChapterBattle
          key={attempt}
          level={selected}
          onExit={() => setScreen('map')}
          onFinish={finish}
        />
      ) : screen === 'result' && result ? (
        <main className="result-page" id="conteudo">
          <p className="eyebrow">LIVRO I · FASE {String(result.level).padStart(2, '0')}</p>
          <div className={`result-art ${result.won ? 'won' : ''}`}>
            {result.level === 10 ? (
              <PixelOgre mood={result.won ? 'defeated' : 'laugh'} />
            ) : result.won ? (
              <PixelChest />
            ) : (
              <PixelFire />
            )}
          </div>
          <p className="eyebrow">
            {result.won
              ? result.level === 10
                ? 'A FLORESTA VOLTOU A BRILHAR'
                : 'MAIS UM PASSO NA SUA HISTÓRIA'
              : 'SUA AVENTURA AINDA NÃO ACABOU'}
          </p>
          <h1>
            {result.won
              ? result.level === 10
                ? 'Grum foi derrotado!'
                : 'Fase concluída!'
              : result.reason === 'time'
                ? 'O tempo acabou!'
                : 'Suas vidas acabaram'}
          </h1>
          <p>
            {result.won
              ? result.level === 10
                ? 'Você concluiu o Livro I e conquistou a Coroa das Brasas.'
                : 'A chama cresceu. O próximo trecho da floresta espera por você.'
              : 'Respire, revise a dica e tente outra vez. Cada tentativa traz novos desafios.'}
          </p>
          <div className="result-stats">
            <div>
              <Check />
              <strong>
                {result.correct}/{result.level === 10 ? 10 : 8}
              </strong>
              <small>ACERTOS</small>
            </div>
            <div>
              <Clock3 />
              <strong>{formatTime(result.seconds)}</strong>
              <small>TEMPO TOTAL</small>
            </div>
            <div>
              <Star />
              <strong>+{result.earned}</strong>
              <small>XP CONQUISTADO</small>
            </div>
          </div>
          {!result.won && (
            <p className="result-note">
              {result.answered} perguntas respondidas. {chapterLevels[result.level - 1].hint}
            </p>
          )}
          {result.won && (
            <div className="reward-earned">
              <PixelItem kind={chapterLevels[result.level - 1].icon} />
              <div>
                <small>{result.earned ? 'ITEM CONQUISTADO' : 'ITEM JÁ COLECIONADO'}</small>
                <strong>{chapterLevels[result.level - 1].reward}</strong>
                <span>
                  {result.earned
                    ? `Já está no seu inventário. +${coinsForLevel(result.level)} moedas conquistadas.`
                    : 'Repetir fases melhora seu recorde; XP e itens são concedidos na primeira vitória.'}
                </span>
              </div>
            </div>
          )}
          {storageError && (
            <p role="alert">
              O navegador não permitiu salvar. Seu progresso ficará disponível apenas nesta sessão.
            </p>
          )}
          <div className="result-actions">
            {result.won && result.level < 10 ? (
              <button className="rpg-button" onClick={() => start(result.level + 1)}>
                Próxima fase <ArrowRight size={18} />
              </button>
            ) : (
              <button className="rpg-button" onClick={() => start(result.level)}>
                <RotateCcw size={17} />
                {result.won ? 'Jogar novamente' : 'Tentar novamente'}
              </button>
            )}
            <button
              className="secondary-button"
              onClick={() => {
                setSelected(Math.min(progress.completed.length + 1, 10))
                setScreen('map')
              }}
            >
              <Map size={17} />
              Voltar à trilha
            </button>
          </div>
        </main>
      ) : (
        <main className="chapter-page" id="conteudo">
          <div className="chapter-breadcrumb">
            <button onClick={() => setPanel('books')}>
              <BookOpen size={15} /> Seus livros
            </button>
            <ChevronRight size={13} />
            <span>Livro I</span>
          </div>
          <section className="chapter-heading">
            <div>
              <p className="eyebrow">
                <span /> CAPÍTULO 01 · OS PRIMEIROS NÚMEROS
              </p>
              <h1>
                Floresta das <em>Brasas</em>
                <span className="heading-spark">✦</span>
              </h1>
            </div>
            <div className="chapter-progress">
              <div>
                <span>{finishedChapter ? 'LIVRO CONCLUÍDO' : 'SUA JORNADA'}</span>
                <strong>
                  {progress.completed.length}
                  <span> / 10 fases</span>
                </strong>
              </div>
              <div className="chapter-progress-track">
                <i style={{ width: `${progress.completed.length * 10}%` }} />
              </div>
            </div>
          </section>
          <div className="chapter-columns">
            <section className="forest-card" aria-label="Trilha das dez fases">
              <div className="forest-map">
                <ForestBackdrop />
                <svg
                  className="trail-line"
                  viewBox="0 0 720 780"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d={path}
                    fill="none"
                    stroke="#324c32"
                    strokeWidth="36"
                    strokeLinejoin="round"
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke="#bba777"
                    strokeWidth="24"
                    strokeLinejoin="round"
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke="#dac99a"
                    strokeWidth="3"
                    strokeDasharray="5 12"
                  />
                </svg>
                {chapterLevels.map((item, i) => {
                  const n = i + 1
                  const done = progress.completed.includes(n)
                  const available = n <= unlocked
                  return (
                    <div
                      key={item.title}
                      className={`map-stop stop-${n} ${selected === n ? 'selected-stop' : ''} ${done ? 'completed-stop' : ''} ${!available ? 'locked-stop' : ''} ${n === 10 ? 'boss-stop' : ''}`}
                      style={{ left: `${positions[i][0]}%`, top: `${positions[i][1]}%` }}
                    >
                      {n === unlocked && !finishedChapter && (
                        <span className="you-are-here">VOCÊ ESTÁ AQUI</span>
                      )}
                      <button
                        className="level-node"
                        aria-label={`Fase ${n}: ${item.title}${done ? ', concluída' : !available ? ', bloqueada' : ''}`}
                        aria-pressed={selected === n}
                        onClick={() => {
                          setSelected(n)
                          if (window.matchMedia('(max-width: 760px)').matches)
                            missionCard.current?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                            })
                        }}
                      >
                        {done ? (
                          <Check size={25} />
                        ) : n === 10 ? (
                          <Swords size={25} />
                        ) : !available ? (
                          <LockKeyhole size={18} />
                        ) : (
                          <span>{String(n).padStart(2, '0')}</span>
                        )}
                      </button>
                      <span className="node-label">
                        {n === 10 ? 'CHEFÃO' : `FASE ${String(n).padStart(2, '0')}`}
                      </span>
                      {selected === n && <span className="selected-node-marker" />}
                    </div>
                  )
                })}
                <div className="map-chest">
                  <PixelChest />
                </div>
              </div>
            </section>
            <aside className="chapter-sidebar">
              <section
                ref={missionCard}
                className="mission-card"
                aria-label="Detalhes da fase selecionada"
              >
                <div className="mission-art">
                  {boss ? (
                    <PixelOgre />
                  ) : (
                    <>
                      <PixelTree className="mission-tree left" />
                      <PixelTree className="mission-tree right" />
                      <PixelFire className="mission-fire" />
                      <div className="mission-ground" />
                    </>
                  )}
                  <span className="mission-badge">
                    {boss
                      ? 'BATALHA FINAL'
                      : complete
                        ? 'MISSÃO CONCLUÍDA'
                        : locked
                          ? 'CAMINHO BLOQUEADO'
                          : 'SUA PRÓXIMA MISSÃO'}
                  </span>
                </div>
                <div className="mission-content">
                  <p className="eyebrow">
                    FASE {String(selected).padStart(2, '0')} <span>·</span>{' '}
                    {boss ? 'CHEFÃO' : 'FUNDAMENTOS'}
                  </p>
                  <h2>{level.title}</h2>
                  <p className="mission-topic">{level.topic}</p>
                  <p className="mission-description">{level.description}</p>
                  <div className="mission-facts">
                    <span>
                      <BookOpen size={15} />
                      {boss ? 10 : 8} questões
                    </span>
                    <span>
                      <Heart size={15} />3 vidas
                    </span>
                    <span>
                      <Clock3 size={15} />
                      {boss ? '3 minutos' : 'Sem pressa'}
                    </span>
                  </div>
                  <div className="mission-reward">
                    <PixelChest />
                    <div>
                      <small>RECOMPENSA DA MISSÃO</small>
                      <strong>
                        {boss ? 300 : 100} XP <span>+ {coinsForLevel(selected)} moedas + item</span>
                      </strong>
                    </div>
                    <Sparkles size={17} />
                  </div>
                  <button className="rpg-button" disabled={locked} onClick={() => start()}>
                    {locked ? (
                      <LockKeyhole size={17} />
                    ) : boss ? (
                      <Swords size={17} />
                    ) : (
                      <span className="play-triangle" />
                    )}
                    {locked
                      ? `Conclua a fase ${selected - 1}`
                      : complete
                        ? 'Jogar novamente'
                        : boss
                          ? 'Enfrentar Grum'
                          : 'Começar aventura'}
                    {!locked && <ArrowRight size={18} />}
                  </button>
                  <p className="mission-footnote">
                    {complete
                      ? 'Pratique com novas perguntas. Recompensa já recebida.'
                      : boss
                        ? 'Responda às 10 perguntas; 8 acertos vencem.'
                        : 'Novas perguntas a cada tentativa.'}
                  </p>
                  {progress.best[selected] && (
                    <p className="best-record">
                      Recorde: {progress.best[selected].correct} acertos ·{' '}
                      {formatTime(progress.best[selected].seconds)}
                    </p>
                  )}
                </div>
              </section>
              <section className="boss-preview">
                <div>
                  <span className="eyebrow">NO FIM DA TRILHA</span>
                  <h3>Alguém está esperando…</h3>
                  <p>
                    Grum não vai facilitar.
                    <br />
                    Prepare seu raciocínio.
                  </p>
                  <span>
                    <Shield size={12} /> CHEFÃO · FASE 10
                  </span>
                </div>
                <PixelOgre />
              </section>
              <div className="save-note">
                <Shield size={13} />
                Progresso salvo neste navegador.
              </div>
            </aside>
          </div>
        </main>
      )}
      {inventoryOpen && <Inventory progress={progress} onClose={() => setInventoryOpen(false)} />}
      {panel && (
        <div
          className="rpg-modal-backdrop"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setPanel(null)
          }}
        >
          <section
            className="rpg-modal collection-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="collection-title"
          >
            <button
              autoFocus
              className="modal-close"
              aria-label="Fechar"
              onClick={() => setPanel(null)}
            >
              <X size={20} />
            </button>
            <p className="eyebrow">SEU CANTO DA AVENTURA</p>
            <h2 id="collection-title">Biblioteca de aventuras</h2>
            <button
              className="book-card"
              onClick={() => {
                setPanel(null)
                setScreen('map')
              }}
            >
              <span className="book-cover">
                <Flame size={25} />
                <strong>I</strong>
              </span>
              <span>
                <small>LIVRO I · DISPONÍVEL</small>
                <strong>Floresta das Brasas</strong>
                <span>Soma, subtração e multiplicação</span>
                <span>{progress.completed.length}/10 fases concluídas</span>
              </span>
              <ArrowRight size={20} />
            </button>
            <p>Novos livros chegarão em futuras aventuras.</p>
          </section>
        </div>
      )}
    </div>
  )
}
