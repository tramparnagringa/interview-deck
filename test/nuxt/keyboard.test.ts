import { describe, expect, it } from 'vitest'
import { isTypingTarget } from '~/composables/useKeyboardShortcuts'

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
