import { z } from 'zod'

export const DECK_COLORS = [
  'general',
  'behavioral',
  'software-engineering',
  'product',
  'design',
  'data',
  'sales',
  'leadership',
] as const

export const deckColorSchema = z.enum(DECK_COLORS)
export type DeckColor = z.infer<typeof deckColorSchema>

export const deckSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  shortName: z.string().min(1),
  tagline: z.string(),
  color: deckColorSchema,
  isFree: z.boolean(),
  cardCount: z.number().int().nonnegative(),
  /** True when the current session cannot open this deck. Decided on the server. */
  locked: z.boolean(),
})

export type Deck = z.infer<typeof deckSchema>
