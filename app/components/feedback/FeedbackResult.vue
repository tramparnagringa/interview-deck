<template>
  <article class="feedback-result">
    <header class="feedback-result-heading">
      <p class="feedback-result-question">
        {{ question }}
      </p>
      <h1 class="feedback-result-summary">
        {{ feedback.summary }}
      </h1>
    </header>
    <FeedbackScores :scores="feedback.scores" />
    <FeedbackTip
      :tip="feedback.tip"
      :quote="feedback.quote"
      :highlights="feedback.quote_highlights"
    />
    <FeedbackFollowUp
      v-if="showFollowUp"
      :question="feedback.follow_up"
    />
  </article>
</template>

<script setup lang="ts">
import type { AiFeedback } from '#shared/schemas/feedback'

/** Screen 06. The follow-up is Premium. */
defineProps<{
  question: string
  feedback: AiFeedback
  showFollowUp: boolean
}>()
</script>

<style scoped>
.feedback-result {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.feedback-result-heading {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-bottom: var(--space-2);
}

.feedback-result-question {
  overflow: hidden;
  margin: 0;
  color: var(--color-ink-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feedback-result-summary {
  margin: 0;
  font-size: var(--text-title);
  font-weight: var(--font-weight-semibold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}
</style>
