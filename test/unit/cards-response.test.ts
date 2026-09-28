import { describe, expect, it } from 'vitest'
import { deckCardsResponseSchema } from '../../shared/schemas/card'
import type { Deck } from '../../shared/schemas/deck'
import { toCardsResponse, type CardRow } from '../../server/utils/cards-response'

const deck: Deck = {
  slug: 'general',
  name: 'General Deck',
  shortName: 'General',
  tagline: 'Start here',
  color: 'general',
  isFree: true,
  cardCount: 1,
  locked: false,
}

const row: CardRow = {
  id: '6f1c2d4e-1111-4a2b-9c3d-123456789abc',
  deck_slug: 'general',
  number: 1,
  category: 'Behavioral',
  question: 'Tell me about yourself.',
  hint: 'Present, past, future.',
}

describe('toCardsResponse', () => {
  it('never includes the hint for Free, even when the row has one', () => {
    const response = toCardsResponse('free', deck, [row])
    expect(JSON.stringify(response)).not.toContain('hint')
    expect(JSON.stringify(response)).not.toContain(row.hint)
    expect(deckCardsResponseSchema.safeParse(response).success).toBe(true)
  })

  it('includes the hint for Premium', () => {
    const response = toCardsResponse('premium', deck, [row])
    expect(response.cards[0]).toMatchObject({ hint: 'Present, past, future.' })
    expect(deckCardsResponseSchema.safeParse(response).success).toBe(true)
  })

  it('the Free response schema rejects a hint', () => {
    const leaked = { plan: 'free', deck, cards: [{ ...toCardsResponse('free', deck, [row]).cards[0], hint: 'x' }] }
    expect(deckCardsResponseSchema.safeParse(leaked).success).toBe(false)
  })
})
