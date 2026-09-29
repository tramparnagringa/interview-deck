import type { Card } from '#shared/schemas/deck'

/** Audio packs currently available in the static site. */
export const AUDIO_VOICES = ['hale-v3-expressive', 'neha-messy-relatable'] as const
export type AudioVoice = (typeof AUDIO_VOICES)[number]
export const DEFAULT_AUDIO_VOICE: AudioVoice = 'hale-v3-expressive'

export function audioSourceForCard(card: Card, voice: AudioVoice = DEFAULT_AUDIO_VOICE): string | null {
  if (card.deckSlug) return `/audio/${card.deckSlug}/${voice}/${card.id}.mp3`
  if (card.deckSlug === '') return `/audio/shared/${voice}/${card.id}.mp3`
  return null
}
