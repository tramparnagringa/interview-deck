import { describe, expect, it } from 'vitest'
import { resolvePlan } from '../../shared/utils/plan'

describe('resolvePlan', () => {
  it('is free without a session', () => {
    expect(resolvePlan(null, true)).toBe('free')
  })

  it('is free for anonymous users even if a member flag is passed', () => {
    expect(resolvePlan({ sub: 'u1', is_anonymous: true, email: 'a@b.co' }, true)).toBe('free')
  })

  it('is free for signed-in users who are not members', () => {
    expect(resolvePlan({ sub: 'u1', email: 'a@b.co' }, false)).toBe('free')
  })

  it('is premium for signed-in active members', () => {
    expect(resolvePlan({ sub: 'u1', email: 'a@b.co', is_anonymous: false }, true)).toBe('premium')
  })
})
