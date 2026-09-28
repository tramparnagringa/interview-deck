import { z } from 'zod'
import { FEEDBACK_ERRORS } from '#shared/schemas/feedback'

const scribeResponseSchema = z.object({ text: z.string() })

/** Minimum words for an answer to be worth scoring. */
const MIN_WORDS = 5

/**
 * Transcribes a recorded answer with ElevenLabs Scribe. The audio only lives in memory for this
 * request; it is never stored (AGENTS.md).
 */
export async function transcribe(audio: Blob, filename: string): Promise<string> {
  const { ai } = useRuntimeConfig()
  if (ai.mock) return MOCK_TRANSCRIPT

  const form = new FormData()
  form.append('model_id', ai.elevenlabsModel)
  form.append('language_code', 'en')
  form.append('tag_audio_events', 'false')
  form.append('timestamps_granularity', 'none')
  form.append('file', audio, filename)

  let body: unknown
  try {
    body = await $fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': ai.elevenlabsKey },
      body: form,
      timeout: 60_000,
    })
  }
  catch (error) {
    console.error('[transcribe] ElevenLabs request failed', error)
    throw createError({ statusCode: 502, statusMessage: 'Transcription failed', data: { code: FEEDBACK_ERRORS.aiUnavailable } })
  }

  const parsed = scribeResponseSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 502, statusMessage: 'Transcription failed', data: { code: FEEDBACK_ERRORS.aiUnavailable } })
  }

  const text = parsed.data.text.trim()
  if (text.split(/\s+/).filter(Boolean).length < MIN_WORDS) {
    throw createError({ statusCode: 422, statusMessage: 'We could not hear an answer', data: { code: FEEDBACK_ERRORS.noSpeech } })
  }
  return text
}

export const MOCK_TRANSCRIPT = 'So in my last job we had a disagreement about the release date. The PM wanted to ship everything at once and I thought it was too risky. So we set up a call with the PM and we agreed to split the release in two parts, and the first part went out on time.'
