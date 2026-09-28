import { describe, expect, it } from 'vitest'
import { shuffle } from '../../shared/utils/shuffle'

describe('shuffle', () => {
  it('returns every item exactly once without mutating the input', () => {
    const input = Object.freeze(Array.from({ length: 50 }, (_, i) => i))
    const result = shuffle(input)
    expect(result).toHaveLength(50)
    expect([...result].sort((a, b) => a - b)).toEqual([...input])
    expect(input[0]).toBe(0)
  })

  it('is deterministic for a given random source', () => {
    let seed = 1
    const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647
    const first = shuffle(['a', 'b', 'c', 'd', 'e'], random)
    seed = 1
    expect(shuffle(['a', 'b', 'c', 'd', 'e'], random)).toEqual(first)
  })

  it('handles empty and single-item arrays', () => {
    expect(shuffle([])).toEqual([])
    expect(shuffle(['only'])).toEqual(['only'])
  })
})
