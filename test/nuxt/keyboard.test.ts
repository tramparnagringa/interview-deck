import { describe, expect, it } from 'vitest'
import { isTypingTarget } from '~/composables/useKeyboardShortcuts'
import { swipeDirection } from '~/composables/useSwipe'

describe('isTypingTarget', () => {
  it('ignores shortcuts while typing', () => {
    expect(isTypingTarget(document.createElement('input'))).toBe(true)
    expect(isTypingTarget(document.createElement('textarea'))).toBe(true)
  })

  it('handles shortcuts elsewhere', () => {
    expect(isTypingTarget(document.createElement('div'))).toBe(false)
    expect(isTypingTarget(document.body)).toBe(false)
    expect(isTypingTarget(null)).toBe(false)
  })
})

describe('swipeDirection', () => {
  it('long horizontal drags are swipes', () => {
    expect(swipeDirection(-100, 10)).toBe('left')
    expect(swipeDirection(100, -10)).toBe('right')
  })

  it('short or mostly vertical drags are not', () => {
    expect(swipeDirection(-20, 0)).toBeNull()
    expect(swipeDirection(-100, 90)).toBeNull()
  })
})
