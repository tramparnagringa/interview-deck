export type TimerStatus = 'idle' | 'running' | 'paused' | 'done'

export const DEFAULT_ANSWER_SECONDS = 120
const TICK_MS = 250

/** Countdown driven by wall-clock time (robust to throttled intervals in background tabs). */
export function useTimer(durationSeconds = DEFAULT_ANSWER_SECONDS) {
  const durationMs = durationSeconds * 1000
  const status = ref<TimerStatus>('idle')
  const remainingMs = ref(durationMs)

  let endsAt = 0
  let interval: ReturnType<typeof setInterval> | undefined

  function clear() {
    if (interval) clearInterval(interval)
    interval = undefined
  }

  function tick() {
    remainingMs.value = Math.max(0, endsAt - Date.now())
    if (remainingMs.value === 0) {
      clear()
      status.value = 'done'
    }
  }

  function run() {
    endsAt = Date.now() + remainingMs.value
    status.value = 'running'
    clear()
    interval = setInterval(tick, TICK_MS)
  }

  function start() {
    remainingMs.value = durationMs
    run()
  }

  function pause() {
    if (status.value !== 'running') return
    tick()
    clear()
    if (status.value === 'running') status.value = 'paused'
  }

  function resume() {
    if (status.value === 'paused') run()
  }

  function toggle() {
    if (status.value === 'running') pause()
    else if (status.value === 'paused') resume()
    else if (status.value === 'idle') start()
  }

  function reset() {
    clear()
    remainingMs.value = durationMs
    status.value = 'idle'
  }

  onScopeDispose(clear)

  return {
    status: readonly(status),
    remainingMs: readonly(remainingMs),
    remainingSeconds: computed(() => Math.ceil(remainingMs.value / 1000)),
    /** Fraction of time left, from 1 to 0. */
    progress: computed(() => remainingMs.value / durationMs),
    start,
    pause,
    resume,
    toggle,
    reset,
  }
}
