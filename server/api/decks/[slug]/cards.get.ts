import { z } from 'zod'
import type { DeckCardsResponse } from '#shared/schemas/card'

const paramsSchema = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/) })

/** Cards of a deck. `hint` is only present for Premium sessions (ARCHITECTURE D4). */
export default defineEventHandler(async (event): Promise<DeckCardsResponse> => {
  const { slug } = await getValidatedRouterParams(event, paramsSchema.parse)
  const { plan } = await getViewer(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return getDeckCards(event, slug, plan)
})
