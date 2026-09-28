import { describe, expect, it } from 'vitest'
import { aiFeedbackSchema } from '../../shared/schemas/feedback'

const valid = {
  summary: 'Good structure. Needs your part.',
  scores: {
    structure: { score: 4, note: 'Clear STAR' },
    specificity: { score: 2, note: 'Too general' },
    clarity: { score: 4, note: 'Easy to follow' },
  },
  tip: 'Say what you did.',
  quote: '…so we set up a call…',
  quote_highlights: ['we'],
  follow_up: 'What would you do differently?',
}

describe('aiFeedbackSchema (PRD 6.4)', () => {
  it('accepts a well-formed response', () => {
    expect(aiFeedbackSchema.safeParse(valid).success).toBe(true)
  })

  it.each([
    ['score out of range', { ...valid, scores: { ...valid.scores, clarity: { score: 6, note: 'x' } } }],
    ['non-integer score', { ...valid, scores: { ...valid.scores, clarity: { score: 3.5, note: 'x' } } }],
    ['missing follow_up', { ...valid, follow_up: undefined }],
    ['empty summary', { ...valid, summary: '' }],
  ])('rejects %s', (_, candidate) => {
    expect(aiFeedbackSchema.safeParse(candidate).success).toBe(false)
  })
})
