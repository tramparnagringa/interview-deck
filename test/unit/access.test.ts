import { describe, expect, it } from 'vitest'
import { redirectFor, safeNext } from '../../app/utils/access'

const guest = { signedIn: false, premium: false }
const free = { signedIn: true, premium: false }
const premium = { signedIn: true, premium: true }

describe('access', () => {
  it('sends guests to the login, remembering where they were going', () => {
    const login = (next: string) => ({ path: '/login', query: { next } })
    expect(redirectFor('/', '/', guest)).toEqual(login('/'))
    expect(redirectFor('/play/general', '/play/general?shuffle=1', guest)).toEqual(login('/play/general?shuffle=1'))
    expect(redirectFor('/login', '/login', guest)).toBeNull()
    expect(redirectFor('/about', '/about', guest)).toBeNull()
  })

  it('takes signed-in viewers from the login to where they were going, or their home', () => {
    expect(redirectFor('/login', '/login', free)).toBe('/')
    expect(redirectFor('/login', '/login', premium)).toBe('/premium')
    expect(redirectFor('/login', '/login?next=/play/general', free, '/play/general')).toBe('/play/general')
  })

  it('keeps Premium members on the Premium pages', () => {
    expect(redirectFor('/', '/', premium)).toBe('/premium')
    expect(redirectFor('/', '/?x=1', premium)).toBe('/premium?x=1')
    expect(redirectFor('/play/general', '/play/general?shuffle=1', premium)).toBe('/premium/play/general?shuffle=1')
    expect(redirectFor('/premium/mock/general', '/premium/mock/general', premium)).toBeNull()
    expect(redirectFor('/about', '/about', premium)).toBeNull()
  })

  it('keeps Free viewers off the Premium pages', () => {
    expect(redirectFor('/premium', '/premium', free)).toBe('/')
    expect(redirectFor('/premium/play/general', '/premium/play/general?shuffle=1', free)).toBe('/play/general?shuffle=1')
    expect(redirectFor('/premium/mock/general', '/premium/mock/general', free)).toBe('/')
    expect(redirectFor('/play/general', '/play/general', free)).toBeNull()
  })

  it('only follows `next` to a path on this site', () => {
    expect(safeNext('/play/general?shuffle=1')).toBe('/play/general?shuffle=1')
    expect(safeNext('https://evil.example')).toBeNull()
    expect(safeNext('//evil.example')).toBeNull()
    expect(safeNext('/\\evil.example')).toBeNull()
    expect(safeNext('/login?next=/')).toBeNull()
    expect(safeNext(['/'])).toBeNull()
  })
})
