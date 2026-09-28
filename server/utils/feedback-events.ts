import type { H3Event } from 'h3'
import { FREE_FEEDBACK_INTERVAL_MS, type FeedbackEventLike } from '#shared/utils/credits'

/** Feedback events recent enough to matter for the Free credit rule. */
export async function recentFeedbackEvents(event: H3Event, userId: string): Promise<FeedbackEventLike[]> {
  const since = new Date(Date.now() - FREE_FEEDBACK_INTERVAL_MS).toISOString()
  const client = useAdminDb(event)

  const [recent, anyFull] = await Promise.all([
    client.from('feedback_events').select('kind, created_at').eq('user_id', userId).gte('created_at', since),
    // Whether the first free feedback was already used, however long ago.
    client.from('feedback_events').select('created_at').eq('user_id', userId).eq('kind', 'full')
      .order('created_at', { ascending: false }).limit(1),
  ])
  if (recent.error || anyFull.error) {
    throw createError({ statusCode: 500, statusMessage: 'Could not load feedback history' })
  }

  const rows = [
    ...recent.data.map(row => ({ kind: row.kind as FeedbackEventLike['kind'], createdAt: new Date(row.created_at) })),
    ...anyFull.data.map(row => ({ kind: 'full' as const, createdAt: new Date(row.created_at) })),
  ]
  return rows
}

export async function recordFeedbackEvent(event: H3Event, userId: string, cardId: string, kind: 'full' | 'locked') {
  const { error } = await useAdminDb(event)
    .from('feedback_events')
    .insert({ user_id: userId, card_id: cardId, kind })
  if (error) console.error('[feedback-events] insert failed', error.message)
}
