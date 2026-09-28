import type { DeckColor } from '#shared/schemas/deck'

/** Inline style that sets the deck color for a subtree (components read `--deck-accent`). */
export function deckAccentStyle(color: DeckColor | undefined) {
  return color ? { '--deck-accent': `var(--color-deck-${color})` } : undefined
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
