import { defineStore } from 'pinia'
import data from '#build/decks'
import { MOCK_CORE_QUESTIONS, type Card, type Deck, type Mode } from '#shared/schemas/deck'
import { shuffle } from '#shared/utils/shuffle'

const STORAGE_KEY = 'interview-deck:practice'

interface PersistedState {
  deckSlug: string
  mode: Mode
  premium?: boolean
  order: string[]
  position: number
}

const pick = (cards: Card[]) => shuffle(cards)[0]
const PRACTICE_FOLLOW_UP_CHANCE = 0.25

/**
 * Card ids for one session, in interview order (opening → intro → core → closing).
 * Practice uses the whole deck; a mock interview uses a few deck questions.
 */
export function buildSessionOrder(deck: Deck, mode: Mode, includeFollowUps = false): string[] {
  const shuffledCore = shuffle(deck.cards)
  const core = mode === 'mock' ? shuffledCore.slice(0, MOCK_CORE_QUESTIONS) : shuffledCore
  let followUpParent: Card | undefined

  if (includeFollowUps && deck.followUps.length > 0) {
    const followUpByParent = new Map(deck.followUps.map(card => [card.followUpFor, card]))
    const eligibleCore = core.filter(card => followUpByParent.has(card.id))
    if (mode === 'mock') {
      followUpParent = eligibleCore[0]
      if (!followUpParent) {
        followUpParent = pick(deck.cards.filter(card => followUpByParent.has(card.id)))
        if (followUpParent) core[core.length - 1] = followUpParent
      }
    }
    else if (Math.random() < PRACTICE_FOLLOW_UP_CHANCE) {
      followUpParent = pick(eligibleCore)
    }
  }

  const followUpByParent = new Map(deck.followUps.map(card => [card.followUpFor, card]))
  const cards: Array<Card | undefined> = [pick(data.stages.opening), pick(data.stages.intro)]
  for (const card of core) {
    cards.push(card)
    if (card.id === followUpParent?.id) cards.push(followUpByParent.get(card.id))
  }
  cards.push(pick(data.stages.closing))
  return cards.filter((card): card is Card => card !== undefined).map(card => card.id)
}

const allStageCards = [...data.stages.opening, ...data.stages.intro, ...data.stages.closing]

export const usePracticeStore = defineStore('practice', () => {
  const deck = ref<Deck | null>(null)
  const mode = ref<Mode>('practice')
  const includeFollowUps = ref(false)
  const order = ref<string[]>([])
  const position = ref(0)
  /** Mock interviews end after the closing question; practice sessions never end. */
  const finished = ref(false)

  const cardsById = computed(() => new Map([...allStageCards, ...(deck.value?.cards ?? []), ...(deck.value?.followUps ?? [])].map(card => [card.id, card])))
  const currentCard = computed<Card | null>(() => {
    const id = order.value[position.value]
    return id ? cardsById.value.get(id) ?? null : null
  })
  /** Core (deck) questions in this session. */
  const total = computed(() => order.value.filter(id => cardsById.value.get(id)?.stage === 'core').length)
  /** 1-based position among the core questions; 0 outside the core. */
  const questionNumber = computed(() => {
    if (currentCard.value?.stage !== 'core') return 0
    return order.value.slice(0, position.value + 1).filter(id => cardsById.value.get(id)?.stage === 'core').length
  })

  function startSession() {
    order.value = deck.value ? buildSessionOrder(deck.value, mode.value, includeFollowUps.value) : []
    position.value = 0
    finished.value = false
  }

  /**
   * Opens a deck in a mode. Keeps the current session when it is the same deck and mode and all
   * its cards still exist (e.g. after a refresh); otherwise starts a new one.
   * Returns false for an unknown deck.
   */
  function openDeck(slug: string, options: { mode?: Mode, premium?: boolean, fresh?: boolean } = {}): boolean {
    const next = data.decks.find(candidate => candidate.slug === slug)
    if (!next) return false
    const nextMode = options.mode ?? 'practice'
    const nextPremium = options.premium ?? false
    const saved = deck.value ? null : restore()
    const current = saved ?? (deck.value ? { deckSlug: deck.value.slug, mode: mode.value, premium: includeFollowUps.value } : null)
    const sameSession = current?.deckSlug === slug && current.mode === nextMode && current.premium === nextPremium

    deck.value = next
    mode.value = nextMode
    includeFollowUps.value = nextPremium
    const valid = order.value.length > 0 && order.value.every(id => cardsById.value.has(id))
    if (options.fresh || !sameSession || !valid) startSession()
    return true
  }

  /** Next card. Practice starts a new session after the closing; a mock interview finishes. */
  function next() {
    if (position.value + 1 < order.value.length) {
      position.value += 1
    }
    else if (mode.value === 'mock') {
      finished.value = true
    }
    else {
      startSession()
    }
  }

  /**
   * Restores the session saved in this tab. Called lazily from `openDeck` (client only):
   * restoring during store setup would be overwritten by the prerendered (empty) Pinia state.
   */
  function restore(): Pick<PersistedState, 'deckSlug' | 'mode' | 'premium'> | null {
    if (!import.meta.client) return null
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as PersistedState | null
      if (!saved) return null
      order.value = saved.order
      position.value = saved.position
      return { deckSlug: saved.deckSlug, mode: saved.mode, premium: saved.premium ?? false }
    }
    catch {
      // Storage unavailable or corrupted: start a fresh session.
      return null
    }
  }

  // Persist the session so a refresh keeps the same card (ARCHITECTURE D7).
  if (import.meta.client) {
    watch([deck, mode, order, position], () => {
      if (!deck.value) return
      const state: PersistedState = { deckSlug: deck.value.slug, mode: mode.value, premium: includeFollowUps.value, order: order.value, position: position.value }
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      }
      catch {
        // Ignore quota / privacy mode errors.
      }
    })
  }

  return { deck, mode, order, position, finished, currentCard, total, questionNumber, openDeck, startSession, next }
})
