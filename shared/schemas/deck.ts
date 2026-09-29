import { z } from 'zod'

export const DECK_COLORS = [
  'general',
  'behavioral',
  'software-engineering',
  'product',
  'design',
  'data',
  'sales',
  'leadership',
] as const

export const deckColorSchema = z.enum(DECK_COLORS)
export type DeckColor = z.infer<typeof deckColorSchema>

/**
 * Access levels, from lowest to highest. Same app and components; each level has its own pages
 * (`/` for Free, `/premium` for Premium) that mount the screens with that level.
 */
export const LEVELS = ['free', 'premium'] as const
export const levelSchema = z.enum(LEVELS)
export type Level = z.infer<typeof levelSchema>

/** The free product is intentionally a single entry-point deck. */
export const FREE_DECKS = ['general'] as const

export function isDeckAvailable(level: Level, slug: string): boolean {
  return level === 'premium' || FREE_DECKS.includes(slug as (typeof FREE_DECKS)[number])
}

/**
 * How a session runs.
 * - practice: endless (opening → intro → the whole deck → closing, then a new session);
 * - mock: one short interview (opening → intro → a few deck questions → closing), then it ends.
 */
export const MODES = ['practice', 'mock'] as const
export type Mode = (typeof MODES)[number]

export interface LevelFeatures {
  /** Load and show Premium content (hints, example answers): a separate file only these pages download. */
  hints: boolean
  /** Modes this level can choose from. */
  modes: readonly Mode[]
  /** Pick the question voice or turn the audio off (group practice). Without it, the main voice always plays. */
  voicePicker: boolean
}

export const LEVEL_FEATURES: Record<Level, LevelFeatures> = {
  free: { hints: false, modes: ['practice'], voicePicker: false },
  premium: { hints: true, modes: ['practice', 'mock'], voicePicker: true },
}

/** Deck questions in a mock interview, between the intro and the closing. */
export const MOCK_CORE_QUESTIONS = 4

/**
 * Moments of an interview, in order. Opening, intro and closing questions are shared by every
 * deck (app/content/stages/<stage>.json); the core is the chosen deck.
 */
export const STAGES = ['opening', 'intro', 'core', 'follow-up', 'closing'] as const
export type Stage = (typeof STAGES)[number]
export const SHARED_STAGES = ['opening', 'intro', 'closing'] as const satisfies readonly Stage[]
export type SharedStage = (typeof SHARED_STAGES)[number]

const followUpFileSchema = z.object({
  question: z.string().min(1),
  hint: z.string().min(1).nullable(),
  example: z.string().min(1).optional(),
}).strict()

const cardFileSchema = z.object({
  category: z.string().min(1),
  question: z.string().min(1),
  /** Premium: short guidance shown on the card. */
  hint: z.string().min(1).nullable(),
  /** Premium: a model answer the candidate can open after trying on their own. */
  example: z.string().min(1).optional(),
  /** Where the card came from (editorial only, never shipped). E.g. "50-questions" (the TNG ebook). */
  source: z.string().min(1).optional(),
  /** A contextual Premium prompt that can be shown after this answer. */
  followUp: followUpFileSchema.optional(),
}).strict()

/**
 * Editorial source: app/content/decks/<slug>.json (the core questions of one topic or role).
 * Hints and example answers are split into `#build/premium` at build time (modules/decks); only
 * Premium pages load it.
 */
export const deckFileSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  shortName: z.string().min(1),
  tagline: z.string(),
  color: deckColorSchema,
  sort: z.number().int(),
  cards: z.array(cardFileSchema).min(1),
}).strict()

export type DeckFile = z.infer<typeof deckFileSchema>

/**
 * app/content/stages/<stage>.json: questions for one shared moment of the interview
 * (small talk, introduction, closing). Each stage has its own timer.
 */
export const stageFileSchema = z.object({
  durationSeconds: z.number().int().min(10).max(300),
  cards: z.array(cardFileSchema).min(1),
}).strict()

export type StageFile = z.infer<typeof stageFileSchema>
export type StageFiles = Record<SharedStage, StageFile>

export interface Card {
  /** Stable id: `<deck slug>-<number>` for core cards, `<stage>-<number>` for shared stages. */
  id: string
  stage: Stage
  /** Empty for shared stages (they belong to every deck). */
  deckSlug: string
  number: number
  category: string
  question: string
  /** The core card this follow-up asks the candidate to expand on. */
  followUpFor?: string
  /** Added on Premium pages from `#build/premium`. */
  hint?: string
  /** Added on Premium pages from `#build/premium`. */
  example?: string
  /** Timer length; defaults to DEFAULT_ANSWER_SECONDS. */
  durationSeconds?: number
}

export interface Deck {
  slug: string
  name: string
  shortName: string
  tagline: string
  color: DeckColor
  cards: Card[]
  followUps: Card[]
}

/** Premium content of one card, from `#build/premium`. */
export type PremiumContent = Pick<Card, 'hint' | 'example'>

/** Decks and shared stages from the build (`#build/decks`), without Premium content. */
export interface DeckData {
  decks: Deck[]
  stages: Record<SharedStage, Card[]>
}
