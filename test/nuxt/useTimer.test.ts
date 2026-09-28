import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useTimer } from '~/composables/useTimer'

describe('useTimer', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  function setup(seconds = 120) {
    const scope = effectScope()
    const timer = scope.run(() => useTimer(seconds))!
    return { timer, scope }
  }

  it('counts down and finishes', () => {
    const { timer } = setup(3)
    timer.start()
    expect(timer.status.value).toBe('running')
    vi.advanceTimersByTime(1000)
    expect(timer.remainingSeconds.value).toBe(2)
    vi.advanceTimersByTime(2500)
    expect(timer.status.value).toBe('done')
    expect(timer.remainingMs.value).toBe(0)
    expect(timer.progress.value).toBe(0)
  })

  it('pauses and resumes without losing time', () => {
    const { timer } = setup(10)
    timer.start()
    vi.advanceTimersByTime(4000)
    timer.pause()
    expect(timer.status.value).toBe('paused')
    vi.advanceTimersByTime(60_000)
    expect(timer.remainingSeconds.value).toBe(6)
    timer.toggle()
    expect(timer.status.value).toBe('running')
    vi.advanceTimersByTime(2000)
    expect(timer.remainingSeconds.value).toBe(4)
  })

  it('resets to the full duration', () => {
    const { timer } = setup(10)
    timer.start()
    vi.advanceTimersByTime(5000)
    timer.reset()
    expect(timer.status.value).toBe('idle')
    expect(timer.progress.value).toBe(1)
  })

  it('stops ticking when its scope is disposed', () => {
    const { timer, scope } = setup(10)
    timer.start()
    scope.stop()
    vi.advanceTimersByTime(20_000)
    expect(timer.status.value).toBe('running')
  })
})
