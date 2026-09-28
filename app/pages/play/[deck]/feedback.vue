<template>
  <main
    class="feedback"
    :style="deckAccentStyle(practice.deck?.color)"
  >
    <FeedbackHeader :close-to="playPath" />

    <FeedbackLoading v-if="state === 'loading'" />

    <AppNotice
      v-else-if="state === 'error'"
      :message="errorMessage"
      :action-label="canRetry ? copy.feedback.retry : copy.feedback.next"
      @action="canRetry ? submit() : goToNextCard()"
    />

    <template v-else-if="state === 'locked' && pending">
      <FeedbackLocked :question="pending.question" />
      <div class="feedback-actions">
        <UiButton
          block
          @click="goToNextCard"
        >
          {{ copy.feedback.next }}
        </UiButton>
      </div>
    </template>

    <template v-else-if="state === 'result' && result">
      <FeedbackResult
        :question="result.question"
        :feedback="result.feedback"
        :show-follow-up="isPremium"
      />
      <div class="feedback-actions">
        <template v-if="isPremium">
          <UiButton
            variant="secondary"
            block
            @click="tryAgain"
          >
            {{ copy.feedback.tryAgain }}
          </UiButton>
          <UiButton
            block
            @click="answerFollowUp"
          >
            {{ copy.feedback.answerFollowUp }}
          </UiButton>
        </template>
        <UiButton
          v-else
          block
          @click="goToNextCard"
        >
          {{ copy.feedback.next }}
        </UiButton>
      </div>
    </template>

    <CtaSkool :context="state === 'locked' ? 'locked' : 'feedback'" />
  </main>
</template>

<script setup lang="ts">
import { FEEDBACK_ERRORS, type FeedbackResponse } from '#shared/schemas/feedback'
import { copy, type FeedbackErrorCode } from '~/content/copy'
import { extensionFor } from '~/composables/useRecorder'
import { deckAccentStyle } from '~/utils/deck'

const route = useRoute()
const practice = usePracticeStore()
const { isPremium } = usePlan()

const playPath = computed(() => `/play/${String(route.params.deck)}`)
const pending = computed(() => practice.pendingAnswer)
const result = computed(() => practice.lastResult)

const state = ref<'loading' | 'result' | 'locked' | 'error'>('loading')
const errorCode = ref<FeedbackErrorCode>('generic')
const errorMessage = computed(() => copy.feedback.errors[errorCode.value])
const canRetry = computed(() => errorCode.value === 'ai_unavailable' || errorCode.value === 'generic')

async function submit() {
  const answer = pending.value
  if (!answer?.audio) return
  state.value = 'loading'

  const body = new FormData()
  body.append('cardId', answer.cardId)
  if (answer.followUp) body.append('followUp', answer.followUp)
  body.append('audio', answer.audio, `answer.${extensionFor(answer.audio.type)}`)

  try {
    const response = await $fetch<FeedbackResponse>('/api/feedback', { method: 'POST', body })
    if (response.status === 'locked') {
      practice.recordLockShown()
      state.value = 'locked'
      return
    }
    practice.lastResult = {
      cardId: answer.cardId,
      question: answer.question,
      feedback: response.feedback,
      wasFollowUp: answer.followUp !== null,
    }
    // The audio is no longer needed; drop it.
    practice.pendingAnswer = null
    state.value = 'result'
  }
  catch (error) {
    const code = (error as { data?: { data?: { code?: string } } }).data?.data?.code
    errorCode.value = code && Object.values(FEEDBACK_ERRORS).includes(code as never) ? (code as FeedbackErrorCode) : 'generic'
    state.value = 'error'
  }
}

async function goToNextCard() {
  practice.pendingAnswer = null
  practice.next()
  await navigateTo(playPath.value)
}

async function tryAgain() {
  await navigateTo({ path: playPath.value, query: { again: '1' } })
}

async function answerFollowUp() {
  await navigateTo({ path: playPath.value, query: { followUp: '1' } })
}

onMounted(async () => {
  const answer = pending.value
  if (answer?.mode === 'locked') {
    state.value = 'locked'
  }
  else if (answer?.audio) {
    await submit()
  }
  else if (result.value) {
    state.value = 'result'
  }
  else {
    // Nothing to show (e.g. a refresh after the audio was dropped): back to the card.
    await navigateTo(playPath.value, { replace: true })
  }
})
</script>

<style scoped>
.feedback {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--space-5);
}

.feedback-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
</style>
