import type { H3Event } from 'h3'
import { deckSchema, type Deck } from '#shared/schemas/deck'
import type { DeckCardsResponse } from '#shared/schemas/card'
import type { Plan } from '#shared/schemas/plan'
import { toCardsResponse, type CardRow } from './cards-response'

interface DeckRow {
  slug: string
  name: string
  short_name: string
  tagline: string
  color: string
  is_free: boolean
  card_count: number
}

function toDeck(row: DeckRow, plan: Plan): Deck {
  return deckSchema.parse({
    slug: row.slug,
    name: row.name,
    shortName: row.short_name,
    tagline: row.tagline,
    color: row.color,
    isFree: row.is_free,
    cardCount: row.card_count,
    locked: !row.is_free && plan !== 'premium',
  })
}

export async function listDecks(event: H3Event, plan: Plan): Promise<Deck[]> {
  const { data, error } = await useAdminDb(event)
    .from('deck_summaries')
    .select('slug, name, short_name, tagline, color, is_free, card_count')
    .order('sort')
  if (error) throw createError({ statusCode: 500, statusMessage: 'Could not load decks' })
  return (data as DeckRow[]).map(row => toDeck(row, plan))
}

/**
 * Cards of one deck. Free sessions never select the `hint` column, so it cannot leak
 * through a serialization mistake further down.
 */
export async function getDeckCards(event: H3Event, slug: string, plan: Plan): Promise<DeckCardsResponse> {
  const decks = await listDecks(event, plan)
  const deck = decks.find(candidate => candidate.slug === slug)
  if (!deck) throw createError({ statusCode: 404, statusMessage: 'Deck not found' })
  if (deck.locked) throw createError({ statusCode: 403, statusMessage: 'Premium deck' })

  const columns = plan === 'premium'
    ? 'id, deck_slug, number, category, question, hint'
    : 'id, deck_slug, number, category, question'

  const { data, error } = await useAdminDb(event)
    .from('cards')
    .select(columns)
    .eq('deck_slug', slug)
    .order('number')
  if (error) throw createError({ statusCode: 500, statusMessage: 'Could not load cards' })
  return toCardsResponse(plan, deck, data as unknown as CardRow[])
}

export async function getCard(event: H3Event, cardId: string) {
  const { data, error } = await useAdminDb(event)
    .from('cards')
    .select('id, deck_slug, question, hint, decks!inner(is_free)')
    .eq('id', cardId)
    .maybeSingle()
  if (error) throw createError({ statusCode: 500, statusMessage: 'Could not load card' })
  if (!data) throw createError({ statusCode: 404, statusMessage: 'Card not found' })
  const row = data as unknown as { id: string, deck_slug: string, question: string, hint: string | null, decks: { is_free: boolean } }
  return { id: row.id, deckSlug: row.deck_slug, question: row.question, hint: row.hint, deckIsFree: row.decks.is_free }
}
