import { describe, expect, it } from 'vitest'
import { shortUrl } from '../../app/utils/url'

describe('shortUrl', () => {
  it('keeps the host and the first path segment', () => {
    expect(shortUrl('https://www.skool.com/tramparnagringa/about')).toBe('skool.com/tramparnagringa')
    expect(shortUrl('https://example.com/')).toBe('example.com')
  })
})
