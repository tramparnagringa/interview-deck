import { z } from 'zod'
import { deckSchema } from './deck'
import { planSchema } from './plan'

export const publicCardSchema = z.object({
  id: z.string().uuid(),
  deckSlug: z.string(),
  number: z.number().int().positive(),
  category: z.string().min(1),
  question: z.string().min(1),
})

/** Premium cards carry the hint. The server only builds these for Premium sessions. */
export const premiumCardSchema = publicCardSchema.extend({
  hint: z.string().nullable(),
})

export type PublicCard = z.infer<typeof publicCardSchema>
export type PremiumCard = z.infer<typeof premiumCardSchema>
export type Card = PublicCard | PremiumCard

export const deckCardsResponseSchema = z.discriminatedUnion('plan', [
  z.object({ plan: z.literal(planSchema.enum.free), deck: deckSchema, cards: z.array(publicCardSchema.strict()) }),
  z.object({ plan: z.literal(planSchema.enum.premium), deck: deckSchema, cards: z.array(premiumCardSchema.strict()) }),
])

export type DeckCardsResponse = z.infer<typeof deckCardsResponseSchema>

export function hasHint(card: Card): card is PremiumCard & { hint: string } {
  return 'hint' in card && typeof card.hint === 'string' && card.hint.length > 0
}
