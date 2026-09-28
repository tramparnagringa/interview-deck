import type { Deck } from '#shared/schemas/deck'

export default defineEventHandler(async (event): Promise<Deck[]> => {
  const { plan } = await getViewer(event)
  return listDecks(event, plan)
})
