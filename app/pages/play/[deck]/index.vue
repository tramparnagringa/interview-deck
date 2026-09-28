<template>
  <main
    class="play"
    :style="deckAccentStyle(practice.deck?.color)"
  >
    <AnswerFocus
      v-if="answering && card"
      :key="answering.id"
      :question="answering.followUp ?? card.question"
      :meta="answering.followUp ? copy.answer.followUp : `${card.category} · ${copy.card.number(card.number)}`"
      :record="answering.mode === 'full'"
      @finish="onFinish"
      @cancel="stopAnswering"
    />

    <template v-else>
      <CardTopBar
        :close-label="copy.card.close"
        close-to="/"
      >
        <p
          v-if="card"
          class="play-counter"
        >
          {{ copy.card.counter(practice.position + 1, practice.total) }}
        </p>
      </CardTopBar>

      <AppNotice
        v-if="loadState === 'locked'"
        :message="copy.cta.lockedDeck.lead"
        :action-label="copy.errors.home"
        action-to="/"
      />
      <AppNotice
        v-else-if="loadState === 'error'"
        :message="copy.card.loadError"
        :action-label="copy.home.retry"
        @action="load"
      />
      <div
        v-else-if="!card"
        class="play-loading"
        role="status"
      >
        <UiSkeleton
          shape="block"
          width="full"
        />
        <span class="play-loading-text">{{ copy.card.loading }}</span>
      </div>

      <template v-else>
        <Transition
          name="play-card"
          mode="out-in"
        >
          <div
            :key="card.id"
            class="play-card"
          >
            <CardFace :card="card" />
          </div>
        </Transition>
        <CardActions
          :is-premium="isPremium"
          :duration="formatDuration(DEFAULT_ANSWER_SECONDS)"
          :busy="starting"
          @answer="startAnswer"
          @next="nextCard"
        />
      </template>

      <CtaSkool :context="loadState === 'locked' ? 'lockedDeck' : 'card'" />
    </template>
  </main>
</template>

<script setup lang="ts">
import type { EligibilityResponse, FeedbackMode } from '#shared/schemas/feedback'
import type { AnswerKind } from '~/components/card/CardActions.vue'
import { copy } from '~/content/copy'
import { deckAccentStyle, formatDuration } from '~/utils/deck'

interface AnsweringState {
  id: number
  mode: FeedbackMode
  followUp: string | null
}

const route = useRoute()
const practice = usePracticeStore()
const { isPremium } = usePlan()

const slug = computed(() => String(route.params.deck))
const card = computed(() => practice.currentCard)
const loadState = ref<'loading' | 'ready' | 'locked' | 'error'>('loading')
const answering = ref<AnsweringState | null>(null)
const starting = ref(false)
let answerCount = 0

setPageLayout('default')
watch(answering, value => setPageLayout(value ? 'focus' : 'default'))

async function load() {
  loadState.value = 'loading'
  try {
    await practice.loadDeck(slug.value, { fresh: route.query.shuffle === '1' })
    loadState.value = 'ready'
  }
  catch (error) {
    const status = (error as { statusCode?: number }).statusCode
    loadState.value = status === 403 ? 'locked' : 'error'
    return
  }

  // Coming back from the feedback screen: "Try again" or "Answer follow-up".
  const { again, followUp, shuffle, ...rest } = route.query
  if (again || followUp || shuffle) await navigateTo({ query: rest }, { replace: true })
  const lastResult = practice.lastResult
  if (followUp && lastResult && isPremium.value) {
    startAnswering('full', lastResult.feedback.follow_up)
  }
  else if (again) {
    await startAnswer(isPremium.value ? 'ai' : 'default')
  }
}

async function freeFeedbackMode(cardId: string): Promise<FeedbackMode> {
  try {
    const { mode } = await $fetch<EligibilityResponse>('/api/feedback/eligibility', {
      query: { cardId, answeredSinceLock: practice.answeredSinceLock },
    })
    return mode
  }
  catch {
    // Without an answer from the server, just practice with the timer.
    return 'none'
  }
}

async function startAnswer(kind: AnswerKind) {
  if (!card.value || starting.value) return
  starting.value = true
  try {
    let mode: FeedbackMode
    if (isPremium.value) mode = kind === 'timer' ? 'none' : 'full'
    else mode = await freeFeedbackMode(card.value.id)
    startAnswering(mode, null)
  }
  finally {
    starting.value = false
  }
}

function startAnswering(mode: FeedbackMode, followUp: string | null) {
  answering.value = { id: ++answerCount, mode, followUp }
}

function stopAnswering() {
  answering.value = null
}

async function onFinish(audio: Blob | null) {
  const state = answering.value
  const current = card.value
  if (!state || !current) return

  if (state.mode === 'full' && audio) {
    practice.pendingAnswer = { cardId: current.id, question: state.followUp ?? current.question, mode: 'full', audio, followUp: state.followUp }
    await navigateTo(`/play/${slug.value}/feedback`)
    return
  }
  if (state.mode === 'locked') {
    practice.recordLockShown()
    practice.pendingAnswer = { cardId: current.id, question: current.question, mode: 'locked', audio: null, followUp: null }
    await navigateTo(`/play/${slug.value}/feedback`)
    return
  }

  practice.recordAnswerWithoutFeedback()
  stopAnswering()
  practice.next()
}

function nextCard() {
  if (card.value) practice.next()
}

useKeyboardShortcuts({
  onToggle: () => {
    if (!answering.value) startAnswer(isPremium.value ? 'timer' : 'default')
  },
  onNext: () => {
    if (!answering.value) nextCard()
  },
})

onMounted(load)
</script>

<style scoped>
.play {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-6);
}

.play-counter {
  margin: 0;
  color: var(--color-ink-muted);
  font-size: var(--text-lg);
  font-variant-numeric: tabular-nums;
}

.play-card {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.play-loading {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  color: var(--color-ink-muted);
}

.play-loading-text {
  font-size: var(--text-sm);
}

.play-card-enter-active,
.play-card-leave-active {
  transition:
    opacity var(--duration-card) var(--ease-card),
    transform var(--duration-card) var(--ease-card);
}

.play-card-enter-from {
  opacity: 0;
  transform: translateY(var(--space-6)) scale(0.98);
}

.play-card-leave-to {
  opacity: 0;
  transform: translateX(calc(var(--space-12) * -1)) rotate(var(--rotate-stack-left));
}

@media (prefers-reduced-motion: reduce) {
  .play-card-enter-from,
  .play-card-leave-to {
    transform: none;
  }
}
</style>
