/** Fisher–Yates shuffle. Returns a new array; `random` is injectable for tests. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const current = result[i] as T
    result[i] = result[j] as T
    result[j] = current
  }
  return result
}
