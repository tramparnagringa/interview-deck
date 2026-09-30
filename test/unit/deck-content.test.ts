import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { MOCK_INTRO_CATEGORY, SHARED_STAGES } from '../../shared/schemas/deck'
import { loadDeckFiles, loadStageFiles, toDeckData, toPremiumContent } from '../../modules/decks/content'

const contentDir = join(import.meta.dirname, '../../app/content')
const files = loadDeckFiles(join(contentDir, 'decks'))
const stages = loadStageFiles(join(contentDir, 'stages'))
const allCards = [...files.flatMap(deck => deck.cards), ...SHARED_STAGES.flatMap(stage => stages[stage].cards)]
const allHints = allCards.map(card => card.hint!)
const allExamples = allCards.flatMap(card => (card.example ? [card.example] : []))

describe('content', () => {
  it('loads the decks sorted, starting with General', () => {
    expect(files[0]!.slug).toBe('general')
    expect(files.map(deck => deck.sort)).toEqual([...files.map(deck => deck.sort)].sort((a, b) => a - b))
  })

  it('has "tell me about yourself" intros for mock interviews', () => {
    expect(stages.intro.cards.filter(card => card.category === MOCK_INTRO_CATEGORY).length).toBeGreaterThan(0)
  })

  it('never repeats a question, across decks and stages', () => {
    const questions = allCards.map(card => card.question.toLowerCase().trim())
    const duplicates = questions.filter((question, index) => questions.indexOf(question) !== index)
    expect(duplicates).toEqual([])
  })

  it('every card has a hint', () => {
    for (const hint of allHints) expect(hint).toBeTruthy()
  })

  it('includes all 50 questions from the TNG ebook, each with an example answer', () => {
    const ebook = allCards.filter(card => card.source === '50-questions')
    expect(ebook).toHaveLength(50)
    for (const card of ebook) expect(card.example, card.question).toBeTruthy()
  })
})

describe('toDeckData', () => {
  it('never contains Premium content (hints, examples) or editorial fields', () => {
    const json = JSON.stringify(toDeckData(files, stages))
    for (const field of ['"hint"', '"example"', '"source"']) expect(json).not.toContain(field)
    for (const text of [...allHints, ...allExamples]) expect(json).not.toContain(JSON.stringify(text).slice(1, -1))
  })

  it('gives stable ids, stages and per-stage timers', () => {
    const data = toDeckData(files, stages)
    expect(data.decks[0]!.cards[0]).toMatchObject({ id: 'general-1', stage: 'core', number: 1 })
    for (const stage of SHARED_STAGES) {
      expect(data.stages[stage][0]).toMatchObject({ id: `${stage}-1`, stage, durationSeconds: stages[stage].durationSeconds })
    }
    const ids = [
      ...SHARED_STAGES.flatMap(stage => data.stages[stage]),
      ...data.decks.flatMap(deck => [...deck.cards, ...deck.followUps]),
    ].map(card => card.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('toPremiumContent', () => {
  it('maps every card id to its hint and example answer', () => {
    const data = toDeckData(files, stages)
    const premium = toPremiumContent(files, stages)
    const ids = [
      ...SHARED_STAGES.flatMap(stage => data.stages[stage]),
      ...data.decks.flatMap(deck => [...deck.cards, ...deck.followUps]),
    ].map(card => card.id)
    expect(Object.keys(premium).sort()).toEqual([...ids].sort())
    expect(premium['general-1']).toEqual({ hint: files[0]!.cards[0]!.hint, example: files[0]!.cards[0]!.example })
    expect(premium['opening-1']).toEqual({ hint: stages.opening.cards[0]!.hint })
    expect(JSON.stringify(premium)).not.toContain('"source"')
  })
})
