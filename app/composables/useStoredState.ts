/**
 * `useState` that the browser remembers across visits (localStorage). The saved value is read
 * once the app is hydrated, so the static HTML and the first render stay the same; values that
 * fail `isValid` (an old or edited entry) are ignored.
 */
export function useStoredState<T>(key: string, init: () => T, isValid: (value: unknown) => value is T) {
  const state = useState<T>(key, init)
  if (import.meta.server) return state

  const storageKey = `interview-deck:${key}`
  const restored = useState(`${key}:restored`, () => false)
  if (!restored.value) {
    restored.value = true
    onNuxtReady(() => {
      try {
        const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
        if (isValid(saved)) state.value = saved
      }
      catch {
        // Storage blocked (private mode) or a broken entry: keep the default.
      }
      watch(state, (value) => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(value))
        }
        catch {
          // Storage blocked or full: the choice just won't be remembered.
        }
      })
    })
  }
  return state
}
