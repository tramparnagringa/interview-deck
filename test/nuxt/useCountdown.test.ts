import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useCountdown } from '~/composables/useCountdown'

describe('useCountdown', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  const setup = () => effectScope().run(() => useCountdown(3))!

  it('counts 3, 2, 1 and then calls done', () => {
    const countdown = setup()
    const done = vi.fn()
    countdown.start(done)
    expect(countdown.active.value).toBe(true)
    expect(countdown.remaining.value).toBe(3)
    vi.advanceTimersByTime(1000)
    expect(countdown.remaining.value).toBe(2)
    vi.advanceTimersByTime(2000)
    expect(countdown.active.value).toBe(false)
    expect(done).toHaveBeenCalledOnce()
  })

  it('does not call done when cancelled', () => {
    const countdown = setup()
    const done = vi.fn()
    countdown.start(done)
    vi.advanceTimersByTime(1500)
    countdown.cancel()
    vi.advanceTimersByTime(5000)
    expect(countdown.active.value).toBe(false)
    expect(done).not.toHaveBeenCalled()
  })
})
