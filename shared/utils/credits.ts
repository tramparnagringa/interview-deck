/**
 * Free-plan AI feedback rules (PRD 6.3). Pure functions so the rule is easy to test and change.
 *
 * - The first answered card gets feedback.
 * - After that, one feedback per week.
 * - Without credit, the locked (blurred) feedback is shown at most once every 3 answered cards.
 */

export const FREE_FEEDBACK_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000
export const LOCKED_EVERY_N_CARDS = 3

export interface FeedbackEventLike {
  kind: 'full' | 'locked'
  createdAt: Date
}

export function lastFullFeedback(events: readonly FeedbackEventLike[]): Date | null {
  let last: Date | null = null
  for (const event of events) {
    if (event.kind === 'full' && (!last || event.createdAt > last)) last = event.createdAt
  }
  return last
}

export function hasFreeFeedbackCredit(events: readonly FeedbackEventLike[], now: Date): boolean {
  const last = lastFullFeedback(events)
  if (!last) return true
  return now.getTime() - last.getTime() >= FREE_FEEDBACK_INTERVAL_MS
}

/**
 * `answeredSinceLastLock` counts answers finished (without feedback) since the locked screen
 * was last shown, not counting the current one.
 */
export function shouldShowLocked(answeredSinceLastLock: number): boolean {
  return answeredSinceLastLock >= LOCKED_EVERY_N_CARDS - 1
}

export function nextFreeFeedbackAt(events: readonly FeedbackEventLike[]): Date | null {
  const last = lastFullFeedback(events)
  return last ? new Date(last.getTime() + FREE_FEEDBACK_INTERVAL_MS) : null
}
