import { z } from 'zod'

/** One criterion (PRD 6.4): a 1–5 score and a short note shown next to the bar. */
export const scoreSchema = z.object({
  score: z.number().int().min(1).max(5),
  note: z.string().min(1).max(40),
})

/** The JSON the LLM must return (PRD 6.4). Validated before it reaches the client. */
export const aiFeedbackSchema = z.object({
  summary: z.string().min(1).max(80),
  scores: z.object({
    structure: scoreSchema,
    specificity: scoreSchema,
    clarity: scoreSchema,
  }),
  tip: z.string().min(1).max(200),
  /** Verbatim excerpt of the transcript that the tip refers to. */
  quote: z.string().max(240),
  /** Words inside `quote` to highlight (e.g. "we"). */
  quote_highlights: z.array(z.string().max(40)).max(5),
  follow_up: z.string().min(1).max(200),
})

export type AiFeedback = z.infer<typeof aiFeedbackSchema>

export const feedbackModeSchema = z.enum(['full', 'locked', 'none'])
/** full: record and get AI feedback · locked: show the blurred upsell · none: just move on. */
export type FeedbackMode = z.infer<typeof feedbackModeSchema>

export const eligibilityResponseSchema = z.object({ mode: feedbackModeSchema })
export type EligibilityResponse = z.infer<typeof eligibilityResponseSchema>

export const feedbackResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('ok'), feedback: aiFeedbackSchema }),
  z.object({ status: z.literal('locked') }),
])

export type FeedbackResponse = z.infer<typeof feedbackResponseSchema>

/** Error codes the feedback endpoint can return in `data.code`. */
export const FEEDBACK_ERRORS = {
  noSpeech: 'no_speech',
  audioTooLarge: 'audio_too_large',
  aiUnavailable: 'ai_unavailable',
  followUpPremiumOnly: 'follow_up_premium_only',
} as const

export const MAX_AUDIO_BYTES = 8 * 1024 * 1024
