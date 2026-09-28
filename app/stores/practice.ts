import { defineStore } from 'pinia'
import type { Card, DeckCardsResponse } from '#shared/schemas/card'
import type { Deck } from '#shared/schemas/deck'
import type { AiFeedback, FeedbackMode } from '#shared/schemas/feedback'
import { shuffle } from '#shared/utils/shuffle'

const STORAGE_KEY = 'interview-deck:practice'

interface PersistedState {
  deckSlug: string | null
  order: string[]
  position: number
  answeredSinceLock: number
}

/** A finished answer waiting to be sent to `/api/feedback`. Kept in memory only (never stored). */
export interface PendingAnswer {
  cardId: string
  question: string
  mode: Exclude<FeedbackMode, 'none'>
  audio: Blob | null
  followUp: string | null
}

export interface FeedbackResult {
  cardId: string
  question: string
  feedback: AiFeedback
  wasFollowUp: boolean
}

export const usePracticeStore = defineStore('practice', () => {
  const deck = ref<Deck | null>(null)
  const cards = ref<Card[]>([])
  const order = ref<string[]>([])
  const position = ref(0)
  /** Answers finished without feedback since the locked upsell was last shown (PRD 6.3). */
  const answeredSinceLock = ref(0)
  const pendingAnswer = shallowRef<PendingAnswer | null>(null)
  const lastResult = ref<FeedbackResult | null>(null)
  /** Deck of the session restored from sessionStorage, until that deck is loaded again. */
  let restoredSlug: string | null = null

  const cardsById = computed(() => new Map(cards.value.map(card => [card.id, card])))
  const currentCard = computed<Card | null>(() => {
    const id = order.value[position.value]
    return id ? cardsById.value.get(id) ?? null : null
  })
  const total = computed(() => order.value.length)

  function reshuffle() {
    order.value = shuffle(cards.value.map(card => card.id))
    position.value = 0
  }

  /** Loads a deck; keeps the current shuffled order when it still matches the deck's cards. */
  async function loadDeck(slug: string, options: { fresh?: boolean } = {}) {
    const response = await $fetch<DeckCardsResponse>(`/api/decks/${slug}/cards`)
    const sameDeck = deck.value?.slug === slug || restoredSlug === slug
    deck.value = response.deck
    cards.value = response.cards
    restoredSlug = null

    const ids = new Set(response.cards.map(card => card.id))
    const orderStillValid = order.value.length === ids.size && order.value.every(id => ids.has(id))
    if (options.fresh || !sameDeck || !orderStillValid) reshuffle()
  }

  /** Moves to the next card. Without repeats until the deck ends, then reshuffles (PRD 6.2). */
  function next() {
    if (position.value + 1 >= order.value.length) reshuffle()
    else position.value += 1
  }

  function recordAnswerWithoutFeedback() {
    answeredSinceLock.value += 1
  }

  function recordLockShown() {
    answeredSinceLock.value = 0
  }

  /** Forget the session (e.g. after signing out, when the plan and decks change). */
  function reset() {
    deck.value = null
    cards.value = []
    order.value = []
    position.value = 0
    pendingAnswer.value = null
    lastResult.value = null
    restoredSlug = null
  }

  // Persist the session so a refresh keeps the same order and card (ARCHITECTURE D7).
  if (import.meta.client) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as PersistedState | null
      if (saved) {
        restoredSlug = saved.deckSlug
        order.value = saved.order
        position.value = saved.position
        answeredSinceLock.value = saved.answeredSinceLock
      }
    }
    catch {
      // Storage unavailable or corrupted: start a fresh session.
    }

    watch([deck, order, position, answeredSinceLock], () => {
      const state: PersistedState = {
        deckSlug: deck.value?.slug ?? restoredSlug,
        order: order.value,
        position: position.value,
        answeredSinceLock: answeredSinceLock.value,
      }
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      }
      catch {
        // Ignore quota / privacy mode errors.
      }
    })
  }

  return {
    deck,
    cards,
    order,
    position,
    answeredSinceLock,
    pendingAnswer,
    lastResult,
    currentCard,
    total,
    loadDeck,
    reshuffle,
    next,
    recordAnswerWithoutFeedback,
    recordLockShown,
    reset,
  }
})
