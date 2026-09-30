import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import data from '#build/decks'
import { MOCK_CORE_QUESTIONS, MOCK_INTRO_CATEGORY } from '#shared/schemas/deck'
import { usePracticeStore } from '~/stores/practice'

const general = data.decks.find(deck => deck.slug === 'general')!

describe('practice store', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
  })

  it('practice: opening, intro, the whole deck without repeats, closing, then a new session', () => {
    const store = usePracticeStore()
    expect(store.openDeck('general')).toBe(true)

    const stages: string[] = []
    const core = new Set<string>()
    for (let i = 0; i < general.cards.length + 3; i++) {
      stages.push(store.currentCard!.stage)
      if (store.currentCard!.stage === 'core') {
        core.add(store.currentCard!.id)
        expect(store.questionNumber).toBe(core.size)
      }
      store.next()
    }
    expect(stages[0]).toBe('opening')
    expect(stages[1]).toBe('intro')
    expect(stages.at(-1)).toBe('closing')
    expect(core.size).toBe(general.cards.length)
    expect(store.total).toBe(general.cards.length)

    // After the closing a new session starts, never "finished".
    expect(store.finished).toBe(false)
    expect(store.currentCard?.stage).toBe('opening')
  })

  it('premium mock: four questions and one follow-up before the wrap-up', () => {
    const store = usePracticeStore()
    store.openDeck('general', { mode: 'mock', premium: true })
    const stages: string[] = []
    while (!store.finished) {
      if (store.currentCard!.stage === 'intro') expect(store.currentCard!.category).toBe(MOCK_INTRO_CATEGORY)
      stages.push(store.currentCard!.stage)
      store.next()
    }
    expect(stages.slice(0, 2)).toEqual(['opening', 'intro'])
    expect(stages.filter(stage => stage === 'core')).toHaveLength(MOCK_CORE_QUESTIONS)
    expect(stages).toContain('follow-up')
    expect(stages.at(-1)).toBe('closing')
    expect(store.total).toBe(MOCK_CORE_QUESTIONS)

    store.startSession()
    expect(store.finished).toBe(false)
    expect(store.currentCard?.stage).toBe('opening')
  })

  it('mock: the intro is always a "tell me about yourself" question', () => {
    const store = usePracticeStore()
    for (let i = 0; i < 20; i++) {
      store.openDeck('general', { mode: 'mock', fresh: true })
      store.next()
      expect(store.currentCard).toMatchObject({ stage: 'intro', category: MOCK_INTRO_CATEGORY })
    }
  })

  it('goes back to the previous card, but not before the first one', () => {
    const store = usePracticeStore()
    store.openDeck('general')
    const first = store.currentCard?.id
    store.previous()
    expect(store.currentCard?.id).toBe(first)
    store.next()
    store.next()
    const third = store.currentCard?.id
    store.previous()
    store.next()
    expect(store.currentCard?.id).toBe(third)
    store.previous()
    store.previous()
    expect(store.currentCard?.id).toBe(first)
  })

  it('keeps the session for the same deck and mode; a new mode starts a new session', () => {
    const store = usePracticeStore()
    store.openDeck('general')
    store.next()
    const current = store.currentCard?.id
    store.openDeck('general')
    expect(store.currentCard?.id).toBe(current)
    store.openDeck('general', { mode: 'mock' })
    expect(store.position).toBe(0)
    store.openDeck('general', { mode: 'mock', fresh: true })
    expect(store.currentCard?.stage).toBe('opening')
  })

  it('rejects unknown decks', () => {
    expect(usePracticeStore().openDeck('nope')).toBe(false)
  })

  it('deck data has no Premium content (it lives in #build/premium)', () => {
    expect(JSON.stringify(data)).not.toContain('"hint"')
  })
})
