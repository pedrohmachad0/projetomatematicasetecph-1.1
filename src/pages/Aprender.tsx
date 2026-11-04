import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Coins,
  Compass,
  Flame,
  LockOpen,
  Heart,
  LockKeyhole,
  Map,
  Maximize2,
  Menu,
  Minimize2,
  Moon,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Sun,
  Swords,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react'
import { emptyProgress, type ChapterProgress } from '../data/chapter'
import { questBooks, guardianQuestions, type QuestBook } from '../data/questBooks'
import { type PowerUpId } from '../data/quest'
import { getContent } from '../data/mathContent'
import { formatTime, readChapterProgress, recordVictory } from '../logic/chapter'
import { topicBattle } from '../logic/questTopics'
import { MISSION_COINS, writeExplore } from '../logic/questMap'
import ChapterBattle, { type BattleConfig, type BattleResult } from '../components/learn/ChapterBattle'
import Inventory, { chapterCoins, coinsForLevel } from '../components/learn/Inventory'
import BlitzChallenge, { type BlitzResult } from '../components/learn/BlitzChallenge'
import QuestMap from '../components/learn/QuestMap'
import PixelCreature from '../components/learn/PixelCreature'
import { AchievementToast, AchievementsPanel, ShopPanel } from '../components/learn/QuestPanels'
import {
  applyBattleStats,
  battleScore,
  applyBlitzStats,
  availableCoins,
  buyPowerUp,
  consumePowerUp,
  readStats,
  starsFor,
  totalStars,
  unlockAchievements,
  writeStats,
  type QuestStats,
} from '../logic/quest'
import { playSound } from '../logic/sound'
import { music } from '../logic/music'
import { readSettings, writeSettings, type GameSettings } from '../logic/settings'
import { HowToPlay, PauseMenu, SettingsPanel, TitleScreen } from '../components/learn/GameMenus'
import { ForestBackdrop, PixelChest, PixelFire, PixelOgre, PixelTree, PixelItem } from '../components/learn/PixelArt'
import { type ThemeContext } from '../components/Layout'
import SchoolCredit from '../components/SchoolCredit'
import '../styles/chapter.css'

const BOOK_STORAGE = 'matematica-rpg-current-book-v1'
const TEACHER_STORAGE = 'matematica-rpg-teacher-v1'

/** Posições (em %) das paradas na trilha, para livros de 10 e de 6 fases. */
const trailPositions: Record<number, number[][]> = {
  10: [
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
  ],
  6: [
    [44, 11],
    [57, 27],
    [41, 43],
    [56, 59],
    [42, 75],
    [52, 91],
  ],
}
const trailPath = (positions: number[][]) => positions.map(([x, y], i) => `${i ? 'L' : 'M'} ${x * 7.2} ${y * 7.8}`).join(' ')

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'on'
  } catch {
    return false
  }
}

function writeValue(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // A preferência vale só nesta sessão.
  }
}

function readAllProgress(): Record<string, ChapterProgress> {
  return Object.fromEntries(questBooks.map((book) => [book.id, readChapterProgress(book.storage, book.phases.length)]))
}

function readCurrentBook(): string {
  try {
    const id = localStorage.getItem(BOOK_STORAGE)
    return questBooks.some((book) => book.id === id) ? id! : questBooks[0].id
  } catch {
    return questBooks[0].id
  }
}

const bookDone = (book: QuestBook, progress: ChapterProgress) => progress.completed.includes(book.phases.length)
const titleCase = (name: string) => `${name.charAt(0)}${name.slice(1).toLowerCase()}`

type Screen = 'title' | 'map' | 'explore' | 'battle' | 'result' | 'blitz' | 'blitz-result'

/** Chaves salvas pela aventura, apagadas ao começar um novo jogo. */
const SAVE_KEYS = ['matematica-rpg-stats-v1', 'matematica-rpg-explore-v1', 'matematica-rpg-equipment-v1', BOOK_STORAGE]

