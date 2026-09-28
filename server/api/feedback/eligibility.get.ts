import { z } from 'zod'
import type { EligibilityResponse } from '#shared/schemas/feedback'
import { hasFreeFeedbackCredit, shouldShowLocked } from '#shared/utils/credits'

const querySchema = z.object({
  cardId: z.string().uuid(),
  /** Answers finished without feedback since the locked screen was last shown (client counter). */
  answeredSinceLock: z.coerce.number().int().min(0).max(1000).default(0),
})

/**
 * Asked before the candidate starts answering, so the client knows whether to record.
 * Premium: always `full`. Free: `full` with credit, otherwise `locked` (at most every 3 cards) or `none`.
 */
export default defineEventHandler(async (event): Promise<EligibilityResponse> => {
  const { cardId, answeredSinceLock } = await getValidatedQuery(event, querySchema.parse)
  const viewer = await requireUser(event)
  if (viewer.plan === 'premium') return { mode: 'full' }

  const card = await getCard(event, cardId)
  if (!card.deckIsFree) throw createError({ statusCode: 403, statusMessage: 'Premium deck' })

  const events = await recentFeedbackEvents(event, viewer.userId)
  if (hasFreeFeedbackCredit(events, new Date())) return { mode: 'full' }
  if (shouldShowLocked(answeredSinceLock)) {
    await recordFeedbackEvent(event, viewer.userId, cardId, 'locked')
    return { mode: 'locked' }
  }
  return { mode: 'none' }
})
