import type { DeckCardsResponse, PremiumCard, PublicCard } from '../../shared/schemas/card'
import type { Deck } from '../../shared/schemas/deck'
import type { Plan } from '../../shared/schemas/plan'

export interface CardRow {
  id: string
  deck_slug: string
  number: number
  category: string
  question: string
  hint?: string | null
}

/** Builds each field explicitly, so a Free card can never carry `hint`, even if the row has it. */
export function toPublicCard(row: CardRow): PublicCard {
  return {
    id: row.id,
    deckSlug: row.deck_slug,
    number: row.number,
    category: row.category,
    question: row.question,
  }
}

export function toCardsResponse(plan: Plan, deck: Deck, rows: CardRow[]): DeckCardsResponse {
  if (plan === 'premium') {
    const cards: PremiumCard[] = rows.map(row => ({ ...toPublicCard(row), hint: row.hint ?? null }))
    return { plan, deck, cards }
  }
  return { plan, deck, cards: rows.map(toPublicCard) }
}