export default function Aprender() {
  const { isDark, toggleTheme } = useOutletContext<ThemeContext>()
  const [progresses, setProgresses] = useState(readAllProgress)
  const [bookId, setBookId] = useState(readCurrentBook)
  const [teacher, setTeacher] = useState(() => readFlag(TEACHER_STORAGE))
  const book = questBooks.find((item) => item.id === bookId) ?? questBooks[0]
  const bookIndex = questBooks.indexOf(book)
  const progress = progresses[book.id] ?? emptyProgress()
  const total = book.phases.length
  const [selected, setSelected] = useState(() => Math.min(progress.completed.length + 1, total))
  const [screen, setScreen] = useState<Screen>('title')
  const [menu, setMenu] = useState<'pause' | 'settings' | 'howto' | null>(null)
  const [settings, setSettings] = useState<GameSettings>(readSettings)
  const [journalRequest, setJournalRequest] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const appRef = useRef<HTMLDivElement>(null)
  const [panel, setPanel] = useState<'books' | 'shop' | 'achievements' | null>(null)
  const booksDoneCount = questBooks.filter((item) => bookDone(item, progresses[item.id] ?? emptyProgress())).length
  // Conquistas de progresso antigo são reconhecidas em silêncio ao abrir a página.
  const [stats, setStats] = useState<QuestStats>(() => {
    const all = readAllProgress()
    return unlockAchievements(all[questBooks[0].id], readStats(), questBooks.filter((item) => bookDone(item, all[item.id])).length).stats
  })
  const [toast, setToast] = useState<string[]>([])
  const [blitzResult, setBlitzResult] = useState<(BlitzResult & { coins: number; record: boolean }) | null>(null)
  const [inventoryOpen, setInventoryOpen] = useState(false)
  const [result, setResult] = useState<(BattleResult & { earned: number; bonus: number }) | null>(null)
  const [battleConfig, setBattleConfig] = useState<BattleConfig | undefined>(undefined)
  const [attempt, setAttempt] = useState(0)
  const [storageError, setStorageError] = useState(false)
  const missionCard = useRef<HTMLElement>(null)

  const bookUnlocked = (index: number) => teacher || index === 0 || bookDone(questBooks[index - 1], progresses[questBooks[index - 1].id] ?? emptyProgress())
  const unlocked = teacher ? total : Math.min(progress.completed.length + 1, total)
  const phase = book.phases[selected - 1]
  const complete = progress.completed.includes(selected)
  const locked = selected > unlocked
  const boss = selected === total
  const finishedBook = bookDone(book, progress)
  const positions = trailPositions[total] ?? trailPositions[10]
  const path = trailPath(positions)
  const livro1 = progresses[questBooks[0].id] ?? emptyProgress()
  const totalXp = questBooks.reduce((sum, item) => sum + (progresses[item.id]?.xp ?? 0), 0)
  const xpLevel = Math.floor(totalXp / 300) + 1
  const earnedCoins = questBooks.reduce((sum, item) => sum + chapterCoins(progresses[item.id] ?? emptyProgress(), item.phases.length), 0)
  const coins = availableCoins(earnedCoins, stats)
  const stars = totalStars(progress, total)
  const clearToast = useCallback(() => setToast([]), [])
  const finalGuardian = book.phases[total - 1].guardian

  function saveStats(next: QuestStats, nextProgresses = progresses) {
    const done = questBooks.filter((item) => bookDone(item, nextProgresses[item.id] ?? emptyProgress())).length
    const { stats: withAchievements, fresh } = unlockAchievements(nextProgresses[questBooks[0].id] ?? emptyProgress(), next, done)
    setStats(withAchievements)
    if (!writeStats(withAchievements)) setStorageError(true)
    if (fresh.length) {
      setToast(fresh)
      playSound('coin', soundOn)
    }
  }

  const soundOn = settings.sfx
  /** Telas de jogo: ocupam a tela toda, sem rolagem nem gestos do navegador. */
  const inGame = screen === 'explore' || screen === 'battle' || screen === 'blitz' || screen === 'title'

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('game-locked', inGame)
    // Bloqueia o zoom por pinça do Safari (gesturestart) enquanto se joga.
    const blockGesture = (event: Event) => event.preventDefault()
    if (inGame) document.addEventListener('gesturestart', blockGesture)
    return () => {
      root.classList.remove('game-locked')
      document.removeEventListener('gesturestart', blockGesture)
    }
  }, [inGame])
  const heroName = settings.playerName || 'Aventureiro'
  const hasSave = totalXp > 0 || stats.unlocked.length > 0 || questBooks.some((item) => (progresses[item.id]?.completed.length ?? 0) > 0)

  function updateSettings(next: GameSettings) {
    setSettings(next)
    writeSettings(next)
  }

  function toggleSound() {
    updateSettings({ ...settings, sfx: !settings.sfx, music: !settings.sfx })
  }

  // Trilha sonora de cada tela.
  useEffect(() => {
    music.configure(settings.music, settings.volume)
    const track = screen === 'title' ? 'title' : screen === 'battle' ? (selected === total ? 'boss' : 'battle') : screen === 'blitz' ? 'battle' : 'map'
    music.play(track)
  }, [screen, settings.music, settings.volume, selected, total])
  useEffect(() => () => music.stop(), [])

  // Esc ou P abre a pausa fora das batalhas.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select')) return
      const key = event.key.toLowerCase()
      if ((key === 'escape' || key === 'p') && !menu && !panel && !inventoryOpen && (screen === 'map' || screen === 'explore' || screen === 'result' || screen === 'blitz-result')) {
        if (document.querySelector('.rpg-modal-backdrop, .game-overlay, .dialogue-layer')) return
        event.preventDefault()
        setMenu('pause')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen?.()
    else void appRef.current?.requestFullscreen?.().catch(() => setFullscreen(false))
  }

  function newGame(name: string) {
    try {
      for (const key of [...SAVE_KEYS, ...questBooks.map((item) => item.storage)]) localStorage.removeItem(key)
    } catch {
      setStorageError(true)
    }
    const fresh = readAllProgress()
    setProgresses(fresh)
    setStats(readStats())
    setBookId(questBooks[0].id)
    setSelected(1)
    updateSettings({ ...settings, playerName: name })
    setScreen('map')
    music.resume()
  }

  function toggleTeacher() {
    setTeacher((current) => {
      writeValue(TEACHER_STORAGE, current ? 'off' : 'on')
      return !current
    })
  }

  function openBook(next: QuestBook) {
    const nextProgress = progresses[next.id] ?? emptyProgress()
    setBookId(next.id)
    writeValue(BOOK_STORAGE, next.id)
    setSelected(Math.min(nextProgress.completed.length + 1, next.phases.length))
    setPanel(null)
    setScreen('map')
  }

  function spendPowerUp(id: PowerUpId) {
    const next = consumePowerUp(stats, id)
    if (!next) return false
    saveStats(next)
    return true
  }

  function buy(id: PowerUpId) {
    const next = buyPowerUp(stats, id, earnedCoins)
    if (!next) return
    playSound('coin', soundOn)
    saveStats(next)
  }

  function addCoins(amount: number) {
    saveStats({ ...stats, bonusCoins: stats.bonusCoins + amount, chests: stats.chests + (amount === MISSION_COINS.chest ? 1 : 0) })
  }

  function toTop() {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function startBlitz() {
    setScreen('blitz')
    setAttempt((a) => a + 1)
    toTop()
  }

  function finishBlitz(blitz: BlitzResult) {
    const update = applyBlitzStats(stats, blitz.score)
    saveStats(update.stats)
    setBlitzResult({ ...blitz, coins: update.coins, record: update.record })
    setScreen('blitz-result')
    toTop()
  }

  function explore(n = selected) {
    if (n > unlocked) return
    setSelected(n)
    setScreen('explore')
    toTop()
  }

  /** Batalha contra o guardião. No Livro I usa as perguntas originais de cada fase. */
  function battle(n = selected) {
    if (n > unlocked) return
    const target = book.phases[n - 1]
    setSelected(n)
    setBattleConfig(
      bookIndex === 0
        ? undefined
        : {
            title: target.title,
            bookLabel: `LIVRO ${book.roman}`,
            boss: n === total,
            enemy: target.guardian,
            questions: topicBattle(target.topics, guardianQuestions(book, n)),
            more: () => topicBattle(target.topics, 10),
          },
    )
    setAttempt((a) => a + 1)
    setScreen('battle')
    toTop()
  }

  function finish(outcome: BattleResult) {
    let earned = 0
    let nextProgresses = progresses
    if (outcome.won) {
      const update = recordVictory(progress, outcome.level, battleScore(outcome.level, outcome.mistakes, total), outcome.seconds, total)
      earned = update.earned
      nextProgresses = { ...progresses, [book.id]: update.progress }
      setProgresses(nextProgresses)
      writeExplore(`${book.id}-${outcome.level}`, null)
      try {
        localStorage.setItem(book.storage, JSON.stringify(update.progress))
        setStorageError(false)
      } catch {
        setStorageError(true)
      }
    }
    // Os recordes do chefão usam a regra de 10 perguntas, qualquer que seja o livro.
    const statsLevel: number = outcome.level === total ? 10 : Math.min(outcome.level, 9)
    const battleStats = applyBattleStats(stats, { ...outcome, level: statsLevel })
    saveStats(battleStats.stats, nextProgresses)
    setResult({ ...outcome, earned, bonus: battleStats.bonus })
    setScreen('result')
    toTop()
  }

  const resultPhase = result ? book.phases[result.level - 1] : null
  const resultBoss = result ? result.level === total : false
  const resultStars = result ? starsFor(result.level, battleScore(result.level, result.mistakes, total), total) : 0
  const resultGuardianName = resultPhase ? (resultPhase.guardian ? titleCase(resultPhase.guardian.name) : 'Grum') : ''

  return (
    <div ref={appRef} className={`rpg-app tab-slide-in book-${book.theme} ${screen === 'title' ? 'on-title' : ''} ${fullscreen ? 'is-fullscreen' : ''}`}>
      {(screen === 'map' || screen === 'result' || screen === 'blitz-result') && (
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
          <button type="button" className="rpg-theme-button" onClick={toggleTheme} aria-pressed={isDark} aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            <span>{isDark ? 'Tema claro' : 'Tema escuro'}</span>
          </button>
          <button type="button" className="rpg-icon-button" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? 'Desligar sons' : 'Ligar sons'} title={soundOn ? 'Desligar sons' : 'Ligar sons'}>
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button type="button" className="rpg-icon-button" onClick={() => setPanel('achievements')} aria-label={`Conquistas: ${stats.unlocked.length} desbloqueadas`} title="Conquistas">
            <Trophy size={16} />
            <span>{stats.unlocked.length}</span>
          </button>
          <button type="button" className="coin-counter" onClick={() => setPanel('shop')} aria-label={`${coins} moedas. Abrir loja`} title="Loja">
            <Coins size={16} />
            {coins}
          </button>
          <span className="xp-counter">
            <Star size={16} fill="currentColor" />
            {totalXp} XP
          </span>
          <button type="button" className="rpg-icon-button" onClick={toggleFullscreen} aria-pressed={fullscreen} aria-label={fullscreen ? 'Sair da tela cheia' : 'Jogar em tela cheia'} title="Tela cheia">
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button type="button" className="rpg-icon-button" onClick={() => setMenu('pause')} aria-label="Menu do jogo (Esc)" title="Menu (Esc)">
            <Menu size={16} />
          </button>
          <button type="button" className="player-avatar" aria-label={`Abrir inventário de ${heroName}`} onClick={() => setInventoryOpen(true)}>
            {heroName.charAt(0).toUpperCase()}
            <span>{xpLevel}</span>
          </button>
        </div>
      </header>
      )}
      <div key={screen} className={`screen-transition ${screen === 'battle' ? 'battle-enter' : ''} ${inGame ? 'game-stage' : ''} ${screen === 'explore' ? 'stage-explore' : ''}`} onContextMenu={inGame ? (event) => event.preventDefault() : undefined}>
      {screen === 'title' ? (
        <TitleScreen
          hasSave={hasSave}
          playerName={settings.playerName}
          summary={`${totalXp} XP · ${booksDoneCount} de ${questBooks.length} livros`}
          onContinue={() => {
            setScreen('map')
            music.resume()
          }}
          onNewGame={newGame}
          onSettings={() => setMenu('settings')}
          onHowTo={() => setMenu('howto')}
        />
      ) : screen === 'explore' ? (
        <QuestMap
          key={`${book.id}-${selected}`}
          book={book}
          bookIndex={bookIndex}
          phaseNumber={selected}
          phase={phase}
          soundOn={soundOn}
          replay={complete}
          onExit={() => setScreen('map')}
          onGuardian={() => battle(selected)}
          onCoins={addCoins}
          heroName={heroName}
          textSpeed={settings.textSpeed}
          onPause={() => setMenu('pause')}
          journalRequest={journalRequest}
          paused={menu !== null}
          noTimer={settings.noTimer}
          bigText={settings.bigText}
        />
      ) : screen === 'battle' ? (
        <ChapterBattle key={attempt} level={selected} config={battleConfig} heroName={heroName} onExit={() => setScreen(complete ? 'map' : 'explore')} onFinish={finish} items={stats.items} onUsePowerUp={spendPowerUp} soundOn={soundOn} noTimer={settings.noTimer} bigText={settings.bigText} />
      ) : screen === 'blitz' ? (
        <BlitzChallenge key={attempt} unlocked={Math.min(livro1.completed.length + 1, 10)} best={stats.blitzBest} soundOn={soundOn} onExit={() => setScreen('map')} onFinish={finishBlitz} />
      ) : screen === 'blitz-result' && blitzResult ? (
        <main className="result-page" id="conteudo">
          <p className="eyebrow">DESAFIO RELÂMPAGO</p>
          <div className="result-art won blitz-art">
            <Zap size={72} />
          </div>
          <p className="eyebrow">{blitzResult.record ? 'NOVO RECORDE!' : `SEU RECORDE: ${stats.blitzBest}`}</p>
          <h1>
            {blitzResult.score} {blitzResult.score === 1 ? 'ponto' : 'pontos'}!
          </h1>
          <p>{blitzResult.score >= 15 ? 'Velocidade de raio! Seu cálculo mental está afiado.' : blitzResult.score >= 8 ? 'Muito bom! Tente bater seu recorde.' : 'Cada rodada deixa seu cálculo mais rápido. Jogue de novo!'}</p>
          <div className="result-stats">
            <div>
              <Check />
              <strong>
                {blitzResult.score}/{blitzResult.answered}
              </strong>
              <small>ACERTOS</small>
            </div>
            <div>
              <Flame />
              <strong>x{blitzResult.maxCombo}</strong>
              <small>MAIOR COMBO</small>
            </div>
            <div>
              <Coins />
              <strong>+{blitzResult.coins}</strong>
              <small>MOEDAS</small>
            </div>
          </div>
          <div className="result-actions">
            <button className="rpg-button" onClick={startBlitz}>
              <RotateCcw size={17} /> Jogar de novo
            </button>
            <button className="secondary-button" onClick={() => setScreen('map')}>
              <Map size={17} /> Voltar à trilha
            </button>
          </div>
        </main>
      ) : screen === 'result' && result && resultPhase ? (
        <main className="result-page" id="conteudo">
          <p className="eyebrow">
            LIVRO {book.roman} · FASE {String(result.level).padStart(2, '0')}
          </p>
          <div className={`result-art ${result.won ? 'won' : ''}`}>
            {resultBoss && !resultPhase.guardian ? (
              <PixelOgre mood={result.won ? 'defeated' : 'laugh'} />
            ) : resultBoss && resultPhase.guardian ? (
              <PixelCreature kind={resultPhase.guardian.kind} color={resultPhase.guardian.color} name={resultPhase.guardian.name} mood={result.won ? 'defeated' : 'laugh'} />
            ) : result.won ? (
              <PixelChest />
            ) : (
              <PixelFire />
            )}
          </div>
          <p className="eyebrow">{result.won ? (resultBoss ? 'O LIVRO FOI CONCLUÍDO' : 'MAIS UM PASSO NA SUA HISTÓRIA') : 'SUA AVENTURA AINDA NÃO ACABOU'}</p>
          <h1>{result.won ? (resultBoss ? `${resultGuardianName} foi derrotado!` : 'Fase concluída!') : result.reason === 'time' ? 'O tempo acabou!' : 'Suas vidas acabaram'}</h1>
          <p>
            {result.won
              ? resultBoss
                ? `Você concluiu o Livro ${book.roman} e conquistou a ${resultPhase.reward}.${bookIndex < questBooks.length - 1 ? ` O Livro ${questBooks[bookIndex + 1].roman} foi liberado!` : ' Você completou toda a aventura!'}`
                : 'O próximo trecho da jornada espera por você.'
              : 'Respire, revise a dica e tente outra vez. Cada tentativa traz novos desafios.'}
          </p>
          {result.won && (
            <div className="result-stars" aria-label={`${resultStars} de 3 estrelas`}>
              {[1, 2, 3].map((n) => (
                <Star key={n} size={40} fill={n <= resultStars ? 'currentColor' : 'none'} className={n <= resultStars ? 'earned-star' : 'missing-star'} style={{ animationDelay: `${n * 0.18}s` }} />
              ))}
            </div>
          )}
          <div className="result-stats">
            <div>
              <Flame />
              <strong>x{result.maxCombo}</strong>
              <small>MAIOR COMBO</small>
            </div>
            <div>
              <Check />
              <strong>
                {result.correct}/{result.answered}
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
              {result.answered} perguntas respondidas. {resultPhase.hint}
            </p>
          )}
          {result.won && (
            <div className="reward-earned">
              <PixelItem kind={resultPhase.icon} />
              <div>
                <small>{result.earned ? (bookIndex === 0 ? 'ITEM CONQUISTADO' : 'RELÍQUIA CONQUISTADA') : 'JÁ COLECIONADO'}</small>
                <strong>{resultPhase.reward}</strong>
                <span>
                  {result.earned
                    ? `${bookIndex === 0 ? 'Já está no seu inventário.' : 'Guardada na sua coleção.'} +${coinsForLevel(result.level, total)} moedas conquistadas.`
                    : 'Repetir fases melhora seu recorde e suas estrelas; XP e recompensas vêm na primeira vitória.'}
                  {result.bonus > 0 && ` Bônus de combo: +${result.bonus} moedas.`}
                </span>
              </div>
            </div>
          )}
          {storageError && <p role="alert">O navegador não permitiu salvar. Seu progresso ficará disponível apenas nesta sessão.</p>}
          <div className="result-actions">
            {result.won && result.level < total ? (
              <button className="rpg-button" onClick={() => explore(result.level + 1)}>
                Próxima fase <ArrowRight size={18} />
              </button>
            ) : result.won && resultBoss && bookIndex < questBooks.length - 1 ? (
              <button className="rpg-button" onClick={() => openBook(questBooks[bookIndex + 1])}>
                Abrir o Livro {questBooks[bookIndex + 1].roman} <ArrowRight size={18} />
              </button>
            ) : (
              <button className="rpg-button" onClick={() => battle(result.level)}>
                <RotateCcw size={17} />
                {result.won ? 'Jogar novamente' : 'Tentar novamente'}
              </button>
            )}
            <button
              className="secondary-button"
              onClick={() => {
                setSelected(Math.min((progresses[book.id]?.completed.length ?? 0) + 1, total))
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
            <span>Livro {book.roman}</span>
          </div>
          <section className="chapter-heading">
            <div>
              <p className="eyebrow">
                <span /> {book.chapter}
              </p>
              <h1>
                {book.title} <em>{book.accent}</em>
                <span className="heading-spark">✦</span>
              </h1>
            </div>
            <div className="chapter-progress">
              <div>
                <span>{finishedBook ? 'LIVRO CONCLUÍDO' : 'SUA JORNADA'}</span>
                <strong>
                  {progress.completed.length}
                  <span> / {total} fases</span>
                </strong>
              </div>
              <div className="chapter-progress-track">
                <i style={{ width: `${(progress.completed.length / total) * 100}%` }} />
              </div>
            </div>
          </section>
          <div className="chapter-columns">
            <section className={`forest-card trail-${book.theme}`} aria-label={`Trilha das ${total} fases`}>
              <div className="forest-map">
                <div className="trail-backdrop">
                  <ForestBackdrop />
                </div>
                <svg className="trail-line" viewBox="0 0 720 780" preserveAspectRatio="none" aria-hidden="true">
                  <path d={path} fill="none" stroke="#324c32" strokeWidth="36" strokeLinejoin="round" />
                  <path d={path} fill="none" stroke="#bba777" strokeWidth="24" strokeLinejoin="round" />
                  <path d={path} fill="none" stroke="#dac99a" strokeWidth="3" strokeDasharray="5 12" />
                </svg>
                {book.phases.map((item, i) => {
                  const n = i + 1
                  const done = progress.completed.includes(n)
                  const available = n <= unlocked
                  return (
                    <div
                      key={item.title}
                      className={`map-stop stop-${n} ${selected === n ? 'selected-stop' : ''} ${done ? 'completed-stop' : ''} ${!available ? 'locked-stop' : ''} ${n === total ? 'boss-stop' : ''}`}
                      style={{ left: `${positions[i][0]}%`, top: `${positions[i][1]}%` }}
                    >
                      {n === unlocked && !finishedBook && !teacher && <span className="you-are-here">VOCÊ ESTÁ AQUI</span>}
                      <button
                        className="level-node"
                        aria-label={`Fase ${n}: ${item.title}${done ? ', concluída' : !available ? ', bloqueada' : ''}`}
                        aria-pressed={selected === n}
                        onClick={() => {
                          setSelected(n)
                          if (window.matchMedia('(max-width: 760px)').matches) missionCard.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }}
                      >
                        {done ? <Check size={25} /> : n === total ? <Swords size={25} /> : !available ? <LockKeyhole size={18} /> : <span>{String(n).padStart(2, '0')}</span>}
                      </button>
                      <span className="node-label">{n === total ? 'CHEFÃO' : `FASE ${String(n).padStart(2, '0')}`}</span>
                      {done && (
                        <span className="node-stars" aria-hidden="true">
                          {[1, 2, 3].map((k) => (
                            <Star key={k} size={10} fill={k <= starsFor(n, progress.best[n]?.correct ?? 0, total) ? 'currentColor' : 'none'} />
                          ))}
                        </span>
                      )}
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
              <section ref={missionCard} className="mission-card" aria-label="Detalhes da fase selecionada">
                <div className="mission-art">
                  {phase.guardian ? (
                    <div className="mission-guardian">
                      <PixelCreature kind={phase.guardian.kind} color={phase.guardian.color} name={phase.guardian.name} />
                    </div>
                  ) : boss ? (
                    <PixelOgre />
                  ) : (
                    <>
                      <PixelTree className="mission-tree left" />
                      <PixelTree className="mission-tree right" />
                      <PixelFire className="mission-fire" />
                      <div className="mission-ground" />
                    </>
                  )}
                  <span className="mission-badge">{boss ? 'BATALHA FINAL' : complete ? 'MISSÃO CONCLUÍDA' : locked ? 'CAMINHO BLOQUEADO' : 'SUA PRÓXIMA MISSÃO'}</span>
                </div>
                <div className="mission-content">
                  <p className="eyebrow">
                    FASE {String(selected).padStart(2, '0')} <span>·</span> {boss ? 'CHEFÃO' : `LIVRO ${book.roman}`}
                  </p>
                  <h2>{phase.title}</h2>
                  <p className="mission-topic">
                    {phase.topic} · Guardião: {phase.guardian ? titleCase(phase.guardian.name) : 'Grum'}
                  </p>
                  <p className="mission-description">{phase.description}</p>
                  <div className="mission-facts">
                    <span>
                      <Compass size={15} />
                      Mapa com missões
                    </span>
                    <span>
                      <Heart size={15} />
                      Batalha por turnos
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
                        {boss ? 300 : 100} XP <span>+ {coinsForLevel(selected, total)} moedas + {bookIndex === 0 ? 'item' : 'relíquia'}</span>
                      </strong>
                    </div>
                    <Sparkles size={17} />
                  </div>
                  <button className="rpg-button" disabled={locked} onClick={() => explore()}>
                    {locked ? <LockKeyhole size={17} /> : <Compass size={17} />}
                    {locked ? `Conclua a fase ${selected - 1}` : complete ? 'Explorar de novo' : 'Explorar a fase'}
                    {!locked && <ArrowRight size={18} />}
                  </button>
                  {complete && (
                    <button className="secondary-button mission-rematch" onClick={() => battle()}>
                      <Swords size={16} /> Revanche direta com o guardião
                    </button>
                  )}
                  {phase.simulator && (
                    <Link className="mission-simulator" to={`/${phase.simulator}`}>
                      <BookOpen size={14} /> Treinar no simulador: {getContent(phase.simulator).title}
                    </Link>
                  )}
                  {progress.best[selected] && (
                    <p className="best-record">
                      Recorde: {formatTime(progress.best[selected].seconds)} · {'★'.repeat(starsFor(selected, progress.best[selected].correct, total))}
                      {'☆'.repeat(3 - starsFor(selected, progress.best[selected].correct, total))}
                    </p>
                  )}
                </div>
              </section>
              <section className="blitz-card" aria-labelledby="blitz-title">
                <div>
                  <span className="eyebrow">MODO EXTRA · 60 SEGUNDOS</span>
                  <h3 id="blitz-title">
                    <Zap size={18} /> Desafio Relâmpago
                  </h3>
                  <p>Quantas contas você acerta em um minuto? Recorde: {stats.blitzBest}.</p>
                </div>
                <button className="rpg-button" onClick={startBlitz}>
                  Jogar <ArrowRight size={17} />
                </button>
              </section>
              <section className="quest-summary" aria-label="Resumo da jornada">
                <button type="button" onClick={() => setPanel('shop')}>
                  <Coins size={18} />
                  <strong>{coins}</strong>
                  <small>moedas · loja</small>
                </button>
                <div>
                  <Star size={18} />
                  <strong>
                    {stars}/{total * 3}
                  </strong>
                  <small>estrelas</small>
                </div>
                <button type="button" onClick={() => setPanel('achievements')}>
                  <Trophy size={18} />
                  <strong>{stats.unlocked.length}</strong>
                  <small>conquistas</small>
                </button>
              </section>
              <section className="boss-preview">
                <div>
                  <span className="eyebrow">NO FIM DA TRILHA</span>
                  <h3>Alguém está esperando…</h3>
                  <p>
                    {finalGuardian ? titleCase(finalGuardian.name) : 'Grum'} não vai facilitar.
                    <br />
                    Prepare seu raciocínio.
                  </p>
                  <span>
                    <Shield size={12} /> CHEFÃO · FASE {total}
                  </span>
                </div>
                {finalGuardian ? (
                  <div className="boss-preview-creature">
                    <PixelCreature kind={finalGuardian.kind} color={finalGuardian.color} name={finalGuardian.name} />
                  </div>
                ) : (
                  <PixelOgre />
                )}
              </section>
              <div className="save-note">
                <Shield size={13} />
                Progresso salvo neste navegador.
              </div>
            </aside>
          </div>
        </main>
      )}
      </div>
      {!inGame && <SchoolCredit className="pb-6 pt-2" />}
      {menu === 'pause' && (
        <PauseMenu
          canJournal={screen === 'explore'}
          fullscreen={fullscreen}
          onFullscreen={toggleFullscreen}
          onResume={() => setMenu(null)}
          onJournal={() => {
            setMenu(null)
            setJournalRequest((value) => value + 1)
          }}
          onSettings={() => setMenu('settings')}
          onTrail={() => {
            setMenu(null)
            setScreen('map')
          }}
        />
      )}
      {menu === 'settings' && <SettingsPanel settings={settings} onChange={updateSettings} onClose={() => setMenu(screen === 'title' ? null : 'pause')} />}
      {menu === 'howto' && <HowToPlay onClose={() => setMenu(null)} />}

      {inventoryOpen && <Inventory progress={livro1} coins={coins} onClose={() => setInventoryOpen(false)} />}
      {panel === 'shop' && <ShopPanel coins={coins} items={stats.items} onBuy={buy} onClose={() => setPanel(null)} />}
      {panel === 'achievements' && <AchievementsPanel unlocked={stats.unlocked} onClose={() => setPanel(null)} />}
      {toast.length > 0 && <AchievementToast ids={toast} onDone={clearToast} />}
      {panel === 'books' && (
        <div
          className="rpg-modal-backdrop"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setPanel(null)
          }}
        >
          <section className="rpg-modal collection-modal" role="dialog" aria-modal="true" aria-labelledby="collection-title">
            <button autoFocus className="modal-close" aria-label="Fechar" onClick={() => setPanel(null)}>
              <X size={20} />
            </button>
            <p className="eyebrow">SEU CANTO DA AVENTURA</p>
            <h2 id="collection-title">Biblioteca de aventuras</h2>
            <div className="book-list">
              {questBooks.map((item, index) => {
                const itemProgress = progresses[item.id] ?? emptyProgress()
                const open = bookUnlocked(index)
                return (
                  <button key={item.id} className={`book-card book-card-${item.theme} ${item.id === book.id ? 'current-book' : ''}`} disabled={!open} onClick={() => openBook(item)}>
                    <span className="book-cover">
                      {open ? <Flame size={25} /> : <LockKeyhole size={22} />}
                      <strong>{item.roman}</strong>
                    </span>
                    <span>
                      <small>
                        LIVRO {item.roman} · {bookDone(item, itemProgress) ? 'CONCLUÍDO' : open ? 'DISPONÍVEL' : 'BLOQUEADO'}
                      </small>
                      <strong>
                        {item.title} {item.accent}
                      </strong>
                      <span>{item.summary}</span>
                      <span>{open ? `${itemProgress.completed.length}/${item.phases.length} fases concluídas` : `Vença o chefão do Livro ${questBooks[index - 1].roman} para abrir`}</span>
                    </span>
                    {open && <ArrowRight size={20} />}
                  </button>
                )
              })}
            </div>
            <label className="teacher-toggle">
              <input type="checkbox" checked={teacher} onChange={toggleTeacher} />
              <LockOpen size={16} />
              <span>
                <strong>Liberar todas as fases</strong>
                <small>Abre todos os livros e fases para jogar em qualquer ordem.</small>
              </span>
            </label>

            <p>
              {booksDoneCount}/{questBooks.length} livros concluídos.
            </p>
          </section>
        </div>
      )}
    </div>
  )
}
