import { z } from 'zod'
import { FEEDBACK_ERRORS, MAX_AUDIO_BYTES, type FeedbackResponse } from '#shared/schemas/feedback'
import { hasFreeFeedbackCredit } from '#shared/utils/credits'

const fieldsSchema = z.object({
  cardId: z.string().uuid(),
  /** Set when answering the interviewer follow-up instead of the card question (Premium only). */
  followUp: z.string().trim().min(1).max(300).optional(),
})

/**
 * Pipeline (ARCHITECTURE D6): plan/credit check → transcription → LLM → validated JSON.
 * The audio is only held in memory for this request.
 */
export default defineEventHandler(async (event): Promise<FeedbackResponse> => {
  const viewer = await requireUser(event)

  const declaredLength = Number(getRequestHeader(event, 'content-length') ?? 0)
  if (declaredLength > MAX_AUDIO_BYTES + 64 * 1024) {
    throw createError({ statusCode: 413, statusMessage: 'Recording is too long', data: { code: FEEDBACK_ERRORS.audioTooLarge } })
  }

  const parts = await readMultipartFormData(event) ?? []
  const field = (name: string) => parts.find(part => part.name === name && !part.filename)?.data.toString('utf8')
  const audioPart = parts.find(part => part.name === 'audio')
  const fields = fieldsSchema.safeParse({ cardId: field('cardId'), followUp: field('followUp') || undefined })

  if (!fields.success || !audioPart) throw createError({ statusCode: 400, statusMessage: 'Invalid request' })
  if (audioPart.data.byteLength > MAX_AUDIO_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Recording is too long', data: { code: FEEDBACK_ERRORS.audioTooLarge } })
  }

  const { cardId, followUp } = fields.data
  const card = await getCard(event, cardId)

  if (viewer.plan !== 'premium') {
    if (!card.deckIsFree) throw createError({ statusCode: 403, statusMessage: 'Premium deck' })
    if (followUp) {
      throw createError({ statusCode: 403, statusMessage: 'Follow-up is Premium', data: { code: FEEDBACK_ERRORS.followUpPremiumOnly } })
    }
    const events = await recentFeedbackEvents(event, viewer.userId)
    // Checked again here: the eligibility call is only a hint for the client.
    if (!hasFreeFeedbackCredit(events, new Date())) return { status: 'locked' }
  }

  const audio = new Blob([new Uint8Array(audioPart.data)], { type: audioPart.type ?? 'audio/webm' })
  const transcript = await transcribe(audio, audioPart.filename ?? 'answer.webm')
  const feedback = await generateFeedback({
    question: followUp ?? card.question,
    // The hint describes the card question, not the follow-up.
    hint: followUp ? null : card.hint,
    transcript,
  })

  await recordFeedbackEvent(event, viewer.userId, cardId, 'full')
  return { status: 'ok', feedback }
})
