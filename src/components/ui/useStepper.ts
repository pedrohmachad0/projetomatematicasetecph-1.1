import { useEffect, useRef, useState } from 'react'

/**
 * Revela passos um a um (animação "casa por casa"). `key` identifica a
 * situação atual: quando ela muda, a contagem volta a zero sozinha.
 */
export function useStepper(key: string, total: number, interval = 320) {
  const [state, setState] = useState({ key, shown: 0, running: false })
  const timer = useRef<number | undefined>(undefined)
  const current = state.key === key
  const shown = current ? Math.min(state.shown, total) : 0
  const running = current && state.running && shown < total

  useEffect(() => () => window.clearInterval(timer.current), [])

  function stop() {
    window.clearInterval(timer.current)
    timer.current = undefined
  }

  function play(reduceMotion = false) {
    stop()
    if (reduceMotion || total === 0) {
      setState({ key, shown: total, running: false })
      return
    }
    setState({ key, shown: 0, running: true })
    let count = 0
    timer.current = window.setInterval(() => {
      count++
      const finished = count >= total
      setState({ key, shown: count, running: !finished })
      if (finished) stop()
    }, interval)
  }

  function showAll() {
    stop()
    setState({ key, shown: total, running: false })
  }

  function step() {
    stop()
    setState({ key, shown: Math.min(total, shown + 1), running: false })
  }

  return { shown, running, play, showAll, step, done: shown >= total }
}
