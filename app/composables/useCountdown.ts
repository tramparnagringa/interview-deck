export const COUNTDOWN_SECONDS = 3

/** "3, 2, 1" before the answer timer starts. `done` runs when it reaches zero, not when cancelled. */
export function useCountdown(seconds = COUNTDOWN_SECONDS) {
  const remaining = ref(seconds)
  const active = ref(false)
  let interval: ReturnType<typeof setInterval> | undefined

  function clear() {
    if (interval) clearInterval(interval)
    interval = undefined
  }

  function start(done: () => void) {
    clear()
    remaining.value = seconds
    active.value = true
    interval = setInterval(() => {
      remaining.value -= 1
      if (remaining.value > 0) return
      clear()
      active.value = false
      done()
    }, 1000)
  }

  function cancel() {
    clear()
    active.value = false
  }

  onScopeDispose(clear)

  return { remaining: readonly(remaining), active: readonly(active), start, cancel }
}
