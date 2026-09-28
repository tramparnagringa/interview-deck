import { describe, expect, it } from 'vitest'
import {
  FREE_FEEDBACK_INTERVAL_MS,
  hasFreeFeedbackCredit,
  nextFreeFeedbackAt,
  shouldShowLocked,
  type FeedbackEventLike,
} from '../../shared/utils/credits'

const now = new Date('2026-09-28T12:00:00Z')
const ago = (ms: number) => new Date(now.getTime() - ms)
const DAY = 24 * 60 * 60 * 1000

describe('hasFreeFeedbackCredit', () => {
  it('gives the first feedback for free', () => {
    expect(hasFreeFeedbackCredit([], now)).toBe(true)
  })

  it('ignores locked events', () => {
    const events: FeedbackEventLike[] = [{ kind: 'locked', createdAt: ago(DAY) }]
    expect(hasFreeFeedbackCredit(events, now)).toBe(true)
  })

  it('blocks a second feedback within the same week', () => {
    const events: FeedbackEventLike[] = [{ kind: 'full', createdAt: ago(6 * DAY) }]
    expect(hasFreeFeedbackCredit(events, now)).toBe(false)
  })

  it('gives one feedback per week after the first', () => {
    const events: FeedbackEventLike[] = [
      { kind: 'full', createdAt: ago(20 * DAY) },
      { kind: 'full', createdAt: ago(FREE_FEEDBACK_INTERVAL_MS) },
    ]
    expect(hasFreeFeedbackCredit(events, now)).toBe(true)
  })

  it('uses the most recent full feedback regardless of order', () => {
    const events: FeedbackEventLike[] = [
      { kind: 'full', createdAt: ago(DAY) },
      { kind: 'full', createdAt: ago(30 * DAY) },
    ]
    expect(hasFreeFeedbackCredit(events, now)).toBe(false)
    expect(nextFreeFeedbackAt(events)).toEqual(new Date(ago(DAY).getTime() + FREE_FEEDBACK_INTERVAL_MS))
  })
})

describe('shouldShowLocked', () => {
  it('shows the locked feedback at most once every 3 answered cards', () => {
    const shown: number[] = []
    let sinceLock = 0
    for (let card = 1; card <= 9; card++) {
      if (shouldShowLocked(sinceLock)) {
        shown.push(card)
        sinceLock = 0
      }
      else {
        sinceLock += 1
      }
    }
    expect(shown).toEqual([3, 6, 9])
  })
})
