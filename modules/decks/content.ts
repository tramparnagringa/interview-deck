import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import {
  deckFileSchema,
  SHARED_STAGES,
  stageFileSchema,
  type Card,
  type DeckData,
  type DeckFile,
  type PremiumContent,
  type SharedStage,
  type StageFiles,
} from '../../shared/schemas/deck'

function readJson<T>(path: string, schema: z.ZodType<T>, label: string): T {
  const parsed = schema.safeParse(JSON.parse(readFileSync(path, 'utf8')))
  if (!parsed.success) throw new Error(`[decks] ${label}: ${z.prettifyError(parsed.error)}`)
  return parsed.data
}

/** Reads and validates every deck file. Throws with the file name on invalid content. */
export function loadDeckFiles(dir: string): DeckFile[] {
  return readdirSync(dir)
    .filter(file => file.endsWith('.json'))
    .map((file) => {
      const deck = readJson(join(dir, file), deckFileSchema, file)
      if (`${deck.slug}.json` !== file) throw new Error(`[decks] ${file}: slug must match the file name`)
      return deck
    })
    .sort((a, b) => a.sort - b.sort)
}

/** Reads app/content/stages/{opening,intro,closing}.json. Every shared stage is required. */
export function loadStageFiles(dir: string): StageFiles {
  return Object.fromEntries(
    SHARED_STAGES.map(stage => [stage, readJson(join(dir, `${stage}.json`), stageFileSchema, `stages/${stage}.json`)]),
  ) as StageFiles
}

const deckCardId = (slug: string, index: number) => `${slug}-${index + 1}`
const followUpCardId = (slug: string, index: number) => `${deckCardId(slug, index)}-follow-up`
const stageCardId = (stage: SharedStage, index: number) => `${stage}-${index + 1}`

/** Decks and shared stages for every page. Every field is picked explicitly: no Premium content here. */
export function toDeckData(files: DeckFile[], stages: StageFiles): DeckData {
  return {
    decks: files.map(file => ({
      slug: file.slug,
      name: file.name,
      shortName: file.shortName,
      tagline: file.tagline,
      color: file.color,
      cards: file.cards.map((card, index): Card => {
        const id = deckCardId(file.slug, index)
        return {
          id,
          stage: 'core',
          deckSlug: file.slug,
          number: index + 1,
          category: card.category,
          question: card.question,
        }
      }),
      followUps: file.cards.flatMap((card, index): Card[] => {
        if (!card.followUp) return []
        return [{
          id: followUpCardId(file.slug, index),
          stage: 'follow-up',
          deckSlug: file.slug,
          number: index + 1,
          category: 'Follow-up',
          question: card.followUp.question,
          followUpFor: deckCardId(file.slug, index),
        }]
      }),
    })),
    stages: Object.fromEntries(SHARED_STAGES.map(stage => [
      stage,
      stages[stage].cards.map((card, index): Card => ({
        id: stageCardId(stage, index),
        stage,
        deckSlug: '',
        number: index + 1,
        category: card.category,
        question: card.question,
        durationSeconds: stages[stage].durationSeconds,
      })),
    ])) as DeckData['stages'],
  }
}

/** Premium content (hint, example answer) by card id: a separate file that only Premium pages load. */
export function toPremiumContent(files: DeckFile[], stages: StageFiles): Record<string, PremiumContent> {
  const content: Record<string, PremiumContent> = {}
  const add = (id: string, card: { hint: string | null, example?: string }) => {
    const entry: PremiumContent = {}
    if (card.hint) entry.hint = card.hint
    if (card.example) entry.example = card.example
    if (entry.hint || entry.example) content[id] = entry
  }
  for (const file of files) file.cards.forEach((card, index) => {
    add(deckCardId(file.slug, index), card)
    if (card.followUp) add(followUpCardId(file.slug, index), card.followUp)
  })
  for (const stage of SHARED_STAGES) stages[stage].cards.forEach((card, index) => add(stageCardId(stage, index), card))
  return content
}
